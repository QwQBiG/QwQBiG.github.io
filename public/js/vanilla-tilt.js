class VanillaTilt {
  constructor(element, settings = {}) {
    this.element = element;
    this.glareElement = element.querySelector('.glare');
    this.settings = {
      max: 10,
      perspective: 1200,
      scale: 1.02,
      speed: 600,
      glare: true,
      'max-glare': 0.6,
      ...settings
    };

    this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    if (this.isTouchDevice) {
      this.settings.max = 6;
      this.settings.scale = 1.01;
      this.settings.speed = 400;
    }

    this.init();
  }

  init() {
    this.element.style.transform = `perspective(${this.settings.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;

    if (!this.isTouchDevice) {
      this.element.addEventListener('mouseenter', (e) => this.onMouseEnter(e));
      this.element.addEventListener('mousemove', (e) => this.onMouseMove(e));
      this.element.addEventListener('mouseleave', (e) => this.onMouseLeave(e));
    }

    const links = this.element.querySelectorAll('a, button');
    links.forEach(link => {
      link.addEventListener('mouseenter', (e) => e.stopPropagation());
      link.addEventListener('click', (e) => e.stopPropagation());
    });
  }

  onMouseEnter(e) {
    this.update(e);
    if (this.glareElement) {
      this.glareElement.style.opacity = '1';
    }
  }

  onMouseMove(e) {
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.update(e);
        this.rafId = null;
      });
    }
  }

  onMouseLeave(e) {
    this.element.style.transform = `perspective(${this.settings.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    this.element.style.transition = `transform ${this.settings.speed}ms cubic-bezier(0.23, 1, 0.32, 1)`;
    if (this.glareElement) {
      this.glareElement.style.opacity = '0';
    }

    setTimeout(() => {
      this.element.style.transition = '';
    }, this.settings.speed);
  }

  update(e) {
    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -this.settings.max;
    const rotateY = ((x - centerX) / centerX) * this.settings.max;

    this.element.style.willChange = 'transform';
    this.element.style.transform = `
      perspective(${this.settings.perspective}px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale3d(${this.settings.scale}, ${this.settings.scale}, ${this.settings.scale})
    `;

    if (this.glareElement) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      this.glareElement.style.background = `
        radial-gradient(
          circle at ${glareX}% ${glareY}%,
          rgba(255, 255, 255, ${this.settings['max-glare']}) 0%,
          rgba(255, 255, 255, ${this.settings['max-glare'] * 0.5}) 25%,
          rgba(255, 255, 255, ${this.settings['max-glare'] * 0.2}) 50%,
          transparent 70%
        )
      `;
    }
  }
}

function initTilt() {
  const cards = document.querySelectorAll('[data-tilt="true"]');
  cards.forEach((card) => {
    if (card instanceof HTMLElement && !card._tiltInitialized) {
      new VanillaTilt(card);
      card._tiltInitialized = true;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTilt);
} else {
  initTilt();
}

document.addEventListener('astro:page-load', initTilt);
document.addEventListener('astro:after-swap', initTilt);
