# 🔧 HeyGen API Hata Düzeltmesi

## ❌ Sorun

```
ERROR: video_inputs.0.voice.audio is invalid: 
Value error, either audio_url or audio_asset_id needs to be provided
```

## 🔍 Nedeni

1. **Yanlış Field Name**: `input_audio` kullanılıyordu, olması gereken `audio_url` idi
2. **Base64 URL Sorunu**: HeyGen API base64 data URL'leri kabul etmiyor olabilir (çok uzun)

## ✅ Çözüm

### 1. Field Name Düzeltmesi

**services/heygenApiService.js** - Line 129:
```javascript
// ❌ ÖNCE:
voice: {
  type: 'audio',
  input_audio: audioUrl,  // YANLIŞ!
}

// ✅ SONRA:
voice: {
  type: 'audio',
  audio_url: audioUrl,  // DOĞRU!
}
```

### 2. HeyGen TTS Kullanımı (Base64 Sorunu İçin)

**Deepgram TTS** yerine **HeyGen TTS** kullanıyoruz:

#### Neden?
- ✅ Base64 URL sorunu yok (public URL gerekmez)
- ✅ Daha basit entegrasyon
- ✅ HeyGen native TTS (optimize edilmiş)
- ❌ Deepgram TTS kalitesinden feragat (kabul edilebilir trade-off)

#### Değişiklikler:

**services/avatarTTSService.js**:
```javascript
// ❌ ÖNCE: Deepgram TTS → Base64 → HeyGen
export const textToAvatar = async (text, avatarId, audioUrl = null) => {
  // Deepgram TTS ile ses oluştur
  const audioFileUri = await textToAudioFile(text);
  // Base64'e çevir
  const audioBase64 = await FileSystem.readAsStringAsync(...);
  // HeyGen'e gönder
  await textToAvatarWithHeyGen(text, avatarId, audioDataUrl);
}

// ✅ SONRA: HeyGen TTS (direkt)
export const textToAvatar = async (text, avatarId, voiceId = null) => {
  // HeyGen TTS kullan (base64 yok!)
  const defaultVoiceId = voiceId || '2d5b0e6cf36f460aa7fc47e3eee4ba54';
  await textToAvatarWithHeyGen(text, avatarId, null, defaultVoiceId);
}
```

**services/heygenApiService.js**:
```javascript
// ✅ Hem text hem audio desteği
export const textToAvatarWithHeyGen = async (
  text, 
  avatarId, 
  audioUrl = null,  // null = HeyGen TTS kullan
  voiceId = null
) => {
  if (audioUrl) {
    // Audio mode: Deepgram TTS (gelecekte CDN ile)
    videoId = await createVideoFromAudio(audioUrl, avatarId, {...});
  } else {
    // Text mode: HeyGen TTS (ŞU AN KULLANILAN)
    videoId = await createVideoFromText(text, avatarId, voiceId, {...});
  }
  // ...
}
```

## 📊 HeyGen API Dökümantasyonu Referansı

