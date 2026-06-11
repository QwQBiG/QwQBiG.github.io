/* empty css                                 */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BR9bRUNn.mjs';
import 'piccolore';
import { $ as $$Layout, a as $$FloatingNavCard } from '../chunks/FloatingNavCard_eNI7wgnB.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
/* empty css                                   */
export { renderers } from '../renderers.mjs';

const generateRandomPosition = (index, total, containerWidth, containerHeight, isMobile) => {
  const angle = index / total * Math.PI * 2;
  const aspectRatio = containerHeight / containerWidth;
  const isNarrowScreen = isMobile && aspectRatio > 1.5;
  const maxRadiusX = Math.min(containerWidth * 0.35, 350);
  const radiusX = maxRadiusX * (0.3 + Math.random() * 0.7);
  const yScale = isNarrowScreen ? 0.2 : isMobile ? 0.3 : 0.4;
  const maxRadiusY = Math.min(containerHeight * yScale, isMobile ? 200 : 400);
  const radiusY = maxRadiusY * (0.3 + Math.random() * 0.7);
  const yOffset = isMobile ? containerHeight * 0.05 : 0;
  return {
    x: Math.cos(angle) * radiusX,
    y: Math.sin(angle) * radiusY + yOffset,
    rotation: (Math.random() - 0.5) * 20,
    // 减小旋转角度
    zIndex: index
  };
};
const loadStateFromStorage = (photoId) => {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(`photo-wall-${photoId}`);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};
const saveStateToStorage = (photoId, state) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`photo-wall-${photoId}`, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save photo state:", e);
  }
};
const PhotoWall = ({ photos }) => {
  const [photoStates, setPhotoStates] = useState(/* @__PURE__ */ new Map());
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [highestZIndex, setHighestZIndex] = useState(photos.length);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);
  const dragStartTime = useRef(0);
  const dragStartPos = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
        setIsMobile(window.innerWidth < 768);
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    const timer = setTimeout(() => {
      updateSize();
      setIsLoaded(true);
    }, 100);
    return () => {
      window.removeEventListener("resize", updateSize);
      clearTimeout(timer);
    };
  }, []);
  useEffect(() => {
    if (!isLoaded) return;
    const initialStates = /* @__PURE__ */ new Map();
    photos.forEach((photo, index) => {
      const savedState = loadStateFromStorage(photo.id);
      initialStates.set(photo.id, savedState || generateRandomPosition(index, photos.length, containerSize.width, containerSize.height, isMobile));
    });
    setPhotoStates(initialStates);
  }, [photos, isLoaded, containerSize, isMobile]);
  const bringToFront = useCallback((photoId) => {
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
  const updatePhotoPosition = useCallback((photoId, x, y, rotation) => {
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
  const handleDragStart = (photoId, clientX, clientY) => {
    dragStartTime.current = Date.now();
    dragStartPos.current = { x: clientX, y: clientY };
    bringToFront(photoId);
  };
  const handlePointerUp = (photo, clientX, clientY) => {
    const dragDuration = Date.now() - dragStartTime.current;
    const dragDistance = Math.sqrt(
      Math.pow(clientX - dragStartPos.current.x, 2) + Math.pow(clientY - dragStartPos.current.y, 2)
    );
    if (dragDuration < 200 && dragDistance < 10) {
      setSelectedPhoto(photo);
    }
  };
  const handleClosePreview = () => {
    setSelectedPhoto(null);
  };
  const cardWidth = useMemo(() => isMobile ? 220 : 360, [isMobile]);
  if (!isLoaded) {
    return /* @__PURE__ */ jsx("div", { ref: containerRef, className: "w-full h-full" });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: containerRef,
      className: "relative w-full h-full overflow-visible",
      style: { perspective: "1000px" },
      children: [
        photos.map((photo) => {
          const state = photoStates.get(photo.id);
          if (!state) return null;
          return /* @__PURE__ */ jsx(
            PhotoCard,
            {
              photo,
              state,
              cardWidth,
              containerCenterX: containerSize.width / 2,
              containerCenterY: containerSize.height / 2,
              onDragStart: (x, y) => handleDragStart(photo.id, x, y),
              onDragEnd: (x, y, rotation) => updatePhotoPosition(photo.id, x, y, rotation),
              onPointerUp: (x, y) => handlePointerUp(photo, x, y)
            },
            photo.id
          );
        }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: selectedPhoto && /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.3 },
            className: "fixed inset-0 z-50 flex items-start justify-center pt-[10vh]",
            style: {
              backdropFilter: "blur(10px)"
            },
            children: /* @__PURE__ */ jsx(
              motion.div,
              {
                initial: { scale: 0.8, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                exit: { scale: 0.8, opacity: 0 },
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                },
                className: "relative cursor-pointer",
                onClick: handleClosePreview,
                style: {
                  maxWidth: isMobile ? "90vw" : "70vw",
                  maxHeight: isMobile ? "70vh" : "80vh"
                },
                children: /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "bg-white p-2 rounded-sm shadow-2xl",
                    style: {
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                    },
                    children: /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: selectedPhoto.src,
                        alt: selectedPhoto.alt,
                        className: "w-full h-auto object-contain pointer-events-none",
                        style: {
                          imageRendering: "high-quality",
                          maxHeight: isMobile ? "70vh" : "80vh"
                        }
                      }
                    )
                  }
                )
              }
            )
          }
        ) })
      ]
    }
  );
};
const PhotoCard = ({
  photo,
  state,
  cardWidth,
  containerCenterX,
  containerCenterY,
  onDragStart,
  onDragEnd,
  onPointerUp
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: state.x, y: state.y });
  const [isLifted, setIsLifted] = useState(false);
  const cardRef = useRef(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(Date.now());
  useEffect(() => {
    setPosition({ x: state.x, y: state.y });
  }, [state.x, state.y]);
  const verticalOffset = cardWidth < 250 ? cardWidth * 0.6 : 100;
  const pixelX = containerCenterX + position.x - cardWidth / 2;
  const pixelY = containerCenterY + position.y - verticalOffset;
  const handlePointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setIsLifted(true);
    onDragStart(e.clientX, e.clientY);
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPosX = position.x;
    const initialPosY = position.y;
    velocityRef.current = { x: 0, y: 0 };
    lastPosRef.current = { x: startX, y: startY };
    lastTimeRef.current = Date.now();
    const handlePointerMove = (moveEvent) => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTimeRef.current;
      if (deltaTime > 0) {
        velocityRef.current = {
          x: (moveEvent.clientX - lastPosRef.current.x) / deltaTime,
          y: (moveEvent.clientY - lastPosRef.current.y) / deltaTime
        };
      }
      lastPosRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
      lastTimeRef.current = currentTime;
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      setPosition({
        x: initialPosX + deltaX,
        y: initialPosY + deltaY
      });
    };
    const handlePointerUp = (upEvent) => {
      setIsDragging(false);
      setIsLifted(false);
      const deltaX = upEvent.clientX - startX;
      const deltaY = upEvent.clientY - startY;
      const finalX = initialPosX + deltaX;
      const finalY = initialPosY + deltaY;
      setPosition({ x: finalX, y: finalY });
      onDragEnd(finalX, finalY, state.rotation);
      onPointerUp(upEvent.clientX, upEvent.clientY);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      ref: cardRef,
      initial: { scale: 0.8, opacity: 0 },
      animate: {
        x: pixelX,
        y: pixelY,
        rotate: state.rotation,
        scale: isLifted ? 1.08 : 1,
        opacity: 1,
        zIndex: isLifted ? 1e3 : state.zIndex
      },
      transition: {
        type: "spring",
        stiffness: isDragging ? 1200 : 500,
        damping: isDragging ? 35 : 40,
        mass: 1,
        scale: { duration: 0.12 },
        zIndex: { duration: 0 }
      },
      onPointerDown: handlePointerDown,
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: cardWidth,
        cursor: isDragging ? "grabbing" : "grab",
        willChange: "transform",
        touchAction: "none",
        userSelect: "none"
      },
      whileHover: {
        scale: 1.03,
        rotate: state.rotation + (Math.random() - 0.5) * 2,
        transition: { duration: 0.15, ease: "easeOut" }
      },
      className: "photo-card group",
      children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "bg-white p-1 rounded-sm select-none",
          style: {
            boxShadow: isLifted ? "0 30px 60px -12px rgba(0, 0, 0, 0.5), 0 15px 25px -8px rgba(0, 0, 0, 0.3)" : "0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
            transform: isLifted ? "translateY(-8px)" : "translateY(0)",
            transition: "box-shadow 0.2s ease, transform 0.2s ease"
          },
          children: /* @__PURE__ */ jsx("div", { className: "relative overflow-hidden", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: photo.src,
              alt: photo.alt,
              className: "w-full h-auto object-cover pointer-events-none",
              style: {
                imageRendering: "high-quality"
              },
              loading: "lazy",
              decoding: "async",
              draggable: false
            }
          ) })
        }
      )
    }
  );
};

