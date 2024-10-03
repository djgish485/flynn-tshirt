const fetch = require('node-fetch');

const PRINTFUL_API_URL = 'https://api.printful.com';

exports.handler = async (event) => {
  try {
    console.log('Fetching products from Printful');
    // Fetch all products
    const productsResponse = await fetch(`${PRINTFUL_API_URL}/store/products?store_id=${process.env.PRINTFUL_STORE_ID}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`
      }
    });

    const responseText = await productsResponse.text();
    console.log('Printful API response:', responseText);

    if (!productsResponse.ok) {
      throw new Error(`HTTP error! status: ${productsResponse.status}, body: ${responseText}`);
    }

    const products = JSON.parse(responseText);

    // Fetch variants for each product
    const productsWithVariants = await Promise.all(products.result.map(async (product) => {
      const variantsResponse = await fetch(`${PRINTFUL_API_URL}/store/products/${product.id}?store_id=${process.env.PRINTFUL_STORE_ID}`, {
        headers: {
          'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`
        }
      });

      if (!variantsResponse.ok) {
        throw new Error(`HTTP error! status: ${variantsResponse.status}`);
      }

      const variants = await variantsResponse.json();
      return {
        ...product,
        variants: variants.result.sync_variants
      };
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(productsWithVariants, null, 2)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};