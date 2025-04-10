// Remove the database import since we're using localStorage
// import db from './db.js';

// Check if user is logged in
function checkLoginStatus() {
    // First check if there's a valid session token
    const sessionToken = JSON.parse(localStorage.getItem('sessionToken'));
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (sessionToken && currentUser) {
        // Check if session is expired
        const expirationDate = new Date(sessionToken.expiresAt);
        const now = new Date();
        
        if (expirationDate > now) {
            // Session is valid, show profile
            showProfileSection(currentUser);
            return true;
        } else {
            // Session expired, clear it
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('currentUser');
            showAuthSection();
            return false;
        }
    } else {
        // No session token or user, show auth section
        showAuthSection();
        return false;
    }
}

// Show authentication section
function showAuthSection() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('profile-section').style.display = 'none';
    document.getElementById('lending-requests').style.display = 'none';
    document.getElementById('requested-items').style.display = 'none';
}

// Show profile section
function showProfileSection(user) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('profile-section').style.display = 'block';
    document.getElementById('lending-requests').style.display = 'block';
    document.getElementById('requested-items').style.display = 'block';

    // Populate profile information
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileDob').textContent = user.dob;
    document.getElementById('profilePhone').textContent = user.phone;

    // Load lending requests and requested items
    loadLendingRequests(user.id);
    loadRequestedItems(user.id);
}

// Handle login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Store user in localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Create a session token with expiration (24 hours from now)
            const sessionToken = {
                userId: user.id,
                email: user.email,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            };
            
            // Store session token
            localStorage.setItem('sessionToken', JSON.stringify(sessionToken));
            
            // Show profile section
            showProfileSection(user);
        } else {
            alert('Invalid email or password');
        }
    });
}

// Handle register form submission
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const user = {
            id: Date.now().toString(),
            name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value,
            dob: document.getElementById('registerDob').value,
            phone: document.getElementById('registerPhone').value
        };

        // Get existing users
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if email already exists
        if (users.some(u => u.email === user.email)) {
            alert('Email already registered');
            return;
        }

        // Add new user
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(user));
        showProfileSection(user);
    });
}

// Load lending requests
function loadLendingRequests(userId) {
    const requests = JSON.parse(localStorage.getItem('lendingRequests')) || [];
    const userRequests = requests.filter(r => r.ownerId === userId);
    
    const requestsList = document.querySelector('.requests-list');
    requestsList.innerHTML = '';

    userRequests.forEach(request => {
        const requestElement = document.createElement('div');
        requestElement.className = 'request-item card mb-3';
        requestElement.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${request.itemName}</h5>
                <p class="card-text">Requested by: ${request.requesterName}</p>
                <p class="card-text">Duration: ${request.duration} days</p>
                <div class="btn-group">
                    <button class="btn btn-success" onclick="handleRequest('${request.id}', 'accept')">Accept</button>
                    <button class="btn btn-danger" onclick="handleRequest('${request.id}', 'reject')">Reject</button>
                </div>
            </div>
        `;
        requestsList.appendChild(requestElement);
    });
}

// Load requested items
function loadRequestedItems(userId) {
    const requests = JSON.parse(localStorage.getItem('lendingRequests')) || [];
    const userRequests = requests.filter(r => r.requesterId === userId);
    
    const itemsList = document.querySelector('.items-list');
    itemsList.innerHTML = '';

    userRequests.forEach(request => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item card mb-3';
        itemElement.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${request.itemName}</h5>
                <p class="card-text">Owner: ${request.ownerName}</p>
                <p class="card-text">Duration: ${request.duration} days</p>
                <p class="card-text">Status: ${request.status}</p>
            </div>
        `;
        itemsList.appendChild(itemElement);
    });
}

// Handle request actions (accept/reject)
function handleRequest(requestId, action) {
    const requests = JSON.parse(localStorage.getItem('lendingRequests')) || [];
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex !== -1) {
        if (action === 'accept') {
            requests[requestIndex].status = 'Accepted';
        } else {
            requests[requestIndex].status = 'Rejected';
        }
        
        localStorage.setItem('lendingRequests', JSON.stringify(requests));
        loadLendingRequests(JSON.parse(localStorage.getItem('currentUser')).id);
        loadRequestedItems(JSON.parse(localStorage.getItem('currentUser')).id);
    }
}

