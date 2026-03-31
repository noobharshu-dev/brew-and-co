import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-[70vh] py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fade-in flex flex-col items-center text-center">
      <h1 className="font-heading font-bold text-5xl text-dark mb-4 drop-shadow-sm">Our Story</h1>
      <div className="w-16 h-1 bg-brown mx-auto rounded mb-10"></div>
      
      <div className="space-y-6 text-dark/80 text-lg md:text-xl leading-relaxed">
        <p>
          Founded in 2026, Brew & Co. was built on a simple premise: great coffee shouldn't just taste amazing—it should be an experience.
        </p>
        <p>
          We spent months finding the perfect, ethically sourced beans and designing a space that feels like a second home. Whether you're here to work, catch up with an old friend, or simply escape the noise of the city, our doors are open.
        </p>
      </div>

      <Link 
        to="/menu"
        className="mt-12 bg-brown text-cream px-8 py-3 rounded-lg font-medium hover:bg-brown/90 transition-all hover:-translate-y-0.5 shadow-md inline-block"
      >
        Explore Our Menu
      </Link>
    </div>
  );
}
