// Lend Management System
class LendManager {
  constructor() {
    // Check for valid session
    const sessionToken = JSON.parse(localStorage.getItem('sessionToken'));
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    console.log('LendManager constructor - Session token:', sessionToken);
    console.log('LendManager constructor - Current user:', this.currentUser);
    
    if (!sessionToken || !this.currentUser) {
      console.error('No valid session found in LendManager constructor');
      this.showNotification('Please log in to list items', 'error');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
      return;
    }
    
    // Check if session is expired
    const expirationDate = new Date(sessionToken.expiresAt);
    const now = new Date();
    
    if (expirationDate <= now) {
      console.error('Session expired in LendManager constructor');
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('currentUser');
      this.showNotification('Session expired. Please log in again.', 'error');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
      return;
    }
    
    // Session is valid, proceed with initialization
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateStorageInfo();
    // Check localStorage usage
    this.checkLocalStorageUsage();
  }

  setupEventListeners() {
    const lendForm = document.getElementById('lend-form');
    if (lendForm) {
      lendForm.addEventListener('submit', (e) => this.handleLendSubmit(e));
    }
    
    // Set up clear storage button
    const clearStorageBtn = document.getElementById('clear-storage');
    if (clearStorageBtn) {
      clearStorageBtn.addEventListener('click', () => {
        if (confirm('This will remove all but the 5 most recent items. Continue?')) {
          this.clearLocalStorage();
          this.updateStorageInfo();
        }
      });
    }
  }

