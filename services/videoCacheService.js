/**
 * Video Cache Service
 * Oluşturulan videoları cache'ler ve tekrar kullanır
 * 
 * Cache yapısı:
 * - data/videos/{hash}.json -> Video metadata (URL, text, timestamp)
 * - Cache key: cümle + avatarId hash'i
 */

import * as FileSystem from 'expo-file-system/legacy';
import { hashText } from './avatarTTSService';
import { Platform } from 'react-native';

// Cache dosyaları kalıcı bellek dizinine kaydedilir (documentDirectory)
// ✅ BU KLASÖR UYGULAMA KAPANSA BİLE KALICIDIR!
// ✅ Uygulama silinmediği sürece cache dosyaları durur
// ✅ documentDirectory: Kalıcı dosyalar için kullanılır (uygulama data'sı)
// 
// Cache yolu: {documentDirectory}data/videos/
// Android: /data/user/0/com.appname/files/data/videos/
// iOS: /var/mobile/Containers/Data/Application/{UUID}/Documents/data/videos/
const getCacheDir = () => {
  // documentDirectory = Kalıcı dosyalar için (uygulama silinmedikçe dosyalar durur)
  // cacheDirectory = Geçici dosyalar için (işletim sistemi silebilir)
  // Biz kalıcı cache istiyoruz, o yüzden documentDirectory kullanıyoruz
  return `${FileSystem.documentDirectory}data/videos/`;
};

const CACHE_DIR = getCacheDir();
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 gün (ms)

// Cache dizin yolunu log'la (debug için)
console.log('📁 Cache dizini:', CACHE_DIR);
console.log('📁 Document Directory:', FileSystem.documentDirectory);

/**
 * Cache klasörünü oluşturur
 */
export const ensureCacheDir = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      console.log('✅ Cache klasörü oluşturuldu:', CACHE_DIR);
    }
  } catch (error) {
    console.error('❌ Cache klasörü oluşturulamadı:', error);
    throw error;
  }
};

/**
 * Cache key oluşturur (cümle + avatarId)
 */
export const getCacheKey = (text, avatarId) => {
  const combined = `${text}_${avatarId}`;
  return hashText(combined);
};

/**
 * Video cache dosyası path'ini döndürür
 */
export const getCacheFilePath = (cacheKey) => {
  return `${CACHE_DIR}${cacheKey}.json`;
};

/**
 * Video'yu cache'e kaydeder
 */
