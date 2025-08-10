document.addEventListener("DOMContentLoaded", function () {
    const allSportEventsForm = document.querySelectorAll(".sport-event-member-form-wrapper form");

    allSportEventsForm.forEach(function (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const formEl = event.target;
            const actionUrl = formEl.getAttribute("data-action");
            const requestObject = {};

            const firstName = formEl.querySelector("input[name='attributes[Firstname]']");
            const lastName = formEl.querySelector("input[name='attributes[Lastname]']");
            const email = formEl.querySelector("input[name='attributes[Email]']");
            const phoneNumber = formEl.querySelector("input[name='attributes[Phone number]']");
            const postalCode = formEl.querySelector("input[name='attributes[Postal code]']");
            const sex = formEl.querySelector("select[name='attributes[Sex]']");
            const birthDate = formEl.querySelector("input[name='attributes[Birth date]']");
            const memberId = formEl.querySelector("input[name='attributes[Member id]']");

            if (firstName) {
                requestObject["First name"] = firstName.value;
            }

            if (lastName) {
                requestObject["Last name"] = lastName.value;
            }

            if (email) {
                requestObject["Email"] = email.value;
            }

            if (phoneNumber) {
                requestObject["Phone number"] = phoneNumber.value;
            }

            if (postalCode) {
                requestObject["Postal code"] = postalCode.value;
            }

            if (sex) {
                requestObject["Sex"] = sex.value;
            }

            if (birthDate) {
                requestObject["Birth date"] = birthDate.value;
            }

            if (memberId) {
                requestObject["Member ID"] = memberId.value;
            }

            if (actionUrl) {
                actionUrl = "/" + actionUrl;

                fetch(actionUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "attributes": requestObject
                    })
                })
                .then(res => res.json())
                .then(() => {
                    const blockParentContainer = formEl.closest(".sport-event-member-form-container");

                    blockParentContainer.style.maxHeight = 0;
                })
            }
        });
    });
});