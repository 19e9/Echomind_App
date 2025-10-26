import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Text } from 'react-native';
import { Audio } from 'expo-av';
import { syncTextToAudio, getCurrentMouthFrame } from '../services/offlineLipSyncService';

/**
 * Animated Avatar Component
 * Offline lip-sync ile konuşan avatar
 * 
 * Props:
 * - avatarImage: Avatar base resmi (require('./assets/...'))
 * - mouthImages: Mouth sprite dizisi [kapalı, hafif, orta, açık]
 * - audioUri: Ses dosyası URI
 * - text: Konuşulan metin (phoneme matching için)
 * - isPlaying: Oynatma durumu
 * - onFinish: Bittiğinde callback
 */
export const AnimatedAvatar = ({
  avatarImage,
  mouthImages = [],
  audioUri,
  text = '',
  isPlaying = false,
  onFinish,
  style,
}) => {
  const [mouthFrame, setMouthFrame] = useState(0); // 0: kapalı, 3: açık
  const [soundObject, setSoundObject] = useState(null);
  const [duration, setDuration] = useState(0);
  const animationInterval = useRef(null);

  // Mouth animation timeline (text + audio duration'dan hesaplanır)
  const [timeline, setTimeline] = useState([]);

  // Avatar görünür/gizli animasyonu
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Avatar fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => {
      // Cleanup
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }
      if (soundObject) {
        soundObject.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying && audioUri && text) {
      startLipSync();
    } else if (!isPlaying && soundObject) {
      stopLipSync();
    }
  }, [isPlaying, audioUri, text]);

  const startLipSync = async () => {
    try {
      console.log('🎬 Starting lip sync animation...');

      // 1. Ses yükle
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      setSoundObject(sound);
      const audioDuration = status.durationMillis || 5000;
      setDuration(audioDuration);

      // 2. Text → Timeline (phoneme mapping)
      const animTimeline = syncTextToAudio(text, audioDuration);
      setTimeline(animTimeline);

      console.log(`📊 Animation: ${audioDuration}ms, ${animTimeline.length} frames`);

      // 3. Real-time animation loop
      let startTime = Date.now();
      animationInterval.current = setInterval(async () => {
        const elapsed = Date.now() - startTime;

        if (elapsed >= audioDuration) {
          // Bitti
          clearInterval(animationInterval.current);
          setMouthFrame(0); // Ağzı kapat
          
          if (onFinish) onFinish();
          console.log('✅ Lip sync complete');
          return;
        }

        // Mevcut mouth frame'i hesapla
        const frame = getCurrentMouthFrame(elapsed, animTimeline);
        setMouthFrame(frame);
      }, 100); // 10 FPS (yeterli ve performanslı)

      // Sound bittiğinde
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          clearInterval(animationInterval.current);
          setMouthFrame(0);
          if (onFinish) onFinish();
        }
      });

    } catch (error) {
      console.error('❌ Lip sync error:', error);
      setMouthFrame(0);
    }
  };

  const stopLipSync = async () => {
    try {
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }
      if (soundObject) {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
        setSoundObject(null);
      }
      setMouthFrame(0);
    } catch (error) {
      console.error('❌ Stop error:', error);
    }
  };

  // Mouth sprite seçimi
  const currentMouth = mouthImages[mouthFrame] || mouthImages[0];

  return (
    <Animated.View style={[styles.container, style, { opacity: fadeAnim }]}>
      {/* Base Avatar Image */}
      <Image
        source={avatarImage}
        style={styles.avatarImage}
        resizeMode="cover"
      />

      {/* Mouth Overlay (sprite animation) */}
      {currentMouth && (
        <Image
          source={currentMouth}
          style={styles.mouthOverlay}
          resizeMode="contain"
        />
      )}

      {/* Playing Indicator */}
      {isPlaying && (
        <View style={styles.playingBadge}>
          <View style={styles.soundWave}>
            <Animated.View style={[styles.soundBar, { height: mouthFrame * 5 + 5 }]} />
            <Animated.View style={[styles.soundBar, { height: mouthFrame * 6 + 8 }]} />
            <Animated.View style={[styles.soundBar, { height: mouthFrame * 4 + 6 }]} />
          </View>
          <Text style={styles.playingText}>Konuşuyor...</Text>
        </View>
      )}

      {/* Debug Info (geliştirme için) */}
      {__DEV__ && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>Frame: {mouthFrame}</Text>
          <Text style={styles.debugText}>
            {isPlaying ? '▶️ Playing' : '⏸️ Paused'}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  mouthOverlay: {
    position: 'absolute',
    bottom: '25%', // Ağız pozisyonu (avatar'a göre ayarla)
    width: '30%',
    height: '15%',
  },
  playingBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  soundWave: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 8,
    height: 20,
    gap: 2,
  },
  soundBar: {
    width: 3,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  playingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  debugInfo: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 8,
  },
  debugText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});

export default AnimatedAvatar;

