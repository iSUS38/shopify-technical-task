var firstSellingPlanCheckbox = document.querySelector(".product-main__purchase-type input");
var allSellingPlansButtons = document.querySelectorAll(".product-main__purchase-type label");
var sellinsPlanContainer = document.querySelector(".selling-plans");
var currentPlanSelector = sellinsPlanContainer.querySelector(".current");
var sellingPlanOptions = sellinsPlanContainer.querySelectorAll(".list li");
var urlParams = new URLSearchParams(window.location.search);
var selectedSellingPlan = urlParams.get("selling_plan");

if (firstSellingPlanCheckbox) {
  var pageUrl = window.location.href;

  if (pageUrl.indexOf("selling_plan=") === -1) {
   setTimeout(function () {
     firstSellingPlanCheckbox.click()
   }, 300);
  }
}

document.addEventListener("customVariantChanged", function(event) {
  var subscriptionWidget = document.querySelector(".custom-product-subscription-widget");

  if (subscriptionWidget) {
    var firstSubscriptionOption = subscriptionWidget.querySelector("label");

    if (firstSubscriptionOption) {
      var optionCheckbox = firstSubscriptionOption.querySelector("input");

      firstSubscriptionOption.click();

      setTimeout(function () {
         optionCheckbox.checked = true
      });
    }
  }
});

allSellingPlansButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    var quantitySelector = sellinsPlanContainer.querySelector(".quantity");
    var sellingPlanSelector = sellinsPlanContainer.querySelector(".nice-select");
    var buttonId = this.getAttribute("data-id");
    var selingPlanCheckboxes = document.querySelectorAll(".custom-product-subscription-widget .product-main__purchase-type input");
    var sellingPlanCheckbox = this.querySelector("input");
    let sellingPlanEmulator;

    selingPlanCheckboxes.forEach(function (checbox) {
      checbox.checked = false;
    });

    sellingPlanCheckbox.checked = true;

    if (buttonId === "1" || !buttonId) {
      sellingPlanEmulator = document.getElementById("appstle_selling_plan_label_10");

      sellingPlanSelector.style.height = "0";
    } else {
      sellingPlanEmulator = document.getElementById("appstle_selling_plan_label_20");

      sellingPlanSelector.style.height = "47px";
    }

    if (sellingPlanEmulator) {
       sellingPlanEmulator.click();
    }
  });
})

currentPlanSelector.addEventListener("click", function () {
  var sellingPlanSelector = sellinsPlanContainer.querySelector(".nice-select");

    if (sellingPlanSelector) {
      if (!sellingPlanSelector.classList.contains("opened")) {
        sellingPlanSelector.classList.add("opened");
      } else {
         sellingPlanSelector.classList.remove("opened");
      }
    }
});

sellingPlanOptions.forEach(function (option) {
  option.addEventListener("click", function () {
    console.log(true)
    var subscriptionAppEmulator = document.querySelector(".appstle_subscription_wrapper");
    var sellingPlan = document.querySelector(".product-main__purchase-type label[data-id='2'] input");
    var sellingPlanSelector = sellinsPlanContainer.querySelector(".nice-select");
    var newValue = this.innerHTML;
    var optionId = this.getAttribute("data-value");

    currentPlanSelector = sellinsPlanContainer.querySelector(".current");

    sellingPlanSelector.classList.remove("opened");
    sellingPlan.value = optionId;
    currentPlanSelector.innerHTML = newValue;

    if (subscriptionAppEmulator) {
      var sellingPlanEmulatorOptions = subscriptionAppEmulator.querySelectorAll(".appstleRadioSellingPlanWrapper input[type='radio']");

      var emulatorOption = [...sellingPlanEmulatorOptions].filter((emulatorOption) => emulatorOption.getAttribute("value") === optionId);

      if (emulatorOption.length) {
        emulatorOption[0].click();
      }
    }
  });
});

if (selectedSellingPlan && allSellingPlansButtons.length) {
  var activeSellingPlan = allSellingPlansButtons[allSellingPlansButtons.length - 1];

  if (activeSellingPlan) {
    var activeSellingPlanOption = [...sellingPlanOptions].filter((option) => option.getAttribute("data-value") === selectedSellingPlan);

    if (activeSellingPlanOption.length) {
      setTimeout(function () {
        activeSellingPlan.click();
        document.getElementById("appstle_selling_plan_label_20").click();
        activeSellingPlanOption[0].click();
      }, 300)
    }
  }
}