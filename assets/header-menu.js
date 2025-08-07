class HeaderMenu extends HTMLElement {
  static observedAttributes = ['data-sticky'];
  constructor() {
    super();
    this.elements = {
      triggers: this.querySelectorAll('.header__menu-item[aria-expanded]'),
      megamenus: this.querySelectorAll('.header__primary-menu [data-submenu="megamenu"]'),
      submenus: this.querySelectorAll('.header__primary-menu [data-submenu]'),
      secondaryMenu: this.querySelector('.header__right'),
      background: this.querySelector('.header__background'),
    };
    this.returnColorScheme = [];

    this.elements.triggers.forEach((trigger) =>
      trigger.addEventListener('click', (event) => this.toggleTrigger(event))
    );

    this.elements.submenus.forEach((submenu) => {
      submenu.addEventListener('keydown', (event) => this.onSubmenuKeyDown(event));
      submenu.addEventListener('focusout', (event) => this.onSubmenuFocusOut(event, submenu));
    });

    this.isProductPage = document.querySelector('.page--product');
    this.isTransparent =
      this.classList.contains('header--transparent') &&
      document.querySelector('.pdp--full[data-support-transparent-header]');

    const height = Math.floor(this.clientHeight) - 1;
    document.documentElement.style.setProperty('--header-height', height + 'px');

    this.headerObserver = new ResizeObserver((entries) => {
      if (window.matchMedia('(max-width:71.99em)').matches) {
        this.elements.submenus.forEach((submenu) => {
          this.closeSubmenu(submenu, true);
        });
      }
      if (this.isProductPage && this.isTransparent) {
        if (window.matchMedia('(min-width:48em)').matches) {
          this.classList.add('header--transparent');
        } else {
          this.classList.remove('header--transparent');
        }
      }
      const height = Math.floor(this.clientHeight) - 1;
      document.documentElement.style.setProperty('--header-height', height + 'px');
      if (this.classList.contains('header--transparent')) {
        document.documentElement.style.setProperty('--transparent-header-height', height + 'px');
      } else {
        document.documentElement.style.setProperty('--transparent-header-height', '0px');
      }
      if (this.dataset.sticky === 'always' && window.matchMedia('(min-height: 30em)').matches) {
        document.documentElement.style.setProperty('--sticky-header-height', height + 'px');
      } else {
        document.documentElement.style.setProperty('--sticky-header-height', '0px');
      }
    });
    this.headerObserver.observe(this);

    this.megamenuObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.borderBoxSize[0].blockSize;
        if (entry.target.getAttribute('data-submenu') === 'nested-dropdown') {
          if (height > this.submenuHeight) {
            this.setSubmenuHeight(height);
          }
        } else {
          this.setSubmenuHeight(height);
        }
      }
    });

    document.addEventListener('click', (event) => {
      const openMenus = this.querySelectorAll('[aria-expanded="true"]');
      openMenus.forEach((openMenu) => {
        const submenu = document.getElementById(openMenu.getAttribute('aria-controls'));

        if (openMenu && !submenu.contains(event.target) && submenu != event.target && event.target != openMenu) {
          this.closeSubmenu(submenu, true);
        }
      });
    });
  }

  closeSubmenu(submenu, preventFocus) {
    this.classList.remove('header--alt-logo');
    this.removeAttribute('open');
    const trigger = this.querySelector(`[aria-controls="${submenu.getAttribute('id')}"]`);
    trigger.setAttribute('aria-expanded', false);

    if (!this.querySelector('[aria-expanded="true"]')) {
      this.classList.remove('header--background');
    }

    this.elements.secondaryMenu.classList.remove('header__right--inactive');
    this.megamenuObserver.unobserve(submenu);
    if (this.originalColorScheme) {
      this.returnColorScheme.forEach((el) => {
        el.setAttribute('data-color-scheme', this.originalColorScheme);
      });
      this.returnColorScheme = [];
    }

    const fade = submenu.querySelectorAll('[data-animate-fade]');
    fade.forEach((element) => element.classList.add('faded-out'));
    if (preventFocus === true) return;
    trigger.focus();
  }

  openSubmenu(submenu) {
    setTimeout(() => {
      const submenuType = submenu.getAttribute('data-submenu');
      this.setAttribute('open', submenuType);
      const trigger = this.querySelector(`[aria-controls="${submenu.getAttribute('id')}"]`);
      trigger.setAttribute('aria-expanded', true);
      if (this.getAttribute('data-layout') === 'vertical') {
        const height = Math.max(submenu.clientHeight, this.clientHeight, this.submenuHeight || 0);
        if (submenuType != 'megamenu') {
          this.setSubmenuHeight(height);
        }
        this.megamenuObserver.observe(submenu);
        this.classList.add('header--background');
      }
      if (submenuType === 'megamenu') {
        if (submenu.hasAttribute('data-alt-logo')) {
          this.classList.add('header--alt-logo');
        }
        const style = submenu.getAttribute('data-color-scheme-style');
        if (this.getAttribute('data-layout') === 'horizontal' && style === 'fade') {
          this.originalColorScheme = submenu.getAttribute('data-color-scheme-original');
          const newScheme = submenu.getAttribute('data-color-scheme-transition');
          this.returnColorScheme = [this, submenu];
          this.returnColorScheme.forEach((el) => {
            el.setAttribute('data-color-scheme', newScheme);
          });
        }
        if (this.getAttribute('data-layout') === 'vertical') {
          this.elements.secondaryMenu.classList.add('header__right--inactive');
          this.originalColorScheme = submenu.getAttribute('data-color-scheme-original');
          if (style === 'fade') {
            const newScheme = submenu.getAttribute('data-color-scheme-transition');
            this.returnColorScheme = [this, this.elements.background];
            this.returnColorScheme.forEach((el) => {
              el.setAttribute('data-color-scheme', newScheme);
            });
          }
          this.classList.add('header--background');
        }

        const fade = submenu.querySelectorAll('[data-animate-fade]');
        fade.forEach((element) => element.classList.remove('faded-out'));
      }
    }, 0);
  }

  setSubmenuHeight(height) {
    this.submenuHeight = height;
    document.documentElement.style.setProperty('--submenu-height', height + 'px');
  }

  onSubmenuKeyDown(event) {
    switch (event.code.toUpperCase()) {
      case 'ESCAPE':
        const submenu = event.target.closest('[data-submenu]');
        this.closeSubmenu(submenu);
    }
  }

  onSubmenuFocusOut(event, submenu) {
    if (event.relatedTarget) {
      // Prevents some double activation issues
      const id = event.relatedTarget.getAttribute('aria-controls');
      if (id) {
        const el = document.getElementById(id);
        if (el.contains(submenu)) {
          return;
        }
      }
    }
    if (!submenu.contains(event.target) || !submenu.contains(event.relatedTarget)) {
      this.closeSubmenu(submenu, true);
    }
  }

  toggleTrigger(event) {
    const trigger = event.target;
    const submenu = document.getElementById(trigger.getAttribute('aria-controls'));
    if (trigger.getAttribute('aria-expanded') === 'true') {
      this.closeSubmenu(submenu);
    } else {
      this.openSubmenu(submenu);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-sticky' && newValue !== 'none') {
      window.addEventListener('scroll', this.onScroll.bind(this), false);
    }
  }

  onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (this.predictiveSearch && this.predictiveSearch.isOpen) return;
    if (this.getAttribute('open')) return;

    const transparentEl = document.querySelector('[data-support-transparent-header]');
    if (transparentEl && scrollTop > transparentEl.clientHeight) {
      this.classList.add('header--filled');
    } else if (!transparentEl && scrollTop > 0) {
      this.classList.add('header--filled');
    } else {
      this.classList.remove('header--filled');
    }

    if (this.dataset.sticky === 'scroll') {
      if (scrollTop > this.currentScrollTop && scrollTop > this.clientHeight) {
        this.classList.add('header--scrolled-past');
        this.classList.remove('header--revealed');
      } else if (scrollTop < this.currentScrollTop && scrollTop > this.clientHeight) {
        this.classList.add('header--scrolled-past');
        if (!this.preventReveal) {
          this.classList.add('header--revealed');
        } else {
          window.clearTimeout(this.isScrolling);

          this.isScrolling = setTimeout(() => {
            this.preventReveal = false;
          }, 75);

          this.classList.remove('header--revealed');
        }
      } else if (scrollTop <= this.clientHeight) {
        this.classList.remove('header--scrolled-past');
        this.classList.remove('header--revealed');
      }
    }
    this.currentScrollTop = scrollTop;
  }
}

customElements.define('header-menu', HeaderMenu);
