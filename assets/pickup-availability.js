if (!customElements.get('pickup-availability')) {
  customElements.define(
    'pickup-availability',
    class PickupAvailability extends HTMLElement {
      constructor() {
        super();

        if (!this.hasAttribute('available')) return;

        this.errorHtml = this.querySelector('template').content.firstElementChild.cloneNode(true);
        this.onClickRefreshList = this.onClickRefreshList.bind(this);
        this.fetchAvailability(this.dataset.variantId);
      }

      fetchAvailability(variantId) {
        if (!variantId) return;

        let rootUrl = this.dataset.rootUrl;
        if (!rootUrl.endsWith('/')) {
          rootUrl = rootUrl + '/';
        }
        const variantSectionUrl = `${rootUrl}variants/${variantId}/?section_id=pickup-availability`;

        fetch(variantSectionUrl)
          .then((response) => response.text())
          .then((text) => {
            const sectionInnerHTML = new DOMParser()
              .parseFromString(text, 'text/html')
              .querySelector('.shopify-section');
            this.renderPreview(sectionInnerHTML);
          })
          .catch((e) => {
            const button = this.querySelector('button');
            if (button) button.removeEventListener('click', this.onClickRefreshList);
            this.renderError();
          });
      }

      onClickRefreshList() {
        this.fetchAvailability(this.dataset.variantId);
      }

      update(variant) {
        if (variant?.available) {
          this.fetchAvailability(variant.id);
        } else {
          this.removeAttribute('available');
          this.innerHTML = '';
        }
      }

      renderError() {
        this.innerHTML = '';
        this.appendChild(this.errorHtml);

        this.querySelector('button').addEventListener('click', this.onClickRefreshList);
      }

      renderPreview(sectionInnerHTML) {
        const drawer = document.querySelector('custom-dialog[data-name="pickup-availability"]');
        if (drawer) drawer.remove();
        if (!sectionInnerHTML.querySelector('pickup-availability-preview')) {
          this.innerHTML = '';
          this.removeAttribute('available');
          return;
        }

        this.innerHTML = sectionInnerHTML.querySelector('pickup-availability-preview').outerHTML;
        this.setAttribute('available', '');

        document.body.appendChild(sectionInnerHTML.querySelector('custom-dialog'));
        const colorScheme = this.dataset.productPageColorScheme;
        const dialogWindow = document.querySelector('custom-dialog[data-name="pickup-availability"] .dialog__window');
        dialogWindow.setAttribute('data-color-scheme', colorScheme);

        const button = this.querySelector('button');
        if (button)
          button.addEventListener('click', (evt) => {
            const event = new CustomEvent('dialog:trigger:pickup-availability');
            document.dispatchEvent(event);
          });
      }
    }
  );
}
