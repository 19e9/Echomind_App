/**
 * İngilizce Öğrenme Konfigürasyonu
 * 6 Seviye: A1, A2, B1, B2, C1, C2
 * Her seviye için 10 cümle
 */

export const ENGLISH_LEVELS = {
  A1: {
    name: 'A1 - Beginner',
    sentences: [
      { id: 1, text: 'Hello, my name is John.', turkish: 'Merhaba, adım John.' },
      { id: 2, text: 'I am from Turkey.', turkish: 'Türkiye\'den geliyorum.' },
      { id: 3, text: 'How are you?', turkish: 'Nasılsın?' },
      { id: 4, text: 'I like coffee.', turkish: 'Kahve severim.' },
      { id: 5, text: 'What is your name?', turkish: 'Adın ne?' },
      { id: 6, text: 'I have a dog.', turkish: 'Bir köpeğim var.' },
      { id: 7, text: 'This is a book.', turkish: 'Bu bir kitap.' },
      { id: 8, text: 'I go to school.', turkish: 'Okula gidiyorum.' },
      { id: 9, text: 'Can you help me?', turkish: 'Bana yardım edebilir misin?' },
      { id: 10, text: 'Thank you very much.', turkish: 'Çok teşekkür ederim.' },
    ],
  },
  A2: {
    name: 'A2 - Elementary',
    sentences: [
      { id: 1, text: 'I usually wake up at seven o\'clock.', turkish: 'Genellikle yedide uyanırım.' },
      { id: 2, text: 'She likes reading books in the evening.', turkish: 'Akşamları kitap okumayı sever.' },
      { id: 3, text: 'We go to the park every Sunday.', turkish: 'Her Pazar parka gideriz.' },
      { id: 4, text: 'He can speak three languages.', turkish: 'Üç dil konuşabilir.' },
      { id: 5, text: 'I need to buy some groceries.', turkish: 'Biraz yiyecek almam gerekiyor.' },
      { id: 6, text: 'The weather is beautiful today.', turkish: 'Bugün hava çok güzel.' },
      { id: 7, text: 'They are planning a trip to Paris.', turkish: 'Paris\'e bir gezi planlıyorlar.' },
      { id: 8, text: 'I prefer tea to coffee.', turkish: 'Kahve yerine çay tercih ederim.' },
      { id: 9, text: 'She works at a hospital.', turkish: 'Bir hastanede çalışıyor.' },
      { id: 10, text: 'We should study more often.', turkish: 'Daha sık çalışmalıyız.' },
    ],
  },
  B1: {
    name: 'B1 - Intermediate',
    sentences: [
      { id: 1, text: 'I have been learning English for three years.', turkish: 'Üç yıldır İngilizce öğreniyorum.' },
      { id: 2, text: 'If it rains tomorrow, we will stay home.', turkish: 'Yarın yağmur yağarsa evde kalacağız.' },
      { id: 3, text: 'She has already finished her homework.', turkish: 'Ödevini zaten bitirdi.' },
      { id: 4, text: 'I wish I could travel more often.', turkish: 'Keşke daha sık seyahat edebilsem.' },
      { id: 5, text: 'This restaurant serves delicious food.', turkish: 'Bu restoran lezzetli yemekler servis ediyor.' },
      { id: 6, text: 'We need to discuss this matter further.', turkish: 'Bu konuyu daha fazla tartışmamız gerekiyor.' },
      { id: 7, text: 'He decided to quit his job last month.', turkish: 'Geçen ay işini bırakmaya karar verdi.' },
      { id: 8, text: 'I am looking forward to meeting you.', turkish: 'Seninle tanışmayı dört gözle bekliyorum.' },
      { id: 9, text: 'The movie we watched was really interesting.', turkish: 'İzlediğimiz film gerçekten ilginçti.' },
      { id: 10, text: 'They managed to solve the problem together.', turkish: 'Sorunu birlikte çözmeyi başardılar.' },
    ],
  },
  B2: {
    name: 'B2 - Upper Intermediate',
    sentences: [
      { id: 1, text: 'I would have called you if I had known about the meeting.', turkish: 'Toplantıyı bilseydim seni arardım.' },
      { id: 2, text: 'The project has been delayed due to technical difficulties.', turkish: 'Proje teknik zorluklar nedeniyle ertelendi.' },
      { id: 3, text: 'She is considering applying for a scholarship.', turkish: 'Burs başvurusu yapmayı düşünüyor.' },
      { id: 4, text: 'We are supposed to finish this by the end of the week.', turkish: 'Bunu hafta sonuna kadar bitirmemiz gerekiyor.' },
      { id: 5, text: 'I have never encountered such a complex situation.', turkish: 'Hiç bu kadar karmaşık bir durumla karşılaşmadım.' },
      { id: 6, text: 'They are unlikely to arrive before noon.', turkish: 'Öğleden önce varmaları pek olası değil.' },
      { id: 7, text: 'The research findings were published in a scientific journal.', turkish: 'Araştırma bulguları bilimsel bir dergide yayınlandı.' },
      { id: 8, text: 'I suggest we take a different approach to solve this.', turkish: 'Bunu çözmek için farklı bir yaklaşım benimsememizi öneriyorum.' },
      { id: 9, text: 'He is known for his expertise in digital marketing.', turkish: 'Dijital pazarlama konusundaki uzmanlığıyla tanınıyor.' },
      { id: 10, text: 'The committee has yet to reach a final decision.', turkish: 'Komite henüz nihai bir karara varmadı.' },
    ],
  },
  C1: {
    name: 'C1 - Advanced',
    sentences: [
      { id: 1, text: 'Notwithstanding the challenges we face, progress has been remarkable.', turkish: 'Karşılaştığımız zorluklara rağmen, ilerleme dikkate değer oldu.' },
      { id: 2, text: 'The implications of this policy change are far-reaching.', turkish: 'Bu politika değişikliğinin sonuçları geniş kapsamlı.' },
      { id: 3, text: 'She demonstrated exceptional leadership skills during the crisis.', turkish: 'Kriz sırasında olağanüstü liderlik becerileri sergiledi.' },
      { id: 4, text: 'We need to strike a balance between innovation and tradition.', turkish: 'Yenilik ve gelenek arasında bir denge kurmamız gerekiyor.' },
      { id: 5, text: 'The negotiations were characterized by mutual respect and understanding.', turkish: 'Müzakereler karşılıklı saygı ve anlayışla karakterize edildi.' },
      { id: 6, text: 'He has an extensive background in international relations.', turkish: 'Uluslararası ilişkiler konusunda geniş bir geçmişe sahip.' },
      { id: 7, text: 'The proposal warrants further investigation and analysis.', turkish: 'Öneri daha fazla araştırma ve analiz gerektiriyor.' },
      { id: 8, text: 'They embarked on an ambitious project to transform the industry.', turkish: 'Sektörü dönüştürmek için hırslı bir projeye başladılar.' },
      { id: 9, text: 'The complexity of the issue requires a multifaceted approach.', turkish: 'Konunun karmaşıklığı çok yönlü bir yaklaşım gerektiriyor.' },
      { id: 10, text: 'We must ensure that our actions are aligned with our values.', turkish: 'Eylemlerimizin değerlerimizle uyumlu olduğundan emin olmalıyız.' },
    ],
  },
  C2: {
    name: 'C2 - Proficiency',
    sentences: [
      { id: 1, text: 'The epistemological framework underlying this theory challenges conventional wisdom.', turkish: 'Bu teorinin altında yatan epistemolojik çerçeve geleneksel bilgeliği sorguluyor.' },
      { id: 2, text: 'His eloquence and rhetorical prowess were evident throughout the discourse.', turkish: 'Hitabeti ve retorik yeteneği tüm konuşma boyunca belirgindi.' },
      { id: 3, text: 'The phenomenon can be attributed to a confluence of various factors.', turkish: 'Bu fenomen çeşitli faktörlerin birleşmesine bağlanabilir.' },
      { id: 4, text: 'We need to transcend the limitations of our current paradigm.', turkish: 'Mevcut paradigmanın sınırlarını aşmamız gerekiyor.' },
      { id: 5, text: 'The intricate dynamics of the system warrant meticulous examination.', turkish: 'Sistemin karmaşık dinamikleri dikkatli bir inceleme gerektiriyor.' },
      { id: 6, text: 'Her perspicacious observations shed light on hitherto unexplored aspects.', turkish: 'Keskin gözlemleri şimdiye kadar keşfedilmemiş yönlere ışık tuttu.' },
      { id: 7, text: 'The conundrum lies in reconciling seemingly contradictory perspectives.', turkish: 'Sorun görünüşte çelişkili bakış açılarını uzlaştırmada yatıyor.' },
      { id: 8, text: 'We must endeavor to foster an environment conducive to intellectual growth.', turkish: 'Entelektüel gelişime elverişli bir ortam yaratmaya çalışmalıyız.' },
      { id: 9, text: 'The nuanced interpretation requires a sophisticated understanding of context.', turkish: 'Nüanslı yorum bağlamın sofistike bir anlayışını gerektirir.' },
      { id: 10, text: 'His acumen in navigating complex bureaucratic procedures is unparalleled.', turkish: 'Karmaşık bürokratik prosedürleri yönetmedeki ustalığı benzersiz.' },
    ],
  },
};

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

