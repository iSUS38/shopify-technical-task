class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();

    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);
    const delayResolver = (event) => {
      if (event.target.getAttribute('type') === 'text') {
        return 2000;
      }
      return 800;
    };

    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', (event) => {
      const delay = delayResolver(event);

      if (!this.debouncedFunction) {
        this.debouncedFunction = window.utils.debounce((e) => this.onSubmitHandler(e), delay);
      }

      this.debouncedFunction(event);
    });

    const button = this.querySelector('.facets-filters-form__footer-button');
    if (button) {
      button.addEventListener('click', () => {
        const event = new CustomEvent(`dialog:force-close:facets`);
        document.dispatchEvent(event);
      });
    }

    document.addEventListener('dialog:open:facets', () => {
      const dialog = document.querySelector('.facets__dialog');
      dialog.scrollTo(0, 0);
      const height = this.querySelector('.facets-filters-form__footer')?.clientHeight;
      if (height) {
        dialog.style.setProperty('--footer-height', `${height}px`);
      }
    });

    document.addEventListener('dialog:close:facets', () => {
      const loader = document.querySelector('[data-facet-loader]');
      loader.animate({ transform: ['scaleX(0)'], opacity: 0 }, { duration: 0, fill: 'forwards' });
    });
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener('popstate', onHistoryChange);
  }

  static completeLoader() {
    const loader = document.querySelector('[data-facet-loader]');
    if (loader) loader.animate({ transform: ['scaleX(1)'] }, { duration: 300, easing: 'ease', fill: 'forwards' });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    const loader = document.querySelector('[data-facet-loader]');
    if (loader) {
      loader.animate(
        { transform: ['scaleX(0)', 'scaleX(0.4)'], opacity: [0, 1] },
        { duration: 300, easing: 'ease', fill: 'forwards' }
      );
    }

    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
        : FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.completeLoader();
      })
      .catch((err) => {
        if (err) {
          console.log(err);
        }
        const event = new CustomEvent('rendering:error');
        document.dispatchEvent(event);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.completeLoader();
  }

  static renderProductGridContainer(html) {
    const grid = document.getElementById('ProductGridContainer');
    grid.innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('ProductGridContainer')?.innerHTML;
    grid.classList.remove('product-grid__wrapper--loading');
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const facetDetailsElementsFromFetch = parsedHTML.querySelectorAll('[data-filter-form] details');
    const facetDetailsElementsFromDom = document.querySelectorAll('[data-filter-form] details');

    // Remove facets that are no longer returned from the server
    Array.from(facetDetailsElementsFromDom).forEach((currentElement) => {
      if (!Array.from(facetDetailsElementsFromFetch).some(({ id }) => currentElement.id === id)) {
        currentElement.remove();
      }
    });

    const matchesId = (element) => {
      const jsFilter = event ? event.target.closest('details') : undefined;
      return jsFilter ? element.id === jsFilter.id : false;
    };

    const facetsToRender = Array.from(facetDetailsElementsFromFetch).filter((element) => !matchesId(element));

    facetsToRender.forEach((elementToRender, index) => {
      const currentElement = document.getElementById(elementToRender.id);
      // Element already rendered in the DOM so just update the setInnerHTML
      if (currentElement) {
        const content = document.getElementById(elementToRender.id).querySelector('[data-content]');
        const contentToRender = elementToRender.querySelector('[data-content]');
        content.innerHTML = contentToRender.innerHTML;
      } else {
        if (index > 0) {
          const { className: previousElementClassName, id: previousElementId } = facetsToRender[index - 1];
          // Same facet type (eg horizontal/vertical or drawer/mobile)
          if (elementToRender.className === previousElementClassName) {
            document.getElementById(previousElementId).after(elementToRender);
            return;
          }
        }

        if (elementToRender.parentElement) {
          document.querySelector(`#${elementToRender.parentElement.id} collapsible-content`).before(elementToRender);
        }
      }
    });

    FacetFiltersForm.renderAdditionalElements(parsedHTML);
  }

  static renderAdditionalElements(html) {
    const additionalElements = [
      '.facets-filters-form__footer-button',
      '[data-facets-filter-count]',
      '[data-sidebar-facets-header]',
      '[data-facets-active]',
    ];

    additionalElements.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      const selectors = document.querySelectorAll(selector);
      selectors.forEach((el) => (el.innerHTML = html.querySelector(selector).innerHTML));
    });

    setTimeout(() => {
      const counts = document.querySelectorAll('[data-facets-filter-count]');
      counts.forEach((count) => (count.innerHTML = ''));
    }, 1000);

    const count = html.querySelector('[data-facets-active-filter-count]');
    if (count) {
      document.querySelectorAll('[data-active-filter-count]').forEach((el) => {
        el.innerHTML = parseInt(count?.innerText) !== 0 ? count.innerText : '';
      });
    }

    const productsCount = html.querySelector('[data-facets-filtered-product-count]');
    if (productsCount) {
      document.querySelectorAll('[data-filtered-products-count]').forEach((el) => {
        el.innerHTML = parseInt(productsCount.innerText) !== 0 ? productsCount.innerText : '0';
      });
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('ProductGrid').dataset.id,
      },
    ];
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    if (form.querySelector('[data-default-price]')) {
      formData.delete('filter.v.price.gte');
      formData.delete('filter.v.price.lte');
    }
    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    const grid = document.getElementById('ProductGridContainer');
    grid.classList.add('product-grid__wrapper--loading');
    if (event.target.getAttribute('id') === 'SortBy') {
      window.utils.announce('Sorted.');
    }
    event.preventDefault();
    const form = event.target.closest('form');
    const forms = [form];
    if (form.id !== 'FacetsSortForm') {
      const sort = document.getElementById('FacetsSortForm');
      if (sort) forms.push(sort);
    } else {
      const filters = document.getElementById('FacetsFiltersForm');
      if (filters) forms.push(filters);
    }

    const currentParams = new URLSearchParams(window.location.search);
    for (const [key, val] of Array.from(currentParams)) {
      if (key !== 'q' && key !== 'options[prefix]') {
        currentParams.delete(key);
      }
    }

    const params = [currentParams.toString()];
    forms.forEach((form) => params.push(this.createSearchParams(form)));
    const filteredParams = params.filter((param) => param).join('&');
    this.onSubmitForm(filteredParams, event);
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    const grid = document.getElementById('ProductGridContainer');
    grid.classList.add('product-grid__wrapper--loading');
    const url =
      event.currentTarget.href.indexOf('?') == -1
        ? ''
        : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facets-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRange extends HTMLElement {
  constructor() {
    super();

    this.debouncedKeyDown = window.utils
      .debounce((event) => {
        this.adjustToValidValues(event.target);
      }, 1000)
      .bind(this);

    this.querySelectorAll('input').forEach((element) => {
      element.addEventListener('input', this.onRangeChange.bind(this));
      element.addEventListener('keydown', this.onKeyDown.bind(this));
    });
    this.querySelectorAll('input[type="text"]').forEach((element) => {
      element.addEventListener('keydown', this.debouncedKeyDown.bind(this));
    });
    this.setTrackbar();
    this.setMinAndMaxValues();
  }

  onRangeChange(event) {
    const type = event.target.dataset.type;
    if (event.target.type === 'range') {
      this.adjustToValidValues(event.currentTarget);
      const input = this.querySelector(`[data-type="${type}"][type="text"]`);
      input.value = event.target.value;
    } else {
      const input = this.querySelector(`[data-type="${type}"][type="range"]`);
      input.value = event.target.value;
    }
    this.setTrackbar();
    this.setMinAndMaxValues();
  }

  setTrackbar() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    const fromValue = (minInput.value / minInput.getAttribute('max')) * 100;
    const toValue = (maxInput.value / minInput.getAttribute('max')) * 100;
    this.style.setProperty('--price-start', `${fromValue}%`);
    this.style.setProperty('--price-end', `${toValue}%`);
  }

  onKeyDown(event) {
    if (event.metaKey) return;

    const pattern = /[0-9]|\.|,|Tab|Backspace|Enter|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Delete|Escape/;
    if (!event.key.match(pattern)) event.preventDefault();
    setTimeout(() => {
      if (event.target.value.indexOf('.') >= 0 || event.target.value.indexOf(',') > 0) {
        event.target.setCustomValidity(window.accessibilityStrings.priceValidity);
      } else {
        event.target.setCustomValidity('');
      }
      event.target.reportValidity();
    }, 0);
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) {
      const inputs = this.querySelectorAll('[data-type="min"]');
      inputs.forEach((input) => {
        input.setAttribute('data-max', maxInput.value);
      });
    }
    if (minInput.value) {
      const inputs = this.querySelectorAll('[data-type="max"]');
      inputs.forEach((input) => {
        input.setAttribute('data-min', minInput.value);
      });
    }
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('data-min'));
    const max = Number(input.getAttribute('data-max'));
    let isDefaultValue = true;

    if (input.dataset.type === 'max') {
      if (value != max) isDefaultValue = false;
    }

    if (input.dataset.type === 'min') {
      if (value != 0) isDefaultValue = false;
    }

    this.toggleAttribute('data-default-price', isDefaultValue);

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}

customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector('a');
    facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', this.closeFilter.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facets-form') || document.querySelector('facets-form');
    form.onActiveFilterClick(event);
  }
}

customElements.define('facet-remove', FacetRemove);
