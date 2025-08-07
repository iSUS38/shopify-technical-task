if (!customElements.get('custom-select')) {
  customElements.define(
    'custom-select',
    class CustomSelect extends HTMLElement {
      constructor() {
        super();
        this.select = this.querySelector('select');
        this.createContainers();
      }

      createContainers() {
        const wrapper = this.select.closest('.select');
        wrapper.classList.add('hidden');
        this.rootId = this.select.getAttribute('id');
        this.triggerId = `trigger-${this.rootId}`;
        this.listboxId = `combobox-${this.rootId}`;

        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('select');
        this.trigger = document.createElement('button');

        const triggerAttributes = {
          'aria-controls': this.listboxId,
          'aria-expanded': 'false',
          'aria-haspopup': 'listbox',
          'aria-labelledby': `label-${this.rootId}`,
          id: this.listboxId,
          role: 'combobox',
          tabindex: 0,
        };
        for (const [key, value] of Object.entries(triggerAttributes)) {
          this.trigger.setAttribute(key, value);
        }

        this.trigger.classList.add('select__field', 'caption', 'custom-select__button');
        this.listbox = document.createElement('div');
        this.listbox.setAttribute('role', 'listbox');
        this.listbox.setAttribute('id', this.listboxId);
        this.listbox.setAttribute('aria-labelledby', `label-${this.id}`);
        this.listbox.setAttribute('tabindex', '-1');
        this.listbox.classList.add('custom-select__listbox');

        const icon = this.querySelector('.select__icon');

        this.trigger.innerHTML = 'test';
        this.wrapper.appendChild(this.trigger);
        this.wrapper.insertBefore(icon.cloneNode({ deep: true }), this.trigger);
        this.wrapper.appendChild(this.listbox);

        this.getOptions();
        this.populateLabel();

        this.appendChild(this.wrapper);
      }

      bindEvents() {
        this.trigger.addEventListener('click', this.toggleCombobox.bind(this));
        document.addEventListener('click', this.checkClickOutside.bind(this));
        this.options.forEach((option) => option.addEventListener('click', this.onOptionClick.bind(this)));
        this.trigger.addEventListener('keydown', this.onKeyDown.bind(this));
      }

      getOptions() {
        const template = this.querySelector('template');
        if (template) {
          this.listbox.innerHTML = template.innerHTML;
          this.active = this.listbox.querySelector('[aria-selected="true"]');
        }
        this.options = this.listbox.querySelectorAll('[role="option"]');
        this.bindEvents();
      }

      populateLabel() {
        const selectedOption = this.listbox.querySelector('[aria-selected="true"]');
        this.trigger.innerHTML = selectedOption.innerHTML;
      }

      openCombobox() {
        this.open = true;
        this.trigger.setAttribute('aria-expanded', true);
        this.focusOption(this.active);
      }

      closeCombobox() {
        this.open = false;
        this.trigger.setAttribute('aria-expanded', false);
        this.trigger.setAttribute('aria-activedescendant', '');
      }

      toggleCombobox() {
        if (this.trigger.getAttribute('aria-expanded') === 'true') {
          this.closeCombobox();
        } else {
          this.openCombobox();
        }
      }

      checkClickOutside(event) {
        if (event.target && !this.contains(event.target)) {
          this.closeCombobox();
        }
      }

      onOptionClick(event) {
        this.selectOption(event.target);
        this.closeCombobox();
      }

      selectOption(target) {
        this.options.forEach((option) => option.removeAttribute('aria-selected'));
        target.setAttribute('aria-selected', true);
        this.populateLabel();
        this.select.value = target.dataset.value;
        this.select.dispatchEvent(
          new Event('change', {
            bubbles: true,
          })
        );
      }

      focusOption(target) {
        this.listbox.scrollTo({
          top: target.offsetTop,
        });
        this.active.classList.remove('custom-select__option--highlighted');
        target.classList.add('custom-select__option--highlighted');
        this.active = target;
        this.trigger.setAttribute('aria-activedescendant', target.id);
      }

      onKeyDown(event) {
        if (event.code === 'ArrowDown') {
          event.preventDefault();
          if (this.open) {
            const nextElement = this.active.nextElementSibling;
            if (nextElement) this.focusOption(nextElement);
          } else {
            this.openCombobox();
          }
        } else if (event.code === 'ArrowUp') {
          event.preventDefault();
          if (this.open) {
            if (event.altKey === true) {
              this.selectOption(this.active);
              this.closeCombobox();
            } else {
              const prevElement = this.active.previousElementSibling;
              if (prevElement) this.focusOption(prevElement);
            }
          } else {
            this.focusOption(this.options[0]);
            this.openCombobox();
          }
        } else if (event.code === 'Enter' || event.code === 'Space') {
          event.preventDefault();
          if (this.open) {
            this.selectOption(this.active);
            this.closeCombobox();
          } else {
            this.openCombobox();
          }
        } else if (event.code === 'Home' || event.code === 'PageUp') {
          event.preventDefault();
          this.focusOption(this.options[0]);
          if (!this.open) {
            this.openCombobox();
          }
        } else if (event.code === 'End' || event.code === 'PageDown') {
          event.preventDefault();
          this.focusOption(this.options[this.options.length - 1]);
          if (!this.open) {
          } else {
            this.focusOption(this.options[this.options.length - 1]);
            this.openCombobox();
          }
        } else if (event.code === 'Tab') {
          if (this.open) {
            /* Technically should move focus but difficult to implement with current limitations */
            event.preventDefault();
            this.selectOption(this.active);
            this.closeCombobox();
          }
        } else if (event.code === 'Escape') {
          if (this.open) {
            event.preventDefault();
            this.closeCombobox();
          }
        } else if (event.key.length === 1 && event.key !== ' ' && !event.altKey && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          this.openCombobox();
          const str = event.key.toLowerCase();
          const index = Array.from(this.options).indexOf(this.active);
          for (let i = index + 1; i < this.options.length; i++) {
            const option = this.options[i];
            if (option.dataset.value.charAt(0).toLowerCase() === str) {
              return this.focusOption(option);
            }
          }
          for (let i = 0; i < index; i++) {
            const option = this.options[i];
            if (option.dataset.value.charAt(0).toLowerCase() === str) {
              return this.focusOption(option);
            }
          }
        }
      }
    }
  );
}
