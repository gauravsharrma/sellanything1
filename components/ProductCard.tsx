import React, { useState, useEffect } from 'react';
import { Product, User } from '../types';
import { getUserById } from '../services/firestore';
import { DollarSign, User as UserIcon } from 'lucide-react';
import Button from './Button';
import Modal from './Modal';
import { Link, useNavigate } from 'react-router-dom';

interface ProductCardProps {
    product: Product;
    distanceKm?: number;
    onMessageSeller?: (sellerId: string, productId: string) => void;
    onCategoryClick?: (category: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, distanceKm, onMessageSeller, onCategoryClick }) => {
    const [seller, setSeller] = useState<User | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);

    useEffect(() => {
        const load = async () => {
            const sellerData = await getUserById(product.sellerId);
            if (sellerData) {
                setSeller(sellerData);
            }
        };
        load();
    }, [product.sellerId]);

    const navigate = useNavigate();

    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate(`/product/${product.id}`)}
        >
            <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    setShowImageModal(true);
                }}
            />
            <div className="p-4 flex flex-col flex-grow">
                <span
                    className="text-xs font-semibold text-primary-600 uppercase tracking-wide cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        onCategoryClick && onCategoryClick(product.category);
                    }}
                >
                    {product.category}
                </span>
                <h3 className="text-lg font-bold text-gray-800 mt-1 mb-2 flex-grow">{product.name}</h3>

                {seller && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <UserIcon size={14} />
                        <Link
                            to={`/seller/${seller.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline"
                        >
                            Sold by {seller.name}
                        </Link>
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
                    <Button
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMessageSeller(product.sellerId, product.id);
                        }}
                    >
                        Message Seller
                    </Button>
                )}

                <div className="mt-auto" />
            </div>

            {showImageModal && (
                <Modal isOpen={true} onClose={() => setShowImageModal(false)} title={product.name}>
                    <img src={product.imageUrl} alt={product.name} className="max-h-[80vh] mx-auto" />
                </Modal>
            )}
        </div>
    );
};

export default ProductCard;
