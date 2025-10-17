/**
 * Deepgram API Konfigürasyonu
 * 
 * API Key'inizi buraya ekleyin veya environment variable kullanın
 * https://console.deepgram.com/ adresinden ücretsiz API key alabilirsiniz
 */

export const DEEPGRAM_CONFIG = {
  // Deepgram API Key
  apiKey: "d0f1e3203e7ddad088744c51508dc9b72c4bc76a",
  
  // Speech-to-Text (STT) ayarları
  stt: {
    model: "nova-2", // En yeni ve hızlı model
    language: "tr", // Türkçe dil desteği
    smartFormat: true, // Otomatik formatlamayı etkinleştir
    punctuate: true, // Noktalama işaretlerini ekle
    diarize: false, // Konuşmacı ayırımı (çoklu konuşmacı için true yapın)
  },
  
  // Text-to-Speech (TTS) ayarları
  tts: {
    model: "aura-asteria-en", // Doğal ses modeli
    encoding: "linear16", // Ses formatı
    container: "wav", // Ses container formatı
  },
  
  // Canlı transkripsiyon ayarları
  live: {
    model: "nova-2",
    language: "tr",
    smartFormat: true,
    punctuate: true,
    interimResults: true, // Ara sonuçları göster
  },
};

export default DEEPGRAM_CONFIG;

