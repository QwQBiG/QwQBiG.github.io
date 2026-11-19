import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
import type { PhotoItem, PhotoState } from '../../types/photo';
import {
  desktopPhotoWidth, fitPhotoPosition, listenForPointerDrag, photoAnchorY,
  photoFrameHeightRatio, photoPositionBounds, photoPreviewSize, photoWallCardWidth, readInitialPhotoPosition, resolvePhotoWallSize, whenPhotoSettles,
} from '../../utils/photo-wall';

interface PhotoWallProps {
  photos: PhotoItem[];
}

// 保存状态到 localStorage
const saveStateToStorage = (photoId: string, state: PhotoState) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`photo-wall-${photoId}`, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save photo state:', e);
  }
};

export const PhotoWall: React.FC<PhotoWallProps> = ({ photos }) => {
  const [photoStates, setPhotoStates] = useState<Map<string, PhotoState>>(new Map());
  const [selectedPhoto, setSelectedPhoto] = useState<{ photo: PhotoItem; thumbnail: string } | null>(null);
  const [highestZIndex, setHighestZIndex] = useState(photos.length);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600, baseWidth: desktopPhotoWidth });
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartTime = useRef(0);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Measure once to restore the wall; cards can take over independently as their images decode.
  useEffect(() => {
    const measureContainer = () => {
      const container = containerRef.current;
      const rect = container?.getBoundingClientRect();
      const mainRect = !rect || rect.width <= 0 || rect.height <= 0
        ? container?.closest('main')?.getBoundingClientRect()
        : null;
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const nextSize = { ...resolvePhotoWallSize(rect, mainRect, viewport), baseWidth: photoWallCardWidth(viewport) };
      setContainerSize(nextSize);
      return nextSize;
    };

    const measuredSize = measureContainer();
    const initialStates = new Map<string, PhotoState>();
    let maxZIndex = photos.length;
    const fallbacks = containerRef.current?.closest('main')?.querySelector<HTMLElement>('[data-static-photo-wall]');
    photos.forEach((photo) => {
      const card = fallbacks?.querySelector<HTMLElement>(`[data-photo-id="${CSS.escape(photo.id)}"]`);
      if (!card) return;
      const cardWidth = measuredSize.baseWidth * (photo.scale ?? 1);
      const state = readInitialPhotoPosition(getComputedStyle(card), measuredSize, cardWidth);
      maxZIndex = Math.max(maxZIndex, state.zIndex);
      initialStates.set(photo.id, state);
    });
    setPhotoStates(initialStates);
    setHighestZIndex(maxZIndex);
    window.addEventListener('resize', measureContainer);
    return () => window.removeEventListener('resize', measureContainer);
  }, [photos]);

  // 提升层级
  const bringToFront = useCallback((photoId: string) => {
    setHighestZIndex((prev) => {
      const newZIndex = prev + 1;
      setPhotoStates((prevStates) => {
        const newStates = new Map(prevStates);
        const currentState = newStates.get(photoId);
        if (currentState) {
          newStates.set(photoId, { ...currentState, zIndex: newZIndex });
        }
        return newStates;
      });
      return newZIndex;
    });
  }, []);

  // 更新照片位置
  const updatePhotoPosition = useCallback((photoId: string, x: number, y: number, rotation: number) => {
    setPhotoStates((prevStates) => {
      const newStates = new Map(prevStates);
      const currentState = newStates.get(photoId);
      if (currentState) {
        const newState = { ...currentState, x, y, rotation };
        newStates.set(photoId, newState);
        saveStateToStorage(photoId, newState);
      }
      return newStates;
    });
  }, []);

  // 处理拖拽开始
  const handleDragStart = (photoId: string, clientX: number, clientY: number) => {
    dragStartTime.current = Date.now();
    dragStartPos.current = { x: clientX, y: clientY };
    bringToFront(photoId);
  };

  // 处理点击（区分拖拽和点击）
  const handlePointerUp = (photo: PhotoItem, clientX: number, clientY: number, thumbnail: string) => {
    const dragDuration = Date.now() - dragStartTime.current;
    const dragDistance = Math.sqrt(
      Math.pow(clientX - dragStartPos.current.x, 2) +
      Math.pow(clientY - dragStartPos.current.y, 2)
    );
    // 如果拖拽时间小于 200ms 且移动距离小于 10px，认为是点击
    if (dragDuration < 200 && dragDistance < 10) {
      setSelectedPhoto({ photo, thumbnail });
    }
  };

  // 关闭放大视图
  const handleClosePreview = () => {
    setSelectedPhoto(null);
  };

  // 静态首屏和 React 使用同一套断点，避免接管时卡片尺寸改变。
  const isMobile = containerSize.width < 768;

  if (!photoStates.size) {
    return <div ref={containerRef} className="w-full h-full" />;
  }

  return (
    <LazyMotion features={domAnimation}>
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-visible"
      style={{ perspective: '1000px' }}
    >
      {/* 照片卡片 */}
      {photos.map((photo) => {
        const state = photoStates.get(photo.id);
        if (!state) return null;

        return (
          <PhotoCard
            key={photo.id}
            photo={photo}
            state={state}
            cardWidth={containerSize.baseWidth * (photo.scale ?? 1)}
            wall={containerSize}
            compact={containerSize.baseWidth < desktopPhotoWidth}
            onDragStart={(x, y) => handleDragStart(photo.id, x, y)}
            onDragEnd={(x, y, rotation) => updatePhotoPosition(photo.id, x, y, rotation)}
            onPointerUp={(x, y, thumbnail) => handlePointerUp(photo, x, y, thumbnail)}
          />
        );
      })}

      {/* 挂到 body，避免照片墙 perspective 改变 fixed 定位参照。 */}
      {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {selectedPhoto && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              backdropFilter: 'blur(10px)',
            }}
          >
            <m.div
              initial={false}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              className="relative cursor-pointer"
              onClick={handleClosePreview}
              style={{
                maxWidth: isMobile ? '95vw' : '85vw',
                maxHeight: isMobile ? '80vh' : '90vh',
              }}
            >
              <PreviewImage key={selectedPhoto.photo.id} {...selectedPhoto} mobile={isMobile} />
            </m.div>
          </m.div>
        )}
      </AnimatePresence>,
      document.body)}
    </div>
    </LazyMotion>
  );
};

