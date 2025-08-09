document.addEventListener('DOMContentLoaded', (event) => {
    var purchaseEventOfferContainer = document.querySelector(".purchase-product-offer-wrapper");

    if (purchaseEventOfferContainer) {
        var offerProductVariantPickerContainer = purchaseEventOfferContainer.querySelector(".variant-picker");
        var allAvailableVariantOptions = offerProductVariantPickerContainer?.querySelectorAll(".variant-picker__label");
        var offeredProductHandle = purchaseEventOfferContainer.getAttribute("data-product-handle");

        if (offeredProductHandle) {
            allAvailableVariantOptions.forEach(function (variantOption) {
                variantOption.addEventListener("click", async function () {
                    var productData = await fetchEventOfferProductData(offeredProductHandle);

                    if (productData && productData.variants) {
                        console.log(productData)
                        updateProductVariants(productData.variants, productData.options);
                    }
                });
            });
        }
    }
});

async function fetchEventOfferProductData(productHandle) {
    var res = await fetch(window.Shopify.routes.root + `products/${productHandle}.js`);

    if (!res.ok) throw new Error('Product not found');

    return res.json();
}

function updateProductVariants(variants, productOptions) {
    var purchaseEventOfferContainer = document.querySelector(".purchase-product-offer-wrapper");
    var allSelectedOptionsEl = purchaseEventOfferContainer.querySelectorAll(".variant-picker__radio:checked");
    var allAvailableVariants = variants.filter((variant) => variant.available);
    var currentSelectedOptions = [];
    var availableVariantsOptions1 = [];
    var availableVariantsOptions2 = [];
    var availableVariantsOptions3 = [];

    for (selectedOption of allSelectedOptionsEl) {
        currentSelectedOptions.push(selectedOption.value);
    }

    allAvailableVariants.forEach((variant) => {
        if (availableVariantsOptions1.indexOf(variant.option1) === -1) {
            availableVariantsOptions1.push(variant.option1);
        }

        if (currentSelectedOptions[0] === variant.option1 && availableVariantsOptions2.indexOf(variant.option2) === -1) {
            availableVariantsOptions2.push(variant.option2);
        }

        if (availableVariantsOptions3.indexOf(variant.option3) === -1) {
            availableVariantsOptions3.push(variant.option3);
        }
    });

    if (currentSelectedOptions.length > 1) {
        var firstSelectedOption = currentSelectedOptions[0];


        allAvailableVariants = variants.filter((variant) => variant.available && variant.options[0] ===  firstSelectedOption);

        if (currentSelectedOptions.length > 2) {
            var secondSelectedOption = currentSelectedOptions[1];

            
            allAvailableVariants = allAvailableVariants.filter((variant) => variant.available && variant.options[1] === secondSelectedOption);
        }
    }

    var currentSelectedVariant = getCurrentSelectedVariant(variants, currentSelectedOptions, productOptions.length);

    console.log(allAvailableVariants)

    disableAllVariationSwatches();

    updateVariationSwathesAvailability(allAvailableVariants);

    enableDependedVariationSwatches(productOptions, availableVariantsOptions1, availableVariantsOptions2);

    updateCurrentProduct(currentSelectedVariant.length ? currentSelectedVariant[0] : {});
}

function enableDependedVariationSwatches(productOptions, availableVariantsOptions1, availableVariantsOptions2) {
    if (productOptions.length > 2) {
        var allVariantsSwatches = getAllVariantsSwatches();

        for (variationSwatch of allVariantsSwatches) {
            var variationSwatchValue = variationSwatch.value;

            if (availableVariantsOptions1 && availableVariantsOptions1.indexOf(variationSwatchValue) !== -1) {
                enableVariationSwatch(variationSwatch);
            }

            if (availableVariantsOptions2 && availableVariantsOptions2.indexOf(variationSwatchValue) !== -1) {
                enableVariationSwatch(variationSwatch);
            }
        }
    }
}

function enableVariationSwatch(variationSwatch) {
    var variationSwatchLabelEl = variationSwatch.nextElementSibling;
    var variationSwatchValue = variationSwatch.value;

    variationSwatch.classList.remove("disabled");

    if (variationSwatchLabelEl) {
        variationSwatchLabelEl.classList.remove("disabled");

        variationSwatchLabelEl.querySelector("span").innerHTML = variationSwatchValue;
    }
}

