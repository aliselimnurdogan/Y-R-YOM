const raw = import.meta.env.VITE_STEP
export const APP_STEP =
  raw === '1'
    ? '1'
    : raw === '3'
      ? '3'
      : raw === '4'
        ? '4'
        : raw === '5'
          ? '5'
          : raw === '6'
            ? '6'
            : raw === '7'
              ? '7'
              : raw === '8'
                ? '8'
                : '2'
export type AppStep = typeof APP_STEP
export const HAS_ROUTE_MODE =
  APP_STEP === '1' ||
  APP_STEP === '3' ||
  APP_STEP === '4' ||
  APP_STEP === '5' ||
  APP_STEP === '6' ||
  APP_STEP === '7' ||
  APP_STEP === '8'
export const HAS_CATALOG =
  APP_STEP === '3' ||
  APP_STEP === '4' ||
  APP_STEP === '5' ||
  APP_STEP === '6' ||
  APP_STEP === '7' ||
  APP_STEP === '8'
export const HAS_FEEL = APP_STEP === '5' || APP_STEP === '6' || APP_STEP === '7' || APP_STEP === '8'
export const HAS_LOOK = APP_STEP === '6' || APP_STEP === '7' || APP_STEP === '8'
export const HAS_LIVE = APP_STEP === '7' || APP_STEP === '8'
export const HAS_SOCIAL = APP_STEP === '2' || APP_STEP === '7' || APP_STEP === '8'
export const HAS_POLISH = APP_STEP === '8'
