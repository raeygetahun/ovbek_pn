import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <p className="text-sm">&copy; 2024 Overbeck Museum | Alte Hafenstraße 30 | 28757 Bremen</p>
        {/* Add additional footer content here if needed */}
      </div>
    </footer>
  );
};

export default Footer;
