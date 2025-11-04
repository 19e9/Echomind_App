import { Audio } from "expo-av";
import * as Speech from 'expo-speech';
import DEEPGRAM_CONFIG from "../config/deepgramConfig";
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Metnin dilini algılar (Türkçe veya İngilizce)
 * @param {string} text - Algılanacak metin
 * @returns {string} - 'tr' veya 'en'
 */
const detectLanguage = (text) => {
  // Türkçe karakterleri kontrol et
  const turkishChars = /[çğıöşüÇĞIİÖŞÜ]/;
  // Türkçe kelimeler veya karakterler varsa Türkçe
  if (turkishChars.test(text)) {
    return 'tr';
  }
  
  // İngilizce karakter kontrolü (basit)
  const englishWords = /\b(the|is|are|and|or|but|to|of|a|an|in|on|at|for|with|this|that|you|we|they|he|she|it|have|has|do|does|will|would|can|could|should|may|might)\b/i;
  if (englishWords.test(text)) {
    return 'en';
  }
  
  // Varsayılan olarak Türkçe (çoğunlukla Türkçe konuşuyorsak)
  return 'tr';
};

/**
 * Dil için uygun TTS modelini seçer
 * @param {string} language - 'tr' veya 'en'
 * @returns {string} - Model adı
 */
const getTTSModel = (language) => {
  if (language === 'tr') {
    // Deepgram'da Türkçe TTS yok, Expo Speech kullanılacak
    return null; // Expo Speech kullan
  }
  return DEEPGRAM_CONFIG.tts.model; // İngilizce için Deepgram model
};

/**
 * Metni Deepgram TTS REST API ile sese çevirir ve çalar
 * Otomatik dil algılama ile çalışır (Türkçe ve İngilizce)
 * @param {string} text - Seslendirilecek metin
 * @returns {Promise<void>}
 */
export const speakText = async (text) => {
  try {
    if (!text || text.trim() === "") {
      console.log("Seslendirilecek metin yok");
      return;
    }

    console.log("Speaking:", text);

    // Metnin dilini algıla
    const detectedLanguage = detectLanguage(text);
    const ttsModel = getTTSModel(detectedLanguage);
    
    console.log(`Detected language: ${detectedLanguage}, Using model: ${ttsModel || 'Expo Speech'}`);

    // Türkçe ise Expo Speech kullan (yerleşik TTS desteği)
    if (detectedLanguage === 'tr' && !ttsModel) {
      return new Promise((resolve, reject) => {
        Speech.speak(text, {
          language: 'tr-TR', // Türkçe
          pitch: 1.0,
          rate: 1.0,
          onDone: () => {
            console.log('Türkçe seslendirme tamamlandı');
            resolve();
          },
          onError: (error) => {
            console.error('TTS error:', error);
            reject(error);
          },
        });
      });
    }

    // İngilizce için Deepgram TTS REST API çağrısı
    const response = await fetch(
      `https://api.deepgram.com/v1/speak?model=${ttsModel}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Deepgram TTS API error:", response.status, errorText);
      throw new Error(`TTS API Error: ${response.status}`);
    }

    // Audio blob'u al
    const audioBlob = await response.blob();
    const reader = new FileReader();
    
    // Blob'u base64'e çevir
    const base64Audio = await new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    // Ses dosyasını kaydet ve oynat
    const fileUri = FileSystem.cacheDirectory + 'tts_output.wav';
    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: 'base64',
    });

    // Sesi oynat
    const { sound } = await Audio.Sound.createAsync(
      { uri: fileUri },
      { shouldPlay: true }
    );

    // Ses bittiğinde temizle
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
        // Geçici dosyayı sil
        FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(console.error);
      }
    });

  } catch (error) {
    console.error("TTS error:", error);
    throw new Error("Metin seslendirilmedi: " + error.message);
  }
};

/**
 * Metni sese çevirir ve dosya URI'sini döndürür
 * @param {string} text - Seslendirilecek metin
 * @returns {Promise<string>} - Ses dosyasının URI'si
 */
export const textToAudioFile = async (text) => {
  try {
    // Metnin dilini algıla
    const detectedLanguage = detectLanguage(text);
    const ttsModel = getTTSModel(detectedLanguage);
    
    // Türkçe için Expo Speech kullanılır ama dosya olarak kaydetmek için Deepgram alternatifi yok
    // Bu durumda Türkçe için de Deepgram'ı deniyoruz (telaffuz kötü olabilir)
    // Veya kullanıcıya bilgi verilebilir
    
    if (detectedLanguage === 'tr' && !ttsModel) {
      // Türkçe için şimdilik Deepgram'ı deniyoruz
      // Gelecekte alternatif bir TTS servisi eklenebilir
      console.warn('Türkçe TTS için Deepgram kullanılıyor (sınırlı destek)');
    }

    const response = await fetch(
      `https://api.deepgram.com/v1/speak?model=${ttsModel || DEEPGRAM_CONFIG.tts.model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      throw new Error(`TTS API Error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const reader = new FileReader();
    
    const base64Audio = await new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    // Dosyayı kaydet
    const fileUri = FileSystem.cacheDirectory + `tts_${Date.now()}.wav`;
    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: 'base64',
    });

    return fileUri;
    
  } catch (error) {
    console.error("Text to audio file error:", error);
    throw error;
  }
};
