/**
 * HeyGen API Service
 * 
 * Bu servis, HeyGen API'si ile talking avatar videoları oluşturur.
 * Deepgram TTS ile üretilen ses dosyalarını kullanarak lip-sync video üretir.
 * 
 * HeyGen API Dökümantasyonu:
 * https://docs.heygen.com/docs/quick-start
 * https://docs.heygen.com/reference/create-video
 * 
 * @module services/heygenApiService
 */

import { AVATAR_CONFIG } from '../config/avatarConfig';

// HeyGen API Base URL
const HEYGEN_API_BASE = 'https://api.heygen.com';

/**
 * HeyGen API'sine istek gönderen yardımcı fonksiyon
 * @param {string} endpoint - API endpoint'i (örn: '/v2/video/generate')
 * @param {object} options - Fetch options
 * @returns {Promise<object>} API response
 */
const heygenApiFetch = async (endpoint, options = {}) => {
  const apiKey = AVATAR_CONFIG.heygenApiKey;

  if (!apiKey) {
    throw new Error('HeyGen API key bulunamadı! config/avatarConfig.js dosyasını kontrol edin.');
  }

  const url = `${HEYGEN_API_BASE}${endpoint}`;
  
  const defaultHeaders = {
    'X-Api-Key': apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ HeyGen API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: data,
      endpoint,
    });
    throw new Error(`HeyGen API Error: ${response.status} - ${data.message || data.error || 'Unknown error'}`);
  }

  return data;
};

/**
 * HeyGen'den mevcut avatarları listeler
 * @returns {Promise<Array>} Avatar listesi
 */
export const listHeygenAvatars = async () => {
  try {
    console.log('📋 Fetching HeyGen avatars...');
    const response = await heygenApiFetch('/v2/avatars', {
      method: 'GET',
    });
    console.log('✅ HeyGen avatars fetched:', response.data?.avatars?.length || 0);
    return response.data?.avatars || [];
  } catch (error) {
    console.error('❌ Error fetching HeyGen avatars:', error);
    throw error;
  }
};

/**
 * HeyGen'den mevcut sesleri listeler
 * @returns {Promise<Array>} Ses listesi
 */
export const listHeygenVoices = async () => {
  try {
    console.log('📋 Fetching HeyGen voices...');
    const response = await heygenApiFetch('/v2/voices', {
      method: 'GET',
    });
    console.log('✅ HeyGen voices fetched:', response.data?.voices?.length || 0);
    return response.data?.voices || [];
  } catch (error) {
    console.error('❌ Error fetching HeyGen voices:', error);
    throw error;
  }
};

/**
 * Ses URL'si ile HeyGen video oluşturur
 * @param {string} audioUrl - Ses dosyasının public URL'si (Deepgram TTS output)
 * @param {string} avatarId - HeyGen avatar ID'si
 * @param {object} options - Ek video ayarları
 * @returns {Promise<string>} Video ID
 */
export const createVideoFromAudio = async (
  audioUrl,
  avatarId,
  options = {}
) => {
  try {
    console.log('🎬 Creating HeyGen video from audio...');
    console.log('📊 Request details:', {
      avatarId,
      audioUrl: audioUrl.substring(0, 50) + '...',
      options,
    });

    const requestBody = {
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: avatarId,
            avatar_style: options.avatarStyle || 'normal',
          },
          voice: {
            type: 'audio',
            audio_url: audioUrl, // ✅ HeyGen docs: audio_url kullanılmalı
          },
          background: {
            type: 'color',
            value: options.backgroundColor || '#FFFFFF',
          },
        },
      ],
      dimension: {
        width: options.width || 1280,
        height: options.height || 720,
      },
      test: options.test || false, // Test mode (watermark ekler, credit harcamaz)
      aspect_ratio: options.aspectRatio || null,
    };

    const response = await heygenApiFetch('/v2/video/generate', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    console.log('✅ HeyGen video creation started:', response.data?.video_id);
    return response.data?.video_id;
  } catch (error) {
    console.error('❌ Error creating HeyGen video:', error);
    throw error;
  }
};

/**
 * Metin ile HeyGen video oluşturur (HeyGen TTS kullanır)
 * ⚠️ NOT: Biz Deepgram TTS kullanacağız, bu fonksiyon opsiyonel
 * @param {string} text - Konuşma metni
 * @param {string} avatarId - HeyGen avatar ID'si
 * @param {string} voiceId - HeyGen voice ID'si
 * @param {object} options - Ek video ayarları
 * @returns {Promise<string>} Video ID
 */
