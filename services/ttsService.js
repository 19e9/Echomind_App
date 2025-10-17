import { Audio } from "expo-av";
import DEEPGRAM_CONFIG from "../config/deepgramConfig";
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Metni Deepgram TTS REST API ile sese çevirir ve çalar
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

    // Deepgram TTS REST API çağrısı
    const response = await fetch(
      'https://api.deepgram.com/v1/speak?model=' + DEEPGRAM_CONFIG.tts.model,
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
    const response = await fetch(
      'https://api.deepgram.com/v1/speak?model=' + DEEPGRAM_CONFIG.tts.model,
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
