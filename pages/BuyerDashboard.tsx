import React, { useState, useMemo, useEffect } from 'react';
import { Product, Order, Role } from '../types';
import {
    getProducts,
    getOrdersByBuyer,
    addToCart as addToCartService,
    createOrder,
    getProductById,
} from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../contexts/DashboardContext';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import { Search, Repeat } from 'lucide-react';

const BuyerDashboard: React.FC = () => {
    const { user } = useAuth();
    const { setCurrentDashboard } = useDashboard();
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [priceFilter, setPriceFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('browse');

    useEffect(() => {
        const load = async () => {
            const prods = await getProducts();
            setProducts(prods);
            if (user) {
                const ords = await getOrdersByBuyer(user.id);
                setOrders(ords);
            }
            setLoading(false);
        };
        load();
    }, [user]);

    const handleAddToCart = async (productId: string) => {
        if (user) {
            await addToCartService(user.id, productId);
            alert('Item added to cart!');
        }
    };

    const handleBuyNow = async (productId: string) => {
        if (user) {
            const product = await getProductById(productId);
            if (product) {
                await createOrder(user.id, [{ productId: product.id, price: product.price }]);
                alert('Purchase successful!');
                const ords = await getOrdersByBuyer(user.id);
                setOrders(ords);
            }
        }
    };
    
    const categories = useMemo(() => ['all', ...new Set(products.map(p => p.category))], [products]);

    const filteredProducts = useMemo(() => {
        return products
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(p => categoryFilter === 'all' || p.category === categoryFilter)
            .filter(p => {
                if (priceFilter === 'all') return true;
                const [min, max] = priceFilter.split('-').map(Number);
                return p.price >= min && (isNaN(max) || p.price <= max);
            });
    }, [products, searchTerm, categoryFilter, priceFilter]);

    const renderBrowseTab = () => (
        <>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 sticky top-[85px] z-40">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
                ))}
            </div>
             {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-16">
                    <p className="text-gray-500 text-xl">No products match your criteria.</p>
                </div>
            )}
        </>
    );

    const renderPurchasesTab = () => {
         const getProductDetails = (productId: string) => products.find(p => p.id === productId);

        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Purchase History</h2>
                {orders.length === 0 ? (
                    <p className="text-gray-500">You haven't made any purchases yet.</p>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-semibold text-gray-700">Order #{order.id.slice(-6)}</p>
                                    <p className="text-sm text-gray-500">{new Date(order.purchaseDate).toLocaleDateString()}</p>
                                </div>
                                <ul className="divide-y divide-gray-100">
                                    {order.items.map(item => {
                                        const product = getProductDetails(item.productId);
                                        return product ? (
                                            <li key={item.productId} className="py-2 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <img src={product.imageUrl} alt={product.name} className="h-12 w-12 rounded-md object-cover"/>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{product.name}</p>
                                                        <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </li>
                                        ) : null;
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Buyer Dashboard</h1>
                        <p className="text-lg text-gray-600">Discover and purchase amazing products.</p>
                    </div>
                    {user?.roles.includes(Role.SELLER) && (
                        <Button
                            onClick={() => setCurrentDashboard('SELLER')}
                            variant="secondary"
                            leftIcon={<Repeat size={16} />}
                        >
                            Switch to Seller
                        </Button>
                    )}
                </div>
            </div>
             <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('browse')} className={`${activeTab === 'browse' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Browse Products
                    </button>
                    <button onClick={() => setActiveTab('purchases')} className={`${activeTab === 'purchases' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        My Purchases
                    </button>
                </nav>
            </div>
            {activeTab === 'browse' ? renderBrowseTab() : renderPurchasesTab()}
        </div>
    );
};

export default BuyerDashboard;
