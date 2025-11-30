import React from 'react';
import { CharacterAppearance, BodyType, HeightType } from '../types';
import { BODY_WIDTHS, HEIGHT_SCALES, HAIR_PATHS, BEARD_PATHS, EYE_PATHS } from '../constants';

interface StickmanProps {
  appearance: CharacterAppearance;
  isHit: boolean; // Triggers "cowering" pose
}

export const Stickman: React.FC<StickmanProps> = ({ appearance, isHit }) => {
  const { bodyType, height, hairStyle, hairColor, beardStyle, eyeStyle, skinColor } = appearance;

  const strokeWidth = BODY_WIDTHS[bodyType];
  const scale = HEIGHT_SCALES[height];
  
  // Base dimensions
  const headRadius = 20;
  const torsoLength = 60;
  const limbLength = 50;

  // Pose calculation
  // Idle: Arms down, legs apart
  // Hit: Arms covering head, legs bent (cowering)
  
  const poses = {
    idle: {
      leftArm: `M-5,${headRadius + 5} L-25,${headRadius + 30}`,
      rightArm: `M5,${headRadius + 5} L25,${headRadius + 30}`,
      leftLeg: `M0,${headRadius + torsoLength} L-15,${headRadius + torsoLength + limbLength}`,
      rightLeg: `M0,${headRadius + torsoLength} L15,${headRadius + torsoLength + limbLength}`,
      torso: `M0,${headRadius} L0,${headRadius + torsoLength}`,
    },
    hit: {
      // Arms up covering head
      leftArm: `M-5,${headRadius + 5} L-20,0`,
      rightArm: `M5,${headRadius + 5} L20,0`,
      // Legs bent/crouching
      leftLeg: `M0,${headRadius + torsoLength} L-10,${headRadius + torsoLength + 30} L-5,${headRadius + torsoLength + limbLength}`,
      rightLeg: `M0,${headRadius + torsoLength} L10,${headRadius + torsoLength + 30} L5,${headRadius + torsoLength + limbLength}`,
      torso: `M0,${headRadius} L0,${headRadius + torsoLength}`,
    }
  };

  const currentPose = isHit ? poses.hit : poses.idle;

  return (
    <div className="relative pointer-events-none select-none transition-transform duration-200" style={{ transform: `scale(${scale})` }}>
      <svg
        width="200"
        height="300"
        viewBox="-100 -50 200 300"
        className="overflow-visible"
        style={{ color: skinColor || '#000' }}
      >
        <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Torso */}
          <path d={currentPose.torso} />
          {/* Legs */}
          <path d={currentPose.leftLeg} />
          <path d={currentPose.rightLeg} />
          {/* Arms */}
          <path d={currentPose.leftArm} />
          <path d={currentPose.rightArm} />
        </g>

        {/* Head Group */}
        <g transform="translate(0, 0)">
          {/* Face Base */}
          <circle cx="0" cy="0" r={headRadius} fill="white" stroke="currentColor" strokeWidth={Math.max(2, strokeWidth / 2)} />
          
          {/* Eyes */}
          <g stroke="black" strokeWidth={2} fill={eyeStyle === 'big' || eyeStyle === 'dots' ? 'black' : 'none'}>
            <path d={EYE_PATHS[eyeStyle].left} />
            <path d={EYE_PATHS[eyeStyle].right} />
          </g>

          {/* Mouth - Simple reaction */}
          <path 
            d={isHit ? "M-5,10 Q0,5 5,10" : "M-5,10 Q0,15 5,10"} 
            stroke="black" 
            strokeWidth={2} 
            fill="none" 
          />

          {/* Beard */}
          {beardStyle !== 'none' && (
            <path 
              d={BEARD_PATHS[beardStyle]} 
              stroke="black" 
              strokeWidth={2} 
              fill={beardStyle === 'full' ? 'black' : 'none'} 
            />
          )}

          {/* Hair */}
          {hairStyle !== 'bald' && (
             <path 
               d={HAIR_PATHS[hairStyle]} 
               stroke={hairColor} 
               strokeWidth={hairStyle === 'spiky' || hairStyle === 'messy' ? 3 : 0}
               fill={hairColor} 
               transform="translate(0, -5)"
             />
          )}
        </g>
      </svg>
      
      {/* Name Tag (rendered as HTML overlay for sharpness) */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-center w-full">
         <span className="font-bold text-gray-800 text-lg bg-white/80 px-2 rounded">{appearance.name || "无名氏"}</span>
      </div>
    </div>
  );
};
