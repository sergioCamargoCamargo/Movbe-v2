'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

export default function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
  showValue = false,
  className = '',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating)
    }
  }

  const handleStarHover = (starRating: number) => {
    if (!readonly) {
      setHoverRating(starRating)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }

  const getStarFill = (starIndex: number) => {
    const currentRating = hoverRating || rating

    if (starIndex <= currentRating) {
      return 'fill-yellow-400 text-yellow-400'
    } else if (starIndex - 0.5 <= currentRating) {
      return 'fill-yellow-200 text-yellow-400'
    } else {
      return 'fill-gray-200 text-gray-200'
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className='flex items-center gap-0.5' onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map(starIndex => (
          <button
            key={starIndex}
            type='button'
            className={`transition-colors ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } ${sizeClasses[size]}`}
            onClick={() => handleStarClick(starIndex)}
            onMouseEnter={() => handleStarHover(starIndex)}
            disabled={readonly}
          >
            <Star className={`${sizeClasses[size]} transition-all ${getStarFill(starIndex)}`} />
          </button>
        ))}
      </div>

      {showValue && (
        <span className='text-sm text-muted-foreground ml-1'>
          {rating > 0 ? rating.toFixed(1) : 'Sin calificar'}
        </span>
      )}
    </div>
  )
}
