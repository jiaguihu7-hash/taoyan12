export type BodyType = 'thin' | 'normal' | 'fat';
export type HeightType = 'short' | 'normal' | 'tall';
export type HairStyle = 'bald' | 'spiky' | 'messy' | 'side-part' | 'long';
export type BeardStyle = 'none' | 'stubble' | 'goatee' | 'full';
export type EyeStyle = 'dots' | 'angry' | 'sad' | 'big';

export interface CharacterAppearance {
  id: string;
  name: string;
  bodyType: BodyType;
  height: HeightType;
  hairStyle: HairStyle;
  hairColor: string;
  beardStyle: BeardStyle;
  eyeStyle: EyeStyle;
  skinColor: string; // For the "stick" color usually black
}

export interface SavedCharacter extends CharacterAppearance {
  hitCount: number;
  customMessages: string[];
}

export type AmmoType = 'egg' | 'poop' | 'tomato';

export interface Stain {
  id: string;
  x: number;
  y: number;
  type: AmmoType;
  rotation: number;
  scale: number;
  opacity: number;
}

export interface FlyingProjectile {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  type: AmmoType;
}

export interface ChatBubble {
  text: string;
  visible: boolean;
}
