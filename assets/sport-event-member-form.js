document.addEventListener("DOMContentLoaded", function () {
    var allSportEventsForm = document.querySelectorAll(".sport-event-member-form-wrapper form");

    allSportEventsForm.forEach(function (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();

            var formEl = event.target;
            var actionUrl = formEl.action;
            var requestObject = {};

            var firstName = formEl.querySelector("input[name='attributes[Firstname]']");
            var lastName = formEl.querySelector("input[name='attributes[Lastname]']");
            var email = formEl.querySelector("input[name='attributes[Email]']");
            var phoneNumber = formEl.querySelector("input[name='attributes[Phone number]']");
            var postalCode = formEl.querySelector("input[name='attributes[Postal code]']");
            var sex = formEl.querySelector("select[name='attributes[Sex]']");
            var birthDate = formEl.querySelector("input[name='attributes[Birth date]']");
            var memberId = formEl.querySelector("input[name='attributes[Member id]']");

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
                fetch(actionUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "attributes": requestObject
                    })
                }).then(res => res.json()).then(res => console.log(res))
            }

            console.log(requestObject)

            console.log(actionUrl)
        });
    });
});