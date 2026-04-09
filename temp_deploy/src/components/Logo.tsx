import React from 'react';

interface LogoProps {
  variant?: 'navbar' | 'footer' | 'hero' | 'favicon';
}

export const Logo: React.FC<LogoProps> = ({ variant = 'navbar' }) => {
  const heights = {
    favicon: 48,
    navbar: 60,
    footer: 100,
    hero: 260
  };
  
  const height = heights[variant];
  
  return (
    <div className={`logo-container variant-${variant}`} style={{ display: 'flex', alignItems: 'center' }}>
      <img 
        src="/images/logo.png" 
        alt="Sahayogi-Intelligence-Platform"
        style={{ 
          height: `${height}px`,
          width: 'auto',
          display: 'block',
          borderRadius: variant === 'hero' ? '12px' : '4px'
        }}
      />
    </div>
  );
};
