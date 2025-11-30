import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, RefreshCw, Save, Trash2, Trophy, RotateCcw } from 'lucide-react';
import { Stickman } from './components/Stickman';
import { PhysicsWorld, PhysicsWorldHandle } from './components/PhysicsWorld';
import { 
  CharacterAppearance, 
  SavedCharacter, 
  Stain, 
  FlyingProjectile, 
  AmmoType, 
  BodyType, 
  HeightType, 
  HairStyle, 
  BeardStyle,
  EyeStyle
} from './types';
import { AMMO_CONFIG, DEFAULT_MESSAGES } from './constants';

const SPLATTER_PATHS = [
  "M45.7,26.4c-2.3-4.5-8.6-3.8-12.1-1.2c-1.4,1-2.4,1.8-4.2,1.3c-2.2-0.6-3-4.3-1.8-6.3c1.9-3.3,7.6-3.2,8.6-7.3 c0.9-3.8-3.4-7.5-7.3-6.6c-2.7,0.6-4.6,3.4-6.8,5.1c-2.8,2.2-6.9,1.4-9.3-1.3c-2.8-3.2-1.7-8.9-5.9-10.1c-4.3-1.2-8.6,3.4-8.1,7.8 c0.3,3,3.5,4.9,5.7,6.8c2.4,2.1,4.2,5.6,1.8,8.4c-2.6,3-7.7,1.8-11.2,3.3c-3.7,1.6-6.1,6.1-4.2,9.8c1.6,3.1,6,3.5,8.9,5.1 c3.2,1.8,5,5.6,8.4,6.7c4.1,1.3,8.7-1.7,10.2-5.7c0.8-2.2,0.4-4.7,2.2-6.2c1.9-1.6,4.9-1.2,7.2-0.4c4.1,1.5,8.8,3.9,12.3,0.9 C52.6,33.9,48.5,31.8,45.7,26.4z",
  "M27.5,48.9c3.9-0.9,6.7-4.9,5.8-8.8c-0.6-2.6-2.9-4.5-5.3-5.5c-2.9-1.2-6.3-0.5-9.1,1.1c-2.4,1.4-4.4,3.5-7.2,3.8 c-3.9,0.4-7.7-2.6-8.2-6.5c-0.4-3.5,2.1-6.7,5.4-7.9c2.9-1.1,6.1-0.2,8.9-1.6c2.5-1.2,4.2-3.8,6.8-4.8c4.2-1.6,9.2,0.8,11.2,4.8 c1.2,2.4,1,5.3,3.1,7.2c2.4,2.2,6.4,2,8.9,4.4c2.8,2.7,2.8,7.3-0.1,10.1c-2.3,2.2-5.9,2.2-8.9,3.3c-2.6,0.9-4.9,2.9-7.5,3.3 C37.4,52.4,31.4,53.4,27.5,48.9z",
  "M33.6,12.4c-3.6-2.6-8.8-1.4-11.4,2.2c-1.3,1.8-1.5,4.1-1.2,6.3c0.4,2.6,2.2,5,1.5,7.6c-0.8,2.8-4,4.5-6.8,3.7 c-3.6-1-5.7-5-4.7-8.6c0.8-2.9,3.7-4.8,6.6-5.3c0.6-0.1,1.2-0.3,1.6-0.7c2.2-2.3,0.7-6.5-2.3-7.5C12.7,8.7,8.4,11.5,7.1,15.6 c-0.8,2.7,0,5.8-1.9,8c-1.8,2.1-5,2.2-7.1,4.1C-4,29.6-4.5,33, -3.3,35.7c1.4,3.1,5.2,4.3,8.4,3.7c3.1-0.6,5.3-3.6,8.2-4.5 c2.7-0.8,5.8,0.3,8.3-1.1c3.1-1.7,4.5-5.5,7.1-7.8c2.4-2.1,6.1-2,8.7-0.1c2.8,2,4,5.8,7.3,6.8c4.2,1.3,8.8-1.5,10.1-5.7 C55.8,22.8,53,18.4,49.2,16C44.4,13,38.3,13.1,33.6,12.4z"
];

// Default characters
const PRESETS: SavedCharacter[] = [
  {
    id: 'default-1',
    name: '新角色',
    hitCount: 0,
    customMessages: DEFAULT_MESSAGES,
    bodyType: 'normal',
    height: 'normal',
    hairStyle: 'messy',
    hairColor: '#000000',
    beardStyle: 'stubble',
    eyeStyle: 'sad',
    skinColor: '#000000'
  }
];