function PreviewImage({ photo, thumbnail, mobile }: { photo: PhotoItem; thumbnail: string; mobile: boolean }) {
  const [sharp, setSharp] = useState(false);
  const size = photoPreviewSize(photo, mobile);
  const width = photo.previewWidth ?? photo.width;
  const height = photo.previewHeight ?? photo.height;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size }}>
      <img
        src={thumbnail}
        width={width}
        height={height}
        alt={photo.alt}
        className="block w-full h-auto object-contain pointer-events-none"
        style={{ aspectRatio: width && height ? `${width} / ${height}` : undefined, opacity: sharp ? 0 : 1 }}
      />
      <img
        sizes={size}
        srcSet={photo.previewSrcset}
        src={photo.preview ?? photo.src}
        alt=""
        aria-hidden="true"
        onLoad={() => setSharp(true)}
        onError={() => setSharp(false)}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{ opacity: sharp ? 1 : 0 }}
      />
    </div>
  );
}

// 单个照片卡片组件
interface PhotoCardProps {
  photo: PhotoItem;
  state: PhotoState;
  cardWidth: number;
  wall: { width: number; height: number };
  compact: boolean;
  onDragStart: (clientX: number, clientY: number) => void;
  onDragEnd: (x: number, y: number, rotation: number) => void;
  onPointerUp: (clientX: number, clientY: number, thumbnail: string) => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  state,
  cardWidth,
  wall,
  compact,
  onDragStart,
  onDragEnd,
  onPointerUp,
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [isLifted, setIsLifted] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const bounds = useMemo(() =>
    photoPositionBounds(wall, cardWidth, photoFrameHeightRatio(photo), state.rotation),
    [wall.width, wall.height, cardWidth, photo, state.rotation]);
  const boundsRef = useRef(compact ? bounds : null);
  boundsRef.current = compact ? bounds : null;
  const dragCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setHasMounted(true);
    return () => dragCleanupRef.current?.();
  }, []);

  useEffect(() => {
    const image = imageRef.current;
    const card = image?.closest<HTMLElement>('.photo-card');
    if (!image || !card) return;
    const fallback = card.closest('main')?.querySelector<HTMLElement>(
      `[data-static-photo-wall] [data-photo-id="${CSS.escape(photo.id)}"]`,
    );
    const stop = whenPhotoSettles(image, () => {
      card.dataset.photoReady = '';
      if (fallback) fallback.hidden = true;
    });
    return () => {
      stop();
      delete card.dataset.photoReady;
      if (fallback) fallback.hidden = false;
    };
  }, [photo.id]);

  // Project the remembered point into the current wall on every rotation.
  const requested = dragPosition ?? state;
  // Until dragged, desktop cards follow the same viewport clamps as the static wall.
  const position = compact || (!hasMoved && !dragPosition) ? fitPhotoPosition(requested, bounds) : requested;
  const pixelX = wall.width / 2 + position.x - cardWidth / 2;
  const pixelY = wall.height / 2 + position.y - photoAnchorY(cardWidth);
  const transition = hasMounted
    ? { type: 'spring' as const, stiffness: isDragging ? 1200 : 500, damping: isDragging ? 35 : 40, mass: 1, scale: { duration: 0.12 }, zIndex: { duration: 0 } }
    : { duration: 0 };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!e.isPrimary || e.button !== 0) return;
    dragCleanupRef.current?.();
    e.preventDefault();
    const card = e.currentTarget;
    const pointerId = e.pointerId;
    card.setPointerCapture(pointerId);

    setIsDragging(true);
    setIsLifted(true);
    onDragStart(e.clientX, e.clientY);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialPosX = position.x;
    const initialPosY = position.y;

    let latestPosition = { x: initialPosX, y: initialPosY };
    const fit = (point: { x: number; y: number }) => boundsRef.current
      ? fitPhotoPosition(point, boundsRef.current) : point;
    const finishPosition = (point: { x: number; y: number }) => {
      const moved = point.x !== initialPosX || point.y !== initialPosY;
      const final = moved ? fit(point) : state;
      if (moved) setHasMoved(true);
      setDragPosition(null);
      onDragEnd(final.x, final.y, state.rotation);
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      // 直接更新位置，无延迟
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      latestPosition = fit({ x: initialPosX + deltaX, y: initialPosY + deltaY });
      setDragPosition(latestPosition);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      setIsDragging(false);
      setIsLifted(false);

      // 计算当前位置（相对于初始位置的偏移）
      const deltaX = upEvent.clientX - startX;
      const deltaY = upEvent.clientY - startY;
      finishPosition({ x: initialPosX + deltaX, y: initialPosY + deltaY });
      onPointerUp(upEvent.clientX, upEvent.clientY, imageRef.current?.currentSrc || photo.src);

      cleanup();
    };

    const handlePointerCancel = () => {
      setIsDragging(false);
      setIsLifted(false);
      finishPosition(latestPosition);
      cleanup();
    };
    const stopListening = listenForPointerDrag(window, pointerId, {
      onMove: handlePointerMove,
      onEnd: handlePointerUp,
      onCancel: handlePointerCancel,
    });
    const cleanup = () => {
      stopListening();
      if (card.hasPointerCapture(pointerId)) card.releasePointerCapture(pointerId);
      if (dragCleanupRef.current === cleanup) dragCleanupRef.current = null;
    };
    dragCleanupRef.current = cleanup;
  };

  return (
    <m.div
      initial={false}
      animate={{
        x: pixelX,
        y: pixelY,
        rotate: state.rotation,
        scale: isLifted ? 1.08 : 1,
        opacity: 1,
        zIndex: isLifted ? 1000 : state.zIndex,
      }}
      transition={transition}
      onPointerDown={handlePointerDown}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: cardWidth,
        cursor: isDragging ? 'grabbing' : 'grab',
        willChange: 'transform',
        touchAction: 'none',
        userSelect: 'none',
      }}
      whileHover={{
        scale: 1.03,
        rotate: state.rotation + (Math.random() - 0.5) * 2,
        transition: { duration: 0.15, ease: 'easeOut' },
      }}
      data-photo-id={photo.id}
      className="photo-card group"
    >
      {/* 拍立得相框样式 - 全图片无文字 */}
      <div
        className="bg-white p-1 rounded-sm select-none"
        style={{
          boxShadow: isLifted
            ? '0 30px 60px -12px rgba(0, 0, 0, 0.5), 0 15px 25px -8px rgba(0, 0, 0, 0.3)'
            : '0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
          transform: isLifted ? 'translateY(-8px)' : 'translateY(0)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        }}
      >
        <div className="relative overflow-hidden">
          <img
            ref={imageRef}
            sizes={photo.sizes}
            srcSet={photo.srcset}
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            className="w-full h-auto object-cover pointer-events-none"
            style={{
              imageRendering: 'auto',
            }}
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </div>
      </div>
    </m.div>
  );
};

export default PhotoWall;