export const createVideoFromText = async (
  text,
  avatarId,
  voiceId,
  options = {}
) => {
  try {
    console.log('🎬 Creating HeyGen video from text...');
    console.log('📊 Request details:', {
      avatarId,
      voiceId,
      textLength: text.length,
    });

    const requestBody = {
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: avatarId,
            avatar_style: options.avatarStyle || 'normal',
          },
          voice: {
            type: 'text',
            input_text: text,
            voice_id: voiceId,
          },
          background: {
            type: 'color',
            value: options.backgroundColor || '#FFFFFF',
          },
        },
      ],
      dimension: {
        width: options.width || 1280,
        height: options.height || 720,
      },
      test: options.test || false,
    };

    const response = await heygenApiFetch('/v2/video/generate', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    console.log('✅ HeyGen video creation started:', response.data?.video_id);
    return response.data?.video_id;
  } catch (error) {
    console.error('❌ Error creating HeyGen video:', error);
    throw error;
  }
};

/**
 * Video oluşturma durumunu kontrol eder
 * @param {string} videoId - HeyGen video ID'si
 * @returns {Promise<object>} Video durumu
 */
export const getVideoStatus = async (videoId) => {
  try {
    console.log(`📊 Checking HeyGen video status: ${videoId}`);
    const response = await heygenApiFetch(`/v1/video_status.get?video_id=${videoId}`, {
      method: 'GET',
    });
    console.log('✅ Video status:', response.data?.status);
    return response.data;
  } catch (error) {
    console.error('❌ Error getting video status:', error);
    throw error;
  }
};

/**
 * Video tamamlanana kadar bekler (polling)
 * @param {string} videoId - HeyGen video ID'si
 * @param {number} maxAttempts - Maksimum kontrol sayısı
 * @param {number} intervalMs - Kontroller arası bekleme süresi (ms)
 * @returns {Promise<string>} Video URL'si
 */
export const waitForVideoCompletion = async (
  videoId,
  maxAttempts = 60,
  intervalMs = 3000
) => {
  console.log(`⏳ Waiting for HeyGen video completion: ${videoId}`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const status = await getVideoStatus(videoId);
      
      console.log(`🔄 Attempt ${attempt}/${maxAttempts} - Status: ${status.status}`);

      if (status.status === 'completed') {
        console.log('✅ Video completed!', status.video_url);
        return status.video_url;
      }

      if (status.status === 'failed') {
        throw new Error(`Video generation failed: ${status.error || 'Unknown error'}`);
      }

      // Video hala işleniyor, bekle
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    } catch (error) {
      console.error(`❌ Error on attempt ${attempt}:`, error);
      if (attempt === maxAttempts) {
        throw new Error(`Video completion timeout after ${maxAttempts} attempts`);
      }
    }
  }

  throw new Error('Video completion timeout');
};

/**
 * Text-to-Avatar pipeline
 * HeyGen TTS VEYA Deepgram TTS + HeyGen Lip-sync
 * @param {string} text - Konuşma metni
 * @param {string} avatarId - HeyGen avatar ID'si
 * @param {string|null} audioUrl - (Opsiyonel) Ses URL'si. Null ise HeyGen TTS kullanılır
 * @param {string|null} voiceId - (Opsiyonel) HeyGen voice ID (text mode için)
 * @returns {Promise<string>} Video URL'si
 */
export const textToAvatarWithHeyGen = async (text, avatarId, audioUrl = null, voiceId = null) => {
  try {
    console.log('🎯 Starting Text-to-Avatar pipeline with HeyGen...');
    console.log('📝 Text:', text.substring(0, 50) + '...');
    console.log('👤 Avatar ID:', avatarId);

    let videoId;

    if (audioUrl) {
      // Audio mode: Deepgram TTS veya başka bir ses kaynağı
      console.log('🔊 Mode: Audio (Deepgram TTS)');
      console.log('🔊 Audio URL:', audioUrl.substring(0, 50) + '...');
      
      videoId = await createVideoFromAudio(audioUrl, avatarId, {
        test: false, // Production mode
        width: 1280,
        height: 720,
        backgroundColor: '#F5F5F5',
      });
    } else {
      // Text mode: HeyGen TTS kullan
      console.log('📝 Mode: Text (HeyGen TTS)');
      const defaultVoiceId = voiceId || '2d5b0e6cf36f460aa7fc47e3eee4ba54';
      console.log('🔊 Voice ID:', defaultVoiceId);
      
      videoId = await createVideoFromText(text, avatarId, defaultVoiceId, {
        test: false,
        width: 1280,
        height: 720,
        backgroundColor: '#F5F5F5',
      });
    }

    // Video tamamlanana kadar bekle
    const videoUrl = await waitForVideoCompletion(videoId);

    console.log('✅ Text-to-Avatar completed!');
    console.log('🎥 Video URL:', videoUrl);

    return videoUrl;
  } catch (error) {
    console.error('❌ Text-to-Avatar pipeline failed:', error);
    throw error;
  }
};

export default {
  listHeygenAvatars,
  listHeygenVoices,
  createVideoFromAudio,
  createVideoFromText,
  getVideoStatus,
  waitForVideoCompletion,
  textToAvatarWithHeyGen,
};

