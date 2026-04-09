import React, { useState } from 'react';
// @ts-ignore
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/india-states.json";

// Distribution summing roughly to 50,000+
const stateData = [
  { id: "MH", state: "Maharashtra", value: 12540, coordinates: [75.7139, 19.7515] },
  { id: "KA", state: "Karnataka", value: 8320, coordinates: [75.7139, 15.3173] },
  { id: "UP", state: "Uttar Pradesh", value: 7100, coordinates: [80.9462, 26.8467] },
  { id: "DL", state: "Delhi", value: 5430, coordinates: [77.1025, 28.7041] },
  { id: "TN", state: "Tamil Nadu", value: 4890, coordinates: [78.6569, 11.1271] },
  { id: "GJ", state: "Gujarat", value: 4200, coordinates: [71.1924, 22.2587] },
  { id: "WB", state: "West Bengal", value: 3800, coordinates: [87.8550, 22.9868] },
  { id: "RJ", state: "Rajasthan", value: 2900, coordinates: [74.2179, 27.0238] },
  { id: "AP", state: "Andhra Pradesh", value: 2100, coordinates: [79.7400, 15.9129] },
];

interface MapProps {
  onRegionSelect: (region: string) => void;
}

export const InteractiveMap: React.FC<MapProps> = ({ onRegionSelect }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px', background: 'var(--navy-deep)', borderRadius: '24px', overflow: 'hidden' }}>
      {/* Resource distribution labels removed as requested */}

      
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 800,
          center: [80, 22] // Center on India
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="rgba(255,255,255,0.05)"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "rgba(255,255,255,0.1)", outline: "none", cursor: 'pointer' },
                  pressed: { fill: "rgba(255,255,255,0.15)", outline: "none" }
                }}
              />
            ))
          }
        </Geographies>

        {stateData.map(({ id, state, value, coordinates }) => {
          // Normalize value for bubble size (min 4, max 24)
          const radius = Math.max(4, Math.min(24, (value / 12540) * 24));
          return (
            <Marker 
              key={id} 
              coordinates={coordinates as [number, number]}
              onClick={() => onRegionSelect(state)}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e: any) => {
                setTooltipContent(`${state}: ${value.toLocaleString()} Orgs`);
                // Simple positioning based on mouse relative to container
                const rect = (e.target as Element).getBoundingClientRect();
                setTooltipPosition({ x: rect.left, y: rect.top - 40 });
              }}
              onMouseLeave={() => setTooltipContent('')}
            >
              <circle r={radius} fill="var(--coral)" opacity={0.6} />
              <circle r={radius / 2} fill="var(--coral)" />
            </Marker>
          );
        })}
      </ComposableMap>

      <AnimatePresence>
        {tooltipContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: 'translateX(-50%)',
              background: 'white',
              color: 'var(--navy-deep)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 800,
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 100
            }}
          >
            {tooltipContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
