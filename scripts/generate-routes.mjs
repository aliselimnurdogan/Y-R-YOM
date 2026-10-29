/**
 * Original GPS tracks for a Turkish outdoor app.
 * Spines follow publicly known corridors; nothing is copied from Wikiloc.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  '1454496522488-7a8e488e8606',
  '1541432901042-2d8bd64b4a9b',
  '1524231757912-21f4fe3a7200',
  '1476041800959-2f6bb412c8ce',
  '1445308394109-4ec2920981b1',
  '1475924156734-496f6cac6ec1',
  '1426604966848-d7adac402bff',
  '1470770841072-f978cf4d019e',
  '1500534314209-a25ddb2bd429',
  '1418065460487-3e41a6c84dc5',
  '1472396961693-142e6e269027',
  '1507525428034-b723cf961d3e',
  '1544551763-46a013bb70d5',
  '1476514525535-07fb3b4ae5f1',
  '1519681393784-d120267933ba',
];

const img = (id) => {
  if (!PHOTO_IDS.includes(id)) throw new Error(`Unknown photo id ${id}`);
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;
};

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

function bulgeShore(spine, center, push) {
  const out = [[spine[0][0], spine[0][1], spine[0][2]]];
  for (let i = 0; i < spine.length - 1; i++) {
    const a = spine[i];
    const b = spine[i + 1];
    const segKm = haversineKm(a[0], a[1], b[0], b[1]);
    if (segKm < 0.18) {
      out.push([b[0], b[1], b[2]]);
      continue;
    }
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    let vx = mid[0] - center[0];
    let vy = mid[1] - center[1];
    const len = Math.hypot(vx, vy) || 1;
    mid[0] += (vx / len) * push;
    mid[1] += (vy / len) * push;
    out.push(mid, [b[0], b[1], b[2]]);
  }
  return out;
}

function sampleSpine(spine, t) {
  const cum = [0];
  for (let i = 1; i < spine.length; i++) {
    cum.push(cum[i - 1] + haversineKm(spine[i - 1][0], spine[i - 1][1], spine[i][0], spine[i][1]));
  }
  const total = cum[cum.length - 1];
  const dist = Math.min(total, Math.max(0, t * total));
  let seg = 1;
  while (seg < spine.length - 1 && cum[seg] < dist) seg += 1;
  const segLen = cum[seg] - cum[seg - 1];
  const u = segLen === 0 ? 0 : (dist - cum[seg - 1]) / segLen;
  const uC = Math.min(1, Math.max(0, u));
  const a = spine[seg - 1];
  const b = spine[seg];
  const ease = (1 - Math.cos(Math.PI * uC)) / 2;
  return {
    lat: a[0] + (b[0] - a[0]) * uC,
    lng: a[1] + (b[1] - a[1]) * uC,
    ele: a[2] + (b[2] - a[2]) * ease,
  };
}

function buildTrack(spineIn, { loop, seed, shore }) {
  const rng = mulberry32(seed);
  let spine = spineIn.map((p) => [p[0], p[1], p[2]]);
  if (shore) spine = bulgeShore(spine, shore.center, shore.push);
  if (loop) spine = [...spine, [spine[0][0], spine[0][1], spine[0][2]]];

  const n = 62 + Math.floor(rng() * 19); // 62–80
  const wobbleAmp = 0.00008 + rng() * 0.00007;
  const waves = 2 + rng() * 2;
  const phase = rng() * Math.PI * 2;
  const minSpineEle = Math.min(...spine.map((p) => p[2]));
  const eleAmp = minSpineEle < 2 ? 4 + rng() * 2 : 4 + rng() * 8;

  const raw = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const p = sampleSpine(spine, t);
    const noise =
      eleAmp * (0.75 * Math.sin(2 * Math.PI * t) + 0.25 * Math.sin(4 * Math.PI * t + phase * 0.2));
    let ele = p.ele + noise;
    if (ele < 0) ele = 0;
    raw.push([p.lat, p.lng, ele]);
  }

  let maxOffset = 0;
  for (let i = 1; i < n - 1; i++) {
    const t = i / (n - 1);
    const prev = raw[i - 1];
    const next = raw[i + 1];
    const dLat = next[0] - prev[0];
    const dLng = next[1] - prev[1];
    const norm = Math.hypot(dLat, dLng) || 1;
    const px = -dLng / norm;
    const py = dLat / norm;
    const envelope = Math.sin(Math.PI * t);
    const wob = wobbleAmp * envelope * Math.sin(phase + t * Math.PI * waves);
    raw[i][0] += px * wob;
    raw[i][1] += py * wob;
    maxOffset = Math.max(maxOffset, Math.abs(wob));
  }

  for (let i = 1; i < raw.length - 1; i++) {
    if (raw[i][2] < 0) raw[i][2] = 0;
    const floor = Math.min(raw[i - 1][2], raw[i + 1][2]) - 12;
    if (raw[i][2] < floor) raw[i][2] = Math.max(0, floor);
  }

  const track = raw.map(([lat, lng, ele]) => [
    Math.round(lat * 1e6) / 1e6,
    Math.round(lng * 1e6) / 1e6,
    Math.round(ele * 10) / 10,
  ]);

  if (loop) {
    track[track.length - 1] = [track[0][0], track[0][1], track[0][2]];
  }

  return { track, maxOffset, wobbleAmp };
}

function trackStats(track) {
  let dist = 0;
  let gain = 0;
  let loss = 0;
  let maxE = -Infinity;
  let minE = Infinity;
  for (let i = 0; i < track.length; i++) {
    const ele = track[i][2];
    if (ele > maxE) maxE = ele;
    if (ele < minE) minE = ele;
    if (i === 0) continue;
    dist += haversineKm(track[i - 1][0], track[i - 1][1], track[i][0], track[i][1]);
    const delta = ele - track[i - 1][2];
    if (delta > 0) gain += delta;
    else loss -= delta;
  }
  return { dist, gain, loss, maxE, minE };
}

function difficultyOf(gain, distanceKm) {
  if (gain < 300 && distanceKm < 10) return 'Kolay';
  if (gain < 800) return 'Orta';
  if (gain < 1500) return 'Zor';
  return 'Çok zor';
}

function durationMin(activity, distanceKm, gain) {
  let min;
  if (activity === 'hiking' || activity === 'camping') min = distanceKm * 14 + gain / 10;
  else if (activity === 'running') min = distanceKm * 6;
  else if (activity === 'mtb' || activity === 'cycling') min = distanceKm * 5 + gain / 20;
  else if (activity === 'kayak') min = distanceKm * 8;
  else throw new Error(`Unknown activity ${activity}`);
  return Math.max(1, Math.round(min));
}

function notableIndex(track) {
  const lo = Math.floor(track.length * 0.32);
  const hi = Math.floor(track.length * 0.68);
  let best = Math.floor(track.length / 2);
  let bestEle = -Infinity;
  for (let i = lo; i <= hi; i++) {
    if (track[i][2] > bestEle) {
      bestEle = track[i][2];
      best = i;
    }
  }
  return best;
}

const ROUTES = [
  {
    id: 'likya-oludeniz-faralya',
    title: 'Likya Yolu: Ölüdeniz–Faralya',
    activity: 'hiking',
    region: 'Muğla',
    city: 'Fethiye',
    loop: false,
    rating: 4.8,
    ratingCount: 642,
    author: 'Elif Demirtaş',
    recordedAt: '2024-05-12',
    description:
      "Ölüdeniz'in çam kokulu sırtlarından Faralya'ya inen patika, yer yer denize bakan kireçtaşı yamaçlardan geçer. İlkbahar ve sonbahar rüzgârlı ama serin, yazın gölge azdır. Kelebek Vadisi'nin karşısında kaynak suyu seyrektir; matarayı dolu tutmak gerekir. Akşam ışığında lagün ile açık deniz aynı bakışta görünür.",
    image: img('1464822759023-fed622ff2c3b'),
    waypoints: ['Ölüdeniz çıkışı', 'Kelebek Vadisi sırtı', 'Faralya'],
    spine: [
      [36.5496, 29.1172, 6],
      [36.5415, 29.1248, 80],
      [36.5328, 29.1288, 210],
      [36.5235, 29.1305, 340],
      [36.514, 29.1292, 290],
      [36.5045, 29.1338, 190],
      [36.4948, 29.1362, 110],
      [36.4902, 29.1384, 70],
    ],
  },
  {
    id: 'kapadokya-vadiler-dongusu',
    title: 'Kapadokya Vadileri Turu',
    activity: 'hiking',
    region: 'Nevşehir',
    city: 'Göreme',
    loop: true,
    rating: 4.9,
    ratingCount: 811,
    author: 'Kerem Aydın',
    recordedAt: '2024-10-03',
    description:
      'Göreme çevresindeki peribacalı vadilerde, yumuşak tüf zeminde dolaşan kapalı bir halkadır. Sabah ve akşam ışığı vadi içini sıcak tonlara boyar; yaz öğleni ise ağırdır. İlkbaharda dere yataklarında ince bir su izi kalır, yazın kurur. Sırtlar boyunca Uçhisar ve Göreme silueti sık sık açılır.',
    image: img('1541432901042-2d8bd64b4a9b'),
    waypoints: ['Göreme çıkışı', 'Güvercinlik sırtı', 'Göreme dönüşü'],
    spine: [
      [38.6436, 34.8292, 1100],
      [38.6494, 34.8368, 1125],
      [38.6522, 34.8275, 1110],
      [38.6468, 34.8172, 1140],
      [38.6368, 34.8088, 1165],
      [38.6298, 34.8072, 1185],
      [38.6342, 34.8195, 1135],
      [38.6418, 34.8288, 1105],
    ],
  },
  {
    id: 'uludag-zirve-yuruyusu',
    title: 'Uludağ Zirve Yürüyüşü',
    activity: 'hiking',
    region: 'Bursa',
    city: 'Osmangazi',
    loop: false,
    rating: 4.7,
    ratingCount: 390,
    author: 'Zeynep Koçak',
    recordedAt: '2025-07-19',
    description:
      'Oteller bölgesinden zirveye çıkan sırt, bodur ardıçtan alp çayırına geçer. Kar lekeleri hazirana kadar kalabilir; en rahat pencere temmuz ile eylül arasıdır. Yazın su seyrektir, kışın rüzgâr sertleşir. Zirveye yaklaşırken Bursa Ovası ve uzaklarda Marmara çizgisi görünür.',
    image: img('1482192505345-5655af888cc4'),
    waypoints: ['Oteller bölgesi', 'Alpin sırt', 'Uludağ zirvesi'],
    spine: [
      [40.1042, 29.1315, 1870],
      [40.096, 29.152, 2050],
      [40.0865, 29.178, 2240],
      [40.0768, 29.205, 2410],
      [40.0712, 29.2195, 2540],
    ],
  },
  {
    id: 'kackar-yayla-yuruyusu',
    title: 'Kaçkar Yayla Yürüyüşü',
    activity: 'hiking',
    region: 'Rize',
    city: 'Çamlıhemşin',
    loop: false,
    rating: 4.9,
    ratingCount: 214,
    author: 'Mert Uysal',
    recordedAt: '2024-08-11',
    description:
      "Ayder tarafındaki yaylalardan Kaçkar'ın yüksek otlaklarına tırmanan vadi, ladin ormanından alpin çayıra açılır. Kar geçitleri genelde temmuz ortasından eylül başına kadar yürünebilir. Dere boyunda su boldur, yağmur birden iner. Yüksek sırtlarda buzul gölleri ve Karadeniz'in derin vadileri görünür.",
    image: img('1454496522488-7a8e488e8606'),
    waypoints: ['Yayla başlangıcı', 'Alpin geçiş', 'Yüksek otlak'],
    spine: [
      [40.9525, 41.1035, 1250],
      [40.934, 41.118, 1480],
      [40.91, 41.132, 1780],
      [40.882, 41.145, 2100],
      [40.852, 41.156, 2450],
      [40.836, 41.1585, 2750],
    ],
  },
  {
    id: 'belgrad-ormani-kosu',
    title: 'Belgrad Ormanı Koşu Turu',
    activity: 'running',
    region: 'İstanbul',
    city: 'Sarıyer',
    loop: true,
    rating: 4.4,
    ratingCount: 728,
    author: 'Ayşe Karahan',
    recordedAt: '2025-04-06',
    description:
      "Belgrad Ormanı'nın gölgeli patikalarında, göletler ve eski bentler arasında koşulan bir halkadır. İlkbaharda çamur, sonbaharda yaprak, yazın ağaç altı serin olur. Gölet kenarları sulaktır; içme suyu için çeşmeler kullanılır. Hafta içi sabah kalabalık azalır, kuş sesi öne çıkar.",
    image: img('1441974231531-c6227db76b6e'),
    waypoints: ['Neşet Suyu', 'Gölet çevresi', 'Orman dönüşü'],
    spine: [
      [41.1875, 28.9555, 120],
      [41.183, 28.968, 135],
      [41.1765, 28.9795, 150],
      [41.1695, 28.972, 140],
      [41.1705, 28.9585, 125],
      [41.179, 28.9505, 115],
      [41.187, 28.9548, 120],
    ],
  },
  {
    id: 'buyukada-bisiklet-turu',
    title: 'Büyükada Bisiklet Turu',
    activity: 'cycling',
    region: 'İstanbul',
    city: 'Adalar',
    loop: true,
    rating: 4.6,
    ratingCount: 856,
    author: 'Emre Yıldız',
    recordedAt: '2023-06-17',
    description:
      'Adanın motorsuz yollarında, çam ve bahçe duvarları arasından geçen bir bisiklet halkasıdır. Yaz öğleden sonra feribot kalabalığı ve rüzgâr artar; mayıs ile eylül daha rahattır. Çeşme suyu iskele ve tepe yerleşimlerinde bulunur. Yüksek noktalardan Marmara adaları ve İstanbul silueti seçilir.',
    image: img('1524231757912-21f4fe3a7200'),
    waypoints: ['İskele', 'Kuzey sırtı', 'İskele dönüşü'],
    spine: [
      [40.8725, 29.1275, 15],
      [40.8788, 29.1185, 40],
      [40.8855, 29.1075, 55],
      [40.874, 29.0925, 30],
      [40.8605, 29.098, 20],
      [40.855, 29.1165, 10],
      [40.8635, 29.1285, 15],
      [40.8722, 29.128, 15],
    ],
  },
  {
    id: 'yedigoller-gol-turu',
    title: 'Yedigöller Göl Turu',
    activity: 'hiking',
    region: 'Bolu',
    city: 'Merkez',
    loop: true,
    rating: 4.8,
    ratingCount: 503,
    author: 'Selin Aksoy',
    recordedAt: '2024-10-20',
    description:
      'Yedi gölün çevresinde, kayın ve göknar altından dolaşan kısa bir halkadır. Ekimde yaprak döner, mayısta su seviyesi yüksektir. Kıyılar durgundur; içmek için çeşme suyu tercih edilir. Sisli sabahlarda göl yüzeyi ayna gibi durur.',
    image: img('1475924156734-496f6cac6ec1'),
    waypoints: ['Büyükgöl', 'Nazlıgöl sırtı', 'Büyükgöl dönüşü'],
    shore: { center: [40.9465, 31.746], push: 0.00055 },
    spine: [
      [40.9455, 31.7465, 800],
      [40.9488, 31.7535, 820],
      [40.952, 31.748, 840],
      [40.9495, 31.7405, 830],
      [40.944, 31.7388, 810],
      [40.9418, 31.7455, 800],
      [40.9452, 31.7468, 800],
    ],
  },
  {
    id: 'abant-golu-mtb',
    title: 'Abant Gölü MTB Turu',
    activity: 'mtb',
    region: 'Bolu',
    city: 'Merkez',
    loop: true,
    rating: 4.5,
    ratingCount: 276,
    author: 'Burak Çetin',
    recordedAt: '2023-09-09',
    description:
      "Abant Gölü'nü dışarıdan çeviren stabilize yolda, orman gölgesinde sürülen bir dağ bisikleti halkasıdır. İlkbaharda zemin ıslak, yazın gölge boldur. Sazlıkta su kuşları gezer; içme suyu tesis çevresindedir. Açık havada gölün tamamı ve göknar yamaçlar görünür.",
    image: img('1439066615861-d1af74d74000'),
    waypoints: ['Abant girişi', 'Kuzey kıyı', 'Abant dönüşü'],
    shore: { center: [40.6064, 31.2872], push: 0.00115 },
    spine: [
      [40.6115, 31.2785, 1340],
      [40.6155, 31.2905, 1350],
      [40.6088, 31.3015, 1355],
      [40.5995, 31.296, 1348],
      [40.5978, 31.282, 1342],
      [40.6055, 31.2745, 1345],
      [40.6112, 31.278, 1340],
    ],
  },
  {
    id: 'cirali-olimpos',
    title: 'Çıralı–Olimpos Yürüyüşü',
    activity: 'hiking',
    region: 'Antalya',
    city: 'Kemer',
    loop: false,
    rating: 4.6,
    ratingCount: 467,
    author: 'Deniz Arslan',
    recordedAt: '2025-05-24',
    description:
      "Çıralı sahilinden Olimpos'un antik dokusuna inen, deniz kokulu düz bir yürüyüştür. Nisan ile ekim arası deniz serinler, yazın kum yakıcı olur. Yanartaş tarafında akşam alevleri seçilir; dere ağzında tatlı su denize karışır. Bir yanda kıyı, diğer yanda Likya çamlığı durur.",
    image: img('1544551763-46a013bb70d5'),
    waypoints: ['Çıralı sahil', 'Yanartaş yolu', 'Olimpos'],
    spine: [
      [36.4148, 30.4785, 8],
      [36.4075, 30.472, 20],
      [36.401, 30.4688, 35],
      [36.3962, 30.4735, 15],
      [36.3935, 30.4795, 8],
    ],
  },
  {
    id: 'saklikent-kanyon-girisi',
    title: 'Saklıkent Kanyon Girişi',
    activity: 'hiking',
    region: 'Muğla',
    city: 'Fethiye',
    loop: false,
    rating: 4.3,
    ratingCount: 355,
    author: 'Hakan Yılmaz',
    recordedAt: '2024-07-02',
    description:
      "Saklıkent otoparkından kanyon ağzına inen kısa bir yaklaşımdır. Yaz öğleni vadiyi ısıtır, kanyonun içi ise yıl boyu soğuktur. Tabanındaki akarsu diz hizasına çıkar ve buz gibidir. Dar duvarlar gökyüzünü ince bir şeride indirir.",
    image: img('1418065460487-3e41a6c84dc5'),
    waypoints: ['Saklıkent otopark', 'Kanyon ağzı', 'Dere içi'],
    spine: [
      [36.4925, 29.3955, 180],
      [36.486, 29.3975, 220],
      [36.4805, 29.399, 280],
      [36.4768, 29.4005, 320],
    ],
  },
  {
    id: 'koprulu-kanyon-kayak',
    title: 'Köprülü Kanyon Kano İnişi',
    activity: 'kayak',
    region: 'Antalya',
    city: 'Manavgat',
    loop: false,
    rating: 4.7,
    ratingCount: 591,
    author: 'Melis Erdem',
    recordedAt: '2023-05-28',
    description:
      "Köprüçay'ın turkuaz suyunda, kanyon duvarları arasında akış aşağı inen bir kano rotasıdır. İlkbahar sonu ve sonbahar başı daha sakindir; yazın rafting saatleri kalabalıklaşır. Su soğuktur. Kireçtaşı duvarlar yer yer çok yükselir, çamlar ise tepede kalır.",
    image: img('1476514525535-07fb3b4ae5f1'),
    waypoints: ['Kanyon girişi', 'Akarsu ortası', 'Çıkış iskelesi'],
    spine: [
      [37.1905, 31.1745, 120],
      [37.183, 31.181, 110],
      [37.176, 31.1885, 100],
      [37.1695, 31.196, 90],
      [37.163, 31.2035, 85],
    ],
  },
  {
    id: 'uzungol-cevre-yuruyusu',
    title: 'Uzungöl Çevre Yürüyüşü',
    activity: 'hiking',
    region: 'Trabzon',
    city: 'Çaykara',
    loop: true,
    rating: 4.5,
    ratingCount: 688,
    author: 'Oğuz Tanrıverdi',
    recordedAt: '2024-06-15',
    description:
      "Uzungöl'ün çevresinde, çayır ile ladin sınırı boyunca dolaşan kapalı bir yürüyüştür. Mayıs ve haziran yeşil ve sisli, ekim daha açıktır. Göl kıyısı durgun, Haldizen deresinin suyu soğuktur. Sis dağılınca karşı sırtta yayla evleri belirir.",
    image: img('1501785888041-af3ef285b470'),
    waypoints: ['Göl kıyısı', 'Doğu sırtı', 'Göl dönüşü'],
    shore: { center: [40.6178, 40.2967], push: 0.0008 },
    spine: [
      [40.6195, 40.2915, 1100],
      [40.6235, 40.2985, 1120],
      [40.618, 40.3065, 1160],
      [40.612, 40.3005, 1130],
      [40.6145, 40.292, 1105],
      [40.6192, 40.2912, 1100],
    ],
  },
  {
    id: 'sumela-altindere',
    title: 'Sümela Altındere Vadisi',
    activity: 'hiking',
    region: 'Trabzon',
    city: 'Maçka',
    loop: false,
    rating: 4.6,
    ratingCount: 734,
    author: 'Ceren Şahin',
    recordedAt: '2025-09-07',
    description:
      "Altındere Vadisi'nde dere sesini takip ederek manastırın altındaki seyir noktasına çıkan bir yaklaşımdır. İlkbaharda şelale güçlüdür, kışın patika yer yer buz tutabilir. Vadi nemli ve serindir, su boldur. Kayalık yüzde manastır, aşağıda ladin örtüsü görünür.",
    image: img('1470071459604-3b5ec3a7fe05'),
    waypoints: ['Altındere giriş', 'Vadi içi', 'Manastır altı'],
    spine: [
      [40.7055, 39.646, 900],
      [40.699, 39.6525, 980],
      [40.6935, 39.6575, 1080],
      [40.6895, 39.6595, 1150],
    ],
  },
  {
    id: 'efes-antik-kent',
    title: 'Efes Antik Kent Yürüyüşü',
    activity: 'hiking',
    region: 'İzmir',
    city: 'Selçuk',
    loop: false,
    rating: 4.4,
    ratingCount: 802,
    author: 'Yusuf Kılıç',
    recordedAt: '2023-04-22',
    description:
      "Efes'in mermer caddelerinde liman düzlüğüne doğru inen, gölgeli bir antik kent yürüyüşüdür. Yazın taş güneşi yansıtır; sabah erken ya da ilkbahar daha iyidir. Çeşmeler giriş ve tiyatro çevresindedir. Liman kapısına yaklaşınca ova ve Selçuk tarafı açılır.",
    image: img('1445308394109-4ec2920981b1'),
    waypoints: ['Efes girişi', 'Celsus çevresi', 'Liman yolu'],
    spine: [
      [37.9425, 27.3415, 40],
      [37.9398, 27.3428, 45],
      [37.9372, 27.341, 42],
      [37.9355, 27.3442, 38],
      [37.9318, 27.3425, 30],
    ],
  },
  {
    id: 'pamukkale-traverten',
    title: 'Pamukkale Traverten Yürüyüşü',
    activity: 'hiking',
    region: 'Denizli',
    city: 'Merkez',
    loop: false,
    rating: 4.5,
    ratingCount: 890,
    author: 'Aslı Güneş',
    recordedAt: '2024-09-14',
    description:
      'Beyaz traverten terasları üzerinde antik havuza doğru çıkan kısa bir yürüyüştür. Öğlen ışığı göz alır, akşam teraslar pembeleşir; kışın su daha sakindir. Termal su ılıktır, zemin ıslak ve kaygandır. Aşağıda Denizli ovası, yukarıda sütunlu yapıların silueti durur.',
    image: img('1500534314209-a25ddb2bd429'),
    waypoints: ['Traverten girişi', 'Beyaz teraslar', 'Antik havuz'],
    spine: [
      [37.9245, 29.1195, 280],
      [37.923, 29.1235, 320],
      [37.9205, 29.1268, 360],
      [37.9178, 29.124, 340],
    ],
  },
  {
    id: 'nemrut-yaklasim',
    title: 'Nemrut Dağı Yaklaşımı',
    activity: 'hiking',
    region: 'Adıyaman',
    city: 'Kahta',
    loop: false,
    rating: 4.8,
    ratingCount: 318,
    author: 'Baran Doğan',
    recordedAt: '2025-06-21',
    description:
      "Kahta sırtlarından Nemrut'un tümülüs düzlüğüne yaklaşan, rüzgâra açık bir dağ yoludur. Gün doğumu ve batımı için ilkbahar sonu ile eylül tercih edilir; kışın yol kapanabilir. Su seyrektir, tepe çıplaktır. Düzlükte taş başlar ve uzakta Fırat havzası görünür.",
    image: img('1519681393784-d120267933ba'),
    waypoints: ['Kahta yolu', 'Taş teras', 'Tümülüs düzlüğü'],
    spine: [
      [37.9625, 38.718, 1600],
      [37.9705, 38.7285, 1750],
      [37.9765, 38.736, 1900],
      [37.981, 38.7415, 2100],
      [37.9818, 38.7405, 2150],
    ],
  },
  {
    id: 'erciyes-etek-yuruyusu',
    title: 'Erciyes Etek Yürüyüşü',
    activity: 'hiking',
    region: 'Kayseri',
    city: 'Merkez',
    loop: false,
    rating: 4.6,
    ratingCount: 241,
    author: 'İrem Polat',
    recordedAt: '2024-08-03',
    description:
      "Erciyes'in volkanik eteklerinde, çayır ve cüruf sırtına çıkan bir yaklaşım yürüyüşüdür. Kar mayısa kadar inatçı olabilir; en açık dönem temmuz ile eylül arasıdır. Öğleden sonra rüzgâr sertleşir, su üst istasyon çevresinde bulunur. Kayseri ovası ve karşıda Aladağlar silueti seçilir.",
    image: img('1470770841072-f978cf4d019e'),
    waypoints: ['Tekir yaylası', 'Cüruf sırtı', 'Yüksek etek'],
    spine: [
      [38.5455, 35.5055, 2200],
      [38.5385, 35.488, 2450],
      [38.5325, 35.47, 2750],
      [38.5288, 35.4555, 3050],
      [38.531, 35.4465, 3300],
    ],
  },
  {
    id: 'spil-dagi-mtb',
    title: 'Spil Dağı MTB Turu',
    activity: 'mtb',
    region: 'Manisa',
    city: 'Yunusemre',
    loop: true,
    rating: 4.3,
    ratingCount: 129,
    author: 'Caner Acar',
    recordedAt: '2023-10-08',
    description:
      "Spil Dağı'nın çam kuşaklarında milli park yollarını kullanan bir dağ bisikleti halkasıdır. İlkbaharda çiçek, yazın toz, sonbaharda serin orman olur. Çeşme ve piknik alanlarında su vardır. Açık sırtlardan Manisa ovası görünür.",
    image: img('1511497584788-876760111969'),
    waypoints: ['Milli park girişi', 'Ağlayankaya sırtı', 'Orman dönüşü'],
    spine: [
      [38.5655, 27.412, 900],
      [38.572, 27.398, 1050],
      [38.5665, 27.382, 1200],
      [38.555, 27.3885, 1100],
      [38.5525, 27.405, 980],
      [38.56, 27.4145, 900],
      [38.5652, 27.4125, 900],
    ],
  },
  {
    id: 'ballikayalar-kanyon',
    title: 'Ballıkayalar Kanyon Yürüyüşü',
    activity: 'hiking',
    region: 'Kocaeli',
    city: 'Gebze',
    loop: false,
    rating: 4.2,
    ratingCount: 188,
    author: 'Pınar Keskin',
    recordedAt: '2025-03-16',
    description:
      'Gebze içindeki kireçtaşı kanyonda dere yatağını izleyen kısa ve gölgeli bir yürüyüştür. Yağmurdan sonra kayalar kaygan, yazın vadi serin kalır. Dere yılın büyük bölümünde akar; içmek için üst çeşme daha uygundur. Dar geçitte gökyüzü kapanır, çıkışta körfezden hafif bir esinti gelir.',
    image: img('1426604966848-d7adac402bff'),
    waypoints: ['Kanyon girişi', 'Dere yatağı', 'Üst seyir'],
    spine: [
      [40.8488, 29.5225, 80],
      [40.8465, 29.5188, 110],
      [40.844, 29.5155, 140],
      [40.8418, 29.5135, 160],
      [40.8395, 29.516, 150],
    ],
  },
  {
    id: 'polonezkoy-kosu',
    title: 'Polonezköy Koşu Halkası',
    activity: 'running',
    region: 'İstanbul',
    city: 'Beykoz',
    loop: true,
    rating: 4.1,
    ratingCount: 156,
    author: 'Tolga Ekinci',
    recordedAt: '2024-11-02',
    description:
      "Polonezköy'ün köy yolları ve orman patikalarında koşulan kısa bir halkadır. İlkbahar çamurlu, yaz akşamları serin, kışın yaprak altı yumuşaktır. Köy çeşmeleri su için yeterlidir. Tepeden Karadeniz yönüne orman uzanır.",
    image: img('1472214103451-9374bd1c798e'),
    waypoints: ['Köy meydanı', 'Orman yolu', 'Köy dönüşü'],
    spine: [
      [41.1228, 29.1935, 180],
      [41.1185, 29.2015, 200],
      [41.1135, 29.198, 210],
      [41.1148, 29.1885, 190],
      [41.1205, 29.186, 175],
      [41.123, 29.1928, 180],
    ],
  },
  {
    id: 'kazdaglari-yuruyusu',
    title: 'Kazdağları Yürüyüşü',
    activity: 'hiking',
    region: 'Balıkesir',
    city: 'Edremit',
    loop: false,
    rating: 4.7,
    ratingCount: 203,
    author: 'Ece Nur Bayram',
    recordedAt: '2025-06-08',
    description:
      "Edremit zeytinliklerinden Kazdağları'nın çam ve köknar kuşağına tırmanan bir sırt yürüyüşüdür. Mayıs ve haziran serin ve sisli, ağustos daha kuraktır. Dere geçişlerinde su vardır, sırtta azalır. Açık havada Edremit Körfezi görünür.",
    image: img('1500530855697-b586d89ba3ee'),
    waypoints: ['Zeytinlik etek', 'Çam kuşağı', 'Yüksek sırt'],
    spine: [
      [39.6785, 26.912, 450],
      [39.688, 26.902, 700],
      [39.6985, 26.894, 1000],
      [39.708, 26.8885, 1300],
      [39.7145, 26.883, 1550],
    ],
  },
  {
    id: 'aladaglar-demirkazik-yaklasim',
    title: 'Aladağlar Demirkazık Yaklaşımı',
    activity: 'hiking',
    region: 'Niğde',
    city: 'Çamardı',
    loop: false,
    rating: 4.8,
    ratingCount: 97,
    author: 'Serkan Özdemir',
    recordedAt: '2024-07-27',
    description:
      "Demirkazık köyünden yüksek çayır ve moren basamağına çıkan dik bir yaklaşım patikasıdır. Yürüyüş penceresi haziran sonundan eylül ortasına kadardır; öğleden sonra gök gürleyebilir. Su köyde alınır, yukarıda dere soğuktur. Karşıda Aladağlar'ın sivri duvarları yükselir.",
    image: img('1501555088652-021faa106b9b'),
    waypoints: ['Köy çıkışı', 'Yayla düzlüğü', 'Moren basamağı'],
    spine: [
      [37.8605, 35.128, 1500],
      [37.852, 35.1365, 1750],
      [37.8445, 35.145, 2050],
      [37.8385, 35.151, 2350],
      [37.8355, 35.1545, 2600],
    ],
  },
  {
    id: 'sapanca-gol-kosu',
    title: 'Sapanca Gölü Kıyı Koşusu',
    activity: 'running',
    region: 'Sakarya',
    city: 'Sapanca',
    loop: false,
    rating: 4.2,
    ratingCount: 264,
    author: 'Gamze Aslan',
    recordedAt: '2023-08-19',
    description:
      "Sapanca Gölü'nün kuzey kıyısında, söğütler boyunca koşulan düz bir parkurdur. Yaz akşamı göl serinletir, kışın kuzey rüzgârı sert olabilir. Kıyıda çeşme seyrektir. Açık havada gölün doğu ucu ve arkadaki dağ çizgisi görünür.",
    image: img('1469474968028-56623f02e42e'),
    waypoints: ['Batı kıyı', 'Sahil ortası', 'Doğu kıyı'],
    spine: [
      [40.6925, 30.252, 40],
      [40.6948, 30.2685, 42],
      [40.6965, 30.286, 41],
      [40.6978, 30.3055, 40],
      [40.699, 30.324, 39],
    ],
  },
  {
    id: 'van-kalesi-yuruyusu',
    title: 'Van Kalesi Yürüyüşü',
    activity: 'hiking',
    region: 'Van',
    city: 'İpekyolu',
    loop: false,
    rating: 4.4,
    ratingCount: 412,
    author: 'Onur Karaca',
    recordedAt: '2025-09-28',
    description:
      "Van Kalesi'nin surları boyunca göl tarafındaki kayalığa çıkan kısa bir yürüyüştür. Ilık aylarda rüzgâr süreklidir, kışın tepe ayazlı ve çıplaktır. Su girişteki çeşmededir. Surların üstünden Van Gölü'nün mavisi ve uzakta Süphan silueti açılır.",
    image: img('1476041800959-2f6bb412c8ce'),
    waypoints: ['Kale altı', 'Sur yolu', 'Kale tepesi'],
    spine: [
      [38.5028, 43.3375, 1660],
      [38.5015, 43.341, 1685],
      [38.5002, 43.3455, 1710],
      [38.4988, 43.349, 1735],
    ],
  },
  {
    id: 'ilgaz-yuruyusu',
    title: 'Ilgaz Dağı Yürüyüşü',
    activity: 'hiking',
    region: 'Kastamonu',
    city: 'Ilgaz',
    loop: false,
    rating: 4.3,
    ratingCount: 141,
    author: 'Derya Mutlu',
    recordedAt: '2024-07-06',
    description:
      "Ilgaz'ın kayak merkezi üstünden göknar sınırına çıkan, karın geç kalktığı bir sırt yürüyüşüdür. Temmuz ve eylül en rahat aralıktır; mayısta zemin ıslak olabilir. Tesis çeşmeleri ve dere suyu vardır. Sırttan Kastamonu yönündeki orman görünür.",
    image: img('1551632811-561732d1e306'),
    waypoints: ['Kayak merkezi', 'Sırt yolu', 'Yüksek orman'],
    spine: [
      [41.062, 33.742, 1700],
      [41.0665, 33.7485, 1850],
      [41.071, 33.754, 2000],
      [41.0745, 33.7605, 2150],
    ],
  },
  {
    id: 'oludeniz-kiyi-kayak',
    title: 'Ölüdeniz Kıyı Kanosu',
    activity: 'kayak',
    region: 'Muğla',
    city: 'Fethiye',
    loop: false,
    rating: 4.7,
    ratingCount: 305,
    author: 'Kaan Bektaş',
    recordedAt: '2025-06-01',
    description:
      "Ölüdeniz lagününün kıyısını izleyerek Belcekız plajına ilerleyen kısa bir deniz kayağı rotasıdır. Sabah rüzgârı hafif, öğleden sonra meltem şişer. Lagünün içi sığ ve turkuazdır; açık tarafta dalga büyür. Babadağ'ın dik yamacı bütün rota boyunca denizin üstünde durur.",
    image: img('1507525428034-b723cf961d3e'),
    waypoints: ['Lagün ağzı', 'Belcekız kıyı', 'Doğu plaj'],
    spine: [
      [36.5518, 29.1125, 0],
      [36.5545, 29.1185, 0],
      [36.5572, 29.126, 0],
      [36.555, 29.1345, 0],
      [36.551, 29.1405, 0],
    ],
  },
  {
    id: 'yedigoller-kamp-yuruyusu',
    title: 'Yedigöller Kamp Yürüyüşü',
    activity: 'camping',
    region: 'Bolu',
    city: 'Merkez',
    loop: false,
    rating: 4.6,
    ratingCount: 86,
    author: 'Sibel Turan',
    recordedAt: '2024-10-13',
    description:
      'Kamp düzlüğünden gölet kenarına inen, çadır kuranların akşamüstü çıktığı kısa bir orman yürüyüşüdür. Ekimde kayınlar sararır, temmuzda sivrisinek artar. Gölet durgundur; içme suyu kamp çeşmesindedir. Akşam sis suyun üstüne çöker.',
    image: img('1472396961693-142e6e269027'),
    waypoints: ['Kamp alanı', 'Gölet kenarı', 'Çadır düzlüğü'],
    spine: [
      [40.943, 31.751, 790],
      [40.9462, 31.7555, 805],
      [40.949, 31.759, 815],
      [40.9515, 31.755, 825],
    ],
  },
  {
    id: 'beypazari-sirti',
    title: 'Beypazarı Sırt Yürüyüşü',
    activity: 'hiking',
    region: 'Ankara',
    city: 'Beypazarı',
    loop: false,
    rating: 4.0,
    ratingCount: 73,
    author: 'Emrah Çelik',
    recordedAt: '2023-05-07',
    description:
      "Beypazarı'nın üstündeki bozkır sırtında, ardıç lekeleri arasından yükselen açık bir yürüyüştür. İlkbaharda yeşil, yazın sıcak ve susuz, sonbaharda rüzgârlıdır. Su kasaba çıkışında alınır. Sırtın üstünden vadi ve kiremit çatılar görünür.",
    image: img('1469474968028-56623f02e42e'),
    waypoints: ['Kasaba sırtı', 'Bozkır yolu', 'Yüksek sırt'],
    spine: [
      [40.1685, 31.921, 700],
      [40.1735, 31.9285, 820],
      [40.179, 31.936, 940],
      [40.1845, 31.9425, 1050],
    ],
  },
  {
    id: 'belgrad-orman-yolu',
    title: 'Belgrad Orman Yolu Bisikleti',
    activity: 'cycling',
    region: 'İstanbul',
    city: 'Sarıyer',
    loop: false,
    rating: 4.3,
    ratingCount: 219,
    author: 'Nazlı Kurt',
    recordedAt: '2025-04-26',
    description:
      "Belgrad Ormanı'nın geniş orman yolunda bentler yönüne inen gölgeli bir bisiklet sürüşüdür. Yağmurdan sonra zemin yumuşar, yazın ağaç altı serindir. Çeşmeler yol boyunda seyrektir. Açıklıklarda gölet parıltısı ve yaşlı meşeler görünür.",
    image: img('1441974231531-c6227db76b6e'),
    waypoints: ['Bentler yolu', 'Orman içi', 'Piknik alanı'],
    spine: [
      [41.198, 28.978, 80],
      [41.1905, 28.9685, 100],
      [41.184, 28.958, 120],
      [41.176, 28.9495, 130],
    ],
  },
  {
    id: 'goreme-acik-hava-muzesi',
    title: 'Göreme Açık Hava Müzesi Yürüyüşü',
    activity: 'hiking',
    region: 'Nevşehir',
    city: 'Göreme',
    loop: false,
    rating: 4.5,
    ratingCount: 764,
    author: 'Volkan Ateş',
    recordedAt: '2024-04-14',
    description:
      'Göreme Açık Hava Müzesi çevresinde peribacalarının arasından geçen kısa ve kolay bir yürüyüştür. Sabah ışığı yumuşak, yaz öğleni sıcaktır. Su müze girişindedir. Vadi tabanından tüf duvarlara oyulmuş kaya yapıları ve güvercinlikler seçilir.',
    image: img('1541432901042-2d8bd64b4a9b'),
    waypoints: ['Müze girişi', 'Peri bacaları', 'Müze çıkışı'],
    spine: [
      [38.6405, 34.8465, 1080],
      [38.6428, 34.842, 1100],
      [38.6448, 34.8375, 1115],
      [38.6432, 34.833, 1105],
    ],
  },
  {
    id: 'uludag-etek-kosu',
    title: 'Uludağ Etek Koşusu',
    activity: 'running',
    region: 'Bursa',
    city: 'Yıldırım',
    loop: false,
    rating: 4.2,
    ratingCount: 118,
    author: 'Büşra Ergin',
    recordedAt: '2025-05-03',
    description:
      'Cumalıkızık üstündeki çam eteğinde, toprak yollardan yukarı açılan bir etek koşusudur. İlkbahar serin ve çiçekli, yaz akşamı en rahat zamandır. Çeşmeler köy çıkışındadır. Ağaçlar aralanınca Bursa ovası aşağıda kalır.',
    image: img('1551632811-561732d1e306'),
    waypoints: ['Cumalıkızık çıkışı', 'Çam eteği', 'Sırt düzlüğü'],
    spine: [
      [40.1752, 29.1705, 340],
      [40.1705, 29.1768, 430],
      [40.1658, 29.1835, 530],
      [40.161, 29.1902, 640],
      [40.1565, 29.1968, 760],
    ],
  },
  {
    id: 'trabzon-sahil-bisiklet',
    title: 'Trabzon Sahil Bisiklet Turu',
    activity: 'cycling',
    region: 'Trabzon',
    city: 'Ortahisar',
    loop: false,
    rating: 4.1,
    ratingCount: 164,
    author: 'Cemal Yüce',
    recordedAt: '2023-09-23',
    description:
      "Trabzon sahilinden doğuya, Karadeniz kıyı yoluna paralel sürülen düz bir bisiklet rotasıdır. Yazın nem yüksektir; ilkbahar ve sonbahar daha ferah olur. Deniz serindir, çeşme sahil parklarındadır. Dalgaların gerisinde yamaçlara tırmanan çay bahçeleri görünür.",
    image: img('1507525428034-b723cf961d3e'),
    waypoints: ['Ganita sahili', 'Havalimanı kıyısı', 'Yomra kıyısı'],
    spine: [
      [41.0048, 39.7335, 12],
      [41.0022, 39.7555, 8],
      [40.9994, 39.778, 10],
      [40.9966, 39.8005, 9],
      [40.9938, 39.8235, 11],
      [40.9912, 39.846, 8],
    ],
  },
  {
    id: 'abant-kamp-yuruyusu',
    title: 'Abant Kamp Yürüyüşü',
    activity: 'camping',
    region: 'Bolu',
    city: 'Merkez',
    loop: false,
    rating: 4.4,
    ratingCount: 54,
    author: 'Hale Sönmez',
    recordedAt: '2024-08-31',
    description:
      "Abant'ta çadır kurulan çayırdan göl kıyısına inen kısa bir akşam yürüyüşüdür. Yaz geceleri serin, ilkbaharda çayır ıslaktır. Göl suyu durgun ve soğuktur; içme suyu kamp çeşmesindedir. Karşı kıyıdaki göknarlar kararırken su son ışığı tutar.",
    image: img('1500530855697-b586d89ba3ee'),
    waypoints: ['Kamp çayırı', 'Batı kıyı', 'Akşam dönüşü'],
    spine: [
      [40.6035, 31.2728, 1338],
      [40.6068, 31.2768, 1341],
      [40.6098, 31.2818, 1344],
      [40.6115, 31.2865, 1343],
    ],
  },
  {
    id: 'goreme-vadisi-mtb',
    title: 'Göreme Vadisi MTB Turu',
    activity: 'mtb',
    region: 'Nevşehir',
    city: 'Göreme',
    loop: false,
    rating: 4.4,
    ratingCount: 132,
    author: 'Ferhat Uçar',
    recordedAt: '2025-10-18',
    description:
      'Göreme ile Uçhisar arasındaki tüf vadide, patika ve toprak yolları izleyen kısa bir dağ bisikleti sürüşüdür. İlkbahar ve sonbahar toz daha az, yaz öğleni sıcaktır. Dere yatağı kuru olur; su köy çeşmelerindedir. Sırt dönünce peribacaları ve Uçhisar kalesi aynı anda görünür.',
    image: img('1500534314209-a25ddb2bd429'),
    waypoints: ['Göreme çıkışı', 'Vadi tabanı', 'Uçhisar altı'],
    spine: [
      [38.6432, 34.8305, 1105],
      [38.6395, 34.821, 1128],
      [38.6358, 34.8125, 1155],
      [38.6322, 34.8048, 1172],
      [38.629, 34.7985, 1190],
    ],
  },
];

function buildRoute(def, index) {
  const { track, maxOffset, wobbleAmp } = buildTrack(def.spine, {
    loop: def.loop,
    seed: 4000 + index * 97,
    shore: def.shore,
  });
  const stats = trackStats(track);
  const distanceKm = Math.round(stats.dist * 100) / 100;
  const elevationGainM = Math.round(stats.gain);
  const elevationLossM = Math.round(stats.loss);
  const maxElevationM = Math.round(stats.maxE);
  const minElevationM = Math.round(stats.minE);
  const difficulty = difficultyOf(elevationGainM, distanceKm);
  const duration = durationMin(def.activity, distanceKm, elevationGainM);
  const mid = notableIndex(track);
  const points = [track[0], track[mid], track[track.length - 1]];
  const waypoints = def.waypoints.map((name, i) => ({
    name,
    lat: points[i][0],
    lng: points[i][1],
  }));

  return {
    id: def.id,
    title: def.title,
    activity: def.activity,
    region: def.region,
    city: def.city,
    difficulty,
    loop: def.loop,
    distanceKm,
    elevationGainM,
    elevationLossM,
    maxElevationM,
    minElevationM,
    durationMin: duration,
    rating: def.rating,
    ratingCount: def.ratingCount,
    author: def.author,
    recordedAt: def.recordedAt,
    description: def.description,
    image: def.image,
    track,
    waypoints,
    _maxOffset: maxOffset,
    _wobbleAmp: wobbleAmp,
    _spine: def.spine,
    _shorePush: def.shore?.push || 0,
  };
}

function sentenceCount(text) {
  const parts = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length;
}

function validate(routes) {
  const errors = [];
  if (!Array.isArray(routes) || routes.length < 32) {
    errors.push(`length ${routes?.length} < 32`);
  }
  const ids = new Set();
  const authors = new Set();
  const activities = new Set();
  const activityCounts = {};
  for (const r of routes) {
    if (ids.has(r.id)) errors.push(`duplicate id ${r.id}`);
    ids.add(r.id);
    if (authors.has(r.author)) errors.push(`duplicate author ${r.author}`);
    authors.add(r.author);
    activities.add(r.activity);
    activityCounts[r.activity] = (activityCounts[r.activity] || 0) + 1;
    if (!r.track || r.track.length < 40) errors.push(`${r.id} track ${r.track?.length}`);
    if (r.track.length > 90) errors.push(`${r.id} track too long ${r.track.length}`);
    if (!(r.distanceKm > 0.4)) errors.push(`${r.id} distance ${r.distanceKm}`);
    const endGap = haversineKm(r.track[0][0], r.track[0][1], r.track.at(-1)[0], r.track.at(-1)[1]);
    if (r.loop && endGap > 0.15) errors.push(`${r.id} loop gap ${endGap.toFixed(3)} km`);
    if (!r.loop && endGap < 0.15) errors.push(`${r.id} non-loop gap ${endGap.toFixed(3)} km`);
    let prev = null;
    for (const pt of r.track) {
      if (!Array.isArray(pt) || pt.length !== 3 || pt.some((n) => typeof n !== 'number' || Number.isNaN(n))) {
        errors.push(`${r.id} bad point`);
        break;
      }
      const [lat, lng, ele] = pt;
      if (lat < 35.5 || lat > 42.5 || lng < 25.5 || lng > 45) {
        errors.push(`${r.id} out of turkey ${lat},${lng}`);
        break;
      }
      if (ele < 0) {
        errors.push(`${r.id} negative ele ${ele}`);
        break;
      }
      if (prev && ele < Math.min(prev, pt[2]) - 40) {
        errors.push(`${r.id} negative spike`);
        break;
      }
      prev = ele;
    }
    const lats = r._spine.map((p) => p[0]);
    const lngs = r._spine.map((p) => p[1]);
    const pad = r._shorePush + 0.0008;
    for (const [lat, lng] of r.track) {
      if (lat < Math.min(...lats) - pad || lat > Math.max(...lats) + pad || lng < Math.min(...lngs) - pad || lng > Math.max(...lngs) + pad) {
        errors.push(`${r.id} left corridor ${lat},${lng}`);
        break;
      }
    }
    if (r._maxOffset < 0.00005 || r._maxOffset > 0.00016) {
      errors.push(`${r.id} wobble ${r._maxOffset}`);
    }
    if (r._wobbleAmp < 0.00008 || r._wobbleAmp > 0.00015 + 1e-12) {
      errors.push(`${r.id} wobble amp ${r._wobbleAmp}`);
    }
    const expectDiff = difficultyOf(r.elevationGainM, r.distanceKm);
    if (r.difficulty !== expectDiff) errors.push(`${r.id} difficulty ${r.difficulty} != ${expectDiff}`);
    const expectDur = durationMin(r.activity, r.distanceKm, r.elevationGainM);
    if (r.durationMin !== expectDur) errors.push(`${r.id} duration ${r.durationMin} != ${expectDur}`);
    if (r.rating < 3.8 || r.rating > 5 || Math.abs(r.rating * 10 - Math.round(r.rating * 10)) > 1e-6) {
      errors.push(`${r.id} rating ${r.rating}`);
    }
    if (!Number.isInteger(r.ratingCount) || r.ratingCount < 12 || r.ratingCount > 900) {
      errors.push(`${r.id} ratingCount ${r.ratingCount}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.recordedAt)) errors.push(`${r.id} date`);
    const year = Number(r.recordedAt.slice(0, 4));
    if (year < 2023 || year > 2025) errors.push(`${r.id} year ${year}`);
    const sentences = sentenceCount(r.description);
    if (sentences < 2 || sentences > 4) errors.push(`${r.id} sentences ${sentences}`);
    if (!r.waypoints || r.waypoints.length !== 3) errors.push(`${r.id} waypoints`);
    const photoId = (r.image.match(/photo-([^?]+)/) || [])[1];
    if (!PHOTO_IDS.includes(photoId)) errors.push(`${r.id} image`);
    if (r.loop) {
      const a = r.track[0];
      const b = r.track.at(-1);
      if (a[0] !== b[0] || a[1] !== b[1] || a[2] !== b[2]) errors.push(`${r.id} loop not closed`);
    }
  }
  for (const kind of ['hiking', 'mtb', 'running', 'kayak', 'camping', 'cycling']) {
    if (!activities.has(kind)) errors.push(`missing activity ${kind}`);
    if ((activityCounts[kind] || 0) < 2) errors.push(`activity ${kind} count ${activityCounts[kind] || 0}`);
  }
  return { errors, activityCounts };
}

function publicRoute(r) {
  return {
    id: r.id,
    title: r.title,
    activity: r.activity,
    region: r.region,
    city: r.city,
    difficulty: r.difficulty,
    loop: r.loop,
    distanceKm: r.distanceKm,
    elevationGainM: r.elevationGainM,
    elevationLossM: r.elevationLossM,
    maxElevationM: r.maxElevationM,
    minElevationM: r.minElevationM,
    durationMin: r.durationMin,
    rating: r.rating,
    ratingCount: r.ratingCount,
    author: r.author,
    recordedAt: r.recordedAt,
    description: r.description,
    image: r.image,
    track: r.track,
    waypoints: r.waypoints,
  };
}

const built = ROUTES.map((def, i) => buildRoute(def, i));
const { errors, activityCounts } = validate(built);
if (errors.length) {
  console.error(errors.slice(0, 40).join('\n'));
  process.exit(1);
}

const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data', 'routes.json');
mkdirSync(dirname(outPath), { recursive: true });
const payload = built.map(publicRoute);
writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

const parsed = JSON.parse(readFileSync(outPath, 'utf8'));
const recheck = validate(
  parsed.map((r, i) => ({
    ...r,
    _maxOffset: built[i]._maxOffset,
    _wobbleAmp: built[i]._wobbleAmp,
    _spine: built[i]._spine,
    _shorePush: built[i]._shorePush,
  })),
);
if (recheck.errors.length || parsed.length !== payload.length) {
  console.error(recheck.errors.join('\n'));
  process.exit(1);
}

console.log(`routes ${parsed.length}`);
console.log(`activities ${JSON.stringify(activityCounts)}`);
console.log(`file ${outPath}`);
for (const r of built) {
  console.log(
    `${r.id} ${r.activity} ${r.distanceKm}km +${r.elevationGainM}/-${r.elevationLossM} ${r.difficulty} ${r.durationMin}min pts=${r.track.length} loop=${r.loop}`,
  );
}
console.log('VALIDATION PASSED');
