import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/firestore';
import { Product } from '../types';
import LocationMap from '../components/LocationMap';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (id) {
        const prod = await getProductById(id);
        setProduct(prod);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return (
      <div>
        <p className="mb-4">Product not found.</p>
        <Link to="/" className="text-primary-600 hover:underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="text-primary-600 hover:underline">&larr; Back</Link>
      <div className="bg-white rounded-lg shadow p-6 mt-4">
        <img src={product.imageUrl} alt={product.name} className="w-full h-64 object-cover rounded" />
        <h1 className="text-2xl font-bold mt-4">{product.name}</h1>
        <p className="mt-2 text-gray-700">{product.description}</p>
        <p className="mt-2 font-semibold">${product.price.toFixed(2)}</p>
        {product.location && (
          <div className="mt-4 space-y-2">
            <div>{product.location.address}</div>
            <LocationMap lat={product.location.lat} lng={product.location.lng} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
