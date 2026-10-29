import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const UA = 'YuruyomKampRehberi/3.0 (https://github.com/aliselimnurdogan/Y-R-YOM; educational catalog)'

const parks = [
  { id: 'ayvalik-adalari', title: 'Ayvalık Adaları Tabiat Parkı', kind: 'sahil', zone: 'Marmara', region: 'Balıkesir', city: 'Ayvalık', lat: 39.32, lng: 26.64, elevationM: 50, areaHa: 19624, feeTent: 225, statusLabel: 'Tabiat parkı', wiki: 'Ayvalık Adaları', summary: 'Edremit körfezindeki ada ve kıyı tabiat parkı. DKMP kaydında çadırlı kamp ve günübirlik kullanım vardır; geceleme yalnızca idarenin gösterdiği yerde.' },
  { id: 'kinik-selalesi', title: 'Kınık Şelalesi Tabiat Parkı', kind: 'orman', zone: 'Marmara', region: 'Bilecik', city: 'Osmaneli', lat: 40.3, lng: 29.95, elevationM: 466, areaHa: 111, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Kınık Şelalesi', summary: 'Bilecik’te şelale ve orman tabiat parkı. Çadırlı kamp kaydı vardır; şelale çevresi ıslak ve kaygandır.' },
  { id: 'kucukelmali', title: 'Küçükelmalı Tabiat Parkı', kind: 'orman', zone: 'Marmara', region: 'Bilecik', city: 'Pazaryeri', lat: 39.98, lng: 29.9, elevationM: 870, areaHa: 62, feeTent: 195, statusLabel: 'Tabiat parkı', wiki: 'Küçükelmalı', summary: 'Pazaryeri yayla ormanı. Çadırlı kamp ve fotosafari kaydı vardır; suyun yerini idareden sorun.' },
  { id: 'sadagi-kanyonu', title: 'Sadağı Kanyonu Tabiat Parkı', kind: 'orman', zone: 'Marmara', region: 'Bursa', city: 'Orhaneli', lat: 39.9, lng: 28.95, elevationM: 737, areaHa: 474, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Sadağı Kanyonu', summary: 'Orhaneli kanyonu. Çadırlı kamp kaydı vardır; kanyon tabanı geceleme yeri değildir.' },
  { id: 'suuctu', title: 'Suuçtu Tabiat Parkı', kind: 'orman', zone: 'Marmara', region: 'Bursa', city: 'Mustafakemalpaşa', lat: 39.88, lng: 28.97, elevationM: 490, areaHa: 43, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Suuçtu Şelalesi', summary: 'Mustafakemalpaşa şelalesi ve mesire. Çadırlı kamp kaydı vardır; yazın kalabalık, geceleme tahsisli alanda.' },
  { id: 'buyukada-tp', title: 'Büyükada Tabiat Parkı', kind: 'orman', zone: 'Marmara', region: 'İstanbul', city: 'Adalar', lat: 40.85, lng: 29.12, elevationM: 80, areaHa: 3, feeTent: 225, statusLabel: 'Tabiat parkı', wiki: 'Büyükada', summary: 'Adalar’da küçük tabiat parkı. Çadırlı kamp kaydı vardır; ada kuralları ve yangın yasağı sıkıdır.' },
  { id: 'danamandira', title: 'Danamandıra Tabiat Parkı', kind: 'orman', zone: 'Marmara', region: 'İstanbul', city: 'Çatalca', lat: 41.28, lng: 28.25, elevationM: 170, areaHa: 381, feeTent: 225, statusLabel: 'Tabiat parkı', wiki: 'Danamandıra', summary: 'Çatalca orman tabiat parkı. Çadırlı kamp kaydı vardır; İstanbul’a yakın, hafta sonu dolu.' },
  { id: 'dilburnu', title: 'Dilburnu Tabiat Parkı', kind: 'sahil', zone: 'Marmara', region: 'İstanbul', city: 'Adalar', lat: 40.87, lng: 29.05, elevationM: 20, areaHa: 7, feeTent: 225, statusLabel: 'Tabiat parkı', wiki: 'Heybeliada Dilburnu', summary: 'Heybeliada burun ormanı. Çadırlı kamp kaydı vardır; alan küçük, geceleme idareyerinde.' },
  { id: 'hacet-deresi', title: 'Hacet Deresi Tabiat Parkı', kind: 'orman', zone: 'Marmara', region: 'İstanbul', city: 'Şile', lat: 41.17, lng: 29.55, elevationM: 68, areaHa: 16, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Şile', summary: 'Şile deresi tabiat parkı. Çadırlı kamp kaydı vardır; dere kenarı ıslak, yangına dikkat.' },
  { id: 'hasdal', title: 'Kağıthane Hasdal Tabiat Parkı', kind: 'orman', zone: 'Marmara', region: 'İstanbul', city: 'Kağıthane', lat: 41.09, lng: 28.97, elevationM: 70, areaHa: 363, feeTent: 105, statusLabel: 'Tabiat parkı', wiki: 'Hasdal orman', summary: 'Kent içi orman parkı. Çadırlı kamp kaydı vardır; şehir gürültüsü yakındır.' },
  { id: 'polonezkoy-tp', title: 'Polonezköy Tabiat Parkı', kind: 'orman', zone: 'Marmara', region: 'İstanbul', city: 'Beykoz', lat: 41.11, lng: 29.21, elevationM: 200, areaHa: 2931, feeTent: 225, statusLabel: 'Tabiat parkı', wiki: 'Polonezköy Tabiat Parkı', summary: 'Beykoz orman ve doğal yaşam parkı. Çadırlı kamp kaydı vardır; ateş ve geceleme tahsisli yerde.' },
  { id: 'beskayalar', title: 'Beşkayalar Tabiat Parkı', kind: 'orman', zone: 'Marmara', region: 'Kocaeli', city: 'Kartepe', lat: 40.72, lng: 29.95, elevationM: 950, areaHa: 1100, feeTent: 195, statusLabel: 'Tabiat parkı', wiki: 'Beşkayalar', summary: 'Kartepe kanyon-orman. Çadırlı kamp ve dağcılık kaydı vardır; su kaynaklıdır.' },
  { id: 'suadiye-tp', title: 'Suadiye Tabiat Parkı', kind: 'orman', zone: 'Marmara', region: 'Kocaeli', city: 'Kartepe', lat: 40.7, lng: 30.1, elevationM: 1050, areaHa: 37, feeTent: 195, statusLabel: 'Tabiat parkı', wiki: 'Kartepe', summary: 'Kartepe etek tabiat parkı. Çadırlı kamp ve bisiklet yolu kaydı vardır.' },
  { id: 'poyrazlar', title: 'Poyrazlar Gölü Tabiat Parkı', kind: 'gol', zone: 'Marmara', region: 'Sakarya', city: 'Adapazarı', lat: 40.8, lng: 30.47, elevationM: 75, areaHa: 231, feeTent: 195, statusLabel: 'Tabiat parkı', wiki: 'Poyrazlar Gölü', summary: 'Sakarya göl tabiat parkı. Çadırlı kamp kaydı vardır; kuş gözlemi zengindir.' },
  { id: 'kartaltepe', title: 'Tekirdağ Kartaltepe Tabiat Parkı', kind: 'orman', zone: 'Marmara', region: 'Tekirdağ', city: 'Süleymanpaşa', lat: 40.98, lng: 27.48, elevationM: 383, areaHa: 254, feeTent: 195, statusLabel: 'Tabiat parkı', wiki: 'Tekirdağ Kartaltepe', summary: 'Tekirdağ orman sırtı. Çadırlı kamp kaydı vardır; rüzgâr açık sırtta sert olabilir.' },
  { id: 'karlik-yaylasi', title: 'Karlık Yaylası Tabiat Parkı', kind: 'yayla', zone: 'Marmara', region: 'Yalova', city: 'Çınarcık', lat: 40.58, lng: 29.15, elevationM: 845, areaHa: 34, feeTent: null, statusLabel: 'Tabiat parkı', wiki: 'Karlık Yaylası Yalova', summary: 'Çınarcık yayla tabiat parkı. Çadırlı kamp kaydı vardır; tarife satırı boşsa ücretsiz demek değildir.' },
  { id: 'ortaburun', title: 'Ortaburun Tabiat Parkı', kind: 'orman', zone: 'Marmara', region: 'Yalova', city: 'Çınarcık', lat: 40.6, lng: 29.12, elevationM: 220, areaHa: 153, feeTent: null, statusLabel: 'Tabiat parkı', wiki: 'Ortaburun Yalova', summary: 'Yalova orman tabiat parkı. Çadırlı kamp kaydı vardır; geceleme idarenin gösterdiği düzlükte.' },
  { id: 'bafa-golu-tp', title: 'Bafa Gölü Tabiat Parkı', kind: 'gol', zone: 'Ege', region: 'Aydın', city: 'Milas', lat: 37.5, lng: 27.67, elevationM: 100, areaHa: 11842, feeTent: 255, statusLabel: 'Tabiat parkı', wiki: 'Bafa Gölü Tabiat Parkı', summary: 'Latmos eteklerinde göl. Çadırlı kamp kaydı vardır; manastır yürüyüşü ayrı, geceleme tahsisli kıyıda.' },
  { id: 'spil-dagi-mp', title: 'Spil Dağı Milli Parkı', kind: 'orman', zone: 'Ege', region: 'Manisa', city: 'Yunusemre', lat: 38.55, lng: 27.45, elevationM: 1300, areaHa: 6801, feeTent: 225, statusLabel: 'Milli park', wiki: 'Spil Dağı', summary: 'Manisa üstü milli park. Çadırlı gençlik kampı kaydı vardır; yazın serin, kışın kar.' },
  { id: 'karanlikdere', title: 'Karanlıkdere Kanyonu Tabiat Parkı', kind: 'orman', zone: 'Ege', region: 'Muğla', city: 'Ula', lat: 37.15, lng: 28.4, elevationM: 1079, areaHa: 1776, feeTent: 105, statusLabel: 'Tabiat parkı', wiki: 'Karanlıkdere Kanyonu', summary: 'Muğla kanyon tabiat parkı. Çadırlı kamp kaydı vardır; kanyon içi geceleme yeri değildir.' },
  { id: 'belemedik', title: 'Belemedik Tabiat Parkı', kind: 'orman', zone: 'Akdeniz', region: 'Adana', city: 'Pozantı', lat: 37.35, lng: 34.9, elevationM: 1277, areaHa: 4349, feeTent: 195, statusLabel: 'Tabiat parkı', wiki: 'Belemedik', summary: 'Pozantı vadi ormanı ve tarihi istasyon çevresi. Çadırlı kamp kaydı vardır.' },
  { id: 'obruk-selalesi', title: 'Obruk Şelalesi Tabiat Parkı', kind: 'orman', zone: 'Akdeniz', region: 'Adana', city: 'Saimbeyli', lat: 37.98, lng: 36.1, elevationM: 1646, areaHa: 257, feeTent: 105, statusLabel: 'Tabiat parkı', wiki: 'Obruk Şelalesi', summary: 'Saimbeyli şelale tabiat parkı. Çadırlı kamp kaydı vardır; zemin ıslak ve yüksek rakımlıdır.' },
  { id: 'kursunlu-selalesi', title: 'Kurşunlu Şelalesi Tabiat Parkı', kind: 'orman', zone: 'Akdeniz', region: 'Antalya', city: 'Aksu', lat: 36.997, lng: 30.817, elevationM: 80, areaHa: 597, feeTent: 285, statusLabel: 'Tabiat parkı', wiki: 'Kurşunlu Şelalesi Antalya', summary: 'Antalya şelale tabiat parkı. Çadırlı kamp kaydı vardır; günübirlik yoğun, geceleme tahsisli alanda.' },
  { id: 'salda-golu-tp', title: 'Salda Gölü Tabiat Parkı', kind: 'gol', zone: 'Akdeniz', region: 'Burdur', city: 'Yeşilova', lat: 37.55, lng: 29.675, elevationM: 1160, areaHa: 57, feeTent: 195, statusLabel: 'Tabiat parkı', wiki: 'Salda Gölü Tabiat Parkı', summary: 'Beyaz kıyılı göl. Çadır ve karavan belirlenen alanda; kıyı koruma kuralı sıkıdır.' },
  { id: 'isparta-golcuk', title: 'Isparta Gölcük Tabiat Parkı', kind: 'gol', zone: 'Akdeniz', region: 'Isparta', city: 'Merkez', lat: 37.73, lng: 30.5, elevationM: 1350, areaHa: 4983, feeTent: 165, statusLabel: 'Tabiat parkı', wiki: 'Gölcük Isparta', summary: 'Krater gölü ve sedir. Çadırlı kamp kaydı vardır; yazın serin, kışın kar.' },
  { id: 'yazili-kanyon', title: 'Yazılı Kanyon Tabiat Parkı', kind: 'orman', zone: 'Akdeniz', region: 'Isparta', city: 'Sütçüler', lat: 37.45, lng: 30.9, elevationM: 400, areaHa: 600, feeTent: 165, statusLabel: 'Tabiat parkı', wiki: 'Yazılı Kanyon', summary: 'Sütçüler kanyonu. Çadırlı kamp kaydı vardır; kanyon tabanı geceleme yeri değildir.' },
  { id: 'geben-vadisi', title: 'Geben Vadisi Milli Parkı', kind: 'orman', zone: 'Akdeniz', region: 'Kahramanmaraş', city: 'Andırın', lat: 37.8, lng: 36.45, elevationM: 2000, areaHa: 20324, feeTent: 105, statusLabel: 'Milli park', wiki: 'Geben Andırın', summary: 'Andırın–Göksun koridoru milli park. Kampçılık kaydı vardır; orman kanunu konak yeri kuralı geçerlidir.' },
  { id: 'karamanastir', title: 'Karamanastır Şelalesi Tabiat Parkı', kind: 'orman', zone: 'Akdeniz', region: 'Mersin', city: 'Erdemli', lat: 36.7, lng: 34.2, elevationM: 870, areaHa: 100, feeTent: null, statusLabel: 'Tabiat parkı', wiki: 'Karamanastır Şelalesi', summary: 'Erdemli şelale tabiat parkı. Çadırlı kamp kaydı vardır; tarife boşsa ücretsiz değildir.' },
  { id: 'yerkopru', title: 'Mut Yerköprü Şelalesi Tabiat Parkı', kind: 'orman', zone: 'Akdeniz', region: 'Mersin', city: 'Mut', lat: 36.7, lng: 33.4, elevationM: 475, areaHa: 118, feeTent: null, statusLabel: 'Tabiat parkı', wiki: 'Yerköprü Şelalesi Mut', summary: 'Mut doğal köprü ve şelale. Çadırlı kamp kaydı vardır; kayalık zemin ıslaktır.' },
  { id: 'karatepe-aslantas', title: 'Karatepe-Aslantaş Milli Parkı', kind: 'orman', zone: 'Akdeniz', region: 'Osmaniye', city: 'Kadirli', lat: 37.3, lng: 36.25, elevationM: 200, areaHa: 4143, feeTent: 195, statusLabel: 'Milli park', wiki: 'Karatepe Aslantaş', summary: 'Osmaniye açık hava müzesi ve baraj kenarı milli park. Çadırlı kamp kaydı vardır.' },
  { id: 'altiparmak-tp', title: 'Altıparmak Tabiat Parkı', kind: 'yayla', zone: 'Karadeniz', region: 'Artvin', city: 'Yusufeli', lat: 40.95, lng: 41.35, elevationM: 2230, areaHa: 2111, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Altıparmak Dağları', summary: 'Yusufeli yüksek yayla. Çadırlı kamp kaydı vardır; gece soğuk, sis sık.' },
  { id: 'karagol-sahara', title: 'Karagöl-Sahara Milli Parkı', kind: 'gol', zone: 'Karadeniz', region: 'Artvin', city: 'Şavşat', lat: 41.3, lng: 42.45, elevationM: 2500, areaHa: 3251, feeTent: 195, statusLabel: 'Milli park', wiki: 'Karagöl Şavşat', summary: 'Şavşat göl ve sahara yaylası. Kuş gözlemi ve kamp kaydı vardır; kışın kapanabilir.' },
  { id: 'yakupabdal', title: 'Yakupabdal Tabiat Parkı', kind: 'yayla', zone: 'Karadeniz', region: 'Bayburt', city: 'Merkez', lat: 40.25, lng: 40.2, elevationM: 2017, areaHa: 208, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Yakupabdal', summary: 'Bayburt yüksek tabiat parkı. Çadırlı kamp kaydı vardır; rüzgâr sert.' },
  { id: 'abant-mp', title: 'Abant Gölü Milli Parkı', kind: 'gol', zone: 'Karadeniz', region: 'Bolu', city: 'Merkez', lat: 40.609, lng: 31.279, elevationM: 1330, areaHa: 1262, feeTent: 225, statusLabel: 'Milli park', wiki: 'Abant Gölü', summary: 'Bolu göl milli parkı. Çadırlı kamp kaydı vardır; göl çevresi yürüyüş halkası kısadır.' },
  { id: 'arkutdagi', title: 'Arkutdağı Tabiat Parkı', kind: 'orman', zone: 'Karadeniz', region: 'Bolu', city: 'Gerede', lat: 40.7, lng: 32.2, elevationM: 1760, areaHa: 158, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Arkutdağı', summary: 'Gerede orman tabiat parkı. Çadırlı kamp kaydı vardır.' },
  { id: 'ayikayasi', title: 'Ayıkayası Tabiat Parkı', kind: 'orman', zone: 'Karadeniz', region: 'Bolu', city: 'Mengen', lat: 40.95, lng: 32.05, elevationM: 1479, areaHa: 446, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Ayıkayası', summary: 'Mengen orman tabiat parkı. Çadırlı kamp kaydı vardır; ayı uyarısı geçerlidir.' },
  { id: 'bolu-golcuk', title: 'Bolu Gölcük Tabiat Parkı', kind: 'gol', zone: 'Karadeniz', region: 'Bolu', city: 'Merkez', lat: 40.7, lng: 31.47, elevationM: 1210, areaHa: 376, feeTent: 225, statusLabel: 'Tabiat parkı', wiki: 'Gölcük Bolu', summary: 'Bolu krater gölü. Çadırlı kamp kaydı vardır; şehre yakın, hafta sonu dolu.' },
  { id: 'deregol', title: 'Deregöl Tabiat Parkı', kind: 'gol', zone: 'Karadeniz', region: 'Bolu', city: 'Kıbrıscık', lat: 40.45, lng: 31.9, elevationM: 1220, areaHa: 154, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Deregöl Bolu', summary: 'Kıbrıscık göl tabiat parkı. Çadırlı kamp kaydı vardır.' },
  { id: 'karaca-tp', title: 'Karaca Tabiat Parkı', kind: 'orman', zone: 'Karadeniz', region: 'Bolu', city: 'Merkez', lat: 40.75, lng: 31.55, elevationM: 960, areaHa: 230, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Karacaorman Bolu', summary: 'Bolu orman tabiat parkı. Çadırlı kamp kaydı vardır.' },
  { id: 'kargali-golcuk', title: 'Kargalı Gölcük Tabiat Parkı', kind: 'gol', zone: 'Karadeniz', region: 'Bolu', city: 'Seben', lat: 40.4, lng: 31.6, elevationM: 1533, areaHa: 157, feeTent: 105, statusLabel: 'Tabiat parkı', wiki: 'Kargalı Gölcük', summary: 'Seben gölcük tabiat parkı. Çadırlı kamp kaydı vardır; yüksek ve serin.' },
  { id: 'sunnet-golu', title: 'Sünnet Gölü Tabiat Parkı', kind: 'gol', zone: 'Karadeniz', region: 'Bolu', city: 'Göynük', lat: 40.4, lng: 30.8, elevationM: 1060, areaHa: 88, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Sünnet Gölü', summary: 'Göynük (Bolu) göl tabiat parkı. Çadırlı kamp kaydı vardır.' },
  { id: 'yedigoller-mp', title: 'Yedigöller Milli Parkı', kind: 'orman', zone: 'Karadeniz', region: 'Bolu', city: 'Merkez', lat: 40.943, lng: 31.745, elevationM: 900, areaHa: 1623, feeTent: 225, statusLabel: 'Milli park', wiki: 'Yedigöller', summary: 'Yedi göl ve kayın ormanı. Çadır, karavan ve bungalov kaydı vardır; kapı saati ve ayı uyarısı geçerlidir.' },
  { id: 'aksu-tp', title: 'Aksu Tabiat Parkı', kind: 'orman', zone: 'Karadeniz', region: 'Çorum', city: 'Merkez', lat: 40.55, lng: 34.95, elevationM: 1450, areaHa: 68, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Aksu Tabiat Parkı Çorum', summary: 'Çorum orman tabiat parkı. Çadırlı kamp kaydı vardır.' },
  { id: 'catak-corum', title: 'Çatak Tabiat Parkı', kind: 'orman', zone: 'Karadeniz', region: 'Çorum', city: 'Merkez', lat: 40.7, lng: 34.8, elevationM: 1500, areaHa: 295, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Çatak Tabiat Parkı Çorum', summary: 'Çorum çatak ormanı. Çadırlı kamp kaydı vardır.' },
  { id: 'kuzalan', title: 'Kuzalan Tabiat Parkı', kind: 'orman', zone: 'Karadeniz', region: 'Giresun', city: 'Dereli', lat: 40.7, lng: 38.4, elevationM: 1440, areaHa: 501, feeTent: 195, statusLabel: 'Tabiat parkı', wiki: 'Kuzalan Şelalesi', summary: 'Dereli şelale ve orman. Çadırlı kamp kaydı vardır; zemin ıslak.' },
  { id: 'artabel', title: 'Artabel Gölleri Tabiat Parkı', kind: 'gol', zone: 'Karadeniz', region: 'Gümüşhane', city: 'Torul', lat: 40.55, lng: 39.0, elevationM: 3000, areaHa: 5820, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Artabel Gölleri', summary: 'Torul yüksek dağ gölleri. Çadırlı kamp ve dağcılık kaydı vardır; gece çok soğuk.' },
  { id: 'limni-golu', title: 'Limni Gölü Tabiat Parkı', kind: 'gol', zone: 'Karadeniz', region: 'Gümüşhane', city: 'Torul', lat: 40.6, lng: 39.15, elevationM: 2010, areaHa: 72, feeTent: 195, statusLabel: 'Tabiat parkı', wiki: 'Limni Gölü Tabiat Parkı', summary: 'Torul dağ gölü. Çadırlı kamp kaydı vardır; sis ve serinlik yazın de sürer.' },
  { id: 'handuzu', title: 'Handüzü Tabiat Parkı', kind: 'yayla', zone: 'Karadeniz', region: 'Rize', city: 'İkizdere', lat: 40.75, lng: 40.6, elevationM: 1351, areaHa: 326, feeTent: 195, statusLabel: 'Tabiat parkı', wiki: 'Handüzü', summary: 'İkizdere yayla tabiat parkı. Çadırlı kamp kaydı vardır; yağmur sık.' },
  { id: 'tunca-vadisi', title: 'Tunca Vadisi Tabiat Parkı', kind: 'orman', zone: 'Karadeniz', region: 'Rize', city: 'Ardeşen', lat: 41.2, lng: 41.15, elevationM: 2240, areaHa: 4082, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Tunca Vadisi', summary: 'Ardeşen yüksek vadi. Çadırlı kamp kaydı vardır; nemli orman ve sis.' },
  { id: 'akgol-sinop', title: 'Akgöl Tabiat Parkı', kind: 'gol', zone: 'Karadeniz', region: 'Sinop', city: 'Türkeli', lat: 41.9, lng: 34.4, elevationM: 1204, areaHa: 40, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Akgöl Sinop', summary: 'Türkeli göl tabiat parkı. Çadırlı kamp kaydı vardır.' },
  { id: 'catak-kanyonu-sinop', title: 'Çatak Kanyonu Tabiat Parkı', kind: 'orman', zone: 'Karadeniz', region: 'Sinop', city: 'Erfelek', lat: 41.88, lng: 34.9, elevationM: 763, areaHa: 420, feeTent: null, statusLabel: 'Tabiat parkı', wiki: 'Çatak Kanyonu Sinop', summary: 'Erfelek kanyonu. Çadırlı kamp kaydı vardır; kanyon içi geceleme yeri değildir.' },
  { id: 'zinav-golu', title: 'Zinav Gölü Tabiat Parkı', kind: 'gol', zone: 'Karadeniz', region: 'Tokat', city: 'Reşadiye', lat: 40.45, lng: 37.2, elevationM: 950, areaHa: 401, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Zinav Gölü', summary: 'Reşadiye heyelan gölü. Çadırlı kamp kaydı vardır.' },
  { id: 'calcamili', title: 'Çalcamili Tabiat Parkı', kind: 'orman', zone: 'Karadeniz', region: 'Trabzon', city: 'Tonya', lat: 40.9, lng: 39.3, elevationM: 1270, areaHa: 9, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Tonya Trabzon', summary: 'Tonya küçük orman tabiat parkı. Çadırlı kamp kaydı vardır; alan dardır.' },
  { id: 'uzungol-tp', title: 'Uzungöl Tabiat Parkı', kind: 'gol', zone: 'Karadeniz', region: 'Trabzon', city: 'Çaykara', lat: 40.619, lng: 40.295, elevationM: 1200, areaHa: 1642, feeTent: 195, statusLabel: 'Tabiat parkı', wiki: 'Uzungöl', summary: 'Çaykara vadi gölü. Çadırlı kamp kaydı vardır; yerleşim yoğun, resmi kamp alanı sınırlıdır.' },
  { id: 'danaagzi', title: 'Danaağzı Tabiat Parkı', kind: 'sahil', zone: 'Karadeniz', region: 'Zonguldak', city: 'Ereğli', lat: 41.28, lng: 31.45, elevationM: 108, areaHa: 89, feeTent: 150, statusLabel: 'Tabiat parkı', wiki: 'Danaağzı', summary: 'Ereğli kıyı tabiat parkı. Çadırlı kamp kaydı vardır; Karadeniz rüzgârı sert.' },
  { id: 'harmankaya', title: 'Harmankaya Şelaleleri Tabiat Parkı', kind: 'orman', zone: 'Karadeniz', region: 'Zonguldak', city: 'Merkez', lat: 41.35, lng: 31.85, elevationM: 315, areaHa: 158, feeTent: null, statusLabel: 'Tabiat parkı', wiki: 'Harmankaya Şelalesi', summary: 'Zonguldak şelale tabiat parkı. Çadırlı kamp kaydı vardır.' },
  { id: 'kayalidere', title: 'Kayalıdere Tabiat Parkı', kind: 'orman', zone: 'Karadeniz', region: 'Zonguldak', city: 'Devrek', lat: 41.2, lng: 31.95, elevationM: 500, areaHa: 54, feeTent: 105, statusLabel: 'Tabiat parkı', wiki: 'Kayalıdere', summary: 'Devrek orman tabiat parkı. Çadırlı kamp kaydı vardır.' },
  { id: 'saricali', title: 'Sarıçalı Milli Parkı', kind: 'orman', zone: 'İç Anadolu', region: 'Ankara', city: 'Beypazarı', lat: 40.2, lng: 31.9, elevationM: 1350, areaHa: 1024, feeTent: null, statusLabel: 'Milli park', wiki: 'Sarıçalı Milli Parkı', summary: 'Beypazarı milli parkı. Kamp kaydı vardır; tarife satırı boşsa ücretsiz değildir.' },
  { id: 'soguksu', title: 'Soğuksu Milli Parkı', kind: 'orman', zone: 'İç Anadolu', region: 'Ankara', city: 'Kızılcahamam', lat: 40.47, lng: 32.65, elevationM: 1400, areaHa: 1186, feeTent: 225, statusLabel: 'Milli park', wiki: 'Soğuksu Milli Parkı', summary: 'Kızılcahamam çam milli parkı. Çadırlı kamp kaydı vardır; başkente en yakın resmî kamp ormanlarından biridir.' },
  { id: 'sorgun-goleti', title: 'Sorgun Göleti Tabiat Parkı', kind: 'gol', zone: 'İç Anadolu', region: 'Ankara', city: 'Kızılcahamam', lat: 40.55, lng: 32.55, elevationM: 1290, areaHa: 54, feeTent: 225, statusLabel: 'Tabiat parkı', wiki: 'Sorgun Göleti', summary: 'Kızılcahamam gölet tabiat parkı. Çadırlı kamp kaydı vardır.' },
  { id: 'dumanli-tp', title: 'Dumanlı Tabiat Parkı', kind: 'orman', zone: 'Doğu Anadolu', region: 'Erzincan', city: 'Merkez', lat: 39.75, lng: 39.5, elevationM: 1400, areaHa: 0, feeTent: null, statusLabel: 'Tabiat parkı', wiki: 'Dumanlı Tabiat Parkı Erzincan', summary: 'Erzincan tabiat parkı. PDF’de çadırlı kamp kaydı vardır; gitmeden idareyi arayın.' },
  { id: 'huzurlu-tp', title: 'Huzurlu Tabiat Parkı', kind: 'orman', zone: 'Güneydoğu Anadolu', region: 'Gaziantep', city: 'Şehitkamil', lat: 37.2, lng: 37.2, elevationM: 900, areaHa: 0, feeTent: null, statusLabel: 'Tabiat parkı', wiki: 'Huzurlu Tabiat Parkı', summary: 'Gaziantep tabiat parkı. PDF’de çadırlı kamp kaydı vardır; geceleme tahsisli alanda.' },
  { id: 'goynuk-comaklar', title: 'Göynük Çomaklar Çadırlı Kamp Alanı', kind: 'sahil', zone: 'Akdeniz', region: 'Antalya', city: 'Kemer', lat: 36.66, lng: 30.53, elevationM: 20, areaHa: 0, feeTent: 225, statusLabel: 'Milli park kamp alanı', wiki: 'Göynük Kanyonu', summary: 'Beydağları Sahil Milli Parkı içinde, 2026 tarifesinde adı geçen çadırlı kamp alanı. Kemer Göynük.' },
  { id: 'uludag-sarialan', title: 'Uludağ Sarıalan Kamp Alanı', kind: 'yayla', zone: 'Marmara', region: 'Bursa', city: 'Osmangazi', lat: 40.13, lng: 29.08, elevationM: 1620, areaHa: 0, feeTent: 225, statusLabel: 'Milli park kamp alanı', wiki: 'Uludağ Sarıalan', summary: 'Uludağ Milli Parkı Sarıalan. 2026 tarifesi dipnotu: ahşap baraka 4 kişilik çadır bedelinden ücretlenir.' },
]

const PINNED_FILES = {
  'yedigoller-mp': [
    'File:TR Yedigöller asv2021-10 img16.jpg',
    'File:Yedigöller Yansıma.jpg',
    'File:Waterfall in Yedigöller National Park.jpg',
  ],
  'abant-mp': [
    'File:Abant Gölü - 2024 Ocak.jpg',
    'File:Bolu Abant Gölü Tabiat Parkı.jpg',
    'File:Abant lake snowy.jpg',
  ],
  'salda-golu-tp': [
    'File:Salda Gölü Türkiye 2022.jpg',
    'File:Lake Salda (Salda Gölü).jpg',
    'File:Lake Salda Nature Park 1.jpg',
  ],
  'uzungol-tp': [
    'File:Uzungöl lake and town.jpg',
    'File:Uzungöl, Trabzon 2014.jpg',
    'File:Uzungöl 112020.jpg',
  ],
  'polonezkoy-tp': [
    'File:Polonezköy nature panorama.jpg',
    'File:Polenezköy Tabiat Parkı, İstanbul, EOS 60D.jpg',
    'File:Polonezköy tabiat parkı yürüyüş yolu 09.jpg',
  ],
  'spil-dagi-mp': [
    'File:Mount Sipylus Manisa Turkey Atalani Lake.jpg',
    'File:Spil Dağı (20220803).jpg',
    'File:Spil Dağı Zirvesi.jpg',
  ],
  'bafa-golu-tp': [
    'File:Bafa Gölü Tabiat Parkı (bilgekorkmaz).jpg',
    'File:Bafa lake1.JPG',
    'File:Bafa Lake.jpg',
  ],
  'kursunlu-selalesi': [
    'File:Kurşunlu Şelalesi Manzara Fotoğrafı.jpg',
    'File:Kurşunlu Şelalesi Tabiat Parkı.jpg',
    'File:Kurşunlu Şelalesi - Şelalesi Bölgesi - Manzara Fotoğrafı.jpg',
  ],
  'soguksu': [
    'File:Soğuksu Milli Parkı.jpg',
    'File:Mountains of Soğuksu Milli Parkı.jpg',
    'File:TR Kızılcahamam asv2021-10 img01.jpg',
  ],
  'uludag-sarialan': [
    'File:Uludağ Sarıalan view.jpg',
    'File:Uludağ Sarıalan region.jpg',
    'File:View of Uludağ from Sarıalan.JPG',
  ],
  'karagol-sahara': [
    'File:Karagöl in Şavşat 10.jpg',
    'File:Karagöl-Sahara National Park.jpg',
    'File:Karagöl Sahara Milli Parkı.jpg',
  ],
  'ayvalik-adalari': [
    'File:Ayvalık Islands Nature Park.jpg',
    'File:Ayvalık Islands.jpg',
    "File:Şeytan Sofrası'ndan Günbatımında Ayvalık Adaları Milli Parkı Görünümü.jpg",
  ],
  'goynuk-comaklar': [
    'File:Göynük Kanyonu.jpg',
    'File:2019 Göynük Canyon 1.jpg',
    'File:Göynük Kanyon Kemer Antalya Turkey.jpg',
  ],
  'limni-golu': [
    'File:Limni Gölü Tabiat Parkı - Ağustos 2014 IMG 8923 hamdigumus.jpg',
    'File:Lake Limni aerial view 02.jpg',
    'File:Limni Gölü 2014-1.jpg',
  ],
  'artabel': [
    'File:Artabel Gölleri... - panoramio.jpg',
    'File:Artabel Dağları... - panoramio.jpg',
    'File:Artabel Şelalesi... - panoramio.jpg',
  ],
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function skipTitle(title) {
  const t = title.toLowerCase()
  return (
    t.includes('map') ||
    t.includes('harita') ||
    t.includes('diagram') ||
    t.includes('logo') ||
    t.includes('tent') ||
    t.includes('camping') ||
    t.includes('kamp ') ||
    t.includes('çadır') ||
    t.includes('cadir') ||
    t.includes('satellite') ||
    t.includes('landsat')
  )
}

async function fileUrls(titles) {
  if (titles.length === 0) return []
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*' +
    '&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1400&titles=' +
    titles.map((title) => encodeURIComponent(title)).join('|')
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) return []
  const data = await res.json()
  const pages = data.query?.pages ? Object.values(data.query.pages) : []
  const images = []
  for (const page of pages) {
    if (page.missing) continue
    const info = page.imageinfo?.[0]
    if (!info) continue
    if (!String(info.mime || '').startsWith('image/') || String(info.mime).includes('svg')) continue
    const src = info.thumburl || info.url
    if (src && src.startsWith('https://')) images.push(src)
  }
  return images
}

async function commonsImages(query) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*' +
    '&generator=search&gsrnamespace=6&gsrlimit=10&gsrsearch=' +
    encodeURIComponent(query) +
    '&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1400'
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) return []
  const data = await res.json()
  const pages = data.query?.pages ? Object.values(data.query.pages) : []
  const images = []
  for (const page of pages) {
    const info = page.imageinfo?.[0]
    if (!info) continue
    if (!String(info.mime || '').startsWith('image/') || String(info.mime).includes('svg')) continue
    if (skipTitle(String(page.title || ''))) continue
    const src = info.thumburl || info.url
    if (src && src.startsWith('https://')) images.push(src)
    if (images.length >= 3) break
  }
  return images
}

const out = []
for (const [index, park] of parks.entries()) {
  process.stdout.write(`${index + 1}/${parks.length} ${park.title}\n`)
  let images = []
  try {
    const pinned = PINNED_FILES[park.id] ?? []
    if (pinned.length > 0) images = await fileUrls(pinned)
    if (images.length < 3) {
      for (const query of [park.wiki, park.title]) {
        const extra = await commonsImages(query)
        for (const url of extra) {
          if (!images.includes(url)) images.push(url)
          if (images.length >= 3) break
        }
        if (images.length >= 3) break
        await sleep(120)
      }
    }
  } catch {
    images = images.slice(0, 3)
  }
  out.push({
    id: park.id,
    title: park.title,
    kind: park.kind,
    zone: park.zone,
    region: park.region,
    city: park.city,
    lat: park.lat,
    lng: park.lng,
    elevationM: park.elevationM,
    areaHa: park.areaHa,
    feeTent: park.feeTent,
    statusLabel: park.statusLabel,
    summary: park.summary,
    images,
    videos: [],
  })
  await sleep(250)
}

const json = `${JSON.stringify(out, null, 2)}\n`
mkdirSync(join(root, 'src/data'), { recursive: true })
mkdirSync(join(root, 'public/data'), { recursive: true })
writeFileSync(join(root, 'src/data/catalog.json'), json)
writeFileSync(join(root, 'public/data/catalog.json'), json)
const withPhotos = out.filter((item) => item.images.length >= 3).length
const withAny = out.filter((item) => item.images.length > 0).length
console.log(`wrote ${out.length} parks; photos>=3 ${withPhotos}; any photo ${withAny}`)
