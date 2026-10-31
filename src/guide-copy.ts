export const LAYERS = [
  {
    id: 'ic',
    title: 'İç kat',
    wear: 'Cilt üstü',
    when: 'Her yürüyüş. Teri alır, ıslak bırakmaz.',
    fabric: 'Merino veya sentetik. Pamuk değil — pamuk soğutur.',
  },
  {
    id: 'ara',
    title: 'Ara kat',
    wear: 'Polar, hafif yün',
    when: 'Yayla sabahı, rüzgar, gölge kanyon.',
    fabric: 'Hafif polar. Ter durunca çıkar, üşüyünce giy.',
  },
  {
    id: 'kabuk',
    title: 'Kabuk',
    wear: 'Yağmurluk, rüzgarlık',
    when: 'Karadeniz, sağanak, zirve rüzgarı.',
    fabric: 'Membranlı ceket. Sırt çantası altında havalansın.',
  },
  {
    id: 'dis',
    title: 'Dış yalıtım',
    wear: 'Şişme veya kalın polar',
    when: 'Kış, gece kamp, yüksek geçit.',
    fabric: 'Islakken giyilmez. Kabuğun altında durur.',
  },
  {
    id: 'ayak',
    title: 'Ayak',
    wear: 'Yaklaşım veya bot',
    when: 'Parkur zeminine göre.',
    fabric: 'Islak çorap değiştir. Yeni ayakkabıyla uzun yol yok.',
  },
] as const

export const CONDITIONS = [
  {
    id: 'yayla',
    title: 'Yaz yayla',
    line: 'Sabah serin, öğle yakıcı. İç kat + şapka. Polar çantada.',
  },
  {
    id: 'sahil',
    title: 'Kıyı',
    line: 'Tuz, güneş, rüzgar. İnce kumaş, uzun kollu, su.',
  },
  {
    id: 'orman',
    title: 'Sonbahar orman',
    line: 'Nem ve çamur. Kabuk, yedek çorap, keçe taban.',
  },
  {
    id: 'kis',
    title: 'Kış geçit',
    line: 'Kat kat. Islak pamuk yok. Eldiven, bere, baş lambası.',
  },
] as const

export const TABLES = [
  {
    zone: 'Akdeniz',
    plate: 'Kebap, şalgam, ezme',
    hint: 'Adana–Hatay. Öğle ağırsa sonrası kısa yürüyüş.',
  },
  {
    zone: 'Güneydoğu Anadolu',
    plate: 'Lahmacun, baklava, ciğer',
    hint: 'Antep, Urfa. Tatlıyı yokuştan sonraya bırak.',
  },
  {
    zone: 'Karadeniz',
    plate: 'Hamsi, mıhlama, kara lahana',
    hint: 'Yağmur sonrası sıcak kap. İnek yağı ağırdır.',
  },
  {
    zone: 'Ege',
    plate: 'Zeytinyağlı, ot, ızgara balık',
    hint: 'Sabah ot, öğle hafif. Susuz ot yoğurt ister.',
  },
  {
    zone: 'Marmara',
    plate: 'Balık, midye, simit',
    hint: 'İskele kuyruğu. Midye sokak iddiası; midye pişmiş olsun.',
  },
  {
    zone: 'İç Anadolu',
    plate: 'Mantı, testide kebap, gözleme',
    hint: 'Kapadokya öğle kalabalık. Su ve tuz.',
  },
  {
    zone: 'Doğu Anadolu',
    plate: 'Cağ, hıngel, otlu peynir',
    hint: 'Rakım yüksek. Ağır etten sonra yokuş zor.',
  },
] as const
