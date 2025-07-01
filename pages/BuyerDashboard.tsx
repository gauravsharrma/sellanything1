import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { getProducts } from '../services/firestore';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';
import Modal from '../components/Modal';
import MessagingPage from './MessagingPage';

const toRad = (value: number) => (value * Math.PI) / 180;
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const BuyerDashboard: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [priceFilter, setPriceFilter] = useState('all');
    const [distanceFilter, setDistanceFilter] = useState('all');
    const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
    const [messageInfo, setMessageInfo] = useState<{sellerId: string; productId: string} | null>(null);

    useEffect(() => {
        const load = async () => {
            const prods = await getProducts();
            setProducts(prods);
            setLoading(false);
        };
        load();
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            });
        }
    }, []);

    const categories = useMemo(() => ['all', ...new Set(products.map(p => p.category))], [products]);

    const filteredProducts = useMemo(() => {
        let list = products
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(p => categoryFilter === 'all' || p.category === categoryFilter)
            .filter(p => {
                if (priceFilter === 'all') return true;
                const [min, max] = priceFilter.split('-').map(Number);
                return p.price >= min && (isNaN(max) || p.price <= max);
            });

        if (userLocation) {
            const withDistance = list.map(p => ({
                product: p,
                distance: p.location ? getDistance(userLocation.lat, userLocation.lng, p.location.lat, p.location.lng) : Infinity,
            }));

            return withDistance
                .filter(p => distanceFilter === 'all' || p.distance <= parseFloat(distanceFilter))
                .sort((a, b) => a.distance - b.distance);
        }

        return list.map(p => ({ product: p, distance: undefined }));
    }, [products, searchTerm, categoryFilter, priceFilter, userLocation, distanceFilter]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Buyer Dashboard</h1>
                        <p className="text-lg text-gray-600">Discover amazing products.</p>
                    </div>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 sticky top-[85px] z-40">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
                    </select>
                    <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="all">All Prices</option>
                        <option value="0-50">$0 - $50</option>
                        <option value="50-200">$50 - $200</option>
                        <option value="200-1000">$200 - $1000</option>
                        <option value="1000-Infinity">$1000+</option>
                    </select>
                    <select
                        value={distanceFilter}
                        onChange={(e) => setDistanceFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="all">Any Distance</option>
                        <option value="1">&lt; 1 km</option>
                        <option value="5">&lt; 5 km</option>
                        <option value="10">&lt; 10 km</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map(p => (
                    <ProductCard key={p.product.id} product={p.product} distanceKm={p.distance} onMessageSeller={(sellerId, productId) => setMessageInfo({ sellerId, productId })} />
                ))}
            </div>
            {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-16">
                    <p className="text-gray-500 text-xl">No products match your criteria.</p>
                </div>
            )}

            {messageInfo && (
                <Modal isOpen={true} onClose={() => setMessageInfo(null)} title="Message Seller">
                    <MessagingPage otherUserId={messageInfo.sellerId} productId={messageInfo.productId} />
                </Modal>
            )}
        </div>
    );
};

export default BuyerDashboard;
