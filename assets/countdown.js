if (!customElements.get('countdown-timer')) {
  customElements.define(
    'countdown-timer',
    class Countdown extends HTMLElement {
      constructor() {
        super();
        this.sectionId = this.getAttribute('data-section-hide');
        this.description = this.getAttribute('data-description');
        this.endDateAttribute = this.getAttribute('data-end-date');
        this.pauseButton = this.querySelector('play-pause-button');
        this.isPlaying = false;

        const isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;
        if (!isReduced) {
          this.isPlaying = true;
        }

        if (!this.endDateAttribute) return;

        this.elements = {
          sectionToHide: document.getElementById(`shopify-section-${this.sectionId}`),
          liveRegion: this.querySelector('[data-live-region]'),
          days: this.querySelector('[data-type="days"]'),
          hours: this.querySelector('[data-type="hours"]'),
          minutes: this.querySelector('[data-type="minutes"]'),
          seconds: this.querySelector('[data-type="seconds"]'),
        };

        this.endDate = new Date(this.endDateAttribute);
        this.timer = {
          lastSecond: 0,
          lastMinute: 0,
        };

        this.pauseButton.addEventListener('click', this.togglePlayPause.bind(this));
        this.animation = requestAnimationFrame(this.animate.bind(this));
      }

      getRemainingTime() {
        const currentDate = new Date();
        return this.endDate - currentDate;
      }

      getValues(total) {
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        return { days, hours, minutes, seconds };
      }

      updateDisplay(remainingTime) {
        const { days, hours, minutes, seconds } = this.getValues(remainingTime);

        this.elements.days.innerHTML = days.toString().padStart(2, '0');
        this.elements.hours.innerHTML = hours.toString().padStart(2, '0');
        this.elements.minutes.innerHTML = minutes.toString().padStart(2, '0');
        this.elements.seconds.innerHTML = seconds.toString().padStart(2, '0');
      }

      updateLiveRegion(remainingTime, style = 'default') {
        const { days, hours, minutes, seconds } = this.getValues(remainingTime);

        if (this.elements.liveRegion) {
          let time = [],
            timeStr = '';
          if (days > 0) time.push(`${days} days`);
          if (hours > 0) time.push(`${hours} hours`);
          if (minutes > 0) time.push(`${minutes} minutes`);
          if (seconds > 0) time.push(`${seconds} seconds`);

          time.forEach((el, i) => {
            if (i !== time.length - 1) el += ', ';
            timeStr += el;
          });

          if (style === 'default') {
            this.elements.liveRegion.innerHTML = window.accessibilityStrings.countdownRemainingTime
              .replace('[event]', this.description)
              .replace('[time]', timeStr);
          } else if (style === 'short') {
            this.elements.liveRegion.innerHTML = timeStr;
          }
        }
      }

      animate(timestamp) {
        const remainingTime = this.getRemainingTime();
        if (isNaN(remainingTime)) return;

        if (remainingTime <= 0) {
          this.updateDisplay(0);
          window.utils.announce(window.accessibilityStrings.countdownTimerEnd.replace('[event]', this.description));

          if (this.elements.sectionToHide) {
            Shopify.designMode
              ? (this.elements.sectionToHide.style.opacity = 0.5)
              : (this.elements.sectionToHide.style.display = 'none');
          }

          return;
        }

        if (remainingTime < 600000 && remainingTime > 11000 && timestamp - this.timer.lastMinute >= 60000) {
          this.timer.lastMinute = timestamp;
          this.updateLiveRegion(remainingTime);
        }

        if (timestamp - this.timer.lastSecond >= 1000) {
          this.timer.lastSecond = timestamp;
          this.updateDisplay(remainingTime);

          if (remainingTime <= 11000) {
            this.updateLiveRegion(remainingTime, 'short');
          }
        }

        if (this.isPlaying) {
          this.animation = requestAnimationFrame(this.animate.bind(this));
        }
      }

      togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        if (!this.isPlaying) {
          cancelAnimationFrame(this.animation);
        } else {
          this.animation = requestAnimationFrame(this.animate.bind(this));
        }
      }
    }
  );
}
