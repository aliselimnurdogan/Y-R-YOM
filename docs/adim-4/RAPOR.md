# 4. Adım — ne eklendi, ne eklenmesin
Tarih: 29 Ekim 2026. Statik GitHub Pages. Sahte giriş yok. 3. adım çekirdeği duruyor: 64 DKMP kaydı (62 park + Göynük Çomaklar + Uludağ Sarıalan) ve 52 GPS yürüyüş parkuru.

## Bu adımda ne yaptık (kısa)
Her park için pratik gece rehberi yazıldı. Katalog kimliğiyle 1:1 (64/64). Alanlar: tuvalet, elektrik, su, odun, ateş, market; artı / eksi; ipucu; “bu gece” cümlesi.

Saha gerçeği (uydurma yok):
- Tuvalet: 11 var (denetim sonrası), 53 belirsiz.
- Elektrik: 0 var, 3 yok (Polonezköy, Beşkayalar, Yedigöller), 61 belirsiz.
- Su: 6 var, 58 belirsiz.
- Odun: 62 getir (kesmek yasak), 1 yerinde (Yedigöller Habitat restoran), 1 yasak (Abant).
- Ateş: 63 ocak (serbest mangal değil), 1 yasak (Abant). Yedigöller’de yerde ateş ayrıca yasak; tüp valilik saatine bağlı.
- Market: 11 var, 8 yakın, 2 yok, 43 belirsiz.
- Kaynak güveni: 13 yüksek, 8 orta, 43 düşük. 44 parkta “gitmeden idareyi arayın” zaten metinde.

Yedigöller somut: Habitat işletmesi, rezervasyonsuz yer yok, karavan / araç üstü çadır alınmıyor, ortak WC–mescit–restoran var, duş ve priz yok. DKMP kaydı “karavan” dese de saha almıyor; rehber sahayı yazdı.

Araştırma dosyaları (`scripts/adim4-reviews.json`, `adim4-eksi.json`) sitede yorum değildir. 35 parkta blog/Ekşi cümlesi var; kullanıcı sesi diye basılmadı.

## Ekle (ranked, why, effort)
1. **Yangın yasağı bandı (canlı iddiası dürüst).** Neden: 63 park “ocak” yazıyor; yazın valilik/OGM kararı bunu ezer. Abant zaten yasak. Effort: düşük–orta. GitHub Pages OGM sayfasını CORS yüzünden çekemez. Çözüm: 1 Haziran–31 Ekim üst bant (“ateş serbest değildir; gişe ve valilik kararına bakın”) + OGM orman yangını / ilgili DKMP duyurusu linki + elle güncellenen `data/fire-ban.json` (`season`, `updated`, `note`). Park kartındaki “ocak” bu bant varken yeşil ışık olmasın.

2. **Gitmeden DKMP / park idaresini ara.** Neden: 51 tuvalet belirsiz, 61 elektrik belirsiz, 9 tarife boş, 44 rehber zaten aramayı söylüyor. Dilburnu, Kurşunlu, Yazılı Kanyon, Arkutdağı, Deregöl, Sünnet Gölü dönemsel kapanabiliyor. Effort: düşük. Kart ve detayda sabit CTA: “Bu sayfa rezervasyon değildir. Gitmeden ilgili DKMP bölge müdürlüğünü veya gişeyi arayın.” Telefon kazıma yok; resmi kurum sayfasına link.

3. **Yedigöller Habitat rezervasyon linki.** Neden: sonbahar/hafta sonu kapıda yer yok; karavan yasağı saha kuralı. Effort: düşük. Tek giden link: `https://www.yedigollermillipark.com/ev-turu/kamp-alani/`. Müsaitlik kazıma yok. Link yanında: rezervasyon şart, karavan yasak, elektrik/duş yok, odun restorandan.

4. **Hava (tahmin, kural değil).** Neden: Bolu kış yolu, 1330–2017 m gece soğuğu (Abant, Sarıalan, Yakupabdal, Geben), yağmurda çamur. Effort: orta. Open-Meteo, park lat/lng, anahtarsız, istemci tarafı. Yağış / rüzgâr / don göster. Yangın yasağının veya “bu gece kalın” kararının yerine geçmesin. Çevrimdışı JSON kataloğu bozulmaz.

