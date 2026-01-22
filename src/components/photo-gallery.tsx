import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';

interface PhotoGalleryProps {
  images: string[];
  alt: string;
  className?: string;
  showThumbnails?: boolean;
  showCounter?: boolean;
  enableLightbox?: boolean;
  aspectRatio?: 'auto' | 'square' | '16/9' | '4/3';
}

export function PhotoGallery({
  images,
  alt,
  className = '',
  showThumbnails = true,
  showCounter = true,
  enableLightbox = true,
  aspectRatio = 'auto'
}: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLightboxFullscreen, setIsLightboxFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const imageRef = useRef<HTMLImageElement>(null);
  
  const minSwipeDistance = 50;

  // If no images provided, show default placeholder
  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
            <ZoomIn className="h-8 w-8 text-gray-500" />
          </div>
          <p className="text-gray-500">No images available</p>
        </div>
      </div>
    );
  }

  // Navigation functions
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  }, [images.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            goToPrevious();
            break;
          case 'ArrowRight':
            e.preventDefault();
            goToNext();
            break;
          case 'Escape':
            setIsLightboxOpen(false);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, goToPrevious, goToNext]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Image loading handler
  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set([...Array.from(prev), index]));
    if (index === currentIndex) {
      setIsLoading(false);
    }
  };

  // Update loading state when current image changes
  useEffect(() => {
    if (Array.from(loadedImages).includes(currentIndex)) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [currentIndex, loadedImages]);

  // Get aspect ratio class
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case '16/9':
        return 'aspect-video';
      case '4/3':
        return 'aspect-[4/3]';
      default:
        return '';
    }
  };

  const openLightbox = () => {
    if (enableLightbox) {
      setIsLightboxOpen(true);
    }
  };

  return (
    <div className={`photo-gallery ${className}`} data-testid="photo-gallery">
      {/* Main Image Display */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden group">
        <div className={`relative ${getAspectRatioClass()}`}>
          {/* Loading skeleton */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
          )}

          {/* Main Image */}
          <div 
            className="relative w-full h-full cursor-pointer"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={openLightbox}
            data-testid="main-image-container"
          >
            <img
              ref={imageRef}
              src={images[currentIndex]}
              alt={`${alt} - Image ${currentIndex + 1} of ${images.length}`}
              className={`w-full h-full ${aspectRatio === 'auto' ? 'object-contain' : 'object-cover'} transition-opacity duration-300`}
              onLoad={() => handleImageLoad(currentIndex)}
              data-testid={`image-${currentIndex}`}
            />

            {/* Zoom indicator overlay */}
            {enableLightbox && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-3">
                  <Maximize2 className="h-6 w-6 text-gray-700" />
                </div>
              </div>
            )}

            {/* Navigation arrows - only show if more than 1 image */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 h-10 w-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  data-testid="button-previous"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 h-10 w-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  data-testid="button-next"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Image Counter */}
            {showCounter && images.length > 1 && (
              <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium" data-testid="image-counter">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>

        {/* Dot indicators for mobile */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 md:hidden">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(index);
                }}
                data-testid={`dot-indicator-${index}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {showThumbnails && images.length > 1 && (
        <div className="mt-4 hidden md:block">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                className={`flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-primary shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => goToSlide(index)}
                data-testid={`thumbnail-${index}`}
              >
                <img
                  src={image}
                  alt={`${alt} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onLoad={() => handleImageLoad(index)}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {enableLightbox && (
        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent 
            className={`max-w-none w-full h-full m-0 p-0 bg-black border-0 ${
              isLightboxFullscreen ? 'rounded-none' : 'max-w-7xl max-h-[90vh] rounded-lg'
            }`}
            data-testid="lightbox-dialog"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Lightbox Image */}
              <img
                src={images[currentIndex]}
                alt={`${alt} - Image ${currentIndex + 1} of ${images.length}`}
                className="max-w-full max-h-full object-contain"
                data-testid="lightbox-image"
              />

              {/* Lightbox Controls */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full h-10 w-10 p-0"
                  onClick={() => setIsLightboxFullscreen(!isLightboxFullscreen)}
                  data-testid="button-fullscreen-toggle"
                >
                  {isLightboxFullscreen ? (
                    <Minimize2 className="h-5 w-5" />
                  ) : (
                    <Maximize2 className="h-5 w-5" />
                  )}
                </Button>
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full h-10 w-10 p-0"
                    data-testid="button-close-lightbox"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </DialogClose>
              </div>

              {/* Lightbox Navigation */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full h-12 w-12 p-0"
                    onClick={goToPrevious}
                    data-testid="lightbox-button-previous"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full h-12 w-12 p-0"
                    onClick={goToNext}
                    data-testid="lightbox-button-next"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Lightbox Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm font-medium" data-testid="lightbox-counter">
                  {currentIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}