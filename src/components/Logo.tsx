import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      {/* Outer Triangle */}
      <polygon 
        points="50,10 92,85 8,85" 
        stroke="#EAB308" 
        strokeWidth="6" 
        strokeLinejoin="round" 
      />
      
      {/* Inner Circles */}
      {/* Top Circle */}
      <circle 
        cx="50" 
        cy="42" 
        r="18" 
        stroke="#DC2626" 
        strokeWidth="3" 
      />
      
      {/* Bottom Left Circle */}
      <circle 
        cx="36" 
        cy="65" 
        r="18" 
        stroke="#DC2626" 
        strokeWidth="3" 
      />
      
      {/* Bottom Right Circle */}
      <circle 
        cx="64" 
        cy="65" 
        r="18" 
        stroke="#DC2626" 
        strokeWidth="3" 
      />
    </svg>
  );
}
