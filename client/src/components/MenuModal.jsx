import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X } from 'lucide-react';
import { useCart } from '../hooks/useCart';

export default function MenuModal({ item, onClose }) {
  const { addToCart } = useCart();

  if (!item) return null;

  const handleAddToCart = () => {
    addToCart(item);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        {/* Blurred Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-dark/40 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
          className="relative bg-cream w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row border border-beige"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-white/50 hover:bg-white backdrop-blur-sm rounded-full text-dark transition-colors shadow-sm"
          >
            <X size={20} />
          </button>

          {/* Left: Massive Image */}
          <div className="w-full md:w-1/2 h-64 md:h-[500px] shrink-0">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right: Details & Action */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-cream to-beige/30">
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-heading font-bold text-3xl md:text-4xl text-dark leading-tight">{item.name}</h3>
                  <p className="text-brown font-medium text-xl mt-2">${item.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="w-12 h-1 bg-brown rounded mb-6"></div>

              <p className="text-dark/70 text-lg leading-relaxed mb-8">
                {item.description}
              </p>

              {/* Fake Dietary Tags for UX realism */}
              <div className="flex gap-2 mb-10">
                <span className="px-3 py-1 bg-white border border-beige rounded-full text-xs font-medium text-dark/70 shadow-sm">
                  {item.category}
                </span>
                <span className="px-3 py-1 bg-white border border-beige rounded-full text-xs font-medium text-dark/70 shadow-sm">
                  Fresh Daily
                </span>
              </div>

              <button 
                onClick={handleAddToCart}
                className="w-full bg-brown hover:bg-brown/90 text-cream font-medium py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-brown/20 hover:-translate-y-1 flex items-center justify-center space-x-2 focus:ring-4 focus:ring-brown/30 outline-none"
              >
                <ShoppingCart size={20} />
                <span>Add to Cart</span>
              </button>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
