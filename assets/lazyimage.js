/*! Lazy Image with Size Limit */
class LazyImage extends HTMLImageElement {
  constructor() {
    super();

    this.wrapper = this.closest('.media-wrapper');
    if (this.wrapper === null) return;

    this.handleLazy();
    addEventListener('resize', this.handleLazy.bind(this), true);

    const observer = new MutationObserver((changes) => {
      changes.forEach((change) => {
        if (change.attributeName.includes('src') || change.attributeName.includes('srcset')) {
          this.handleLazy();
        }
      });
    });
    observer.observe(this, { attributes: true });
  }

  handleLazy() {
    const isDesktop = window.matchMedia('(min-width: 750px)').matches;
    const isMobile = !isDesktop;

    // Hidden image checks
    if (isDesktop && this.classList.contains('medium-hide')) return;
    if (isMobile && this.classList.contains('small-hide')) return;
    if (this.complete || this.classList.contains('loaded')) return;

    // Decide which image to load based on device
    let mobileImage = this.getAttribute('data-src-mobile');   // ~200kb version
    let desktopImage = this.getAttribute('data-src-desktop'); // ~533kb version

    if (isDesktop && desktopImage) {
      this.src = desktopImage;
    } else if (isMobile && mobileImage) {
      this.src = mobileImage;
    }

    this.wrapper.classList.add('loading');
    this.addEventListener('load', () => {
      const loaded = () => {
        this.classList.add('loaded');
        this.wrapper.classList.remove('loading');
      };
      window.requestIdleCallback
        ? window.requestIdleCallback(loaded, { timeout: 150 })
        : setTimeout(loaded);
    }, false);
  }
}
window.customElements.define('lazy-image', LazyImage, { extends: 'img' });


/*! Progressive Picture */
class ProgPicture extends HTMLPictureElement {
  constructor() {
    super();

    this.abortController = new AbortController();
    this.addEventListener('touchmove', this.touchmove_handler, { signal: this.abortController.signal });
  }

  touchmove_handler(ev) {
    if (ev.scale > 1) {
      var hqImage = this.getAttribute('data-hq');
      let source = this.querySelector('source');
      if (hqImage && source) {
        source.setAttribute('srcset', hqImage);
      }
      this.abortController.abort();
    }
  }
}
window.customElements.define('prog-picture', ProgPicture, { extends: 'picture' });
