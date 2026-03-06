import React from "react";
import { motion } from "framer-motion";

interface MushroomPetProps {
  expression: "happy" | "sad" | "neutral" | "sleeping" | "eating" | "surprised" | "angry" | "dead";
}

export default function MushroomPet({ expression }: MushroomPetProps) {
  // Define colors based on expression
  const capColor = expression === "angry" ? "#8b4513" : expression === "sad" ? "#708090" : "#e63946";
  const spotColor = expression === "angry" ? "#5d2e0a" : "#f1faee";
  
  // Eye positions
  const eyeY = expression === "sleeping" ? "65%" : "60%";
  const eyeScale = expression === "sleeping" ? "scaleY(0.2)" : "scaleY(1)";

  return (
    <motion.div 
      className="w-full h-full flex items-center justify-center"
      animate={{ y: expression === "sleeping" ? 0 : [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Stem */}
        <path d="M40 60 Q40 90 45 95 L55 95 Q60 90 60 60 Z" fill="#fdf6e3" stroke="#d6ccc2" strokeWidth="2" />
        
        {/* Cap */}
        <path d="M20 60 Q20 20 50 20 Q80 20 80 60 Z" fill={capColor} stroke="#5d2e0a" strokeWidth="2" />
        
        {/* Spots */}
        {expression !== "angry" && (
          <>
            <circle cx="35" cy="35" r="5" fill={spotColor} />
            <circle cx="65" cy="35" r="5" fill={spotColor} />
            <circle cx="50" cy="25" r="6" fill={spotColor} />
          </>
        )}

        {/* Eyes */}
        <g transform={`translate(0, 0)`}>
          <ellipse cx="45" cy={eyeY} rx="3" ry="4" fill="#333" transform={eyeScale} />
          <ellipse cx="55" cy={eyeY} rx="3" ry="4" fill="#333" transform={eyeScale} />
        </g>

        {/* Mouth */}
        {expression === "happy" && <path d="M45 75 Q50 80 55 75" fill="none" stroke="#333" strokeWidth="2" />}
        {expression === "sad" && <path d="M45 80 Q50 75 55 80" fill="none" stroke="#333" strokeWidth="2" />}
        {expression === "eating" && <circle cx="50" cy="78" r="3" fill="#333" />}
        {expression === "dead" && <path d="M43 75 L47 79 M47 75 L43 79 M53 75 L57 79 M57 75 L53 79" stroke="#333" strokeWidth="2" />}
      </svg>
    </motion.div>
  );
}
