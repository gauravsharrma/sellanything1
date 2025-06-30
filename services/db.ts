import { User, Product, Order, Cart, Role } from '../types';

const DB_KEY = 'sellAnythingDB';

interface Database {
    users: User[];
    products: Product[];
    orders: Order[];
    carts: Cart[];
}

const getDB = (): Database => {
    try {
        const dbString = localStorage.getItem(DB_KEY);
        if (dbString) {
            return JSON.parse(dbString);
        }
    } catch (error) {
        console.error("Failed to parse DB from localStorage", error);
    }
    return { users: [], products: [], orders: [], carts: [] };
};

const saveDB = (db: Database) => {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (error) {
        console.error("Failed to save DB to localStorage", error);
    }
};

const seedData = () => {
    const db = getDB();
    if (db.users.length === 0 && db.products.length === 0) {
        const sellers: User[] = [
            { id: 'seller1', email: 'alice@example.com', name: 'Alice', profilePicUrl: 'https://i.pravatar.cc/150?u=seller1', roles: [Role.SELLER, Role.BUYER] },
            { id: 'seller2', email: 'bob@example.com', name: 'Bob', profilePicUrl: 'https://i.pravatar.cc/150?u=seller2', roles: [Role.SELLER] },
        ];

        const products: Product[] = [
            { id: 'prod1', sellerId: 'seller1', name: 'Vintage Leather Jacket', description: 'A stylish vintage leather jacket.', category: 'Apparel', price: 150, imageUrl: `https://picsum.photos/seed/prod1/400/300` },
            { id: 'prod2', sellerId: 'seller1', name: 'Handmade Wooden Chair', description: 'A beautifully crafted wooden chair.', category: 'Furniture', price: 250, imageUrl: `https://picsum.photos/seed/prod2/400/300` },
            { id: 'prod3', sellerId: 'seller2', name: 'Modern Art Print', description: 'A vibrant abstract art print for your home.', category: 'Home Decor', price: 75, imageUrl: `https://picsum.photos/seed/prod3/400/300` },
            { id: 'prod4', sellerId: 'seller2', name: 'Wireless Headphones', description: 'High-fidelity wireless headphones with noise cancellation.', category: 'Electronics', price: 199, imageUrl: `https://picsum.photos/seed/prod4/400/300` },
            { id: 'prod5', sellerId: 'seller1', name: 'Gourmet Coffee Beans', description: '1lb bag of single-origin Ethiopian coffee beans.', category: 'Food & Drink', price: 22, imageUrl: `https://picsum.photos/seed/prod5/400/300` },
        ];
        
        db.users.push(...sellers);
        db.products.push(...products);
        saveDB(db);
    }
};

// Initialize with seed data if DB is empty
seedData();

export const db = {
    // User operations
    loginUser: (email: string): User => {
        const db = getDB();
        let user = db.users.find(u => u.email === email);
        if (!user) {
            const userId = `user_${Date.now()}`;
            user = {
                id: userId,
                email,
                name: email.split('@')[0],
                profilePicUrl: `https://i.pravatar.cc/150?u=${userId}`,
                roles: [],
            };
            db.users.push(user);
            saveDB(db);
        }
        return user;
    },
    updateUser: (updatedUser: User): User | null => {
        const db = getDB();
        const userIndex = db.users.findIndex(u => u.id === updatedUser.id);
        if (userIndex !== -1) {
            db.users[userIndex] = updatedUser;
            saveDB(db);
            return updatedUser;
        }
        return null;
    },
    getUserById: (userId: string): User | undefined => {
        const db = getDB();
        return db.users.find(u => u.id === userId);
    },

    // Product operations
    getProducts: (): Product[] => getDB().products,
    getProductsBySeller: (sellerId: string): Product[] => getDB().products.filter(p => p.sellerId === sellerId),
    getProductById: (productId: string): Product | undefined => getDB().products.find(p => p.id === productId),
    addProduct: (productData: Omit<Product, 'id'>): Product => {
        const db = getDB();
        const newProduct: Product = {
            ...productData,
            id: `prod_${Date.now()}`,
        };
        db.products.unshift(newProduct);
        saveDB(db);
        return newProduct;
    },
    updateProduct: (productId: string, updates: Partial<Product>): Product | null => {
        const db = getDB();
        const productIndex = db.products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            db.products[productIndex] = { ...db.products[productIndex], ...updates };
            saveDB(db);
            return db.products[productIndex];
        }
        return null;
    },
    deleteProduct: (productId: string): boolean => {
        const db = getDB();
        const initialLength = db.products.length;
        db.products = db.products.filter(p => p.id !== productId);
        if (db.products.length < initialLength) {
            saveDB(db);
            return true;
        }
        return false;
    },

    // Cart operations
    getCart: (userId: string): Cart => {
        const db = getDB();
        let cart = db.carts.find(c => c.userId === userId);
        if (!cart) {
            cart = { userId, productIds: [] };
            db.carts.push(cart);
            saveDB(db);
        }
        return cart;
    },
    addToCart: (userId: string, productId: string): Cart => {
        const db = getDB();
        const cartIndex = db.carts.findIndex(c => c.userId === userId);
        if (cartIndex !== -1) {
            if (!db.carts[cartIndex].productIds.includes(productId)) {
                db.carts[cartIndex].productIds.push(productId);
            }
        } else {
            db.carts.push({ userId, productIds: [productId] });
        }
        saveDB(db);
        return db.carts.find(c => c.userId === userId)!;
    },
    removeFromCart: (userId: string, productId: string): Cart => {
        const db = getDB();
        const cartIndex = db.carts.findIndex(c => c.userId === userId);
        if (cartIndex !== -1) {
            db.carts[cartIndex].productIds = db.carts[cartIndex].productIds.filter(id => id !== productId);
            saveDB(db);
        }
        return db.carts.find(c => c.userId === userId) || { userId, productIds: [] };
    },
    clearCart: (userId: string): Cart => {
        const db = getDB();
        const cartIndex = db.carts.findIndex(c => c.userId === userId);
        if (cartIndex !== -1) {
            db.carts[cartIndex].productIds = [];
            saveDB(db);
        }
        return db.carts.find(c => c.userId === userId) || { userId, productIds: [] };
    },

    // Order operations
    createOrder: (buyerId: string, items: { productId: string; price: number }[]): Order => {
        const db = getDB();
        const newOrder: Order = {
            id: `order_${Date.now()}`,
            buyerId,
            items,
            purchaseDate: new Date().toISOString(),
        };
        db.orders.unshift(newOrder);
        db.carts = db.carts.filter(c => c.userId !== buyerId);
        saveDB(db);
        return newOrder;
    },
    getOrdersByBuyer: (buyerId: string): Order[] => getDB().orders.filter(o => o.buyerId === buyerId),
};
