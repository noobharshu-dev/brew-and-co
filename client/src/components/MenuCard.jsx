import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatPrice';

export default function MenuCard({ id, image, name, price, description, category, onViewDetails }) {
  const { addToCart } = useCart();

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col h-full group transition-all duration-300 hover:-translate-y-1"
      style={{ background: '#fff', boxShadow: '0 2px 8px rgba(107,58,42,0.10), 0 8px 24px rgba(107,58,42,0.08)', border: '1px solid rgba(107,58,42,0.12)' }}
    >
      {/* Image */}
      <div
        className="relative w-full h-56 overflow-hidden cursor-pointer"
        style={{ background: '#f0e8df' }}
        onClick={() => onViewDetails && onViewDetails({ _id: id, image, name, price, description, category: category || 'Signature' })}
      >
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Category pill */}
        <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: 'rgba(107,58,42,0.85)', color: '#F5ECD7', backdropFilter: 'blur(4px)' }}>
          {category}
        </span>
        {/* Quick View overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          style={{ background: 'rgba(28,28,28,0.25)' }}>
          <span className="text-sm font-medium px-5 py-2 rounded-full transition-transform duration-300 translate-y-3 group-hover:translate-y-0"
            style={{ background: 'rgba(255,250,240,0.92)', color: '#6B3A2A', backdropFilter: 'blur(6px)' }}>
            Quick View
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow" style={{ background: '#fff' }}>
        {/* Name + Price */}
        <div className="flex justify-between items-start mb-2 gap-3">
          <h3 className="font-heading font-bold text-lg text-dark leading-tight">{name}</h3>
          <span className="font-bold text-base whitespace-nowrap shrink-0 px-2 py-0.5 rounded-lg"
            style={{ color: '#6B3A2A', background: '#F5ECD7' }}>
            {formatPrice(price)}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm mb-5 flex-grow leading-relaxed" style={{ color: '#555' }}>{description}</p>

        {/* Button */}
        <button
          onClick={() => addToCart({ _id: id, image, name, price })}
          className="w-full font-medium py-2.5 px-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-1"
          style={{ background: '#6B3A2A', color: '#F5ECD7', boxShadow: '0 2px 8px rgba(107,58,42,0.25)', focusRingColor: '#6B3A2A' }}
          onMouseEnter={e => e.currentTarget.style.background = '#7d4533'}
          onMouseLeave={e => e.currentTarget.style.background = '#6B3A2A'}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}