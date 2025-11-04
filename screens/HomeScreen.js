import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, TouchableOpacity, Switch, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { MicButton } from '../components/MicButton';
import { PlayButton } from '../components/PlayButton';
import { TextDisplay } from '../components/TextDisplay';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { AvatarSelector } from '../components/AvatarSelector';
import { VoiceDock } from '../components/VoiceDock'; // ⭐ NEW: Quick voice dictation panel
import { transcribeAudio } from '../services/deepgramService';
import { speakText } from '../services/ttsService';
import { getLiveTranscriber } from '../services/deepgramLiveService';
import { textToAvatar, speechToAvatar } from '../services/avatarTTSService';
import { AVATAR_CONFIG } from '../config/avatarConfig';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
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
  
  // ⭐ NEW: VoiceDock state (NON-DESTRUCTIVE addition)
  const [showVoiceDock, setShowVoiceDock] = useState(false);
  const avatarDisplayRef = useRef(null);

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
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
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
            
            // Transkribe et (otomatik dil algılama)
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
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
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
      
      // Deepgram ile transkribe et (otomatik dil algılama)
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
      // 🎥 Halihazırda bir avatar videosu varsa anında baştan oynat (cache'ten tekrar yükleme yok)
      if (avatarMode && avatarVideoUrl && avatarDisplayRef.current) {
        try {
          await avatarDisplayRef.current.replayFromStart();
        } catch (e) {
          console.warn('Avatar replay sırasında hata:', e?.message || e);
        }
      }
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

  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const IS_SMALL_SCREEN = SCREEN_WIDTH < 375;
  const IS_TABLET = SCREEN_WIDTH >= 768;

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.container,
        { paddingTop: Math.max(insets.top, IS_SMALL_SCREEN ? 12 : IS_TABLET ? 30 : 20) }
      ]}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.welcomeText}>Welcome to Echomind 👋</Text>
      </View>

      {/* İngilizce Öğren Butonu - Avatar modu aktifken gizlenir */}
      {!avatarMode && (
        <TouchableOpacity
          style={styles.learningButton}
          onPress={() => navigation.navigate('EnglishLearning')}
        >
          <Text style={styles.learningButtonText}>🇬🇧 İngilizce Öğren</Text>
          <Text style={styles.learningButtonSubtext}>Avatar ile İngilizce telaffuz öğrenin</Text>
        </TouchableOpacity>
      )}
      
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
            ref={avatarDisplayRef}
            videoUrl={avatarVideoUrl}
            avatarImageUrl={
              selectedAvatar.offline 
                ? selectedAvatar.baseImage  // Offline: require()
                : null  // Online (HeyGen): Video varsa görüntülenecek
            }
            isLoading={isAvatarLoading}
            muteDuringRecording={isRecording}
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

      {/* Quick Voice Dock button removed as requested */}

      {/* Avatar Selector Modal */}
      <AvatarSelector
        visible={showAvatarSelector}
        selectedAvatar={selectedAvatar}
        onSelect={setSelectedAvatar}
        onClose={() => setShowAvatarSelector(false)}
      />

      {/* ⭐ NEW: Voice Dock Modal (NON-DESTRUCTIVE addition) */}
      <VoiceDock
        visible={showVoiceDock}
        onClose={() => setShowVoiceDock(false)}
        selectedAvatar={selectedAvatar}
      />
    </ScrollView>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL_SCREEN = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH >= 768;
