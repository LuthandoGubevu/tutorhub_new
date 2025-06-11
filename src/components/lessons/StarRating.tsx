// src/components/lessons/StarRating.tsx
"use client";

import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  count?: number;
  value: number;
  onChange: (value: number) => void;
  size?: number;
  color?: string;
  hoverColor?: string;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  count = 5,
  value,
  onChange,
  size = 24,
  color = "text-gray-300",
  hoverColor = "text-yellow-400",
  className,
}) => {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);

  const stars = Array(count).fill(0);

  const handleClick = (newValue: number) => {
    onChange(newValue);
  };

  const handleMouseOver = (newHoverValue: number) => {
    setHoverValue(newHoverValue);
  };

  const handleMouseLeave = () => {
    setHoverValue(undefined);
  };

  return (
    <div className={cn("flex space-x-1", className)} onMouseLeave={handleMouseLeave}>
      {stars.map((_, index) => {
        const starValue = index + 1;
        const isFilled = (hoverValue || value) >= starValue;
        return (
          <Star
            key={index}
            size={size}
            className={cn(
              "cursor-pointer transition-colors",
              isFilled ? hoverColor : color,
              isFilled && value >= starValue && hoverColor, // Ensure selected stars remain colored
            )}
            fill={isFilled ? "currentColor" : "none"}
            onClick={() => handleClick(starValue)}
            onMouseOver={() => handleMouseOver(starValue)}
            aria-label={`Rate ${starValue} out of ${count} stars`}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