5. **GPX kalsın.** Neden: 52 parkurda iz ve GPX indirme zaten var; kamp rehberi rota klonu değil. Effort: yok (koru). Yeni Wikiloc/AllTrails izi ekleme. Parkur fotoğrafı Unsplash kalsa da kamp kartına taşıma.

6. **KTB belgeli özel kamping — sonra.** Neden: 30 il, 316 tesis / 302 kamping; ücret işletmenin, DKMP Ek-4 değil. Effort: yüksek. Koordinat yoksa haritaya pin basma. Göynük Çomaklar ile Kemer özel kampingini karıştırma (rehberde zaten uyarı var). Hesap / giriş yine yok.

İsteğe bağlı, rehber yerleştikten sonra: tuvalet=var (13) ve tarife bandı filtresi. Ücret yok = ücretsiz filtresi asla olmasın.

## Ekleme (why it would hurt quality or legality)
1. **Google yorum / fotoğraf kazıması.** Hizmet şartı ve telif. 3. adımda red edildi. Sahte “4.8 (642)” kamp kartına da taşınmaz (o sayı parkur stoğudur).
2. **Sahte kullanıcı yorumu.** Adım 2 localStorage + “ilk yorumu sen yaz” güven kırdı; 3. adımda çıkarıldı. Uydurma isim, yıldız, “dün geldim” cümlesi katalogu yalanlar.
3. **Ekşi/blog alıntısını yorum diye basmak.** 35 parkta cümle var; kaynak karışık, tarih yok, hakaret ve güncel olmayan tesis iddiası var. Araştırma dosyasında kalsın.
4. **Park4Night / OSM / Kamp Nokta “ücretsiz” pin.** Topluluk envanteri izin değildir. 6831 md. 76-a / 110. Harita pini zaten izin değil.
5. **Habitat (veya başka işletme) müsaitlik kazıması.** Kırılır, yanlış doluluk gösterir, rezervasyonu kaçırır. Yalnız resmi link.
6. **Sahte Giriş / Kaydol.** 3. adım kararı. Statik sitede hesap yok.
7. **Jenerik çadır, Unsplash, Google yorum fotoğrafı.** Kamp kartı: Commons veya boş (“temsili görsel yok”). 42/64 en az bir, 34/64 en az üç yerinde kare; gerisi boş kalsın.
8. **“Elektrik var” / “tuvalet var” uydurması.** Elektrikte sıfır teyit. Belirsizi var yapmak aileleri hazırlıksız bırakır.

## Riskler (outdated facilities, fire bans, honest belirsiz)
Tesis eskir. Büfe sezonsal kapanır, WC kilitlenir, çeşme kesilir. “Var” yazılan 13 tuvalet de 2026 taramasıdır; 2027’de gişeden sorun. Polonezköy kapı 09:00–19:00 gibi saatler değişir.

Yangın yasağı günlük olabilir. “Ocak” = izinli ocakta, o da valilik açıkken. Yazın Ege–Akdeniz–Marmara ada ve orman hatları (Ayvalık, Büyükada, Dilburnu, Karanlıkdere, Göynük, Huzurlu) sıkı. Abant’ta mangal–odun–kömür yasak; gazlı ocak. Yedigöller’de yerde ateş yok, tüp 20:00–07:00 notu güncel yasağa yenik düşer. Bandı olmayan uygulama “mangal serbest” okunur; bu yasal ve yangın riskidir.

Belirsiz dürüst kalsın. 51 tuvalet, 61 elektrik, 58 su, 43 düşük güven. Belirsiz ≠ yok. Yok denirse (üç elektrik kaydı) onu da teyitsiz yeşile çevirme. Tarife `null` olan 9 park (Karlık, Ortaburun, Karamanastır, Yerköprü, Çatak Kanyonu, Harmankaya, Sarıçalı, Dumanlı, Huzurlu) ücretsiz değildir.

Katalog ≠ saha. Yedigöller kaydı bungalov/çadır/karavan der; Habitat karavan almaz. Kurşunlu tarifede 285 TL ama geceleme tartışmalı. Arkutdağı ve Deregöl 2023 ilanı, tesis yok sayılıyor.

Odun: ormandan kesmek yasak (6831). “Getir” = dışarıdan; park içi kesim önerisi asla çıkmasın.

Bu sayfa izin, rezervasyon veya yangın raporu değildir. Pin izin değildir. Gitmeden arayın.
