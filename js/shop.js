// Shop Page Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const filter = urlParams.get('filter') || 'all';
  
  // Set active filter button
  document.querySelectorAll('[data-filter]').forEach(button => {
    if (button.getAttribute('data-filter') === filter) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  
  // Filter products based on category
  filterProducts(filter);
  
  // Add event listeners to filter buttons
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', function() {
      const filter = this.getAttribute('data-filter');
      
      // Update active button
      document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
      
      // Filter products
      filterProducts(filter);
      
      // Update URL without reloading the page
      const newUrl = filter === 'all' ? 'shop.html' : `shop.html?filter=${filter}`;
      window.history.pushState({}, '', newUrl);
    });
  });
});

// Filter products based on category
function filterProducts(category) {
  // Get products from localStorage or use the products array from search.js
  const products = JSON.parse(localStorage.getItem('products')) || window.products || [];
  
  // Filter products based on category
  const filteredProducts = category === 'all' 
    ? products 
    : products.filter(product => product.category === category);
  
  // Display filtered products
  displayProducts(filteredProducts);
}

// Display products in the grid
function displayProducts(products) {
  const grid = document.getElementById('productsGrid');
  
  if (products.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <h3>No products found in this category</h3>
        <p class="mb-4">Try selecting a different category</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = products.map(product => `
    <div class="col-md-4 col-lg-3">
      <div class="card position-relative h-100">
        <a href="single-product.html?id=${product.id}">
          <img src="${product.image}" class="img-fluid rounded-4" alt="${product.name}" style="height: 250px; object-fit: cover;">
        </a>
        <div class="card-body p-0">
          <a href="single-product.html?id=${product.id}">
            <h3 class="card-title pt-4 m-0">${product.name}</h3>
          </a>
          <div class="card-text">
            <span class="rating secondary-font">
              ${getRatingStars(product.rating)}
              ${product.rating}
            </span>
            <h3 class="secondary-font text-primary">₹${product.price.toFixed(2)}</h3>
            <div class="d-flex flex-wrap mt-3">
              <a href="#" class="btn-cart me-3 px-4 pt-3 pb-3">
                <h5 class="text-uppercase m-0">Add to Cart</h5>
              </a>
              <a href="#" class="btn-wishlist px-4 pt-3">
                <iconify-icon icon="fluent:heart-28-filled" class="fs-5"></iconify-icon>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Generate rating stars HTML
function getRatingStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '<iconify-icon icon="clarity:star-solid" class="text-primary"></iconify-icon>';
    } else {
      stars += '<iconify-icon icon="clarity:star-outline" class="text-primary"></iconify-icon>';
    }
  }
  return stars;
} 