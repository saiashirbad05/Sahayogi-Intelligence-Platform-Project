import React from 'react';

interface HexIconProps {
  color?: 'coral' | 'gold' | 'indigo' | 'green' | 'red';
  icon: React.ReactNode;
  size?: number;
}

export const HexIcon: React.FC<HexIconProps> = ({ color = 'coral', icon, size = 64 }) => {
  const getFillColor = () => {
    switch (color) {
      case 'gold': return '#D4A820';
      case 'indigo': return '#9BA4EF';
      case 'green': return '#22C55E';
      case 'red': return '#EF4444';
      case 'coral':
      default: return '#E8793A';
    }
  };

  return (
    <div style={{ 
      width: size, 
      height: size, 
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.1))'
    }}>
      <svg 
        viewBox="0 0 100 100" 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        fill={getFillColor()}
      >
        <polygon points="50 3, 93 25, 93 75, 50 97, 7 75, 7 25" />
      </svg>
      <div style={{ position: 'relative', zIndex: 1, color: '#fff', display: 'flex' }}>
        {icon}
      </div>
    </div>
  );
};
