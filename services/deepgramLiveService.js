import DEEPGRAM_CONFIG from "../config/deepgramConfig";

/**
 * Deepgram WebSocket Live Transcription Service
 * Gerçek zamanlı ses transkripsiyon servisi
 */

export class DeepgramLiveTranscriber {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.onTranscriptCallback = null;
    this.onErrorCallback = null;
  }

  /**
   * WebSocket bağlantısını başlatır
   * Otomatik dil algılama ile çalışır (Türkçe ve İngilizce desteklenir)
   * @param {function} onTranscript - Her transkript geldiğinde çağrılacak callback
   * @param {function} onError - Hata olduğunda çağrılacak callback
   */
  connect(onTranscript, onError) {
    return new Promise((resolve, reject) => {
      try {
        this.onTranscriptCallback = onTranscript;
        this.onErrorCallback = onError;

        // WebSocket URL oluştur - Otomatik dil algılama aktif (Türkçe ve İngilizce desteklenir)
        const wsUrl = `wss://api.deepgram.com/v1/listen?` + new URLSearchParams({
          model: DEEPGRAM_CONFIG.stt.model,
          detect_language: 'true', // Otomatik dil algılama aktif
          smart_format: DEEPGRAM_CONFIG.stt.smartFormat.toString(),
          punctuate: DEEPGRAM_CONFIG.stt.punctuate.toString(),
          interim_results: 'true',
          encoding: 'linear16',
          sample_rate: '16000',
        }).toString();

        console.log('Deepgram WebSocket bağlantısı açılıyor...');

        // WebSocket bağlantısı oluştur
        this.ws = new WebSocket(wsUrl, null, {
          headers: {
            'Authorization': `Token ${DEEPGRAM_CONFIG.apiKey}`,
          },
        });

        // Bağlantı açıldığında
        this.ws.onopen = () => {
          console.log('✅ Deepgram WebSocket bağlantısı açıldı');
          this.isConnected = true;
          resolve();
        };

        // Mesaj geldiğinde
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Transkript varsa callback'i çağır
            if (data.channel && data.channel.alternatives && data.channel.alternatives.length > 0) {
              const transcript = data.channel.alternatives[0].transcript;
              const isFinal = data.is_final;
              
              if (transcript && transcript.trim() !== '') {
                console.log(`📝 Transkript (${isFinal ? 'final' : 'interim'}):`, transcript);
                if (this.onTranscriptCallback) {
                  this.onTranscriptCallback(transcript, isFinal);
                }
              }
            }
          } catch (error) {
            console.error('WebSocket mesaj parse hatası:', error);
          }
        };

        // Hata oluştuğunda
        this.ws.onerror = (error) => {
          console.error('❌ WebSocket hatası:', error);
          this.isConnected = false;
          if (this.onErrorCallback) {
            this.onErrorCallback(error);
          }
          reject(error);
        };

        // Bağlantı kapandığında
        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket bağlantısı kapandı:', event.code, event.reason);
          this.isConnected = false;
        };

      } catch (error) {
        console.error('WebSocket oluşturma hatası:', error);
        reject(error);
      }
    });
  }

  /**
   * Ses verisini WebSocket üzerinden gönder
   * @param {ArrayBuffer|Blob} audioData - Ses verisi
   */
  send(audioData) {
    if (this.ws && this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(audioData);
    } else {
      console.warn('WebSocket bağlantısı açık değil!');
    }
  }

  /**
   * WebSocket bağlantısını kapat
   */
  close() {
    if (this.ws) {
      console.log('WebSocket bağlantısı kapatılıyor...');
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  /**
   * Bağlantı durumunu kontrol et
   */
  getConnectionStatus() {
    return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let liveTranscriberInstance = null;

/**
 * Live Transcriber instance'ını al
 */
export const getLiveTranscriber = () => {
  if (!liveTranscriberInstance) {
    liveTranscriberInstance = new DeepgramLiveTranscriber();
  }
  return liveTranscriberInstance;
};

