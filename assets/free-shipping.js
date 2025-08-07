class FreeShipping extends SearchForm {
  constructor() {
    super();
    this.conversionRate = parseFloat(Shopify.currency.rate) || 1;
    this.amount = parseInt(this.dataset.amount);
    this.baseThreshold = parseInt(this.dataset.threshold);
    this.threshold = this.baseThreshold * this.conversionRate;
    this.met = this.querySelector('[data-free-shipping="true"]');
    this.unmet = this.querySelector('[data-free-shipping="false"]');
    this.amountText = this.querySelector('[data-amount]');

    if (this.amount >= this.threshold) {
      this.met.removeAttribute('aria-hidden');
    } else {
      if (Shopify.currency.active) {
        const locale = document.documentElement.getAttribute('lang');
        const amount = (this.threshold - this.amount) / 100;
        this.amountText.textContent = new Intl.NumberFormat(locale, {
          locales: [`${locale}-${Shopify.country}`, `${locale}`],
          style: 'currency',
          currency: Shopify.currency.active,
        }).format(amount);
      }
      this.unmet.removeAttribute('aria-hidden');
    }

    this.classList.add('free-shipping--active');
  }
}

customElements.define('free-shipping', FreeShipping);
