import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
import type { PhotoItem, PhotoState } from '../../types/photo';
import {
  desktopPhotoWidth, fitPhotoPosition, listenForPointerDrag, photoAnchorY,
  photoFrameHeightRatio, photoPositionBounds, photoWallCardWidth, preloadPhotos, resolvePhotoWallSize,
} from '../../utils/photo-wall';

interface PhotoWallProps {
  photos: PhotoItem[];
}

// 生成随机散落位置 - 相对于容器中心
const generateRandomPosition = (index: number, total: number, containerWidth: number, containerHeight: number, isMobile: boolean): PhotoState => {
  const angle = (index / total) * Math.PI * 2;

  // 移动端特殊处理：限制Y轴范围，防止图片超出屏幕
  const aspectRatio = containerHeight / containerWidth;
  const isNarrowScreen = isMobile && aspectRatio > 1.5; // 长宽比过大的屏幕

  // X轴范围
  const maxRadiusX = Math.min(containerWidth * 0.35, 350);
  const radiusX = maxRadiusX * (0.3 + Math.random() * 0.7);

  // Y轴范围：窄屏时限制更小，确保图片在可视区域内
  const yScale = isNarrowScreen ? 0.2 : (isMobile ? 0.3 : 0.4);
  const maxRadiusY = Math.min(containerHeight * yScale, isMobile ? 200 : 400);
  const radiusY = maxRadiusY * (0.3 + Math.random() * 0.7);

  // 移动端添加向下偏移，确保图片在屏幕中间偏下位置显示
  const yOffset = isMobile ? containerHeight * 0.05 : 0;

  return {
    x: Math.cos(angle) * radiusX,
    y: Math.sin(angle) * radiusY + yOffset,
    rotation: (Math.random() - 0.5) * 20, // 减小旋转角度
    zIndex: index,
  };
};

// 从 localStorage 读取状态
const loadStateFromStorage = (photoId: string): PhotoState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(`photo-wall-${photoId}`);
    const state = saved ? JSON.parse(saved) : null;
    if (!state || !Number.isFinite(state.x) || !Number.isFinite(state.y)) return null;
    return {
      x: state.x, y: state.y,
      rotation: Number.isFinite(state.rotation) ? state.rotation : 0,
      zIndex: Number.isFinite(state.zIndex) ? state.zIndex : Number(photoId),
    };
  } catch {
    return null;
  }
};

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
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [highestZIndex, setHighestZIndex] = useState(photos.length);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600, baseWidth: desktopPhotoWidth });
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartTime = useRef(0);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // 先保留 Astro 输出的清晰静态照片墙；缩略图解码完成后再无缝接管交互。
  useEffect(() => {
    let cancelled = false;
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

    const updateSize = () => {
      measureContainer();
    };
    measureContainer();
    window.addEventListener('resize', updateSize);
    preloadPhotos(photos).then(() => {
      if (cancelled) return;
      const measuredSize = measureContainer();
      const initialStates = new Map<string, PhotoState>();
      let maxZIndex = photos.length;
      photos.forEach((photo, index) => {
        let savedState = loadStateFromStorage(photo.id);
        // Compact cards fit their remembered position when drawn. Keeping that
        // position lets a portrait arrangement return after a landscape reload.
        if (savedState && measuredSize.baseWidth === desktopPhotoWidth) {
          const cardWidth = desktopPhotoWidth * (photo.scale ?? 1);
          const bounds = photoPositionBounds(measuredSize, cardWidth, photoFrameHeightRatio(photo), savedState.rotation);
          savedState = { ...savedState, ...fitPhotoPosition(savedState, bounds) };
        }
        if (savedState) maxZIndex = Math.max(maxZIndex, savedState.zIndex);
        initialStates.set(
          photo.id,
          savedState || generateRandomPosition(
            index,
            photos.length,
            measuredSize.width,
            measuredSize.height,
            measuredSize.baseWidth < desktopPhotoWidth,
          ),
        );
      });
      setPhotoStates(initialStates);
      setHighestZIndex(maxZIndex);
      setIsLoaded(true);
    });

    return () => {
      cancelled = true;
      window.removeEventListener('resize', updateSize);
    };
  }, [photos]);
  // React 卡片与静态首屏位置准备好后再一次性切换，避免空墙或二次跳动。
  useEffect(() => {
    if (!isLoaded || photoStates.size !== photos.length) return;
    let secondFrame: number | undefined;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent('photo-wall-ready'));
      });
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) cancelAnimationFrame(secondFrame);
    };
  }, [isLoaded, photoStates.size, photos.length]);


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
  const handlePointerUp = (photo: PhotoItem, clientX: number, clientY: number) => {
    const dragDuration = Date.now() - dragStartTime.current;
    const dragDistance = Math.sqrt(
      Math.pow(clientX - dragStartPos.current.x, 2) +
      Math.pow(clientY - dragStartPos.current.y, 2)
    );
    // 如果拖拽时间小于 200ms 且移动距离小于 10px，认为是点击
    if (dragDuration < 200 && dragDistance < 10) {
      setSelectedPhoto(photo);
    }
  };

  // 关闭放大视图
  const handleClosePreview = () => {
    setSelectedPhoto(null);
  };

  // 静态首屏和 React 使用同一套断点，避免接管时卡片尺寸改变。
  const isMobile = containerSize.width < 768;

  if (!isLoaded) {
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
            onPointerUp={(x, y) => handlePointerUp(photo, x, y)}
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
              <div className="flex items-center justify-center">
                <img
                  src={selectedPhoto.preview ?? selectedPhoto.src}
                  alt={selectedPhoto.alt}
                  className="block max-w-full h-auto object-contain pointer-events-none"
                  style={{
                    imageRendering: 'auto',
                    maxHeight: isMobile ? '86vh' : '92vh',
                  }}
                />
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>,
      document.body)}
    </div>
    </LazyMotion>
  );
};

// 单个照片卡片组件
interface PhotoCardProps {
  photo: PhotoItem;
  state: PhotoState;
  cardWidth: number;
  wall: { width: number; height: number };
  compact: boolean;
  onDragStart: (clientX: number, clientY: number) => void;
  onDragEnd: (x: number, y: number, rotation: number) => void;
  onPointerUp: (clientX: number, clientY: number) => void;
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
  const [isDragging, setIsDragging] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [isLifted, setIsLifted] = useState(false);
  const bounds = useMemo(() => compact
    ? photoPositionBounds(wall, cardWidth, photoFrameHeightRatio(photo), state.rotation)
    : null, [compact, wall.width, wall.height, cardWidth, photo, state.rotation]);
  const boundsRef = useRef(bounds);
  boundsRef.current = bounds;
  const dragCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setHasMounted(true);
    return () => dragCleanupRef.current?.();
  }, []);

  // Project the remembered point into the current wall on every rotation.
  const requested = dragPosition ?? state;
  const position = bounds ? fitPhotoPosition(requested, bounds) : requested;
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
      const final = point.x === initialPosX && point.y === initialPosY ? state : fit(point);
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
      onPointerUp(upEvent.clientX, upEvent.clientY);

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
