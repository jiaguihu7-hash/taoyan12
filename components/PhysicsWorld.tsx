import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Matter from 'matter-js';
import { AMMO_CONFIG } from '../constants';
import { AmmoType } from '../types';

interface PhysicsWorldProps {}

export interface PhysicsWorldHandle {
  addBody: (x: number, y: number, type: AmmoType) => void;
}

export const PhysicsWorld = forwardRef<PhysicsWorldHandle, PhysicsWorldProps>((props, ref) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);

  // Initialize Matter.js
  useEffect(() => {
    if (!sceneRef.current) return;

    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Composite = Matter.Composite;

    const engine = Engine.create();
    engineRef.current = engine;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false, // We want actual sprites/colors
        background: 'transparent'
      }
    });
    renderRef.current = render;

    // Ground
    const ground = Bodies.rectangle(
      window.innerWidth / 2, 
      window.innerHeight + 30, 
      window.innerWidth, 
      60, 
      { isStatic: true, render: { visible: false } }
    );
    
    // Walls to keep emojis in view
    const leftWall = Bodies.rectangle(-30, window.innerHeight / 2, 60, window.innerHeight, { isStatic: true });
    const rightWall = Bodies.rectangle(window.innerWidth + 30, window.innerHeight / 2, 60, window.innerHeight, { isStatic: true });

    World.add(engine.world, [ground, leftWall, rightWall]);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Render.run(render);

    const handleResize = () => {
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
        Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + 30 });
        Matter.Body.setPosition(rightWall, { x: window.innerWidth + 30, y: window.innerHeight / 2 });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      window.removeEventListener('resize', handleResize);
      if (render.canvas) render.canvas.remove();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    addBody: (x: number, y: number, type: AmmoType) => {
      if (!engineRef.current) return;
      
      const config = AMMO_CONFIG[type];
      
      // We use a circle body but render text on it via custom rendering or standard render sprites
      // Since Matter.js 'render.text' isn't standard, we use a simple hack: 
      // render the sprite using a base64 emoji or just a colored circle for now, 
      // but to strictly follow the prompt "Emoji sliding to ground", we can map texture.
      // For simplicity and performance in this specific task without external assets:
      // We will generate a small canvas with the emoji, convert to dataURL, and use as sprite.
      
      const size = 32;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.font = '24px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(config.emoji, size/2, size/2);
      }
      
      const body = Matter.Bodies.circle(x, y, 15, {
        restitution: 0.5,
        friction: 0.5,
        render: {
            sprite: {
                texture: canvas.toDataURL(),
                xScale: 1,
                yScale: 1
            }
        }
      });
      
      // Add random velocity slightly to make it look like it fell off the person
      Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 5, y: -2 });

      Matter.World.add(engineRef.current.world, body);

      // Cleanup old bodies if too many
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      if (bodies.length > 150) {
          const removable = bodies.filter(b => !b.isStatic);
          if (removable.length > 0) {
              Matter.World.remove(engineRef.current.world, removable[0]);
          }
      }
    }
  }));

  return (
    <div ref={sceneRef} className="absolute inset-0 pointer-events-none z-20" />
  );
});