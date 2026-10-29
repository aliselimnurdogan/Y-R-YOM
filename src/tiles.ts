// Esri World Topo: no API key, and the Lycian coast on OSM is covered in
// campsite triangles that read as drawn shapes. {y}/{x} is Esri's order.
export const TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'

export const TILE_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'

export const TILE_MAX_ZOOM = 19

export const BASEMAPS = {
  topo: {
    label: 'Topoğrafya',
    url: TILE_URL,
    attribution: TILE_ATTRIBUTION,
  },
  uydu: {
    label: 'Uydu',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri — Earthstar Geographics',
  },
  open: {
    label: 'OpenTopo',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
  },
} as const

export type BasemapId = keyof typeof BASEMAPS
