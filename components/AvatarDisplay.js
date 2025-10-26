import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
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
export const AvatarDisplay = ({
  videoUrl,
  avatarImageUrl,
  isLoading = false,
  onPlaybackFinish,
  style,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [hasFinished, setHasFinished] = useState(false); // Video bitti mi?
  const [error, setError] = useState(null);

  useEffect(() => {
    if (videoUrl && !isLoading) {
      setShowVideo(true);
      setHasFinished(false); // Yeni video geldiğinde reset
      playVideo();
    }
  }, [videoUrl, isLoading]);

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

  const handlePlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
      setHasFinished(true);
      // ✅ Video bitince son frame'de kal (gizleme!)
      // setShowVideo(false); // KALDIRILDI
      // onPlaybackFinish callback'i de çağrılmıyor (video kalıcı olacak)
      console.log('✅ Video playback finished (staying visible on last frame)');
    }
  };

  const handleReplay = async () => {
    try {
      setHasFinished(false);
      if (videoRef.current) {
        await videoRef.current.replayAsync();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Video replay error:', err);
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
            <Text style={styles.loadingSubtext}>Bu 10-30 saniye sürebilir</Text>
          </View>
        </View>
      )}

      {/* Video Player */}
      {!isLoading && showVideo && videoUrl && (
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay={true}
            isLooping={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onError={(err) => {
              console.error('Video error:', err);
              setError('Video yüklenemedi');
            }}
          />
          
          {/* Replay Button (video bittiğinde göster) */}
          {hasFinished && (
            <TouchableOpacity style={styles.replayButton} onPress={handleReplay}>
              <Text style={styles.replayButtonText}>🔄 Tekrar İzle</Text>
            </TouchableOpacity>
          )}
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
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1, // Kare format
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
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
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
  },
  loadingSubtext: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 5,
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  replayButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  replayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  idleContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  idleBadge: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  idleBadgeText: {
    color: '#fff',
    fontSize: 12,
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
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AvatarDisplay;

