const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'The Fabuleux Tee',
            },
            unit_amount: 3999,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://thefabuleux.com?success=true',
      cancel_url: 'https://thefabuleux.com',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};