'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PropertyIdImages } from '@/types/property'


interface PropertyGalleryProps {
  images: PropertyIdImages[];
  propertyName: string;
}

export default function PropertyGallery({ images, propertyName }: PropertyGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const fallbackImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=600&fit=crop'
  const allImageUrls: string[] = []
  
  if (images && images.length > 0) {
    images.forEach(imageObj => {
      if (imageObj.urlImages && imageObj.urlImages.length > 0) {
        allImageUrls.push(...imageObj.urlImages)
      };
    });
  };
  
  const hasImages = allImageUrls.length > 0
  
  if (!hasImages) {
    return (
      <div className="space-y-4">
        <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
          <Image
            src={fallbackImage}
            alt={propertyName}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-4 right-4 bg-background/80 px-3 py-1 rounded-full text-sm font-medium">
            No images available
          </div>
        </div>
      </div>
    )
  }

  const currentImage = allImageUrls[currentImageIndex]
  const totalImages = allImageUrls.length

  const goToPrevious = () => {
    if (currentImageIndex === 0) {
      setCurrentImageIndex(totalImages - 1) 
    } else {
      setCurrentImageIndex(currentImageIndex - 1)
    };
  };
  const goToNext = () => {
    if (currentImageIndex === totalImages - 1) {
      setCurrentImageIndex(0)
    } else {
      setCurrentImageIndex(currentImageIndex + 1)
    };
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden group">
        <Image
          src={currentImage}
          alt={`${propertyName} - Image ${currentImageIndex + 1}`}
          fill
          className="object-cover"
          priority
        />
        {totalImages > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="bg-background/80 hover:bg-background rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="bg-background/80 hover:bg-background rounded-full"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        )};

        <div className="absolute bottom-4 right-4 bg-background/80 px-3 py-1 rounded-full text-sm font-medium">
          {currentImageIndex + 1} / {totalImages}
        </div>
      </div>

      {totalImages > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {allImageUrls.map((url, index) => {
            const isSelected = index === currentImageIndex
            
            return (
              <button
                key={index}
                onClick={() => selectImage(index)}
                className={`relative w-full h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  isSelected
                    ? 'border-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Image
                  src={url}
                  alt={`${propertyName} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}