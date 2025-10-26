import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, TouchableOpacity, Switch } from 'react-native';
import { Audio } from 'expo-av';
import { MicButton } from '../components/MicButton';
import { PlayButton } from '../components/PlayButton';
import { TextDisplay } from '../components/TextDisplay';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { AvatarSelector } from '../components/AvatarSelector';
import { transcribeAudio } from '../services/deepgramService';
import { speakText } from '../services/ttsService';
import { getLiveTranscriber } from '../services/deepgramLiveService';
import { textToAvatar, speechToAvatar } from '../services/avatarTTSService';
import { AVATAR_CONFIG } from '../config/avatarConfig';

export default function HomeScreen({ navigation }) {
  const [transcribedText, setTranscribedText] = useState(''); // Transkripsiyon sonucu
  const [customText, setCustomText] = useState(''); // Kullanıcının yazdığı metin
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  
  // Real-time mod
  const [isLiveMode, setIsLiveMode] = useState(true); // Varsayılan: Canlı mod
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const liveTranscriber = useRef(null);
  const recordingInterval = useRef(null);

  // Avatar states
  const [avatarMode, setAvatarMode] = useState(false); // Avatar modu aktif mi?
  const [selectedAvatar, setSelectedAvatar] = useState(
    AVATAR_CONFIG.mode === 'online' 
      ? AVATAR_CONFIG.avatars.defaultAvatar // HeyGen online avatar
      : AVATAR_CONFIG.avatars.offlineAvatars[0] // Offline avatar (İrem)
  );
  const [avatarVideoUrl, setAvatarVideoUrl] = useState(null);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Ses kayıt izinlerini ayarla
  useEffect(() => {
    async function setupAudio() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (error) {
        console.error('Audio setup error:', error);
      }
    }
    setupAudio();
  }, []);

  // Canlı transkripsiyon başlat (her 2 saniyede bir parça gönder)
  const startLiveTranscription = async () => {
    try {
      setIsRecording(true);
      setTranscribedText('🔴 Canlı transkripsiyon başlatılıyor...');

      // İzin kontrolü
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // İlk kayıt başlat
      await startNextRecordingChunk();

    } catch (error) {
      console.error('Canlı transkripsiyon başlatma hatası:', error);
      Alert.alert('Hata', 'Canlı transkripsiyon başlatılamadı: ' + error.message);
      setIsRecording(false);
    }
  };

  // Bir sonraki ses parçasını kaydet ve gönder
  const startNextRecordingChunk = async () => {
    try {
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);

      // 2 saniye sonra durdur ve transkribe et
      recordingInterval.current = setTimeout(async () => {
        try {
          // Recording durumunu kontrol et
          const status = await newRecording.getStatusAsync();
          
          if (status.isRecording) {
            await newRecording.stopAndUnloadAsync();
            const uri = newRecording.getURI();
            
            // Transkribe et
            const text = await transcribeAudio(uri);
            
            if (text && text !== 'Ses algılanamadı veya transkribe edilemedi') {
              // Mevcut metne ekle
              setTranscribedText(prev => {
                const current = prev === '🔴 Canlı transkripsiyon başlatılıyor...' ? '' : prev;
                return (current + ' ' + text).trim();
              });
            }

            // Eğer hala kayıt modundaysa, bir sonraki parçayı başlat
            if (isRecording) {
              await startNextRecordingChunk();
            }
          }
        } catch (err) {
          console.error('Chunk transkripsiyon hatası:', err);
          // Hata olsa bile devam et
          if (isRecording) {
            setTimeout(() => startNextRecordingChunk(), 500);
          }
        }
      }, 2000); // 2 saniye

    } catch (error) {
      console.error('Chunk kayıt hatası:', error);
    }
  };

  // Canlı transkripsiyon durdur
  const stopLiveTranscription = async () => {
    try {
      setIsRecording(false);
      
      // Timeout'u temizle
      if (recordingInterval.current) {
        clearTimeout(recordingInterval.current);
        recordingInterval.current = null;
      }

      // Aktif kaydı durdur - sadece hala kayıt yapıyorsa
      if (recording) {
        try {
          const status = await recording.getStatusAsync();
          if (status.isRecording || status.canRecord) {
            await recording.stopAndUnloadAsync();
          }
        } catch (err) {
          console.log('Recording zaten durdurulmuş:', err.message);
        }
        setRecording(null);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      console.log('✅ Canlı transkripsiyon durduruldu');
    } catch (error) {
      console.error('Canlı transkripsiyon durdurma hatası:', error);
    }
  };

  // Normal kayıt (eski usul)
  const startNormalRecording = async () => {
    try {
      // İzin kontrolü
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
      }

      console.log('Kayıt başlatılıyor...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      console.log('Kayıt başladı...');
    } catch (error) {
      console.error('Kayıt başlatma hatası:', error);
      Alert.alert('Hata', 'Ses kaydı başlatılamadı: ' + error.message);
    }
  };

  const stopNormalRecording = async () => {
    try {
      console.log('Kayıt durduruluyor...');
      setIsRecording(false);
      
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recording.getURI();
      console.log('Ses kaydedildi:', uri);
      
      // Deepgram ile transkribe et
      setTranscribedText('Transkribe ediliyor...');
      const text = await transcribeAudio(uri);
      setTranscribedText(text);
      console.log('Transkripsiyon tamamlandı:', text);
      
      setRecording(null);
    } catch (error) {
      console.error('Transkripsiyon hatası:', error);
      Alert.alert('Hata', 'Ses transkribe edilemedi: ' + error.message);
      setTranscribedText('Transkripsiyon başarısız oldu.');
      setRecording(null);
    }
  };

  const handleMicPress = async () => {
    if (!isRecording) {
      // Kayıt başlat
      if (isLiveMode) {
        await startLiveTranscription();
      } else {
        await startNormalRecording();
      }
    } else {
      // Kayıt durdur
      if (isLiveMode) {
        await stopLiveTranscription();
      } else {
        await stopNormalRecording();
      }
    }
  };

  const handlePlayPress = async () => {
    try {
      // Önce kullanıcının yazdığı metne bak, yoksa transkribe edilmiş metni çal
      const textToSpeak = customText.trim() !== '' ? customText : transcribedText;
      
      if (textToSpeak && textToSpeak.trim() !== '' && !textToSpeak.includes('🔴') && textToSpeak !== 'Transkribe ediliyor...') {
        
        // Avatar modu aktifse
        if (avatarMode) {
          setIsAvatarLoading(true);
          setAvatarVideoUrl(null);
          
          try {
            console.log('🎭 Creating avatar video with HeyGen...');
            console.log('👤 Selected avatar:', selectedAvatar.name);
            
            // Online avatar (HeyGen) veya offline avatar kontrolü
            if (selectedAvatar.online && selectedAvatar.avatarId) {
              // HeyGen API kullan
              const result = await textToAvatar(textToSpeak, selectedAvatar.avatarId);
              setAvatarVideoUrl(result.videoUrl);
              Alert.alert('✅ Başarılı', 'Avatar videonuz hazır!');
            } else if (selectedAvatar.offline) {
              // Offline avatar (şu an sadece static görüntü)
              Alert.alert('ℹ️ Bilgi', 'Offline avatarlar için lip-sync henüz eklenmedi. Online avatar seçin.');
            } else {
              throw new Error('Geçersiz avatar seçimi');
            }
          } catch (error) {
            console.error('Avatar creation error:', error);
            Alert.alert('Hata', 'Avatar videosu oluşturulamadı: ' + error.message);
          } finally {
            setIsAvatarLoading(false);
          }
        } else {
          // Normal TTS
          await speakText(textToSpeak);
        }
      } else {
        Alert.alert('Uyarı', 'Lütfen seslendirilecek metin yazın veya ses kaydı yapın');
      }
    } catch (error) {
      console.error('TTS hatası:', error);
      Alert.alert('Hata', 'Metin seslendirilmedi: ' + error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with Settings Button */}
      <View style={styles.headerContainer}>
        <Text style={styles.welcomeText}>Welcome to Echomind 👋</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>
      
      {/* Avatar Modu Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>
          {avatarMode ? '🎭 Avatar Modu' : '🔊 Ses Modu'}
        </Text>
        <Switch
          value={avatarMode}
          onValueChange={setAvatarMode}
          trackColor={{ false: '#767577', true: '#9C27B0' }}
          thumbColor={avatarMode ? '#fff' : '#f4f3f4'}
        />
      </View>

      {/* Avatar Display (Avatar modunda göster) */}
      {avatarMode && (
        <View style={styles.avatarSection}>
          <View style={styles.avatarHeader}>
            <Text style={styles.sectionTitle}>Seçili Avatar</Text>
            <TouchableOpacity
              style={styles.changeAvatarButton}
              onPress={() => setShowAvatarSelector(true)}
            >
              <Text style={styles.changeAvatarText}>🎨 Değiştir</Text>
            </TouchableOpacity>
          </View>
          
          <AvatarDisplay
            videoUrl={avatarVideoUrl}
            avatarImageUrl={
              selectedAvatar.offline 
                ? selectedAvatar.baseImage  // Offline: require()
                : null  // Online (HeyGen): Video varsa görüntülenecek
            }
            isLoading={isAvatarLoading}
            onPlaybackFinish={() => setAvatarVideoUrl(null)}
            style={styles.avatarDisplay}
          />
          
          <Text style={styles.avatarName}>
            {selectedAvatar.name} {selectedAvatar.gender === 'male' ? '👨' : '👩'}
          </Text>
        </View>
      )}
      
      {/* Canlı Mod Toggle (Ses modunda göster) */}
      {!avatarMode && (
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>
            {isLiveMode ? '🔴 Canlı Transkripsiyon' : '⏺️ Normal Kayıt'}
          </Text>
          <Switch
            value={isLiveMode}
            onValueChange={(value) => {
              if (!isRecording) {
                setIsLiveMode(value);
              } else {
                Alert.alert('Uyarı', 'Lütfen önce kaydı durdurun');
              }
            }}
            trackColor={{ false: '#767577', true: '#4CAF50' }}
            thumbColor={isLiveMode ? '#fff' : '#f4f3f4'}
          />
        </View>
      )}

      {/* Açıklama */}
      <Text style={styles.description}>
        {avatarMode 
          ? '🎭 Avatar modu: Metniniz avatar tarafından görüntülü konuşulacak' 
          : isLiveMode 
            ? '💡 Konuşurken metinler üst kutuya yazılacak (her 2 saniyede)' 
            : '💡 Kaydı bitirdiğinizde metin üst kutuda görünecek'}
      </Text>

      {/* Transkripsiyon Kutusu (Sadece transkripsiyon varsa görünür - Pasif) */}
      {transcribedText && transcribedText.trim() !== '' && !transcribedText.includes('🔴') && (
        <View style={styles.displayContainer}>
          <Text style={styles.label}>📝 Transkribe Edilen Metin (Sadece Okunur - Pasif):</Text>
          <TextDisplay text={transcribedText} />
        </View>
      )}

      {/* Yazma Kutusu (Her zaman görünür - Aktif) */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {isRecording ? '🎤 Kayıt Yapılıyor... (Yazma Kilidi)' : '✏️ Metin Yazın:'}
        </Text>
        <TextInput
          style={[
            styles.textInput,
            isRecording && styles.textInputDisabled
          ]}
          placeholder={isRecording ? "Kayıt yapılıyor, konuşun..." : "Seslendirilecek metni buraya yazın..."}
          placeholderTextColor={isRecording ? "#ccc" : "#999"}
          multiline
          value={customText}
          onChangeText={setCustomText}
          textAlignVertical="top"
          editable={!isRecording}
        />
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <MicButton 
            onPress={handleMicPress} 
            isRecording={isRecording}
          />
          <Text style={styles.buttonLabel}>
            {isRecording ? 'Durdur' : 'Kaydet'}
          </Text>
        </View>
        <View style={styles.buttonWrapper}>
          <PlayButton onPress={handlePlayPress} />
          <Text style={styles.buttonLabel}>Seslendir</Text>
        </View>
      </View>

      {isRecording && (
        <Text style={styles.recordingText}>🔴 Kaydediliyor...</Text>
      )}

      {/* Temizle butonu */}
      {(transcribedText || customText) && (
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={() => {
            setTranscribedText('');
            setCustomText('');
            setAvatarVideoUrl(null);
          }}
        >
          <Text style={styles.clearButtonText}>🗑️ Hepsini Temizle</Text>
        </TouchableOpacity>
      )}

      {/* Avatar Selector Modal */}
      <AvatarSelector
        visible={showAvatarSelector}
        selectedAvatar={selectedAvatar}
        onSelect={setSelectedAvatar}
        onClose={() => setShowAvatarSelector(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  welcomeText: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#333',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  settingsButtonText: {
    fontSize: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    textAlign: 'left',
  },
  displayContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    minHeight: 120,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textInputDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#E74C3C',
    borderWidth: 2,
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonWrapper: {
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontWeight: '500',
  },
  recordingText: {
    fontSize: 16,
    color: '#E74C3C',
    marginTop: 15,
    fontWeight: '600',
  },
  clearButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Avatar styles
  avatarSection: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  changeAvatarButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  changeAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  avatarDisplay: {
    marginBottom: 10,
  },
  avatarName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
});
