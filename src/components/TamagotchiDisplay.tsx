import React from "react";
import clsx from "clsx";

interface TamagotchiDisplayProps {
  expression: "happy" | "sad" | "neutral" | "sleeping" | "eating" | "surprised" | "angry" | "dead";
  isTalking: boolean;
}

const Pixel = ({ x, y, color = "black" }: { x: number; y: number; color?: string }) => (
  <rect x={x} y={y} width="1" height="1" fill={color} />
);

// Simple 16x16 pixel art grids for different expressions
const EXPRESSIONS: Record<string, { eyes: React.ReactNode; mouth: React.ReactNode }> = {
  neutral: {
    eyes: (
      <>
        <Pixel x={4} y={6} />
        <Pixel x={11} y={6} />
      </>
    ),
    mouth: (
      <>
        <Pixel x={6} y={10} />
        <Pixel x={7} y={10} />
        <Pixel x={8} y={10} />
        <Pixel x={9} y={10} />
      </>
    ),
  },
  happy: {
    eyes: (
      <>
        <Pixel x={3} y={6} />
        <Pixel x={4} y={5} />
        <Pixel x={5} y={6} />
        <Pixel x={10} y={6} />
        <Pixel x={11} y={5} />
        <Pixel x={12} y={6} />
      </>
    ),
    mouth: (
      <>
        <Pixel x={5} y={9} />
        <Pixel x={10} y={9} />
        <Pixel x={6} y={10} />
        <Pixel x={7} y={10} />
        <Pixel x={8} y={10} />
        <Pixel x={9} y={10} />
      </>
    ),
  },
  sad: {
    eyes: (
      <>
        <Pixel x={3} y={6} />
        <Pixel x={4} y={6} />
        <Pixel x={11} y={6} />
        <Pixel x={12} y={6} />
      </>
    ),
    mouth: (
      <>
        <Pixel x={6} y={10} />
        <Pixel x={7} y={9} />
        <Pixel x={8} y={9} />
        <Pixel x={9} y={10} />
      </>
    ),
  },
  surprised: {
    eyes: (
      <>
        <Pixel x={4} y={5} />
        <Pixel x={4} y={6} />
        <Pixel x={11} y={5} />
        <Pixel x={11} y={6} />
      </>
    ),
    mouth: (
      <>
        <Pixel x={7} y={9} />
        <Pixel x={8} y={9} />
        <Pixel x={7} y={10} />
        <Pixel x={8} y={10} />
      </>
    ),
  },
  angry: {
    eyes: (
      <>
        <Pixel x={3} y={5} />
        <Pixel x={4} y={6} />
        <Pixel x={11} y={6} />
        <Pixel x={12} y={5} />
      </>
    ),
    mouth: (
      <>
        <Pixel x={6} y={10} />
        <Pixel x={7} y={10} />
        <Pixel x={8} y={10} />
        <Pixel x={9} y={10} />
      </>
    ),
  },
  sleeping: {
    eyes: (
      <>
        <Pixel x={3} y={6} />
        <Pixel x={4} y={6} />
        <Pixel x={5} y={6} />
        <Pixel x={10} y={6} />
        <Pixel x={11} y={6} />
        <Pixel x={12} y={6} />
      </>
    ),
    mouth: (
      <>
        <Pixel x={7} y={10} />
        <Pixel x={8} y={10} />
      </>
    ),
  },
  dead: {
    eyes: (
      <>
        <Pixel x={3} y={5} />
        <Pixel x={5} y={5} />
        <Pixel x={4} y={6} />
        <Pixel x={3} y={7} />
        <Pixel x={5} y={7} />
        
        <Pixel x={10} y={5} />
        <Pixel x={12} y={5} />
        <Pixel x={11} y={6} />
        <Pixel x={10} y={7} />
        <Pixel x={12} y={7} />
      </>
    ),
    mouth: (
      <>
        <Pixel x={6} y={10} />
        <Pixel x={7} y={10} />
        <Pixel x={8} y={10} />
        <Pixel x={9} y={10} />
      </>
    ),
  },
  eating: {
    eyes: (
      <>
        <Pixel x={4} y={6} />
        <Pixel x={11} y={6} />
      </>
    ),
    mouth: (
      <>
        <Pixel x={6} y={9} />
        <Pixel x={7} y={9} />
        <Pixel x={8} y={9} />
        <Pixel x={9} y={9} />
        <Pixel x={6} y={11} />
        <Pixel x={7} y={11} />
        <Pixel x={8} y={11} />
        <Pixel x={9} y={11} />
      </>
    ),
  },
};

export default function TamagotchiDisplay({ expression, isTalking }: TamagotchiDisplayProps) {
  const currentExpression = EXPRESSIONS[expression] || EXPRESSIONS.neutral;

  const getAnimationClass = () => {
    if (expression === 'eating') return 'animate-pixel-eat';
    if (expression === 'surprised') return 'animate-pixel-shake';
    if (expression === 'sleeping') return '';
    return 'animate-pixel-bounce';
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#9ea786] overflow-hidden border-4 border-[#8b9672] shadow-inner">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
          backgroundSize: '4px 4px' 
        }} 
      />

      <div
        className={clsx("relative w-32 h-32", getAnimationClass())}
      >
        <svg
          viewBox="0 0 16 16"
          className="w-full h-full drop-shadow-md"
          shapeRendering="crispEdges" // Crucial for pixel art look
        >
          {/* Body */}
          <rect x="2" y="4" width="12" height="9" fill="black" opacity="0.1" /> {/* Shadow */}
          <path
            d="M4 2 h8 v1 h1 v1 h1 v8 h-1 v1 h-1 v1 h-8 v-1 h-1 v-1 h-1 v-8 h1 v-1 h1 z"
            fill="black"
          />
          <path
            d="M4 3 h8 v1 h1 v8 h-1 v1 h-8 v-1 h-1 v-8 h1 z"
            fill="white" // Or transparent if we want outline only, but white body is classic
          />

          {/* Face */}
          <g fill="black">
            {currentExpression.eyes}
            {isTalking && expression !== "sleeping" ? (
              <g className="animate-pulse">
                {currentExpression.mouth}
              </g>
            ) : (
              currentExpression.mouth
            )}
          </g>

          {/* Blush for happy */}
          {expression === "happy" && (
            <>
              <Pixel x={2} y={8} color="#ffaaaa" />
              <Pixel x={13} y={8} color="#ffaaaa" />
            </>
          )}

          {/* Zzz for sleeping */}
          {expression === "sleeping" && (
            <g className="animate-bounce" style={{ animationDuration: '2s' }}>
              <text x="10" y="4" fontSize="3" fontFamily="monospace" fill="black">Z</text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
