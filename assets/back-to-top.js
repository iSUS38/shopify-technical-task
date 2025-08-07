class BackToTop extends HTMLElement {
  constructor() {
    super();
    this.throttleOnScroll = window.utils.throttle((event) => {
      this.onScroll(event);
    }, 300);

    window.addEventListener('scroll', this.throttleOnScroll.bind(this));

    this.onScroll();
  }

  onScroll() {
    if (window.scrollY > window.innerHeight) {
      this.removeAttribute('data-hidden');
    } else {
      this.setAttribute('data-hidden', true);
    }
  }
}

customElements.define('back-to-top', BackToTop);
