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
            // Add ID for anchor navigation
            const categoryId = categoryName.toLowerCase().replace(/[\s&\/]+/g, '-');
            categorySection.id = categoryId;

            // Scroll margin offset for sticky header
            categorySection.style.scrollMarginTop = "100px";

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
        // Safe quote escaping for data attribute
        const safeProductInfo = encodeURIComponent(JSON.stringify(product));

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
                    <button class="btn-primary-small view-details-btn" data-product="${safeProductInfo}">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }

    // Modal Logic
    const modal = document.getElementById('product-modal');
    const closeModal = document.getElementById('close-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCategory = document.getElementById('modal-category');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');
    const modalDesc = document.getElementById('modal-description');
    const modalStock = document.getElementById('modal-availability');

    // Event Delegation for "View Details" click
    productsGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-details-btn')) {
            const productData = e.target.getAttribute('data-product');
            if (productData) {
                try {
                    const product = JSON.parse(decodeURIComponent(productData));
                    openModal(product);
                } catch (err) {
                    console.error("Error parsing product data", err);
                }
            }
        }
    });

    function openModal(product) {
        if (!modal) return;

        modalImg.src = product.image;
        modalCategory.textContent = product.category;
        modalTitle.textContent = product.name;

        modalPrice.textContent = typeof product.price_in_inr === 'number'
            ? '₹' + product.price_in_inr.toLocaleString('en-IN')
            : product.price_in_inr;

        // Use full description or fallback
        modalDesc.innerHTML = product.description
            ? product.description.replace(/:contentReference\[oaicite:\d+\]\{index=\d+\}/g, '') // Remove citation artifacts if any
            : 'No description available.';

        modalStock.textContent = product.availability || 'In Stock';

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close on outside click
    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Handle hash links on load (e.g. from footer)
    if (window.location.hash) {
        setTimeout(() => {
            const element = document.querySelector(window.location.hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 500); // Wait for render
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
