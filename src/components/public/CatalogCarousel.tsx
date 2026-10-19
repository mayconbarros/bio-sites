import React, { useState, useEffect, useRef } from 'react';
import { CatalogSection, CatalogItem, isItemVideo } from '../../types';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CatalogCarouselProps {
  catalog: CatalogSection;
  autoplay?: boolean;
  intervalSeconds?: number;
}

export const CatalogCarousel: React.FC<CatalogCarouselProps> = ({
  catalog,
  autoplay = true,
  intervalSeconds = 5,
}) => {
  const activeItems = (catalog.items || []).filter(item => item.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number>(0);
  const dragDeltaX = useRef<number>(0);

  // Keep index within bounds if items change
  useEffect(() => {
    if (currentIndex >= activeItems.length && activeItems.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeItems.length, currentIndex]);

  // Autoplay timer
  useEffect(() => {
    if (!autoplay || activeItems.length <= 1) return;

    const delayMs = Math.max(1000, (intervalSeconds || 5) * 1000);
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeItems.length);
    }, delayMs);

    return () => clearInterval(timer);
  }, [autoplay, intervalSeconds, activeItems.length, currentIndex]);

  if (activeItems.length === 0) {
    return null;
  }

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + activeItems.length) % activeItems.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % activeItems.length);
  };

  // Touch and Drag handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeItems.length <= 1) return;
    dragStartX.current = e.touches[0].clientX;
    dragDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (activeItems.length <= 1) return;
    dragDeltaX.current = e.touches[0].clientX - dragStartX.current;
  };

  const handleTouchEnd = () => {
    if (activeItems.length <= 1) return;
    if (dragDeltaX.current < -35) {
      handleNext();
    } else if (dragDeltaX.current > 35) {
      handlePrev();
    }
    dragDeltaX.current = 0;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeItems.length <= 1) return;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragDeltaX.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || activeItems.length <= 1) return;
    dragDeltaX.current = e.clientX - dragStartX.current;
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragDeltaX.current < -35) {
      handleNext();
    } else if (dragDeltaX.current > 35) {
      handlePrev();
    }
    dragDeltaX.current = 0;
  };

  const currentItem = activeItems[currentIndex] || activeItems[0];
  const isMultiple = activeItems.length > 1;

  // Aspect ratio class
  const getAspectClass = (item: CatalogItem) => {
    switch (item.aspectRatio) {
      case '1:1':
        return 'aspect-square';
      case '4:5':
        return 'aspect-[4/5]';
      case '9:16':
        return 'aspect-[9/16]';
      case '16:9':
      default:
        return 'aspect-[16/9]';
    }
  };

  return (
    <div 
      className="group relative bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden select-none transition-all duration-200"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* Top Cabedal: # CATÁLOGO com setinhas pra cima e pra baixo (Oculto por padrão, visível suavemente apenas no hover) */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300">
        <span className="px-2.5 py-0.5 rounded-md bg-[#ff2a85] text-white text-[10px] font-black tracking-wider uppercase shadow-md">
          # CATÁLOGO
        </span>
        <button
          type="button"
          onClick={handlePrev}
          className="w-5 h-5 rounded-md bg-[#ff2a85] hover:bg-[#e02475] active:scale-95 text-white flex items-center justify-center transition cursor-pointer shadow-md"
          title="Slide anterior"
        >
          <ChevronUp className="w-3 h-3 stroke-[3]" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="w-5 h-5 rounded-md bg-[#ff2a85] hover:bg-[#e02475] active:scale-95 text-white flex items-center justify-center transition cursor-pointer shadow-md"
          title="Próximo slide"
        >
          <ChevronDown className="w-3 h-3 stroke-[3]" />
        </button>
      </div>

      {/* 2. Área de Mídia (Topo): Full-bleed colada nas bordas superior, esquerda e direita sem padding/margem */}
      <div className={`w-full m-0 p-0 relative overflow-hidden ${getAspectClass(currentItem)}`}>
        {isItemVideo(currentItem) ? (
          <video
            key={currentItem.id + '-' + currentItem.imageUrl}
            src={currentItem.imageUrl}
            autoPlay
            muted
            loop
            playsInline
            className={`w-full h-full transition-opacity duration-300 block ${
              currentItem.fit === 'contain' ? 'object-contain bg-neutral-900' : 'object-cover'
            }`}
          />
        ) : (
          <img
            key={currentItem.id + '-' + currentItem.imageUrl}
            src={currentItem.imageUrl}
            alt={currentItem.title || catalog.title}
            className={`w-full h-full transition-opacity duration-300 block ${
              currentItem.fit === 'contain' ? 'object-contain bg-neutral-900' : 'object-cover'
            }`}
            draggable={false}
          />
        )}
      </div>

      {/* 3. Área de Conteúdo (Textos e Botão): Padding aplicado apenas nessa div inferior se houver conteúdo */}
      {(currentItem.title || currentItem.description || currentItem.buttonText?.trim()) ? (
        <div className="p-4 space-y-1.5">
          {currentItem.title ? (
            <h4 className="text-sm font-bold text-neutral-900 tracking-tight leading-snug">
              {currentItem.title}
            </h4>
          ) : null}

          {currentItem.description ? (
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">
              {currentItem.description}
            </p>
          ) : null}

          {/* Botão de acesso em rosa vibrante (#ff2a85) com alinhamento — só aparece se o texto do botão for preenchido */}
          {currentItem.buttonText?.trim() ? (
            <div className={`pt-2 flex ${
              currentItem.buttonAlign === 'center' ? 'justify-center' :
              currentItem.buttonAlign === 'right' ? 'justify-end' : 'justify-start'
            }`}>
              <a
                href={currentItem.url || '#'}
                target={currentItem.url ? '_blank' : undefined}
                rel="noreferrer"
                onClick={(e) => {
                  if (!currentItem.url) e.preventDefault();
                }}
                className="px-4 py-1.5 rounded-lg bg-[#ff2a85] hover:bg-[#e02475] active:scale-95 text-white text-xs font-bold transition shadow-xs inline-flex items-center justify-center cursor-pointer"
              >
                {currentItem.buttonText.trim()}
              </a>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Paginação (dots/pílulas): Visível se houver 2 ou mais itens */}
      {isMultiple && (
        <div className="flex items-center justify-center gap-1.5 pb-3.5 pt-0">
          {activeItems.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx 
                  ? 'w-8 bg-[#ff2a85]' 
                  : 'w-2.5 bg-neutral-200 hover:bg-neutral-300'
              }`}
              title={`Ir para o slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
