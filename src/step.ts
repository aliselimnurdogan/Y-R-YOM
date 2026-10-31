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
                : raw === '9'
                  ? '9'
                  : raw === '10'
                    ? '10'
                    : raw === '11'
                      ? '11'
                      : raw === '12'
                        ? '12'
                        : raw === '13'
                          ? '13'
                          : raw === '15'
                            ? '15'
                            : raw === '16'
                              ? '16'
                              : '2'
export type AppStep = typeof APP_STEP
const FROM_3 = new Set(['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '15', '16'])
export const HAS_ROUTE_MODE = APP_STEP === '1' || FROM_3.has(APP_STEP)
export const HAS_CATALOG = FROM_3.has(APP_STEP)
export const HAS_FEEL = new Set(['5', '6', '7', '8', '9', '10', '11', '12', '13', '15', '16']).has(APP_STEP)
export const HAS_LOOK = new Set(['6', '7', '8', '9', '10', '11', '12', '13', '15', '16']).has(APP_STEP)
export const HAS_LIVE = new Set(['7', '8', '9', '10', '11', '12', '13', '15', '16']).has(APP_STEP)
export const HAS_SOCIAL = APP_STEP === '2' || new Set(['7', '8', '9', '10', '11', '12', '13', '15', '16']).has(APP_STEP)
export const HAS_POLISH = new Set(['8', '9', '10', '11', '12', '13', '15', '16']).has(APP_STEP)
export const HAS_BLOOM = new Set(['9', '10', '11', '12', '13', '15', '16']).has(APP_STEP)
export const HAS_HOME = APP_STEP === '11' || APP_STEP === '12' || APP_STEP === '13' || APP_STEP === '15' || APP_STEP === '16'
export const HAS_ATLAS = APP_STEP === '12' || APP_STEP === '13' || APP_STEP === '15' || APP_STEP === '16'
export const HAS_TOUR = APP_STEP === '15' || APP_STEP === '16'
export const HAS_LAND = APP_STEP === '16'
export const ROUTES_PATH = HAS_HOME ? '/parkurlar' : '/'
