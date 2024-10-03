const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fetch = require('node-fetch');

const PRINTFUL_API_URL = 'https://api.printful.com';

exports.handler = async (event) => {
  console.log('stripe-webhook function called');
  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`
    };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    console.log('Checkout session completed');
    const session = stripeEvent.data.object;

    // Create order in Printful
    try {
      console.log('Attempting to create Printful order');
      const response = await fetch(`${PRINTFUL_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`
        },
        body: JSON.stringify({
          recipient: {
            name: session.shipping.name,
            address1: session.shipping.address.line1,
            city: session.shipping.address.city,
            state_code: session.shipping.address.state,
            country_code: session.shipping.address.country,
            zip: session.shipping.address.postal_code
          },
          items: [
            {
              variant_id: process.env.PRINTFUL_VARIANT_ID,
              quantity: 1
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const order = await response.json();
      console.log('Order created:', order);
    } catch (error) {
      console.error('Error creating Printful order:', error);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({received: true})
  };
};