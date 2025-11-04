import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

/**
 * AvatarDisplay Component
 * Konuşan avatar videosunu gösterir
 * 
 * Props:
 * - videoUrl: string - Avatar video URL'i
 * - avatarImageUrl: string - Avatar statik görseli (video yüklenirken)
 * - isLoading: boolean - Video hazırlanıyor mu?
 * - onPlaybackFinish: function - Video bittiğinde callback
 */
export const AvatarDisplay = forwardRef(({
  videoUrl,
  avatarImageUrl,
  isLoading = false,
  onPlaybackFinish,
  style,
  isLooping = false,
  volume = 1.0,
  shouldPause = false,
  muteDuringRecording = false,
}, ref) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [error, setError] = useState(null);
  const currentVideoUrlRef = useRef(null); // Video URL'ini ref ile takip et

  // Video URL değiştiğinde sadece loadAsync ile güncelle, unmount etme
  useEffect(() => {
    if (videoUrl && !isLoading) {
      if (!currentVideoUrlRef.current) {
        // İlk yükleme - ref'i set et
        currentVideoUrlRef.current = videoUrl;
        setShowVideo(true);
        // İlk yüklemede Video component'i mount olacak ve source'u otomatik yükleyecek
      } else if (videoUrl !== currentVideoUrlRef.current) {
        // Farklı URL - loadAsync ile güncelle (remount yok)
        currentVideoUrlRef.current = videoUrl;
        setShowVideo(true);
        loadAndPlayVideo(videoUrl);
      } else {
        // Aynı URL ise sadece oynat
        setShowVideo(true);
        playVideo();
      }
    }
  }, [videoUrl, isLoading]);

  const loadAndPlayVideo = async (url) => {
    try {
      if (videoRef.current) {
        // Video zaten mount - sadece source'u güncelle
        await videoRef.current.loadAsync({ uri: url });
        await videoRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Video load/playback error:', err);
      setError('Video yüklenemedi');
    }
  };

  const playVideo = async () => {
    try {
      if (videoRef.current) {
        await videoRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Video playback error:', err);
      setError('Video oynatılamadı');
    }
  };
  // Kayıt sırasında sesi kapatıp videoyu görsel olarak oynatmaya devam et
  useEffect(() => {
    const applyMute = async () => {
      try {
        if (videoRef.current) {
          await videoRef.current.setIsMutedAsync(!!muteDuringRecording);
        }
      } catch (err) {
        console.warn('Mute toggle error:', err?.message || err);
      }
    };
    applyMute();
  }, [muteDuringRecording]);

  // Dışarıdan kontrol için metodlar
  useImperativeHandle(ref, () => ({
    async replayFromStart() {
      try {
        if (videoRef.current && currentVideoUrlRef.current) {
          // Video zaten mount - sadece başa sar ve oynat
          setShowVideo(true);
          await videoRef.current.setPositionAsync(0);
          await videoRef.current.playAsync();
          setIsPlaying(true);
          console.log('✅ Video baştan oynatıldı (remount yok)');
        }
      } catch (err) {
        console.warn('Replay error:', err?.message || err);
      }
    },
    async pause() {
      try {
        if (videoRef.current) {
          await videoRef.current.pauseAsync();
          setIsPlaying(false);
        }
      } catch (err) {
        console.warn('Pause error:', err?.message || err);
      }
    },
  }));

  // Dışarıdan pause kontrolü (son frame'de kalır)
  useEffect(() => {
    const pauseIfNeeded = async () => {
      try {
        if (shouldPause && videoRef.current) {
          await videoRef.current.pauseAsync();
          setIsPlaying(false);
        }
      } catch (err) {
        console.warn('Video pause error:', err?.message || err);
      }
    };
    pauseIfNeeded();
  }, [shouldPause]);

  const handlePlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
      // ✅ Video bitince son frame'de kal (gizleme!)
      // setShowVideo(false); // KALDIRILDI
      // onPlaybackFinish callback'i de çağrılmıyor (video kalıcı olacak)
      console.log('✅ Video playback finished (staying visible on last frame)');
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Image
            source={{ uri: avatarImageUrl }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Avatar hazırlanıyor...</Text>
            <Text style={styles.loadingSubtext}>Bu 30-60 saniye sürebilir</Text>
          </View>
        </View>
      )}

      {/* Video Player - Her zaman mount tut, sadece opacity ile gizle */}
      {!isLoading && (videoUrl || currentVideoUrlRef.current) && (
        <View style={[styles.videoContainer, !showVideo && styles.hidden]}>
          {/* Video component'ini her zaman render et, unmount etme - key ile sabitle */}
          <Video
            key="avatar-video-player" // Sabit key - remount engelle
            ref={videoRef}
            source={{ uri: currentVideoUrlRef.current || videoUrl }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay={showVideo}
            isLooping={isLooping}
            volume={volume}
            isMuted={!!muteDuringRecording}
            usePoster={!!avatarImageUrl}
            posterSource={avatarImageUrl ? (typeof avatarImageUrl === 'string' ? { uri: avatarImageUrl } : avatarImageUrl) : undefined}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onError={(err) => {
              console.error('❌ Video error:', err);
              console.error('Video URL:', currentVideoUrlRef.current || videoUrl);
              setError('Video yüklenemedi: ' + (err.message || 'Bilinmeyen hata'));
            }}
          />
        </View>
      )}

      {/* Static Avatar (idle state) */}
      {!isLoading && !showVideo && avatarImageUrl && (
        <View style={styles.idleContainer}>
          <Image
            source={
              typeof avatarImageUrl === 'string'
                ? { uri: avatarImageUrl }  // URL string
                : avatarImageUrl  // require() object
            }
            style={styles.avatarImage}
            resizeMode="cover"
          />
          <View style={styles.idleBadge}>
            <Text style={styles.idleBadgeText}>💤 Bekleniyor</Text>
          </View>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              if (videoUrl) playVideo();
            }}
          >
            <Text style={styles.retryButtonText}>🔄 Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Playing Indicator */}
      {isPlaying && (
        <View style={styles.playingIndicator}>
          <View style={styles.soundWave}>
            <View style={[styles.soundBar, styles.soundBar1]} />
            <View style={[styles.soundBar, styles.soundBar2]} />
            <View style={[styles.soundBar, styles.soundBar3]} />
          </View>
          <Text style={styles.playingText}>🔊 Konuşuyor...</Text>
        </View>
      )}
    </View>
  );
});

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_SMALL_SCREEN = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH >= 768;
const AVATAR_MAX_WIDTH = IS_TABLET ? 500 : IS_SMALL_SCREEN ? '100%' : '100%';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: AVATAR_MAX_WIDTH,
    aspectRatio: IS_TABLET ? 1.78 : 1, // Tablet'te 16:9 (1.78), telefon'da kare (1)
    borderRadius: IS_SMALL_SCREEN ? 15 : 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    alignSelf: 'center',
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: IS_SMALL_SCREEN ? 14 : IS_TABLET ? 18 : 16,
    fontWeight: '600',
    marginTop: 15,
  },
  loadingSubtext: {
    color: '#ccc',
    fontSize: IS_SMALL_SCREEN ? 11 : IS_TABLET ? 14 : 12,
    marginTop: 5,
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  hidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  replayButton: {
    position: 'absolute',
    bottom: IS_SMALL_SCREEN ? 15 : 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.95)',
    paddingHorizontal: IS_SMALL_SCREEN ? 16 : 20,
    paddingVertical: IS_SMALL_SCREEN ? 10 : 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  replayButtonText: {
    color: '#fff',
    fontSize: IS_SMALL_SCREEN ? 12 : IS_TABLET ? 16 : 14,
    fontWeight: '700',
  },
  webViewContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: IS_SMALL_SCREEN ? 15 : 20,
  },
  errorText: {
    color: '#fff',
    fontSize: IS_SMALL_SCREEN ? 14 : IS_TABLET ? 18 : 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: IS_SMALL_SCREEN ? 8 : 10,
  },
  errorSubtext: {
    color: '#ccc',
    fontSize: IS_SMALL_SCREEN ? 11 : IS_TABLET ? 14 : 12,
    textAlign: 'center',
    marginTop: IS_SMALL_SCREEN ? 5 : 8,
  },
  idleContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  idleBadge: {
    position: 'absolute',
    bottom: IS_SMALL_SCREEN ? 10 : 15,
    left: IS_SMALL_SCREEN ? 10 : 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: IS_SMALL_SCREEN ? 10 : 12,
    paddingVertical: IS_SMALL_SCREEN ? 5 : 6,
    borderRadius: 20,
  },
  idleBadgeText: {
    color: '#fff',
    fontSize: IS_SMALL_SCREEN ? 10 : IS_TABLET ? 14 : 12,
    fontWeight: '600',
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  playingIndicator: {
    position: 'absolute',
    top: IS_SMALL_SCREEN ? 10 : 15,
    right: IS_SMALL_SCREEN ? 10 : 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: IS_SMALL_SCREEN ? 10 : 12,
    paddingVertical: IS_SMALL_SCREEN ? 5 : 6,
    borderRadius: 20,
  },
  soundWave: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    height: 20,
  },
  soundBar: {
    width: 3,
    backgroundColor: '#4CAF50',
    marginHorizontal: 1,
    borderRadius: 2,
  },
  soundBar1: {
    height: 12,
    animation: 'wave 0.5s infinite',
  },
  soundBar2: {
    height: 18,
    animation: 'wave 0.5s 0.1s infinite',
  },
  soundBar3: {
    height: 10,
    animation: 'wave 0.5s 0.2s infinite',
  },
  playingText: {
    color: '#fff',
    fontSize: IS_SMALL_SCREEN ? 10 : IS_TABLET ? 14 : 12,
    fontWeight: '600',
  },
});

export default React.memo(AvatarDisplay);

