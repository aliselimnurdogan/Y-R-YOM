/** Quiet, original acoustic bed. No recorded song is used. */

export interface AmbienceHandle {
  stop: () => void
  setMuted: (muted: boolean) => void
}

const Ctx =
  typeof window !== 'undefined'
    ? window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    : undefined

function noiseBuffer(ctx: AudioContext) {
  const length = Math.floor(ctx.sampleRate * 2.4)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < length; i += 1) {
    last = last * 0.97 + (Math.random() * 2 - 1) * 0.03
    data[i] = last
  }
  return buffer
}

function scaleFor(kind: string) {
  if (kind === 'sahil' || kind === 'gol') return [196, 247, 294, 330, 392]
  if (kind === 'orman' || kind === 'yayla') return [174, 220, 261, 329, 392]
  return [164.8, 196, 246.9, 293.7, 329.6]
}

export function startPlaceAmbience(kind: string): AmbienceHandle | null {
  if (!Ctx) return null
  const ctx = new Ctx()
  void ctx.resume()
  const master = ctx.createGain()
  master.gain.value = 0.05
  master.connect(ctx.destination)

  const coastal = kind === 'sahil' || kind === 'gol'
  const wind = ctx.createBufferSource()
  wind.buffer = noiseBuffer(ctx)
  wind.loop = true
  const windFilter = ctx.createBiquadFilter()
  windFilter.type = 'lowpass'
  windFilter.frequency.value = coastal ? 720 : 880
  const windGain = ctx.createGain()
  windGain.gain.value = coastal ? 0.2 : 0.11
  wind.connect(windFilter)
  windFilter.connect(windGain)
  windGain.connect(master)
  wind.start()

  const lfo = ctx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = coastal ? 0.06 : 0.045
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = coastal ? 160 : 70
  lfo.connect(lfoGain)
  lfoGain.connect(windFilter.frequency)
  lfo.start()

  const drone = ctx.createOscillator()
  drone.type = 'sine'
  drone.frequency.value = coastal ? 98 : 87
  const droneGain = ctx.createGain()
  droneGain.gain.value = 0.018
  drone.connect(droneGain)
  droneGain.connect(master)
  drone.start()

  const notes = scaleFor(kind)
  let timer = 0
  const pluck = () => {
    if (ctx.state === 'closed') return
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = notes[Math.floor(Math.random() * notes.length)]
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 1200
    const env = ctx.createGain()
    const now = ctx.currentTime
    env.gain.setValueAtTime(0.0001, now)
    env.gain.exponentialRampToValueAtTime(0.04, now + 0.03)
    env.gain.exponentialRampToValueAtTime(0.0001, now + 3.2)
    osc.connect(filter)
    filter.connect(env)
    env.connect(master)
    osc.start(now)
    osc.stop(now + 3.3)
    timer = window.setTimeout(pluck, 2600 + Math.random() * 4800)
  }
  timer = window.setTimeout(pluck, 700)

  return {
    stop() {
      window.clearTimeout(timer)
      void ctx.close()
    },
    setMuted(muted) {
      master.gain.setTargetAtTime(muted ? 0 : 0.05, ctx.currentTime, 0.12)
    },
  }
}
