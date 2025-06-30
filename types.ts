export enum Role {
    BUYER = 'BUYER',
    SELLER = 'SELLER',
}

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
    imageUrl: string;
}

export interface Order {
    id: string;
    buyerId: string;
    items: { productId: string; price: number }[];
    purchaseDate: string;
}

export interface Cart {
    userId: string;
    productIds: string[];
}

export interface CartItem {
    productId: string;
}
