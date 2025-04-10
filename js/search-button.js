// Search Button Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get all search forms
  const searchForms = document.querySelectorAll('#search-form');
  
  // Add event listeners to all search forms
  searchForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const searchInput = this.querySelector('input[type="text"]');
      const query = searchInput.value.trim();
      
      if (query) {
        // Redirect to search results page with the query
        window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
      }
    });
  });
  
  // Add event listener to the search icon button
  const searchIconButton = document.querySelector('a[data-bs-target="#offcanvasSearch"]');
  if (searchIconButton) {
    searchIconButton.addEventListener('click', function(e) {
      // Focus on the search input in the offcanvas when it opens
      setTimeout(() => {
        const offcanvasSearchInput = document.querySelector('#offcanvasSearch input[type="text"]');
        if (offcanvasSearchInput) {
          offcanvasSearchInput.focus();
        }
      }, 300); // Small delay to ensure the offcanvas is open
    });
  }
  
  // Add click event to search icons
  document.querySelectorAll('.search-bar iconify-icon').forEach(icon => {
    icon.addEventListener('click', function() {
      const searchForm = this.closest('form');
      if (searchForm) {
        const searchInput = searchForm.querySelector('input[type="text"]');
        const query = searchInput.value.trim();
        
        if (query) {
          // Redirect to search results page with the query
          window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
        } else {
          // If the input is empty, focus on it
          searchInput.focus();
        }
      }
    });
  });
  
  // Add event listener to the search input in the offcanvas
  const offcanvasSearchInput = document.querySelector('#offcanvasSearch input[type="text"]');
  if (offcanvasSearchInput) {
    offcanvasSearchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = this.value.trim();
        
        if (query) {
          // Redirect to search results page with the query
          window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
        }
      }
    });
  }
  
  // Add event listener to the search input in the main search bar
  const mainSearchInput = document.querySelector('.search-bar:not(#offcanvasSearch .search-bar) input[type="text"]');
  if (mainSearchInput) {
    mainSearchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = this.value.trim();
        
        if (query) {
          // Redirect to search results page with the query
          window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
        }
      }
    });
  }
  
  // Add search suggestions functionality
  const searchInputs = document.querySelectorAll('.search-bar input[type="text"]');
  searchInputs.forEach(input => {
    input.addEventListener('input', function() {
      const query = this.value.trim().toLowerCase();
      
      if (query.length >= 2) {
        // Get products from localStorage or use the products array from search.js
        const products = JSON.parse(localStorage.getItem('products')) || window.products || [];
        
        // Filter products based on the query
        const suggestions = products.filter(product => 
          product.name.toLowerCase().includes(query) || 
          product.description.toLowerCase().includes(query)
        ).slice(0, 5); // Limit to 5 suggestions
        
        // Create or update suggestions dropdown
        let suggestionsDropdown = document.querySelector('.search-suggestions');
        
        if (suggestions.length > 0) {
          if (!suggestionsDropdown) {
            suggestionsDropdown = document.createElement('div');
            suggestionsDropdown.className = 'search-suggestions';
            input.parentNode.appendChild(suggestionsDropdown);
          }
          
          suggestionsDropdown.innerHTML = suggestions.map(product => `
            <div class="suggestion-item" data-id="${product.id}">
              <div class="d-flex align-items-center">
                <img src="${product.image}" alt="${product.name}" class="me-2" style="width: 30px; height: 30px; object-fit: cover;">
                <div>
                  <div class="suggestion-name">${product.name}</div>
                  <div class="suggestion-price">₹${product.price}</div>
                </div>
              </div>
            </div>
          `).join('');
          
          // Add click event to suggestion items
          const suggestionItems = suggestionsDropdown.querySelectorAll('.suggestion-item');
          suggestionItems.forEach(item => {
            item.addEventListener('click', function() {
              const productId = this.getAttribute('data-id');
              window.location.href = `single-product.html?id=${productId}`;
            });
          });
          
          suggestionsDropdown.style.display = 'block';
        } else if (suggestionsDropdown) {
          suggestionsDropdown.style.display = 'none';
        }
      } else if (document.querySelector('.search-suggestions')) {
        document.querySelector('.search-suggestions').style.display = 'none';
      }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.search-bar')) {
        const suggestionsDropdown = document.querySelector('.search-suggestions');
        if (suggestionsDropdown) {
          suggestionsDropdown.style.display = 'none';
        }
      }
    });
  });
}); 