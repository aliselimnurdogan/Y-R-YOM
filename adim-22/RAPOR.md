# Yürüyom — 22. Adım

Tarih: 31 Ekim 2026. Taban: 21. adım.

## Ne değişti
- **Rehber** sekmesi kalktı. Yerine **Tur rehberleri**: rehber veya tur şirketi kayıt olur, giriş yapar (Rehber paneli). Ay ay tur, duyuru ve yürüyüş fotoğrafı ekler, siler. Ziyaretçi turları ay ve ile göre süzer; rehber profilinde ara, WhatsApp ve Instagram bağlantısı çıkar.
- Kayıt ücretli: Bireysel rehber 990 TL/yıl, Tur şirketi 2.490 TL/yıl. Fiyat taslak; kart henüz çekilmez.
- **Yemek nerede yenir**: üstte ana sponsorlar; 81 il listesi ve harita. İle tıklayınca ünlü lezzetler (81 ilde 195 yemek; Maraş’ta 8) ve o ilin sponsorları yanda. Mekân adı yazılmaz; işletme adı yalnız sponsor ilanında durur.
- **Outdoor**: nerede ne giyilir (7 yer: yayla, kıyı, Karadeniz, iç bölge, dağ, kış, gece), nasıl giyilir (katman katman), 12 kamp malzemesi (ne işe yarar, özellik, nasıl seçilir, bakım). Altta mağaza sponsorları.
- **Sponsor ol**: yemek, mağaza, uygulama, ana sponsor, diğer. Ana sponsor Yemek ve Outdoor’un üstünde; il sponsoru o ilin yan sütununda. Geziyorum’da il tıklayınca da aynı yan sütun çıkar.
- Üst menü yedi sekme. Telefonda yana kayar; açık sekme görünür kalır.

## Ne duruyor
21. adım: Geziyorum, harita üstü ana sponsor, Kamp, Yürüyüş, 445 yer. Pin izin değildir. 1–21. adım klasörlerine dokunulmadı. 21. adım ekranları yeni kodla derlenince piksel piksel aynı çıktı.

## Sınırlar (dürüst not)
- Sunucu yok. Kayıt, tur, duyuru, fotoğraf ve ilan yalnızca o tarayıcıda (localStorage) durur; başka cihazda görünmez. Parola karıştırılarak saklanır; bu gerçek güvenlik değildir.
- Ödeme yok.
- “Örnek” yazan dört rehber, tur, sponsor ve duyuru uydurmadır; gerçek bir kişi, şirket veya marka değildir. Gerçek kayıt gelince kaldırılır.
- Yemek listesi yöresel yemek kaynaklarından elle derlendi; her ilde daha fazlası var. Şubat 2023 depreminden etkilenen illerde dükkân yerleri değişmiş olabilir (sayfada not var).
- Fotoğraf: rehber başına 8, toplam 24; tarayıcıda 960 piksele küçülür.
- Derleme esbuild ile yapıldı (npm kayıt sunucusuna erişilemedi). Vite ile derleme denenmedi; yerelde `VITE_STEP=22` ile çalışması beklenir. Tip denetiminde yalnızca CSS içe aktarma türlerinin eksikliği (ortam kaynaklı) iki uyarı verdi.

## Denendi
Chromium’da dosyadan açılan derlemeyle 94 kontrol geçti: kayıt, giriş, çıkış, tur/duyuru/fotoğraf ekleme ve silme, filtreler, sponsor ekleme, 81 il, harita tıklama, Outdoor. Konsol hatası yok. 390 piksel telefonda yatay taşma yok.
