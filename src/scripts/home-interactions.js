(function() {
  const ring = document.getElementById('interactiveRing');

  if (!ring) return;

  // 检测是否为触摸设备
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  let activePointer = null;
  let animationId = null;
  let currentRotateX = 0;
  let currentRotateY = 0;
  let targetRotateX = 0;
  let targetRotateY = 0;
  let lastUpdateTime = 0;
  let isRingVisible = true;
  let lastRotateX = '0.00deg';
  let lastRotateY = '0.00deg';
  let lastTranslateZ = '0px';

  function scheduleRingUpdate() {
    if (animationId === null && isRingVisible && !document.hidden) {
      animationId = requestAnimationFrame(updateRingTransform);
    }
  }

  function stopRingUpdate() {
    if (animationId !== null) cancelAnimationFrame(animationId);
    animationId = null;
  }

  // 平滑插值函数 - 触摸设备使用更快的响应
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // 更新环形文字的3D旋转 - 优化版本
  function updateRingTransform(timestamp) {
    animationId = null;
    if (!isRingVisible || document.hidden) return;
    // 节流：触摸设备每 16ms (60fps) 更新一次，非触摸设备可以更快
    const minInterval = isTouchDevice ? 16 : 8;
    if (timestamp - lastUpdateTime < minInterval) {
      scheduleRingUpdate();
      return;
    }
    lastUpdateTime = timestamp;

    // 使用不同的插值因子：触摸设备更快响应
    const lerpFactor = isTouchDevice ? 0.15 : 0.1;
    currentRotateX = lerp(currentRotateX, targetRotateX, lerpFactor);
    currentRotateY = lerp(currentRotateY, targetRotateY, lerpFactor);

    const settled = Math.abs(currentRotateX - targetRotateX) < 0.01 && Math.abs(currentRotateY - targetRotateY) < 0.01;
    if (settled) {
      currentRotateX = targetRotateX;
      currentRotateY = targetRotateY;
    }
    const rotateX = `${currentRotateX.toFixed(2)}deg`;
    const rotateY = `${currentRotateY.toFixed(2)}deg`;
    const translateZ = activePointer !== null ? '30px' : '0px';
    if (rotateX !== lastRotateX) ring.style.setProperty('--rotateX', rotateX);
    if (rotateY !== lastRotateY) ring.style.setProperty('--rotateY', rotateY);
    if (translateZ !== lastTranslateZ) ring.style.setProperty('--translateZ', translateZ);
    lastRotateX = rotateX;
    lastRotateY = rotateY;
    lastTranslateZ = translateZ;
    if (!settled) scheduleRingUpdate();
  }

  // Keep CSS rotation; run the pointer interpolation only while it changes.
  new IntersectionObserver(([entry]) => {
    isRingVisible = entry.isIntersecting;
    if (isRingVisible) scheduleRingUpdate();
    else stopRingUpdate();
  }).observe(ring);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopRingUpdate();
    else scheduleRingUpdate();
  });

  // 鼠标移动事件
  function handleMove(clientX, clientY) {
    const rect = ring.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 计算鼠标相对于环形中心的位置 (-1 到 1)
    const percentX = (clientX - centerX) / (rect.width / 2);
    const percentY = (clientY - centerY) / (rect.height / 2);

    // 限制范围
    const clampedX = Math.max(-1, Math.min(1, percentX));
    const clampedY = Math.max(-1, Math.min(1, percentY));

    // 设置目标旋转角度 (最大 ±15度)
    targetRotateY = clampedX * 15;
    targetRotateX = -clampedY * 15;
    scheduleRingUpdate();
  }

  // On touchscreens pointerenter also fires when the finger first makes contact.
  ring.addEventListener('pointerenter', (event) => {
    if (!event.isPrimary) return;
    activePointer = event.pointerId;
    ring.classList.add('interacting');
    scheduleRingUpdate();
  });

  ring.addEventListener('pointermove', (event) => {
    if (event.pointerId === activePointer) handleMove(event.clientX, event.clientY);
  }, { passive: true });

  function endRingInteraction(event) {
    if (event.pointerId !== activePointer) return;
    activePointer = null;
    ring.classList.remove('interacting');
    targetRotateX = 0;
    targetRotateY = 0;
    scheduleRingUpdate();
  }

  ring.addEventListener('pointerleave', endRingInteraction);
  ring.addEventListener('pointercancel', endRingInteraction);
  ring.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'touch') endRingInteraction(event);
  });

  // 设备方向支持 (移动端)
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function(e) {
      if (activePointer === null && e.beta !== null && e.gamma !== null) {
        // beta: 前后倾斜 (-180 到 180), gamma: 左右倾斜 (-90 到 90)
        targetRotateX = Math.max(-15, Math.min(15, e.beta * 0.3));
        targetRotateY = Math.max(-15, Math.min(15, e.gamma * 0.3));
        scheduleRingUpdate();
      }
    });
  }
})();

