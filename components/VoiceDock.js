import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
  Clipboard,
} from 'react-native';
import { Audio } from 'expo-av';
import { connectDeepgramWebSocket, disconnectDeepgramWebSocket } from '../services/deepgramWebSocket';
import { textToAvatar } from '../services/avatarTTSService';
import { AVATAR_CONFIG } from '../config/avatarConfig';

const { height } = Dimensions.get('window');

/**
 * VoiceDock - Slide-up panel for real-time voice dictation
 * NON-DESTRUCTIVE: Isolated modal, doesn't affect existing screens
 */
export function VoiceDock({ visible, onClose, selectedAvatar }) {
  // States
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState(''); // Live interim captions
  const [finalText, setFinalText] = useState(''); // Final transcript
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [useStreaming, setUseStreaming] = useState(false); // REST vs Streaming toggle
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState(null);

  // Refs
  const recording = useRef(null);
  const wsConnection = useRef(null);
  const slideAnim = useRef(new Animated.Value(height)).current;

  // Slide animation
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, []);

  /**
   * Start Recording + WebSocket Connection
   */
  const startRecording = async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      setInterimText('');
      setFinalText('');

      // Request permission
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Mikrofon erişimi için izin vermeniz gerekiyor.');
        setIsConnecting(false);
        return;
      }

      // Setup audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Connect to Deepgram WebSocket
      wsConnection.current = await connectDeepgramWebSocket({
        language: 'tr',
        interimResults: true,
        onInterimTranscript: (text) => {
          setInterimText(text);
        },
        onFinalTranscript: (text) => {
          setFinalText((prev) => prev + ' ' + text);
          setInterimText(''); // Clear interim after final
        },
        onError: (error) => {
          console.error('WebSocket error:', error);
          Alert.alert('Bağlantı Hatası', error.message);
          stopRecording();
        },
      });

      setConnectionStatus('connected');

      // Start audio recording
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          // Stream audio chunks to WebSocket
          if (status.isRecording && wsConnection.current) {
            // This is a simplified version - in production, you'd need to
            // extract raw audio data and send it to the WebSocket
            // For now, we'll use the chunk-based approach from deepgramWebSocket.js
          }
        },
        100 // Update interval in ms
      );

      recording.current = rec;
      setIsRecording(true);
      setIsConnecting(false);

      // Start streaming loop (handled in deepgramWebSocket.js)
      if (wsConnection.current && wsConnection.current.startStreaming) {
        wsConnection.current.startStreaming(rec);
      }

    } catch (error) {
      console.error('Recording start error:', error);
      Alert.alert('Hata', 'Kayıt başlatılamadı: ' + error.message);
      setIsConnecting(false);
      setConnectionStatus('error');
    }
  };

  /**
   * Stop Recording + Close WebSocket
   */
  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setConnectionStatus('disconnected');

      // Stop recording
      if (recording.current) {
        await recording.current.stopAndUnloadAsync();
        recording.current = null;
      }

      // Disconnect WebSocket
      if (wsConnection.current) {
        disconnectDeepgramWebSocket(wsConnection.current);
        wsConnection.current = null;
      }

      // Move interim to final if exists
      if (interimText) {
        setFinalText((prev) => prev + ' ' + interimText);
        setInterimText('');
      }

    } catch (error) {
      console.error('Recording stop error:', error);
    }
  };

  /**
   * Speak with Avatar
   */
  const handleSpeakWithAvatar = async () => {
    const textToSpeak = finalText.trim();
    
    if (!textToSpeak) {
      Alert.alert('Uyarı', 'Lütfen önce bir metin kaydedin.');
      return;
    }

    try {
      setIsSpeaking(true);

      // Use the avatar from props or default
      const avatar = selectedAvatar || AVATAR_CONFIG.avatars.defaultAvatar;
      const avatarImageUrl = avatar.imageUrl || avatar.baseImage;

      if (useStreaming) {
        // TODO: Implement D-ID Streaming (WebRTC)
        Alert.alert(
          'Geliştirme Aşamasında',
          'Streaming modu henüz React Native için implement edilmedi. REST modu kullanılacak.'
        );
        // Fallback to REST
      }

      // REST mode (existing implementation)
      const result = await textToAvatar(textToSpeak, avatarImageUrl);
      
      if (result.success) {
        setAvatarVideoUrl(result.videoUrl);
        Alert.alert('✅ Hazır', 'Avatar videonuz hazır!');
      } else {
        Alert.alert('Hata', 'Avatar videosu oluşturulamadı.');
      }

    } catch (error) {
      console.error('Avatar speak error:', error);
      Alert.alert('Hata', 'Avatar konuşturulurken hata oluştu: ' + error.message);
    } finally {
      setIsSpeaking(false);
    }
  };

  /**
   * Copy transcript to clipboard
   */
  const handleCopy = () => {
    const textToCopy = finalText.trim();
    if (textToCopy) {
      Clipboard.setString(textToCopy);
      Alert.alert('✅ Kopyalandı', 'Metin panoya kopyalandı.');
    }
  };

  /**
   * Clear all text
   */
  const handleClear = () => {
    setInterimText('');
    setFinalText('');
    setAvatarVideoUrl(null);
  };

  /**
   * Status indicator color
   */
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FFC107';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  /**
   * Status text
   */
  const getStatusText = () => {
    if (isConnecting) return 'Bağlanıyor...';
    if (isRecording) return '🔴 Kaydediyor';
    return connectionStatus === 'connected' ? 'Bağlı' : 'Bağlantı Kesildi';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.dockContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.handle} />
            <View style={styles.headerContent}>
              <Text style={styles.title}>🎤 Sesli Dikte</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Status Indicator */}
            <View style={styles.statusBar}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          </View>

          <ScrollView style={styles.content}>
            {/* Interim Captions (Live) */}
            {interimText ? (
              <View style={styles.interimBox}>
                <Text style={styles.interimLabel}>Canlı:</Text>
                <Text style={styles.interimText}>{interimText}</Text>
              </View>
            ) : null}

            {/* Final Transcript */}
            {finalText ? (
              <View style={styles.transcriptBox}>
                <Text style={styles.transcriptLabel}>Transkripsiyon:</Text>
                <Text style={styles.transcriptText}>{finalText}</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {isRecording 
                    ? 'Konuşmaya başlayın...' 
                    : 'Kayda başlamak için butona basın'}
                </Text>
              </View>
            )}

            {/* Avatar Video Preview */}
            {avatarVideoUrl && (
              <View style={styles.videoPreview}>
                <Text style={styles.videoLabel}>✅ Avatar Videosu Hazır</Text>
                <Text style={styles.videoUrl} numberOfLines={1}>
                  {avatarVideoUrl}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Controls */}
          <View style={styles.controls}>
            {/* Record Button */}
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive,
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isConnecting}
            >
              <Text style={styles.recordButtonText}>
                {isConnecting ? '⏳' : isRecording ? '⏹️ Durdur' : '🎤 Başlat'}
              </Text>
            </TouchableOpacity>

            {/* Action Buttons Row */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCopy}
                disabled={!finalText.trim()}
              >
                <Text style={styles.actionButtonText}>📋 Kopyala</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleClear}
                disabled={!finalText.trim() && !interimText}
              >
                <Text style={styles.actionButtonText}>🗑️ Temizle</Text>
              </TouchableOpacity>
            </View>

            {/* Avatar Speak Button */}
            <TouchableOpacity
              style={[
                styles.avatarButton,
                isSpeaking && styles.avatarButtonActive,
              ]}
              onPress={handleSpeakWithAvatar}
              disabled={!finalText.trim() || isSpeaking}
            >
              <Text style={styles.avatarButtonText}>
                {isSpeaking ? '⏳ Avatar Hazırlanıyor...' : '🎭 Avatar Konuşsun'}
              </Text>
            </TouchableOpacity>

            {/* Mode Toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Mod:</Text>
              <TouchableOpacity
                style={[styles.toggleButton, !useStreaming && styles.toggleButtonActive]}
                onPress={() => setUseStreaming(false)}
              >
                <Text style={[styles.toggleText, !useStreaming && styles.toggleTextActive]}>
                  REST
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, useStreaming && styles.toggleButtonActive]}
                onPress={() => setUseStreaming(true)}
              >
                <Text style={[styles.toggleText, useStreaming && styles.toggleTextActive]}>
                  Streaming
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  dockContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#BDBDBD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#757575',
    fontWeight: '300',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  interimBox: {
    backgroundColor: '#FFF9C4',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  interimLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57F17',
    marginBottom: 5,
  },
  interimText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
  },
  transcriptBox: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  transcriptText: {
    fontSize: 16,
    color: '#212121',
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  videoPreview: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  videoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 5,
  },
  videoUrl: {
    fontSize: 12,
    color: '#666',
  },
  controls: {
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  recordButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  recordButtonActive: {
    backgroundColor: '#F44336',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#424242',
    fontSize: 14,
    fontWeight: '600',
  },
  avatarButton: {
    backgroundColor: '#9C27B0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarButtonActive: {
    backgroundColor: '#7B1FA2',
  },
  avatarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: 12,
    color: '#757575',
    marginRight: 10,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 5,
  },
  toggleButtonActive: {
    backgroundColor: '#4A90E2',
  },
  toggleText: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
  },
});

