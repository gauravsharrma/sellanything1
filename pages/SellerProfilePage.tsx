import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById, getProductsBySeller } from '../services/firestore';
import { User, Product, ProductStatus } from '../types';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import Modal from '../components/Modal';
import MessagingPage from './MessagingPage';

const SellerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (id) {
        const usr = await getUserById(id);
        setSeller(usr);
        const prods = await getProductsBySeller(id);
        setProducts(prods.filter(p => p.status === ProductStatus.LIVE));
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!seller) {
    return <div>Seller not found.</div>;
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-4 flex items-center gap-4">
        <img
          src={seller.profilePicUrl}
          alt={seller.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-grow">
          <h1 className="text-2xl font-bold">{seller.name}</h1>
        </div>
        <Button onClick={() => setShowMessage(true)}>Message Seller</Button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Listings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {showMessage && (
        <Modal
          isOpen={true}
          onClose={() => setShowMessage(false)}
          title={`Message ${seller.name}`}
        >
          <MessagingPage otherUserId={seller.id} />
        </Modal>
      )}
    </div>
  );
};

export default SellerProfilePage;
