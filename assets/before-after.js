if (!window.customElements.get('before-after')) {
  class BeforeAfter extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector('[role="slider"]');
      this.isMoving = false;
      const percentage = window.getComputedStyle(this).getPropertyValue('--position').replace('%', '');
      this.percentage = parseInt(percentage);
      this.addEventListener('pointerdown', this.onPointerDown.bind(this));
      this.addEventListener('touchstart', this.onTouchStart.bind(this));
      this.input.addEventListener('keydown', this.onKeydown.bind(this));
    }

    onKeydown(event) {
      let percentage;
      if (event.key.toUpperCase() === 'ARROWLEFT') {
        percentage = Math.floor(this.percentage) - 1;
      } else if (event.key.toUpperCase() === 'ARROWRIGHT') {
        percentage = Math.ceil(this.percentage) + 1;
      } else if (event.key.toUpperCase() === 'HOME') {
        event.preventDefault();
        percentage = 0;
      } else if (event.key.toUpperCase() === 'END') {
        event.preventDefault();
        percentage = 100;
      }

      if (percentage || percentage === 0) {
        this.setPercentage(percentage);
        this.input.setAttribute('aria-valuetext', `${Math.round(this.percentage)}%`);
      }
    }

    onTouchStart(event) {
      this.isTouch = true;
      this.timeStamp = event.timeStamp;
    }

    onPointerDown(event) {
      if (event.target === this.input || this.input.contains(event.target)) {
        this.isMoving = true;
        document.addEventListener('pointermove', this.onPointerMove.bind(this));
        document.addEventListener('pointerup', this.onPointerUp.bind(this));
      }
    }

    onPointerMove(event) {
      this.calculatePosition(event);
    }

    onPointerUp(event) {
      document.removeEventListener('pointermove', this.onPointerMove);
      document.removeEventListener('pointerup', this.onPointerUp);
      if (!this.isTouch || event.timeStamp - this.timeStamp < 200) {
        this.isMoving = true;
        this.calculatePosition(event);
        this.isMoving = false;
        this.input.setAttribute('aria-valuetext', `${Math.round(this.percentage)}%`);
      }
      this.isTouch = false;
    }

    calculatePosition(event) {
      if (this.isMoving) {
        let bounds = this.getBoundingClientRect();
        let percentage = ((event.clientX - bounds.left) / this.clientWidth) * 100;
        percentage = document.dir === 'rtl' ? 100 - percentage : percentage;
        this.setPercentage(percentage);
      }
    }

    setPercentage(percentage) {
      this.percentage = Math.min(100, Math.max(0, percentage));
      this.style.setProperty('--position', `${this.percentage}%`);
    }
  }

  window.customElements.define('before-after', BeforeAfter);
}
