import React, { useState, useEffect } from 'react';
import { Product, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
    getProductsBySeller,
    addProduct as addProductService,
    updateProduct as updateProductService,
    deleteProduct as deleteProductService,
} from '../services/firestore';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, Repeat } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';

const SellerDashboard: React.FC = () => {
    const { user } = useAuth();
    const { setCurrentDashboard } = useDashboard();
    const [products, setProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (user) {
                const prods = await getProductsBySeller(user.id);
                setProducts(prods);
            }
            setLoading(false);
        };
        load();
    }, [user]);

    const handleOpenModal = (product: Product | null = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingProduct(null);
        setIsModalOpen(false);
    };

    const handleSaveProduct = async (formData: Omit<Product, 'id' | 'sellerId'>) => {
        if (user) {
            if (editingProduct) {
                await updateProductService(editingProduct.id, formData);
            } else {
                await addProductService({ ...formData, sellerId: user.id });
            }
            const prods = await getProductsBySeller(user.id);
            setProducts(prods);
            handleCloseModal();
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            if (user) {
                await deleteProductService(productId);
                const prods = await getProductsBySeller(user.id);
                setProducts(prods);
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                  <h1 className="text-4xl font-bold text-gray-900">Seller Dashboard</h1>
                  <p className="text-lg text-gray-600">Manage your products and listings.</p>
                </div>
                <div className="flex items-center gap-2">
                    {user?.roles.includes(Role.BUYER) && (
                        <Button
                            onClick={() => setCurrentDashboard('BUYER')}
                            variant="secondary"
                            leftIcon={<Repeat size={16} />}
                        >
                            Switch to Buyer
                        </Button>
                    )}
                    <Button onClick={() => handleOpenModal()} leftIcon={<Plus />}> 
                        Add New Item
                    </Button>
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrl} alt={product.name} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleOpenModal(product)} className="text-primary-600 hover:text-primary-900 p-2 rounded-md hover:bg-primary-100">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-100">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {products.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-xl">You haven't listed any products yet.</p>
                        <Button onClick={() => handleOpenModal()} leftIcon={<Plus />} className="mt-4">
                            List Your First Item
                        </Button>
                    </div>
                 )}
            </div>

            {isModalOpen && (
                <ProductFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveProduct}
                    product={editingProduct}
                />
            )}
        </div>
    );
};

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: Omit<Product, 'id' | 'sellerId'>) => void;
    product: Product | null;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSave, product }) => {
    const [name, setName] = useState(product?.name || '');
    const [description, setDescription] = useState(product?.description || '');
    const [category, setCategory] = useState(product?.category || '');
    const [price, setPrice] = useState(product?.price.toString() || '');
    const [imageUrl, setImageUrl] = useState(product?.imageUrl || `https://picsum.photos/seed/${Date.now()}/400/300`);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            description,
            category,
            price: parseFloat(price),
            imageUrl,
        });
    };

    return (
        <Modal title={product ? 'Edit Product' : 'Add New Product'} isOpen={isOpen} onClose={onClose} size="lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">{product ? 'Save Changes' : 'Add Product'}</Button>
                </div>
            </form>
        </Modal>
    );
};


export default SellerDashboard;