export const saveVideoToCache = async (text, avatarId, videoUrl, videoId = null) => {
  try {
    // Web sayfası URL'lerini cache'e kaydetme - Video component oynatamaz
    if (videoUrl && videoUrl.includes('app.heygen.com/videos/') && !videoUrl.includes('.mp4')) {
      console.log('⚠️ Web page URL detected - NOT caching (Video component cannot play this)');
      console.log('   URL:', videoUrl);
      console.log('   💡 Waiting for direct MP4 URL before caching...');
      return null; // Cache'e kaydetme
    }
    
    await ensureCacheDir();
    
    const cacheKey = getCacheKey(text, avatarId);
    const cachePath = getCacheFilePath(cacheKey);
    
    const cacheData = {
      text,
      avatarId,
      videoUrl,
      videoId,
      timestamp: new Date().toISOString(),
      cachedAt: Date.now(),
    };
    
    await FileSystem.writeAsStringAsync(
      cachePath,
      JSON.stringify(cacheData, null, 2),
      { encoding: FileSystem.EncodingType.UTF8 }
    );
    
    console.log('✅ Video cache\'e kaydedildi:');
    console.log(`   - Cache Key: ${cacheKey}`);
    console.log(`   - Dosya: ${cachePath}`);
    console.log(`   - Text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    console.log(`   - Avatar ID: ${avatarId}`);
    console.log(`   - Video URL: ${videoUrl?.substring(0, 80)}...`);
    return cacheKey;
  } catch (error) {
    console.error('❌ Video cache\'e kaydedilemedi:', error);
    // Hata olsa bile devam et (cache opsiyonel)
    return null;
  }
};

/**
 * Cache'den video URL'ini alır
 */
export const getVideoFromCache = async (text, avatarId) => {
  try {
    await ensureCacheDir();
    
    const cacheKey = getCacheKey(text, avatarId);
    const cachePath = getCacheFilePath(cacheKey);
    
    // Dosya var mı kontrol et
    const fileInfo = await FileSystem.getInfoAsync(cachePath);
    if (!fileInfo.exists) {
      console.log('📭 Cache\'de video bulunamadı:', cacheKey);
      return null;
    }
    
    // Cache dosyasını oku
    const cacheContent = await FileSystem.readAsStringAsync(cachePath, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    const cacheData = JSON.parse(cacheContent);
    
    // Cache süresi kontrolü
    const cacheAge = Date.now() - cacheData.cachedAt;
    if (cacheAge > CACHE_DURATION) {
      console.log('⏰ Cache süresi dolmuş, siliniyor:', cacheKey);
      await FileSystem.deleteAsync(cachePath, { idempotent: true });
      return null;
    }
    
    // Video URL hala geçerli mi kontrol et (opsiyonel - API'den kontrol edilebilir)
    if (!cacheData.videoUrl) {
      console.log('⚠️ Cache\'de video URL yok:', cacheKey);
      return null;
    }
    
    // Web sayfası URL'i kontrolü - Video component tarafından oynatılamaz
    const videoUrl = cacheData.videoUrl;
    if (videoUrl.includes('app.heygen.com/videos/') && !videoUrl.includes('.mp4')) {
      console.log('⚠️ Cache\'de web sayfası URL\'i var - Video component oynatamaz');
      console.log('🗑️ Hatalı cache siliniyor:', cacheKey);
      await FileSystem.deleteAsync(cachePath, { idempotent: true });
      return null; // Cache'i sil ve null döndür (yeni video oluşturulacak)
    }
    
    console.log('✅ Video cache\'den alındı (KALICI CACHE):', cacheKey);
    console.log('📹 Video URL:', cacheData.videoUrl);
    console.log(`⏱️ Cache yaşı: ~${Math.round(cacheAge / (1000 * 60))} dakika`);
    console.log(`📁 Cache dosyası: ${cachePath}`);
    console.log(`✅ Video tekrar oluşturulmayacak - cache'den hızlı yüklendi!`);
    
    return {
      videoUrl: cacheData.videoUrl,
      videoId: cacheData.videoId,
      cached: true,
      cacheAge: Math.round(cacheAge / (1000 * 60)), // dakika cinsinden
    };
  } catch (error) {
    console.error('❌ Cache\'den video alınamadı:', error);
    return null;
  }
};

/**
 * Cache'i temizler (tüm cache veya belirli bir cache)
 */
export const clearVideoCache = async (cacheKey = null) => {
  try {
    await ensureCacheDir();
    
    if (cacheKey) {
      // Tek bir cache dosyasını sil
      const cachePath = getCacheFilePath(cacheKey);
      await FileSystem.deleteAsync(cachePath, { idempotent: true });
      console.log('🗑️ Cache silindi:', cacheKey);
      return { success: true, deleted: 1 };
    } else {
      // Tüm cache'i sil
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (dirInfo.exists) {
        // Önce dosya sayısını say
        const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        const fileCount = jsonFiles.length;
        
        await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
        console.log(`🗑️ Tüm cache silindi (${fileCount} dosya)`);
        return { success: true, deleted: fileCount };
      }
      return { success: true, deleted: 0 };
    }
  } catch (error) {
    console.error('❌ Cache silinemedi:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Hatalı URL formatlarını içeren cache'leri temizler
 * (CloudFront URL'leri veya geçersiz URL'ler)
 */
export const clearInvalidCache = async () => {
  try {
    await ensureCacheDir();
    
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      return { deleted: 0, invalid: [] };
    }
    
    const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    let deleted = 0;
    const invalid = [];
    
    for (const file of jsonFiles) {
      try {
        const filePath = `${CACHE_DIR}${file}`;
        const content = await FileSystem.readAsStringAsync(filePath, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        const cacheData = JSON.parse(content);
        
        const videoUrl = cacheData.videoUrl || '';
        
        // Hatalı URL formatlarını kontrol et
        // 1. CloudFront URL'leri (hatalı format - yanlış path)
        // 2. Web sayfası URL'leri (Video component tarafından oynatılamaz)
        // 3. Boş veya geçersiz URL'ler
        const isInvalid = 
          !videoUrl || 
          videoUrl.includes('cloudfront.net/videos/') ||
          videoUrl.includes('d1zvd3cikxgcdn') ||
          (videoUrl.includes('app.heygen.com/videos/') && !videoUrl.includes('.mp4')) || // Web URL'i - Video component oynatamaz
          (videoUrl.includes('app.heygen.com/videos/') && videoUrl.includes('/video.mp4')) ||
          videoUrl.trim() === '';
        
        if (isInvalid) {
          await FileSystem.deleteAsync(filePath, { idempotent: true });
          deleted++;
          invalid.push({
            file,
            text: cacheData.text?.substring(0, 50) || 'Unknown',
            videoUrl: videoUrl?.substring(0, 80) || 'No URL',
          });
          console.log(`🗑️ Hatalı cache silindi: ${file}`);
          console.log(`   Text: "${cacheData.text?.substring(0, 50)}"`);
          console.log(`   URL: ${videoUrl?.substring(0, 80)}`);
        }
      } catch (error) {
        // Hatalı JSON dosyasını sil
        try {
          await FileSystem.deleteAsync(`${CACHE_DIR}${file}`, { idempotent: true });
          deleted++;
          invalid.push({ file, text: 'Invalid JSON', videoUrl: 'Parse Error' });
          console.log(`🗑️ Hatalı JSON dosyası silindi: ${file}`);
        } catch (deleteError) {
          console.error(`❌ Dosya silinemedi: ${file}`, deleteError);
        }
      }
    }
    
    if (deleted > 0) {
      console.log(`🧹 ${deleted} hatalı cache dosyası silindi`);
    } else {
      console.log('✅ Hatalı cache bulunamadı');
    }
    
    return { deleted, invalid };
  } catch (error) {
    console.error('❌ Hatalı cache temizlenemedi:', error);
    return { deleted: 0, invalid: [], error: error.message };
  }
};

/**
 * Cache istatistiklerini döndürür
 */
export const getCacheStats = async () => {
  try {
    await ensureCacheDir();
    
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      console.log('📭 Cache klasörü henüz oluşturulmamış');
      return { 
        count: 0, 
        totalSize: 0, 
        totalSizeMB: '0.00',
        cacheDir: CACHE_DIR,
        files: []
      };
    }
    
    const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    let totalSize = 0;
    const fileDetails = [];
    
    for (const file of jsonFiles) {
      const filePath = `${CACHE_DIR}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists && fileInfo.size) {
        totalSize += fileInfo.size;
        
        // Cache dosyasının içeriğini oku (ilk 100 karakter)
        try {
          const content = await FileSystem.readAsStringAsync(filePath, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          const cacheData = JSON.parse(content);
          fileDetails.push({
            file,
            size: fileInfo.size,
            text: cacheData.text?.substring(0, 50) || 'N/A',
            avatarId: cacheData.avatarId || 'N/A',
            cachedAt: cacheData.cachedAt ? new Date(cacheData.cachedAt).toLocaleString() : 'N/A',
          });
        } catch (parseError) {
          fileDetails.push({
            file,
            size: fileInfo.size,
            error: 'Parse error',
          });
        }
      }
    }
    
    const stats = {
      count: jsonFiles.length,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      cacheDir: CACHE_DIR,
      files: fileDetails,
    };
    
    console.log('📊 Cache İstatistikleri:');
    console.log(`   - Dosya sayısı: ${stats.count}`);
    console.log(`   - Toplam boyut: ${stats.totalSizeMB} MB`);
    console.log(`   - Cache dizini: ${stats.cacheDir}`);
    if (stats.count > 0) {
      console.log('   - Cache dosyaları:');
      fileDetails.forEach((f, i) => {
        console.log(`     ${i + 1}. ${f.file} (${f.size} bytes)`);
        console.log(`        Text: "${f.text}"`);
        console.log(`        Avatar: ${f.avatarId}`);
        console.log(`        Kayıt: ${f.cachedAt}`);
      });
    }
    
    return stats;
  } catch (error) {
    console.error('❌ Cache istatistikleri alınamadı:', error);
    return { 
      count: 0, 
      totalSize: 0,
      totalSizeMB: '0.00',
      cacheDir: CACHE_DIR,
      error: error.message,
    };
  }
};

/**
 * Eski cache'leri temizler (30 günden eski)
 */
export const cleanOldCache = async () => {
  try {
    await ensureCacheDir();
    
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      return { deleted: 0 };
    }
    
    const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    let deleted = 0;
    for (const file of jsonFiles) {
      try {
        const filePath = `${CACHE_DIR}${file}`;
        const content = await FileSystem.readAsStringAsync(filePath, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        const cacheData = JSON.parse(content);
        
        const cacheAge = Date.now() - cacheData.cachedAt;
        if (cacheAge > CACHE_DURATION) {
          await FileSystem.deleteAsync(filePath, { idempotent: true });
          deleted++;
        }
      } catch (error) {
        // Hatalı dosyayı sil
        await FileSystem.deleteAsync(`${CACHE_DIR}${file}`, { idempotent: true });
        deleted++;
      }
    }
    
    if (deleted > 0) {
      console.log(`🧹 ${deleted} eski cache dosyası silindi`);
    }
    
    return { deleted };
  } catch (error) {
    console.error('❌ Eski cache temizlenemedi:', error);
    return { deleted: 0 };
  }
};

export default {
  ensureCacheDir,
  getCacheKey,
  getCacheFilePath,
  saveVideoToCache,
  getVideoFromCache,
  clearVideoCache,
  getCacheStats,
  cleanOldCache,
};

