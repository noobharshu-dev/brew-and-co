import { Link } from 'react-router-dom';
import { Camera, Share2, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark text-cream pt-16 pb-8 border-t-4 border-brown">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Brand & Origin */}
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-3xl text-beige">Brew & Co.</h2>
            <p className="text-cream/80 leading-relaxed max-w-sm">
              Premium coffee crafted with passion, served in a space designed for connection.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="hover:text-beige transition-colors p-2 -ml-2"><Camera size={20} /></a>
              <a href="#" className="hover:text-beige transition-colors p-2"><Share2 size={20} /></a>
              <a href="#" className="hover:text-beige transition-colors p-2"><MessageCircle size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-bold text-xl mb-6 text-beige">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/menu" className="hover:text-beige transition-colors">Our Menu</Link></li>
              <li><Link to="/reservation" className="hover:text-beige transition-colors">Reserve a Table</Link></li>
              <li><Link to="/about" className="hover:text-beige transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-beige transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading font-bold text-xl mb-6 text-beige">Visit Us</h3>
            <ul className="space-y-4 text-cream/90">
              <li className="flex items-start">
                <MapPin size={20} className="mr-3 text-brown shrink-0 mt-1" />
                <span>123 Coffee Lane<br />Brew District, CA 90210</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-3 text-brown shrink-0" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-3 text-brown shrink-0" />
                <span>hello@brewco.com</span>
              </li>
            </ul>
          </div>
          
        </div>

        {/* Bottom bar */}
        <div className="border-t border-cream/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-cream/60">
          <p>© {new Date().getFullYear()} Brew & Co. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-cream transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cream transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
