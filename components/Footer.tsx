import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white mt-auto">
            <div className="container mx-auto py-4 px-4 text-center text-gray-500">
                <p>&copy; {new Date().getFullYear()} SellAnything.com. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