const IS_LARGE_SCREEN = SCREEN_WIDTH >= 414;

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    // paddingTop will be set dynamically based on safe area insets
    paddingBottom: IS_SMALL_SCREEN ? 12 : IS_TABLET ? 30 : 20,
    paddingHorizontal: IS_SMALL_SCREEN ? 15 : IS_TABLET ? 40 : 20,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    width: '100%',
    marginBottom: IS_SMALL_SCREEN ? 10 : 15,
    alignItems: 'center',
  },
  welcomeText: { 
    fontSize: IS_SMALL_SCREEN ? 22 : IS_TABLET ? 32 : 28, 
    fontWeight: 'bold', 
    color: '#333',
  },
  learningButton: {
    width: '100%',
    maxWidth: IS_TABLET ? 600 : '100%',
    alignSelf: 'center',
    backgroundColor: '#4A90E2',
    padding: IS_SMALL_SCREEN ? 15 : IS_TABLET ? 25 : 20,
    borderRadius: 15,
    marginBottom: IS_SMALL_SCREEN ? 12 : 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  learningButtonText: {
    fontSize: IS_SMALL_SCREEN ? 18 : IS_TABLET ? 24 : 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  learningButtonSubtext: {
    fontSize: IS_SMALL_SCREEN ? 12 : IS_TABLET ? 16 : 14,
    color: '#e3f2fd',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: IS_TABLET ? 600 : '100%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: IS_SMALL_SCREEN ? 12 : 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleLabel: {
    fontSize: IS_SMALL_SCREEN ? 14 : IS_TABLET ? 18 : 16,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: IS_SMALL_SCREEN ? 11 : IS_TABLET ? 14 : 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: IS_SMALL_SCREEN ? 12 : 15,
    fontStyle: 'italic',
    paddingHorizontal: IS_SMALL_SCREEN ? 8 : 10,
  },
  label: {
    fontSize: IS_SMALL_SCREEN ? 13 : IS_TABLET ? 16 : 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    textAlign: 'left',
  },
  displayContainer: {
    width: '100%',
    maxWidth: IS_TABLET ? 600 : '100%',
    alignSelf: 'center',
    marginBottom: IS_SMALL_SCREEN ? 12 : 15,
  },
  inputContainer: {
    width: '100%',
    maxWidth: IS_TABLET ? 600 : '100%',
    alignSelf: 'center',
    marginBottom: IS_SMALL_SCREEN ? 15 : 20,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: IS_SMALL_SCREEN ? 12 : 15,
    minHeight: IS_SMALL_SCREEN ? 100 : IS_TABLET ? 150 : 120,
    fontSize: IS_SMALL_SCREEN ? 15 : IS_TABLET ? 18 : 16,
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
    maxWidth: IS_TABLET ? 500 : '100%',
    alignSelf: 'center',
    marginTop: 10,
    paddingHorizontal: IS_SMALL_SCREEN ? 10 : 0,
  },
  buttonWrapper: {
    alignItems: 'center',
    flex: 1,
    maxWidth: IS_TABLET ? 200 : 'none',
  },
  buttonLabel: {
    fontSize: IS_SMALL_SCREEN ? 11 : IS_TABLET ? 14 : 12,
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
    maxWidth: IS_TABLET ? 600 : '100%',
    alignSelf: 'center',
    marginBottom: IS_SMALL_SCREEN ? 15 : 20,
    backgroundColor: '#fff',
    padding: IS_SMALL_SCREEN ? 12 : IS_TABLET ? 20 : 15,
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
    marginBottom: IS_SMALL_SCREEN ? 12 : 15,
    flexWrap: IS_SMALL_SCREEN ? 'wrap' : 'nowrap',
    gap: IS_SMALL_SCREEN ? 8 : 0,
  },
  sectionTitle: {
    fontSize: IS_SMALL_SCREEN ? 14 : IS_TABLET ? 18 : 16,
    fontWeight: '600',
    color: '#333',
    flex: IS_SMALL_SCREEN ? 1 : 0,
  },
  changeAvatarButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: IS_SMALL_SCREEN ? 12 : 15,
    paddingVertical: IS_SMALL_SCREEN ? 5 : 6,
    borderRadius: 15,
  },
  changeAvatarText: {
    color: '#fff',
    fontSize: IS_SMALL_SCREEN ? 11 : IS_TABLET ? 14 : 12,
    fontWeight: '600',
  },
  avatarDisplay: {
    marginBottom: IS_SMALL_SCREEN ? 8 : 10,
    width: '100%',
    maxWidth: IS_TABLET ? 500 : '100%',
    alignSelf: 'center',
  },
  avatarName: {
    fontSize: IS_SMALL_SCREEN ? 13 : IS_TABLET ? 16 : 14,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  // ⭐ NEW: Voice Dock Button Styles (NON-DESTRUCTIVE addition)
  voiceDockButton: {
    backgroundColor: '#7C4DFF',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  voiceDockButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  voiceDockButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  voiceDockButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
});
