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

  let data;
  try {
    data = await response.json();
  } catch (jsonError) {
    // JSON parse hatası - response text olabilir
    const text = await response.text();
    console.error('❌ HeyGen API Response (not JSON):', text);
    if (!response.ok) {
      throw new Error(`HeyGen API Error: ${response.status} - ${text || response.statusText}`);
    }
    return { data: text, raw: true };
  }

  if (!response.ok) {
    console.error('❌ HeyGen API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: data,
      endpoint,
    });
    const errorMsg = data.message || data.error || data.error?.message || 'Unknown error';
    throw new Error(`HeyGen API Error: ${response.status} - ${errorMsg}`);
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
    
    // Hem v1 hem v2 endpoint'lerini dene
    let response;
    try {
      // v2 endpoint'i dene (yeni API)
      response = await heygenApiFetch(`/v2/videos/${videoId}`, {
        method: 'GET',
      });
      console.log('✅ v2 endpoint success');
    } catch (v2Error) {
      // v2 başarısız olursa v1 dene (eski API)
      console.log('⚠️ v2 endpoint failed, trying v1...');
      try {
        response = await heygenApiFetch(`/v1/video_status.get?video_id=${videoId}`, {
          method: 'GET',
        });
        console.log('✅ v1 endpoint success');
      } catch (v1Error) {
        // v1 de başarısız olursa, video download endpoint'ini dene
        console.log('⚠️ v1 endpoint failed, trying download endpoint...');
        try {
          response = await heygenApiFetch(`/v1/videos/${videoId}/download`, {
      method: 'GET',
    });
          console.log('✅ Download endpoint response received');
        } catch (downloadError) {
          throw v2Error; // Orijinal v2 hatasını fırlat
        }
      }
    }
    
    const statusData = response.data || response;
    
    // Detaylı log - gerçek response formatını görmek için
    console.log('✅ Video status response (full):', JSON.stringify(statusData, null, 2));
    
    const detectedStatus = statusData.status || statusData.data?.status || statusData.video?.status || statusData.state || 'unknown';
    
    // Tüm olası URL field'larını kontrol et
    const detectedUrl = statusData.video_url || 
                       statusData.video?.video_url || 
                       statusData.video_urls?.mp4 ||
                       statusData.video_urls?.['mp4'] ||
                       statusData.url || 
                       statusData.videoUrl ||
                       statusData.video_url_mp4 ||
                       statusData.result_url ||
                       statusData.download_url ||
                       (statusData.data && (statusData.data.video_url || statusData.data.url || statusData.data.videoUrl || statusData.data.result_url));
    
    console.log(`✅ Video status: ${detectedStatus}`);
    if (detectedUrl) {
      console.log(`   📹 Video URL detected: ${detectedUrl.substring(0, 80)}...`);
      
      // Eğer web sayfası URL'i ise, direkt MP4 URL'ine çevirmeyi dene
      if (detectedUrl.includes('app.heygen.com/videos/')) {
        console.log('⚠️ Web page URL detected, need direct MP4 URL');
      }
    }
    
    return statusData;
  } catch (error) {
    console.error('❌ Error getting video status:', error);
    // Hata durumunda da response'u kontrol et
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
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
  maxAttempts = 120, // 120 * 2s = 240 saniye = 4 dakika max
  intervalMs = 2000 // 2 saniye aralık (hızlı kontrol)
) => {
  console.log(`⏳ Waiting for HeyGen video completion: ${videoId}`);
  console.log(`⏱️ Will check up to ${maxAttempts} times (~${Math.round((maxAttempts * intervalMs) / 1000)} seconds = ~${Math.round((maxAttempts * intervalMs) / 1000 / 60)} minutes max)`);
  console.log(`⏱️ Video hazır olunca HEMEN dönecek - bekleme yok!`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const status = await getVideoStatus(videoId);
      
      // Status farklı formatlarda olabilir - tüm olasılıkları kontrol et
      const videoStatus = status.status || status.data?.status || status.video?.status || status.state;
      
      // Tüm olası URL field'larını kontrol et
      let videoUrl = status.video_url || 
                    status.video?.video_url || 
                    status.video_urls?.mp4 ||
                    status.video_urls?.['mp4'] ||
                    status.url ||
                    status.videoUrl ||
                    status.video_url_mp4 ||
                    status.result_url ||
                    status.download_url ||
                    (status.data && (status.data.video_url || status.data.url || status.data.videoUrl || status.data.result_url));

      // Eğer web sayfası URL'i ise, direkt MP4 URL'ini bulmaya çalış
      if (videoUrl && videoUrl.includes('app.heygen.com/videos/')) {
        console.log('⚠️ Web page URL detected - this cannot be used by Video component');
        console.log('💡 Need direct MP4 URL from HeyGen API response');
        console.log('📋 Full status response keys:', Object.keys(status));
        
        // Response'daki tüm nested field'ları kontrol et
        const allKeys = [];
        const checkNested = (obj, prefix = '') => {
          if (typeof obj === 'object' && obj !== null) {
            Object.keys(obj).forEach(key => {
              const fullKey = prefix ? `${prefix}.${key}` : key;
              allKeys.push(fullKey);
              if (typeof obj[key] === 'object' && obj[key] !== null) {
                checkNested(obj[key], fullKey);
              }
            });
          }
        };
        checkNested(status);
        console.log('📋 All response keys:', allKeys);
        
        // videoUrl, download_url, result_url gibi field'ları kontrol et (daha geniş kontrol)
        const possibleUrlFields = [
          'video_url', 'download_url', 'result_url', 'url', 'videoUrl', 
          'mp4_url', 'video_mp4_url', 'video_file_url', 'video_download_url',
          'file_url', 'video_file', 'mp4', 'video_mp4', 'direct_url'
        ];
        
        // Tüm nested objeleri kontrol et
        const checkAllFields = (obj, path = '') => {
          if (!obj || typeof obj !== 'object') return null;
          
          for (const key in obj) {
            const value = obj[key];
            const fullPath = path ? `${path}.${key}` : key;
            
            // Eğer string bir URL ise ve MP4/CDN içeriyorsa
            if (typeof value === 'string' && value.startsWith('http')) {
              if (value.includes('.mp4') || value.includes('cloudfront') || value.includes('cdn') || 
                  value.includes('s3.amazonaws.com') || value.includes('amazonaws.com')) {
                console.log(`✅ Found direct MP4 URL at '${fullPath}':`, value);
                return value;
              }
            }
            
            // Nested object'leri de kontrol et
            if (typeof value === 'object' && value !== null) {
              const nestedResult = checkAllFields(value, fullPath);
              if (nestedResult) return nestedResult;
            }
          }
          return null;
        };
        
        // Önce bilinen field'larda ara
        let foundDirectUrl = null;
        for (const field of possibleUrlFields) {
          const value = status[field] || status.data?.[field] || status.video?.[field];
          if (value && typeof value === 'string' && value.startsWith('http')) {
            if (value.includes('.mp4') || value.includes('cloudfront') || value.includes('cdn') || 
                value.includes('s3') || value.includes('amazonaws')) {
              console.log(`✅ Found direct MP4 URL in field '${field}':`, value);
              foundDirectUrl = value;
              break;
            }
          }
        }
        
        // Bulunamazsa tüm response'u tarama yap
        if (!foundDirectUrl) {
          console.log('🔍 Searching entire response for MP4/CDN URL...');
          foundDirectUrl = checkAllFields(status);
        }
        
        if (foundDirectUrl) {
          videoUrl = foundDirectUrl;
        } else if (videoUrl && videoUrl.includes('app.heygen.com/videos/')) {
          // Direkt MP4 URL bulunamadı, sadece web URL var
          // Web URL'i Video component oynatamaz - API'den direkt MP4 URL bekle
          console.log('⚠️ Only web page URL found - Video component cannot play this');
          console.log('💡 Waiting for API to return direct MP4 URL...');
          console.log('❌ Web URL cannot be used - need direct MP4/CDN URL');
          videoUrl = null; // Web URL'i kullanma, API'den direkt MP4 URL bekle
        }
      }

      console.log(`🔄 Attempt ${attempt}/${maxAttempts} - Status: ${videoStatus || 'unknown'}`);
      if (videoUrl) {
        console.log(`   📹 Video URL found: ${videoUrl.substring(0, 80)}...`);
        // MP4 URL kontrolü
        if (videoUrl.includes('.mp4') || videoUrl.includes('cloudfront.net') || videoUrl.includes('cdn')) {
          console.log('✅ Direct MP4/CDN URL detected');
        }
      } else {
        console.log('   ⚠️ No direct video URL in response');
      }
      
      // Tamamlanmış durumlar (farklı formatlar için) - HEMEN DÖNDÜR
      if (videoStatus === 'completed' || videoStatus === 'done' || videoStatus === 'success' || videoStatus === 'ready' || videoStatus === 'finished') {
        if (videoUrl && !videoUrl.includes('app.heygen.com/videos/')) {
          // Direkt MP4/CDN URL varsa HEMEN döndür
          console.log('✅✅✅ Video completed with MP4 URL - RETURNING IMMEDIATELY!');
          console.log('📹 Video URL:', videoUrl);
          return videoUrl;
        }
        // Web URL varsa ama direkt MP4 yoksa, birkaç deneme daha yap
        if (videoUrl && videoUrl.includes('app.heygen.com/videos/')) {
          console.log('⚠️ Status completed but only web URL available');
          console.log('💡 Waiting for API to return direct MP4 URL...');
          // Birkaç deneme daha yap, belki direkt MP4 URL gelir
        }
      }
      
      // Eğer direkt MP4/CDN URL varsa, status ne olursa olsun HEMEN kullan (bekleme yok!)
      if (videoUrl && (videoUrl.includes('.mp4') || videoUrl.includes('cloudfront.net') || videoUrl.includes('cdn') || videoUrl.includes('s3') || videoUrl.includes('amazonaws.com'))) {
        // Direkt MP4/CDN URL bulundu, HEMEN döndür
        console.log('✅✅✅ Direct MP4/CDN URL detected - RETURNING IMMEDIATELY!');
        console.log('📹 Video URL:', videoUrl);
        return videoUrl;
      }
      
      // Web sayfası URL'i ise, direkt kullan - bu HeyGen'in doğru formatı
      if (videoUrl && videoUrl.includes('app.heygen.com/videos/')) {
        console.log('✅ HeyGen web URL - using directly');
        // Web URL'i direkt kullan - Video component bunu oynatabilir
      }

      // Başarısız durumlar
      if (videoStatus === 'failed' || videoStatus === 'error' || videoStatus === 'failure') {
        // Hata detaylarını parse et
        const errorDetail = status.error || status.message || status.data?.error || status.error_detail || {};
        const errorCode = errorDetail.code || status.error_code;
        const errorMessage = errorDetail.message || errorDetail.detail || errorDetail.message || 'Unknown error';
        
        console.error('❌ Video generation failed:', {
          code: errorCode,
          message: errorMessage,
          fullError: errorDetail
        });
        
        // Özel hata mesajları
        let userFriendlyMessage = 'Video oluşturulamadı';
        
        if (errorCode === 'MOVIO_PAYMENT_INSUFFICIENT_CREDIT' || 
            errorMessage.includes('Insufficient credit') ||
            errorMessage.includes('insufficient credit')) {
          userFriendlyMessage = 'HeyGen hesabınızda yetersiz kredi var. Lütfen hesabınıza kredi ekleyin.';
        } else if (errorCode === 'MOVIO_PAYMENT_REQUIRED' || 
                   errorMessage.includes('Payment required')) {
          userFriendlyMessage = 'HeyGen hesabınız için ödeme gerekli. Lütfen hesabınızı kontrol edin.';
        } else if (errorMessage) {
          userFriendlyMessage = `Video oluşturulamadı: ${errorMessage}`;
        }
        
        const error = new Error(userFriendlyMessage);
        error.code = errorCode;
        error.originalError = errorDetail;
        throw error;
      }

      // Video URL varsa ama status hala processing ise, URL tipine göre karar ver
      // Direkt MP4/CDN URL ise HEMEN kullan (bekleme yok!)
      if (videoUrl && (videoUrl.includes('.mp4') || videoUrl.includes('cloudfront.net') || videoUrl.includes('cdn') || videoUrl.includes('s3') || videoUrl.includes('amazonaws.com'))) {
        // Direkt MP4 URL bulundu, status ne olursa olsun HEMEN döndür
        console.log('✅✅✅ Direct MP4/CDN URL detected (status: ' + (videoStatus || 'unknown') + ') - RETURNING IMMEDIATELY!');
        console.log('📹 Video URL:', videoUrl);
        console.log('💡 Video hazır - bekleme yok, hemen yansıtılıyor!');
        return videoUrl;
      }
      
      // Web sayfası URL'i ise, direkt kullanma - Video component oynatamaz
      if (videoUrl && videoUrl.includes('app.heygen.com/videos/')) {
        console.log('⚠️ Web page URL detected - Video component cannot play this');
        console.log('💡 Need direct MP4/CDN URL from HeyGen API');
        // Web URL'i null yap, API'den direkt MP4 URL bekle
        videoUrl = null;
      }

      // Video hala işleniyor, bekle
      // Log aralıkları - 120 deneme için optimize
      const logInterval = attempt <= 40 ? 5 : 10; // İlk 40'da her 5, sonra her 10 denemede
      if (attempt % logInterval === 0 || attempt === 1) {
        const elapsedSeconds = Math.round((attempt * intervalMs) / 1000);
        const timeStr = `${elapsedSeconds}s`;
        console.log(`⏳ Still processing... (attempt ${attempt}/${maxAttempts}, ~${timeStr} elapsed)`);
        if (!videoUrl) {
          console.log(`   💡 Waiting for video URL... (if email arrived, video is ready)`);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      
    } catch (error) {
      console.error(`❌ Error on attempt ${attempt}:`, error);
      
      // Son denemelerde API response'unu tekrar kontrol et
      if (attempt >= maxAttempts - 5) {
        const elapsedSeconds = Math.round((attempt * intervalMs) / 1000);
        console.log(`⚠️ Approaching max attempts (${attempt}/${maxAttempts}, ~${elapsedSeconds}s elapsed)`);
        console.log('💡 Last attempts - checking API response for direct MP4 URL...');
        console.log('📋 Please check console for full API response - look for video_url, download_url, or result_url fields');
      }
      
      // Maksimum deneme sayısına ulaşıldığında web URL'i döndür (fallback)
      if (attempt === maxAttempts) {
        const elapsedSeconds = Math.round((maxAttempts * intervalMs) / 1000);
        console.log(`⚠️ Max attempts reached (${maxAttempts} attempts, ~${elapsedSeconds}s = ~${Math.round(elapsedSeconds / 60)} minutes elapsed)`);
        
        // Son denemede status'u tekrar kontrol et
        try {
          const lastStatus = await getVideoStatus(videoId);
          const lastVideoUrl = lastStatus.video_url || lastStatus.video?.video_url || lastStatus.url || lastStatus.data?.video_url || lastStatus.data?.url;
          
          if (lastVideoUrl) {
            console.log(`✅ Found video URL in last attempt: ${lastVideoUrl}`);
            console.log('📹 Returning URL (web URL format is correct for HeyGen)');
            return lastVideoUrl;
          }
        } catch (lastError) {
          console.error('❌ Error in last status check:', lastError);
        }
        
        // Fallback: Video ID'den web URL'i oluştur
        const fallbackUrl = `https://app.heygen.com/videos/${videoId}`;
        console.log(`💡 Using fallback web URL: ${fallbackUrl}`);
        console.log('📹 This is the correct HeyGen video URL format');
        return fallbackUrl;
      }
      
      // Hata durumunda da devam et (network hataları geçici olabilir)
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  // Son çare: Hata fırlat - web URL Video component tarafından oynatılamaz
  console.log('❌ Polling completed but no direct MP4 URL found');
  console.log(`💡 HeyGen API'den direkt MP4/CDN URL'i alınamadı`);
  console.log(`⚠️ Web URL (app.heygen.com/videos/...) Video component tarafından oynatılamaz`);
  console.log(`💡 Lütfen HeyGen API response'unu kontrol edin - video_url, download_url veya result_url field'ında direkt MP4 URL'i olmalı`);
  throw new Error(`HeyGen API'den direkt MP4 URL'i alınamadı. Web URL'leri Video component tarafından oynatılamaz. Lütfen API response'unu kontrol edin (console log'larına bakın).`);
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

    // Video tamamlanana kadar bekle (90 deneme, 2s aralık = 180 saniye = 3 dakika max, ama video hazır olunca HEMEN döner)
    const videoUrl = await waitForVideoCompletion(videoId, 120, 2000);

    console.log('✅ Text-to-Avatar completed!');
    console.log('🎥 Video URL:', videoUrl);
    console.log('🆔 Video ID:', videoId);

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

