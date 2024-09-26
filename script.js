document.addEventListener('DOMContentLoaded', () => {
    const addToCartButton = document.getElementById('add-to-cart');
    const header = document.querySelector('header');
    const colors = ['#ff4500', '#ffa500', '#ff6347', '#ff8c00', '#ff7f50'];

    addToCartButton.addEventListener('click', () => {
        addToCartButton.textContent = 'Added to Cart!';
        addToCartButton.style.backgroundColor = '#4CAF50';
        setTimeout(() => {
            addToCartButton.textContent = 'Add to Cart';
            addToCartButton.style.backgroundColor = '#ff4500';
        }, 2000);
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