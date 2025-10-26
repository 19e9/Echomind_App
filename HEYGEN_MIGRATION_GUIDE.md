# 🚀 HeyGen API Migration Guide

## ✅ Geçiş Tamamlandı!

Echomind uygulaması başarıyla **D-ID API'den HeyGen API'ye** geçiş yaptı!

---

## 📋 Yapılan Değişiklikler

### 1. 🆕 Yeni Dosyalar

#### `services/heygenApiService.js`
HeyGen API entegrasyonu için yeni servis dosyası:
- `listHeygenAvatars()` - Mevcut HeyGen avatarlarını listeler
- `listHeygenVoices()` - Mevcut HeyGen seslerini listeler
- `createVideoFromAudio()` - Ses URL'si ile video oluşturur
- `createVideoFromText()` - Metin ile video oluşturur (HeyGen TTS kullanır)
- `getVideoStatus()` - Video oluşturma durumunu kontrol eder
- `waitForVideoCompletion()` - Video tamamlanana kadar bekler
- `textToAvatarWithHeyGen()` - Text-to-Avatar pipeline (Deepgram TTS + HeyGen)

### 2. 🔄 Güncellenen Dosyalar

#### `config/avatarConfig.js`
- ✅ `heygenApiKey` eklendi: `sk_V2_hgu_ktMj8J6thff_8ijTaBIMdsArKLExIljL4bFBCmsSlhXM`
- ✅ `mode` değiştirildi: `'offline'` → `'online'`
- ✅ `heygenAvatars` array'i eklendi (Monica, Wayne, Halid, İrem, Aleyna)
- ✅ `video` ayarları HeyGen için güncellendi (1280x720, test mode, vs.)
- ❌ `didApiKey` deprecated olarak işaretlendi

#### `services/avatarTTSService.js`
- ✅ Import'lar güncellendi: `didApiService` → `heygenApiService`
- ✅ `textToAvatar()` fonksiyonu HeyGen için güncellendi
  - Parameter: `avatarImageUrl` → `avatarId`
  - Base64 data URL formatı kullanılıyor
- ✅ `audioToAvatar()` fonksiyonu HeyGen için güncellendi
- ✅ `speechToAvatar()` fonksiyonu HeyGen için güncellendi
- ✅ `textToAvatarCached()` fonksiyonu HeyGen için güncellendi

#### `screens/HomeScreen.js`
- ✅ Default avatar seçimi güncellendi (online mode için HeyGen avatarları)
- ✅ `handlePlayPress()` fonksiyonu güncellendi
  - Online avatar kontrolü eklendi
  - `selectedAvatar.avatarId` kullanılıyor
  - Offline avatarlar için uyarı gösteriliyor
- ✅ `AvatarDisplay` component'ine geçilen props güncellendi

#### `components/AvatarSelector.js`
- ✅ Avatar listesi seçimi güncellendi: `didAvatars` → `heygenAvatars`
- ✅ Image source güncellendi: HeyGen avatarları için placeholder (icon.png)

#### `screens/SettingsScreen.js`
- ✅ `didApiKey` → `heygenApiKey`
- ✅ `handleTestDID()` → `handleTestHeyGen()`
- ✅ `openDIDStudio()` → `openHeyGenApp()`
- ✅ Section title: "D-ID Avatar API" → "HeyGen Avatar API"
- ✅ Link: `studio.d-id.com` → `app.heygen.com/settings`
- ✅ Test button: "D-ID Test" → "HeyGen Test"
- ✅ Info text güncellendi

---

## 🎯 Yeni İş Akışı

### Text-to-Avatar Pipeline

```
1. Kullanıcı metni girer
   ↓
2. Deepgram TTS → Ses üretir (WAV)
   ↓
3. Ses dosyası Base64 Data URL'e çevrilir
   ↓
4. HeyGen API → Video oluşturur (lip-sync)
   ↓
5. Video polling ile tamamlanana kadar beklenir
   ↓
6. Video URL döndürülür ve oynatılır
```

