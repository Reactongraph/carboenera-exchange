// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripe = Stripe("pk_test_51KzGYHSB5QKtikbpO3QdyqEpIdmSfrT8xvNbtj8YbLnp43LuKLGDOHznzrtBayshoUmomS2rsAE2OixM8blmEaGZ00wpYMvaYt");

const items = [{ id: "xl-tshirt" }];

let timeoutId;
let elements;
let emailAddress = '';
let leastValue = -1;
const totalOffset = document.getElementById('totalOffset');
const calculateBtn = document.getElementById("calculateBtn");

// 1.3 < 1 or 2

document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);

// Fetches a payment intent and captures the client secret
async function initialize(amount) {
  const response = await fetch("/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  const { clientSecret } = await response.json();

  const appearance = {
    theme: 'stripe',
  };
  elements = stripe.elements({ appearance, clientSecret });

  const linkAuthenticationElement = elements.create("linkAuthentication");
  linkAuthenticationElement.mount("#link-authentication-element");

  linkAuthenticationElement.on('change', (event) => {
    emailAddress = event.value.email;
  });

  const paymentElementOptions = {
    layout: "tabs",
  };

  const paymentElement = elements.create("payment", paymentElementOptions);
  paymentElement.mount("#payment-element");
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      // Make sure to change this to your payment completion page
      return_url: "http://localhost:4242/success.html",
      receipt_email: emailAddress,
    },
  });

  // This point will only be reached if there is an immediate error when
  // confirming the payment. Otherwise, your customer will be redirected to
  // your `return_url`. For some payment methods like iDEAL, your customer will
  // be redirected to an intermediate site first to authorize the payment, then
  // redirected to the `return_url`.
  if (error.type === "card_error" || error.type === "validation_error") {
    showMessage(error.message);
  } else {
    showMessage("An unexpected error occurred.");
  }

  setLoading(false);
}

// Fetches the payment intent status after payment submission
async function checkStatus() {
  const clientSecret = new URLSearchParams(window.location.search).get(
    "payment_intent_client_secret"
  );

  if (!clientSecret) {
    return;
  }

  const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

  switch (paymentIntent.status) {
    case "succeeded":
      showMessage("Payment succeeded!");
      break;
    case "processing":
      showMessage("Your payment is processing.");
      break;
    case "requires_payment_method":
      showMessage("Your payment was not successful, please try again.");
      break;
    default:
      showMessage("Something went wrong.");
      break;
  }
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageText.textContent = "";
  }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}

// Change Listeners

document.getElementById('sourceInput')
  .addEventListener('keyup', (e) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      handleChange(e, 'source');
    }, 800)
  })

document.getElementById('destinationInput')
  .addEventListener('keyup', (e) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      handleChange(e, 'destination');
    }, 800)
  })


function handleChange(e, id) {
  var value = e.target.value;
  if (value.length > 2 && lettersOnly(e.keyCode)) {
    getAirportName(value, id);
  }
}

// get flight name
async function getAirportName(iata_code, id) {
  const url = 'https://airlabs.co/api/v9/airports?'
  const api_key = 'b6ac0453-afd5-40f0-92d2-1cda45f1d30f'
  const results = await ((await fetch(`${url}iata_code=${iata_code}&api_key=${api_key}`)).json());
  if (!results.response.length) {
    alert('Please Enter Correct IATA CODE !!!')
    return
  }
  setDataList(id, results.response);
}

function setDataList(id, dataList) {
  console.log(dataList);
  const element = document.getElementById(id);
  var innerHtml = '';
  for (data of dataList) {
    innerHtml += ` <option value="${data.iata_code}">${data.iata_code}, ${data.name}, ${data.country_code}</option>`
  }
  element.innerHTML = innerHtml;
}


function lettersOnly(charCode) {
  if ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123) || charCode == 8)
    return true;
  else
    return false;
}

function convertToInteger(n) {
  const truncNumber = Math.trunc(n);
  return truncNumber ? parseFloat((n - truncNumber).toFixed(1)) < 0.4 ? truncNumber : truncNumber + 1 : 1;
}


// increament/decreament code.
function changeOffsetValue(choice) {
  let value = parseInt(totalOffset.value);
  switch (choice) {
    case 'inc':
      totalOffset.value = value + 1;
      break;
    case 'dec':
      if (leastValue === value) {
        alert('this is the minimum !!!');
        return 
      }
      totalOffset.value = value - 1;
      break;
    default:
      console.log('object');
      break;
  }
}

// Calculate Button Event

calculateBtn.addEventListener('click', (e) => {
  if(leastValue !== -1) {
    var form = document.getElementById("payment-form");
    form.style.removeProperty('display')

    initialize(parseInt(totalOffset.value));
    checkStatus();
    return
  }
  const source = document.getElementById('sourceInput');
  const destination = document.getElementById('destinationInput');
  console.log(source.value, destination.value);
  if (!source.value && !destination.value) {
    alert('Error')
    return;
  }
  calculateCorbonApi(source.value, destination.value);

})

// Get Total Carbon emission
async function calculateCorbonApi(source, destination) {
  const url = 'https://www.carboninterface.com/api/v1/estimates';
  const token = '0RYByWjercRypNI1o1SQ';
  const result = await (await fetch(url, {
    method: 'post',
    headers: new Headers({
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'

    }),
    body: JSON.stringify({
      "type": "flight",
      "legs": [
        {
          "departure_airport": source,
          "destination_airport": destination
        }
      ]
    })
  })).json();
  showCarbonEmission(result);
}

function showCarbonEmission(result) {
  if (result.message) {
    alert("These IATA codes are invalid !!!");
    return;
  }

  const carbonEmissionText = document.getElementById("carbonAmount");
  const carbonDetails = document.getElementById("carbonDetails");
  const totalCarbonEmission = convertToInteger(result.data.attributes.carbon_mt)
  carbonEmissionText.innerText = `Total Carbon Emission: ${result.data.attributes.carbon_mt} Metric Ton.`;
  carbonDetails.innerText = `
        distance: ${result.data.attributes.distance_value} ${result.data.attributes.distance_unit}
        Total Carbon Emission: ${result.data.attributes.carbon_kg} KG

  `

  totalOffset.value = totalCarbonEmission;
  leastValue = totalCarbonEmission;
  var x = document.getElementById("actionBtns");
  x.classList.remove("hide");
  calculateBtn.innerText = 'Confirm Purchase'
  // var form = document.getElementById("payment-form");
  // form.style.removeProperty('display')

  // initialize(totalCarbonEmission);
  // checkStatus();
}