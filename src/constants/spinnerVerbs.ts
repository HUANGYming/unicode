import { getInitialSettings } from '../utils/settings/settings.js'

export function getSpinnerVerbs(): string[] {
  const settings = getInitialSettings()
  const config = settings.spinnerVerbs
  if (!config) {
    return SPINNER_VERBS
  }
  if (config.mode === 'replace') {
    return config.verbs.length > 0 ? config.verbs : SPINNER_VERBS
  }
  return [...SPINNER_VERBS, ...config.verbs]
}

// Spinner verbs for loading messages — 🐱 cat edition
export const SPINNER_VERBS = [
  '喵喵喵',
  '猫猫思考中',
  '猫猫爪子动起来了',
  '猫猫在打字',
  '猫猫眯眼思考',
  '猫猫翻箱倒柜',
  '猫猫打滚中',
  '猫猫伸懒腰',
  '猫猫竖起胡须',
  '猫猫盯着屏幕',
  '猫猫踩键盘',
  '猫猫挠头',
  '猫猫呼噜中',
  '猫猫扑蝴蝶',
  '猫猫钻纸箱',
  'Meowing',
  'Purring',
  'Pawing',
  'Napping',
  'Kneading',
  'Pouncing',
  'Whisker-twitching',
  'Tail-flicking',
  'Yarn-untangling',
  'Box-sitting',
  'Hairball-processing',
  'Midnight-zoomies',
  'Sunbeam-absorbing',
  'Bird-watching',
  'Fish-dreaming',
  'Catnip-rolling',
  'Head-bumping',
  'Slow-blinking',
  'Chirping',
  'Hissing-kindly',
  'Grooming',
  'Staring-into-void',
  'Knocking-things-off',
  'Plotting',
]
