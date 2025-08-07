if (!customElements.get('menu-drawer')) {
  customElements.define(
    'menu-drawer',
    class MenuDrawer extends CustomDialog {
      constructor() {
        super();
        this.elements = {
          ...this.elements,
          submenuTriggers: this.querySelectorAll('[data-submenu]'),
          backTriggers: this.querySelectorAll('[data-back]'),
          primary: this.querySelector('#primary'),
          menus: this.querySelectorAll('[data-state]'),
        };

        this.elements.submenuTriggers.forEach((button) => {
          button.addEventListener('click', () => this.toggleSubmenu(button, true));
        });

        this.elements.backTriggers.forEach((button) => {
          button.addEventListener('click', () => this.toggleSubmenu(button, false));
        });

        document.addEventListener('dialog:close:menu-drawer', () => {
          this.resetMenu();
          const originalColorScheme = this.elements.dialogWindow.getAttribute('data-color-scheme-original');
          this.elements.dialogWindow.setAttribute('data-color-scheme', originalColorScheme);
        });
      }

      toggleSubmenu(button, isForward) {
        const submenuId = button.getAttribute('aria-controls');
        const submenu = this.querySelector(`#${submenuId}`);
        const current = this.querySelector('[data-state="current"]');

        const fade = submenu.querySelectorAll('[data-animate-fade]');
        fade.forEach((element) => element.classList.add('faded-out'));

        const originalColorScheme = this.elements.dialogWindow.getAttribute('data-color-scheme-original');
        const transitionScheme = this.elements.dialogWindow.getAttribute('data-color-scheme-transition');
        current.dataset.state = isForward ? 'previous' : 'next';
        submenu.dataset.state = 'current';
        setTimeout(() => {
          fade.forEach((element) => element.classList.remove('faded-out'));
        }, 100);

        if (transitionScheme) {
          if (submenuId === 'primary') {
            this.elements.dialogWindow.setAttribute('data-color-scheme', originalColorScheme);
          } else {
            this.elements.dialogWindow.setAttribute('data-color-scheme', transitionScheme);
          }
        }
        setTimeout(() => {
          submenu.querySelector('.menu-drawer__link:not(.menu-drawer__link--back').focus();
        }, 200);
      }

      resetMenu() {
        this.elements.menus.forEach((menu) => {
          menu.dataset.state = 'next';
        });
        this.elements.primary.dataset.state = 'current';
      }

      openDialog(e) {
        super.openDialog();
        if (Shopify?.designMode) return;
        const animation = { opacity: [0, 1] };
        if (!window.matchMedia(`(prefers-reduced-motion: reduce)`).matches) {
          animation.transform = ['translateY(-100%)', 'translateY(0)'];
        }
        this.querySelector('.menu-drawer__dialog-window').animate(animation, { duration: 300, easing: 'ease' });
      }

      closeDialog(e) {
        super.closeDialog();
        this.querySelectorAll('localization-form').forEach((form) => {
          form.hidePanel(true);
        });
      }
    }
  );
}