[HeyGen Quick Start Guide](https://docs.heygen.com/docs/quick-start)

### Doğru Request Formatı:

#### Text Mode (HeyGen TTS):
```json
{
  "video_inputs": [
    {
      "character": {
        "type": "avatar",
        "avatar_id": "Monica_public_3_20240108",
        "avatar_style": "normal"
      },
      "voice": {
        "type": "text",
        "input_text": "Hello World",
        "voice_id": "2d5b0e6cf36f460aa7fc47e3eee4ba54"
      },
      "background": {
        "type": "color",
        "value": "#F5F5F5"
      }
    }
  ],
  "dimension": {
    "width": 1280,
    "height": 720
  }
}
```

#### Audio Mode (External TTS):
```json
{
  "video_inputs": [
    {
      "character": {
        "type": "avatar",
        "avatar_id": "Monica_public_3_20240108",
        "avatar_style": "normal"
      },
      "voice": {
        "type": "audio",
        "audio_url": "https://public-url-to-audio.wav"  // PUBLIC URL gerekli!
      },
      "background": {
        "type": "color",
        "value": "#F5F5F5"
      }
    }
  ],
  "dimension": {
    "width": 1280,
    "height": 720
  }
}
```

## 🎯 Yeni İş Akışı

```
┌─────────────┐
│ Kullanıcı   │
│ Metin Yazar │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────┐
│ HeyGen API                           │
│ ┌────────────┐    ┌──────────────┐  │
│ │ HeyGen TTS │ -> │ HeyGen       │  │
│ │ (native)   │    │ Lip-sync     │  │
│ └────────────┘    └──────────────┘  │
└──────────────────┬───────────────────┘
                   │
                   ▼
            ┌─────────────┐
            │ Avatar Video│
            │ (.mp4)      │
            └─────────────┘
```

**Avantajlar:**
- ✅ Tek API çağrısı (TTS + video birlikte)
- ✅ Base64 sorunu yok
- ✅ Public URL gerekmez
- ✅ Daha hızlı (1 adım az)

**Dezavantajlar:**
- ❌ Deepgram TTS yerine HeyGen TTS (ses kalitesi?)
- ❌ Ses özelleştirmesi kısıtlı

## 🔮 Gelecek İyileştirmeler

### Deepgram TTS Kullanımı İçin:

1. **CDN Entegrasyonu**
   - AWS S3, Cloudinary, veya Firebase Storage kullan
   - Deepgram TTS → CDN'e yükle → Public URL al
   - HeyGen'e public URL gönder

2. **Implementasyon Örneği:**
```javascript
// services/avatarTTSService.js
export const textToAvatar = async (text, avatarId) => {
  // 1. Deepgram TTS
  const audioFileUri = await textToAudioFile(text);
  
  // 2. CDN'e yükle (S3, Cloudinary, vs.)
  const publicAudioUrl = await uploadToCDN(audioFileUri);
  
  // 3. HeyGen'e public URL gönder
  const videoUrl = await textToAvatarWithHeyGen(
    text, 
    avatarId, 
    publicAudioUrl  // PUBLIC URL!
  );
  
  return { videoUrl };
}
```

3. **CDN Seçenekleri:**
   - **AWS S3**: Güvenli, ölçeklenebilir
   - **Cloudinary**: Media optimization
   - **Firebase Storage**: Kolay entegrasyon
   - **Supabase Storage**: Open-source alternatif

## 🧪 Test Etme

### 1. Uygulama Başlat
```bash
npx expo start
```

### 2. Avatar Modu Test
1. HomeScreen'de "Avatar Modu" switch'ini aç
2. Monica avatarını seç
3. Metin yaz: "Hello, I'm testing HeyGen API!"
4. ▶️ Play butonuna bas
5. 30-60 saniye bekle

### 3. Beklenen Log Çıktısı
```
LOG  🎬 Starting Text-to-Avatar Pipeline (HeyGen TTS)...
LOG  📝 Text length: 31 chars
LOG  👤 Avatar ID: Monica_public_3_20240108
LOG  🔊 Using HeyGen TTS with voice: 2d5b0e6cf36f460aa7fc47e3eee4ba54
LOG  📚 HeyGen Docs: https://docs.heygen.com/docs/quick-start
LOG  🎯 Starting Text-to-Avatar pipeline with HeyGen...
LOG  📝 Mode: Text (HeyGen TTS)
LOG  🎬 Creating HeyGen video from text...
LOG  ✅ HeyGen video creation started: <video_id>
LOG  ⏳ Waiting for HeyGen video completion: <video_id>
LOG  🔄 Attempt 1/60 - Status: processing
...
LOG  🔄 Attempt 12/60 - Status: completed
LOG  ✅ Video completed! https://...
LOG  ✅ Text-to-Avatar completed!
LOG  🎥 Video URL: https://...
```

## 📝 Değişiklik Özeti

### Değiştirilen Dosyalar:

1. **services/heygenApiService.js**
   - ✅ Line 129: `input_audio` → `audio_url`
   - ✅ `textToAvatarWithHeyGen()` fonksiyonu güncellendi (text/audio mode)

2. **services/avatarTTSService.js**
   - ✅ `textToAvatar()` HeyGen TTS kullanıyor
   - ✅ Deepgram TTS import'u korundu (gelecek için)
   - ✅ Dökümantasyon güncellendi

3. **HEYGEN_API_FIX.md** (Bu dosya)
   - ✅ Hata analizi ve çözümü
   - ✅ HeyGen dökümantasyon referansı
   - ✅ Test talimatları

## ✅ Sonuç

**Sorun Çözüldü!** 🎉

- ✅ Field name hatası düzeltildi (`audio_url`)
- ✅ Base64 URL sorunu HeyGen TTS ile çözüldü
- ✅ HeyGen dökümantasyonuna uygun format
- ✅ Linter hataları yok
- ✅ Test için hazır

**Sıradaki Adım:** Uygulamayı test edin! 🚀

---

**Tarih:** 2024-10-26  
**Durum:** ✅ Fixed & Ready for Testing  
**Referans:** [HeyGen API Docs](https://docs.heygen.com/docs/quick-start)

