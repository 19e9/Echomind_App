# 📝 GitHub'a Yükleme Rehberi

Bu dosya, projenizi GitHub'a yüklerken kullanmanız gereken bilgileri içerir.

---

## 🏷️ Repository Description (Açıklama)

GitHub repository oluştururken **Description** bölümüne şunu yazın:

```
🎙️ AI-powered voice recognition and text-to-speech mobile app built with React Native & Deepgram AI. Convert speech to text and text to speech seamlessly with modern UI. Türkçe destekli.
```

**veya Türkçe olarak:**

```
🎙️ Deepgram AI destekli ses tanıma ve metin okuma uygulaması. React Native ile geliştirilmiş, modern arayüze sahip cross-platform mobil uygulama.
```

---

## 🏷️ Repository Topics (Etiketler)

GitHub repository **Topics** (Etiketler) bölümüne şunları ekleyin:

```
react-native
expo
deepgram
speech-to-text
text-to-speech
ai
voice-recognition
mobile-app
ios
android
react
javascript
audio
transcription
aura
nova-2
turkish
cross-platform
expo-av
react-navigation
```

---

## 📋 Repository Ayarları

### Repository Adı
```
echomindapp
```
veya
```
EchomindApp
```

### Görünürlük
- ✅ **Public** (Herkese açık - önerilir)
- ⬜ **Private** (Sadece siz ve izin verilenler)

### README Seçeneği
- ⬜ **Add a README file** (İşaretlemeyin, zaten var)

### .gitignore Seçeneği
- ⬜ **Add .gitignore** (İşaretlemeyin, zaten var)

### Lisans
- ✅ **Choose a license**: MIT License (önerilir)

---

## 🚀 Git Komutları (Adım Adım)

### 1. Git Repository'sini Başlatın

```bash
git init
```

### 2. Dosyaları Ekleyin

```bash
git add .
```

### 3. İlk Commit'i Oluşturun

```bash
git commit -m "🎉 Initial commit: Echomind App - AI-powered voice recognition app"
```

### 4. Ana Branch'i 'main' Yapın

```bash
git branch -M main
```

### 5. GitHub Repository'sini Ekleyin

**Not:** Önce GitHub'da repository oluşturun, sonra aşağıdaki komutu çalıştırın.

```bash
git remote add origin https://github.com/KULLANICI_ADINIZ/echomindapp.git
```

**Örnek:**
```bash
git remote add origin https://github.com/johndoe/echomindapp.git
```

### 6. Kodu GitHub'a Yükleyin

```bash
git push -u origin main
```

---

## 🎯 Commit Mesajı Önerileri

İyi commit mesajları kullanın:

```bash
# İlk yükleme
git commit -m "🎉 Initial commit: Echomind App"

# Özellik ekleme
git commit -m "✨ feat: Add voice recording feature"
git commit -m "✨ feat: Implement Deepgram TTS integration"

# Hata düzeltme
git commit -m "🐛 fix: Fix audio playback issue on Android"

# Dokümantasyon
git commit -m "📝 docs: Update README with installation guide"

# Performans iyileştirme
git commit -m "⚡ perf: Optimize audio transcription speed"

# Stil değişikliği
git commit -m "💄 style: Update UI colors and animations"
```

---

## 📄 LICENSE Dosyası

GitHub'da MIT License seçmediyseniz, manuel olarak `LICENSE` dosyası oluşturun:

```
MIT License

Copyright (c) 2025 [Your Name]

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

## 🔒 Güvenlik Uyarısı

### ⚠️ API Anahtarını Koruyun

API anahtarınız **config/deepgramConfig.js** dosyasında `YOUR_DEEPGRAM_API_KEY_HERE` olarak değiştirildi.

**Kesinlikle:**
- ❌ API anahtarınızı GitHub'a yüklemeyin
- ❌ Public repository'de gerçek API key paylaşmayın
- ✅ `.gitignore` dosyasının güncel olduğundan emin olun
- ✅ Kullanıcılara kendi API key almalarını söyleyin

---

## 📊 GitHub Repository Özellikleri

### GitHub Actions (İsteğe Bağlı)

CI/CD için GitHub Actions ekleyebilirsiniz:

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint (varsa)
```

### GitHub Pages (Demo için)

Web versiyonu için GitHub Pages kullanabilirsiniz.

### Issue Templates

`.github/ISSUE_TEMPLATE/` klasörü altında template'ler oluşturabilirsiniz.

### Pull Request Template

`.github/PULL_REQUEST_TEMPLATE.md` dosyası oluşturabilirsiniz.

---

## 🌟 README Badge'leri

README'de zaten ekli olan badge'ler:

- **React Native Version**
- **Expo Version**
- **Deepgram Badge**
- **License Badge**
- **GitHub Stars**
- **GitHub Forks**
- **GitHub Issues**

---

## 📱 Social Preview (Sosyal Önizleme)

GitHub repository ayarlarından **Social Preview** bölümüne bir görsel ekleyin:

- Boyut: 1280x640 piksel
- Format: PNG veya JPG
- İçerik: Uygulamanızın logo'su veya ekran görüntüsü

---

## 🎉 Yayınlama Sonrası

1. ✅ Repository'yi test edin (başkası klonlayabilir mi?)
2. ✅ README'nin doğru görüntülendiğini kontrol edin
3. ✅ Topics eklenmiş mi?
4. ✅ Description yazılmış mı?
5. ✅ License seçilmiş mi?
6. ✅ About bölümü doldurulmuş mu?

### GitHub About Bölümü

Repository sayfasında sağ üstteki **⚙️ Settings** simgesine tıklayın ve doldurun:

- **Website**: Demo link veya kişisel siteniz
- **Topics**: Yukarıdaki listeyi ekleyin
- **Description**: Yukarıdaki açıklamayı ekleyin

---

## 📣 Paylaşım

Projenizi paylaşın:

- Twitter/X: "🎙️ Just open-sourced my AI-powered voice recognition app built with React Native & Deepgram! Check it out on GitHub: [link]"
- LinkedIn: Daha detaylı bir post
- Reddit: r/reactnative, r/ExpoJS
- Dev.to: Blog yazısı yazabilirsiniz
- Hacker News: Show HN post

---

## ✅ Checklist

GitHub'a yüklemeden önce kontrol edin:

- [ ] Git kurulu mu? (`git --version`)
- [ ] GitHub hesabı oluşturulmuş mu?
- [ ] API anahtarı dosyadan temizlenmiş mi?
- [ ] README güncel mi?
- [ ] .gitignore dosyası var mı?
- [ ] node_modules .gitignore'da mı?
- [ ] Commit mesajı anlamlı mı?
- [ ] Repository adı belirlenmiş mi?
- [ ] Description hazırlanmış mı?

---

## 🆘 Yardım

Sorun yaşarsanız:

1. Git kurulu değilse: [Git İndir](https://git-scm.com/downloads)
2. GitHub hesabı yoksa: [GitHub Kaydol](https://github.com/join)
3. SSH yerine HTTPS kullanın (daha kolay)
4. GitHub Desktop kullanabilirsiniz: [GitHub Desktop](https://desktop.github.com/)

---

**Hazır mısınız? Git'i kurduktan sonra yukarıdaki komutları sırayla çalıştırın! 🚀**

---

© 2025 Echomind App

