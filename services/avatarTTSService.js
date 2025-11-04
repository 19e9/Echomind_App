import { textToAudioFile } from './ttsService';
import { 
  textToAvatarWithHeyGen, 
  createVideoFromAudio, 
  waitForVideoCompletion 
} from './heygenApiService';
import * as FileSystem from 'expo-file-system/legacy';
import { getVideoFromCache, saveVideoToCache } from './videoCacheService';

/**
 * Avatar TTS Service
 * HeyGen TTS + HeyGen Avatar entegrasyonu
 * 
 * Text → HeyGen TTS + HeyGen Video Pipeline
 * 
 * ✅ FIX: Base64 URL sorununu çözmek için HeyGen'in kendi TTS'ini kullanıyoruz
 * 
 * İş Akışı:
 * 1. HeyGen TTS: Metni sese çevirir (HeyGen native)
 * 2. HeyGen API: Lip-sync video oluşturur (aynı anda)
 */

/**
 * Metni HeyGen TTS ile avatar videosuna çevirir
 * ✅ FIX: Base64 URL sorunu için HeyGen'in kendi TTS'ini kullanıyoruz
 * @param {string} text - Konuşulacak metin
 * @param {string} avatarId - HeyGen Avatar ID (örn: 'Monica_public_3_20240108')
 * @param {string} voiceId - (Opsiyonel) HeyGen voice ID
 * @returns {Promise<Object>} Video URL ve metadata
 */
