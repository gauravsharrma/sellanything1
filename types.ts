export enum Role {
    BUYER = 'BUYER',
    SELLER = 'SELLER',
}

export enum ProductStatus {
    DRAFT = 'draft',
    LIVE = 'live',
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
    location?: {
        address: string;
        lat: number;
        lng: number;
    };
    status: ProductStatus;
}


export interface Message {
    id: string;
    fromId: string;
    toId: string;
    text: string;
    productId?: string;
    createdAt: string;
}
