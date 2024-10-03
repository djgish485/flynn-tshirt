const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fetch = require('node-fetch');

const PRINTFUL_API_URL = 'https://api.printful.com';

exports.handler = async (event) => {
  console.log('stripe-webhook function called');
  console.log('Event headers:', JSON.stringify(event.headers));
  console.log('Event body:', event.body);
  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('Stripe event constructed:', stripeEvent.type);
  } catch (err) {
    console.error('Error constructing event:', err.message);
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
      console.log('Session data:', JSON.stringify(session));
        
      let shippingInfo;
      if (session.shipping) {
        shippingInfo = session.shipping;
      } else if (session.customer_details) {
        shippingInfo = session.customer_details;
      } else {
        throw new Error('Shipping information is missing from the session');
      }

      console.log('Shipping info:', JSON.stringify(shippingInfo));

      const variantId = parseInt(process.env.PRINTFUL_VARIANT_ID, 10);
      console.log('Parsed Printful Variant ID:', variantId);

      const requestBody = {
        recipient: {
          name: shippingInfo.name || 'Customer',
          address1: shippingInfo.address?.line1 || '',
          city: shippingInfo.address?.city || '',
          state_code: shippingInfo.address?.state || '',
          country_code: shippingInfo.address?.country || '',
          zip: shippingInfo.address?.postal_code || ''
        },
        items: [
          {
            variant_id: variantId,
            quantity: 1
          }
        ],
        store_id: process.env.PRINTFUL_STORE_ID
      };

      console.log('Printful request body:', JSON.stringify(requestBody));

      const response = await fetch(`${PRINTFUL_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      console.log('Printful response:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
      }

      const order = JSON.parse(responseText);
      console.log('Order created:', JSON.stringify(order));
    } catch (error) {
      console.error('Error creating Printful order:', error);
      console.error('Error details:', error.response ? await error.response.text() : 'No response');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to create Printful order' })
      };
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({received: true})
  };
};