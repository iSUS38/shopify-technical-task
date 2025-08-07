class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items');
      cartItems.updateQuantity(this.dataset.index, 0);

      const cartItem = this.closest('[data-cart-item]');
      const productTitle = cartItem?.getAttribute('data-cart-product');
      const message = window.accessibilityStrings.itemRemoved.replace('[item]', productTitle);
      cartItems.updateLiveRegion(message);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartNote extends HTMLElement {
  constructor() {
    super();

    this.addEventListener(
      'input',
      window.utils.debounce((event) => {
        const config = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: `application/json` },
        };
        const body = JSON.stringify({ note: event.target.value });
        fetch(`${routes.cart_update_url}`, { ...config, ...{ body } });
      }, 300)
    );
  }
}

customElements.define('cart-note', CartNote);

class CartItems extends HTMLElement {
  constructor() {
    super();

    const debouncedOnChange = window.utils.debounce((event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener('change', debouncedOnChange.bind(this));
  }

  onChange(event) {
    if (event.target.name == 'note') return;
    this.validateQuantity(event);
  }

  validateQuantity(event) {
    const inputValue = parseInt(event.target.value);
    const index = event.target.dataset.index;

    this.updateQuantity(
      index,
      inputValue,
      document.activeElement.getAttribute('name'),
      event.target.dataset.quantityVariantId
    );
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-page-items',
        section: document.getElementById('cart-page-items')?.dataset.id,
        selectors: ['#Cart'],
      },
      {
        id: 'cart-drawer-items',
        section: document.getElementById('cart-drawer-items')?.dataset.id,
        selectors: ['.cart-drawer__main', '.cart-drawer__footer', '#cart-drawer-heading'],
      },
      {
        id: 'header-menu',
        section: document.getElementById('header-menu')?.dataset.id,
        selectors: ['[data-cart-count]'],
      },
    ];
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector)?.innerHTML;
  }

  getElementClasslist(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector)?.classList;
  }

  renderContents(parsedState) {
    this.renderSections(parsedState);

    setTimeout(() => {
      const event = new CustomEvent('dialog:trigger:cart-drawer');
      document.dispatchEvent(event);
    });
  }

  renderSections(parsedState) {
    this.getSectionsToRender().forEach((section) => {
      const targetSection = document.getElementById(section.id);
      if (!targetSection) return;
      let sectionObj = parsedState;
      if (parsedState.sections) {
        sectionObj = parsedState.sections;
      }

      for (const selector of section.selectors) {
        const sourceElements = targetSection.querySelectorAll(selector);

        for (const element of sourceElements) {
          const html = this.getSectionInnerHTML(sectionObj[section.section], selector);
          const classList = this.getElementClasslist(sectionObj[section.section], selector);

          if (html) element.innerHTML = html;
          if (classList) element.classList = classList;
        }
      }
    });
  }

  updateQuantity(line, quantity, name, variantId) {
    this.enableLoading(line);

    const lineItem = this.querySelector(`[data-cart-item="${line}"]`);
    const productTitle = lineItem?.getAttribute('data-cart-product');

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    const config = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: `application/json` },
    };

    fetch(`${routes.cart_change_url}`, { ...config, ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        const quantityElement = this.querySelector(`[data-cart-line-item-quantity="${line}"]`);
        const quantityValue = quantityElement.getAttribute('value');

        if (parsedState.errors) {
          quantityElement.value = quantityValue;
          this.handleErrors(parsedState, variantId);
          this.refreshCart();
          return;
        }

        this.renderSections(parsedState);

        const lineItem = this.querySelector(`[data-cart-item="${line}"]`);
        const lineItemActiveButton = lineItem?.querySelector(`[name="${name}"]`);
        if (lineItem && lineItemActiveButton) {
          lineItemActiveButton.focus({ preventScroll: true });
        } else {
          const firstLineItemName = this.querySelector('.cart-item__title');
          if (firstLineItemName) firstLineItemName.focus({ preventScroll: true });
        }

        let message;
        if (quantity > 0) {
          message = window.accessibilityStrings.itemQuantityUpdated
            .replace('[item]', productTitle)
            .replace('[quantity]', quantity);
        } else {
          message = window.accessibilityStrings.itemRemoved.replace('[item]', productTitle);
        }
        this.updateLiveRegion(message);

        const event = new CustomEvent('cart:update', {
          detail: {
            source: this.id,
            cartData: parsedState,
            variantId: variantId,
          },
        });
        document.dispatchEvent(event);
      })
      .catch((error) => {
        this.querySelectorAll('.loading__spinner').forEach((overlay) => overlay.classList.add('hidden'));

        const event = new CustomEvent('cart:error', {
          detail: {
            source: 'cart',
            productVariantId: variantId,
            message: window.cartStrings.error,
          },
        });

        document.dispatchEvent(event);
      })
      .finally(() => {
        this.disableLoading(line);
      });
  }

  refreshCart() {
    const sectionString = this.getSectionsToRender()
      .map((section) => section.section)
      .filter((el) => el)
      .join(',');

    const params = new URLSearchParams(window.location.search);
    params.append('sections', sectionString);

    fetch(`${window.location.href}?${params.toString()}`)
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        try {
          const parsedState = JSON.parse(state);
          this.renderSections(parsedState);
        } catch {
          this.renderSections(state);
        }
      })
      .catch((err) => {
        if (err) {
          console.log(err);
        }
        const event = new CustomEvent('rendering:error');
        document.dispatchEvent(event);
      });
  }

  updateLiveRegion(message) {
    const localLiveRegion = this.querySelector('[data-live-region]');
    if (localLiveRegion) {
      localLiveRegion.innerHTML = message;
    } else {
      window.utils.announce(message);
    }
  }

  handleErrors(response, variantId) {
    const event = new CustomEvent('cart:error', {
      detail: {
        source: 'cart',
        productVariantId: variantId,
        errors: response.errors,
        message: response.description || response.message || response.errors,
      },
    });
    document.dispatchEvent(event);
  }

  enableLoading(line) {
    const cartItems = this.querySelector('.cart__items');
    cartItems.classList.add('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`[data-cart-item="${line}"] .loading__spinner`);
    [...cartItemElements].forEach((overlay) => overlay.classList.remove('hidden'));
  }

  disableLoading(line) {
    const cartItems = this.querySelector('.cart__items');
    cartItems.classList.remove('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`[data-cart-item="${line}"] .loading__spinner`);
    cartItemElements.forEach((overlay) => overlay.classList.add('hidden'));
  }
}

customElements.define('cart-items', CartItems);

class CartStickyObserver extends HTMLElement {
  constructor() {
    super();

    this.calculateHeight();

    this.observer = new ResizeObserver((entries) => {
      this.calculateHeight();
    });
    this.observer.observe(this);
  }

  calculateHeight() {
    if (!window.matchMedia('(min-width:64em)').matches) return;
    this.footer = this.querySelector('[data-cart-footer]');
    if (this.clientHeight > this.footer.scrollHeight) {
      this.footer.classList.add('cart-drawer__footer--sticky');
    } else {
      this.footer.classList.remove('cart-drawer__footer--sticky');
    }
  }
}

customElements.define('cart-sticky-observer', CartStickyObserver);
