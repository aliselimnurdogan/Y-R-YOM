import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const PHOTO_IDS = [
  '1464822759023-fed622ff2c3b',
  '1551632811-561732d1e306',
  '1501555088652-021faa106b9b',
  '1470071459604-3b5ec3a7fe05',
  '1441974231531-c6227db76b6e',
  '1511497584788-876760111969',
  '1439066615861-d1af74d74000',
  '1501785888041-af3ef285b470',
  '1469474968028-56623f02e42e',
  '1472214103451-9374bd1c798e',
  '1500530855697-b586d89ba3ee',
  '1482192505345-5655af888cc4',
  '1476041800959-2f6bb412c8ce',
  '1445308394109-4ec2920981b1',
  '1475924156734-496f6cac6ec1',
  '1426604966848-d7adac402bff',
  '1470770841072-f978cf4d019e',
  '1500534314209-a25ddb2bd429',
  '1418065460487-3e41a6c84dc5',
  '1472396961693-142e6e269027',
  '1476514525535-07fb3b4ae5f1',
  '1465695954255-a262b0f57b40',
  '1504280390367-361c6d9f38f4',
  '1470246973918-29a93221c455',
  '1613487700156-bbde37f69132',
  '1631740694409-580a251e4ab8',
  '1602391833977-358a52198938',
  '1471115853179-bb1d604434e0',
  '1576176539998-0237d1ac6a85',
  '1542273917363-3b1817f69a2d',
  '1509316975850-ff9c5deb0cd9',
  '1500389783522-18c9d0d14cbc',
  '1551120738-c3fcea8d0cf8',
  '1607348318282-6d2148bb296c',
  '1440688807730-73e4e2169fb8',
  '1613297595539-0d36a37702c6',
  '1431965400057-a84b80cfdbff',
  '1593201464529-e286c575128c',
  '1644676654534-abc4f62ceee1',
  '1506905925346-21bda4d32df4',
  '1483728642387-6c3bdd6c93e5',
  '1519681393784-d120267933ba',
  '1470252649378-9c29740c9fa8',
  '1502082553048-f009c37129b9',
  '1493246507139-91e8fad9978e',
  '1473773508845-188df298d2d1',
  '1447752875215-b2761acb3c5d',
  '1518495973542-4542c06a5843',
]