export const textToAvatar = async (text, avatarId, voiceId = null) => {
  try {
    console.log('🎬 Starting Text-to-Avatar Pipeline (HeyGen TTS)...');
    console.log('📝 Text length:', text.length, 'chars');
    console.log('👤 Avatar ID:', avatarId);

    // Cache kontrolü - Önce cache'den kontrol et
    const cachedVideo = await getVideoFromCache(text, avatarId);
    if (cachedVideo && cachedVideo.videoUrl) {
      console.log('✨ Video cache\'den alındı (hızlı yükleme!)');
      console.log('📹 Cached video URL:', cachedVideo.videoUrl);
      console.log('⏱️ Cache yaşı: ~' + cachedVideo.cacheAge + ' dakika');
      
      return {
        success: true,
        videoUrl: cachedVideo.videoUrl,
        videoId: cachedVideo.videoId,
        text,
        avatarId,
        voiceId: voiceId || '2d5b0e6cf36f460aa7fc47e3eee4ba54',
        cached: true,
        timestamp: new Date().toISOString(),
      };
    }

    console.log('🔄 Cache\'de video bulunamadı, yeni video oluşturuluyor...');

    // HeyGen TTS kullan (base64 sorunu yok!)
    const defaultVoiceId = voiceId || '2d5b0e6cf36f460aa7fc47e3eee4ba54';
    console.log('🔊 Using HeyGen TTS with voice:', defaultVoiceId);
    console.log('📚 HeyGen Docs: https://docs.heygen.com/docs/quick-start');

    // Video ID'yi de almak için waitForVideoCompletion'dan önce videoId'yi sakla
    // Not: textToAvatarWithHeyGen içinde videoId log'lanıyor ama dışarı dönmüyor
    // Şimdilik sadece videoUrl ile cache yapıyoruz
    const videoUrl = await textToAvatarWithHeyGen(
      text,
      avatarId,
      null, // audioUrl = null (HeyGen TTS kullanacak)
      defaultVoiceId
    );

    // Video başarıyla oluşturuldu, cache'e kaydet
    console.log('💾 Video cache\'e kaydediliyor...');
    await saveVideoToCache(text, avatarId, videoUrl);

    console.log('✅ Text-to-Avatar Pipeline Complete!');
    console.log('🎥 Video URL:', videoUrl);

    return {
      success: true,
      videoUrl,
      text,
      avatarId,
      voiceId: defaultVoiceId,
      cached: false,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Text-to-Avatar Pipeline Failed:', error);
    
    // HeyGen'den gelen özel hataları koru
    if (error.code || error.message.includes('kredi') || error.message.includes('credit')) {
      throw error; // Kullanıcı dostu mesaj zaten error.message'da
    }
    
    throw new Error('Avatar oluşturulamadı: ' + error.message);
  }
};

/**
 * Ses dosyasını doğrudan HeyGen ile avatar videosuna çevirir
 * HeyGen API kullanarak
 * 
 * @param {string} audioFileUri - Ses dosyası URI'si
 * @param {string} avatarId - HeyGen Avatar ID
 * @returns {Promise<Object>} Video URL ve metadata
 */
export const audioToAvatar = async (audioFileUri, avatarId) => {
  try {
    console.log('🎬 Starting Audio-to-Avatar Pipeline (HeyGen API)...');
    console.log('🔊 Audio file:', audioFileUri);
    console.log('👤 Avatar ID:', avatarId);

    // Ses dosyasını base64'e çevir ve data URL formatına dönüştür
    const audioBase64 = await FileSystem.readAsStringAsync(audioFileUri, {
      encoding: 'base64',
    });

    const audioDataUrl = `data:audio/wav;base64,${audioBase64}`;

    // HeyGen API ile avatar videosu oluştur
    const videoId = await createVideoFromAudio(audioDataUrl, avatarId);
    
    // Video tamamlanana kadar bekle
    const videoUrl = await waitForVideoCompletion(videoId);

    console.log('✅ Audio-to-Avatar Pipeline Complete!');
    console.log('📝 Video ID:', videoId);
    console.log('🎥 Video URL:', videoUrl);

    return {
      success: true,
      videoId,
      videoUrl,
      avatarId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Audio-to-Avatar Pipeline Failed:', error);
    throw error;
  }
};

/**
 * Speech-to-Avatar Pipeline
 * Kayıt → Deepgram STT → Deepgram TTS → HeyGen Avatar
 * @param {string} recordingUri - Ses kaydı URI'si
 * @param {string} avatarId - HeyGen Avatar ID
 * @param {Function} transcribeFunction - Deepgram STT fonksiyonu
 * @returns {Promise<Object>} Video URL, transcript ve metadata
 */
export const speechToAvatar = async (
  recordingUri,
  avatarId,
  transcribeFunction
) => {
  try {
    console.log('🎬 Starting Speech-to-Avatar Pipeline (HeyGen)...');

    // Adım 1: Deepgram STT ile sesi metne çevir
    console.log('📝 [1/3] Transcribing speech with Deepgram STT...');
    const transcript = await transcribeFunction(recordingUri);
    console.log('✅ Transcript:', transcript);

    if (!transcript || transcript === 'Ses algılanamadı veya transkribe edilemedi') {
      throw new Error('Ses transkribe edilemedi');
    }

    // Adım 2 & 3: Text-to-Avatar pipeline (Deepgram TTS + HeyGen)
    console.log('🎭 [2/3] Creating avatar video with HeyGen...');
    const result = await textToAvatar(transcript, avatarId);

    console.log('✅ Speech-to-Avatar Pipeline Complete!');

    return {
      ...result,
      transcript,
      mode: 'speech-to-avatar',
    };
  } catch (error) {
    console.error('❌ Speech-to-Avatar Pipeline Failed:', error);
    throw error;
  }
};

/**
 * Avatar video cache yönetimi
 */
const avatarCache = new Map();

/**
 * Avatar videosunu cache'e ekler
 * @param {string} key - Cache key (text hash)
 * @param {string} videoUrl - Video URL
 */
export const cacheAvatarVideo = (key, videoUrl) => {
  avatarCache.set(key, {
    videoUrl,
    timestamp: Date.now(),
  });

  // Cache boyutu sınırı (son 20 video)
  if (avatarCache.size > 20) {
    const firstKey = avatarCache.keys().next().value;
    avatarCache.delete(firstKey);
  }
};

/**
 * Cache'den avatar videosu alır
 * @param {string} key - Cache key
 * @returns {string|null} Video URL veya null
 */
export const getCachedAvatarVideo = (key) => {
  const cached = avatarCache.get(key);
  if (cached) {
    // 1 saat geçerliliği
    if (Date.now() - cached.timestamp < 3600000) {
      return cached.videoUrl;
    } else {
      avatarCache.delete(key);
    }
  }
  return null;
};

/**
 * Text için basit hash oluşturur (cache key için)
 * @param {string} text - Metin
 * @returns {string} Hash
 */
export const hashText = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

/**
 * Cache'lenmiş textToAvatar (performans için)
 * @param {string} text - Konuşulacak metin
 * @param {string} avatarId - HeyGen Avatar ID
 * @param {boolean} useCache - Cache kullanılsın mı?
 * @returns {Promise<Object>} Video URL ve metadata
 */
export const textToAvatarCached = async (
  text,
  avatarId,
  useCache = true
) => {
  if (useCache) {
    const cacheKey = hashText(text + avatarId);
    const cached = getCachedAvatarVideo(cacheKey);

    if (cached) {
      console.log('✨ Using cached avatar video');
      return {
        success: true,
        videoUrl: cached,
        text,
        avatarId,
        cached: true,
      };
    }

    const result = await textToAvatar(text, avatarId);
    cacheAvatarVideo(cacheKey, result.videoUrl);
    return result;
  }

  return textToAvatar(text, avatarId);
};

export default {
  textToAvatar,
  audioToAvatar,
  speechToAvatar,
  textToAvatarCached,
  cacheAvatarVideo,
  getCachedAvatarVideo,
  hashText,
};