const $$Gallery = createComponent(($$result, $$props, $$slots) => {
  const pageTitle = "\u753B\u5ECA - QwQBiG's World";
  const pageDescription = "3D \u6563\u843D\u7167\u7247\u5899 - \u62D6\u62FD\u63A2\u7D22\uFF0C\u70B9\u51FB\u67E5\u770B\u5927\u56FE";
  const photos = [
    {
      id: "1",
      src: "/images/2025-08.png",
      alt: "2025-08"
    },
    {
      id: "2",
      src: "/images/Kafka.png",
      alt: "Kafka"
    },
    {
      id: "3",
      src: "/images/hahaha.png",
      alt: "Hahaha"
    }
  ];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": pageTitle, "description": pageDescription, "data-astro-cid-sahthylw": true }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "FloatingNavCard", $$FloatingNavCard, { "data-astro-cid-sahthylw": true })} ${maybeRenderHead()}<main class="flex-1 h-screen relative overflow-hidden" data-astro-cid-sahthylw>  <div class="absolute inset-0 gradient-bg -z-10" data-astro-cid-sahthylw></div>  <div class="h-full" data-astro-cid-sahthylw> ${renderComponent($$result2, "PhotoWall", PhotoWall, { "photos": photos, "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Projects/MyBlog-Astro/src/components/3d/PhotoWall.tsx", "client:component-export": "default", "data-astro-cid-sahthylw": true })} </div> </main> ` })} `;
}, "D:/Projects/MyBlog-Astro/src/pages/gallery.astro", void 0);

const $$file = "D:/Projects/MyBlog-Astro/src/pages/gallery.astro";
const $$url = "/gallery";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Gallery,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
