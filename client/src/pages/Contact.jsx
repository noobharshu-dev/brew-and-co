import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-[70vh] py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto animate-fade-in flex flex-col items-center text-center">
      <h1 className="font-heading font-bold text-5xl text-dark mb-4 drop-shadow-sm">Get in Touch</h1>
      <div className="w-16 h-1 bg-brown mx-auto rounded mb-12"></div>
      
      <div className="w-full bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-beige flex flex-col space-y-8 text-left">
        
        <div className="flex items-start">
          <MapPin className="text-brown mr-4 shrink-0 mt-1" size={28} />
          <div>
            <h3 className="font-heading font-bold text-xl text-dark mb-1">Visit Us</h3>
            <p className="text-dark/70 text-lg">123 Coffee Lane<br/>Brew District, CA 90210</p>
          </div>
        </div>

        <div className="flex items-start">
          <Phone className="text-brown mr-4 shrink-0 mt-1" size={28} />
          <div>
            <h3 className="font-heading font-bold text-xl text-dark mb-1">Call Us</h3>
            <p className="text-dark/70 text-lg">(555) 123-4567</p>
          </div>
        </div>

        <div className="flex items-start">
          <Mail className="text-brown mr-4 shrink-0 mt-1" size={28} />
          <div>
            <h3 className="font-heading font-bold text-xl text-dark mb-1">Email</h3>
            <p className="text-dark/70 text-lg">hello@brewco.com</p>
          </div>
        </div>

      </div>
    </div>
  );
}
