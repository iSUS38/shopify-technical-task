class CollectionInfiniteScroll extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('click', this.onClick.bind(this));
    this.container = document.getElementById('ProductGrid');
    this.isLoading = false;

    document.addEventListener('DOMContentLoaded', (event) => {
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => document.querySelector(hash).closest('.card-product').scrollIntoView(), 50);
      }
    });
  }

  onClick(event) {
    if (this.isLoading) return;
    const page = event.target.getAttribute('data-product-page');
    if (page) {
      // Update history so back button functionality works
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('page', page);
      history.replaceState(
        { urlParams: urlParams.toString(), page },
        '',
        `${window.location.href.split('?')[0]}?${urlParams.toString()}#${event.target.getAttribute('id')}`
      );
    }

    const id = event.target.getAttribute('data-load-id');
    if (id) {
      this.setLoading();
      const direction = event.target.getAttribute('data-load-direction');
      const urlParams = new URLSearchParams(window.location.search);
      if (!this.page) {
        this.page = parseInt(urlParams.get('page')) || 1;
      }
      this.page = direction === 'more' ? this.page + 1 : this.page - 1;
      urlParams.set('page', this.page);
      const pageUrl = `${window.location.href.split('?')[0]}?${this.page > 1 ? urlParams.toString() : ''}`;
      const fetchUrl = `${pageUrl}&section_id=${id}`;
      history.replaceState({ urlParams: urlParams.toString() }, '', pageUrl);
      this.fetchData(fetchUrl, direction);
    }
  }

  setLoading() {
    const buttons = this.querySelectorAll('[data-load-id]');
    buttons.forEach((button) => {
      button.setAttribute('aria-disabled', true);
      button.setAttribute('data-loading', true);
    });
    this.isLoading = true;
  }

  fetchData(url, direction) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        this.renderData(html, direction);
      })
      .catch((err) => {
        if (err) {
          console.log(err);
        }
        const event = new CustomEvent('rendering:error');
        document.dispatchEvent(event);
      });
  }

  renderData(html, direction) {
    const parser = new DOMParser().parseFromString(html, 'text/html');
    const firstElement = parser.querySelector('.card-product a');
    [];
    const firstElementLink = firstElement.getAttribute('href');
    const content = parser.getElementById('ProductGrid').innerHTML;
    let htmlPosition = 'beforeend';
    let paginationId = 'ProductLoadMore';
    if (direction === 'previous') {
      htmlPosition = 'afterbegin';
      paginationId = 'ProductLoadPrevious';
    }
    const paginationEl = parser.getElementById(paginationId);
    if (paginationEl) {
      this.querySelector(`#${paginationId}`).innerHTML = paginationEl.innerHTML;
    } else {
      this.querySelector(`#${paginationId}`).style.display = 'none';
    }
    this.container.insertAdjacentHTML(htmlPosition, content);
    this.querySelector(`a[href="${firstElementLink}"]`).focus({ preventScroll: true });
    this.isLoading = false;
    const buttons = this.querySelectorAll('[data-load-id]');
    buttons.forEach((button) => {
      button.removeAttribute('data-loading');
      button.removeAttribute('aria-disabled');
      const spinner = button.querySelector('.loading__spinner');
      if (spinner) spinner.classList.add('hidden');
    });
  }
}
customElements.define('collection-infinite-scroll', CollectionInfiniteScroll);
