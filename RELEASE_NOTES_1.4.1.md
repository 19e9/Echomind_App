# Echomind v1.4.1 – Sürüm Notları

Yayın tarihi: 3 Kasım 2025

## Öne Çıkanlar
- İngilizce Öğrenme akışında kullanılabilirlik ve içerik iyileştirmeleri
- Video cache ve video bitiş davranışında (son kare) stabilite artışı
- HeyGen bekleme/polling sürecinde hata dayanıklılığı ve zamanlama optimizasyonu
- Telaffuz analizi çıktı sunumunda okunabilirlik ve doğruluk ayarları

## Değişiklikler
### Uygulama ve Ekranlar
- `screens/EnglishLearningScreen.js`: UI/UX düzenlemeleri, kayıt sırasında arka plan video loop ve son-karede durdurma tutarlı hale getirildi
- `screens/HomeScreen.js`: akış sadeleştirildi; hızlı dikte butonu kaldırıldı
- `screens/SettingsScreen.js`: kaldırıldı (ayarlar ilgili akışlar içinde yönetiliyor)

### Bileşenler
- `components/AvatarDisplay.js`: video sonu davranışı; son karede kalma ve yeniden oynatma akışı sadeleştirildi

### Servisler
- `services/videoCacheService.js` (yeni): kalıcı video cache yönetimi
- `services/translationService.js` (yeni): sadeleştirilmiş çeviri/yerelleştirme akışı
- `services/heygenApiService.js`: polling ve hata yönetimi iyileştirmeleri
- `services/avatarTTSService.js`: cache ile entegrasyon ve stabilite düzenlemeleri
- `services/deepgramService.js`, `services/deepgramLiveService.js`, `services/ttsService.js`: küçük optimizasyonlar

### Konfigürasyon
- `config/avatarConfig.js`: varsayılanlar ve açıklamalar güncellendi
- `config/englishLearningConfig.js` (yeni): 6 seviye için yapılandırılmış içerik

## Kaldırılanlar
- Hızlı Sesli Dikte butonu (ana ekrandan)
- `SettingsScreen` (akışlar içinde birleştirildi)
- Tekrar İzle butonu (video bitişinde son kare görünür kalır)

## Davranış Değişiklikleri
- Kayıt sırasında arka plan avatar videosu sessiz ve loop; kayıt bitince video kaldırılmaz, son karede duraklatılır
- Telaffuz analizi: Deepgram STT ile transkript; kelime bazlı basit JS karşılaştırma (eşitlik/altküme), ek kütüphane yok

## Bilinen Notlar
- HeyGen video oluşturma süresi içeriğe göre değişebilir; polling limitleri optimize edildi
- Offline lip-sync seçenekleri belgelerde mevcuttur, varsayılan akış HeyGen/D-ID odaklıdır

---
Geri bildirim ve sorunlar için Issues bölümünü kullanabilirsiniz. Teşekkürler!