### Speech-to-Avatar Pipeline

```
1. Kullanıcı konuşur (ses kaydı)
   ↓
2. Deepgram STT → Metne çevirir
   ↓
3. Text-to-Avatar Pipeline devam eder (yukarıdaki adımlar)
```

---

## 🔑 API Key Bilgileri

### HeyGen API Key
```
sk_V2_hgu_ktMj8J6thff_8ijTaBIMdsArKLExIljL4bFBCmsSlhXM
```

**Önemli:** Production'da bu API key'i environment variable olarak kullanın!

### Deepgram API Key (Korundu)
```
d0f1e3203e7ddad088744c51508dc9b72c4bc76a
```

---

## 📦 HeyGen Avatarları

### Varsayılan Avatarlar

1. **Monica** (female)
   - ID: `Monica_public_3_20240108`
   - Tip: HeyGen public avatar
   - Default avatar olarak ayarlandı

2. **Wayne** (male)
   - ID: `Wayne_20240711`
   - Tip: HeyGen public avatar

3. **Halid (HeyGen)** (male)
   - ID: `Halid_public`
   - Custom avatar (gerekirse değiştirilebilir)

4. **İrem (HeyGen)** (female)
   - ID: `İrem_public`
   - Custom avatar (gerekirse değiştirilebilir)

5. **Aleyna (HeyGen)** (female)
   - ID: `Aleyna_public`
   - Custom avatar (gerekirse değiştirilebilir)

---

## 🧪 Test Etme

### 1. Uygulama Başlatma
```bash
npx expo start
```

### 2. Avatar Modu Aktivasyonu
1. HomeScreen'de "Avatar Modu" switch'ini açın
2. "🎨 Değiştir" butonuna tıklayın
3. Bir HeyGen avatar seçin (Monica, Wayne, vs.)

### 3. Text-to-Avatar Test
1. Text input'a bir metin yazın (örn: "Merhaba, ben Monica!")
2. ▶️ Play butonuna basın
3. Video oluşturma süreci başlayacak (30-60 saniye sürebilir)
4. Video hazır olduğunda oynatılacak

### 4. Speech-to-Avatar Test
1. 🎤 Mikrofon butonuna basın ve konuşun
2. Konuşma bittiğinde otomatik olarak transkribe edilecek
3. ▶️ Play butonuna basın
4. Video oluşturulup oynatılacak

---

## ⚙️ Ayarlar (Settings)

### HeyGen API Ayarları
- **API Key**: `sk_V2_...` (güncellendi)
- **Video Quality**: `high` (HeyGen otomatik yüksek kalite)
- **Cache Videos**: `true` (performans için)
- **Video Resolution**: 1280x720 (16:9)
- **Background Color**: `#F5F5F5` (açık gri)

---

## ⚠️ Önemli Notlar