// Profile Management System
class Profile {
    constructor() {
        // Check for valid session
        const sessionToken = JSON.parse(localStorage.getItem('sessionToken'));
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        console.log('Profile constructor - Session token:', sessionToken);
        console.log('Profile constructor - Current user:', this.currentUser);
        
        if (!sessionToken || !this.currentUser) {
            console.log('No valid session found in constructor');
            return;
        }
        
        // Check if session is expired
        const expirationDate = new Date(sessionToken.expiresAt);
        const now = new Date();
        
        if (expirationDate <= now) {
            console.log('Session expired in constructor');
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('currentUser');
            return;
        }
        
        // Session is valid, proceed with initialization
        this.init();
    }

    async init() {
        try {
            // Double-check current user in case it was updated
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            if (!this.currentUser) {
                console.log('No current user found, redirecting to login page');
                window.location.href = 'login.html';
                return;
            }

            console.log('Initializing profile for user:', this.currentUser);
            
            // Check if elements exist before trying to access them
            const loginPlaceholder = document.getElementById('login-placeholder');
            const profileContent = document.getElementById('profile-content');
            
            if (loginPlaceholder) loginPlaceholder.style.display = 'none';
            if (profileContent) profileContent.style.display = 'block';

            await this.loadUserData();
            await this.loadListedItems();
            await this.loadRequests();
            await this.loadLendingRequests();
        } catch (error) {
            console.error('Error initializing profile:', error);
            this.showNotification('Error initializing profile', 'error');
        }
    }

