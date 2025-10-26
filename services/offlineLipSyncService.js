/**
 * Offline Lip Sync Service
 * D-ID olmadan, yerel olarak dudak hareketi senkronizasyonu
 * 
 * Yaklaşım: Audio amplitude → Mouth animation frames
 */

import { Audio } from 'expo-av';

/**
 * Ses amplitude'ünü analiz ederek mouth frame'lerini hesaplar
 * @param {string} audioUri - Ses dosyası URI'si
 * @returns {Promise<Array>} Mouth animation timeline (frame array)
 */
export const analyzeSpeech = async (audioUri) => {
  try {
    console.log('🎙️ Analyzing speech for lip sync...');

    // Ses dosyasını yükle
    const { sound, status } = await Audio.Sound.createAsync(
      { uri: audioUri },
      { progressUpdateIntervalMillis: 100 } // Her 100ms güncelle
    );

    const duration = status.durationMillis;
    const frames = [];

    // Basit algoritma: Her 100ms için random mouth frame (demo)
    // Gerçek implementasyon: FFT analizi gerekir
    for (let i = 0; i < duration; i += 100) {
      // 0: Kapalı, 1: Hafif açık, 2: Orta açık, 3: Tam açık
      const frame = Math.floor(Math.random() * 4);
      frames.push({
        timestamp: i,
        mouthFrame: frame,
      });
    }

    await sound.unloadAsync();

    console.log(`✅ Generated ${frames.length} mouth frames`);
    return frames;
  } catch (error) {
    console.error('❌ Speech analysis failed:', error);
    throw error;
  }
};

/**
 * Phoneme tabanlı mouth mapping (gelişmiş)
 * Text → Phoneme → Mouth shape
 */
const PHONEME_TO_MOUTH = {
  // Sessiz
  silence: 0,
  
  // Kapalı sesler (m, b, p)
  closed: 0,
  
  // Açık sesler (a, e)
  open: 3,
  
  // Orta sesler (o, u)
  medium: 2,
  
  // Yarı açık (i, ı)
  semi: 1,
};

/**
 * Basit text-to-phoneme (Türkçe için basitleştirilmiş)
 * @param {string} text - Metin
 * @returns {Array} Phoneme dizisi
 */
export const textToPhonemes = (text) => {
  const words = text.toLowerCase().split(' ');
  const phonemes = [];
  
  words.forEach(word => {
    for (let char of word) {
      let mouthFrame = 1; // Default
      
      if ('aeiouöüıâî'.includes(char)) {
        // Sesli harfler
        if ('aeâ'.includes(char)) mouthFrame = 3; // Açık
        else if ('ouöü'.includes(char)) mouthFrame = 2; // Orta
        else mouthFrame = 1; // İnce
      } else {
        // Sessiz harfler
        if ('mbp'.includes(char)) mouthFrame = 0; // Kapalı
        else mouthFrame = 1;
      }
      
      phonemes.push(mouthFrame);
    }
    
    // Kelime arası boşluk
    phonemes.push(0);
  });
  
  return phonemes;
};

/**
 * Text ve audio'yu senkronize et
 * @param {string} text - Konuşulan metin
 * @param {number} durationMs - Audio süresi (ms)
 * @returns {Array} Timeline (zaman damgalı mouth frames)
 */
export const syncTextToAudio = (text, durationMs) => {
  console.log('🎬 Syncing text to audio...');
  
  const phonemes = textToPhonemes(text);
  const frameDuration = durationMs / phonemes.length;
  
  const timeline = phonemes.map((mouthFrame, index) => ({
    timestamp: Math.floor(index * frameDuration),
    mouthFrame,
  }));
  
  console.log(`✅ Created ${timeline.length} synced frames`);
  return timeline;
};

/**
 * Gerçek zamanlı mouth frame calculator
 * Audio position → Mouth frame
 * 
 * @param {number} currentPosition - Mevcut audio pozisyonu (ms)
 * @param {Array} timeline - Mouth animation timeline
 * @returns {number} Mouth frame (0-3)
 */
export const getCurrentMouthFrame = (currentPosition, timeline) => {
  if (!timeline || timeline.length === 0) return 0;
  
  // Binary search for performance
  let left = 0;
  let right = timeline.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const frame = timeline[mid];
    
    if (frame.timestamp <= currentPosition && 
        (mid === timeline.length - 1 || timeline[mid + 1].timestamp > currentPosition)) {
      return frame.mouthFrame;
    }
    
    if (frame.timestamp < currentPosition) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return 0;
};

/**
 * Basit amplitude tabanlı mouth animation (en kolay)
 * @param {Audio.Sound} sound - Oynatılan ses
 * @param {Function} onFrameUpdate - Frame callback (mouthFrame: 0-3)
 * @param {number} duration - Toplam süre (ms)
 */
export const animateMouthWithAudio = async (sound, onFrameUpdate, duration) => {
  console.log('🎭 Starting mouth animation...');
  
  const frameInterval = 100; // 10 FPS (yeterli)
  const frames = Math.ceil(duration / frameInterval);
  
  for (let i = 0; i < frames; i++) {
    await new Promise(resolve => setTimeout(resolve, frameInterval));
    
    // Basit animasyon: Random mouth frame (gerçek implementasyon: FFT)
    const mouthFrame = Math.random() > 0.7 ? Math.floor(Math.random() * 4) : 1;
    onFrameUpdate(mouthFrame);
  }
  
  // Son frame: Kapalı ağız
  onFrameUpdate(0);
  console.log('✅ Mouth animation complete');
};

/**
 * Text uzunluğundan tahmini süre (fallback)
 * @param {string} text - Metin
 * @returns {number} Tahmini süre (ms)
 */
export const estimateSpeechDuration = (text) => {
  const wordsPerMinute = 150; // Ortalama konuşma hızı
  const words = text.split(' ').length;
  const minutes = words / wordsPerMinute;
  return Math.ceil(minutes * 60 * 1000);
};

export default {
  analyzeSpeech,
  textToPhonemes,
  syncTextToAudio,
  getCurrentMouthFrame,
  animateMouthWithAudio,
  estimateSpeechDuration,
};