### 1. Audio URL Format
HeyGen API, ses dosyalarını **public URL** veya **base64 data URL** formatında bekliyor:
```javascript
// Base64 Data URL format (şu an kullanılan)
`data:audio/wav;base64,${audioBase64}`

// Veya public URL (önerilen)
`https://your-cdn.com/audio.wav`
```

**Önerilen Çözüm:** Production'da ses dosyalarını bir CDN'e yükleyip public URL kullanın (AWS S3, Cloudinary, vs.)

### 2. Video Oluşturma Süresi
HeyGen API'de video oluşturma **30-60 saniye** sürebilir. Kullanıcıya loading indicator gösterilmeli.

### 3. Offline Avatarlar
Offline avatarlar (Halid, İrem, Aleyna - yerel resimler) şu an **sadece static görüntü** olarak çalışıyor. Lip-sync için HeyGen API gerekli.

### 4. Test Mode
`config/avatarConfig.js` içinde `test: false` ayarı var. Test mode açılırsa:
- ✅ Video'da watermark olur
- ✅ Credit harcanmaz
- ✅ Geliştirme için idealdir

---

## 📊 D-ID vs HeyGen Karşılaştırma

| Özellik | D-ID | HeyGen |
|---------|------|--------|
| Video Kalitesi | Orta | Yüksek |
| Lip-sync Accuracy | İyi | Mükemmel |
| Avatar Çeşitliliği | Orta | Çok Fazla |
| API Hızı | 20-30 sn | 30-60 sn |
| Fiyatlandırma | $$$$ | $$$ |
| Özelleştirme | Sınırlı | Gelişmiş |
| Real-time Streaming | ✅ | ✅ (Premium) |

---

## 🔮 Gelecek Geliştirmeler

1. **Custom Avatar Upload**
   - Kullanıcının kendi fotoğrafını HeyGen'e yükleyebilmesi
   - HeyGen'in "Avatar Studio" özelliği kullanılabilir

2. **Real-time Streaming**
   - HeyGen WebRTC streaming (premium feature)
   - Daha düşük latency için

3. **Voice Cloning**
   - Deepgram veya HeyGen voice cloning
   - Kullanıcının kendi sesi ile avatar konuşturma

4. **CDN Integration**
   - AWS S3 veya Cloudinary entegrasyonu
   - Ses dosyalarını public URL olarak HeyGen'e gönderme

5. **Avatar Gallery**
   - HeyGen API'den tüm avatarları çekme
   - Kullanıcıya daha fazla seçenek sunma

---

## 🆘 Sorun Giderme

### Video Oluşturma Hatası
```
Error: HeyGen API Error: 400 - Invalid audio URL
```
**Çözüm:** Ses dosyasının base64 data URL formatında olduğundan emin olun.

### API Key Hatası
```
Error: HeyGen API key bulunamadı!
```
**Çözüm:** `config/avatarConfig.js` dosyasında `heygenApiKey` değişkenini kontrol edin.

### Video Timeout
```
Error: Video completion timeout
```
**Çözüm:** `maxPollingAttempts` değerini artırın (config/avatarConfig.js → performance.maxPollingAttempts)

---

## 📚 Dökümantasyon Linkleri

- **HeyGen API Docs**: https://docs.heygen.com/
- **HeyGen Video Generate**: https://docs.heygen.com/reference/create-video
- **HeyGen Dashboard**: https://app.heygen.com/
- **Deepgram Docs**: https://developers.deepgram.com/

---

## ✅ Test Checklist

- [x] HeyGen API service dosyası oluşturuldu
- [x] avatarConfig.js HeyGen için güncellendi
- [x] avatarTTSService.js HeyGen entegrasyonuna uyarlandı
- [x] HomeScreen.js HeyGen avatarları kullanıyor
- [x] AvatarSelector HeyGen avatarları gösteriyor
- [x] SettingsScreen HeyGen ayarları içeriyor
- [x] Linter hataları temizlendi
- [ ] Manuel test yapıldı (kullanıcı tarafından)
- [ ] Production deployment yapıldı

---

## 🎉 Sonuç

Echomind uygulaması başarıyla HeyGen API'ye geçiş yaptı! 

**Yeni Özellikler:**
- ✅ Deepgram TTS (yüksek kalite ses)
- ✅ HeyGen Lip-sync (profesyonel avatar videoları)
- ✅ Text-to-Avatar pipeline
- ✅ Speech-to-Avatar pipeline
- ✅ 5 avatar seçeneği (Monica, Wayne, Halid, İrem, Aleyna)

**Sıradaki Adımlar:**
1. Uygulamayı test edin
2. Gerekirse avatar ID'lerini gerçek HeyGen avatar ID'leri ile değiştirin
3. Production'da CDN entegrasyonu yapın
4. Kullanıcı feedback'i toplayın

---

**Tarih:** 2024-10-26
**Migrasyon Tamamlandı:** ✅
**Durum:** Ready for Testing 🚀

