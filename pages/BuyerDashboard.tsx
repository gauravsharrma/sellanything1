import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { getProducts } from '../services/firestore';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';

const BuyerDashboard: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [priceFilter, setPriceFilter] = useState('all');

    useEffect(() => {
        const load = async () => {
            const prods = await getProducts();
            setProducts(prods);
            setLoading(false);
        };
        load();
    }, []);

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
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-16">
                    <p className="text-gray-500 text-xl">No products match your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default BuyerDashboard;
