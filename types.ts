export enum Role {
    BUYER = 'BUYER',
    SELLER = 'SELLER',
}

export enum ProductStatus {
    DRAFT = 'draft',
    LIVE = 'live',
}

export enum OrderStatus {
    PENDING = 'pending',
    PAID = 'paid',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
}

export const CATEGORIES = [
    'Electronics',
    'Clothing',
    'Home & Kitchen',
    'Beauty & Personal Care',
    'Sports & Outdoors',
    'Books',
    'Toys & Games',
    'Automotive',
    'Health & Household',
];

export interface User {
    id: string;
    email: string;
    name: string;
    profilePicUrl: string;
    roles: Role[];
}

export interface Product {
    id: string;
    sellerId: string;
    name: string;
    description: string;
    category: string;
    price: number;
    currency: string;
    imageUrl: string;
    status: ProductStatus;
}

export interface Order {
    id: string;
    buyerId: string;
    items: { productId: string; price: number }[];
    purchaseDate: string;
    status: OrderStatus;
}

export interface Cart {
    userId: string;
    productIds: string[];
}

export interface CartItem {
    productId: string;
}

export interface Message {
    id: string;
    fromId: string;
    toId: string;
    text: string;
    productId?: string;
    createdAt: string;
}