  async handleLendSubmit(e) {
    e.preventDefault();
    
    try {
      // Verify user is still logged in
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        console.error('User not logged in during form submission');
        this.showNotification('Please log in to list items', 'error');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
        return;
      }
      
      // Update the current user reference
      this.currentUser = currentUser;
      
      // Get form values
      const itemName = document.getElementById('item-name').value;
      const category = document.getElementById('category').value;
      const description = document.getElementById('description').value;
      const price = parseFloat(document.getElementById('price').value);
      const imageFile = document.getElementById('image').files[0];
      
      // Validate inputs
      if (!itemName || !category || !description || !price || !imageFile) {
        this.showNotification('Please fill in all fields', 'error');
        return;
      }
      
      // Create a unique ID for the item
      const itemId = Date.now().toString();
      
      // Convert image to base64 for storage
      const imageBase64 = await this.fileToBase64(imageFile);
      
      // Log current user information
      console.log('Current user in handleLendSubmit:', this.currentUser);
      console.log('Current user ID:', this.currentUser.id);
      
      // Create item object
      const item = {
        id: itemId,
        name: itemName,
        category: category,
        description: description,
        price_per_hour: price,
        image_url: imageBase64,
        owner_id: this.currentUser.id,
        owner_name: this.currentUser.name,
        status: 'available',
        created_at: new Date().toISOString()
      };
      
      console.log('Item being created:', item);
      
      // Save item to localStorage
      this.saveItem(item);
      
      // Show success notification
      this.showNotification('Item listed successfully!', 'success');
      
      // Ensure user is still logged in before redirecting
      const userStillLoggedIn = localStorage.getItem('currentUser');
      if (!userStillLoggedIn) {
        console.error('User logged out during item listing process');
        this.showNotification('Session expired. Please log in again.', 'error');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
        return;
      }
      
      // Redirect to profile page after a short delay
      setTimeout(() => {
        console.log('Redirecting to profile page...');
        // Ensure we have a valid session before redirecting
        const sessionToken = JSON.parse(localStorage.getItem('sessionToken'));
        if (!sessionToken) {
          console.error('No session token found before redirecting to profile');
          this.showNotification('Session error. Please log in again.', 'error');
          window.location.href = 'login.html';
          return;
        }
        
        // Check if session is expired
        const expirationDate = new Date(sessionToken.expiresAt);
        const now = new Date();
        
        if (expirationDate <= now) {
          console.error('Session expired before redirecting to profile');
          localStorage.removeItem('sessionToken');
          localStorage.removeItem('currentUser');
          this.showNotification('Session expired. Please log in again.', 'error');
          window.location.href = 'login.html';
          return;
        }
        
        // Session is valid, redirect to profile
        window.location.href = 'profile.html';
      }, 1500);
      
    } catch (error) {
      console.error('Error listing item:', error);
      this.showNotification('Error listing item', 'error');
    }
  }
  
  saveItem(item) {
    try {
      console.log('Starting to save item:', item);
      
      // Get existing items or initialize empty array
      const items = JSON.parse(localStorage.getItem('items') || '[]');
      console.log('Existing items:', items);
      
      // Add new item
      items.push(item);
      console.log('Updated items:', items);
      
      try {
        // Try to save to localStorage
        localStorage.setItem('items', JSON.stringify(items));
        console.log('Item saved successfully:', item);
      } catch (storageError) {
        console.error('Storage error:', storageError);
        
        // Check if it's a quota exceeded error
        if (storageError.name === 'QuotaExceededError' || 
            storageError.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
            (storageError.message && storageError.message.includes('quota'))) {
          
          console.log('LocalStorage quota exceeded. Implementing fallback...');
          
          // Fallback 1: Try to save without the image
          if (item.image_url) {
            console.log('Attempting to save without image...');
            const itemWithoutImage = {...item};
            itemWithoutImage.image_url = 'images/placeholder.png'; // Use a placeholder image
            
            // Remove the current item from the array
            const index = items.findIndex(i => i.id === item.id);
            if (index !== -1) {
              items.splice(index, 1);
            }
            
            // Add the item without image
            items.push(itemWithoutImage);
            
            try {
              localStorage.setItem('items', JSON.stringify(items));
              console.log('Item saved successfully without image');
              this.showNotification('Item saved without image due to storage limitations', 'warning');
            } catch (fallbackError) {
              console.error('Fallback 1 failed:', fallbackError);
              
              // Fallback 2: Try to save with minimal data
              console.log('Attempting to save with minimal data...');
              const minimalItem = {
                id: item.id,
                name: item.name,
                category: item.category,
                price_per_hour: item.price_per_hour,
                owner_id: item.owner_id,
                owner_name: item.owner_name,
                status: item.status,
                created_at: item.created_at
              };
              
              // Remove the current item from the array
              const index = items.findIndex(i => i.id === item.id);
              if (index !== -1) {
                items.splice(index, 1);
              }
              
              // Add the minimal item
              items.push(minimalItem);
              
              try {
                localStorage.setItem('items', JSON.stringify(items));
                console.log('Minimal item saved successfully');
                this.showNotification('Item saved with minimal data due to storage limitations', 'warning');
              } catch (minimalError) {
                console.error('Fallback 2 failed:', minimalError);
                
                // Fallback 3: Clear some old items and try again
                console.log('Attempting to clear old items and save...');
                
                // Keep only the 10 most recent items
                const recentItems = items.slice(-10);
                localStorage.setItem('items', JSON.stringify(recentItems));
                
                // Try to add the new item
                recentItems.push(minimalItem);
                localStorage.setItem('items', JSON.stringify(recentItems));
                
                console.log('Saved after clearing old items');
                this.showNotification('Some old items were removed to save your new item', 'warning');
              }
            }
          } else {
            // If there's no image, try to save with minimal data
            console.log('No image to remove, trying to save with minimal data...');
            const minimalItem = {
              id: item.id,
              name: item.name,
              category: item.category,
              price_per_hour: item.price_per_hour,
              owner_id: item.owner_id,
              owner_name: item.owner_name,
              status: item.status,
              created_at: item.created_at
            };
            
            // Remove the current item from the array
            const index = items.findIndex(i => i.id === item.id);
            if (index !== -1) {
              items.splice(index, 1);
            }
            
            // Add the minimal item
            items.push(minimalItem);
            
            try {
              localStorage.setItem('items', JSON.stringify(items));
              console.log('Minimal item saved successfully');
              this.showNotification('Item saved with minimal data due to storage limitations', 'warning');
            } catch (minimalError) {
              console.error('Minimal save failed:', minimalError);
              throw new Error('Unable to save item: localStorage quota exceeded');
            }
          }
        } else {
          // If it's not a quota error, rethrow
          throw storageError;
        }
      }
      
      // Verify the item was saved correctly
      const savedItems = JSON.parse(localStorage.getItem('items') || '[]');
      console.log('Verified saved items:', savedItems);
      
      // Check if the item exists in the saved items
      const itemExists = savedItems.some(savedItem => savedItem.id === item.id);
      console.log('Item exists in saved items:', itemExists);
      
      if (!itemExists) {
        console.error('Item was not saved correctly!');
        throw new Error('Failed to save item');
      }
      
      // Log the current user ID for verification
      console.log('Current user ID:', this.currentUser.id);
      console.log('Item owner ID:', item.owner_id);
      
      if (this.currentUser.id !== item.owner_id) {
        console.error('Owner ID mismatch!');
        console.error('Current user ID:', this.currentUser.id);
        console.error('Item owner ID:', item.owner_id);
      }
    } catch (error) {
      console.error('Error saving item:', error);
      throw error; // Re-throw the error to be caught by the caller
    }
  }
  
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      // Create a canvas element to compress the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set maximum dimensions for the image
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        // Set canvas dimensions to the new size
        canvas.width = width;
        canvas.height = height;
        
        // Draw the image on the canvas with the new dimensions
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with reduced quality
        const base64String = canvas.toDataURL('image/jpeg', 0.6); // 0.6 quality (60%)
        
        console.log('Image compressed and converted to base64');
        console.log('Original file size:', file.size, 'bytes');
        console.log('Compressed base64 size:', base64String.length, 'bytes');
        
        resolve(base64String);
      };
      
      img.onerror = () => {
        console.error('Error loading image for compression');
        // Fallback to direct FileReader if compression fails
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      };
      
      // Load the image from the file
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        img.src = reader.result;
      };
      reader.onerror = error => reject(error);
    });
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

  // Add this method to the LendManager class
  clearLocalStorage() {
    try {
      // Get all items
      const items = JSON.parse(localStorage.getItem('items') || '[]');
      
      // Keep only the 5 most recent items
      const recentItems = items.slice(-5);
      
      // Save the recent items back to localStorage
      localStorage.setItem('items', JSON.stringify(recentItems));
      
      console.log('Cleared old items from localStorage, kept 5 most recent');
      this.showNotification('Cleared old items from storage', 'success');
      
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      this.showNotification('Error clearing storage', 'error');
      return false;
    }
  }
  
  // Add this method to check localStorage usage
  checkLocalStorageUsage() {
    try {
      let totalSize = 0;
      
      // Calculate size of all items in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        totalSize += (key.length + value.length) * 2; // UTF-16 uses 2 bytes per character
      }
      
      console.log('Total localStorage size:', totalSize, 'bytes');
      
      // Check if we're approaching the quota (typically 5-10MB)
      if (totalSize > 4 * 1024 * 1024) { // 4MB
        console.warn('LocalStorage usage is high, approaching quota');
        this.showNotification('Storage space is running low', 'warning');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking localStorage usage:', error);
      return false;
    }
  }
  
  updateStorageInfo() {
    const storageInfoElement = document.getElementById('storage-info');
    if (!storageInfoElement) return;
    
    try {
      let totalSize = 0;
      let itemCount = 0;
      
      // Calculate size of all items in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        totalSize += (key.length + value.length) * 2; // UTF-16 uses 2 bytes per character
        
        if (key === 'items') {
          const items = JSON.parse(value || '[]');
          itemCount = items.length;
        }
      }
      
      // Format the size
      let sizeText = '';
      if (totalSize < 1024) {
        sizeText = `${totalSize} bytes`;
      } else if (totalSize < 1024 * 1024) {
        sizeText = `${(totalSize / 1024).toFixed(2)} KB`;
      } else {
        sizeText = `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
      }
      
      // Update the storage info display
      storageInfoElement.textContent = `Storage used: ${sizeText} | Items: ${itemCount}`;
      
      // Add warning class if storage is high
      if (totalSize > 4 * 1024 * 1024) { // 4MB
        storageInfoElement.classList.add('text-danger');
      } else {
        storageInfoElement.classList.remove('text-danger');
      }
    } catch (error) {
      console.error('Error updating storage info:', error);
      storageInfoElement.textContent = 'Error checking storage usage';
    }
  }
}

// Initialize lend manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.lendManager = new LendManager();
}); 