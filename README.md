# 🎙️ Echomind App

<div align="center">

![React Native](https://img.shields.io/badge/React%20Native-0.81.4-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-~54.0-000020?style=for-the-badge&logo=expo&logoColor=white)
![Deepgram](https://img.shields.io/badge/Deepgram-AI-00D4A0?style=for-the-badge&logo=ai&logoColor=white)
![D-ID](https://img.shields.io/badge/D--ID-Avatar-FF6B6B?style=for-the-badge)
![HeyGen](https://img.shields.io/badge/HeyGen-Video-9B59B6?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**🤖 AI Destekli Gelişmiş Ses Tanıma ve 2D Konuşan Avatar Mobil Uygulaması**

*Speech-to-Text • Text-to-Speech • Konuşan Avatarlar • Gerçek Zamanlı İşlem*

[🚀 Hızlı Başlangıç](#-kurulum) • [📱 Özellikler](#-özellikler) • [🎭 Avatar Sistemi](#-avatar-sistemi) • [📖 Dokümantasyon](#-kullanım) • [🤝 Katkıda Bulunma](#-katkıda-bulunma)

</div>

---

## 🌟 Yenilikler (v1.3)

### 🎭 2D Konuşan Avatar Sistemi
- ✅ **D-ID API Entegrasyonu**: Profesyonel AI avatar videoları
- ✅ **HeyGen API Entegrasyonu**: 1200+ hazır avatar
- ✅ **Offline Avatar Modu**: İnternetsiz, ücretsiz lip-sync animasyonu
- ✅ **Text-to-Avatar Pipeline**: Metin → Konuşan Video
- ✅ **Speech-to-Avatar Pipeline**: Ses Kaydı → Transkripsiyon → Avatar Videosu

### 🎥 Gelişmiş Video Özellikleri
- ✅ **Video Persistence**: Video bittiğinde son frame'de kalır
- ✅ **Replay Butonu**: Videoyu tekrar oynatma
- ✅ **Video Cache**: Hızlı erişim için cache sistemi
- ✅ **Loading States**: Profesyonel yükleme animasyonları

### ⚙️ Kapsamlı Ayarlar
- ✅ **API Key Yönetimi**: Deepgram, D-ID, HeyGen
- ✅ **Model Seçimi**: STT/TTS model ayarları
- ✅ **Dil Desteği**: 30+ dil desteği
- ✅ **Avatar Modu**: Online/Offline seçenekleri

---

## 📱 Özellikler

### 🎯 Temel Özellikler

- 🎤 **Speech-to-Text (STT)**: Deepgram Nova-2 modeli ile %95+ doğrulukta ses tanıma
- 🔊 **Text-to-Speech (TTS)**: Deepgram Aura modeli ile doğal sesli metin okuma
- 🎭 **2D Konuşan Avatarlar**: AI destekli gerçekçi avatar videoları
- 🇹🇷 **Türkçe Dil Desteği**: Tam Türkçe transkripsiyon ve 30+ dil desteği
- ⚡ **Gerçek Zamanlı İşlem**: Anlık ses kaydı ve hızlı transkripsiyon
- 🎨 **Modern UI/UX**: Animasyonlu butonlar ve kullanıcı dostu arayüz
- 📱 **Cross-Platform**: iOS, Android ve Web desteği

### 🎭 Avatar Sistemi

#### Online Avatar Modları

**D-ID (Varsayılan)**
- 🤖 AI destekli lip-sync
- 🎯 Yüksek kalite video
- 🖼️ Custom avatar desteği (kendi fotoğrafınız)
- ⚡ 10-30 saniye işleme süresi

**HeyGen**
- 👥 1200+ profesyonel hazır avatar
- 🎬 Hollywood kalitesinde videolar
- 🌍 Çoklu dil desteği
- 🎙️ Premium voice seçenekleri

#### Offline Avatar Modu
- ✅ **Tamamen ÜCRETSIZ** (API gerektirmez)
- ⚡ **Anında sonuç** (< 1 saniye)
- 🔒 **Gizlilik**: Data dışarı gitmiyor
- 📶 **İnternet gerekmez**
- 🎨 Sprite-based lip-sync animasyonu

### 🔧 Teknik Özellikler

- ✅ **Multi-API Desteği**: Deepgram + D-ID + HeyGen entegrasyonu
- ✅ **REST API İletişimi**: SDK kullanmadan, native React Native uyumlu
- ✅ **Otomatik Formatlama**: Akıllı noktalama ve büyük harf
- ✅ **Yüksek Kaliteli Ses**: Expo AV ile profesyonel kayıt
- ✅ **Video Oynatma**: Expo AV ile smooth video rendering
- ✅ **Cache Sistemi**: Hızlı erişim ve maliyet optimizasyonu
- ✅ **Animasyonlu UI**: React Native Reanimated ile smooth geçişler
- ✅ **Navigation**: React Navigation ile sayfa yönetimi
- ✅ **Error Handling**: Kapsamlı hata yönetimi ve kullanıcı geri bildirimi

---

## 📋 Gereksinimler

### Zorunlu
- **Node.js** v14 veya üzeri
- **npm** veya **yarn**
- **Expo CLI** (otomatik yüklenecek)
- **Deepgram API Key** ([ücretsiz alın](https://console.deepgram.com/) - $200 kredi)

### İsteğe Bağlı (Avatar Özellikleri İçin)
- **D-ID API Key** ([ücretsiz deneyin](https://studio.d-id.com/) - 20 video/gün)
- **HeyGen API Key** ([profesyonel avatarlar](https://www.heygen.com/))

> 💡 **Not**: Offline avatar modu için API key gerekmez!

---

## 🚀 Kurulum

### 1️⃣ Projeyi Klonlayın

```bash
git clone https://github.com/19e9/Echomind_App.git
cd EchomindApp_v1.3
```

### 2️⃣ Bağımlılıkları Yükleyin

```bash
npm install
```

veya

```bash
yarn install
```

### 3️⃣ API Key'lerini Ayarlayın

#### Deepgram (Zorunlu - STT/TTS)
1. [Deepgram Console](https://console.deepgram.com/) adresine gidin
2. Ücretsiz hesap oluşturun ($200 ücretsiz kredi)
3. API Keys → Create New Key
4. `config/deepgramConfig.js` dosyasını güncelleyin:

```javascript
export const DEEPGRAM_CONFIG = {
  apiKey: "YOUR_DEEPGRAM_API_KEY_HERE",
  // ...
};
```

#### D-ID (İsteğe Bağlı - Avatar Videoları)
1. [D-ID Studio](https://studio.d-id.com/) adresine gidin
2. Ücretsiz hesap oluşturun (20 video/gün)
3. Settings → API Keys → Create New Key
4. `config/avatarConfig.js` dosyasını güncelleyin:

```javascript
export const AVATAR_CONFIG = {
  didApiKey: "YOUR_DID_API_KEY_HERE",
  // ...
};
```

#### HeyGen (İsteğe Bağlı - Premium Avatarlar)
1. [HeyGen](https://www.heygen.com/) hesabı oluşturun
2. API key alın
3. `config/avatarConfig.js` dosyasını güncelleyin:

```javascript
export const AVATAR_CONFIG = {
  heygenApiKey: "YOUR_HEYGEN_API_KEY_HERE",
  // ...
};
```

> ⚠️ **Güvenlik Notu**: API anahtarlarınızı asla GitHub'a yüklemeyin! `.gitignore` dosyası konfigürasyon dosyalarını içeriyor.

### 4️⃣ Uygulamayı Başlatın

```bash
npm start
```

veya

```bash
npx expo start
```

Expo DevTools açılacaktır:
- **iOS**: `i` tuşuna basın veya iOS Simulator'ü açın
- **Android**: `a` tuşuna basın veya Android Emulator'ü açın  
- **Web**: `w` tuşuna basın

---

## 📖 Kullanım

### 🎤 Ses Kaydı ve Transkripsiyon

**Normal Mod (Sadece STT):**
1. Ana ekranda **🎤 Mikrofon** butonuna basın
2. Konuşmaya başlayın (buton kırmızıya döner)
3. Bitince tekrar butona basın
4. Transkripsiyon otomatik olarak ekranda görünür

**Canlı Kayıt Modu (Real-time STT):**
1. **⏺️ Canlı Kayıt** seçeneğini işaretleyin
2. Mikrofon butonuna basın
3. Konuşurken transkripsiyon **gerçek zamanlı** güncellenir
4. Durdurmak için tekrar basın

### 🔊 Metin Okuma (TTS)

1. Metin alanına içerik yazın veya ses kaydı yapın
2. **▶️ Seslendir** butonuna basın
3. Metin Deepgram Aura model ile seslendirilir

### 🎭 Avatar Modu (Text-to-Avatar)

**Adım 1: Avatar Modunu Aktif Edin**
```
Ana Ekran → 🎭 Avatar Modu toggle → ON
```

**Adım 2: Avatar Seçin**
```
Avatar bölümü → 🎨 Değiştir → Avatar seçin → ✓
```

**Avatar Seçenekleri:**
- **D-ID Avatarlar**: Amy, Josh, Anna, William (profesyonel)
- **HeyGen Avatarlar**: 1200+ seçenek (Aditya, Adriana, Monica, vb.)
- **Offline Avatarlar**: Halid, İrem, Aleyna (ücretsiz, lokal)

**Adım 3: Metin Yazın ve Konuşturun**
```
✏️ Metin Yazın → "Merhaba, ben bir AI avatarım" → ▶️ Seslendir
```

**Bekleme Süreleri:**
- D-ID: ~15-30 saniye
- HeyGen: ~30-60 saniye
- Offline: < 1 saniye ⚡

**Adım 4: Videoyu İzleyin**
```
🎥 Video otomatik oynar
🔊 "Konuşuyor..." göstergesi
✅ Video bitince son frame'de kalır
🔄 "Tekrar İzle" butonu ile tekrar oynatabilirsiniz
```

### 🎙️ Speech-to-Avatar

**Tam Pipeline: Ses Kaydı → Transkripsiyon → Avatar Videosu**

1. Avatar modunu aktif edin (🎭 ON)
2. Avatar seçin
3. 🎤 Mikrofon butonuna basın
4. Konuşun (minimum 2-3 saniye)
5. Kaydı durdurun
6. ✅ Otomatik olarak:
   - Ses transkribe edilir
   - Metin avatar tarafından konuşulur
   - Video oluşturulur ve oynatılır

---

## 📁 Proje Yapısı

```
EchomindApp_v1.3/
│
├── 📱 App.js                          # Ana uygulama & navigasyon
├── 📋 app.json                        # Expo konfigürasyonu
├── 📦 package.json                    # Bağımlılıklar
│
├── 🧩 components/                     # UI bileşenleri
│   ├── MicButton.js                  # Animasyonlu mikrofon butonu
│   ├── PlayButton.js                 # Oynatma butonu
│   ├── TextDisplay.js                # Metin gösterim alanı
│   ├── AvatarDisplay.js              ⭐ Avatar video player + replay
│   ├── AvatarSelector.js             ⭐ Avatar seçim modal'ı
│   └── AnimatedAvatar.js             ⭐ Offline sprite animasyon
│
├── 📱 screens/                        # Uygulama ekranları
│   ├── HomeScreen.js                 # Ana ekran (STT/TTS/Avatar)
│   └── SettingsScreen.js             # Kapsamlı ayarlar ekranı
│
├── ⚙️ config/                         # Konfigürasyon
│   ├── deepgramConfig.js             # Deepgram API ayarları
│   └── avatarConfig.js               ⭐ Avatar & D-ID & HeyGen ayarları
│
├── 🔧 services/                       # API servisleri
│   ├── deepgramService.js            # Speech-to-Text servisi
│   ├── ttsService.js                 # Text-to-Speech servisi
│   ├── deepgramLiveService.js        # Canlı transkripsiyon
│   ├── didApiService.js              ⭐ D-ID API servisi
│   ├── heygenApiService.js           ⭐ HeyGen API servisi
│   ├── avatarTTSService.js           ⭐ Avatar pipeline servisi
│   └── offlineLipSyncService.js      ⭐ Offline lip-sync servisi
│
├── 🎨 styles/                         # Stiller
│   └── globalStyles.js               # Global stil tanımları
│
├── 🖼️ assets/                         # Medya dosyaları
│   ├── icon.png                      # Uygulama ikonu
│   ├── splash-icon.png               # Splash ekranı
│   └── avatar/                       ⭐ Offline avatar görselleri
│       ├── erkek_avatar.jpg
│       ├── kiz1.jpg
│       └── kiz2.jpg
│
├── 📜 scripts/                        # Yardımcı scriptler
│   ├── listHeygenAvatars.js          ⭐ HeyGen avatar listesi
│   └── heygen_avatars.json           ⭐ 1287 HeyGen avatar
│
└── 📚 docs/                           # Dokümantasyon
    ├── AVATAR_FEATURE_DOCUMENTATION.md
    ├── HEYGEN_AVATARS_FIXED.md
    ├── OFFLINE_AVATAR_GUIDE.md
    ├── VIDEO_PERSISTENCE_UPDATE.md
    └── ...
```

---

## ⚙️ Konfigürasyon

### Deepgram Ayarları (`config/deepgramConfig.js`)

```javascript
export const DEEPGRAM_CONFIG = {
  apiKey: "your_deepgram_api_key",
  
  stt: {
    model: "nova-2",          // Model: nova-2, nova, base, enhanced
    language: "tr",           // Dil: tr, en, es, fr, de, ja, ko...
    smartFormat: true,        // Otomatik formatlama
    punctuate: true,          // Noktalama işaretleri
    diarize: false,           // Konuşmacı ayırımı
    interim_results: true,    // Canlı sonuçlar (live mode)
  },
  
  tts: {
    model: "aura-asteria-en", // TTS ses modeli
    encoding: "linear16",     // Ses formatı
    container: "wav",         // Container format
    sampleRate: 24000,        // Örnekleme hızı
  },
};
```

### Avatar Ayarları (`config/avatarConfig.js`)

```javascript
export const AVATAR_CONFIG = {
  // API Keys
  didApiKey: "your_did_api_key",
  heygenApiKey: "your_heygen_api_key",
  
  // Avatar Modu
  mode: 'online',              // 'online' | 'offline'
  defaultProvider: 'did',      // 'did' | 'heygen'
  
  // D-ID Avatarlar
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
  },
  
  // Video Ayarları
  video: {
    resolution: '512x512',     // 256x256, 512x512, 1024x1024
    format: 'mp4',             // Video format
    quality: 'medium',         // low, medium, high
    fps: 25,                   // Frame rate
  },
  
  // Cache Ayarları
  cache: {
    enabled: true,
    maxVideos: 20,             // Max cache sayısı
    expirationTime: 3600000,   // 1 saat (ms)
  },
};
```

---

## 🎯 Deepgram AI Modelleri

### Speech-to-Text Modelleri

| Model | Açıklama | Hız | Doğruluk | Kullanım |
|-------|----------|-----|----------|----------|
| **nova-2** ⭐ | En yeni, en hızlı, en doğru | ⚡⚡⚡ | 95%+ | Önerilen |
| **nova** | Hızlı ve doğru | ⚡⚡ | 93%+ | Alternatif |
| **enhanced** | Geliştirilmiş doğruluk | ⚡ | 96%+ | Hassas işlemler |
| **base** | Temel model | ⚡⚡⚡ | 90%+ | Düşük maliyetli |

### Text-to-Speech Modelleri (Aura)

| Model | Ses Tipi | Karakter | Dil |
|-------|----------|----------|-----|
| **aura-asteria-en** | Kadın | Doğal, profesyonel | İngilizce |
| **aura-luna-en** | Kadın | Samimi, sıcak | İngilizce |
| **aura-stella-en** | Kadın | Genç, enerjik | İngilizce |
| **aura-orion-en** | Erkek | Güçlü, otoriter | İngilizce |
| **aura-arcas-en** | Erkek | Profesyonel, ciddi | İngilizce |
| **aura-perseus-en** | Erkek | Samimi, dostça | İngilizce |

[Tüm TTS Modelleri](https://developers.deepgram.com/docs/tts-models)

### 🌍 Desteklenen Diller

Deepgram 30+ dili destekler:

| Dil | Kod | STT Kalitesi | TTS Desteği |
|-----|-----|--------------|-------------|
| 🇹🇷 Türkçe | `tr` | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 🇺🇸 İngilizce (US) | `en-US` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 🇬🇧 İngilizce (UK) | `en-GB` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 🇪🇸 İspanyolca | `es` | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 🇫🇷 Fransızca | `fr` | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 🇩🇪 Almanca | `de` | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 🇯🇵 Japonca | `ja` | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 🇰🇷 Korece | `ko` | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 🇮🇹 İtalyanca | `it` | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 🇵🇹 Portekizce | `pt` | ⭐⭐⭐⭐ | ⭐⭐⭐ |

[Tam Dil Listesi](https://developers.deepgram.com/docs/languages)

---

## 🛠️ Teknoloji Stack

| Kategori | Teknoloji | Versiyon |
|----------|-----------|----------|
| **Framework** | React Native | 0.81.4 |
| **Platform** | Expo | ~54.0 |
| **UI Library** | React | 19.1.0 |
| **Navigasyon** | React Navigation | 7.x |
| **Animasyon** | React Native Reanimated | 4.x |
| **Ses/Video** | Expo AV | 16.x |
| **Dosya Sistemi** | Expo FileSystem | 19.x |
| **AI - STT/TTS** | Deepgram AI (Nova-2, Aura) | REST API |
| **AI - Avatar (D-ID)** | D-ID API | REST API |
| **AI - Avatar (HeyGen)** | HeyGen API | REST API |

---

## 🔥 API Kullanım Örnekleri

### Speech-to-Text

```javascript
import { transcribeAudio } from './services/deepgramService';

// Ses dosyasını transkribe et
const result = await transcribeAudio(audioFileUri);
console.log(result); // "Merhaba, nasılsınız?"
```

### Text-to-Speech

```javascript
import { speakText, textToAudioFile } from './services/ttsService';

// Metni seslendir (direkt oynat)
await speakText("Merhaba, bu bir test mesajıdır.");

// Metni ses dosyasına çevir
const audioUri = await textToAudioFile("Kaydetmek için");
```

### Text-to-Avatar (D-ID)

```javascript
import { textToAvatar } from './services/avatarTTSService';

const result = await textToAvatar(
  "Merhaba, ben bir AI avatarım",
  "https://example.com/avatar.jpg"
);

console.log(result.videoUrl); // Video URL'i
```

### Speech-to-Avatar (Tam Pipeline)

```javascript
import { speechToAvatar } from './services/avatarTTSService';
import { transcribeAudio } from './services/deepgramService';

const result = await speechToAvatar(
  recordingUri,
  avatarImageUrl,
  transcribeAudio
);

console.log(result.transcript); // "Söylediğiniz metin"
console.log(result.videoUrl);   // Avatar video URL'i
```

### HeyGen Avatar Kullanımı

```javascript
import { createVideoFromText } from './services/heygenApiService';

const result = await createVideoFromText(
  "Hello from HeyGen",
  "Aditya_public_4",  // Avatar ID
  "2d5b0e6cf36f460aa7fc47e3eee4ba54"  // Voice ID
);
```

---

## 💰 Maliyet ve Limitler

### Deepgram (STT + TTS)

**Ücretsiz Tier:**
- ✅ $200 kredi (yeni hesaplar)
- ✅ ~46,500 dakika STT
- ✅ ~100M karakter TTS

**Maliyet:**
- **Nova-2 STT**: $0.0043/dakika
- **Aura TTS**: $0.002/1000 karakter

### D-ID (Avatar Videoları)

**Ücretsiz Tier:**
- ✅ 20 talks/gün
- ✅ 5 dakika video/ay
- ⚠️ Watermark var

**Starter Plan ($49/ay):**
- ✅ 100 talks/ay
- ✅ 10 dakika video
- ✅ Watermark yok

**Pro Plan ($300/ay):**
- ✅ Unlimited talks
- ✅ 120 dakika video
- ✅ Premium avatarlar

### HeyGen (Premium Avatarlar)

**Creator Plan ($89/ay):**
- ✅ 30 dakika video/ay
- ✅ 1200+ hazır avatar
- ✅ AI voice cloning

**Business Plan ($300/ay):**
- ✅ 120 dakika video/ay
- ✅ Custom avatarlar
- ✅ API erişimi

### Offline Avatar (ÜCRETSIZ!)

- ✅ **$0** maliyet
- ✅ **Sınırsız** kullanım
- ✅ **İnternet gerekmez**
- ⚠️ Düşük kalite (sprite animasyon)

---

## 🎯 Kullanım Senaryoları

### 1. 📝 Toplantı ve Konferans Notları
- Toplantıları kaydedin
- Otomatik transkript alın
- Avatar ile sunumlar oluşturun

### 2. 🎓 Eğitim ve E-Learning
- Dersleri yazıya dökün
- Avatar öğretmenler oluşturun
- Sesli içerik üretin

### 3. ♿ Erişilebilirlik
- İşitme engelliler için ses-metin dönüşümü
- Görme engelliler için metin-ses dönüşümü
- Avatar tabanlı işaret dili desteği

### 4. 🌐 Dil Öğrenme
- Telaffuz pratiği yapın
- Avatar ile konuşma alıştırmaları
- Metin-ses karşılaştırma

### 5. 📚 İçerik Üretimi
- Sosyal medya videoları
- YouTube içerikleri
- Sesli kitap oluşturma
- Avatar sunumları

### 6. 🤖 Müşteri Hizmetleri
- AI avatar asistanlar
- 7/24 otomatik yanıt
- Çoklu dil desteği

---

## 🐛 Sorun Giderme

### ❌ "API key geçersiz" hatası

**Çözüm:**
1. API key'inizi doğru kopyaladığınızdan emin olun
2. Deepgram/D-ID Console'da key'in aktif olduğunu kontrol edin
3. Ücretsiz kredinizin dolmadığını kontrol edin
4. Settings ekranından key'leri yeniden girin

### ❌ Ses kaydı çalışmıyor

**Çözüm:**
1. Uygulama izinlerini kontrol edin
2. Cihaz ayarlarından mikrofon erişimi verin
3. Fiziksel cihazda test edin (emülatör mikrofonu olmayabilir)
4. İOS: Info.plist'te mikrofon izni ekli mi kontrol edin

### ❌ Avatar videosu oluşturulamıyor

**Çözüm:**
1. D-ID/HeyGen API key'i kontrol edin
2. API limitinizi kontrol edin (günlük/aylık)
3. İnternet bağlantınızı kontrol edin
4. Metin uzunluğunu azaltın (max 300 karakter)
5. Farklı avatar deneyin
6. **Alternatif**: Offline avatar modunu kullanın

### ❌ Video oynatılamıyor

**Çözüm:**
1. Video URL'inin geçerli olduğunu kontrol edin
2. İnternet bağlantınızı test edin
3. Uygulamayı yeniden başlatın
4. Cache'i temizleyin (Settings → Clear Cache)

### ❌ Metro bundler hatası

```bash
npx expo start --clear
```

### ❌ Node modules hatası

```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ "Stream module not found" hatası

**Çözüm**: Bu proje React Native uyumlu REST API kullanır, Deepgram SDK kullanmaz. Sorun devam ederse:
```bash
npm uninstall @deepgram/sdk
rm -rf node_modules
npm install
```

---

## 📚 Kaynaklar ve Dokümantasyon

### Resmi API Dokümantasyonları

- 📖 [Deepgram Documentation](https://developers.deepgram.com/)
- 🎥 [D-ID API Docs](https://docs.d-id.com/)
- 🎭 [HeyGen API Docs](https://docs.heygen.com/)
- 📱 [Expo Documentation](https://docs.expo.dev/)
- ⚛️ [React Native Guide](https://reactnative.dev/docs/getting-started)

### Proje Dokümantasyonları

- 📄 [Avatar Feature Documentation](./AVATAR_FEATURE_DOCUMENTATION.md) - Detaylı avatar sistemi
- 📄 [HeyGen Avatars Fixed](./HEYGEN_AVATARS_FIXED.md) - HeyGen entegrasyonu
- 📄 [Offline Avatar Guide](./OFFLINE_AVATAR_GUIDE.md) - Ücretsiz offline mod
- 📄 [Video Persistence Update](./VIDEO_PERSISTENCE_UPDATE.md) - Video kalıcılık
- 📄 [Setup Guide](./SETUP.md) - Kurulum detayları
- 📄 [Changes Log](./CHANGES.md) - Değişiklikler

### Topluluk ve Destek

- 💬 [GitHub Discussions](https://github.com/19e9/Echomind_App/discussions)
- 🐛 [GitHub Issues](https://github.com/19e9/Echomind_App/issues)
- 📧 Email: Khaledtg17@gmail.com

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Her türlü katkı değerlidir.

### Nasıl Katkıda Bulunabilirsiniz?

1. **🐛 Bug Raporları**: Issue açın
2. **✨ Yeni Özellikler**: Feature request oluşturun
3. **📖 Dokümantasyon**: README veya guides iyileştirin
4. **🌍 Çeviri**: Yeni dil desteği ekleyin
5. **🎨 Avatar Ekleme**: Yeni avatarlar paylaşın

### Pull Request Süreci

1. Fork yapın
2. Feature branch oluşturun
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Değişikliklerinizi commit edin
   ```bash
   git commit -m 'feat: Add amazing feature'
   ```
4. Branch'inizi push edin
   ```bash
   git push origin feature/amazing-feature
   ```
5. Pull Request açın

### Commit Kuralları

[Conventional Commits](https://www.conventionalcommits.org/) standardını kullanın:

- `feat:` - Yeni özellik
- `fix:` - Bug düzeltmesi
- `docs:` - Dokümantasyon
- `style:` - Kod formatı
- `refactor:` - Kod yeniden yapılandırma
- `test:` - Test ekleme/düzeltme
- `chore:` - Genel işler

**Örnek:**
```bash
git commit -m 'feat(avatar): add HeyGen avatar support'
git commit -m 'fix(stt): resolve audio recording issue on iOS'
git commit -m 'docs(readme): update installation instructions'
```

---

## 📄 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır.

```
MIT License

Copyright (c) 2025 Khalid & İrem Altunay

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Geliştiriciler

### Proje Sahipleri

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/19e9">
        <img src="https://github.com/19e9.png" width="100px;" alt="Khalid"/>
        <br />
        <sub><b>Khalid Tariq</b></sub>
      </a>
      <br />
      <a href="mailto:Khaledtg17@gmail.com">📧 Email</a> •
      <a href="https://linkedin.com/in/khalid-tariq">💼 LinkedIn</a>
    </td>
    <td align="center">
      <a href="https://www.linkedin.com/in/irem-altunay-a88893251/">
        <img src="https://via.placeholder.com/100" width="100px;" alt="İrem"/>
        <br />
        <sub><b>İrem Altunay</b></sub>
      </a>
      <br />
      <a href="https://www.linkedin.com/in/irem-altunay-a88893251/">💼 LinkedIn</a>
    </td>
  </tr>
</table>

### Katkıda Bulunanlar

Bu projeye katkıda bulunan herkese teşekkürler! 🙏

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- Buraya katkıda bulunanlar eklenecek -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

---

## 🌟 Teşekkürler

Bu proje aşağıdaki harika platformlar ve topluluklar sayesinde mümkün oldu:

- [**Deepgram**](https://deepgram.com/) - Güçlü AI STT/TTS servisleri
- [**D-ID**](https://www.d-id.com/) - Konuşan avatar teknolojisi
- [**HeyGen**](https://www.heygen.com/) - Profesyonel avatar videoları
- [**Expo**](https://expo.dev/) - Harika React Native platformu
- [**React Native Community**](https://reactnative.dev/) - Sürekli gelişen ekosistem

---

## 🚀 Yol Haritası

### Yakın Gelecek (v1.4)
- [ ] 🎨 Custom avatar upload (kendi fotoğrafınızı yükleyin)
- [ ] 📹 Video indirme ve paylaşma
- [ ] 📜 Video geçmişi (son 10 video)
- [ ] 🌍 Türkçe TTS avatar desteği
- [ ] 🎭 Daha fazla emotion seçeneği

### Orta Vadeli (v1.5-2.0)
- [ ] ⚡ Real-time WebRTC streaming (canlı avatar konuşması)
- [ ] 🎬 Çoklu avatar konuşmaları (diyalog)
- [ ] 🎨 Avatar arka plan seçimi
- [ ] 🤖 Emotion AI (mutlu/üzgün otomatik algılama)
- [ ] 📱 Tablet optimizasyonu

### Uzun Vadeli (v2.0+)
- [ ] 🕶️ 3D avatar desteği
- [ ] 🥽 AR entegrasyonu
- [ ] 🎮 Avatar gesture kontrolü
- [ ] 🧠 GPT entegrasyonu (konuşma AI)
- [ ] 🌐 Web uygulama versiyonu

---

## 📊 İstatistikler

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/19e9/Echomind_App?style=social)
![GitHub forks](https://img.shields.io/github/forks/19e9/Echomind_App?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/19e9/Echomind_App?style=social)

![GitHub issues](https://img.shields.io/github/issues/19e9/Echomind_App)
![GitHub pull requests](https://img.shields.io/github/issues-pr/19e9/Echomind_App)
![GitHub last commit](https://img.shields.io/github/last-commit/19e9/Echomind_App)
![GitHub code size](https://img.shields.io/github/languages/code-size/19e9/Echomind_App)

</div>

---

## 🎬 Demo ve Ekran Görüntüleri

### Ana Ekran
> Speech-to-Text, Text-to-Speech ve Avatar modları

### Avatar Seçimi
> 20+ hazır avatar: D-ID, HeyGen, Offline

### Konuşan Avatar
> Gerçek zamanlı lip-sync ile AI avatar videoları

### Ayarlar Ekranı
> Kapsamlı konfigürasyon seçenekleri

---

## 🏆 Özellikler ve Başarılar

- ✅ **100% React Native Uyumlu** (Node.js modülü yok)
- ✅ **Multi-Platform** (iOS, Android, Web)
- ✅ **Multi-API Desteği** (Deepgram + D-ID + HeyGen)
- ✅ **Offline Mod** (İnternet gerektirmez)
- ✅ **REST API** (SDK dependency yok)
- ✅ **Modern UI/UX** (Reanimated animasyonlar)
- ✅ **Comprehensive Error Handling**
- ✅ **Cache System** (Performans optimizasyonu)
- ✅ **Extensive Documentation**

---

<div align="center">

## ⭐ Projeyi Beğendiyseniz Yıldız Vermeyi Unutmayın!

**Yapım Aşamasında:** 🔨 v1.3  
**Son Güncelleme:** 26 Ekim 2025  
**Versiyon Notları:** Avatar Sistemi + Video Persistence + HeyGen Entegrasyonu

---

Made with ❤️ using [Deepgram AI](https://deepgram.com/), [D-ID](https://www.d-id.com/), [HeyGen](https://www.heygen.com/)

[🔝 Başa Dön](#-echomind-app)

---

**© 2025 Echomind App - All Rights Reserved**

</div>
