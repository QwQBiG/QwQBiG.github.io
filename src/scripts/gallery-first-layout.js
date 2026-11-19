// Apply saved positions before the cards paint. Missing photos keep their CSS ring position.
(() => {
  const ids = JSON.parse(document.currentScript.dataset.photoIds);
  const style = document.documentElement.style;
  for (const id of ids) {
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem('photo-wall-' + id));
    } catch {
      continue;
    }
    if (!Number.isFinite(saved?.x) || !Number.isFinite(saved.y)) continue;

    const rotation = Number.isFinite(saved.rotation) ? saved.rotation % 360 : 0;
    const angle = rotation * Math.PI / 180;
    const prefix = '--photo-' + id + '-';
    style.setProperty(prefix + 'x', saved.x + 'px');
    style.setProperty(prefix + 'y', saved.y + 'px');
    style.setProperty(prefix + 'rotation', rotation + 'deg');
    style.setProperty(prefix + 'cos', Math.abs(Math.cos(angle)));
    style.setProperty(prefix + 'sin', Math.abs(Math.sin(angle)));
    if (Number.isSafeInteger(saved.zIndex)) style.setProperty(prefix + 'z', saved.zIndex);
  }
})();
