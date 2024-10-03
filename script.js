document.addEventListener('DOMContentLoaded', () => {
    const addToCartButton = document.getElementById('add-to-cart');
    const header = document.querySelector('header');
    const colors = ['#ff4500', '#ffa500', '#ff6347', '#ff8c00', '#ff7f50'];

    const stripe = Stripe('pk_live_51Q3HsWEd5RY1Bcmth0Z3ns3RLBvQv1TJb80lnUcTjX1uT5Wo1UqQUzAZNq70XYmj9V2vUuCZsUvDYmjPEBVgSW8L003hdA4aqA');

    addToCartButton.addEventListener('click', async () => {
        addToCartButton.textContent = 'Processing...';
        addToCartButton.disabled = true;

        try {
            const response = await fetch('/.netlify/functions/create-checkout-session', {
                method: 'POST',
            });
            const session = await response.json();
            const result = await stripe.redirectToCheckout({
                sessionId: session.id,
            });
            if (result.error) {
                console.error(result.error);
                addToCartButton.textContent = 'Error. Try again';
            }
        } catch (error) {
            console.error('Error:', error);
            addToCartButton.textContent = 'Error. Try again';
        }

        addToCartButton.disabled = false;
    });

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