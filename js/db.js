// Database configuration
const dbConfig = {
    name: 'lendx',
    version: 1,
    description: 'LendX Database'
};

// Database operations
class Database {
    constructor() {
        this.init();
    }

    init() {
        // Initialize localStorage if not exists
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('items')) {
            localStorage.setItem('items', JSON.stringify([]));
        }
        if (!localStorage.getItem('cart_items')) {
            localStorage.setItem('cart_items', JSON.stringify([]));
        }
        if (!localStorage.getItem('requests')) {
            localStorage.setItem('requests', JSON.stringify([]));
        }
    }

    // User operations
    async createUser(userData) {
        try {
            const users = JSON.parse(localStorage.getItem('users'));
            const newUser = {
                id: users.length + 1,
                ...userData,
                created_at: new Date().toISOString()
            };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            return newUser;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async getUserByEmail(email) {
        try {
            const users = JSON.parse(localStorage.getItem('users'));
            return users.find(user => user.email === email);
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }

    // Item operations
    async createItem(itemData) {
        try {
            const items = JSON.parse(localStorage.getItem('items'));
            const newItem = {
                id: items.length + 1,
                ...itemData,
                created_at: new Date().toISOString()
            };
            items.push(newItem);
            localStorage.setItem('items', JSON.stringify(items));
            return newItem;
        } catch (error) {
            console.error('Error creating item:', error);
            throw error;
        }
    }

    async getItemsByOwner(ownerId) {
        try {
            const items = JSON.parse(localStorage.getItem('items'));
            return items.filter(item => item.owner_id === ownerId);
        } catch (error) {
            console.error('Error getting items:', error);
            throw error;
        }
    }

    // Cart operations
    async addToCart(userId, itemId, quantity = 1) {
        try {
            const cartItems = JSON.parse(localStorage.getItem('cart_items'));
            const existingItem = cartItems.find(item => item.user_id === userId && item.item_id === itemId);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cartItems.push({
                    id: cartItems.length + 1,
                    user_id: userId,
                    item_id: itemId,
                    quantity: quantity,
                    created_at: new Date().toISOString()
                });
            }

            localStorage.setItem('cart_items', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    }

    async getCartItems(userId) {
        try {
            const cartItems = JSON.parse(localStorage.getItem('cart_items'));
            const items = JSON.parse(localStorage.getItem('items'));
            return cartItems
                .filter(ci => ci.user_id === userId)
                .map(ci => ({
                    ...items.find(i => i.id === ci.item_id),
                    quantity: ci.quantity
                }));
        } catch (error) {
            console.error('Error getting cart items:', error);
            throw error;
        }
    }

    async removeFromCart(userId, itemId) {
        try {
            const cartItems = JSON.parse(localStorage.getItem('cart_items'));
            const updatedItems = cartItems.filter(item => !(item.user_id === userId && item.item_id === itemId));
            localStorage.setItem('cart_items', JSON.stringify(updatedItems));
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    }

    async clearCart(userId) {
        try {
            const cartItems = JSON.parse(localStorage.getItem('cart_items'));
            const updatedItems = cartItems.filter(item => item.user_id !== userId);
            localStorage.setItem('cart_items', JSON.stringify(updatedItems));
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    }

    // Request operations
    async createRequest(requestData) {
        try {
            const requests = JSON.parse(localStorage.getItem('requests'));
            const newRequest = {
                id: requests.length + 1,
                ...requestData,
                created_at: new Date().toISOString()
            };
            requests.push(newRequest);
            localStorage.setItem('requests', JSON.stringify(requests));
            return newRequest;
        } catch (error) {
            console.error('Error creating request:', error);
            throw error;
        }
    }

    async updateRequestStatus(requestId, status) {
        try {
            const requests = JSON.parse(localStorage.getItem('requests'));
            const request = requests.find(r => r.id === requestId);
            if (request) {
                request.status = status;
                localStorage.setItem('requests', JSON.stringify(requests));
                return request;
            }
            return null;
        } catch (error) {
            console.error('Error updating request status:', error);
            throw error;
        }
    }

    async getUserRequests(userId) {
        try {
            const requests = JSON.parse(localStorage.getItem('requests'));
            const items = JSON.parse(localStorage.getItem('items'));
            return requests
                .filter(r => r.user_id === userId)
                .map(r => ({
                    ...r,
                    item: items.find(i => i.id === r.item_id)
                }));
        } catch (error) {
            console.error('Error getting user requests:', error);
            throw error;
        }
    }

    async getLendingRequests(ownerId) {
        try {
            const requests = JSON.parse(localStorage.getItem('requests'));
            const items = JSON.parse(localStorage.getItem('items'));
            const users = JSON.parse(localStorage.getItem('users'));
            return requests
                .filter(r => {
                    const item = items.find(i => i.id === r.item_id);
                    return item && item.owner_id === ownerId;
                })
                .map(r => ({
                    ...r,
                    item: items.find(i => i.id === r.item_id),
                    user: users.find(u => u.id === r.user_id)
                }));
        } catch (error) {
            console.error('Error getting lending requests:', error);
            throw error;
        }
    }
}

// Create and export a single instance
const db = new Database();
export default db; 