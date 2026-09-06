import React from 'react';
import logoImg from '../assets/logo.png';

export const Logo = ({
  size = 'md',
  className = '',
  imgClassName = '',
  showText = false,
  showTag = true,
  subtitle = true,
}) => {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };

  const containerSize = sizeMap[size] || size;

  const imageElement = (
    <div
      className={`relative flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${containerSize} ${className}`}
    >
      <img
        src={logoImg}
        alt="Kasandigan Official Logo"
        className={`w-full h-full object-contain ${imgClassName}`}
      />
    </div>
  );

  if (!showText) {
    return imageElement;
  }

  return (
    <div className="flex items-center gap-3">
      {imageElement}
      <div>
        <div className="flex items-center gap-1.5 font-extrabold text-lg text-slate-900 leading-none">
          Kasandigan
          {showTag && (
            <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              SaaS
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">A community you can rely on</p>
        )}
      </div>
    </div>
  );
};

export default Logo;