function photo(id) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=72`
}

function gallery(index) {
  return Array.from({ length: 4 }, (_, offset) => photo(PHOTO_IDS[(index * 4 + offset) % PHOTO_IDS.length]))
}

const raw = [
  { id: 'cirali', title: 'Çıralı Kamp', kind: 'sahil', region: 'Antalya', city: 'Kemer', lat: 36.416, lng: 30.478, elevationM: 8, summary: 'Olympos ile yan yana, çakıl sahilde çadır ve pansiyon kampıdır. Yanardağ alevleri ve deniz aynı gecede; yazın dolu, ilkbahar-sonbahar daha sakin.' },
  { id: 'olympos-kamp', title: 'Olympos Ağaç Ev Kamp', kind: 'orman', region: 'Antalya', city: 'Kemer', lat: 36.397, lng: 30.472, elevationM: 40, summary: 'Antik kent gölgesinde, çınar ve narenciye arasında ağaç ev ve çadır kampıdır. Denize kısa yürüyüş; yaz geceleri serin dereden gelir.' },
  { id: 'adrasan', title: 'Adrasan Koyu', kind: 'sahil', region: 'Antalya', city: 'Kumluca', lat: 36.333, lng: 30.447, elevationM: 6, summary: 'Likya yolunun durak koylarından biri. Çadır sahil çamının altında, deniz sığ ve korunaklı; tekne ve yürüyüş bir arada.' },
  { id: 'phaselis-goynuk', title: 'Göynük Kanyonu Kamp', kind: 'orman', region: 'Antalya', city: 'Kemer', lat: 36.682, lng: 30.527, elevationM: 180, summary: 'Kemer kuzeyinde kanyon deresi ve çam gölgesi. Günübirlik serinlemek için dolu, gece çadırı dere kenarında kurulur.' },
  { id: 'koprulu-kanyon', title: 'Köprülü Kanyon Kamp', kind: 'orman', region: 'Antalya', city: 'Manavgat', lat: 37.191, lng: 31.179, elevationM: 250, summary: 'Rafting nehri kenarında çam ve çınar kampıdır. Yazın su sesi, kışın ıslak zemin; karavan da iner.' },
  { id: 'gedelme', title: 'Gedelme Yaylası', kind: 'yayla', region: 'Antalya', city: 'Kemer', lat: 36.64, lng: 30.43, elevationM: 1250, summary: 'Beydağları eteklerinde sedir yaylası. Yazın serin, kışın kar; Tahtalı manzarası ve kısa yürüyüş hatları var.' },
  { id: 'gombe-ucarsu', title: 'Gömbe Uçarsu', kind: 'yayla', region: 'Antalya', city: 'Kaş', lat: 36.66, lng: 29.72, elevationM: 1350, summary: 'Akdağ eteklerinde şelale ve yayla düzlüğü. Yazın çadır, su buz gibi; Yeşilgöl yürüyüşü yakındır.' },
  { id: 'patara-kamp', title: 'Patara Kumsal Kamp', kind: 'sahil', region: 'Antalya', city: 'Kaş', lat: 36.266, lng: 29.317, elevationM: 5, summary: 'Uzun kumsala yakın çadır ve karavan alanı. Caretta sezonunda gece ışık kuralı var; rüzgâr batıdan sert eser.' },
  { id: 'kabak-koyu', title: 'Kabak Koyu', kind: 'sahil', region: 'Muğla', city: 'Fethiye', lat: 36.464, lng: 29.123, elevationM: 20, summary: 'Yamaçtan inilen sakin koy. Çadır ve bungalov çam gölgesinde, deniz berrak; araç son virajda kalır.' },
  { id: 'oludeniz-belcekiz', title: 'Belcekız – Ölüdeniz', kind: 'sahil', region: 'Muğla', city: 'Fethiye', lat: 36.55, lng: 29.121, elevationM: 4, summary: 'Lagün kıyısında turistik ama sabah erken çadır-deniz birleşir. Yamaç paraşütü inişi hemen yanında.' },
  { id: 'saklikent-kamp', title: 'Saklıkent Kamp', kind: 'orman', region: 'Muğla', city: 'Seydikemer', lat: 36.473, lng: 29.408, elevationM: 180, summary: 'Kanyon ağzında çınar altı kamp ve platformlar. Yazın serin su, akşam rüzgârı vadiden iner.' },
  { id: 'akyaka', title: 'Akyaka Azmak Kamp', kind: 'sahil', region: 'Muğla', city: 'Ula', lat: 37.055, lng: 28.325, elevationM: 6, summary: 'Gökova’nın sığ koyu, azmak kenarı kamptır. Sörf ve kano sabah erken; yazın dolu, kışın ıssız.' },
  { id: 'palamutbuku', title: 'Palamutbükü', kind: 'sahil', region: 'Muğla', city: 'Datça', lat: 36.671, lng: 27.516, elevationM: 8, summary: 'Datça ucunda sakin koy. Çadır ve pansiyon karışık, deniz berrak, Datça rüzgârı öğleden sonra sertleşir.' },
  { id: 'bozburun-kamp', title: 'Bozburun Koyları', kind: 'sahil', region: 'Muğla', city: 'Marmaris', lat: 36.688, lng: 28.059, elevationM: 10, summary: 'Yatların uğradığı küçük koylarda çadır ve pansiyon. Yazın sıcak, su berrak; market uzak, suyu hesapla.' },
  { id: 'koycegiz-sultaniye', title: 'Köyceğiz – Sultaniye', kind: 'gol', region: 'Muğla', city: 'Köyceğiz', lat: 36.9, lng: 28.64, elevationM: 8, summary: 'Göl kenarı çam ve kükürtlü kaplıca. Çadır ve karavan iner; sazlık kuşları sabah erken.' },
  { id: 'iztuzu', title: 'İztuzu Kamp', kind: 'sahil', region: 'Muğla', city: 'Ortaca', lat: 36.826, lng: 28.561, elevationM: 4, summary: 'Dalyan ağzındaki kumsala yakın kamp. Caretta koruma alanı; gece ışık ve ateş kuralı sıkı.' },
  { id: 'salda-golu', title: 'Salda Gölü Kamp', kind: 'gol', region: 'Burdur', city: 'Yeşilova', lat: 37.55, lng: 29.675, elevationM: 1139, summary: 'Beyaz kıyılı yüksek göl. Çadır ve karavan belirlenen alanda; yazın serin, kışın rüzgârlı ve soğuk.' },
  { id: 'egirdir-kovada', title: 'Eğirdir – Kovada', kind: 'gol', region: 'Isparta', city: 'Eğirdir', lat: 37.85, lng: 30.85, elevationM: 920, summary: 'Göl ve milli park ormanı bir arada. Elma bahçeleri, çadır düzlüğü; kışın sisli, yazın serin.' },
  { id: 'kazdagi-kamp', title: 'Kaz Dağı Kamp', kind: 'orman', region: 'Balıkesir', city: 'Edremit', lat: 39.7, lng: 26.84, elevationM: 700, summary: 'Milli park içi çam ve kayın. Şahinderesi ve zirve yürüyüşü; su kaynaklı, yazın serin.' },
  { id: 'assos-kamp', title: 'Assos Kamp', kind: 'sahil', region: 'Çanakkale', city: 'Ayvacık', lat: 39.49, lng: 26.337, elevationM: 20, summary: 'Antik tiyatro eteklerinde zeytin ve deniz. Küçük koy kampları, rüzgâr kuzeyden; gün batımı açık.' },
  { id: 'ayvalik-kamp', title: 'Ayvalık Sarımsaklı Kamp', kind: 'sahil', region: 'Balıkesir', city: 'Ayvalık', lat: 39.27, lng: 26.65, elevationM: 5, summary: 'Ada manzaralı sahil kampı. Yazın kalabalık, ilkbahar sakin; zeytin gölgesi sınırlı.' },
  { id: 'foca-kamp', title: 'Foça Kamp', kind: 'sahil', region: 'İzmir', city: 'Foça', lat: 38.67, lng: 26.75, elevationM: 8, summary: 'Eski Foça koylarında çadır ve karavan. Fok koruma suyu berrak; yazın erken yer tut.' },
  { id: 'dilek-yarimadasi', title: 'Dilek Yarımadası', kind: 'orman', region: 'Aydın', city: 'Kuşadası', lat: 37.66, lng: 27.17, elevationM: 50, summary: 'Milli park içi kamping ve koylar. Kızılçam, yaban domuzu, deniz berrak; giriş saatine uy.' },
  { id: 'bafa-golu', title: 'Bafa Gölü Kamp', kind: 'gol', region: 'Muğla', city: 'Milas', lat: 37.5, lng: 27.67, elevationM: 10, summary: 'Latmos eteklerinde göl kampı. Manastır yürüyüşü, kuş göçü; yazın sivrisinek, kışın ıssız.' },
  { id: 'spil-kamp', title: 'Spil Dağı Kamp', kind: 'orman', region: 'Manisa', city: 'Yunusemre', lat: 38.55, lng: 27.45, elevationM: 1200, summary: 'Manisa üstünde milli park kampı. Tülüşah ve manzara; yazın serin, kışın kar.' },
  { id: 'bozdag-kamp', title: 'Bozdağ Kamp', kind: 'yayla', region: 'İzmir', city: 'Ödemiş', lat: 38.33, lng: 28.1, elevationM: 1650, summary: 'Kayak tesisi altı yayla. Yazın çadır, kışın kar; Gölcük gölü yakındır.' },
  { id: 'cesme-ildir', title: 'Ildır – Çeşme', kind: 'sahil', region: 'İzmir', city: 'Çeşme', lat: 38.38, lng: 26.48, elevationM: 8, summary: 'Erythrai koyunda sakin sahil kampı. Rüzgâr batı, su berrak; yazın erken gel.' },
  { id: 'yedigoller', title: 'Yedigöller Kamp', kind: 'orman', region: 'Bolu', city: 'Merkez', lat: 40.943, lng: 31.745, elevationM: 890, summary: 'Yedi göl ve kayın ormanı. Sonbahar renk, yazın serin çadır; kapı saati ve ayı uyarısı var.' },
  { id: 'abant-kamp', title: 'Abant Gölü Kamp', kind: 'gol', region: 'Bolu', city: 'Merkez', lat: 40.609, lng: 31.279, elevationM: 1325, summary: 'Göl çevresi çam kampı. Karavan ve çadır, kışın kar; yürüyüş halkası kısa.' },
  { id: 'golcuk-bolu', title: 'Gölcük Tabiat Parkı', kind: 'gol', region: 'Bolu', city: 'Merkez', lat: 40.7, lng: 31.47, elevationM: 1100, summary: 'Küçük krater gölü, çadır ve piknik. Bolu’ya yakın, yaz hafta sonu dolu.' },
  { id: 'uludag-sarialan', title: 'Sarıalan – Uludağ', kind: 'yayla', region: 'Bursa', city: 'Osmangazi', lat: 40.13, lng: 29.08, elevationM: 1620, summary: 'Teleferik üstü çayır kampı. Yazın serin, kışın tesis; zirve yürüyüşü buradan başlar.' },
  { id: 'iznik-kamp', title: 'İznik Gölü Kamp', kind: 'gol', region: 'Bursa', city: 'İznik', lat: 40.43, lng: 29.72, elevationM: 85, summary: 'Göl kenarı zeytin ve sazlık. Çadır-karavan, gün batımı açık; yazın sivrisinek.' },
  { id: 'sile-agva', title: 'Ağva – Şile Kamp', kind: 'sahil', region: 'İstanbul', city: 'Şile', lat: 41.14, lng: 29.85, elevationM: 8, summary: 'Göksu–Yeşilçay ağzında sahil ve nehir kampı. İstanbul’a yakın, hafta sonu dolu.' },
  { id: 'polonezkoy', title: 'Polonezköy Kamp', kind: 'orman', region: 'İstanbul', city: 'Beykoz', lat: 41.11, lng: 29.21, elevationM: 130, summary: 'Belgrad’a yakın orman içi çadır. Şehre yakın doğa; ateş kuralı var, su tesisten.' },
  { id: 'ballikayalar', title: 'Ballıkayalar Kamp', kind: 'orman', region: 'Kocaeli', city: 'Gebze', lat: 40.84, lng: 29.52, elevationM: 180, summary: 'Kanyon tabiat parkı. Kısa yürüyüş ve tırmanış, çadır düzlüğü sınırlı; hafta sonu kalabalık.' },
  { id: 'masukiye', title: 'Maşukiye Kamp', kind: 'orman', region: 'Kocaeli', city: 'Kartepe', lat: 40.7, lng: 30.15, elevationM: 150, summary: 'Şelale ve mesire kampı. Kartepe etek, yazın serin; otopark dolu olur.' },
  { id: 'igneada-longoz', title: 'İğneada Longoz', kind: 'orman', region: 'Kırklareli', city: 'Demirköy', lat: 41.88, lng: 27.98, elevationM: 8, summary: 'Sel ormanı ve kumsala yakın milli park kampı. Sivrisinek yazın çok, kuş göçü zengin.' },
  { id: 'ayder', title: 'Ayder Yaylası Kamp', kind: 'yayla', region: 'Rize', city: 'Çamlıhemşin', lat: 40.95, lng: 41.1, elevationM: 1350, summary: 'Kaçkar etek, kaplıca ve yayla. Çadır sınırlı, bungalov bol; yağmur sık, çamur beklenir.' },
  { id: 'elevit-pokut', title: 'Elevit – Pokut', kind: 'yayla', region: 'Rize', city: 'Çamlıhemşin', lat: 40.9, lng: 41.05, elevationM: 1800, summary: 'Bulut üstü yayla kampı. Kaçkar yaklaşımı, yazın sürü; su çeşmeden, rüzgâr sert.' },
  { id: 'uzungol-kamp', title: 'Uzungöl Kamp', kind: 'gol', region: 'Trabzon', city: 'Çaykara', lat: 40.619, lng: 40.295, elevationM: 1090, summary: 'Vadi gölü çevresi. Resmi kamp alanı sınırlı, yayla üstleri daha sakin; yağmur sık.' },
  { id: 'altindere', title: 'Altındere – Sümela', kind: 'orman', region: 'Trabzon', city: 'Maçka', lat: 40.69, lng: 39.65, elevationM: 500, summary: 'Manastır vadisi orman kampı. Nemli kayın, dere sesi; ayı uyarısı geçerli.' },
  { id: 'savsat-karagol', title: 'Şavşat Karagöl', kind: 'gol', region: 'Artvin', city: 'Şavşat', lat: 41.3, lng: 42.45, elevationM: 1800, summary: 'Milli park gölü, çadır ve bungalov. Sis ve ladin, yazın serin, kışın kapalı olabilir.' },
  { id: 'kafkasor', title: 'Kafkasör Yaylası', kind: 'yayla', region: 'Artvin', city: 'Merkez', lat: 41.16, lng: 41.8, elevationM: 1250, summary: 'Artvin üstü çayır ve orman. Boğa güreşi alanı, yaz kampı; manzara Çoruh’a iner.' },
  { id: 'ilgaz-kamp', title: 'Ilgaz Kamp', kind: 'orman', region: 'Kastamonu', city: 'Ilgaz', lat: 41.05, lng: 33.67, elevationM: 1850, summary: 'Milli park ve kayak etek kampı. Göknar, yazın serin, kışın kar; yaban hayatı var.' },
  { id: 'kure-horma', title: 'Horma Kanyonu', kind: 'orman', region: 'Kastamonu', city: 'Pınarbaşı', lat: 41.62, lng: 33.12, elevationM: 450, summary: 'Küre dağları, asma köprü ve vadi kampı. Nemli orman, şelale; çadır kanyon dışında.' },
  { id: 'hamsilos', title: 'Hamsilos Koyu', kind: 'sahil', region: 'Sinop', city: 'Merkez', lat: 42.06, lng: 35.05, elevationM: 8, summary: 'Fjorda benzeyen koy. Çadır kıyı çamında, Karadeniz serin; rüzgâr kuzey.' },
  { id: 'yenice-orman', title: 'Yenice Ormanları', kind: 'orman', region: 'Karabük', city: 'Yenice', lat: 41.2, lng: 32.33, elevationM: 400, summary: 'Şimşir ve kayın koridoru. Çadır dere kenarı, ayı ve nem; yürüyüş hatları uzun.' },
  { id: 'goreme-kamp', title: 'Göreme Kamp', kind: 'orman', region: 'Nevşehir', city: 'Göreme', lat: 38.643, lng: 34.828, elevationM: 1100, summary: 'Peri bacaları dibinde çadır ve pansiyon kampı. Gece serin, gündüz tozlu; gün doğumu vadilere yakın.' },
  { id: 'ihlara-kamp', title: 'Ihlara Vadisi Kamp', kind: 'orman', region: 'Aksaray', city: 'Güzelyurt', lat: 38.26, lng: 34.3, elevationM: 1200, summary: 'Kanyon tabanında Melendiz kenarı. Gölge ve su, yazın serin; çadır vadi girişinde.' },
  { id: 'erciyes-kamp', title: 'Erciyes Tekir Kamp', kind: 'yayla', region: 'Kayseri', city: 'Melikgazi', lat: 38.55, lng: 35.52, elevationM: 2200, summary: 'Dağ etek kampı. Yazın serin çayır, kışın kayak; rüzgâr sert, su tesisten.' },
  { id: 'aladaglar-kamp', title: 'Demirkazık Kamp', kind: 'yayla', region: 'Niğde', city: 'Çamardı', lat: 37.84, lng: 35.12, elevationM: 1600, summary: 'Aladağlar milli park kapısı. Çadır köy üstü, zirve yürüyüşü; yazın çoban, kışın kar.' },
  { id: 'nemrut-kamp', title: 'Nemrut Kamp', kind: 'yayla', region: 'Adıyaman', city: 'Kahta', lat: 37.98, lng: 38.74, elevationM: 1800, summary: 'Tümülüs altı yayla. Gün doğumu için gece çadır, rüzgâr sert, su az.' },
  { id: 'baskonus-kamp', title: 'Başkonuş Yaylası', kind: 'yayla', region: 'Kahramanmaraş', city: 'Onikişubat', lat: 37.5666, lng: 36.5838, elevationM: 1320, summary: 'Sedir-göknar yayla kampı. Yazın serin, çadır ve karavan düzlüğü; Maraş sıcağından kaçar.' },
  { id: 'tekir-maras-kamp', title: 'Tekir Yaylası', kind: 'yayla', region: 'Kahramanmaraş', city: 'Onikişubat', lat: 37.885, lng: 36.623, elevationM: 1503, summary: 'Kayseri yolu vadi yaylası. Dere ve gölet kenarı çadır; gece ovadan soğuk.' },
  { id: 'kizilcahamam', title: 'Soğuksu – Kızılcahamam', kind: 'orman', region: 'Ankara', city: 'Kızılcahamam', lat: 40.47, lng: 32.65, elevationM: 975, summary: 'Milli park çam kampı. Başkente yakın, kaplıca kasabası; yaz sonu sakin.' },
  { id: 'palandoken-kamp', title: 'Palandöken Etek Kamp', kind: 'yayla', region: 'Erzurum', city: 'Yakutiye', lat: 39.85, lng: 41.28, elevationM: 2200, summary: 'Kayak dağı eteği yaz kampı. Çayır ve rüzgâr, su tesisten; gece soğuk.' },
  { id: 'van-edremit-kamp', title: 'Van Gölü Edremit Kamp', kind: 'gol', region: 'Van', city: 'Edremit', lat: 38.42, lng: 43.25, elevationM: 1650, summary: 'Göl kenarı çakıl kamp. Gün batımı açık, su tuzlu; yazın sıcak, rüzgâr öğleden sonra.' },
  { id: 'tatvan-nemrut', title: 'Nemrut Krater – Tatvan', kind: 'gol', region: 'Bitlis', city: 'Tatvan', lat: 38.62, lng: 42.24, elevationM: 2300, summary: 'Krater gölleri üstü yayla. Yazın çadır, manzara Van Gölü; gece çok soğuk.' },
  { id: 'munzur-kamp', title: 'Munzur Gözeleri', kind: 'orman', region: 'Tunceli', city: 'Merkez', lat: 39.14, lng: 39.5, elevationM: 1000, summary: 'Göze ve vadi kampı. Buz gibi su, çınar gölgesi; milli park kuralına uy.' },
]

const camps = raw.map((item, index) => ({
  ...item,
  images: gallery(index),
  videos: [],
}))

const json = `${JSON.stringify(camps, null, 2)}\n`
for (const dir of ['src/data', 'public/data']) {
  mkdirSync(join(root, dir), { recursive: true })
  writeFileSync(join(root, dir, 'camps.json'), json)
}
console.log(`wrote ${camps.length} camps, min images ${Math.min(...camps.map((c) => c.images.length))}`)
