import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PhotoItem, PhotoState } from '../types/photo';

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
    return saved ? JSON.parse(saved) : null;
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
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartTime = useRef(0);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // 检测移动端和容器大小
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
        setIsMobile(window.innerWidth < 768);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // 延迟初始化，确保容器已渲染
    const timer = setTimeout(() => {
      updateSize();
      setIsLoaded(true);
    }, 100);

    return () => {
      window.removeEventListener('resize', updateSize);
      clearTimeout(timer);
    };
  }, []);

  // 初始化照片状态
  useEffect(() => {
    if (!isLoaded) return;

    const initialStates = new Map<string, PhotoState>();
    photos.forEach((photo, index) => {
      const savedState = loadStateFromStorage(photo.id);
      initialStates.set(photo.id, savedState || generateRandomPosition(index, photos.length, containerSize.width, containerSize.height, isMobile));
    });
    setPhotoStates(initialStates);
  }, [photos, isLoaded, containerSize, isMobile]);

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

  // 计算卡片尺寸 - 更大图片
  const cardWidth = useMemo(() => isMobile ? 220 : 360, [isMobile]);

  if (!isLoaded) {
    return <div ref={containerRef} className="w-full h-full" />;
  }

  return (
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
            cardWidth={cardWidth}
            containerCenterX={containerSize.width / 2}
            containerCenterY={containerSize.height / 2}
            onDragStart={(x, y) => handleDragStart(photo.id, x, y)}
            onDragEnd={(x, y, rotation) => updatePhotoPosition(photo.id, x, y, rotation)}
            onPointerUp={(x, y) => handlePointerUp(photo, x, y)}
          />
        );
      })}

      {/* 放大预览遮罩 */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
            style={{
              backdropFilter: 'blur(10px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
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
                maxWidth: isMobile ? '90vw' : '70vw',
                maxHeight: isMobile ? '70vh' : '80vh',
              }}
            >
              {/* 拍立得相框 - 无底部留白 */}
              <div
                className="bg-white p-2 rounded-sm shadow-2xl"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
              >
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.alt}
                  className="w-full h-auto object-contain pointer-events-none"
                  style={{
                    imageRendering: 'high-quality',
                    maxHeight: isMobile ? '70vh' : '80vh',
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 单个照片卡片组件
interface PhotoCardProps {
  photo: PhotoItem;
  state: PhotoState;
  cardWidth: number;
  containerCenterX: number;
  containerCenterY: number;
  onDragStart: (clientX: number, clientY: number) => void;
  onDragEnd: (x: number, y: number, rotation: number) => void;
  onPointerUp: (clientX: number, clientY: number) => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  state,
  cardWidth,
  containerCenterX,
  containerCenterY,
  onDragStart,
  onDragEnd,
  onPointerUp,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: state.x, y: state.y });
  const [isLifted, setIsLifted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(Date.now());

  // 同步外部状态
  useEffect(() => {
    setPosition({ x: state.x, y: state.y });
  }, [state.x, state.y]);

  // 计算实际像素位置（相对于容器左上角）
  // 移动端垂直居中调整：小卡片（移动端）向下偏移更多，确保图片在可视区域内
  const verticalOffset = cardWidth < 250 ? cardWidth * 0.6 : 100;
  const pixelX = containerCenterX + position.x - cardWidth / 2;
  const pixelY = containerCenterY + position.y - verticalOffset;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    setIsDragging(true);
    setIsLifted(true);
    onDragStart(e.clientX, e.clientY);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialPosX = position.x;
    const initialPosY = position.y;

    // 重置速度追踪
    velocityRef.current = { x: 0, y: 0 };
    lastPosRef.current = { x: startX, y: startY };
    lastTimeRef.current = Date.now();

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTimeRef.current;

      // 计算速度（用于惯性）
      if (deltaTime > 0) {
        velocityRef.current = {
          x: (moveEvent.clientX - lastPosRef.current.x) / deltaTime,
          y: (moveEvent.clientY - lastPosRef.current.y) / deltaTime,
        };
      }

      lastPosRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
      lastTimeRef.current = currentTime;

      // 直接更新位置，无延迟
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      setPosition({
        x: initialPosX + deltaX,
        y: initialPosY + deltaY,
      });
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      setIsDragging(false);
      setIsLifted(false);

      // 计算当前位置（相对于初始位置的偏移）
      const deltaX = upEvent.clientX - startX;
      const deltaY = upEvent.clientY - startY;
      const finalX = initialPosX + deltaX;
      const finalY = initialPosY + deltaY;

      // 更新位置并保存
      setPosition({ x: finalX, y: finalY });
      onDragEnd(finalX, finalY, state.rotation);
      onPointerUp(upEvent.clientX, upEvent.clientY);

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        x: pixelX,
        y: pixelY,
        rotate: state.rotation,
        scale: isLifted ? 1.08 : 1,
        opacity: 1,
        zIndex: isLifted ? 1000 : state.zIndex,
      }}
      transition={{
        type: 'spring',
        stiffness: isDragging ? 1200 : 500,
        damping: isDragging ? 35 : 40,
        mass: 1,
        scale: { duration: 0.12 },
        zIndex: { duration: 0 },
      }}
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
            src={photo.src}
            alt={photo.alt}
            className="w-full h-auto object-cover pointer-events-none"
            style={{
              imageRendering: 'high-quality',
            }}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PhotoWall;
