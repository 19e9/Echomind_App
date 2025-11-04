/**
 * Translation Service
 * Türkçe → İngilizce çeviri servisi
 * 
 * MyMemory Translation API kullanıyor (ücretsiz)
 * Alternatif: Google Translate API (ücretli)
 */

const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

/**
 * Metni Türkçe'den İngilizce'ye çevirir
 * @param {string} text - Çevrilecek Türkçe metin
 * @returns {Promise<string>} Çevrilmiş İngilizce metin
 */
export const translateToEnglish = async (text) => {
  try {
    if (!text || text.trim() === '') {
      throw new Error('Çevrilecek metin boş olamaz');
    }

    console.log('🌐 Translating to English:', text.substring(0, 50) + '...');

    // MyMemory Translation API (ücretsiz, günlük 1000 istek limiti)
    const response = await fetch(
      `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=tr|en`
    );

    if (!response.ok) {
      throw new Error(`Translation API Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.responseStatus !== 200) {
      throw new Error('Çeviri başarısız: ' + (data.responseData?.errorMessage || 'Bilinmeyen hata'));
    }

    const translatedText = data.responseData.translatedText;
    console.log('✅ Translation complete:', translatedText);

    return translatedText;
  } catch (error) {
    console.error('❌ Translation error:', error);
    throw error;
  }
};

/**
 * Metni İngilizce'den Türkçe'ye çevirir
 * @param {string} text - Çevrilecek İngilizce metin
 * @returns {Promise<string>} Çevrilmiş Türkçe metin
 */
export const translateToTurkish = async (text) => {
  try {
    if (!text || text.trim() === '') {
      throw new Error('Çevrilecek metin boş olamaz');
    }

    console.log('🌐 Translating to Turkish:', text.substring(0, 50) + '...');

    const response = await fetch(
      `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=en|tr`
    );

    if (!response.ok) {
      throw new Error(`Translation API Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.responseStatus !== 200) {
      throw new Error('Çeviri başarısız: ' + (data.responseData?.errorMessage || 'Bilinmeyen hata'));
    }

    const translatedText = data.responseData.translatedText;
    console.log('✅ Translation complete:', translatedText);

    return translatedText;
  } catch (error) {
    console.error('❌ Translation error:', error);
    throw error;
  }
};

export default {
  translateToEnglish,
  translateToTurkish,
};