function updateVariationSwathesAvailability(availableVariants) {
    if (availableVariants && availableVariants.length) {
        var allVariantsSwatches = getAllVariantsSwatches();

        for (variationSwatch of allVariantsSwatches) {
            var variationSwatchValue = variationSwatch.value;

            for (let i = 0; i < availableVariants.length; i++) {
                var variant  = availableVariants[i];

                if (variant.options && variant.options.indexOf(variationSwatchValue) !== -1) {
                    enableVariationSwatch(variationSwatch);
                }
            }
        }
    }
}

function disableAllVariationSwatches() {
   var allVariantsSwatches = getAllVariantsSwatches();

   allVariantsSwatches.forEach(function (variantEl) {
        var optionValue = variantEl.value;
        var variantLabelEl = variantEl.nextElementSibling;

        if (variantLabelEl) {
            var variantLabelInner = variantLabelEl.querySelector("span");

            variantLabelInner.innerHTML = `<s>${optionValue}</s>`;
            variantLabelEl.classList.add("disabled");
        }

        variantEl.classList.add("disabled");
    });
}

function getAllVariantsSwatches() {
    var purchaseEventOfferContainer = document.querySelector(".purchase-product-offer-wrapper");
    var allVariantsSwatches = purchaseEventOfferContainer.querySelectorAll(".variant-picker__radio");

    return allVariantsSwatches;
}

function updateCurrentProduct(selectedProductData) {
    var purchaseEventOfferContainer = document.querySelector(".purchase-product-offer-wrapper");
    var mediaWrapper = purchaseEventOfferContainer.querySelector(".pdp__media");
    var mainImagesWrapper = mediaWrapper.querySelector(".pdp-thumbnails__main-wrapper");
    var thumbnailImagesWrapper = mediaWrapper.querySelector(".pdp-thumbnails__list");
    var addToCartButton = purchaseEventOfferContainer.querySelector(".buy-buttons__buttons button[type='submit']");
    var addToCartButtonTextInner = addToCartButton.querySelector("span");
    var localeTextSettings = window.variantStrings;
    var selectedProductImageId = selectedProductData.featured_media?.id;

    console.log(selectedProductData)

    if (selectedProductData.available) {

        addToCartButton.removeAttribute("aria-disabled");

        addToCartButtonTextInner.innerHTML = localeTextSettings.addToCart;
    } else {
        addToCartButton.setAttribute("aria-disabled", true);

        addToCartButtonTextInner.innerHTML = localeTextSettings.soldOut;
    }

    if (selectedProductImageId) {
        var activeMainImage = mainImagesWrapper.querySelector(".pdp-thumbnails__main[data-active]");
        var searchedMainImage = mainImagesWrapper.querySelector(`.pdp-thumbnails__main[data-media-id='${selectedProductImageId}']`);

        var activeThumbnailImage = thumbnailImagesWrapper.querySelector(".pdp-thumbnails__thumbnail[aria-pressed]");
        var searchThumbnailImage = thumbnailImagesWrapper.querySelector(`.pdp-thumbnails__thumbnail[data-thumbnail='${selectedProductImageId}']`);

        activeMainImage.removeAttribute("data-active");
        searchedMainImage?.setAttribute("data-active", true);

        activeThumbnailImage.removeAttribute("aria-pressed");
        searchThumbnailImage.setAttribute("aria-pressed", true);
    }
}

function getCurrentSelectedVariant(variants, currentSelectedOptions, allOptionsCount) {
    return variants.filter((variant) => {
        switch (allOptionsCount) {
            case 1:
                if (variant.option1 === currentSelectedOptions[0]) {
                    return variant;
                }

                break;
            case 2:
                if (variant.option1 === currentSelectedOptions[0] 
                    && variant.option2 === currentSelectedOptions[1]) {
                    return variant;
                }

                break;
            case 3:
                if (variant.option1 === currentSelectedOptions[0] 
                    && variant.option2 === currentSelectedOptions[1]
                    && variant.option3 === currentSelectedOptions[2]) {
                    return variant;
                }
                break;
            default:
                break;
        }
    });
}