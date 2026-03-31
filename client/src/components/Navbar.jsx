import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../hooks/useCart';

export default function Navbar() {
  const { totalItemsCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (totalItemsCount === 0) return;
    setCartPulse(true);
    const timer = setTimeout(() => setCartPulse(false), 300);
    return () => clearTimeout(timer);
  }, [totalItemsCount]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'About', path: '/about' },
    { name: 'Reservations', path: '/reservation' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-[#4A2518] shadow-lg py-3' : 'bg-[#5C2E1A] py-4'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link to="/" className="font-heading font-bold text-2xl text-[#F5ECD7] hover:text-[#D4A96A] transition-colors">
            Brew & Co.
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-medium transition-colors duration-200 text-sm tracking-wide ${isActive(link.path)
                    ? 'text-[#D4A96A] border-b-2 border-[#D4A96A] pb-0.5'
                    : 'text-[#F5ECD7]/80 hover:text-[#F5ECD7]'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Cart + Mobile toggle */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative text-[#F5ECD7] hover:text-[#D4A96A] transition-colors p-2">
              <ShoppingCart size={24} />
              {totalItemsCount > 0 && (
                <span className={`absolute top-0 right-0 -mr-1 -mt-1 bg-[#D4A96A] text-[#4A2518] text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-[#5C2E1A] shadow-sm transition-transform duration-300 ${cartPulse ? 'scale-125' : 'scale-100'}`}>
                  {totalItemsCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden text-[#F5ECD7] hover:text-[#D4A96A] p-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-white/10 mt-3">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`font-medium py-3 px-3 rounded-lg transition-colors ${isActive(link.path)
                      ? 'bg-white/10 text-[#D4A96A]'
                      : 'text-[#F5ECD7]/80 hover:bg-white/10 hover:text-[#F5ECD7]'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}