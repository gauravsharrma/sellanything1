import React from 'react';
import Button from '../components/Button';
import { ShoppingBag, Store } from 'lucide-react';

interface LandingPageProps {
  onAction: (dashboard: 'BUYER' | 'SELLER') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAction }) => {
    return (
        <div className="text-center py-16 sm:py-24">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
                Welcome to <span className="text-primary-600">SellAnything.com</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                The ultimate marketplace to discover amazing products or start your own successful online store.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button onClick={() => onAction('BUYER')} size="lg" leftIcon={<ShoppingBag />}>
                    Explore as Buyer
                </Button>
                <Button onClick={() => onAction('SELLER')} size="lg" variant="secondary" leftIcon={<Store />}>
                    Start Selling
                </Button>
            </div>
        </div>
    );
};

export default LandingPage;
