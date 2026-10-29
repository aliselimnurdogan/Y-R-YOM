const raw = import.meta.env.VITE_STEP
export const APP_STEP = raw === '1' ? '1' : raw === '3' ? '3' : raw === '4' ? '4' : '2'
export type AppStep = typeof APP_STEP
export const HAS_ROUTE_MODE = APP_STEP === '1' || APP_STEP === '3' || APP_STEP === '4'
export const HAS_CATALOG = APP_STEP === '3' || APP_STEP === '4'
