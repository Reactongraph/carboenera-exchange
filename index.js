const express = require("express");
const app = express();
const path = require('path');
// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripe = require("stripe")('sk_test_51KzGYHSB5QKtikbpJ1c3PKCprsSq4G25ORfYkp1sM34rAuwF7P76dVmAeeQSLuQtfElycD5mSbSZRKp657U6V3XJ00K6zkjoyH');

app.use(express.static("public"));
app.use(express.json());

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the   order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

app.get('/', function (req, res) {
  const options = {
      root: path.join(__dirname, './public')
  };

  const fileName = 'checkout.html';
  res.sendFile(fileName, options, function (err) {
      if (err) {
          res.json(err);
      } else {
          console.log('Sent:', fileName);
      }
  });
});

app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;
  console.log(amount);
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: (amount*25) * 100,
    currency: "inr",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
    amount
  });
});




app.listen(4242, () => console.log("Node server listening on port http://localhost:4242 !"));