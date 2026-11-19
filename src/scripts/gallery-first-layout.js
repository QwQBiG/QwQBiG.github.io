// Runs in the head so the static wall and its interactive cards start in the same place.
(() => {
  const { photoIds, compact } = document.currentScript.dataset;
  const ids = JSON.parse(photoIds);
  const mobile = window.matchMedia(compact).matches;
  const { innerWidth: width, innerHeight: height } = window;
  const maxX = Math.min(width * 0.35, 350);
  const yScale = mobile ? (height / width > 1.5 ? 0.2 : 0.3) : 0.4;
  const maxY = Math.min(height * yScale, mobile ? 200 : 400);
  const style = document.documentElement.style;

  function initialPosition(id, index) {
    try {
      const saved = JSON.parse(localStorage.getItem('photo-wall-' + id));
      if (Number.isFinite(saved?.x) && Number.isFinite(saved?.y)) {
        return {
          x: saved.x, y: saved.y,
          rotation: Number.isFinite(saved.rotation) ? saved.rotation % 360 : 0,
          zIndex: Number.isSafeInteger(saved.zIndex) ? saved.zIndex : Number(id),
        };
      }
    } catch { /* A missing or unreadable saved position gets a fresh spot. */ }

    const direction = index / ids.length * Math.PI * 2;
    return {
      x: Math.cos(direction) * maxX * (0.3 + Math.random() * 0.7),
      y: Math.sin(direction) * maxY * (0.3 + Math.random() * 0.7) + (mobile ? height * 0.05 : 0),
      rotation: (Math.random() - 0.5) * 20,
      zIndex: index,
    };
  }

  ids.forEach((id, index) => {
    const { x, y, rotation, zIndex } = initialPosition(id, index);
    const radians = rotation * Math.PI / 180;
    const prefix = '--photo-' + id + '-';
    style.setProperty(prefix + 'x', x + 'px');
    style.setProperty(prefix + 'y', y + 'px');
    style.setProperty(prefix + 'rotation', rotation + 'deg');
    style.setProperty(prefix + 'cos', Math.abs(Math.cos(radians)));
    style.setProperty(prefix + 'sin', Math.abs(Math.sin(radians)));
    style.setProperty(prefix + 'z', zIndex);
  });
})();
