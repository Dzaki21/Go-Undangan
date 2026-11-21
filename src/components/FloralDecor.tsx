import React from 'react';

export const FloralDecor: React.FC<{ position?: 'top' | 'bottom'; className?: string }> = ({
  position = 'top',
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-center gap-2 pointer-events-none opacity-80 ${className} ${
        position === 'bottom' ? 'rotate-180' : ''
      }`}
    >
      {/* Left Leaf branch */}
      <svg
        className="w-12 h-6 text-[#5b8468] fill-current"
        viewBox="0 0 100 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M100 45 C70 45 40 30 10 5 C30 10 60 10 80 30 C75 20 60 15 50 15 C70 20 85 28 95 38 Z" />
        <circle cx="35" cy="18" r="4" className="text-[#a4c5ae] fill-current" />
        <circle cx="65" cy="28" r="3.5" className="text-[#a4c5ae] fill-current" />
      </svg>

      {/* Flower icon in center */}
      <svg
        className="w-6 h-6 text-[#8ea794] fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2a4 4 0 0 0-4 4c0 1.3.6 2.5 1.6 3.2A4 4 0 0 0 6 12a4 4 0 0 0 3.2 3.9A4 4 0 0 0 12 22a4 4 0 0 0 3.9-2.9A4 4 0 0 0 22 12a4 4 0 0 0-2.9-3.9A4 4 0 0 0 16 2.4 4 4 0 0 0 12 2zm0 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
      </svg>

      {/* Right Leaf branch */}
      <svg
        className="w-12 h-6 text-[#5b8468] fill-current scale-x-[-1]"
        viewBox="0 0 100 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M100 45 C70 45 40 30 10 5 C30 10 60 10 80 30 C75 20 60 15 50 15 C70 20 85 28 95 38 Z" />
        <circle cx="35" cy="18" r="4" className="text-[#a4c5ae] fill-current" />
        <circle cx="65" cy="28" r="3.5" className="text-[#a4c5ae] fill-current" />
      </svg>
    </div>
  );
};
