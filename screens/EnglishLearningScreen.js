import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { MicButton } from '../components/MicButton';
import { textToAvatar } from '../services/avatarTTSService';
import { transcribeAudio } from '../services/deepgramService';
import { AVATAR_CONFIG } from '../config/avatarConfig';
import { ENGLISH_LEVELS, LEVELS } from '../config/englishLearningConfig';
import { getCacheStats, getVideoFromCache, clearInvalidCache } from '../services/videoCacheService';

/**
 * EnglishLearningScreen
 * Avatar ile İngilizce telaffuz öğrenme ekranı
 * 
 * Özellikler:
 * - 6 seviye (A1, A2, B1, B2, C1, C2)
 * - Her seviye 10 cümle
 * - Avatar telaffuzu
 * - Kullanıcı telaffuz kaydı ve analizi
 * - Kelime bazlı değerlendirme (yeşil/kırmızı)
 * - Genel değerlendirme
 */
export default function EnglishLearningScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selectedLevel, setSelectedLevel] = useState(null); // null = seviye seçimi, 'A1' = seviye seçildi
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState(null);
  const [videoReplayKey, setVideoReplayKey] = useState(0); // Video tekrar oynatma için key
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [userTranscription, setUserTranscription] = useState('');
  const [wordAnalysis, setWordAnalysis] = useState([]); // {word, isCorrect, userWord}
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState(null); // Arka plan videosu (cache'den)
  const [pauseBackground, setPauseBackground] = useState(false); // Arka plan videoyu son karede dondur
  
  const selectedAvatar = AVATAR_CONFIG.avatars.defaultAvatar;

  // Uygulama açıldığında hatalı cache'leri temizle
  useEffect(() => {
    const cleanupInvalidCache = async () => {
      try {
        console.log('🧹 Hatali cache temizleniyor...');
        const result = await clearInvalidCache();
        if (result.deleted > 0) {
          console.log(`✅ ${result.deleted} hatali cache temizlendi`);
          Alert.alert(
            'Cache Temizlendi',
            `${result.deleted} hatali video cache silindi. Videolar tekrar olusturulacak.`,
            [{ text: 'Tamam' }]
          );
        }
      } catch (error) {
        console.error('❌ Cache temizleme hatasi:', error);
      }
    };
    
    // İlk yüklemede bir kez çalıştır
    cleanupInvalidCache();
  }, []);

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

  // Mevcut cümleyi al
  const getCurrentSentence = () => {
    if (!selectedLevel) return null;
    const level = ENGLISH_LEVELS[selectedLevel];
    return level.sentences[currentSentenceIndex];
  };

  // Cache'den arka plan videosu bul (mevcut cümle için veya ilk cümle için)
  useEffect(() => {
    const loadBackgroundVideo = async () => {
      if (!selectedLevel) {
        setBackgroundVideoUrl(null);
        return;
      }

      const sentence = getCurrentSentence();
      if (!sentence) {
        setBackgroundVideoUrl(null);
        return;
      }

      // Eğer zaten bu cümlenin videosu yüklüyse, arka plan videosu kullanma
      if (avatarVideoUrl) {
        setBackgroundVideoUrl(null);
        return;
      }

      try {
        // Mevcut cümlenin cache'den videosunu bul
        const cachedVideo = await getVideoFromCache(sentence.text, selectedAvatar.avatarId);
        if (cachedVideo && cachedVideo.videoUrl) {
          console.log('✅ Arka plan videosu bulundu (cache\'den)');
          setBackgroundVideoUrl(cachedVideo.videoUrl);
        } else {
          // Cache'de yoksa, A1 seviyesinin ilk cümlesini dene
          const firstLevel = LEVELS[0]; // A1
          const firstSentence = ENGLISH_LEVELS[firstLevel]?.sentences[0];
          if (firstSentence && firstSentence.text !== sentence.text) {
            const firstCachedVideo = await getVideoFromCache(firstSentence.text, selectedAvatar.avatarId);
            if (firstCachedVideo && firstCachedVideo.videoUrl) {
              console.log('✅ Arka plan videosu bulundu (A1 ilk cümle cache\'den)');
              setBackgroundVideoUrl(firstCachedVideo.videoUrl);
            } else {
              setBackgroundVideoUrl(null);
            }
          } else {
            setBackgroundVideoUrl(null);
          }
        }
      } catch (error) {
        console.error('❌ Arka plan videosu yükleme hatası:', error);
        setBackgroundVideoUrl(null);
      }
    };

    loadBackgroundVideo();
  }, [selectedLevel, currentSentenceIndex, avatarVideoUrl, selectedAvatar.avatarId]);

  // Avatar ile cümleyi telaffuz et
  const handlePlayAvatar = async () => {
    const sentence = getCurrentSentence();
    if (!sentence) return;

    if (!selectedAvatar.online || !selectedAvatar.avatarId) {
      Alert.alert('Uyarı', 'Avatar kullanılamıyor');
      return;
    }

    try {
      // Eğer video zaten varsa ve aynı cümle ise, sadece tekrar oynat
      const cachedVideo = await getVideoFromCache(sentence.text, selectedAvatar.avatarId);
      if (avatarVideoUrl && cachedVideo && avatarVideoUrl === cachedVideo.videoUrl) {
        // Video zaten yüklü ve aynı video, sadece tekrar oynat
        console.log('🔄 Video zaten yüklü, tekrar oynatılıyor...');
        setVideoReplayKey(prev => prev + 1); // Key'i değiştirerek videoyu reset et
        return;
      }

      // Video yoksa veya farklıysa, yeni video oluştur veya cache'den yükle
      setIsAvatarLoading(true);
      
      // Eğer farklı bir cümle ise, önceki video URL'ini temizle
      if (avatarVideoUrl && (!cachedVideo || avatarVideoUrl !== cachedVideo.videoUrl)) {
        setAvatarVideoUrl(null);
        await new Promise(resolve => setTimeout(resolve, 100)); // Kısa delay
      }
      
      setUserTranscription('');
      setWordAnalysis([]);

      const result = await textToAvatar(sentence.text, selectedAvatar.avatarId);
      
      // Video URL'i set et ve replay key'i artır
      setAvatarVideoUrl(result.videoUrl);
      setVideoReplayKey(prev => prev + 1);
      
      // Cache istatistiklerini log'la (debug için)
      if (result.cached) {
        console.log('✨ Video cache\'den yüklendi - hızlı!');
      } else {
        console.log('🔄 Yeni video oluşturuldu ve cache\'e kaydedildi');
        // Cache istatistiklerini göster
        setTimeout(async () => {
          await getCacheStats();
        }, 1000);
      }
    } catch (error) {
      console.error('Avatar creation error:', error);
      
      // Özel hata mesajları
      let alertTitle = 'Hata';
      let alertMessage = error.message || 'Avatar videosu oluşturulamadı';
      
      if (error.message && (
          error.message.includes('kredi') || 
          error.message.includes('credit') ||
          error.message.includes('payment')
        )) {
        alertTitle = 'Kredi Hatası';
        alertMessage = error.message;
      }
      
      Alert.alert(alertTitle, alertMessage);
    } finally {
      setIsAvatarLoading(false);
    }
  };

  // Kullanıcı telaffuzunu kaydet
  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      setUserTranscription('');
      setWordAnalysis([]);

      // 🎥 Kayıt sırasında: sessiz, loop eden arka plan videosunu oynat
      // Her ihtimale karşı ana videoyu kapat ki arka plan görünsün
      setAvatarVideoUrl(null);
      setPauseBackground(false);

      try {
        const sentence = getCurrentSentence();
        let bg = null;
        if (sentence) {
          const cachedVideo = await getVideoFromCache(sentence.text, selectedAvatar.avatarId);
          if (cachedVideo && cachedVideo.videoUrl) {
            bg = cachedVideo.videoUrl;
          }
        }
        if (!bg) {
          const firstLevel = LEVELS[0]; // A1
          const firstSentence = ENGLISH_LEVELS[firstLevel]?.sentences[0];
          if (firstSentence) {
            const firstCachedVideo = await getVideoFromCache(firstSentence.text, selectedAvatar.avatarId);
            if (firstCachedVideo && firstCachedVideo.videoUrl) {
              bg = firstCachedVideo.videoUrl;
            }
          }
        }
        setBackgroundVideoUrl(bg || null);
      } catch (e) {
        console.warn('Arka plan videosu yüklenemedi:', e?.message || e);
        setBackgroundVideoUrl(null);
      }
    } catch (error) {
      console.error('Kayıt başlatma hatası:', error);
      Alert.alert('Hata', 'Ses kaydı başlatılamadı: ' + error.message);
    }
  };

  // Kaydı durdur ve analiz et
  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      const sentence = getCurrentSentence();
      
      // 🎥 Kayıt biter bitmez: videoyu KALDIRMA, son karede DONDUR
      setPauseBackground(true);
      
      // Transkribe et
      setUserTranscription('Analiz ediliyor...');
      const transcribed = await transcribeAudio(uri);
      setUserTranscription(transcribed);

      // Kelime analizi yap
      if (sentence && transcribed) {
        analyzePronunciation(sentence.text, transcribed);
      }

      setRecording(null);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (error) {
      console.error('Kayıt durdurma hatası:', error);
      Alert.alert('Hata', 'Ses analiz edilemedi: ' + error.message);
      setIsRecording(false);
      setRecording(null);
      // Hata durumunda da arka planı kaldırma; son karede dondur
      setPauseBackground(true);
    }
  };

  // Telaffuz analizi yap
  const analyzePronunciation = (originalText, userText) => {
    // Metinleri küçük harfe çevir ve temizle
    const originalWords = originalText.toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/);
    const userWords = userText.toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/);
    
    const analysis = [];
    let correctCount = 0;
    let totalCount = 0;

    originalWords.forEach((originalWord, index) => {
      totalCount++;
      const userWord = userWords[index] || '';
      const isCorrect = userWord === originalWord || 
                       userWord.includes(originalWord) || 
                       originalWord.includes(userWord);
      
      if (isCorrect) correctCount++;

      analysis.push({
        word: originalWord,
        userWord: userWord || '(söylenmedi)',
        isCorrect,
        index,
      });
    });

    setWordAnalysis(analysis);
    
    // Session skorunu güncelle
    setSessionScore(prev => ({
      correct: prev.correct + correctCount,
      total: prev.total + totalCount,
    }));
  };

  // Önceki cümleye git
  const goToPrevious = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(currentSentenceIndex - 1);
      setUserTranscription('');
      setWordAnalysis([]);
      setAvatarVideoUrl(null);
    }
  };

  // Sonraki cümleye git
  const goToNext = () => {
    const level = ENGLISH_LEVELS[selectedLevel];
    if (currentSentenceIndex < level.sentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      setUserTranscription('');
      setWordAnalysis([]);
      setAvatarVideoUrl(null);
    }
  };

  // Seviye seç
  const selectLevel = (level) => {
    setSelectedLevel(level);
    setCurrentSentenceIndex(0);
    setUserTranscription('');
    setWordAnalysis([]);
    setAvatarVideoUrl(null);
    setSessionScore({ correct: 0, total: 0 });
  };

  // Seviye seçimi ekranı
  if (!selectedLevel) {
    return (
      <ScrollView
        contentContainerStyle={[
          styles.container,
          styles.levelSelectionContainer,
          { paddingTop: Math.max(insets.top, IS_SMALL_SCREEN ? 10 : IS_TABLET ? 20 : 15) }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>🇬🇧 İngilizce Öğren</Text>
            <Text style={styles.headerSubtitle}>Seviye Seçin</Text>
          </View>
        </View>

        <View style={styles.levelGrid}>
          {LEVELS.map((level) => (
            <TouchableOpacity
              key={level}
              style={styles.levelCard}
              onPress={() => selectLevel(level)}
            >
              <Text style={styles.levelTitle}>{level}</Text>
              <Text style={styles.levelSubtitle}>{ENGLISH_LEVELS[level].name}</Text>
              <Text style={styles.levelInfo}>10 cümle</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  const sentence = getCurrentSentence();
  const level = ENGLISH_LEVELS[selectedLevel];
  const accuracy = sessionScore.total > 0 
    ? Math.round((sessionScore.correct / sessionScore.total) * 100) 
    : 0;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingTop: Math.max(insets.top, IS_SMALL_SCREEN ? 10 : IS_TABLET ? 20 : 15) }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedLevel(null)}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🇬🇧 {selectedLevel}</Text>
          <Text style={styles.headerSubtitle}>
            Cümle {currentSentenceIndex + 1} / {level.sentences.length}
          </Text>
        </View>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        {/* Ana avatar video (cümle için) */}
        {avatarVideoUrl && (
          <AvatarDisplay
            key={`avatar-${videoReplayKey}`}
            videoUrl={avatarVideoUrl}
            isLoading={isAvatarLoading}
            onPlaybackFinish={() => setAvatarVideoUrl(null)}
            style={styles.avatarDisplay}
            isLooping={false}
            volume={1.0}
          />
        )}
        
        {/* Arka plan avatar (cache'den, sessiz, loop) - sadece ana video yoksa */}
        {!avatarVideoUrl && backgroundVideoUrl && (
          <AvatarDisplay
            videoUrl={backgroundVideoUrl}
            avatarImageUrl={selectedAvatar.imageUrl}
            isLoading={false}
            onPlaybackFinish={() => {}}
            style={styles.avatarDisplay}
            isLooping={true}
            volume={0}
            shouldPause={pauseBackground}
          />
        )}
        
        {/* Hiç video yoksa, loading state veya avatar image */}
        {!avatarVideoUrl && !backgroundVideoUrl && (
          <AvatarDisplay
            videoUrl={null}
            avatarImageUrl={selectedAvatar.imageUrl}
            isLoading={isAvatarLoading}
            onPlaybackFinish={() => {}}
            style={styles.avatarDisplay}
            isLooping={false}
            volume={1.0}
          />
        )}
      </View>

      {/* Cümle Kartı */}
      <View style={styles.sentenceCard}>
        <Text style={styles.sentenceText}>{sentence.text}</Text>
        <Text style={styles.sentenceTurkish}>{sentence.turkish}</Text>
        
        <TouchableOpacity
          style={[styles.playButton, isAvatarLoading && styles.buttonDisabled]}
          onPress={handlePlayAvatar}
          disabled={isAvatarLoading}
        >
          {isAvatarLoading ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
              <Text style={styles.playButtonText}>Hazırlanıyor...</Text>
            </View>
          ) : (
            <Text style={styles.playButtonText}>🔊 Avatar Telaffuzunu Dinle</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Kullanıcı Telaffuz Bölümü */}
      <View style={styles.pronunciationSection}>
        <Text style={styles.sectionTitle}>🎤 Telaffuzunuzu Kaydedin</Text>
        
        <View style={styles.micContainer}>
          <MicButton
            onPress={isRecording ? stopRecording : startRecording}
            isRecording={isRecording}
          />
          <Text style={styles.micLabel}>
            {isRecording ? 'Kayıt yapılıyor...' : 'Kaydetmek için dokunun'}
          </Text>
        </View>

        {/* Kullanıcı Transkripsiyonu */}
        {userTranscription && userTranscription !== 'Analiz ediliyor...' && (
          <View style={styles.transcriptionCard}>
            <Text style={styles.transcriptionLabel}>Söylediğiniz:</Text>
            <Text style={styles.transcriptionText}>{userTranscription}</Text>
          </View>
        )}

        {/* Kelime Analizi */}
        {wordAnalysis.length > 0 && (
          <View style={styles.analysisCard}>
            <Text style={styles.analysisTitle}>Kelime Analizi</Text>
            <View style={styles.wordsContainer}>
              {wordAnalysis.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.wordBox,
                    item.isCorrect ? styles.correctWord : styles.incorrectWord
                  ]}
                >
                  <Text style={styles.wordText}>{item.word}</Text>
                  {!item.isCorrect && (
                    <Text style={styles.userWordText}>{item.userWord}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Navigasyon */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentSentenceIndex === 0 && styles.navButtonDisabled]}
          onPress={goToPrevious}
          disabled={currentSentenceIndex === 0}
        >
          <Text style={styles.navButtonText}>← Önceki</Text>
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentSentenceIndex + 1} / {level.sentences.length}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.navButton,
            currentSentenceIndex === level.sentences.length - 1 && styles.navButtonDisabled
          ]}
          onPress={goToNext}
          disabled={currentSentenceIndex === level.sentences.length - 1}
        >
          <Text style={styles.navButtonText}>Sonraki →</Text>
        </TouchableOpacity>
      </View>

      {/* Genel Değerlendirme */}
      {sessionScore.total > 0 && (
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>📊 Genel Değerlendirme</Text>
          <Text style={styles.scoreText}>
            Doğru: {sessionScore.correct} / {sessionScore.total}
          </Text>
          <Text style={styles.scorePercentage}>
            Başarı Oranı: {accuracy}%
          </Text>
          <View style={styles.scoreBar}>
            <View
              style={[
                styles.scoreBarFill,
                { width: `${accuracy}%`, backgroundColor: accuracy >= 80 ? '#4CAF50' : accuracy >= 60 ? '#FFC107' : '#F44336' }
              ]}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// Responsive dimensions
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_SMALL_SCREEN = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH >= 768;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: IS_SMALL_SCREEN ? 12 : IS_TABLET ? 30 : 20,
    paddingHorizontal: IS_SMALL_SCREEN ? 12 : IS_TABLET ? 30 : 20,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    width: '100%',
    maxWidth: IS_TABLET ? 600 : '100%',
    alignSelf: 'center',
    marginBottom: IS_SMALL_SCREEN ? 12 : 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: IS_SMALL_SCREEN ? 8 : IS_TABLET ? 12 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: IS_SMALL_SCREEN ? 5 : 6,
    paddingHorizontal: IS_SMALL_SCREEN ? 8 : 10,
    backgroundColor: '#f0f7ff',
    borderRadius: IS_SMALL_SCREEN ? 6 : 7,
    minWidth: IS_SMALL_SCREEN ? 60 : 70,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: IS_SMALL_SCREEN ? 8 : 12,
  },
  backButtonText: {
    fontSize: IS_SMALL_SCREEN ? 12 : IS_TABLET ? 15 : 13,
    color: '#4A90E2',
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: IS_SMALL_SCREEN ? 14 : IS_TABLET ? 22 : 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: IS_SMALL_SCREEN ? 1 : 2,
    textAlign: 'left',
  },
  headerSubtitle: {
    fontSize: IS_SMALL_SCREEN ? 9 : IS_TABLET ? 12 : 10,
    color: '#666',
    textAlign: 'left',
  },
  // Seviye seçim container (ortalamak için)
  levelSelectionContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: Dimensions.get('window').height * 0.8,
  },
  // Seviye seçimi stilleri
  levelGrid: {
    width: '100%',
    maxWidth: IS_TABLET ? 600 : '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: IS_SMALL_SCREEN ? 20 : IS_TABLET ? 40 : 30,
  },
  levelCard: {
    width: IS_SMALL_SCREEN ? '47%' : IS_TABLET ? '30%' : '47%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: IS_SMALL_SCREEN ? 15 : 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: IS_SMALL_SCREEN ? 12 : 18,
    marginHorizontal: IS_SMALL_SCREEN ? 2 : 5,
  },
  levelTitle: {
    fontSize: IS_SMALL_SCREEN ? 24 : IS_TABLET ? 32 : 28,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 5,
  },
  levelSubtitle: {
    fontSize: IS_SMALL_SCREEN ? 11 : IS_TABLET ? 14 : 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  levelInfo: {
    fontSize: IS_SMALL_SCREEN ? 10 : 12,
    color: '#999',
  },
  // Avatar section
  avatarSection: {
    width: '100%',
    maxWidth: IS_TABLET ? 600 : '100%',
    alignSelf: 'center',
    marginBottom: IS_SMALL_SCREEN ? 15 : 20,
    backgroundColor: '#fff',
    position: 'relative',
    padding: IS_SMALL_SCREEN ? 12 : IS_TABLET ? 20 : 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: (Dimensions.get('window').width * 9) / 16, // 16:9 aspect ratio için minimum yükseklik
  },
  avatarDisplay: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  // Cümle kartı
  sentenceCard: {
    width: '100%',
    maxWidth: IS_TABLET ? 600 : '100%',
    alignSelf: 'center',
    marginBottom: IS_SMALL_SCREEN ? 15 : 20,
    backgroundColor: '#fff',
    padding: IS_SMALL_SCREEN ? 15 : IS_TABLET ? 25 : 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sentenceText: {
    fontSize: IS_SMALL_SCREEN ? 18 : IS_TABLET ? 24 : 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: IS_SMALL_SCREEN ? 8 : 10,
    textAlign: 'center',
    lineHeight: IS_SMALL_SCREEN ? 24 : IS_TABLET ? 32 : 28,
  },
  sentenceTurkish: {
    fontSize: IS_SMALL_SCREEN ? 13 : IS_TABLET ? 16 : 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: IS_SMALL_SCREEN ? 12 : 15,
    fontStyle: 'italic',
  },
  playButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: IS_SMALL_SCREEN ? 12 : IS_TABLET ? 16 : 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  playButtonText: {
    color: '#fff',
    fontSize: IS_SMALL_SCREEN ? 14 : IS_TABLET ? 18 : 16,
    fontWeight: 'bold',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  // Telaffuz bölümü
  pronunciationSection: {
    width: '100%',
    maxWidth: IS_TABLET ? 600 : '100%',
    alignSelf: 'center',
    marginBottom: IS_SMALL_SCREEN ? 15 : 20,
    backgroundColor: '#fff',
    padding: IS_SMALL_SCREEN ? 15 : IS_TABLET ? 25 : 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: IS_SMALL_SCREEN ? 14 : IS_TABLET ? 18 : 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: IS_SMALL_SCREEN ? 12 : 15,
    textAlign: 'center',
  },
  micContainer: {
    alignItems: 'center',
    marginBottom: IS_SMALL_SCREEN ? 15 : 20,
  },
  micLabel: {
    fontSize: IS_SMALL_SCREEN ? 12 : IS_TABLET ? 15 : 13,
    color: '#666',
    marginTop: IS_SMALL_SCREEN ? 8 : 10,
  },
  transcriptionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: IS_SMALL_SCREEN ? 12 : 15,
    marginBottom: IS_SMALL_SCREEN ? 12 : 15,
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
  },
  transcriptionLabel: {
    fontSize: IS_SMALL_SCREEN ? 12 : 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  transcriptionText: {
    fontSize: IS_SMALL_SCREEN ? 14 : IS_TABLET ? 18 : 16,
    color: '#333',
    fontStyle: 'italic',
  },
  // Analiz kartı
  analysisCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: IS_SMALL_SCREEN ? 12 : 15,
  },
  analysisTitle: {
    fontSize: IS_SMALL_SCREEN ? 13 : IS_TABLET ? 16 : 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: IS_SMALL_SCREEN ? 10 : 12,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  wordBox: {
    paddingHorizontal: IS_SMALL_SCREEN ? 10 : 12,
    paddingVertical: IS_SMALL_SCREEN ? 6 : 8,
    borderRadius: 8,
    marginRight: IS_SMALL_SCREEN ? 6 : 8,
    marginBottom: IS_SMALL_SCREEN ? 6 : 8,
    borderWidth: 2,
  },
  correctWord: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  incorrectWord: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  wordText: {
    fontSize: IS_SMALL_SCREEN ? 13 : IS_TABLET ? 16 : 14,
    fontWeight: '600',
    color: '#333',
  },
  userWordText: {
    fontSize: IS_SMALL_SCREEN ? 10 : 12,
    color: '#F44336',
    marginTop: 2,
    fontStyle: 'italic',
  },
  // Navigasyon
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: IS_TABLET ? 600 : '100%',
    alignSelf: 'center',
    marginBottom: IS_SMALL_SCREEN ? 15 : 20,
    backgroundColor: '#fff',
    padding: IS_SMALL_SCREEN ? 12 : 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: IS_SMALL_SCREEN ? 10 : 12,
    paddingHorizontal: IS_SMALL_SCREEN ? 15 : 20,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  navButtonText: {
    color: '#fff',
    fontSize: IS_SMALL_SCREEN ? 13 : IS_TABLET ? 16 : 14,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: IS_SMALL_SCREEN ? 10 : 15,
  },
  progressText: {
    fontSize: IS_SMALL_SCREEN ? 14 : IS_TABLET ? 18 : 16,
    fontWeight: '600',
    color: '#333',
  },
  // Skor kartı
  scoreCard: {
    width: '100%',
    maxWidth: IS_TABLET ? 600 : '100%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: IS_SMALL_SCREEN ? 15 : IS_TABLET ? 25 : 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: IS_SMALL_SCREEN ? 15 : 20,
  },
  scoreTitle: {
    fontSize: IS_SMALL_SCREEN ? 15 : IS_TABLET ? 20 : 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: IS_SMALL_SCREEN ? 10 : 12,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: IS_SMALL_SCREEN ? 14 : IS_TABLET ? 18 : 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  scorePercentage: {
    fontSize: IS_SMALL_SCREEN ? 16 : IS_TABLET ? 24 : 20,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: IS_SMALL_SCREEN ? 10 : 12,
  },
  scoreBar: {
    width: '100%',
    height: IS_SMALL_SCREEN ? 12 : 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 10,
    transition: 'width 0.3s ease',
  },
});
