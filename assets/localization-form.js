if (!customElements.get('localization-form')) {
  customElements.define(
    'localization-form',
    class LocalizationForm extends HTMLElement {
      constructor() {
        super();
        this.elements = {
          input: this.querySelector('input[name="locale_code"], input[name="country_code"]'),
          button: this.querySelector('button.localization-form__select'),
          panel: this.querySelector('.disclosure__list-wrapper'),
          fieldGroup: this.querySelector('.localization-form__field'),
          list: this.querySelector('.disclosure__list'),
          search: this.querySelector('input[name="country_filter"]'),
          closeButton: this.querySelector('[data-close]'),
          resetButton: this.querySelector('[data-reset]'),
          searchIcon: this.querySelector('[data-search-icon]'),
          liveRegion: this.querySelector('[data-live-region]'),
          loadingSpinner: this.querySelector('.loading__spinner'),
          overlay: this.querySelector('[data-overlay]'),
        };
        this.addEventListener('keyup', this.onContainerKeyUp.bind(this));
        this.addEventListener('keydown', this.onContainerKeyDown.bind(this));
        this.addEventListener('focusout', this.closeSelector.bind(this));
        this.elements.button.addEventListener('click', this.onButtonClick.bind(this));

        if (this.elements.search) {
          this.elements.search.addEventListener('keyup', this.onSearchKeyup.bind(this));
          this.elements.search.addEventListener('focus', this.onSearchFocus.bind(this));
          this.elements.search.addEventListener('blur', this.onSearchBlur.bind(this));
          this.elements.search.addEventListener('keydown', this.onSearchKeyDown.bind(this));
        }
        if (this.elements.overlay) {
          this.elements.overlay.addEventListener('click', this.hidePanel.bind(this));
        }
        if (this.elements.closeButton) {
          this.elements.closeButton.addEventListener('click', this.hidePanel.bind(this));
        }
        if (this.elements.resetButton) {
          this.elements.resetButton.addEventListener('click', this.resetFilter.bind(this));
          this.elements.resetButton.addEventListener('mousedown', (event) => event.preventDefault());
        }

        this.querySelectorAll('a').forEach((item) => item.addEventListener('click', this.onItemClick.bind(this)));
      }

      onButtonClick() {
        if (this.elements.button.getAttribute('aria-expanded') === 'true') {
          this.hidePanel();
        } else {
          this.openSelector();
        }
      }

      hidePanel(preventFocus) {
        if (this.elements.button.getAttribute('aria-expanded') !== 'true') return;
        this.elements.button.setAttribute('aria-expanded', 'false');
        if (this.elements.search) {
          this.elements.search.value = '';
          this.filterCountries();
          this.elements.search.setAttribute('aria-activedescendant', '');
        }
        if (preventFocus) return;
        this.elements.button.focus();
      }

      onContainerKeyDown(event) {
        const focusableItems = Array.from(this.querySelectorAll('a')).filter(
          (item) => !item.parentElement.classList.contains('hidden')
        );
        let focusedItemIndex = focusableItems.findIndex((item) => item === document.activeElement);
        let itemToFocus;

        switch (event.code.toUpperCase()) {
          case 'ARROWUP':
            event.preventDefault();
            itemToFocus =
              focusedItemIndex > 0 ? focusableItems[focusedItemIndex - 1] : focusableItems[focusableItems.length - 1];
            itemToFocus.focus();
            break;
          case 'ARROWDOWN':
            event.preventDefault();
            itemToFocus =
              focusedItemIndex < focusableItems.length - 1 ? focusableItems[focusedItemIndex + 1] : focusableItems[0];
            itemToFocus.focus();
            break;
          case 'ARROWDOWN':
            event.preventDefault();
            itemToFocus =
              focusedItemIndex < focusableItems.length - 1 ? focusableItems[focusedItemIndex + 1] : focusableItems[0];
            itemToFocus.focus();
            break;
          case 'HOME':
            if (this.elements.search) {
              event.preventDefault();
              this.elements.search.focus();
              this.elements.search.setSelectionRange(0, 0);
            }
            break;
          case 'END':
            if (this.elements.search) {
              event.preventDefault();
              this.elements.search.focus();
            }
            break;
          case 'ESCAPE':
            if (this.elements.button.getAttribute('aria-expanded') === 'true') event.preventDefault();
        }

        if (!this.elements.search) return;

        setTimeout(() => {
          focusedItemIndex = focusableItems.findIndex((item) => item === document.activeElement);
          if (focusedItemIndex > -1) {
            this.elements.search.setAttribute('aria-activedescendant', focusableItems[focusedItemIndex].id);
          } else {
            this.elements.search.setAttribute('aria-activedescendant', '');
          }
        });
      }

      onSearchKeyup(event) {
        switch (event.code.toUpperCase()) {
          case 'ESCAPE':
            event.preventDefault();
            event.stopPropagation();
            if (this.elements.search?.value) {
              this.elements.search.value = '';
              this.elements.search.focus();
            } else {
              this.hidePanel();
            }
        }
        this.filterCountries();
      }

      onContainerKeyUp(event) {
        event.preventDefault();

        switch (event.code.toUpperCase()) {
          case 'ESCAPE':
            event.preventDefault();
            if (this.elements.search?.value) {
              this.elements.search.value = '';
              this.elements.search.focus();
              event.stopPropagation();
            } else {
              if (this.elements.button.getAttribute('aria-expanded') === 'false') return;
              this.hidePanel();
              event.stopPropagation();
              this.elements.button.focus();
            }
            break;
          case 'SPACE':
            if (this.elements.button.getAttribute('aria-expanded') === 'true') return;
            this.openSelector();
            break;
        }
      }

      onItemClick(event) {
        event.preventDefault();
        const form = this.querySelector('form');
        this.elements.input.value = event.currentTarget.dataset.value;
        if (form) {
          form.submit();
          this.elements.closeButton?.classList.add('hidden');
          this.elements.list?.classList.add('opacity--loading');
          this.elements.fieldGroup?.classList.add('opacity--loading');
          this.elements.loadingSpinner?.classList.remove('hidden');

          if (this.elements.searchIcon) {
            this.elements.searchIcon.setAttribute('aria-hidden', true);
            this.elements.resetButton.setAttribute('aria-hidden', true);
          }
        } else {
          const newValue = event.currentTarget.dataset.display;
          this.elements.button.querySelector('.caption').innerText = newValue;
          this.hidePanel();
        }
      }

      openSelector() {
        const otherForms = document.querySelectorAll('localization-form');
        otherForms.forEach((form) => {
          form.hidePanel(true);
        });
        this.elements.button.setAttribute(
          'aria-expanded',
          (this.elements.button.getAttribute('aria-expanded') === 'false').toString()
        );
        if (this.elements.search) {
          setTimeout(() => this.elements.search.focus(), 100);
        } else {
          setTimeout(() => this.querySelector('.disclosure__link').focus(), 100);
        }
      }

      closeSelector(event) {
        if (
          event.target.getAttribute('data-overlay') ||
          !this.contains(event.target) ||
          !this.contains(event.relatedTarget)
        ) {
          // On small screens, the overlay exists to catch clicks, and this picks up some false positives
          if (window.getComputedStyle(this.elements.panel).getPropertyValue('position') === 'fixed') return;
          this.hidePanel(event?.target && event.target === this.elements.button);
        }
      }

      normalizeString(str) {
        return str
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase();
      }

      filterCountries() {
        const searchValue = this.normalizeString(this.elements.search.value);
        const popularCountries = this.querySelector('.popular-countries');
        const allCountries = this.querySelectorAll('a');
        let visibleCountries = allCountries.length;

        if (searchValue) {
          this.elements.resetButton.removeAttribute('aria-hidden');
          this.elements.resetButton.removeAttribute('inert');
        } else {
          this.elements.resetButton.setAttribute('aria-hidden', true);
          this.elements.resetButton.setAttribute('inert', true);
        }

        if (popularCountries) {
          popularCountries.classList.toggle('hidden', searchValue);
        }

        allCountries.forEach((item) => {
          const countryName = this.normalizeString(item.dataset.search);
          if (countryName.indexOf(searchValue) > -1) {
            item.parentElement.classList.remove('hidden');
          } else {
            item.parentElement.classList.add('hidden');
            visibleCountries--;
          }
        });
        if (this.elements.liveRegion) {
          this.elements.liveRegion.innerHTML = window.accessibilityStrings.countrySelectorSearchCount.replace(
            '[count]',
            visibleCountries
          );
        }

        this.querySelector('.country-selector').scrollTop = 0;
        this.querySelector('.country-selector__list').scrollTop = 0;
      }

      resetFilter(event) {
        event.stopPropagation();
        this.elements.search.value = '';
        this.filterCountries();
        this.elements.search.focus();
      }

      onSearchFocus() {
        this.elements.searchIcon.setAttribute('aria-hidden', true);
        if (this.normalizeString(this.elements.search.value)) {
          this.elements.resetButton.removeAttribute('aria-hidden');
          this.elements.resetButton.removeAttribute('inert');
        }
      }

      onSearchBlur() {
        if (!this.elements.search.value) {
          this.elements.searchIcon.removeAttribute('aria-hidden');
          this.elements.resetButton.setAttribute('aria-hidden', true);
          this.elements.resetButton.setAttribute('inert', true);
        } else {
          this.elements.resetButton.removeAttribute('aria-hidden');
          this.elements.resetButton.removeAttribute('inert');
        }
      }

      onSearchKeyDown(event) {
        if (event.code.toUpperCase() === 'ESCAPE') {
          event.preventDefault();
        }
      }
    }
  );
}
