// Cart Management System
class Cart {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!this.currentUser) {
      window.location.href = 'login.html';
      return;
    }
    this.items = [];
    this.init();
    
    // Add global event delegation for cart actions
    document.addEventListener('click', this.handleCartActions.bind(this));
  }

  async init() {
    await this.loadCartItems();
    this.setupEventListeners();
    this.updateCartUI();
  }

  async loadCartItems() {
    try {
      // Get cart items from localStorage
      const cartItems = JSON.parse(localStorage.getItem(`cart_${this.currentUser.id}`)) || [];
      this.items = cartItems;
    } catch (error) {
      console.error('Error loading cart items:', error);
      this.showNotification('Error loading cart items', 'error');
    }
  }

  setupEventListeners() {
    // Add to cart buttons on index.html
    document.querySelectorAll('.btn-cart').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const card = e.target.closest('.card');
        if (!card) return;

        // Get item details from the card
        const itemName = card.querySelector('.card-title').textContent;
        const priceText = card.querySelector('.text-primary').textContent;
        const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
        const imageUrl = card.querySelector('img').src;

        // Create or get item
        let item = await this.getOrCreateItem({
          name: itemName,
          price_per_hour: price,
          image_url: imageUrl,
          status: 'available'
        });

        await this.addToCart(item.id);
        
        // Show the cart offcanvas
        const offcanvasCart = document.getElementById('offcanvasCart');
        if (offcanvasCart) {
          const bsOffcanvas = new bootstrap.Offcanvas(offcanvasCart);
          bsOffcanvas.show();
        }
      });
    });

    // Add to cart button on single-product.html
    const singleProductAddToCartBtn = document.getElementById('add-to-cart');
    if (singleProductAddToCartBtn) {
      singleProductAddToCartBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Get product details from the page
        const productTitle = document.querySelector('.product-title').textContent;
        const priceText = document.querySelector('.price').textContent;
        const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
        const quantity = parseInt(document.getElementById('quantity').value);
        const imageUrl = document.querySelector('.product-gallery-swiper img').src;
        
        // Create or get item
        let item = await this.getOrCreateItem({
          name: productTitle,
          price_per_hour: price,
          image_url: imageUrl,
          status: 'available'
        });
        
        // Add to cart with specified quantity
        await this.addToCart(item.id, quantity);
        
        // Show the cart offcanvas
        const offcanvasCart = document.getElementById('offcanvasCart');
        if (offcanvasCart) {
          const bsOffcanvas = new bootstrap.Offcanvas(offcanvasCart);
          bsOffcanvas.show();
        }
        
        this.showNotification(`Added ${quantity} ${productTitle} to cart`);
      });
    }

    // Checkout button
    const checkoutBtn = document.getElementById('send-requests-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.checkout();
      });
    }
    
    // Initial attachment of event listeners to cart items
    this.attachCartItemEventListeners();
  }

  async getOrCreateItem(itemData) {
    try {
      // Check if item exists in localStorage
      const items = JSON.parse(localStorage.getItem('items')) || [];
      let item = items.find(i => i.name === itemData.name);
      
      if (!item) {
        // Create new item
        item = {
          id: Date.now().toString(), // Use timestamp as ID
          name: itemData.name,
          description: itemData.description || '',
          price_per_hour: itemData.price_per_hour,
          image_url: itemData.image_url,
          owner_id: this.currentUser.id,
          owner_name: this.currentUser.name,
          status: 'available',
          created_at: new Date().toISOString()
        };
        
        // Save to localStorage
        items.push(item);
        localStorage.setItem('items', JSON.stringify(items));
      }
      
      return item;
    } catch (error) {
      console.error('Error getting/creating item:', error);
      throw error;
    }
  }

  async addToCart(itemId, quantity = 1) {
    try {
      // Get current cart items
      const cartItems = JSON.parse(localStorage.getItem(`cart_${this.currentUser.id}`)) || [];
      
      // Check if item already in cart
      const existingItem = cartItems.find(item => item.id === itemId);
      
      if (existingItem) {
        // Update quantity
        existingItem.quantity += quantity;
      } else {
        // Get item details
        const items = JSON.parse(localStorage.getItem('items')) || [];
        const item = items.find(i => i.id === itemId);
        
        if (item) {
          // Add to cart
          cartItems.push({
            ...item,
            quantity: quantity
          });
        }
      }
      
      // Save updated cart
      localStorage.setItem(`cart_${this.currentUser.id}`, JSON.stringify(cartItems));
      
      // Update UI
      this.items = cartItems;
      this.updateCartUI();
      this.showNotification('Item added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showNotification('Error adding item to cart', 'error');
    }
  }

  async updateQuantity(itemId, change) {
    try {
      // Get current cart items
      const cartItems = JSON.parse(localStorage.getItem(`cart_${this.currentUser.id}`)) || [];
      const itemIndex = cartItems.findIndex(item => item.id === itemId);
      
      if (itemIndex !== -1) {
        const newQuantity = cartItems[itemIndex].quantity + change;
        
        if (newQuantity > 0) {
          // Update quantity
          cartItems[itemIndex].quantity = newQuantity;
        } else {
          // Remove item
          cartItems.splice(itemIndex, 1);
        }
        
        // Save updated cart
        localStorage.setItem(`cart_${this.currentUser.id}`, JSON.stringify(cartItems));
        
        // Update UI
        this.items = cartItems;
        this.updateCartUI();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      this.showNotification('Error updating quantity', 'error');
    }
  }

  async removeItem(itemId) {
    try {
      // Get current cart items
      const cartItems = JSON.parse(localStorage.getItem(`cart_${this.currentUser.id}`)) || [];
      const itemIndex = cartItems.findIndex(item => item.id === itemId);
      
      if (itemIndex !== -1) {
        // Remove item
        cartItems.splice(itemIndex, 1);
        
        // Save updated cart
        localStorage.setItem(`cart_${this.currentUser.id}`, JSON.stringify(cartItems));
        
        // Update UI
        this.items = cartItems;
        this.updateCartUI();
        this.showNotification('Item removed from cart');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      this.showNotification('Error removing item', 'error');
    }
  }

  updateCartUI() {
    // Update cart badge
    const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = totalItems;
    });

    // Update cart items list
    const cartList = document.querySelector('#offcanvasCart .list-group');
    const cartTotal = document.getElementById('cart-total');
    const sendRequestsBtn = document.getElementById('send-requests-btn');

    if (this.items.length === 0) {
      cartList.innerHTML = '<li class="list-group-item d-flex justify-content-between lh-sm"><p>No items in cart.</p></li>';
      cartTotal.textContent = '₹0.00';
      sendRequestsBtn.style.display = 'none';
      return;
    }

    cartList.innerHTML = this.items.map(item => `
      <li class="list-group-item d-flex justify-content-between lh-sm">
        <div class="d-flex justify-content-between w-100">
          <div>
            <h6 class="my-0">${item.name}</h6>
            <small class="text-muted">₹${item.price_per_hour} per hour</small>
            <div class="d-flex align-items-center mt-2">
              <button class="btn btn-sm btn-outline-secondary me-2" onclick="cart.updateQuantity('${item.id}', -1)">-</button>
              <span>${item.quantity}</span>
              <button class="btn btn-sm btn-outline-secondary ms-2" onclick="cart.updateQuantity('${item.id}', 1)">+</button>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <button class="btn btn-sm btn-outline-danger" onclick="cart.removeItem('${item.id}')">
              <iconify-icon icon="mdi:delete"></iconify-icon>
            </button>
          </div>
        </div>
      </li>
    `).join('');

    // Calculate total price
    const total = this.items.reduce((sum, item) => {
      return sum + (item.price_per_hour * item.quantity);
    }, 0);
    
    cartTotal.textContent = `₹${total.toFixed(2)}`;
    sendRequestsBtn.style.display = 'block';
  }
  
  attachCartItemEventListeners() {
    // Quantity decrease buttons
    document.querySelectorAll('.decrease-quantity').forEach(button => {
      button.addEventListener('click', (e) => {
        const itemId = e.target.dataset.itemId;
        this.updateQuantity(itemId, -1);
      });
    });

    // Quantity increase buttons
    document.querySelectorAll('.increase-quantity').forEach(button => {
      button.addEventListener('click', (e) => {
        const itemId = e.target.dataset.itemId;
        this.updateQuantity(itemId, 1);
      });
    });

    // Remove item buttons
    document.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', (e) => {
        const itemId = e.target.dataset.itemId;
        this.removeItem(itemId);
      });
    });
  }

  handleCartActions(event) {
    const target = event.target;
    
    // Handle quantity decrease
    if (target.matches('.decrease-quantity')) {
      const itemId = target.dataset.itemId;
      this.updateQuantity(itemId, -1);
    }
    
    // Handle quantity increase
    else if (target.matches('.increase-quantity')) {
      const itemId = target.dataset.itemId;
      this.updateQuantity(itemId, 1);
    }
    
    // Handle item removal
    else if (target.matches('.remove-item')) {
      const itemId = target.dataset.itemId;
      this.removeItem(itemId);
    }
  }

  async checkout() {
    if (this.items.length === 0) {
      this.showNotification('Your cart is empty', 'error');
      return;
    }

    try {
      // Get current requests
      const requests = JSON.parse(localStorage.getItem('requests')) || [];
      
      // Create requests for each item
      for (const item of this.items) {
        requests.push({
          id: Date.now().toString() + Math.floor(Math.random() * 1000),
          user_id: this.currentUser.id,
          item_id: item.id,
          quantity: item.quantity,
          status: 'pending',
          created_at: new Date().toISOString()
        });
      }
      
      // Save requests
      localStorage.setItem('requests', JSON.stringify(requests));

      // Clear cart
      localStorage.setItem(`cart_${this.currentUser.id}`, JSON.stringify([]));
      this.items = [];
      this.updateCartUI();
      this.showNotification('Checkout successful! Redirecting to profile...');
      
      // Redirect to profile page after a short delay
      setTimeout(() => {
        window.location.href = 'profile.html';
      }, 1500);
    } catch (error) {
      console.error('Checkout error:', error);
      this.showNotification('Error during checkout', 'error');
    }
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.style.top = '80px'; // Position below the header
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cart = new Cart();
}); 