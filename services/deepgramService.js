import DEEPGRAM_CONFIG from "../config/deepgramConfig";
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Ses dosyasını Deepgram REST API ile transkribe eder
 * Otomatik dil algılama ile çalışır (Türkçe ve İngilizce desteklenir)
 * @param {string} audioUri - Ses dosyasının URI'si
 * @returns {Promise<string>} - Transkribe edilmiş metin
 */
export const transcribeAudio = async (audioUri) => {
  try {
    console.log("✅ [1/6] Transkripsiyon başlatılıyor...");
    console.log("📁 Dosya URI:", audioUri);

    // Ses dosyasını base64 olarak oku - string kullanarak
    console.log("✅ [2/6] Dosya okunuyor...");
    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: 'base64',
    });
    console.log("✅ [3/6] Base64 boyutu:", audioBase64.length, "karakter");

    // Base64'ü binary'e çevir
    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    console.log("✅ [4/6] Binary boyutu:", bytes.length, "bytes");

    // API parametreleri - Otomatik dil algılama aktif (Türkçe ve İngilizce desteklenir)
    const params = new URLSearchParams({
      model: DEEPGRAM_CONFIG.stt.model,
      detect_language: 'true', // Otomatik dil algılama aktif
      smart_format: DEEPGRAM_CONFIG.stt.smartFormat.toString(),
      punctuate: DEEPGRAM_CONFIG.stt.punctuate.toString(),
      diarize: DEEPGRAM_CONFIG.stt.diarize.toString(),
    });

    console.log("✅ [5/6] Deepgram API'ye gönderiliyor...");
    console.log("🔑 API Key ilk 10 karakter:", DEEPGRAM_CONFIG.apiKey.substring(0, 10) + "...");
    
    // Deepgram REST API çağrısı
    const response = await fetch(
      `https://api.deepgram.com/v1/listen?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_CONFIG.apiKey}`,
          'Content-Type': 'audio/wav',
        },
        body: bytes.buffer,
      }
    );

    console.log("📡 API Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Deepgram API error:", response.status, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ [6/6] Deepgram yanıtı alındı!");
    console.log("📝 Tam yanıt:", JSON.stringify(result, null, 2));

    // Transkribe edilmiş metni döndür
    const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
    
    console.log("📄 Bulunan transcript:", transcript);
    
    if (!transcript || transcript.trim() === "") {
      console.warn("⚠️ Boş transcript!");
      return "Ses algılanamadı veya transkribe edilemedi";
    }

    console.log("🎉 BAŞARILI! Metin:", transcript);
    return transcript;
    
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Ses transkribe edilemedi: " + error.message);
  }
};

/**
 * URL'den ses dosyasını transkribe eder (alternatif metod)
 * @param {string} audioUrl - Ses dosyasının URL'si
 * @returns {Promise<string>} - Transkribe edilmiş metin
 */
export const transcribeAudioFromUrl = async (audioUrl) => {
  try {
    const params = new URLSearchParams({
      model: DEEPGRAM_CONFIG.stt.model,
      detect_language: 'true', // Otomatik dil algılama aktif
      smart_format: DEEPGRAM_CONFIG.stt.smartFormat.toString(),
      punctuate: DEEPGRAM_CONFIG.stt.punctuate.toString(),
    });

    const response = await fetch(
      `https://api.deepgram.com/v1/listen?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: audioUrl }),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
    
    return transcript || "Transkripsiyon yapılamadı";
    
  } catch (error) {
    console.error("Transcription from URL error:", error);
    throw error;
  }
};
