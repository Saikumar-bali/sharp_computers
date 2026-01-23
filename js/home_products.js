document.addEventListener('DOMContentLoaded', () => {
    const productSectionsContainer = document.getElementById('home-product-sections');

    if (!productSectionsContainer) return;

    fetch('data/products.updated.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(products => {
            const categories = {};

            // Group products by category
            products.forEach(product => {
                if (!categories[product.category]) {
                    categories[product.category] = [];
                }
                categories[product.category].push(product);
            });

            // FIXED CATEGORY ORDER (as requested)
            const orderedCategories = [
                "Laptops & Desktops",
                "Gaming Peripherals",
                "Office Solutions",
                "PC Components",
                "Networking / Switches",
                "Networking / Routers",
                "Networking / Adapters"
            ];

            // Render categories in the exact order
            orderedCategories.forEach(categoryName => {
                if (!categories[categoryName]) return;

                const categoryProducts = categories[categoryName];
                const displayProducts = categoryProducts.slice(0, 4);

                // Create section with unique ID for anchor navigation
                const categoryId = categoryName.toLowerCase().replace(/[\s&\/]/g, '-');
                const section = document.createElement('section');
                section.className = 'section-padding';
                section.id = categoryId;

                section.innerHTML = `
                    <div class="container">
                        <div class="section-header text-center padding-bottom-small">
                            <h2>${categoryName}</h2>
                            <div class="line"></div>
                        </div>

                        <div class="products-grid">
                            ${displayProducts.map(product => `
                                <div class="product-card">
                                    <div class="product-image-container">
                                        <img 
                                            src="${product.image}" 
                                            alt="${product.name}"
                                            onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                                    </div>

                                    <div class="product-info">
                                        <h3>${product.name}</h3>

                                        <p class="price">
                                            ${typeof product.price_in_inr === 'number'
                        ? '₹' + product.price_in_inr.toLocaleString('en-IN')
                        : product.price_in_inr}
                                        </p>

                                        <a href="products.html" class="btn-text">
                                            View Details <i class="fa-solid fa-arrow-right"></i>
                                        </a>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <div class="text-center margin-top-small">
                            <a href="products.html" class="btn-secondary">
                                View All ${categoryName}
                            </a>
                        </div>
                    </div>
                `;

                productSectionsContainer.appendChild(section);
            });
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            productSectionsContainer.innerHTML = `
                <p class="text-center">
                    Failed to load products. Please try again later.
                </p>
            `;
        });
});
