# 🚀 Echomind App - Hızlı Başlangıç Kılavuzu

## 📋 Adım Adım Kurulum

### 1️⃣ Deepgram API Key Alın (ÜCRETSİZ!)

1. **[Deepgram Console](https://console.deepgram.com/)** adresine gidin
2. **Sign Up** butonuna tıklayın
3. Email ile kayıt olun (GitHub, Google veya email ile)
4. **200$ ücretsiz kredi** otomatik olarak hesabınıza yüklenir!
5. Sol menüden **API Keys** seçeneğine tıklayın
6. **Create a New API Key** butonuna tıklayın
7. Key'e bir isim verin (örn: "EchomindApp")
8. **Create Key** butonuna tıklayın
9. Oluşan key'i kopyalayın (⚠️ Sadece bir kez gösterilir!)

### 2️⃣ API Key'i Uygulamaya Ekleyin

1. Proje klasöründe `config/deepgramConfig.js` dosyasını açın
2. Aşağıdaki satırı bulun:
   ```javascript
   apiKey: "your_deepgram_api_key_here",
   ```
3. `your_deepgram_api_key_here` kısmını kopyaladığınız API key ile değiştirin:
   ```javascript
   apiKey: "abc123xyz456789...",
   ```
4. Dosyayı kaydedin (Ctrl+S veya Cmd+S)

### 3️⃣ Bağımlılıkları Yükleyin

Terminal veya Komut İstemi'ni açın ve proje klasörüne gidin:

```bash
cd C:\Users\Hp\Desktop\EchomindApp
```

Ardından paketleri yükleyin:

```bash
npm install
```

### 4️⃣ Uygulamayı Başlatın

```bash
npm start
```

veya

```bash
expo start
```

Terminal'de QR kod görünecek. Expo Go uygulaması ile QR kodu tarayın!

## 📱 Mobil Cihazda Çalıştırma

### Android için:

1. **Google Play Store**'dan **Expo Go** uygulamasını indirin
2. Expo Go'yu açın
3. **Scan QR Code** seçeneğine tıklayın
4. Terminal'deki QR kodu tarayın

### iOS için:

1. **App Store**'dan **Expo Go** uygulamasını indirin
2. iPhone kamera uygulamasını açın
3. QR kodu tarayın
4. Expo Go'da açmak için bildirimine tıklayın

## ⚠️ Önemli Notlar

### Mikrofon İzni
İlk açılışta uygulama mikrofon izni isteyecek - **İzin Ver** butonuna tıklayın.

### API Key Güvenliği
- API key'inizi asla GitHub'a yüklemeyin
- `.gitignore` dosyasında `config/deepgramConfig.js` eklenmiş olmalı
- Production'da environment variables kullanın

### Network Bağlantısı
- Deepgram API'si internet bağlantısı gerektirir
- WiFi veya mobil veri açık olmalı

## 🎯 İlk Kullanım Testi

1. **Uygulamayı açın** - "Welcome to Echomind 👋" görmelisiniz
2. **🎤 Mikrofon butonuna basın** - Kayıt başlayacak
3. **Konuşun** - "Merhaba, bu bir test" deyin
4. **Tekrar basın** - Kayıt duracak ve transkribe edilecek
5. **Metni görün** - Söyledikleriniz metin olarak görünecek
6. **▶️ Play butonuna basın** - Metin sesli okunacak

## 🔧 Sorun mu Yaşıyorsunuz?

### Hata: "API key is invalid"
- API key'i doğru kopyaladınızınızdan emin olun
- Başında/sonunda boşluk olmadığından emin olun
- Deepgram Console'da key'in aktif olduğunu kontrol edin

### Hata: "Element type is invalid"
- `npm install` komutunu çalıştırın
- `node_modules` klasörünü silin ve tekrar `npm install` yapın
- Expo cache'i temizleyin: `expo start -c`

### Ses kaydı çalışmıyor
- Mikrofon iznini verdiğinizden emin olun
- Cihaz ayarlarından uygulama izinlerini kontrol edin
- Başka bir uygulamanın mikrofonu kullanmadığından emin olun

### Transkripsiyon çalışmıyor
- Internet bağlantınızı kontrol edin
- API key'inizin geçerli olduğunu kontrol edin
- Deepgram Console'da kredinizin olduğunu kontrol edin

### Uygulama yavaş
- `expo start` yerine `expo start --tunnel` deneyin
- Telefonunuzu ve bilgisayarınızı aynı WiFi ağına bağlayın
- Production build yapın: `expo build:android` veya `expo build:ios`

## 📊 API Kullanımını İzleme

1. [Deepgram Console](https://console.deepgram.com/) adresine gidin
2. Sol menüden **Usage** seçeneğine tıklayın
3. Kalan kredinizi ve kullanımınızı görün
4. Her request için detaylı bilgi görüntüleyin

## 🎨 Özelleştirme

### Dil Değiştirme
`config/deepgramConfig.js` dosyasında:
```javascript
language: "tr", // Türkçe için
// veya
language: "en", // İngilizce için
```

### Model Değiştirme
```javascript
model: "nova-2", // En iyi
// veya
model: "nova",   // Hızlı
// veya
model: "base",   // Ekonomik
```

### TTS Ses Değiştirme
```javascript
model: "aura-asteria-en", // Kadın ses
// veya
model: "aura-orion-en",   // Erkek ses
```

## 🎓 Sonraki Adımlar

- ✅ Temel kurulumu tamamladınız
- ✅ Uygulamayı test ettiniz
- ➡️ README.md dosyasını okuyun
- ➡️ Deepgram dokümantasyonunu inceleyin
- ➡️ Kendi özelliklerinizi ekleyin

## 💡 İpuçları

- **200$ ücretsiz kredi** yaklaşık 40,000 dakika transkripsiyon yapar
- Nova-2 modeli en doğru sonuçları verir
- Türkçe transkripsiyon için `language: "tr"` kullanın
- TTS için İngilizce metinler daha iyi çalışır

## 🆘 Yardım

Hala sorun mu yaşıyorsunuz?
- GitHub Issues'da soru sorun
- Deepgram Discord topluluğuna katılın
- README.md dosyasını okuyun

---

**Hazırsınız! 🎉** Artık Deepgram destekli ses tanıma uygulamanızı kullanabilirsiniz!

