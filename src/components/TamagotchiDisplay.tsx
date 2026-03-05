import React from "react";
import MushroomPet from "./MushroomPet";

interface TamagotchiDisplayProps {
  expression: "happy" | "sad" | "neutral" | "sleeping" | "eating" | "surprised" | "angry" | "dead";
  isTalking: boolean;
}

export default function TamagotchiDisplay({ expression, isTalking }: TamagotchiDisplayProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#a8c69f] overflow-hidden border-4 border-[#8b9672] shadow-inner">
      {/* Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

      <div className="relative w-48 h-48">
        <MushroomPet expression={expression} />
      </div>
    </div>
  );
}
