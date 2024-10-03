document.addEventListener('DOMContentLoaded', () => {
    const addToCartButton = document.getElementById('add-to-cart');
    const header = document.querySelector('header');
    const colors = ['#ff4500', '#ffa500', '#ff6347', '#ff8c00', '#ff7f50'];
    const modal = document.getElementById('product-modal');
    const closeButton = document.getElementsByClassName('close')[0];
    const sizeOptions = document.getElementById('size-options');

    const stripe = Stripe('pk_live_51Q3HsWEd5RY1Bcmth0Z3ns3RLBvQv1TJb80lnUcTjX1uT5Wo1UqQUzAZNq70XYmj9V2vUuCZsUvDYmjPEBVgSW8L003hdA4aqA');

    const products = [
        {
            "id": 361393952,
            "name": "TRUMP The Fabuleux ",
            "variants": [
                { "id": 4550803016, "name": "TRUMP The Fabuleux  / S", "size": "S" },
                { "id": 4550803018, "name": "TRUMP The Fabuleux  / M", "size": "M" },
                { "id": 4550803019, "name": "TRUMP The Fabuleux  / L", "size": "L" },
                { "id": 4550803020, "name": "TRUMP The Fabuleux  / XL", "size": "XL" },
                { "id": 4550803022, "name": "TRUMP The Fabuleux  / 2XL", "size": "2XL" },
                { "id": 4550803024, "name": "TRUMP The Fabuleux  / 3XL", "size": "3XL" },
                { "id": 4550803025, "name": "TRUMP The Fabuleux  / 4XL", "size": "4XL" },
                { "id": 4550803026, "name": "TRUMP The Fabuleux  / 5XL", "size": "5XL" }
            ]
        }
    ];

    addToCartButton.addEventListener('click', () => {
        modal.style.display = 'block';
        sizeOptions.innerHTML = '';
        products[0].variants.forEach(variant => {
            const button = document.createElement('button');
            button.textContent = variant.size;
            button.className = 'size-button';
            button.addEventListener('click', () => initiateCheckout(variant.id));
            sizeOptions.appendChild(button);
        });
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    async function initiateCheckout(variantId) {
        modal.style.display = 'none';
        addToCartButton.textContent = 'Processing...';
        addToCartButton.disabled = true;

        try {
            const response = await fetch('/.netlify/functions/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ variantId }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const session = await response.json();
            const result = await stripe.redirectToCheckout({
                sessionId: session.id,
            });
            if (result.error) {
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('Error:', error);
            addToCartButton.textContent = 'Error. Try again';
        } finally {
            addToCartButton.disabled = false;
        }
    }

    // Create a spray paint effect on hover
    addToCartButton.addEventListener('mousemove', (e) => {
        const x = e.pageX - addToCartButton.offsetLeft;
        const y = e.pageY - addToCartButton.offsetTop;
        
        const sprayPaint = document.createElement('div');
        sprayPaint.className = 'spray-paint';
        sprayPaint.style.left = `${x}px`;
        sprayPaint.style.top = `${y}px`;
        sprayPaint.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        addToCartButton.appendChild(sprayPaint);
        
        setTimeout(() => sprayPaint.remove(), 1000);
    });

    // Animated background for header
    let degree = 0;
    setInterval(() => {
        degree = (degree + 1) % 360;
        header.style.backgroundImage = `linear-gradient(${degree}deg, #ff4500, #ffa500)`;
    }, 50);
});