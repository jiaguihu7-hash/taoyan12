import { AmmoType, BeardStyle, BodyType, EyeStyle, HairStyle, HeightType } from './types';

export const AMMO_CONFIG: Record<AmmoType, { emoji: string; color: string; splatterColor: string }> = {
  egg: { emoji: '🥚', color: '#FFFFFF', splatterColor: '#F4E04D' }, // Yolk yellow
  poop: { emoji: '💩', color: '#8B4513', splatterColor: '#654321' }, // Brown
  tomato: { emoji: '🍅', color: '#FF6347', splatterColor: '#C41E3A' }, // Deep red
};

export const DEFAULT_MESSAGES = [
  "别打了！我错了！",
  "求求你放过我吧！",
  "哎哟！好痛！",
  "再也不敢了！",
  "呜呜呜...",
  "给个面子别打了！",
  "大哥饶命！"
];

export const BODY_WIDTHS: Record<BodyType, number> = {
  thin: 2,
  normal: 6,
  fat: 14,
};

export const HEIGHT_SCALES: Record<HeightType, number> = {
  short: 0.8,
  normal: 1,
  tall: 1.2,
};

// SVG Paths for features
export const HAIR_PATHS: Record<HairStyle, string> = {
  bald: '',
  spiky: 'M-15,-10 Q-18,-20 -10,-30 Q-5,-20 0,-35 Q5,-20 10,-30 Q18,-20 15,-10',  // 卷发样式
  messy: 'M-18,-8 Q-10,-30 0,-25 Q10,-30 18,-8',
  'side-part': 'M-18,-8 Q-10,-25 15,-10 L15,-5',
  long: 'M-18,-8 Q-45,10 -15,60 M18,-8 Q50,10 15,60 M-18,-8 Q10,-30 18,-10',
};

export const BEARD_PATHS: Record<BeardStyle, string> = {
  none: '',
  stubble: `
    M-10,15 A1,1 0 1,0 -10.1,15
    M0,15 A1,1 0 1,0 -0.1,15
    M10,15 A1,1 0 1,0 10.1,15
    M-8,20 A1,1 0 1,0 -8.1,20
    M2,20 A1,1 0 1,0 2.1,20
    M-6,25 A1,1 0 1,0 -6.1,25
    M4,25 A1,1 0 1,0 4.1,25
    M-4,30 A1,1 0 1,0 -4.1,30
    M6,30 A1,1 0 1,0 6.1,30
  `,
  goatee: 'M-5,18 L0,25 L5,18',
  full: 'M-15,10 Q0,30 15,10',
};
export const EYE_PATHS: Record<EyeStyle, { left: string, right: string }> = {
  dots: { left: 'M-8,0 A2,2 0 1,1 -8.1,0', right: 'M8,0 A2,2 0 1,1 7.9,0' }, // Small circles
  angry: { left: 'M-12,-5 L-4,0', right: 'M4,0 L12,-5' },
  sad: { left: 'M-10,-2 L-4,-5', right: 'M4,-5 L10,-2' },
  big: { left: 'M-10,0 A4,4 0 1,1 -10.1,0', right: 'M10,0 A4,4 0 1,1 9.9,0' },
};
