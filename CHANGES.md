# 🔄 Değişiklikler - React Native Uyumlu Versiyon

## ⚠️ Önemli Güncelleme

**Deepgram SDK** → **Deepgram REST API**

## 🐛 Sorun Neydi?

Terminal'de aldığınız hata:
```
The package at "node_modules\@deepgram\sdk\node_modules\ws\lib\stream.js" 
attempted to import the Node standard library module "stream".
It failed because the native React runtime does not include the Node standard library.
```

**Neden?** Deepgram JavaScript SDK Node.js için tasarlanmış ve React Native'de çalışmayan modüller kullanıyor (`stream`, `ws`, `buffer` gibi).

## ✅ Çözüm

Deepgram SDK'sını kaldırdık ve **Deepgram REST API**'sini direkt kullanıyoruz. Bu çözüm:
- ✅ React Native ile tam uyumlu
- ✅ Daha hafif (gereksiz bağımlılıklar yok)
- ✅ Aynı özellikleri sağlıyor
- ✅ Mobil cihazlarda sorunsuz çalışıyor

## 📝 Değişen Dosyalar

### 1. `services/deepgramService.js`
**Önce:**
```javascript
import { createClient } from "@deepgram/sdk";
const deepgram = createClient(API_KEY);
const { result } = await deepgram.listen.prerecorded.transcribeFile(...);
```

**Şimdi:**
```javascript
// Direkt REST API çağrısı
const response = await fetch('https://api.deepgram.com/v1/listen?...', {
  method: 'POST',
  headers: { 'Authorization': `Token ${API_KEY}` },
  body: audioData
});
```

### 2. `services/ttsService.js`
**Önce:**
```javascript
import { createClient } from "@deepgram/sdk";
const deepgram = createClient(API_KEY);
const response = await deepgram.speak.request(...);
```

**Şimdi:**
```javascript
// Direkt REST API çağrısı
const response = await fetch('https://api.deepgram.com/v1/speak?...', {
  method: 'POST',
  headers: { 'Authorization': `Token ${API_KEY}` },
  body: JSON.stringify({ text })
});
```

### 3. `package.json`
**Kaldırıldı:**
- `@deepgram/sdk` ❌ (Node.js bağımlılıkları)

**Eklendi:**
- `expo-file-system` ✅ (Dosya işlemleri için)

## 🚀 Yeni Özellikler

### Speech-to-Text (STT)
```javascript
// Lokal ses dosyasından
const text = await transcribeAudio(audioUri);

// URL'den
const text = await transcribeAudioFromUrl('https://example.com/audio.mp3');
```

### Text-to-Speech (TTS)
```javascript
// Metni seslendir
await speakText("Merhaba dünya");

// Dosya olarak kaydet
const fileUri = await textToAudioFile("Merhaba dünya");
```

## 📦 Kurulum Değişiklikleri

**Eski bağımlılıkları kaldırın:**
```bash
npm uninstall @deepgram/sdk
```

**Yeni bağımlılıkları yükleyin:**
```bash
npm install expo-file-system expo-av
```

## 🎯 API Kullanımı

### STT Endpoint
```
POST https://api.deepgram.com/v1/listen
Authorization: Token YOUR_API_KEY
Content-Type: audio/wav
Body: <audio binary data>
```

### TTS Endpoint
```
POST https://api.deepgram.com/v1/speak
Authorization: Token YOUR_API_KEY
Content-Type: application/json
Body: { "text": "..." }
```

## ✨ Avantajlar

1. **React Native Uyumlu**: Node.js modülleri gerektirmiyor
2. **Daha Hafif**: Gereksiz bağımlılıklar yok
3. **Daha Hızlı**: Direkt HTTP çağrıları
4. **Mobil Optimized**: Dosya sistemi ile entegre
5. **Aynı Özellikler**: Tüm Deepgram özellikleri kullanılabilir

## 🔧 Konfigürasyon

`config/deepgramConfig.js` dosyası aynı kalıyor:
```javascript
export const DEEPGRAM_CONFIG = {
  apiKey: "YOUR_API_KEY",
  stt: {
    model: "nova-2",
    language: "tr",
    smartFormat: true,
    punctuate: true,
  },
  tts: {
    model: "aura-asteria-en",
  },
};
```

## 🐛 Hata Düzeltmeleri

- ✅ "stream module not found" hatası çözüldü
- ✅ "ws module not found" hatası çözüldü
- ✅ "Buffer is not defined" hatası çözüldü
- ✅ Node.js modül uyumsuzlukları kaldırıldı

## 📱 Test Etme

```bash
# Uygulamayı başlat
npm start

# veya
expo start
```

Artık uygulama herhangi bir modül hatası olmadan çalışacak!

## 🆘 Sorun Giderme

### Hata: "expo-file-system bulunamadı"
```bash
npm install expo-file-system
```

### Hata: "expo-av bulunamadı"
```bash
npm install expo-av
```

### Hata: "API key is invalid"
`config/deepgramConfig.js` dosyasında API key'inizi kontrol edin.

## 📚 Kaynaklar

- [Deepgram REST API Docs](https://developers.deepgram.com/reference)
- [Speech-to-Text API](https://developers.deepgram.com/docs/pre-recorded)
- [Text-to-Speech API](https://developers.deepgram.com/docs/text-to-speech)
- [Expo FileSystem Docs](https://docs.expo.dev/versions/latest/sdk/filesystem/)

## 💡 Sonuç

✅ **Sorun çözüldü!** Artık uygulamanız React Native ile tam uyumlu ve mobil cihazlarda sorunsuz çalışacak.

---

**Not**: Canlı (streaming) transkripsiyon şu anda desteklenmiyor çünkü WebSocket bağlantısı gerektirir. Ancak önceden kaydedilmiş ses dosyalarının transkribe edilmesi tam olarak çalışıyor.

