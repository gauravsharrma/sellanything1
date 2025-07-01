import React, { useState, useEffect } from 'react';
import { Product, User } from '../types';
import { getUserById } from '../services/firestore';
import { DollarSign, User as UserIcon } from 'lucide-react';
import Button from './Button';
import { Link } from 'react-router-dom';

interface ProductCardProps {
    product: Product;
    distanceKm?: number;
    onMessageSeller?: (sellerId: string, productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, distanceKm, onMessageSeller }) => {
    const [seller, setSeller] = useState<User | null>(null);

    useEffect(() => {
        const load = async () => {
            const sellerData = await getUserById(product.sellerId);
            if (sellerData) {
                setSeller(sellerData);
            }
        };
        load();
    }, [product.sellerId]);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
            <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">{product.category}</span>
                <h3 className="text-lg font-bold text-gray-800 mt-1 mb-2 flex-grow">{product.name}</h3>
                
                {seller && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <UserIcon size={14} />
                        <span>Sold by {seller.name}</span>
                    </div>
                )}

                <div className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                    <DollarSign size={20} className="text-gray-500"/>
                    <span>{product.price.toFixed(2)}</span>
                </div>

                {product.location && (
                    <div className="text-sm text-gray-500 mb-2">
                        <span>{product.location.address}</span>
                        {distanceKm !== undefined && (
                            <span className="ml-1">- {distanceKm.toFixed(1)} km away</span>
                        )}
                    </div>
                )}

                {onMessageSeller && (
                    <Button size="sm" onClick={() => onMessageSeller(product.sellerId, product.id)}>
                        Message Seller
                    </Button>
                )}

                <Link to={`/product/${product.id}`} className="text-primary-600 hover:underline text-sm mt-2">
                    View Details
                </Link>

                <div className="mt-auto" />
            </div>
        </div>
    );
};

export default ProductCard;
