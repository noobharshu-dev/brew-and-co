import { useState, useMemo, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import MenuCard from '../components/MenuCard';
import MenuModal from '../components/MenuModal';
import { fetchMenuItems } from '../services/api';

const categories = ["All", "Coffee", "Desserts", "Snacks"];

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const data = await fetchMenuItems();
        setMenuItems(data);
      } catch (error) {
        console.error("Failed to load menu data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadMenu();
  }, []);

  // Filter items based on active category
  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return menuItems;
    return menuItems.filter(item => item.category === activeCategory);
  }, [activeCategory, menuItems]);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pt-24 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center"
    >
      <MenuModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      {/* Page Header */}
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-heading font-bold text-5xl text-dark mb-4 drop-shadow-sm"
        >
          Our Menu
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-16 h-1 bg-brown mx-auto rounded origin-left"
        ></motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-dark/70 max-w-2xl mx-auto"
        >
          Carefully selected and lovingly prepared. Whether you're here for a morning pick-me-up or an afternoon treat, we have something to delight your senses.
        </motion.p>
      </div>

      {/* Category Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex flex-wrap justify-center gap-3 mb-12"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 border ${activeCategory === category
              ? 'bg-brown text-cream border-brown shadow-md shadow-brown/20 -translate-y-0.5'
              : 'bg-transparent text-brown border-brown/30 hover:bg-brown/10'
              }`}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* Main Content Area */}
      <div className="w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-brown mb-4" size={48} />
            <p className="text-dark/70 font-medium text-lg">Brewing your menu...</p>
          </div>
        ) : isError ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="bg-red-50 text-red-800 p-8 rounded-xl border border-red-200 max-w-md shadow-sm">
              <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
              <p className="font-semibold text-xl mb-2">Failed to load menu.</p>
              <p className="text-red-700/80">Please try again later or check your internet connection.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 font-medium text-red-600 hover:text-red-800 underline transition-colors"
              >
                Retry
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeCategory} // Force re-animation on category switch
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full"
          >
            {filteredItems.map(item => (
              <motion.div key={item._id} variants={fadeInUp}>
                <MenuCard
                  id={item._id}
                  image={item.image}
                  name={item.name}
                  price={item.price}
                  description={item.description}
                  category={item.category}
                  onViewDetails={setSelectedItem}
                />
              </motion.div>
            ))}

            {/* Empty State Fallback */}
            {filteredItems.length === 0 && (
              <motion.div variants={fadeInUp} className="col-span-full py-20 text-center text-dark/60 italic text-lg">
                No items found in this category right now!
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

    </motion.div>
  );
}