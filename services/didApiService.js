import { AVATAR_CONFIG } from '../config/avatarConfig';

/**
 * D-ID API Service
 * D-ID API ile konuşan avatar oluşturma ve yönetme servisi
 * 
 * API Dokümantasyon: https://docs.d-id.com/
 */

const DID_API_URL = 'https://api.d-id.com';

/**
 * D-ID API'ye istek yapar
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} Response
 */
const didApiFetch = async (endpoint, options = {}) => {
  const url = `${DID_API_URL}${endpoint}`;
  const headers = {
    'Authorization': `Basic ${AVATAR_CONFIG.didApiKey}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    console.log(`🎭 D-ID API Request: ${endpoint}`);
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ D-ID API Error:', response.status, errorData);
      throw new Error(
        errorData.message || `D-ID API Error: ${response.status}`
      );
    }

    return response;
  } catch (error) {
    console.error('❌ D-ID API Request Failed:', error);
    throw error;
  }
};

/**
 * Text-to-Avatar: Metin ve avatar ile konuşan video oluşturur
 * @param {string} text - Konuşulacak metin
 * @param {string} avatarUrl - Avatar görsel URL'i
 * @param {Object} options - Ek seçenekler
 * @returns {Promise<Object>} Video bilgileri (talk_id, video_url)
 */
export const createTalkFromText = async (text, avatarUrl, options = {}) => {
  try {
    console.log('🎬 Creating talk from text...');
    console.log('📝 Text:', text.substring(0, 50) + '...');
    console.log('🖼️ Avatar:', avatarUrl);

    const requestBody = {
      source_url: avatarUrl,
      script: {
        type: 'text',
        input: text,
        provider: {
          type: 'microsoft',
          voice_id: options.voiceId || 'en-US-JennyNeural',
        },
      },
      config: {
        fluent: true,
        pad_audio: 0.0,
        stitch: true,
      },
    };

    const response = await didApiFetch('/talks', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('✅ Talk created:', data.id);

    return {
      talkId: data.id,
      status: 'created',
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('❌ Failed to create talk from text:', error);
    throw new Error('Avatar konuşma oluşturulamadı: ' + error.message);
  }
};

/**
 * Audio-to-Avatar: Deepgram TTS ses dosyası ile konuşan video oluşturur
 * D-ID Talks API: https://docs.d-id.com/reference/talks-1
 * 
 * @param {string} audioBase64 - Base64 encoded audio (WAV format)
 * @param {string} avatarUrl - Avatar görsel URL'i (source_url)
 * @returns {Promise<Object>} Video bilgileri
 */
export const createTalkFromAudio = async (audioBase64, avatarUrl) => {
  try {
    console.log('🎬 Creating talk from audio (D-ID Talks API)...');
    console.log('🔊 Audio size:', audioBase64.length, 'chars');
    console.log('🖼️ Avatar:', avatarUrl);

    // D-ID Talks API format (resmi dokümantasyona göre)
    // Ref: https://docs.d-id.com/reference/talks-1
    const requestBody = {
      source_url: avatarUrl,
      script: {
        type: 'audio',
        audio_url: `data:audio/wav;base64,${audioBase64}`, // D-ID data URL formatı bekliyor
      },
      config: {
        fluent: true,
        pad_audio: 0.0,
        stitch: true,
        driver_expressions: {
          expressions: [],
        },
      },
    };

    console.log('📤 Sending request to D-ID Talks API...');
    console.log('📍 Endpoint: POST /talks');
    
    const response = await didApiFetch('/talks', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('✅ Talk created successfully!');
    console.log('📝 Talk ID:', data.id);
    console.log('⏱️ Status:', data.status);

    return {
      talkId: data.id,
      status: data.status || 'created',
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('❌ Failed to create talk from audio:', error);
    throw new Error('Avatar konuşma oluşturulamadı (audio): ' + error.message);
  }
};

/**
 * Talk durumunu kontrol eder ve video URL'ini döner
 * D-ID Get Talk API: https://docs.d-id.com/reference/get-a-specific-talk
 * 
 * @param {string} talkId - Talk ID
 * @returns {Promise<Object>} Talk status ve video URL
 */
export const getTalkStatus = async (talkId) => {
  try {
    console.log(`📊 Checking talk status: ${talkId}`);
    
    const response = await didApiFetch(`/talks/${talkId}`, {
      method: 'GET',
    });

    const data = await response.json();
    
    console.log(`📈 Status: ${data.status}`);
    
    // D-ID status değerleri: created, started, done, error
    return {
      talkId: data.id,
      status: data.status,
      videoUrl: data.result_url, // Video hazır olduğunda dolu
      duration: data.duration,
      error: data.error,
      createdAt: data.created_at,
      startedAt: data.started_at,
    };
  } catch (error) {
    console.error('❌ Failed to get talk status:', error);
    throw error;
  }
};

/**
 * Talk'ı bekle ve video URL'ini döner (polling)
 * @param {string} talkId - Talk ID
 * @param {number} maxRetries - Maksimum deneme sayısı
 * @param {number} interval - Polling aralığı (ms)
 * @returns {Promise<string>} Video URL
 */
export const waitForTalkCompletion = async (
  talkId,
  maxRetries = 60,
  interval = 2000
) => {
  console.log(`⏳ Waiting for talk completion: ${talkId}`);

  for (let i = 0; i < maxRetries; i++) {
    const status = await getTalkStatus(talkId);

    if (status.status === 'done') {
      console.log('✅ Talk completed!');
      return status.videoUrl;
    }

    if (status.status === 'error') {
      throw new Error(`Talk failed: ${status.error}`);
    }

    console.log(`⏳ Still processing... (${i + 1}/${maxRetries})`);
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error('Talk timeout: Video hazırlanamadı');
};

/**
 * Talk'ı sil
 * @param {string} talkId - Talk ID
 */
export const deleteTalk = async (talkId) => {
  try {
    await didApiFetch(`/talks/${talkId}`, {
      method: 'DELETE',
    });
    console.log(`🗑️ Talk deleted: ${talkId}`);
  } catch (error) {
    console.warn('⚠️ Failed to delete talk:', error);
  }
};

/**
 * Deepgram TTS + D-ID Talks entegrasyonu: Text-to-Avatar Pipeline
 * Deepgram TTS audio → D-ID Talks API → Avatar video
 * 
 * @param {string} text - Konuşulacak metin (metadata için)
 * @param {string} avatarUrl - Avatar görsel URL'i (source_url)
 * @param {string} deepgramAudioBase64 - Deepgram TTS'den alınan base64 audio
 * @returns {Promise<string>} Video URL
 */
export const textToAvatarWithDeepgram = async (
  text,
  avatarUrl,
  deepgramAudioBase64
) => {
  try {
    console.log('🎭 Starting Deepgram → D-ID Pipeline...');
    console.log('📚 Using D-ID Talks API: https://docs.d-id.com/reference/talks-1');

    // 1. D-ID Talks API ile talk oluştur (Deepgram audio ile)
    const talk = await createTalkFromAudio(deepgramAudioBase64, avatarUrl);

    // 2. Video hazır olana kadar bekle (polling)
    const videoUrl = await waitForTalkCompletion(talk.talkId);

    console.log('✅ Avatar video ready!');
    console.log('🎥 Video URL:', videoUrl);
    
    return videoUrl;
  } catch (error) {
    console.error('❌ Deepgram → D-ID pipeline failed:', error);
    throw error;
  }
};

/**
 * Real-time Streaming için WebRTC bağlantısı oluşturur
 * @param {string} avatarUrl - Avatar görsel URL'i
 * @returns {Promise<Object>} Stream bilgileri (sessionId, offer, ice_servers)
 */
export const createStreamingSession = async (avatarUrl) => {
  try {
    console.log('🌐 Creating D-ID streaming session...');

    const requestBody = {
      source_url: avatarUrl,
      config: {
        fluent: true,
        pad_audio: 0.0,
      },
    };

    const response = await didApiFetch('/talks/streams', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('✅ Streaming session created:', data.id);

    return {
      sessionId: data.id,
      offer: data.offer,
      iceServers: data.ice_servers,
      sessionKey: data.session_key,
    };
  } catch (error) {
    console.error('❌ Failed to create streaming session:', error);
    throw error;
  }
};

/**
 * Streaming session'a SDP answer gönderir
 * @param {string} sessionId - Session ID
 * @param {Object} answer - WebRTC SDP answer
 */
export const sendStreamAnswer = async (sessionId, answer) => {
  try {
    await didApiFetch(`/talks/streams/${sessionId}/sdp`, {
      method: 'POST',
      body: JSON.stringify({
        answer,
        session_id: sessionId,
      }),
    });
    console.log('✅ SDP answer sent');
  } catch (error) {
    console.error('❌ Failed to send SDP answer:', error);
    throw error;
  }
};

/**
 * Streaming session'a ICE candidate gönderir
 * @param {string} sessionId - Session ID
 * @param {Object} candidate - ICE candidate
 */
export const sendIceCandidate = async (sessionId, candidate) => {
  try {
    await didApiFetch(`/talks/streams/${sessionId}/ice`, {
      method: 'POST',
      body: JSON.stringify({
        candidate,
        session_id: sessionId,
      }),
    });
  } catch (error) {
    console.warn('⚠️ Failed to send ICE candidate:', error);
  }
};

/**
 * Streaming session'ı sonlandırır
 * @param {string} sessionId - Session ID
 */
export const closeStreamingSession = async (sessionId) => {
  try {
    await didApiFetch(`/talks/streams/${sessionId}`, {
      method: 'DELETE',
    });
    console.log('🔌 Streaming session closed');
  } catch (error) {
    console.warn('⚠️ Failed to close streaming session:', error);
  }
};

export default {
  createTalkFromText,
  createTalkFromAudio,
  getTalkStatus,
  waitForTalkCompletion,
  deleteTalk,
  textToAvatarWithDeepgram,
  createStreamingSession,
  sendStreamAnswer,
  sendIceCandidate,
  closeStreamingSession,
};

