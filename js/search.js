// Product database - in a real application, this would come from a backend server
const products = [
  {
    id: 'steam-giftcards',
    name: 'Steam giftcards',
    category: 'gaming',
    price: 2000,
    rating: 4.0,
    image: 'images/item1.jpg',
    description: 'Steam gift cards for gaming enthusiasts'
  },
  {
    id: 'controller',
    name: 'Controller',
    category: 'gaming',
    price: 50,
    rating: 4.0,
    image: 'images/item2.jpg',
    description: 'Gaming controller for rent'
  },
  {
    id: 'nfs-rivals',
    name: 'NFS Rivals',
    category: 'gaming',
    price: 100,
    rating: 4.5,
    image: 'images/item3.jpg',
    description: 'Need for Speed Rivals racing game'
  },
  {
    id: 'lg-ultragear-monitor',
    name: 'LG UltraGear monitor',
    category: 'gaming',
    price: 150,
    rating: 4.0,
    image: 'images/item4.jpg',
    description: 'High-performance gaming monitor'
  },
  {
    id: 'netflix',
    name: 'Netflix',
    category: 'ott',
    price: 50,
    rating: 5.0,
    image: 'images/item9.jpg',
    description: 'Netflix streaming service'
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime',
    category: 'ott',
    price: 30,
    rating: 5.0,
    image: 'images/item10.jpg',
    description: 'Amazon Prime Video streaming service'
  },
  {
    id: 'jio-hotstar',
    name: 'Jio Hotstar',
    category: 'ott',
    price: 25,
    rating: 5.0,
    image: 'images/item11.jpeg',
    description: 'Hotstar streaming service'
  },
  {
    id: 'aha',
    name: 'Aha!',
    category: 'ott',
    price: 18,
    rating: 5.0,
    image: 'images/item12.png',
    description: 'Aha streaming service'
  }
];

// Make products available globally
window.products = products;

// Store products in localStorage for search-button.js to access
if (typeof localStorage !== 'undefined') {
  localStorage.setItem('products', JSON.stringify(products));
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q') || '';
  
  // Set search query in input and title
  document.getElementById('searchQuery').textContent = query;
  
  // Populate the search input with the current query
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.value = query;
  }
  
  // Initialize filters
  initializeFilters();
  
  // Perform initial search
  performSearch(query);
});

// Initialize filter event listeners
function initializeFilters() {
  // Category filters
  document.querySelectorAll('.form-check-input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => performSearch());
  });
  
  // Price range filter
  const priceRange = document.getElementById('priceRange');
  priceRange.addEventListener('input', () => performSearch());
  
  // Sort options
  document.getElementById('sortSelect').addEventListener('change', () => performSearch());
}

// Perform search with current filters
function performSearch(query = '') {
  // Get filter values
  const selectedCategories = Array.from(document.querySelectorAll('.form-check-input[type="checkbox"]:checked'))
    .map(cb => cb.value);
  
  const maxPrice = parseInt(document.getElementById('priceRange').value);
  const sortBy = document.getElementById('sortSelect').value;
  
  // Filter products
  let results = products.filter(product => {
    // Search query filter
    const matchesQuery = query === '' || 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(product.category);
    
    // Price filter
    const matchesPrice = product.price <= maxPrice;
    
    return matchesQuery && matchesCategory && matchesPrice;
  });
  
  // Sort results
  results = sortResults(results, sortBy);
  
  // Display results
  displayResults(results);
}

// Sort results based on selected option
function sortResults(results, sortBy) {
  switch(sortBy) {
    case 'price-low':
      return results.sort((a, b) => a.price - b.price);
    case 'price-high':
      return results.sort((a, b) => b.price - a.price);
    case 'rating':
      return results.sort((a, b) => b.rating - a.rating);
    default: // relevance - keep original order
      return results;
  }
}

// Display search results in the grid
function displayResults(results) {
  const grid = document.getElementById('searchResultsGrid');
  const noResults = document.getElementById('noResults');
  
  if (results.length === 0) {
    grid.style.display = 'none';
    noResults.style.display = 'block';
    
    // Update the no results message with the current query
    const query = document.getElementById('searchQuery').textContent;
    noResults.innerHTML = `
      <div class="text-center py-5">
        <h3>No results found for "${query}"</h3>
        <p class="mb-4">Try adjusting your search criteria or browse our categories</p>
        <div class="d-flex justify-content-center">
          <a href="index.html" class="btn btn-primary me-2">Go to Home</a>
          <button class="btn btn-outline-primary" onclick="document.getElementById('search-input').focus()">Try another search</button>
        </div>
      </div>
    `;
    return;
  }
  
  grid.style.display = 'flex';
  noResults.style.display = 'none';
  
  grid.innerHTML = results.map(product => `
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

// Update search forms to redirect to search results page
document.querySelectorAll('#search-form').forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const query = this.querySelector('input[type="text"]').value;
    window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
  });
}); 