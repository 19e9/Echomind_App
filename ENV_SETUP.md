# 🔐 Environment Variables Setup

## API Keys Configuration

Bu dosya, **VoiceDock** özelliği için gerekli API key'lerini nasıl ayarlayacağınızı gösterir.

---

## 📋 Gerekli API Keys

### 1️⃣ Deepgram API (ZORUNLU - STT/TTS)

**Nedir?** Speech-to-Text ve Text-to-Speech için.

**Nasıl Alınır:**
1. [console.deepgram.com](https://console.deepgram.com/) adresine gidin
2. Ücretsiz hesap oluşturun ($200 kredi)
3. API Keys → Create New Key
4. Key'i kopyalayın

**Ayarlama:**
```javascript
// config/deepgramConfig.js
export const DEEPGRAM_CONFIG = {
  apiKey: "YOUR_DEEPGRAM_API_KEY_HERE",
  // ...
};
```

---

### 2️⃣ D-ID API (İSTEĞE BAĞLI - Avatar Videoları)

**Nedir?** Konuşan avatar videoları oluşturmak için.

**Nasıl Alınır:**
1. [studio.d-id.com](https://studio.d-id.com/) adresine gidin
2. Ücretsiz hesap oluşturun (20 video/gün)
3. Settings → API Keys → Create New Key
4. Key'i kopyalayın

**Ayarlama:**
```javascript
// config/avatarConfig.js
export const AVATAR_CONFIG = {
  didApiKey: "YOUR_DID_API_KEY_HERE",
  // ...
};
```

**Ücretsiz Tier:**
- ✅ 20 talks/gün
- ✅ 5 dakika video/ay
- ⚠️ Watermark var

---

### 3️⃣ HeyGen API (İSTEĞE BAĞLI - Premium Avatarlar)

**Nedir?** 1200+ profesyonel hazır avatar.

**Nasıl Alınır:**
1. [heygen.com](https://www.heygen.com/) hesabı oluşturun
2. API key alın
3. Key'i kopyalayın

**Ayarlama:**
```javascript
// config/avatarConfig.js
export const AVATAR_CONFIG = {
  heygenApiKey: "YOUR_HEYGEN_API_KEY_HERE",
  // ...
};
```

---

## 🚀 Quick Setup

### Adım 1: Deepgram Key'i Ayarla (Zorunlu)

```javascript
// config/deepgramConfig.js
export const DEEPGRAM_CONFIG = {
  apiKey: "d0f1e3203e7ddad088744c51508dc9b72c4bc76a", // ❌ BURAYA KENDİ KEY'İNİZİ YAYIN
  
  stt: {
    model: "nova-2",
    language: "tr",
    smartFormat: true,
    punctuate: true,
    interim_results: true, // ⭐ VoiceDock için önemli
  },
  
  tts: {
    model: "aura-asteria-en",
    encoding: "linear16",
    container: "wav",
  },
};
```

### Adım 2: D-ID Key'i Ayarla (İsteğe Bağlı)

```javascript
// config/avatarConfig.js
export const AVATAR_CONFIG = {
  didApiKey: "your_did_api_key", // ❌ BURAYA KENDİ KEY'İNİZİ YAYIN
  heygenApiKey: "", // İsteğe bağlı
  
  mode: 'online', // 'online' | 'offline'
  defaultProvider: 'did', // 'did' | 'heygen'
  
  // ...
};
```

### Adım 3: Uygulamayı Yeniden Başlat

```bash
# Metro bundler'ı yeniden başlat
npx expo start --clear
```

---

## 🔒 Güvenlik Notları

### ❌ YAPMAYIN:
```javascript
// Hard-coded keys (KÖTÜ!)
const API_KEY = "d0f1e3203e7ddad088744c51508dc9b72c4bc76a";
```

### ✅ YAPIN:
```javascript
// Config dosyasında tutun
import { DEEPGRAM_CONFIG } from '../config/deepgramConfig';
const API_KEY = DEEPGRAM_CONFIG.apiKey;
```

### 🔐 Production İçin:
```javascript
// expo-constants kullanın
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

### 📝 .gitignore'a Ekleyin:
```gitignore
# API Keys
.env
.env.local
.env.production

# Config (eğer key içeriyorsa)
config/deepgramConfig.js
config/avatarConfig.js
```

---

## 💰 Maliyet Bilgileri

### Deepgram (STT + TTS)
- **Ücretsiz**: $200 kredi
  - ~46,500 dakika STT
  - ~100M karakter TTS
- **Ücretli**:
  - Nova-2 STT: $0.0043/dakika
  - Aura TTS: $0.002/1000 karakter

### D-ID (Avatar)
- **Ücretsiz**: 20 talks/gün, 5 dakika/ay
- **Starter**: $49/ay
  - 100 talks/ay
  - 10 dakika video
  - Watermark yok
- **Pro**: $300/ay
  - Unlimited talks
  - 120 dakika video

### HeyGen (Premium Avatarlar)
- **Creator**: $89/ay
  - 30 dakika video/ay
  - 1200+ avatar
- **Business**: $300/ay
  - 120 dakika video/ay
  - Custom avatarlar

---

## 🧪 Test Etme

### 1. Deepgram Bağlantısını Test Et

```bash
# Ana ekranda mikrofon butonuna bas
# Konuş → Transkripsiyon görünmeli
```

### 2. D-ID Bağlantısını Test Et

```bash
# Ana ekranda:
# 1. Avatar modunu aç
# 2. Metin yaz
# 3. "Seslendir" butonuna bas
# 4. 15-30 saniye bekle
# 5. Video oynatılmalı ✅
```

### 3. VoiceDock'u Test Et

```bash
# Ana ekranda "🎤 Hızlı Sesli Dikte" butonuna bas
# → Panel açılmalı
# → "Başlat" → Konuş → Interim results görünmeli
# → "Durdur" → Final transcript görünmeli
# → "Avatar Konuşsun" → Video oluşmalı ✅
```

---

## ❗ Sık Karşılaşılan Hatalar

### 1. "API key geçersiz"
```bash
# Çözüm:
# - Key'i doğru kopyaladığınızdan emin olun
# - Deepgram/D-ID Console'da key'in aktif olduğunu kontrol edin
# - Metro bundler'ı yeniden başlatın: npx expo start --clear
```

### 2. "WebSocket connection failed"
```bash
# Çözüm:
# - İnternet bağlantınızı kontrol edin
# - Deepgram API key'in WebSocket yetkisi olduğundan emin olun
# - Firewall/proxy ayarlarını kontrol edin
```

### 3. "Avatar videosu oluşturulamadı"
```bash
# Çözüm:
# - D-ID API key'i kontrol edin
# - Günlük limitinizi kontrol edin (20 talk/gün)
# - Metin uzunluğunu azaltın (max 300 karakter)
```

---

## 📚 Daha Fazla Bilgi

- [Deepgram Docs](https://developers.deepgram.com/)
- [D-ID Docs](https://docs.d-id.com/)
- [HeyGen Docs](https://docs.heygen.com/)
- [Expo Constants](https://docs.expo.dev/versions/latest/sdk/constants/)

---

**© 2025 Echomind App**  
**Güvenlik**: API key'lerinizi asla GitHub'a yüklemeyin!

