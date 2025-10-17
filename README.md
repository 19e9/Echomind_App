# 🎙️ Echomind App

<div align="center">

![React Native](https://img.shields.io/badge/React%20Native-0.81.4-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-~54.0-000020?style=for-the-badge&logo=expo&logoColor=white)
![Deepgram](https://img.shields.io/badge/Deepgram-AI-00D4A0?style=for-the-badge&logo=ai&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Deepgram AI destekli, profesyonel ses tanıma ve metin okuma mobil uygulaması**

[🚀 Hızlı Başlangıç](#-kurulum) • [📱 Özellikler](#-özellikler) • [📖 Dokümantasyon](#-kullanım) • [🤝 Katkıda Bulunma](#-katkıda-bulunma)

</div>

---

## 📱 Ekran Görüntüleri

> Modern, kullanıcı dostu arayüz ile gerçek zamanlı ses tanıma ve metin okuma deneyimi

---

## ✨ Özellikler

### 🎯 Temel Özellikler

- 🎤 **Speech-to-Text (STT)**: Deepgram Nova-2 modeli ile yüksek doğrulukta ses tanıma
- 🔊 **Text-to-Speech (TTS)**: Deepgram Aura modeli ile doğal sesli metin okuma
- 🇹🇷 **Türkçe Dil Desteği**: Tam Türkçe transkripsiyon ve çoklu dil desteği
- ⚡ **Gerçek Zamanlı İşlem**: Anlık ses kaydı ve hızlı transkripsiyon
- 🎨 **Modern UI/UX**: Animasyonlu butonlar ve kullanıcı dostu arayüz
- 📱 **Cross-Platform**: iOS, Android ve Web desteği

### 🔧 Teknik Özellikler

- ✅ Deepgram REST API entegrasyonu (SDK kullanmadan)
- ✅ Otomatik formatlama ve noktalama
- ✅ Yüksek kaliteli ses kaydı (Expo AV)
- ✅ URL'den ses dosyası transkripsiyon desteği
- ✅ Animasyonlu UI bileşenleri (Reanimated)
- ✅ React Navigation ile sayfa yönetimi

---

## 📋 Gereksinimler

- **Node.js** v14 veya üzeri
- **npm** veya **yarn**
- **Expo CLI** (otomatik yüklenecek)
- **Deepgram API Key** ([ücretsiz alın](https://console.deepgram.com/) - $200 kredi)

---

## 🚀 Kurulum

### 1️⃣ Projeyi Klonlayın

```bash
git clone https://github.com/19e9/Echomind_App.git
cd echomindapp
```

### 2️⃣ Bağımlılıkları Yükleyin

```bash
npm install
```

veya

```bash
yarn install
```

### 3️⃣ Deepgram API Key'i Ayarlayın

1. [Deepgram Console](https://console.deepgram.com/) adresine gidin
2. Ücretsiz hesap oluşturun ($200 ücretsiz kredi dahil)
3. API Keys bölümünden yeni bir key oluşturun
4. `config/deepgramConfig.js` dosyasını açın ve API key'inizi ekleyin:

```javascript
export const DEEPGRAM_CONFIG = {
  apiKey: "YOUR_DEEPGRAM_API_KEY_HERE", // Buraya API key'inizi yapıştırın
  // ...
};
```

⚠️ **Önemli Güvenlik Notu**: API anahtarınızı asla GitHub'a yüklemeyin!

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

1. Ana ekranda **🎤 Mikrofon** butonuna basın
2. Konuşmaya başlayın (buton kırmızıya döner)
3. Bitince tekrar butona basın
4. Transkripsiyon otomatik olarak ekranda görünür

### 🔊 Metin Okuma

1. Önce bir ses kaydı yapın ve transkribe edin
2. **▶️ Play** butonuna basın
3. Metin sesli olarak okunacaktır

---

## 📁 Proje Yapısı

```
EchomindApp/
│
├── 📱 App.js                    # Ana uygulama & navigasyon
├── 📋 app.json                  # Expo konfigürasyonu
├── 📦 package.json              # Bağımlılıklar
│
├── 🧩 components/               # UI bileşenleri
│   ├── MicButton.js            # Animasyonlu mikrofon butonu
│   ├── PlayButton.js           # Oynatma butonu
│   └── TextDisplay.js          # Metin gösterim alanı
│
├── 📱 screens/                  # Uygulama ekranları
│   ├── HomeScreen.js           # Ana ekran
│   └── SettingsScreen.js       # Ayarlar ekranı
│
├── ⚙️ config/                   # Konfigürasyon
│   └── deepgramConfig.js       # Deepgram API ayarları
│
├── 🔧 services/                 # API servisleri
│   ├── deepgramService.js      # Speech-to-Text servisi
│   ├── ttsService.js           # Text-to-Speech servisi
│   └── deepgramLiveService.js  # Canlı transkripsiyon
│
└── 🎨 styles/                   # Stiller
    └── globalStyles.js         # Global stil tanımları
```

---

## ⚙️ Konfigürasyon

`config/deepgramConfig.js` dosyasından ayarları özelleştirebilirsiniz:

```javascript
export const DEEPGRAM_CONFIG = {
  apiKey: "your_api_key",
  
  stt: {
    model: "nova-2",          // Model: nova-2, nova, base, enhanced
    language: "tr",           // Dil: tr, en, es, fr, de, ja, ko...
    smartFormat: true,        // Otomatik formatlama
    punctuate: true,          // Noktalama işaretleri
    diarize: false,           // Konuşmacı ayırımı
  },
  
  tts: {
    model: "aura-asteria-en", // TTS ses modeli
    encoding: "linear16",     // Ses formatı
    container: "wav",         // Container format
  },
};
```

### 🌍 Desteklenen Diller

Deepgram 30+ dili destekler:
- 🇹🇷 Türkçe (`tr`)
- 🇺🇸 İngilizce (`en`, `en-US`, `en-GB`, `en-AU`)
- 🇪🇸 İspanyolca (`es`, `es-419`)
- 🇫🇷 Fransızca (`fr`)
- 🇩🇪 Almanca (`de`)
- 🇯🇵 Japonca (`ja`)
- 🇰🇷 Korece (`ko`)
- Ve daha fazlası...

Tam liste: [Deepgram Language Support](https://developers.deepgram.com/docs/languages)

---

## 🎯 Deepgram AI Modelleri

### Speech-to-Text Modelleri

| Model | Açıklama | Kullanım |
|-------|----------|----------|
| **nova-2** ⭐ | En yeni, en hızlı ve en doğru | Önerilen |
| **nova** | Hızlı ve doğru | Alternatif |
| **enhanced** | Geliştirilmiş doğruluk | Hassas işlemler |
| **base** | Temel model | Düşük maliyetli |

### Text-to-Speech Modelleri

| Model | Ses Tipi | Dil |
|-------|----------|-----|
| **aura-asteria-en** | Kadın - Doğal | İngilizce |
| **aura-luna-en** | Kadın - Samimi | İngilizce |
| **aura-orion-en** | Erkek - Güçlü | İngilizce |
| **aura-arcas-en** | Erkek - Profesyonel | İngilizce |

[Tüm TTS Modelleri](https://developers.deepgram.com/docs/tts-models)

---

## 🛠️ Teknoloji Stack

| Kategori | Teknoloji |
|----------|-----------|
| **Framework** | React Native 0.81.4 |
| **Platform** | Expo ~54.0 |
| **UI Library** | React 19.1.0 |
| **Navigasyon** | React Navigation 7.x |
| **Animasyon** | React Native Reanimated 4.x |
| **Ses İşleme** | Expo AV 16.x |
| **AI/ML** | Deepgram AI (Nova-2, Aura) |
| **API** | Deepgram REST API |

---

## 🔥 API Kullanımı

### Speech-to-Text

```javascript
import { transcribeAudio } from './services/deepgramService';

// Ses dosyasını transkribe et
const result = await transcribeAudio(audioFileUri);
console.log(result); // "Merhaba, nasılsınız?"
```

### Text-to-Speech

```javascript
import { speakText } from './services/ttsService';

// Metni seslendir
await speakText("Merhaba, bu bir test mesajıdır.");
```

### URL'den Transkripsiyon

```javascript
import { transcribeAudioFromUrl } from './services/deepgramService';

const text = await transcribeAudioFromUrl('https://example.com/audio.mp3');
```

---

## 🐛 Sorun Giderme

### ❌ "API key geçersiz" hatası
- API key'inizi doğru kopyaladığınızdan emin olun
- Deepgram Console'da key'in aktif olduğunu kontrol edin
- Ücretsiz kredinizin dolmadığını kontrol edin

### ❌ Ses kaydı çalışmıyor
- Uygulama izinlerini kontrol edin
- Mikrofon erişimi verilmiş olmalı
- Fiziksel cihazda test edin (emülatör mikrofonu olmayabilir)

### ❌ Metro bundler hatası
```bash
npx expo start --clear
```

### ❌ Node modules hatası
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Kaynaklar

- 📖 [Deepgram Documentation](https://developers.deepgram.com/)
- 🎥 [Deepgram API Tutorials](https://developers.deepgram.com/docs/getting-started)
- 🔑 [Deepgram Console](https://console.deepgram.com/)
- 📱 [Expo Documentation](https://docs.expo.dev/)
- ⚛️ [React Native Guide](https://reactnative.dev/docs/getting-started)

---

## 🎯 Kullanım Senaryoları

- 📝 **Toplantı Notları**: Toplantıları kaydedin ve otomatik transkript alın
- 🎓 **Eğitim**: Dersleri yazıya dökün, sesli içerik oluşturun
- ♿ **Erişilebilirlik**: İşitme engelliler için ses-metin dönüşümü
- 🌐 **Dil Öğrenme**: Telaffuz pratiği ve metin karşılaştırma
- 📚 **Sesli Kitap**: Metinleri sesli dinleme

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! 

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Katkı Kuralları

- Kod stiline uyun
- Değişikliklerinizi test edin
- Commit mesajlarında [Conventional Commits](https://www.conventionalcommits.org/) kullanın
- Büyük değişiklikler için önce issue açın

---

## 📄 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 👨‍💻 Geliştirici

**Proje Sahibi:** Khalid & İrem Altunay

### 📧 İletişim

- GitHub: Khalid (https://github.com/19e9)
- Email: Khaledtg17@gmail.com
- LinkedIn: (https://linkedin.com/in/khalid-tariq) irem altunay (https://www.linkedin.com/in/irem-altunay-a88893251/)

---

## 🌟 Teşekkürler

- [Deepgram](https://deepgram.com/) - Güçlü AI servisleri için
- [Expo](https://expo.dev/) - Harika geliştirme platformu için
- [React Native Community](https://reactnative.dev/) - Sürekli gelişen ekosistem için

---

## 📊 İstatistikler

![GitHub stars](https://img.shields.io/github/stars/yourusername/echomindapp?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/echomindapp?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/echomindapp)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/echomindapp)

---

<div align="center">

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**

Made with ❤️ using [Deepgram AI](https://deepgram.com/)

[🔝 Başa Dön](#-echomind-app)

</div>
"# Echomind_App" 
"# Echomind_App" 