export default function App() {
  // --- State ---
  const [character, setCharacter] = useState<SavedCharacter>(PRESETS[0]);
  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>(PRESETS);
  const [projectiles, setProjectiles] = useState<FlyingProjectile[]>([]);
  const [stains, setStains] = useState<Stain[]>([]);
  const [selectedAmmo, setSelectedAmmo] = useState<AmmoType>('egg');
  const [isBurstMode, setIsBurstMode] = useState(false);
  const [isHit, setIsHit] = useState(false); // For animation pose
  const [chatBubble, setChatBubble] = useState<{ text: string; id: number } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // Refs
  const physicsRef = useRef<PhysicsWorldHandle>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('stickman_punisher_data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSavedCharacters(parsed);
        // Find current or default to first
        setCharacter(parsed[0] || PRESETS[0]);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
  }, []);

  // Save to local storage whenever characters change
  useEffect(() => {
    localStorage.setItem('stickman_punisher_data', JSON.stringify(savedCharacters));
  }, [savedCharacters]);

  // Update specific character in the list
  const updateCharacterData = (updated: SavedCharacter) => {
    setCharacter(updated);
    setSavedCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const createNewCharacter = () => {
    const newChar: SavedCharacter = {
      ...PRESETS[0],
      id: uuidv4(),
      name: '新角色',
      hitCount: 0,
    };
    setSavedCharacters(prev => [...prev, newChar]);
    setCharacter(newChar);
  };

  // --- Game Logic ---

  const triggerHit = (x: number, y: number, ammoType: AmmoType) => {
    // 1. Add stain
    const splatters = SPLATTER_PATHS;
    const randomSplatter = splatters[Math.floor(Math.random() * splatters.length)];
    
    // Add new stain
    const newStain: Stain = {
      id: uuidv4(),
      x,
      y,
      type: ammoType,
      rotation: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.5,
      opacity: 0.9
    };

    setStains(prev => {
      // Logic: Darken existing stains by lowering opacity slightly or keeping them
      // "Stains darken as they accumulate" - represented by overlapping opacity
      // Limit total stains to avoid performance death
      const maxStains = 40;
      const updated = [...prev, newStain];
      if (updated.length > maxStains) {
        return updated.slice(updated.length - maxStains);
      }
      return updated;
    });

    // 2. Physics Body drop
    physicsRef.current?.addBody(x, y, ammoType);

    // 3. Update Character Stats
    const updatedChar = { ...character, hitCount: character.hitCount + 1 };
    updateCharacterData(updatedChar);

    // 4. Reaction
    setIsHit(true);
    setTimeout(() => setIsHit(false), 500);

    // 5. Chat Bubble (Random chance or every hit)
    const messages = character.customMessages.length > 0 ? character.customMessages : DEFAULT_MESSAGES;
    const msg = messages[Math.floor(Math.random() * messages.length)];
    setChatBubble({ text: `${character.name}: ${msg}`, id: Date.now() });
    setTimeout(() => setChatBubble(null), 2000);
  };

  const handleThrow = (targetX: number, targetY: number) => {
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight + 50; // Start from below screen

    const newProjectile: FlyingProjectile = {
      id: uuidv4(),
      startX,
      startY,
      targetX,
      targetY,
      type: selectedAmmo
    };

    setProjectiles(prev => [...prev, newProjectile]);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Don't throw if clicking UI
    if ((e.target as HTMLElement).closest('.ui-panel')) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX;
    const y = e.clientY;

    const count = isBurstMode ? 10 : 1;
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        // Add slight randomness for burst mode
        const offsetX = isBurstMode ? (Math.random() - 0.5) * 60 : 0;
        const offsetY = isBurstMode ? (Math.random() - 0.5) * 60 : 0;
        handleThrow(x + offsetX, y + offsetY);
      }, i * 80); // 80ms delay between burst shots
    }
  };

  const onProjectileComplete = (pId: string, p: FlyingProjectile) => {
    setProjectiles(prev => prev.filter(item => item.id !== pId));
    triggerHit(p.targetX, p.targetY, p.type);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-gray-50 overflow-hidden cursor-crosshair select-none font-sans"
      onClick={handleContainerClick}
    >
      {/* Background Stains Layer (Static relative to screen) */}
      {stains.map(stain => (
        <div 
            key={stain.id}
            className="absolute pointer-events-none"
            style={{
                left: stain.x,
                top: stain.y,
                transform: `translate(-50%, -50%) rotate(${stain.rotation}deg) scale(${stain.scale})`,
                opacity: stain.opacity,
                zIndex: 5
            }}
        >
             <svg width="60" height="60" viewBox="0 0 60 60">
                 <path 
                    d={SPLATTER_PATHS[0]} // Simplified: using one path or picking random here
                    fill={AMMO_CONFIG[stain.type].splatterColor} 
                 />
             </svg>
        </div>
      ))}

      {/* Physics World (Falling Emojis) */}
      <PhysicsWorld ref={physicsRef} />

      {/* Central Character Area */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div ref={characterRef} className="relative">
             {/* Chat Bubble */}
             <AnimatePresence>
              {chatBubble && (
                <motion.div
                  key={chatBubble.id}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute -top-32 left-1/2 -translate-x-1/2 bg-white border-2 border-black rounded-xl p-4 shadow-lg w-64 text-center z-50 pointer-events-none"
                >
                  <div className="text-lg font-bold text-gray-800 break-words">{chatBubble.text}</div>
                  {/* Triangle tail */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-black rotate-45 transform"></div>
                </motion.div>
              )}
             </AnimatePresence>

            <Stickman appearance={character} isHit={isHit} />
        </div>
      </div>

      {/* Flying Projectiles Layer */}
      {projectiles.map(p => (
        <Projectile 
            key={p.id} 
            data={p} 
            onComplete={() => onProjectileComplete(p.id, p)} 
        />
      ))}

      {/* --- UI Layer --- */}
      
      {/* Top Left: Leaderboard Toggle */}
      <button 
        onClick={(e) => { e.stopPropagation(); setShowLeaderboard(!showLeaderboard); }}
        className="ui-panel absolute top-4 left-4 bg-white p-3 rounded-xl shadow-md border hover:bg-gray-100 z-50 flex items-center gap-2"
      >
        <Trophy size={20} className="text-yellow-600" />
        <span className="font-bold">受害者排行榜</span>
      </button>

      {/* Top Right: Settings Toggle */}
      <button 
        onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
        className="ui-panel absolute top-4 right-4 bg-white p-3 rounded-xl shadow-md border hover:bg-gray-100 z-50 flex items-center gap-2"
      >
        <Settings size={20} className="text-gray-600" />
        <span className="font-bold">自定义人物</span>
      </button>

      {/* Center Top: Counter */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
         <div className="bg-red-600 text-white px-6 py-2 rounded-full font-mono text-3xl font-black shadow-lg border-4 border-white">
            {character.hitCount} HIT
         </div>
      </div>

      {/* Bottom Controls */}
      <div className="ui-panel absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-gray-200 z-50 flex flex-col items-center gap-4 w-[90%] max-w-lg">
        
        {/* Ammo Selector */}
        <div className="flex gap-4">
            {(Object.keys(AMMO_CONFIG) as AmmoType[]).map(type => (
                <button
                    key={type}
                    onClick={(e) => { e.stopPropagation(); setSelectedAmmo(type); }}
                    className={`p-3 rounded-full text-3xl transition-transform hover:scale-110 border-2 ${selectedAmmo === type ? 'bg-blue-100 border-blue-500 scale-110' : 'bg-gray-50 border-transparent'}`}
                >
                    {AMMO_CONFIG[type].emoji}
                </button>
            ))}
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-4 w-full justify-center">
            <button
                onClick={(e) => { e.stopPropagation(); setIsBurstMode(!isBurstMode); }}
                className={`flex-1 py-3 px-6 rounded-xl font-bold text-lg transition-colors ${isBurstMode ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
                {isBurstMode ? '🔥 连发模式 (开)' : '🔫 连发模式 (关)'}
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); setStains([]); }}
                className="p-3 bg-gray-200 rounded-xl hover:bg-gray-300"
                title="清理污渍"
            >
                <Trash2 size={24} />
            </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
          <div className="ui-panel absolute inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">角色编辑器</h2>
                      <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-black">关闭</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Character Preview */}
                      <div className="border rounded-xl p-8 bg-gray-50 flex items-center justify-center min-h-[300px]">
                          <div className="scale-75 origin-center">
                             <Stickman appearance={character} isHit={false} />
                          </div>
                      </div>

                      {/* Controls */}
                      <div className="space-y-4">
                          {/* Character Selector */}
                          <div className="flex gap-2 mb-4">
                              <select 
                                className="flex-1 p-2 border rounded"
                                value={character.id}
                                onChange={(e) => {
                                    const found = savedCharacters.find(c => c.id === e.target.value);
                                    if(found) setCharacter(found);
                                }}
                              >
                                  {savedCharacters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                              <button onClick={createNewCharacter} className="p-2 bg-green-500 text-white rounded"><RotateCcw size={16} /></button>
                          </div>

                          <div>
                              <label className="block text-sm font-bold mb-1">名字</label>
                              <input 
                                type="text" 
                                value={character.name} 
                                onChange={(e) => updateCharacterData({...character, name: e.target.value})}
                                className="w-full p-2 border rounded"
                              />
                          </div>

                           <div className="grid grid-cols-2 gap-2">
                               <div>
                                   <label className="block text-sm font-bold mb-1">体型</label>
                                   <select 
                                     value={character.bodyType} 
                                     onChange={(e) => updateCharacterData({...character, bodyType: e.target.value as BodyType})}
                                     className="w-full p-2 border rounded"
                                   >
                                       <option value="thin">瘦</option>
                                       <option value="normal">正常</option>
                                       <option value="fat">胖</option>
                                   </select>
                               </div>
                               <div>
                                   <label className="block text-sm font-bold mb-1">身高</label>
                                   <select 
                                     value={character.height} 
                                     onChange={(e) => updateCharacterData({...character, height: e.target.value as HeightType})}
                                     className="w-full p-2 border rounded"
                                   >
                                       <option value="short">矮</option>
                                       <option value="normal">正常</option>
                                       <option value="tall">高</option>
                                   </select>
                               </div>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-2">
                               <div>
                                   <label className="block text-sm font-bold mb-1">发型</label>
                                   <select 
                                     value={character.hairStyle} 
                                     onChange={(e) => updateCharacterData({...character, hairStyle: e.target.value as HairStyle})}
                                     className="w-full p-2 border rounded"
                                   >
                                       <option value="bald">光头</option>
                                       <option value="spiky">卷发</option>
                                       <option value="messy">凌乱</option>
                                       <option value="side-part">分头</option>
                                       <option value="long">长发</option>
                                   </select>
                               </div>
                               <div>
                                   <label className="block text-sm font-bold mb-1">发色</label>
                                   <input 
                                     type="color" 
                                     value={character.hairColor} 
                                     onChange={(e) => updateCharacterData({...character, hairColor: e.target.value})}
                                     className="w-full h-10 p-1 border rounded"
                                   />
                               </div>
                           </div>

                           <div className="grid grid-cols-2 gap-2">
                               <div>
                                   <label className="block text-sm font-bold mb-1">胡子</label>
                                   <select 
                                     value={character.beardStyle} 
                                     onChange={(e) => updateCharacterData({...character, beardStyle: e.target.value as BeardStyle})}
                                     className="w-full p-2 border rounded"
                                   >
                                       <option value="none">无</option>
                                       <option value="stubble">胡渣</option>
                                       <option value="goatee">山羊胡</option>
                                       <option value="full">络腮胡</option>
                                   </select>
                               </div>
                               <div>
                                   <label className="block text-sm font-bold mb-1">眼睛</label>
                                   <select 
                                     value={character.eyeStyle} 
                                     onChange={(e) => updateCharacterData({...character, eyeStyle: e.target.value as EyeStyle})}
                                     className="w-full p-2 border rounded"
                                   >
                                       <option value="dots">点点</option>
                                       <option value="angry">凶狠</option>
                                       <option value="sad">丧气</option>
                                       <option value="big">大眼</option>
                                   </select>
                               </div>
                           </div>

                           <div>
                               <label className="block text-sm font-bold mb-1">求饶语录 可自定义 (用回车分隔)</label>
                               <textarea
                                   className="w-full p-2 border rounded h-24 text-sm"
                                   value={character.customMessages.join('\n')}
                                   onChange={(e) => updateCharacterData({...character, customMessages: e.target.value.split('\n')})}
                                   placeholder="每一行是一句求饶的话..."
                               />
                           </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
          <div className="ui-panel absolute inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                 <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold flex items-center gap-2"><Trophy className="text-yellow-500" /> 受害者排行榜</h2>
                      <button onClick={() => setShowLeaderboard(false)} className="text-gray-500 hover:text-black">关闭</button>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto">
                      {savedCharacters.sort((a,b) => b.hitCount - a.hitCount).map((c, idx) => (
                          <div key={c.id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                  <span className={`font-bold w-6 ${idx < 3 ? 'text-red-500 text-xl' : 'text-gray-400'}`}>{idx + 1}</span>
                                  <div>
                                      <div className="font-bold">{c.name}</div>
                                      <div className="text-xs text-gray-500">被砸了 {c.hitCount} 次</div>
                                  </div>
                              </div>
                              {c.id === character.id && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">当前</span>}
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}

// Sub-component for individual projectile animation
const Projectile: React.FC<{ data: FlyingProjectile, onComplete: () => void }> = ({ data, onComplete }) => {
    const config = AMMO_CONFIG[data.type];
    
    return (
        <motion.div
            initial={{ x: data.startX, y: data.startY, rotate: 0 }}
            animate={{ x: data.targetX, y: data.targetY, rotate: 360 }}
            transition={{ duration: 0.4, ease: "linear" }}
            onAnimationComplete={onComplete}
            className="absolute text-4xl pointer-events-none z-30"
            style={{ 
                // Adjust to center the emoji on the coordinates
                marginLeft: '-1rem', 
                marginTop: '-1rem' 
            }}
        >
            {config.emoji}
        </motion.div>
    );
};
