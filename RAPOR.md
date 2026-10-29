# Yürüyom — 3. Adım Ürün Raporu
Tarih: 29 Ekim 2026. Kaynak: kampatesim.com.tr/kamp-alanlari ve turkiye-kamp-alanlari-listesi.pdf. Google Maps kazıması yok.

## Önceki adımlarda ne bozuldu
1. ve 2. adım arayüzü tutturdu; katalog inandırıcı değildi.
Alakasız Unsplash: Alpler, jenerik çadır ve rastgele orman kareleri gerçek parkın yerini tutmuyordu; Yedigöller ile Başkonuş aynı stoğu paylaşabiliyordu.
Sahte giriş: “Giriş / Kaydol” yalnızca “hesap sonraki adımda” diyordu; güven kırıyordu.
Eski yorum kalıntısı: localStorage yorumu, fotoğraf yükleme ve “ilk yorumu sen yaz” 2. adımdan kalmıştı. Statik katalogda yerleri yok.

## Ciddi katalog şimdi ne göstermeli
Çekirdek: DKMP kaydında çadırlı kamp görülen 62 milli park ve tabiat parkı. Parkın her noktası gecelemeye açık değildir; yalnızca tahsisli kamp yeri geçerlidir.
Dağılım: Marmara 17, Karadeniz 27, Akdeniz 10, Ege 3, İç Anadolu 3, Doğu Anadolu 1 (Dumanlı / Erzincan), Güneydoğu 1 (Huzurlu / Gaziantep).
Zorunlu alanlar: tür (milli park / tabiat parkı), il, hektar, rakım, 2026 çadır tarifesi, yasal kamp notu.
2026 tarife (DKMP Ek-4): 4 kişilik ünite, günlük. Listede görülen parklar kabaca 105–285 TL; genel bant 150–570 TL. 2–3 kişi aynı, 5–6 kişi %50 fazla, 7–8 kişi iki kat. İdare işletmesinde 1 Haziran–31 Ekim dışı %50 indirim. Ücreti boş olan kayıt “ücretsiz” değil, eşleşme yok demektir.
Yasal not: 6831 s. Orman Kanunu md. 76-a — belirlenmiş konak yeri dışında devlet ormanında gecelemek yasak ve cezalıdır (md. 110). Haritadaki pin izin değildir.
Tarifede ayrıca: Beydağları Göynük Çomaklar; Uludağ Sarıalan ve Çobankaya (ahşap baraka = 4 kişilik çadır bedeli).

## Fotoğraf politikası
Yalnızca Wikimedia Commons ve yerinde çekilmiş kare (göl, kanyon, park). Dosya yoksa görsel atlanır; boş kart “temsili görsel yok” der. Jenerik çadır, Unsplash, Google yorum fotoğrafı ve temsili görsel yok. Google Maps yorum kazıması yapılmadı (hizmet şartı ve telif). Bu derlemede 64 kayıttan 34’ünün en az üç, 42’sinin en az bir yerinde Commons karesi var; küçük tabiat parklarının çoğunda Commons dosyası yok.

## Statik site — sıradaki özellikler
1. Bölge ve ücret filtresi (7 bölge + ücret bandı / tarife yok).
2. GPX’siz patika notu: kısa yürüyüş cümlesi; iz dosyası ve Wikiloc kopyası yok.
3. Yangın yasağı sezon bandı: yaz OGM/DKMP duyurusu; ateş serbest izlenimi verilmez.
4. Çevrimdışı JSON: 62 kayıt tek dosyada; GitHub Pages yeter.
5. Sonraki katman: KTB belgeli özel kamping (30 il, 316 tesis; 302 kamping). Ücret işletmenin; koordinat yoksa haritaya basılmaz.
6. OSM / Park4Night / Kamp Nokta uyarısı: 2.230–2.306 nokta topluluk envanteridir; “ücretsiz” yasal izin değildir.

## Karar
3. adım rota klonu değil, resmî korunan alan kamp veritabanıdır. Önce 62 parkı tarife ve yasa notuyla yayınla; özel kamping ve hesabı ertele.
