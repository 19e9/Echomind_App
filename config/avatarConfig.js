/**
 * Avatar Configuration
 * HeyGen API ve Avatar ayarları
 * 
 * HeyGen API: https://app.heygen.com/
 * HeyGen Docs: https://docs.heygen.com/
 */

export const AVATAR_CONFIG = {
  // HeyGen API Key (⚠️ Production'da environment variable kullanın)
  heygenApiKey: "sk_V2_hgu_kiyuYUFolFH_6qcVMNEkMJ41qXzWJfcp2ffql4YFtzTK",

  // D-ID API Key (DEPRECATED - Artık HeyGen kullanılıyor)
  didApiKey: null,

  // Avatar Mode: 'online' (HeyGen API) veya 'offline' (Yerel animasyon)
  mode: 'online', // ⭐ 'online' = HeyGen API (Deepgram TTS + HeyGen Lip-sync)

  // Avatar özellikleri
  avatars: {
    // ⭐ HeyGen Avatarlar (Online - Profesyonel kalite)
    // ✅ GEÇERLİ AVATAR ID'LERİ (HeyGen API'den çekildi - 1287 avatar var!)
    heygenAvatars: [
      {
        id: 'aditya_brown',
        name: 'Aditya (Brown)',
        gender: 'male',
        avatarId: 'Aditya_public_4', // ✅ API'den doğrulandı
        description: 'HeyGen - Aditya in Brown blazer',
        previewImage: 'https://files2.heygen.ai/avatar/v3/17ad4b824e5a47e8b4f61e6a9cd346e7_62180/preview_target.webp',
        online: true,
      },
      {
        id: 'aditya_blue',
        name: 'Aditya (Blue)',
        gender: 'male',
        avatarId: 'Aditya_public_1', // ✅ API'den doğrulandı
        description: 'HeyGen - Aditya in Blue blazer',
        previewImage: 'https://files2.heygen.ai/avatar/v3/8c30ef92b2334d919e0f754e38c1a1ae_62150/preview_target.webp',
        online: true,
      },
      {
        id: 'adriana_biztalk',
        name: 'Adriana (Business)',
        gender: 'female',
        avatarId: 'Adriana_BizTalk_Front_public', // ✅ API'den doğrulandı
        description: 'HeyGen - Adriana BizTalk',
        previewImage: 'https://files2.heygen.ai/avatar/v3/c3d1baaebbe84752b7a473373c6cd385_42780/preview_target.webp',
        online: true,
      },
      {
        id: 'adriana_business',
        name: 'Adriana (Front)',
        gender: 'female',
        avatarId: 'Adriana_Business_Front_public', // ✅ API'den doğrulandı
        description: 'HeyGen - Adriana Business Front',
        previewImage: 'https://files2.heygen.ai/avatar/v3/2b68bcf81edc44fabdc9070e62ca1f82_42780/preview_talk_2.webp',
        online: true,
      },
      {
        id: 'adriana_side',
        name: 'Adriana (Side)',
        gender: 'female',
        avatarId: 'Adriana_Business_Side_public', // ✅ API'den doğrulandı
        description: 'HeyGen - Adriana Business Side',
        previewImage: 'https://files2.heygen.ai/avatar/v3/18f25fd5ce0040a29a954e95165e233a_42770/preview_target.webp',
        online: true,
      },
    ],

    // ⭐ Offline Avatarlar (Yerel resimler - TAMAMEN ÜCRETSIZ!)
    offlineAvatars: [
      {
        id: 'halid',
        name: 'Halid',
        gender: 'male',
        // Base image: Erkek avatar
        baseImage: require('../assets/avatar/erkek_avatar.jpg'),
        // Mouth sprites: Basit animasyon (aynı resim kullanılıyor)
        // TODO: Farklı mouth frame'leri eklenebilir
        mouthSprites: {
          closed: require('../assets/avatar/erkek_avatar.jpg'),
          semi: require('../assets/avatar/erkek_avatar.jpg'),
          medium: require('../assets/avatar/erkek_avatar.jpg'),
          open: require('../assets/avatar/erkek_avatar.jpg'),
        },
        description: 'Halid - Erkek Avatar (Offline)',
        offline: true,
      },
      {
        id: 'irem',
        name: 'İrem',
        gender: 'female',
        baseImage: require('../assets/avatar/kiz1.jpg'),
        mouthSprites: {
          closed: require('../assets/avatar/kiz1.jpg'),
          semi: require('../assets/avatar/kiz1.jpg'),
          medium: require('../assets/avatar/kiz1.jpg'),
          open: require('../assets/avatar/kiz1.jpg'),
        },
        description: 'İrem - Kadın Avatar (Offline)',
        offline: true,
      },
      {
        id: 'aleyna',
        name: 'Aleyna',
        gender: 'female',
        baseImage: require('../assets/avatar/kiz2.jpg'),
        mouthSprites: {
          closed: require('../assets/avatar/kiz2.jpg'),
          semi: require('../assets/avatar/kiz2.jpg'),
          medium: require('../assets/avatar/kiz2.jpg'),
          open: require('../assets/avatar/kiz2.jpg'),
        },
        description: 'Aleyna - Kadın Avatar (Offline)',
        offline: true,
      },
    ],

    // Custom avatarlar (kullanıcı fotoğrafları)
    customAvatars: [
      // Kullanıcı kendi fotoğrafını ekleyebilir
      // { id: 'custom1', name: 'Benim Avatar', imageUrl: 'https://...' }
    ],

    // Placeholder avatar (default)
    defaultAvatar: {
      id: 'adriana_biztalk',
      name: 'Adriana (Business)',
      gender: 'female',
      avatarId: 'Adriana_BizTalk_Front_public', // ✅ API'den doğrulandı
      description: 'HeyGen - Adriana BizTalk (Default)',
      previewImage: 'https://files2.heygen.ai/avatar/v3/c3d1baaebbe84752b7a473373c6cd385_42780/preview_target.webp',
      online: true,
    },
  },

  // TTS Provider ayarları
  ttsProviders: {
    // Deepgram (PRIMARY) - HeyGen ile entegre
    deepgram: {
      enabled: true,
      priority: 1,
      models: ['aura-asteria-en', 'aura-orion-en', 'aura-luna-en'],
    },
    // HeyGen TTS (OPTIONAL - Deepgram kullanacağız)
    heygen: {
      enabled: false,
      priority: 2,
      description: 'HeyGen native TTS (not used, we use Deepgram)',
    },
  },

  // Video ayarları (HeyGen)
  video: {
    width: 1280,
    height: 720,
    format: 'mp4',
    quality: 'high', // HeyGen otomatik olarak yüksek kalite sağlar
    maxDuration: 300, // 5 dakika (saniye)
    aspectRatio: null, // null = default (16:9)
    backgroundColor: '#F5F5F5', // Arka plan rengi
    test: false, // Test mode (watermark ekler, credit harcamaz)
  },

  // Performans ayarları
  performance: {
    cacheVideos: true, // Video'ları cache'le
    maxCacheSize: 100, // MB
    preloadAvatars: false, // HeyGen avatarları önceden yükleme
    maxPollingAttempts: 60, // Video oluşturma için max polling sayısı
    pollingInterval: 3000, // ms (3 saniye)
  },

  // Real-time streaming ayarları (HeyGen Premium)
  streaming: {
    enabled: false, // WebRTC streaming (Premium feature - şimdilik kapalı)
    latency: 'low', // low, medium, high
    bitrate: 1000, // kbps
  },
};

export default AVATAR_CONFIG;
