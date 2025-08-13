/*! Advanced Lazy Image for Shopify */
class LazyImage extends HTMLImageElement {
  constructor() {
    super();

    this.wrapper = this.closest('.media-wrapper') || this.parentElement;
    if (!this.wrapper) return;

    // Intersection Observer for lazy load
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage();
          this.observer.disconnect();
        }
      });
    });
    this.observer.observe(this);
  }

  loadImage() {
    const isDesktop = window.matchMedia('(min-width: 750px)').matches;
    const isMobile = !isDesktop;
    const slowConnection = navigator.connection && navigator.connection.downlink < 1;

    let mobileImg = this.getAttribute('data-src-mobile');   // ~200kb
    let desktopImg = this.getAttribute('data-src-desktop'); // ~533kb
    let ultraLowImg = this.getAttribute('data-src-ultra');  // ~50kb fallback

    // Slow internet: load ultra-low image
    if (slowConnection && ultraLowImg) {
      this.src = ultraLowImg;
      return;
    }

    // Load image based on device
    this.src = isDesktop ? desktopImg : mobileImg;

    // Blur-up effect
    this.wrapper.classList.add('loading');
    this.addEventListener('load', () => {
      this.classList.add('loaded');
      this.wrapper.classList.remove('loading');
    }, { once: true });
  }
}
window.customElements.define('lazy-image', LazyImage, { extends: 'img' });

/*! Progressive Picture for Pinch Zoom HQ */
class ProgPicture extends HTMLPictureElement {
  constructor() {
    super();
    this.abortController = new AbortController();
    this.addEventListener('touchmove', this.touchmove_handler, { signal: this.abortController.signal });
  }

  touchmove_handler(ev) {
    if (ev.scale > 1) {
      let hqImage = this.getAttribute('data-hq');
      let source = this.querySelector('source');
      if (hqImage && source) {
        source.setAttribute('srcset', hqImage);
      }
      this.abortController.abort();
    }
  }
}
window.customElements.define('prog-picture', ProgPicture, { extends: 'picture' });
