class AnnouncementBar extends HTMLElement {
  constructor() {
    super();
    const height = this.clientHeight;
    document.documentElement.style.setProperty('--announcement-bar-height', height + 'px');

    this.observer = new ResizeObserver((entries) => {
      const height = this.clientHeight;
      document.documentElement.style.setProperty('--announcement-bar-height', height + 'px');
    });
    this.observer.observe(this);
  }
}
customElements.define('announcement-bar', AnnouncementBar);
