import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import MenuCard from '../components/MenuCard';
import MenuModal from '../components/MenuModal';
import { fetchMenuItems } from '../services/api';

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const data = await fetchMenuItems();
        // Show only first 3 items returned
        setFeaturedItems(data.slice(0, 3));
      } catch (error) {
        console.error("Failed to load featured items:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const reviews = [
    { name: "Sarah Jenkins", quote: "The best flat white I've ever had. Period." },
    { name: "Michael Chen", quote: "Beautiful atmosphere and truly passionate baristas." },
    { name: "Jessica Alba", quote: "My go-to spot for Sunday morning pastries and coffee." }
  ];

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full flex-grow relative"
    >
      <MenuModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
        {/* Background Image Parallax effect via standard bg, or we just rely on the layout */}
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1920&auto=format&fit=crop" 
            alt="Cafe Interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <motion.h1 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="font-heading font-bold text-5xl md:text-7xl text-cream mb-6 drop-shadow-lg leading-tight"
          >
            <motion.span variants={fadeInUp} className="inline-block mr-3">Crafted</motion.span>
            <motion.span variants={fadeInUp} className="inline-block mr-3">for</motion.span>
            <motion.span variants={fadeInUp} className="italic text-beige inline-block">Connection</motion.span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl text-cream/90 mb-10 max-w-2xl font-light"
          >
            Premium, ethically sourced coffee served in an atmosphere designed to bring people together.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link 
              to="/menu" 
              className="bg-brown hover:bg-brown/90 text-cream px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5 shadow-md flex items-center justify-center"
            >
              View Menu
            </Link>
            <Link 
              to="/reservation" 
              className="bg-cream hover:bg-beige text-dark border border-transparent px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5 shadow-md flex items-center justify-center"
            >
              Reserve a Table
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURED MENU SECTION */}
      <motion.section 
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <motion.div variants={fadeInUp} className="text-center mb-10 md:mb-14">
          <h2 className="font-heading font-bold text-4xl text-brown mb-4">Our Favourites</h2>
          <div className="w-16 h-1 bg-brown mx-auto rounded"></div>
        </motion.div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="animate-spin text-brown mb-4" size={40} />
            <p className="text-dark/70 font-medium">Loading our favourites...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-red-50 text-red-800 p-6 rounded-lg border border-red-200">
              <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
              <p className="font-medium">Couldn't load featured items right now.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredItems.map(item => (
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
          </div>
        )}
        
        <motion.div variants={fadeInUp} className="text-center mt-12">
          <Link 
            to="/menu" 
            className="inline-flex items-center text-brown font-medium hover:text-dark transition-colors duration-200"
          >
            See Full Menu <ArrowRight size={20} className="ml-2" />
          </Link>
        </motion.div>
      </motion.section>

      {/* 3. ABOUT PREVIEW SECTION */}
      <section className="bg-beige/40 py-16 md:py-24">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center"
        >
          <motion.h2 variants={fadeInUp} className="font-heading font-bold text-4xl text-dark mb-6">The Brew & Co. Story</motion.h2>
          <motion.p variants={fadeInUp} className="text-dark/80 text-lg md:text-xl leading-relaxed max-w-3xl mb-10">
            Founded in 2026, Brew & Co. was built on a simple premise: great coffee shouldn't just taste amazing—it should be an experience. We spent months finding the perfect beans and designing a space that feels like a second home.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link 
              to="/about" 
              className="border-2 border-brown text-brown hover:bg-brown hover:text-cream px-8 py-3 rounded-lg font-medium transition-all duration-300 inline-block"
            >
              Learn More
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 4. CUSTOMER REVIEWS SECTION */}
      <motion.section 
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <motion.div variants={fadeInUp} className="text-center mb-10 md:mb-16">
          <h2 className="font-heading font-bold text-4xl text-dark mb-4">What Our Guests Say</h2>
          <div className="w-16 h-1 bg-brown mx-auto rounded"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <motion.div 
              key={idx} 
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-xl shadow-sm border border-beige flex flex-col items-center text-center transition-shadow hover:shadow-lg"
            >
              <div className="flex text-brown mb-4 space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="italic text-dark/80 font-heading text-lg leading-relaxed flex-grow">
                "{review.quote}"
              </p>
              <div className="mt-6 border-t border-beige/50 pt-4 w-full">
                <span className="font-medium text-dark">{review.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
      
    </motion.div>
  );
}