// 导航卡片优雅动效 - 点击任意链接时触发 - 优化版本
(function() {
  const navCard = document.getElementById('navCard');
  const gridContainer = document.querySelector('.grid');

  if (!navCard) return;

  // 检测是否为触摸设备
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  let isNavigating = false;
  let navigationTimer;
  let recoveryTimer;

  // History and avatar returns share the same layout transition.
  function resetNavCardToCardState() {
    clearTimeout(navigationTimer);
    clearTimeout(recoveryTimer);
    isNavigating = false;
    navCard.removeAttribute('aria-busy');
    document.documentElement.removeAttribute('data-home-return-motion');

    // 移除固定定位样式
    navCard.style.position = '';
    navCard.style.top = '';
    navCard.style.left = '';
    navCard.style.zIndex = '';

    // 恢复桌面端位移类
    navCard.classList.add('[@media(min-width:924px)]:translate-x-64', '[@media(min-width:924px)]:-translate-y-0');

    // 移除 GPU 加速和布局转换类
    navCard.classList.remove('gpu-accelerated', 'nav-card-layout-change');

    // 恢复其他元素的显示
    if (gridContainer) {
      const children = gridContainer.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.id !== 'navCard') {
          child.style.willChange = '';
          child.style.transition = '';
          child.style.opacity = '';
          child.style.transform = '';
        }
      }
    }
  }

  // 页面可见性变化时重置导航栏（处理从其他页面返回的情况）
  // Prepare the home navigation card for the outbound conversion animation.
  function prepareNavCardForOutbound() {
    navCard.style.position = 'fixed';
    navCard.style.top = '16px';
    navCard.style.left = '16px';
    navCard.style.zIndex = '9999';
    navCard.classList.remove('[@media(min-width:924px)]:translate-x-64', '[@media(min-width:924px)]:-translate-y-0');
    navCard.classList.add('gpu-accelerated', 'nav-card-layout-change');
  }

  // Prepare an incoming avatar return without replaying the outbound animation.
  function prepareNavCardForReturn() {
    document.documentElement.dataset.homeReturnMotion = '1';
    navCard.style.position = 'fixed';
    navCard.style.top = '16px';
    navCard.style.left = '16px';
    navCard.style.zIndex = '9999';
    navCard.classList.remove('[@media(min-width:924px)]:translate-x-64', '[@media(min-width:924px)]:-translate-y-0');
    navCard.classList.remove('gpu-accelerated', 'nav-card-layout-change');
  }

  const hasUrlReturnMarker = document.documentElement.dataset.homeReturnMotion === '1';
  let shouldPlayHomeReturnMotion = hasUrlReturnMarker;
  try {
    shouldPlayHomeReturnMotion = shouldPlayHomeReturnMotion || sessionStorage.getItem('home-return-motion') === '1';
  } catch {
    // The URL flag remains available when sessionStorage is unavailable.
  }

  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible' && !shouldPlayHomeReturnMotion && !isNavigating) {
      // 页面重新可见时，重置导航栏状态
      resetNavCardToCardState();
    }
  });

  // 页面加载时确保导航栏在正确位置
  window.addEventListener('pageshow', function(e) {
    // 如果是从缓存加载的页面（如浏览器返回），重置导航栏
    if (e.persisted && !shouldPlayHomeReturnMotion) {
      resetNavCardToCardState();
    }
  });

  window.addEventListener('pagehide', () => {
    clearTimeout(navigationTimer);
    clearTimeout(recoveryTimer);
  });

  // 获取所有会跳转的链接
  // Avatar navigation is a normal link, so reproduce the history-return starting state.
  if (shouldPlayHomeReturnMotion) {
    if (!hasUrlReturnMarker) {
      prepareNavCardForReturn();
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        navCard.setAttribute('data-home-return-reset', '');
        resetNavCardToCardState();
        // Commit the inner reset while keeping the card's original movement.
        void navCard.offsetWidth;
        navCard.removeAttribute('data-home-return-reset');
        shouldPlayHomeReturnMotion = false;

        try {
          sessionStorage.removeItem('home-return-motion');
        } catch {
          // Ignore unavailable sessionStorage.
        }

        if (hasUrlReturnMarker) {
          const url = new URL(window.location.href);
          if (url.hash === '#home-return-motion') url.hash = '';
          if (url.searchParams.has('homeReturnMotion')) url.searchParams.delete('homeReturnMotion');
          window.history.replaceState(window.history.state, '', url.href);
        }

      });
    });
  }

  const allLinks = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');

  allLinks.forEach(link => {
    // Astro initializes hover prefetching after these inline handlers run.
    if (!link.hasAttribute('data-astro-prefetch')) link.dataset.astroPrefetch = 'hover';
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      // Keep new-tab, download and same-page navigation native.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
          this.hasAttribute('download') || (this.target && this.target !== '_self') || !href) return;
      const destination = new URL(href, window.location.href);
      if (destination.origin !== window.location.origin ||
          (destination.pathname === window.location.pathname && destination.search === window.location.search)) return;

      // Reduced-motion CSS already removes the transition. Let the link open immediately.
      if (!isNavigating && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      e.preventDefault();
      if (isNavigating) return;
      isNavigating = true;
      navCard.setAttribute('aria-busy', 'true');

      // 使用 requestAnimationFrame 确保流畅的动画开始
      requestAnimationFrame(() => {
        // 直接设置固定定位到左上角
        prepareNavCardForOutbound();

        // 添加 GPU 加速类

        // 立即开始布局转换动画
      });

      // 其他元素淡出（排除统计卡片）- 使用 requestAnimationFrame 批量处理
      if (gridContainer) {
        requestAnimationFrame(() => {
          const children = gridContainer.children;
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const hasStats = child.querySelector('.stat-number');
            if (!hasStats && child.id !== 'navCard') {
              child.style.willChange = 'opacity, transform';
              child.style.transition = 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
              child.style.opacity = '0';
              child.style.transform = 'scale(0.97)';
            }
          }
        });
      }

      // 延迟跳转 - 移动端使用更短的延迟
      const delay = isTouchDevice ? 650 : 750;
      navigationTimer = setTimeout(() => {
        window.location.href = destination.href;
      }, delay);
      // A cancelled or slow navigation must not leave the current page faded out.
      recoveryTimer = setTimeout(() => resetNavCardToCardState(), delay + 3000);
    });
  });
})();
