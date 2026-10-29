export interface PlaceWeather {
  temp: number
  feels: number
  wind: number
  cloud: number
  rain: number
  label: string
}

export async function fetchWeather(lat: number, lng: number): Promise<PlaceWeather> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lng))
  url.searchParams.set('current', 'temperature_2m,apparent_temperature,wind_speed_10m,cloud_cover,precipitation_probability')
  url.searchParams.set('timezone', 'Europe/Istanbul')
  const response = await fetch(url)
  if (!response.ok) throw new Error('hava alınamadı')
  const data = (await response.json()) as {
    current?: {
      temperature_2m?: number
      apparent_temperature?: number
      wind_speed_10m?: number
      cloud_cover?: number
      precipitation_probability?: number
    }
  }
  const current = data.current ?? {}
  const cloud = Number(current.cloud_cover) || 0
  const rain = Number(current.precipitation_probability) || 0
  let label = 'Açık ve serin bak'
  if (rain >= 50) label = 'Yağış ihtimali yüksek'
  else if (cloud >= 70) label = 'Kapalı; yıldız zayıf'
  else if (cloud <= 25) label = 'Gökyüzü açık; gece izlemeye elverişli'
  return {
    temp: Number(current.temperature_2m) || 0,
    feels: Number(current.apparent_temperature) || 0,
    wind: Number(current.wind_speed_10m) || 0,
    cloud,
    rain,
    label,
  }
}