    async loadUserData() {
        try {
            const user = this.currentUser;
            if (user) {
                console.log('Loading user data for:', user);
                
                // Check if elements exist before trying to access them
                const userNameElement = document.getElementById('user-name');
                const userEmailElement = document.getElementById('user-email');
                const userPhoneElement = document.getElementById('user-phone');
                
                if (userNameElement) userNameElement.textContent = user.name;
                if (userEmailElement) userEmailElement.textContent = user.email;
                if (userPhoneElement) userPhoneElement.textContent = user.phone || 'Not provided';
                
                console.log('User data loaded successfully');
            } else {
                console.error('No user data available to load');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showNotification('Error loading user data', 'error');
        }
    }

    async loadListedItems() {
        try {
            console.log('Loading listed items...');
            
            // Check if current user exists
            if (!this.currentUser || !this.currentUser.id) {
                console.error('No current user found when loading listed items');
                return;
            }
            
            // Get items from localStorage
            const items = JSON.parse(localStorage.getItem('items') || '[]');
            console.log('All items from localStorage:', items);
            
            // Log the current user ID for debugging
            console.log('Current user ID:', this.currentUser.id);
            
            // Filter items for the current user
            const userItems = items.filter(item => {
                console.log('Comparing item.owner_id:', item.owner_id, 'with currentUser.id:', this.currentUser.id);
                return item.owner_id === this.currentUser.id;
            });
            
            console.log('Filtered user items:', userItems);
            
            const listedItems = document.getElementById('listed-items');
            if (!listedItems) {
                console.error('Listed items element not found!');
                return;
            }
            
            if (!userItems || userItems.length === 0) {
                console.log('No items found for user');
                listedItems.innerHTML = '<tr><td colspan="5" class="text-center">No items listed</td></tr>';
                return;
            }

            listedItems.innerHTML = userItems.map(item => `
                <tr>
                    <td>
                        <img src="${item.image_url || 'images/placeholder.png'}" alt="${item.name}" 
                             class="rounded" style="width: 50px; height: 50px; object-fit: cover;">
                    </td>
                    <td>
                        <div>${item.name}</div>
                        <small class="text-muted">${item.description || 'No description'}</small>
                    </td>
                    <td>
                        <span class="badge ${item.status === 'available' ? 'bg-success' : 'bg-danger'}">
                            ${item.status}
                        </span>
                    </td>
                    <td>₹${item.price_per_hour}/hour</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="profile.deleteItem('${item.id}')">
                            <iconify-icon icon="mdi:delete" class="me-1"></iconify-icon> Delete
                        </button>
                    </td>
                </tr>
            `).join('');
            
            console.log('Listed items loaded successfully');
        } catch (error) {
            console.error('Error loading listed items:', error);
            this.showNotification('Error loading listed items', 'error');
        }
    }

    async loadRequests() {
        try {
            console.log('Loading requests...');
            
            // Check if current user exists
            if (!this.currentUser || !this.currentUser.id) {
                console.error('No current user found when loading requests');
                return;
            }
            
            // Get requests from localStorage instead of database
            const requests = JSON.parse(localStorage.getItem('requests') || '[]');
            console.log('All requests from localStorage:', requests);
            
            const userRequests = requests.filter(request => request.user_id === this.currentUser.id);
            console.log('Filtered user requests:', userRequests);
            
            const requestsList = document.getElementById('requests-list');
            if (!requestsList) {
                console.error('Requests list element not found!');
                return;
            }
            
            if (!userRequests || userRequests.length === 0) {
                console.log('No requests found for user');
                requestsList.innerHTML = '<tr><td colspan="4" class="text-center">No requests found</td></tr>';
                return;
            }

            // Get all items for reference
            const items = JSON.parse(localStorage.getItem('items') || '[]');
            console.log('All items for reference:', items);
            
            requestsList.innerHTML = userRequests.map(request => {
                // Find the corresponding item
                const item = items.find(i => i.id === request.item_id) || { name: 'Unknown Item', image_url: 'images/placeholder.png', price_per_hour: 0 };
                
                return `
                    <tr>
                        <td>
                            <img src="${item.image_url || 'images/placeholder.png'}" alt="${item.name}" 
                                 class="rounded" style="width: 50px; height: 50px; object-fit: cover;">
                        </td>
                        <td>
                            <div>${item.name}</div>
                            <small class="text-muted">Quantity: ${request.quantity}</small>
                        </td>
                        <td>
                            <span class="badge ${this.getStatusBadgeClass(request.status)}">
                                ${request.status}
                            </span>
                        </td>
                        <td>${new Date(request.created_at).toLocaleString()}</td>
                    </tr>
                `;
            }).join('');
            
            console.log('Requests loaded successfully');
        } catch (error) {
            console.error('Error loading requests:', error);
            this.showNotification('Error loading requests', 'error');
        }
    }

    async loadLendingRequests() {
        try {
            console.log('Loading lending requests...');
            
            // Check if current user exists
            if (!this.currentUser || !this.currentUser.id) {
                console.error('No current user found when loading lending requests');
                return;
            }
            
            // Get requests from localStorage
            const requests = JSON.parse(localStorage.getItem('requests') || '[]');
            console.log('All requests from localStorage:', requests);
            
            // Get all items for reference
            const items = JSON.parse(localStorage.getItem('items') || '[]');
            console.log('All items for reference:', items);
            
            // Filter requests for items owned by the current user
            const userItems = items.filter(item => item.owner_id === this.currentUser.id);
            console.log('User items:', userItems);
            
            const userItemIds = userItems.map(item => item.id);
            console.log('User item IDs:', userItemIds);
            
            const lendingRequests = requests.filter(request => 
                userItemIds.includes(request.item_id)
            );
            console.log('Filtered lending requests:', lendingRequests);
            
            const lendingRequestsList = document.getElementById('lending-requests');
            if (!lendingRequestsList) {
                console.error('Lending requests list element not found!');
                return;
            }
            
            if (!lendingRequests || lendingRequests.length === 0) {
                console.log('No lending requests found for user');
                lendingRequestsList.innerHTML = '<tr><td colspan="5" class="text-center">No lending requests found</td></tr>';
                return;
            }
            
            // Get all users for reference
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            console.log('All users for reference:', users);
            
            lendingRequestsList.innerHTML = lendingRequests.map(request => {
                // Find the corresponding item
                const item = items.find(i => i.id === request.item_id) || { name: 'Unknown Item', image_url: 'images/placeholder.png', price_per_hour: 0 };
                
                // Find the requester
                const requester = users.find(u => u.id === request.user_id) || { name: 'Unknown User' };
                
                return `
                    <tr>
                        <td>
                            <img src="${item.image_url || 'images/placeholder.png'}" alt="${item.name}" 
                                 class="rounded" style="width: 50px; height: 50px; object-fit: cover;">
                        </td>
                        <td>
                            <div>${item.name}</div>
                            <small class="text-muted">Requested by: ${requester.name}</small>
                        </td>
                        <td>
                            <span class="badge ${this.getStatusBadgeClass(request.status)}">
                                ${request.status}
                            </span>
                        </td>
                        <td>${new Date(request.created_at).toLocaleString()}</td>
                        <td>
                            <button class="btn btn-sm btn-success" onclick="profile.updateRequestStatus('${request.id}', 'accepted')">Accept</button>
                            <button class="btn btn-sm btn-danger" onclick="profile.updateRequestStatus('${request.id}', 'rejected')">Reject</button>
                        </td>
                    </tr>
                `;
            }).join('');
            
            console.log('Lending requests loaded successfully');
        } catch (error) {
            console.error('Error loading lending requests:', error);
            this.showNotification('Error loading lending requests', 'error');
        }
    }

    async handleRequest(requestId, status) {
        try {
            // Get requests from localStorage
            const requests = JSON.parse(localStorage.getItem('requests') || '[]');
            const requestIndex = requests.findIndex(r => r.id === requestId);
            
            if (requestIndex !== -1) {
                // Update request status
                requests[requestIndex].status = status;
                
                // Save updated requests
                localStorage.setItem('requests', JSON.stringify(requests));
                
                // Reload lending requests
                await this.loadLendingRequests();
                
                // Show notification
                this.showNotification(`Request ${status} successfully`, 'success');
            }
        } catch (error) {
            console.error('Error handling request:', error);
            this.showNotification('Error handling request', 'error');
        }
    }

    getStatusBadgeClass(status) {
        const classes = {
            'pending': 'bg-warning',
            'accepted': 'bg-success',
            'rejected': 'bg-danger',
            'completed': 'bg-info'
        };
        return classes[status] || 'bg-secondary';
    }

    showNotification(message, type = 'success') {
        // You can implement a notification system here
        console.log(`${type}: ${message}`);
    }

    // Add this method to handle request status updates
    updateRequestStatus(requestId, newStatus) {
        try {
            console.log(`Updating request ${requestId} status to ${newStatus}`);
            
            // Get requests from localStorage
            const requests = JSON.parse(localStorage.getItem('requests') || '[]');
            
            // Find the request
            const requestIndex = requests.findIndex(r => r.id === requestId);
            if (requestIndex === -1) {
                console.error(`Request with ID ${requestId} not found`);
                this.showNotification('Request not found', 'error');
                return;
            }
            
            // Update the request status
            requests[requestIndex].status = newStatus;
            requests[requestIndex].updated_at = new Date().toISOString();
            
            // Save the updated requests
            localStorage.setItem('requests', JSON.stringify(requests));
            
            console.log(`Request ${requestId} status updated to ${newStatus}`);
            this.showNotification(`Request ${newStatus} successfully`, 'success');
            
            // Reload the lending requests
            this.loadLendingRequests();
        } catch (error) {
            console.error('Error updating request status:', error);
            this.showNotification('Error updating request status', 'error');
        }
    }

    async deleteItem(itemId) {
        try {
            console.log(`Deleting item with ID: ${itemId}`);
            
            // Check if there are any pending requests for this item
            const requests = JSON.parse(localStorage.getItem('requests') || '[]');
            const pendingRequests = requests.filter(request => 
                request.item_id === itemId && 
                (request.status === 'pending' || request.status === 'accepted')
            );
            
            if (pendingRequests.length > 0) {
                alert(`Cannot delete this item because it has ${pendingRequests.length} pending request(s). Please handle these requests first.`);
                return;
            }
            
            // Show confirmation dialog
            if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
                console.log('Delete operation cancelled by user');
                return;
            }
            
            // Get items from localStorage
            const items = JSON.parse(localStorage.getItem('items') || '[]');
            
            // Filter out the item to be deleted
            const filteredItems = items.filter(item => item.id !== itemId);
            
            // Save the updated items
            localStorage.setItem('items', JSON.stringify(filteredItems));
            
            console.log(`Item with ID ${itemId} deleted successfully`);
            
            // Reload the listed items
            await this.loadListedItems();
            
            // Show notification
            this.showNotification('Item deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting item:', error);
            this.showNotification('Error deleting item', 'error');
        }
    }
}

// Initialize the profile
const profile = new Profile();
window.profile = profile; // Make it available globally for the onclick handlers

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Check if user is logged in with a valid session
        const sessionToken = JSON.parse(localStorage.getItem('sessionToken'));
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!sessionToken || !currentUser) {
            console.log('No valid session found, redirecting to login page');
            window.location.href = 'login.html';
            return;
        }
        
        // Check if session is expired
        const expirationDate = new Date(sessionToken.expiresAt);
        const now = new Date();
        
        if (expirationDate <= now) {
            console.log('Session expired, redirecting to login page');
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
            return;
        }
        
        // Session is valid, initialize the profile
        console.log('Valid session found, initializing profile');
        profile.init();
    } catch (error) {
        console.error('Error initializing profile:', error);
        // Only redirect if there's an actual error, not just missing user
        if (error.message && !error.message.includes('JSON')) {
            window.location.href = 'login.html';
        }
    }
}); 