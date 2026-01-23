document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('all-products-grid');
    const searchInput = document.getElementById('product-search');
    let allProducts = [];

    if (!productsGrid) return;

    // FIXED CATEGORY ORDER
    const orderedCategories = [
        "Laptops & Desktops",
        "Gaming Peripherals",
        "Office Solutions",
        "PC Components",
        "Networking / Switches",
        "Networking / Routers",
        "Networking / Adapters"
    ];

    // Fetch Products
    fetch('data/products.updated.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(products => {
            allProducts = products;
            renderCategorizedProducts(allProducts);
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            productsGrid.innerHTML =
                '<p class="text-center">Failed to load products. Please try again later.</p>';
        });

    // Render Categorized Products (ORDERED)
    function renderCategorizedProducts(products) {
        productsGrid.innerHTML = '';
        const categories = {};

        // Group by category
        products.forEach(product => {
            if (!categories[product.category]) {
                categories[product.category] = [];
            }
            categories[product.category].push(product);
        });

        // Render in fixed order
        orderedCategories.forEach(categoryName => {
            if (!categories[categoryName]) return;

            const categoryProducts = categories[categoryName];

            const categorySection = document.createElement('div');
            categorySection.className = 'category-section margin-bottom-medium';

            // Header
            categorySection.innerHTML = `
                <div class="section-header text-center padding-bottom-small">
                    <h3>${categoryName}</h3>
                    <div class="line"></div>
                </div>
            `;

            // Products Grid
            const grid = document.createElement('div');
            grid.className = 'products-grid';

            const initialLimit = 8;
            const initialProducts = categoryProducts.slice(0, initialLimit);

            grid.innerHTML = initialProducts
                .map(product => getProductCardHTML(product))
                .join('');

            categorySection.appendChild(grid);

            // View All Button
            if (categoryProducts.length > initialLimit) {
                const btnContainer = document.createElement('div');
                btnContainer.className = 'text-center margin-top-small';

                const loadMoreBtn = document.createElement('button');
                loadMoreBtn.className = 'btn-secondary';
                loadMoreBtn.innerText = 'View All ' + categoryName;

                loadMoreBtn.addEventListener('click', function () {
                    const remainingProducts = categoryProducts.slice(initialLimit);
                    grid.insertAdjacentHTML(
                        'beforeend',
                        remainingProducts.map(product => getProductCardHTML(product)).join('')
                    );
                    this.remove();
                });

                btnContainer.appendChild(loadMoreBtn);
                categorySection.appendChild(btnContainer);
            }

            productsGrid.appendChild(categorySection);
        });
    }

    // Flat Search Results
    function renderFlatProducts(products) {
        if (products.length === 0) {
            productsGrid.innerHTML =
                '<p class="text-center">No products found matching your search.</p>';
            return;
        }

        productsGrid.innerHTML = `
            <div class="products-grid">
                ${products.map(product => getProductCardHTML(product)).join('')}
            </div>
        `;
    }

    // Product Card HTML
    function getProductCardHTML(product) {
        return `
            <div class="product-card">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}"
                        onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                </div>

                <div class="product-info">
                    <div class="category-tag">${product.category}</div>
                    <h3>${product.name}</h3>
                    <p class="description">
                        ${product.description ? product.description.substring(0, 80) + '...' : ''}
                    </p>
                    <p class="price">
                        ${typeof product.price_in_inr === 'number'
                            ? '₹' + product.price_in_inr.toLocaleString('en-IN')
                            : product.price_in_inr}
                    </p>
                    ${product.discount ? `<p class="discount">${product.discount}</p>` : ''}
                    <a href="#" class="btn-primary-small">View Details</a>
                </div>
            </div>
        `;
    }

    // Search Logic
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            const searchTerm = e.target.value.toLowerCase();

            if (searchTerm.trim() === '') {
                renderCategorizedProducts(allProducts);
            } else {
                const filteredProducts = allProducts.filter(product =>
                    product.name.toLowerCase().includes(searchTerm) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                    (product.category && product.category.toLowerCase().includes(searchTerm))
                );

                renderFlatProducts(filteredProducts);
            }
        });
    }
});
