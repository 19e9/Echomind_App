Kısaca: Doğrudan “ses-sese” karşılaştırma yapmıyoruz. Deepgram ile sesi yazıya çevirip metinler üzerinden basit bir kelime karşılaştırması yapıyoruz.
Nerede/ nasıl:
services/deepgramService.js: Sizin kaydınızı Deepgram STT ile metne çeviriyoruz.
screens/EnglishLearningScreen.js içindeki analyzePronunciation(originalText, userText):
Noktalama ve büyük/küçük harfleri temizliyor.
Cümleyi kelimelere bölüyor.
Her kelime için basit eşitlik/altkume kontrolü yapıyor:
doğru sayımı: userWord === originalWord ya da biri diğerini içeriyorsa.
Sonuç: doğru/yanlış kelime işaretleme ve basit yüzde skor.
Not: Fonetik/phoneme tabanlı telafuz puanı, ses benzerliği, WER/Levenshtein gibi gelişmiş ölçütler şu an kullanılmıyor. İsterseniz Deepgram’ın kelime güven puanı, WER veya bir fonem hizalama kütüphanesiyle daha hassas bir analiz ekleyebilirim.