document.addEventListener('DOMContentLoaded', () => {
    const sliderContainer = document.querySelector('.slider-container');
    const dotsContainer = document.querySelector('.slider-dots');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (!sliderContainer) return;

    let currentSlide = 0;
    let slides = [];
    let autoPlayInterval;

    // Fetch data from visual_solutions.json
    fetch('data/visual_solutions.json')
        .then(response => response.json())
        .then(data => {
            slides = data;
            renderSlides(data);
            startAutoPlay();
        })
        .catch(error => console.error('Error loading visual solutions:', error));

    function renderSlides(data) {
        sliderContainer.innerHTML = '';
        dotsContainer.innerHTML = '';

        data.forEach((product, index) => {
            // Create Slide
            const slide = document.createElement('div');
            slide.className = `slide ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `
                <div class="slide-content">
                    <span class="product-category">${product.category}</span>
                    <h2 class="product-name">${product.name}</h2>
                    <p class="product-description">${product.description}</p>
                    <div class="feature-list">
                        ${product.features.map(feature => `
                            <div class="feature-item">
                                <i class="fa-solid fa-check-circle"></i>
                                <span>${feature}</span>
                            </div>
                        `).join('')}
                    </div>
                    <span class="product-price">${product.price}</span>
                    <div class="slide-actions">
                        <a href="contact.html" class="btn-primary">Get Quote</a>
                        <a href="products.html" class="btn-secondary">View Details</a>
                    </div>
                </div>
                <div class="slide-visuals">
                    <div class="slide-image-wrapper">
                        <img src="${product.images[0]}" alt="${product.name}" class="slide-image main-image" 
                             onerror="this.src='https://via.placeholder.com/600x450/00A3E0/ffffff?text=${product.name.replace(/\s+/g, '+')}'">
                    </div>
                    
                    ${product.images.length > 1 ? `
                        <div class="thumbnail-gallery">
                            ${product.images.map((img, i) => `
                                <img src="${img}" 
                                     class="thumb ${i === 0 ? 'active' : ''}" 
                                     onclick="window.changeProductImage(event, this, '${img}')"
                                     onerror="this.style.display='none'">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
            sliderContainer.appendChild(slide);

            // Create Dot
            const dot = document.createElement('div');
            dot.className = `dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });
    }

    function goToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;

        currentSlide = index;

        // Update slider position
        sliderContainer.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Update active classes
        document.querySelectorAll('.slide').forEach((s, idx) => {
            s.classList.toggle('active', idx === currentSlide);
        });
        document.querySelectorAll('.dot').forEach((d, idx) => {
            d.classList.toggle('active', idx === currentSlide);
        });

        // Reset autoplay
        startAutoPlay();
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function startAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 8000); // Increased a bit to allow time to click thumbnails
    }

    // Global function for thumbnail clicks (since it's called from inline onclick)
    window.changeProductImage = function (e, thumb, imgSrc) {
        e.stopPropagation(); // Don't trigger slide click if we add one later

        const wrapper = thumb.closest('.slide-visuals');
        const mainImg = wrapper.querySelector('.main-image');

        // Remove active class from all thumbs in this wrapper
        wrapper.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));

        // Add active class to clicked thumb
        thumb.classList.add('active');

        // Change main image with a small fade effect
        mainImg.style.opacity = '0.5';
        setTimeout(() => {
            mainImg.src = imgSrc;
            mainImg.style.opacity = '1';
        }, 150);

        // Pause autoplay temporarily
        clearInterval(autoPlayInterval);
        setTimeout(startAutoPlay, 5000);
    };

    // Event Listeners
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Pause on hover
    sliderContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    sliderContainer.addEventListener('mouseleave', startAutoPlay);
});
