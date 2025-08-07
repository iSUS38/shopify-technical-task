if (!customElements.get('media-gallery')) {
  customElements.define(
    'media-gallery',
    class MediaGallery extends HTMLElement {
      constructor() {
        super();
        this.slideshow = this.querySelector('slideshow-component:not(.slider--collapse)');
        this.thumbnailGallery = this.querySelector('thumbnail-gallery');
        this.activeMedia = this.dataset.activeMedia;

        if (this.slideshow && this.activeMedia) {
          const mediaSlide = this.querySelector(`[data-media-id="${this.activeMedia}"]`);
          setTimeout(() => this.slideshow.jumpToSlide(mediaSlide, true), 0);
        }

        document.addEventListener('variant:change', (event) => {
          if (event.detail.sectionId === this.dataset.section) {
            if (event.detail.variant.featured_media) {
              this.changeImage(event.detail.variant.featured_media.id);
            }
          }
        });

        let stickyMedia = this.querySelector('.pdp-thumbnails');
        if (this.dataset.style == 'scroll') stickyMedia = this;
        if (!stickyMedia) return;
        this.observer = new ResizeObserver((entries) => {
          if (!window.matchMedia('(min-width:48em)').matches) return;
          const style = getComputedStyle(this);
          const stickyHeight = parseFloat(style.getPropertyValue('--sticky-header-height').replace('px', ''));
          const transparentHeight = parseFloat(style.getPropertyValue('--transparent-header-height').replace('px', ''));
          if (window.innerHeight - stickyHeight + transparentHeight >= stickyMedia.clientHeight - 10) {
            this.classList.add('media-gallery--sticky');
          } else {
            this.classList.remove('media-gallery--sticky');
          }
        });
        this.observer.observe(document.documentElement);
      }

      changeImage(id) {
        if (!id) return;
        if (this.slideshow) {
          const slide = this.slideshow.querySelector(`[data-media-id="${id}"]`);
          this.slideshow.jumpToSlide(slide);
        } else if (this.thumbnailGallery) {
          this.thumbnailGallery.activateMedia(id.toString());
        }
        if (this.dataset.style === 'scroll' && window.matchMedia('(min-width:48em)').matches) {
          const image = this.querySelector(`[data-media-id="${id}"]`);
          image.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  );
}
