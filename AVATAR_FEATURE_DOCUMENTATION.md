# 🎭 2D Görüntülü Konuşan Avatar Sistemi - Dokümantasyon

**Versiyon:** 2.0.0  
**Tarih:** 26 Ekim 2025  
**Eklenen Özellik:** Deepgram + D-ID Avatar Entegrasyonu

---

## 📑 İçindekiler

1. [Genel Bakış](#-genel-bakış)
2. [Yeni Özellikler](#-yeni-özellikler)
3. [Teknik Mimari](#-teknik-mimari)
4. [Kurulum ve Konfigürasyon](#-kurulum-ve-konfigürasyon)
5. [Kullanım Kılavuzu](#-kullanım-kılavuzu)
6. [API Referansı](#-api-referansı)
7. [Bileşenler](#-bileşenler)
8. [Servisler](#-servisler)
9. [Sorun Giderme](#-sorun-giderme)
10. [Performans ve Optimizasyon](#-performans-ve-optimizasyon)

---

## 🎯 Genel Bakış

Echomind App'e eklenen **2D Görüntülü Konuşan Avatar Sistemi**, kullanıcıların metinlerini veya ses kayıtlarını, seçilen 2D yüz avatarlarının dudak hareketleriyle eşzamanlı biçimde görüntülü olarak konuşturmasını sağlar.

### Ana Teknolojiler

- **Deepgram Nova-2**: Speech-to-Text (STT)
- **Deepgram Aura**: Text-to-Speech (TTS)
- **D-ID API**: Lip-sync ve konuşan avatar videoları
- **React Native Video (Expo AV)**: Video oynatma

### İş Akışı

```
┌─────────────────────────────────────────────────────────────┐
│                    Kullanıcı Girişi                         │
│                  (Metin veya Ses Kaydı)                     │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
     ┌───────────────┐
     │ Avatar Modu?  │
     └───┬───────┬───┘
         │       │
    Hayır│       │Evet
         │       │
         ▼       ▼
    ┌────────┐ ┌──────────────────────────────────┐
    │ Normal │ │  Avatar Pipeline                 │
    │  TTS   │ │  1. Deepgram STT (eğer ses)      │
    │        │ │  2. Deepgram TTS (audio)         │
    └────────┘ │  3. D-ID API (video + lip-sync) │
               │  4. Video gösterimi              │
               └──────────────────────────────────┘
```

---

## ✨ Yeni Özellikler

### 1. Avatar Modu

- ✅ Avatar modu toggle switch'i (🎭 Avatar / 🔊 Ses)
- ✅ Gerçek zamanlı mod değiştirme
- ✅ Avatar seçimi modal'ı
- ✅ 4 hazır profesyonel avatar (Amy, Josh, Anna, William)

### 2. Text-to-Avatar

**İş Akışı:**
```
Metin Girişi → Deepgram TTS → Ses Dosyası → D-ID API → Avatar Videosu
```

**Özellikler:**
- Kullanıcının yazdığı metin avatar tarafından konuşulur
- 30-60 saniye video hazırlama süresi
- Loading indicator ile feedback
- Video cache desteği

### 3. Speech-to-Avatar

**İş Akışı:**
```
Ses Kaydı → Deepgram STT → Metin → Deepgram TTS → Ses → D-ID → Video
```

**Özellikler:**
- Ses kaydı → Transkripsiyon → Avatar konuşması
- Tam pipeline entegrasyonu
- Her adımda progress feedback

### 4. Avatar Yönetimi

- ✅ Avatar seçim modal'ı (AvatarSelector)
- ✅ Avatar önizleme (AvatarDisplay)
- ✅ Idle/Loading/Playing durumları
- ✅ Video oynatma kontrolü

### 5. Settings Ekranı

- ✅ Deepgram API Key yönetimi
- ✅ D-ID API Key yönetimi
- ✅ STT model seçimi (nova-2, nova, enhanced, base)
- ✅ Dil seçimi (tr, en, es, fr)
- ✅ TTS voice seçimi (Aura modelleri)
- ✅ Avatar kalite ayarları
- ✅ Cache yönetimi

---

## 🏗️ Teknik Mimari

### Dosya Yapısı

```
EchomindApp_last_version/
│
├── components/
│   ├── AvatarDisplay.js         ⭐ YENİ - Avatar video player
│   ├── AvatarSelector.js        ⭐ YENİ - Avatar seçim modal'ı
│   ├── MicButton.js             (Mevcut)
│   ├── PlayButton.js            (Mevcut)
│   └── TextDisplay.js           (Mevcut)
│
├── config/
│   ├── avatarConfig.js          ⭐ YENİ - Avatar & D-ID ayarları
│   └── deepgramConfig.js        (Mevcut - Güncellendi)
│
├── screens/
│   ├── HomeScreen.js            🔄 GÜNCELLENDİ - Avatar modu eklendi
│   └── SettingsScreen.js        🔄 GÜNCELLENDİ - Kapsamlı ayarlar
│
├── services/
│   ├── didApiService.js         ⭐ YENİ - D-ID API servisi
│   ├── avatarTTSService.js      ⭐ YENİ - Deepgram+D-ID entegrasyonu
│   ├── deepgramService.js       (Mevcut)
│   ├── ttsService.js            (Mevcut)
│   └── deepgramLiveService.js   (Mevcut)
│
└── App.js                        🔄 GÜNCELLENDİ - Settings header
```

### Veri Akışı

#### Text-to-Avatar Pipeline

```javascript
// 1. Kullanıcı metni yazar
const text = "Merhaba, ben bir AI avatarım";

// 2. Avatar modu aktif, Play butonuna basılır
handlePlayPress() {
  if (avatarMode) {
    // 3. Text-to-Avatar pipeline başlar
    textToAvatar(text, selectedAvatar.imageUrl)
      .then(result => {
        // 7. Video URL'i set edilir
        setAvatarVideoUrl(result.videoUrl);
        
        // 8. AvatarDisplay otomatik oynatır
      });
  }
}

// Pipeline içinde:
// 4. Deepgram TTS ile audio oluşturulur
const audioUri = await textToAudioFile(text);

// 5. Audio base64'e çevrilir
const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
  encoding: 'base64',
});

// 6. D-ID API ile video oluşturulur
const talk = await createTalkFromAudio(audioDataUrl, avatarImageUrl);
const videoUrl = await waitForTalkCompletion(talk.talkId);
```

#### Speech-to-Avatar Pipeline

```javascript
// 1. Kullanıcı ses kaydeder
const recordingUri = "file:///.../recording.wav";

// 2. Speech-to-Avatar pipeline
speechToAvatar(recordingUri, avatarImageUrl, transcribeAudio)
  .then(result => {
    setTranscribedText(result.transcript);
    setAvatarVideoUrl(result.videoUrl);
  });

// Pipeline içinde:
// 3. Deepgram STT ile transkripsiyon
const transcript = await transcribeAudio(recordingUri);

// 4. Text-to-Avatar pipeline devam eder
const result = await textToAvatar(transcript, avatarImageUrl);
```

---

## 🔧 Kurulum ve Konfigürasyon

### 1. API Key'leri Alma

#### Deepgram API Key (Mevcut)

1. [console.deepgram.com](https://console.deepgram.com/) adresine gidin
2. Ücretsiz hesap oluşturun ($200 kredi)
3. API Keys → Create New Key
4. Key'i kopyalayın

#### D-ID API Key (YENİ)

1. [studio.d-id.com](https://studio.d-id.com/) adresine gidin
2. Ücretsiz hesap oluşturun
3. Settings → API Keys → Create New Key
4. Key'i kopyalayın

### 2. Konfigürasyon

#### config/deepgramConfig.js

```javascript
export const DEEPGRAM_CONFIG = {
  apiKey: "YOUR_DEEPGRAM_API_KEY_HERE",
  
  stt: {
    model: "nova-2",
    language: "tr",
    smartFormat: true,
    punctuate: true,
  },
  
  tts: {
    model: "aura-asteria-en",
    encoding: "linear16",
    container: "wav",
  },
};
```

#### config/avatarConfig.js (YENİ)

```javascript
export const AVATAR_CONFIG = {
  didApiKey: "YOUR_DID_API_KEY_HERE",
  
  avatars: {
    didAvatars: [
      {
        id: 'amy',
        name: 'Amy',
        gender: 'female',
        imageUrl: 'https://create-images-results.d-id.com/DefaultPresenters/Amy/image.jpeg',
        voiceId: 'en-US-JennyNeural',
      },
      // ... daha fazla avatar
    ],
    
    defaultAvatar: {
      id: 'default',
      name: 'Varsayılan Avatar',
      imageUrl: '...',
    },
  },
  
  video: {
    resolution: '512x512',
    format: 'mp4',
    quality: 'medium',
  },
};
```

### 3. Bağımlılıklar

Mevcut bağımlılıklar yeterli, yeni paket gerekmez:

```json
{
  "dependencies": {
    "expo-av": "^16.0.7",          // Video player (mevcut)
    "expo-file-system": "^19.0.17", // File operations (mevcut)
    // ... diğer mevcut paketler
  }
}
```

### 4. İlk Çalıştırma

```bash
# 1. Konfigürasyonu ayarlayın
# config/deepgramConfig.js ve config/avatarConfig.js

# 2. Uygulamayı başlatın
npm start

# 3. Settings ekranından API key'leri kontrol edin
# Ana ekran → ⚙️ Settings

# 4. Avatar modunu deneyin
# Ana ekran → 🎭 Avatar Modu toggle → ON
```

---

## 📖 Kullanım Kılavuzu

### Text-to-Avatar Kullanımı

**Adım 1:** Avatar modunu aktif edin
```
Ana Ekran → 🎭 Avatar Modu toggle → ON
```

**Adım 2:** Avatar seçin
```
Avatar bölümü → 🎨 Değiştir → Avatar seç → ✓
```

**Adım 3:** Metin yazın
```
✏️ Metin Yazın kutusuna → "Merhaba dünya" → Yazın
```

**Adım 4:** Avatarı konuşturun
```
▶️ Seslendir butonuna basın
→ "Avatar hazırlanıyor..." (10-30 saniye)
→ Video otomatik oynar
→ 🔊 Konuşuyor... indicator görünür
```

### Speech-to-Avatar Kullanımı

**Adım 1:** Avatar modu + Normal kayıt
```
🎭 Avatar Modu → ON
⏺️ Normal Kayıt → Seçili
```

**Adım 2:** Ses kaydedin
```
🎤 Mikrofon butonuna basın
→ Konuşun
→ Tekrar basın (kayıt durdur)
→ "Transkribe ediliyor..."
→ Metin görünür
```

**Adım 3:** Avatarı konuşturun
```
▶️ Seslendir → Avatar videosu oluşturulur
```

### Avatar Değiştirme

**Modal Üzerinden:**
```
Ana Ekran → 🎨 Değiştir
→ Avatar seçin (Amy, Josh, Anna, William)
→ ✓ işareti ile seçildi
→ Modal otomatik kapanır
```

**Seçenekler:**
- **Amy** 👩: Profesyonel kadın (en-US-JennyNeural)
- **Josh** 👨: Profesyonel erkek (en-US-GuyNeural)
- **Anna** 👩: Genç kadın (en-US-AriaNeural)
- **William** 👨: Olgun erkek (en-US-ChristopherNeural)

---

## 🔌 API Referansı

### didApiService.js

#### createTalkFromText(text, avatarUrl, options)

Metin ile konuşan avatar videosu oluşturur.

```javascript
const result = await createTalkFromText(
  "Hello world",
  "https://example.com/avatar.jpg",
  { voiceId: 'en-US-JennyNeural' }
);

// Returns: { talkId, status, createdAt }
```

#### createTalkFromAudio(audioUrl, avatarUrl)

Ses dosyası ile konuşan avatar videosu oluşturur.

```javascript
const result = await createTalkFromAudio(
  "data:audio/wav;base64,...",
  "https://example.com/avatar.jpg"
);

// Returns: { talkId, status, createdAt }
```

#### getTalkStatus(talkId)

Video oluşturma durumunu kontrol eder.

```javascript
const status = await getTalkStatus("talk-123");

// Returns: { talkId, status, videoUrl, duration, error }
// status: 'created' | 'started' | 'done' | 'error'
```

#### waitForTalkCompletion(talkId, maxRetries, interval)

Video hazır olana kadar bekler (polling).

```javascript
const videoUrl = await waitForTalkCompletion(
  "talk-123",
  60,    // max 60 deneme
  2000   // 2 saniye aralıkla
);

// Returns: string (video URL)
// Throws: Error if timeout or failed
```

### avatarTTSService.js

#### textToAvatar(text, avatarImageUrl)

Tam Text-to-Avatar pipeline.

```javascript
const result = await textToAvatar(
  "Merhaba dünya",
  "https://example.com/avatar.jpg"
);

// Returns: {
//   success: true,
//   videoUrl: "https://...",
//   text: "Merhaba dünya",
//   avatarUrl: "https://...",
//   timestamp: "2025-10-26T..."
// }
```

#### speechToAvatar(recordingUri, avatarImageUrl, transcribeFunction)

Tam Speech-to-Avatar pipeline.

```javascript
const result = await speechToAvatar(
  "file:///path/to/recording.wav",
  "https://example.com/avatar.jpg",
  transcribeAudio
);

// Returns: {
//   success: true,
//   videoUrl: "https://...",
//   transcript: "Transkribe edilen metin",
//   mode: 'speech-to-avatar',
//   ...
// }
```

#### textToAvatarCached(text, avatarImageUrl, useCache)

Cache destekli Text-to-Avatar.

```javascript
const result = await textToAvatarCached(
  "Merhaba",
  avatarUrl,
  true  // cache kullan
);

// Returns: { success, videoUrl, cached: true/false, ... }
```

---

## 🧩 Bileşenler

### AvatarDisplay

Avatar videosu gösterir ve kontrol eder.

**Props:**
```javascript
<AvatarDisplay
  videoUrl={string}           // Video URL'i (null ise idle state)
  avatarImageUrl={string}     // Avatar statik görseli
  isLoading={boolean}         // Video hazırlanıyor mu?
  onPlaybackFinish={function} // Video bittiğinde callback
  style={object}              // Ek stil
/>
```

**Durumlar:**
- **Idle**: Video yok, statik avatar gösterilir
- **Loading**: Video hazırlanıyor, loading overlay
- **Playing**: Video oynatılıyor, 🔊 indicator
- **Error**: Hata durumu, retry button

**Örnek:**
```javascript
<AvatarDisplay
  videoUrl={avatarVideoUrl}
  avatarImageUrl={selectedAvatar.imageUrl}
  isLoading={isAvatarLoading}
  onPlaybackFinish={() => setAvatarVideoUrl(null)}
/>
```

### AvatarSelector

Avatar seçim modal'ı.

**Props:**
```javascript
<AvatarSelector
  visible={boolean}           // Modal görünür mü?
  selectedAvatar={object}     // Seçili avatar
  onSelect={function}         // Avatar seçildiğinde
  onClose={function}          // Modal kapatıldığında
/>
```

**Örnek:**
```javascript
<AvatarSelector
  visible={showAvatarSelector}
  selectedAvatar={selectedAvatar}
  onSelect={setSelectedAvatar}
  onClose={() => setShowAvatarSelector(false)}
/>
```

---

## 🛠️ Servisler

### D-ID API Servisi (didApiService.js)

**Endpoints:**
- `POST /talks` - Video oluştur
- `GET /talks/{id}` - Status kontrol
- `DELETE /talks/{id}` - Video sil
- `POST /talks/streams` - WebRTC streaming (Advanced)

**Rate Limits:**
- Free tier: 20 talks/day
- Starter: 100 talks/month
- Pro: Unlimited

**Video İşleme Süreleri:**
- Kısa metin (<10 kelime): ~10 saniye
- Orta metin (10-50 kelime): ~20 saniye
- Uzun metin (>50 kelime): ~30 saniye

### Avatar TTS Servisi (avatarTTSService.js)

**Pipeline Functions:**
- `textToAvatar()` - Text → Video
- `audioToAvatar()` - Audio → Video
- `speechToAvatar()` - Recording → Transcript → Video

**Cache Functions:**
- `cacheAvatarVideo()` - Video cache'e ekle
- `getCachedAvatarVideo()` - Cache'den al
- `hashText()` - Text hash oluştur

**Cache Stratejisi:**
- En son 20 video cache'lenir
- 1 saat geçerlilik süresi
- Text + Avatar URL hash'i key olarak kullanılır

---

## 🐛 Sorun Giderme

### Video Oluşturulamıyor

**Hata:** "Avatar videosu oluşturulamadı"

**Çözümler:**
1. D-ID API Key'i kontrol edin
   ```
   Settings → D-ID Avatar API → API Key
   ```

2. API limitinizi kontrol edin
   ```
   https://studio.d-id.com/ → Usage
   ```

3. İnternet bağlantınızı kontrol edin

4. Metin uzunluğunu azaltın (max 300 karakter)

### Video Yüklenmiyor

**Hata:** "Video yüklenemedi"

**Çözümler:**
1. Video URL'inin geçerli olduğundan emin olun
2. Ağ bağlantınızı kontrol edin
3. CORS hatası varsa, proxy kullanın
4. Uygulamayı yeniden başlatın

### Yavaş İşleme

**Sorun:** Video hazırlanması çok uzun sürüyor

**Çözümler:**
1. Video kalitesini düşürün
   ```
   Settings → Video Kalitesi → Düşük
   ```

2. Kısa metinler kullanın

3. Cache'i aktif edin
   ```
   Settings → Video Cache → ON
   ```

### API Hataları

**401 Unauthorized:**
- API key yanlış veya expired
- Yeni key alın ve güncelleyin

**429 Too Many Requests:**
- Rate limit aşıldı
- Biraz bekleyin veya plan yükseltin

**500 Server Error:**
- D-ID sunucu hatası
- Birkaç dakika sonra tekrar deneyin

---

## ⚡ Performans ve Optimizasyon

### Video Cache

**Avantajlar:**
- Aynı metin tekrar konuşulurken hemen gösterilir
- API call azalır (maliyet düşer)
- Kullanıcı deneyimi artar

**Kullanım:**
```javascript
// Otomatik cache
const result = await textToAvatarCached(text, avatarUrl, true);

// Manuel cache
cacheAvatarVideo(hashText(text), videoUrl);
```

### Ön Yükleme

Avatar görsellerini önceden yükleyin:

```javascript
// config/avatarConfig.js
performance: {
  preloadAvatars: true,
}

// Uygulama başlangıcında
useEffect(() => {
  AVATAR_CONFIG.avatars.didAvatars.forEach(avatar => {
    Image.prefetch(avatar.imageUrl);
  });
}, []);
```

### Video Kalite Seçimi

**Düşük (low):**
- Hızlı işleme (~10 saniye)
- Küçük dosya boyutu
- Mobil veri dostu

**Orta (medium):** ⭐ Önerilen
- Dengeli performans (~20 saniye)
- İyi kalite
- Varsayılan seçim

**Yüksek (high):**
- Yavaş işleme (~30 saniye)
- En iyi kalite
- WiFi gerektirir

### Bandwidth Optimizasyonu

```javascript
// Düşük kalitede başla, gerekirse yükseltin
const getOptimalQuality = () => {
  const connection = navigator.connection || {};
  const effectiveType = connection.effectiveType;
  
  if (effectiveType === '4g') return 'high';
  if (effectiveType === '3g') return 'medium';
  return 'low';
};
```

---

## 📊 API Maliyetleri

### Deepgram (Mevcut)

**STT:**
- Nova-2: $0.0043/dakika
- $200 kredi = ~46,500 dakika

**TTS:**
- Aura: $0.002/1000 karakter
- $200 kredi = ~100M karakter

### D-ID (YENİ)

**Free Tier:**
- 20 talks/gün
- 5 dakika/ay
- Watermark var

**Starter ($49/ay):**
- 100 talks/ay
- 10 dakika
- Watermark yok

**Pro ($300/ay):**
- Unlimited talks
- 120 dakika
- Premium avatarlar

### Maliyet Hesaplama

**Text-to-Avatar (10 sn video):**
```
1. Deepgram TTS: ~50 karakter × $0.002/1000 = $0.0001
2. D-ID Video: 1 talk = ~$0.10 (Starter plan)
Total: ~$0.10/video
```

**Speech-to-Avatar (10 sn kayıt → 10 sn video):**
```
1. Deepgram STT: 10 sn × $0.0043/60 = $0.0007
2. Deepgram TTS: 50 karakter = $0.0001
3. D-ID Video: 1 talk = $0.10
Total: ~$0.101/video
```

---

## 🔐 Güvenlik

### API Key Yönetimi

**❌ Yapılmaması Gerekenler:**
```javascript
// Hard-coded keys (Kötü!)
const API_KEY = "d0f1e3203e7ddad088744c51508dc9b72c4bc76a";
```

**✅ Yapılması Gerekenler:**
```javascript
// Environment variables (İyi!)
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig?.extra?.deepgramApiKey;

// app.config.js
export default {
  extra: {
    deepgramApiKey: process.env.DEEPGRAM_API_KEY,
    didApiKey: process.env.DID_API_KEY,
  },
};
```

### Güvenli Saklama

Production'da AsyncStorage veya SecureStore kullanın:

```javascript
import * as SecureStore from 'expo-secure-store';

// Kaydet
await SecureStore.setItemAsync('deepgram_key', apiKey);

// Al
const apiKey = await SecureStore.getItemAsync('deepgram_key');
```

---

## 📱 Platform Desteği

### iOS

- ✅ iPhone (iOS 13+)
- ✅ iPad
- ✅ Video playback (AVPlayer)
- ⚠️ Mikrofon izni gerekli

### Android

- ✅ Android 7.0+ (API 24+)
- ✅ Tablet desteği
- ✅ Video playback (ExoPlayer)
- ⚠️ Storage izni gerekli

### Web

- ⚠️ Sınırlı destek
- ✅ Video oynatma çalışır
- ❌ Ses kaydı sınırlı
- ❌ D-ID WebRTC desteklenmez

---

## 🚀 Gelecek Geliştirmeler

### Kısa Vadeli (1-2 Hafta)

- [ ] Custom avatar upload (kendi fotoğrafı)
- [ ] Offline lip-sync (SadTalker/Wav2Lip)
- [ ] Video indirme/paylaşma
- [ ] Geçmiş video listesi

### Orta Vadeli (1-2 Ay)

- [ ] Real-time WebRTC streaming (canlı konuşma)
- [ ] Çoklu avatar konuşması
- [ ] Avatar animasyon seçenekleri
- [ ] Türkçe TTS avatar desteği

### Uzun Vadeli (3-6 Ay)

- [ ] 3D avatar desteği
- [ ] AR entegrasyonu
- [ ] Emotion control (mutlu/üzgün)
- [ ] Background scene seçimi

---

## 📞 Destek ve Kaynaklar

### Resmi Dokümantasyonlar

- **Deepgram Docs**: https://developers.deepgram.com/
- **D-ID Docs**: https://docs.d-id.com/
- **Expo AV**: https://docs.expo.dev/versions/latest/sdk/av/

### Community

- **GitHub Issues**: [Proje GitHub Repo]
- **Discord**: [Community Discord]
- **Stack Overflow**: Tag: `echomind-app`

### İletişim

- **Email**: support@echomindapp.com
- **Website**: https://echomindapp.com

---

**© 2025 Echomind App - Tüm hakları saklıdır.**

**Versiyon Geçmişi:**
- v2.0.0 (26 Ekim 2025): Avatar sistemi eklendi
- v1.0.0 (17 Ekim 2025): İlk sürüm (STT + TTS)

