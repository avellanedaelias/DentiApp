import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`relative inline-flex items-center justify-center text-primary-600 ${className}`}>
       {/* Tooth Icon */}
       <svg className={`${sizes[size]} transition-all duration-300`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 22C6.44772 22 6 21.5523 6 21V18C6 16.8954 5.10457 16 4 16C2.89543 16 2 15.1046 2 14V7C2 4.23858 4.23858 2 7 2H17C19.7614 2 22 4.23858 22 7V14C22 15.1046 21.1046 16 20 16C18.8954 16 18 16.8954 18 18V21C18 21.5523 17.5523 22 17 22H15C14.4477 22 14 21.5523 14 21V18H10V21C10 21.5523 9.55228 22 9 22H7Z" fill="currentColor" fillOpacity="0.1"/>
        <path d="M7 22V18C6 16.8954 5.10457 16 4 16C2.89543 16 2 15.1046 2 14V7C2 4.23858 4.23858 2 7 2H17C19.7614 2 22 4.23858 22 7V14C22 15.1046 21.1046 16 20 16C18.8954 16 18 16.8954 18 18V21M7 22H9C9.55228 22 10 21.5523 10 21V18H14V21C14 21.5523 14.4477 22 15 22H17C17.5523 22 18 21.5523 18 21V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 9H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 10V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 10V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      
      {/* Sparkle/Shine */}
      <div className="absolute -top-1 -right-1 animate-pulse">
         <svg className={`${size === 'sm' ? 'w-3 h-3' : 'w-5 h-5'} text-yellow-400 drop-shadow-sm`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
         </svg>
      </div>
    </div>
  );
};