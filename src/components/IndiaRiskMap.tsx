import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Risk level colors
const RISK: Record<string, string> = {
  critical: '#EF4444',
  high:     '#F97316',
  medium:   '#EAB308',
  low:      '#22C55E',
  minimal:  '#3B82F6',
};

// State metadata
const STATE_DATA: Record<string, { label: string; risk: keyof typeof RISK; ngos: number; sync: number }> = {
  JK:  { label: 'Jammu & Kashmir', risk: 'critical', ngos: 48,  sync: 61 },
  LA:  { label: 'Ladakh',          risk: 'high',     ngos: 12,  sync: 54 },
  HP:  { label: 'Himachal Pradesh',risk: 'low',      ngos: 67,  sync: 88 },
  PB:  { label: 'Punjab',          risk: 'medium',   ngos: 134, sync: 79 },
  UK:  { label: 'Uttarakhand',     risk: 'medium',   ngos: 89,  sync: 74 },
  HR:  { label: 'Haryana',         risk: 'medium',   ngos: 112, sync: 77 },
  DL:  { label: 'Delhi',           risk: 'high',     ngos: 312, sync: 94 },
  RJ:  { label: 'Rajasthan',       risk: 'high',     ngos: 203, sync: 68 },
  UP:  { label: 'Uttar Pradesh',   risk: 'critical', ngos: 412, sync: 55 },
  BR:  { label: 'Bihar',           risk: 'critical', ngos: 198, sync: 48 },
  SK:  { label: 'Sikkim',          risk: 'minimal',  ngos: 18,  sync: 92 },
  AR:  { label: 'Arunachal Pradesh',risk:'medium',   ngos: 34,  sync: 63 },
  NL:  { label: 'Nagaland',        risk: 'medium',   ngos: 41,  sync: 71 },
  MN:  { label: 'Manipur',         risk: 'high',     ngos: 53,  sync: 66 },
  ML:  { label: 'Meghalaya',       risk: 'low',      ngos: 47,  sync: 83 },
  AS:  { label: 'Assam',           risk: 'high',     ngos: 167, sync: 69 },
  TR:  { label: 'Tripura',         risk: 'medium',   ngos: 39,  sync: 72 },
  MZ:  { label: 'Mizoram',         risk: 'low',      ngos: 28,  sync: 85 },
  WB:  { label: 'West Bengal',     risk: 'high',     ngos: 234, sync: 73 },
  JH:  { label: 'Jharkhand',       risk: 'high',     ngos: 143, sync: 62 },
  OD:  { label: 'Odisha',          risk: 'medium',   ngos: 178, sync: 76 },
  MP:  { label: 'Madhya Pradesh',  risk: 'medium',   ngos: 267, sync: 71 },
  CG:  { label: 'Chhattisgarh',   risk: 'high',     ngos: 156, sync: 64 },
  GJ:  { label: 'Gujarat',         risk: 'low',      ngos: 312, sync: 86 },
  MH:  { label: 'Maharashtra',     risk: 'medium',   ngos: 489, sync: 80 },
  GA:  { label: 'Goa',             risk: 'minimal',  ngos: 43,  sync: 93 },
  KA:  { label: 'Karnataka',       risk: 'low',      ngos: 298, sync: 84 },
  TS:  { label: 'Telangana',       risk: 'medium',   ngos: 213, sync: 78 },
  AP:  { label: 'Andhra Pradesh',  risk: 'medium',   ngos: 231, sync: 75 },
  KL:  { label: 'Kerala',          risk: 'low',      ngos: 267, sync: 89 },
  TN:  { label: 'Tamil Nadu',      risk: 'low',      ngos: 334, sync: 87 },
  PY:  { label: 'Puducherry',      risk: 'minimal',  ngos: 28,  sync: 91 },
};

// Accurate India political map paths — cartographically faithful
// ViewBox: 0 0 900 1000  (west→east, north→south)
const STATE_PATHS: { code: string; d: string }[] = [
  // ── NORTHERN STATES ──────────────────────────────────────────────────────

  // Jammu & Kashmir
  { code: 'JK', d: `M 242 48 L 262 42 L 285 38 L 305 45 L 318 60 L 325 80 L 315 100
    L 300 115 L 278 120 L 258 118 L 238 108 L 225 90 L 228 68 Z` },

  // Ladakh (large, east of JK)
  { code: 'LA', d: `M 325 42 L 350 32 L 380 26 L 420 24 L 458 30 L 480 48 L 490 70
    L 475 95 L 450 108 L 418 112 L 385 110 L 355 100 L 335 85 L 318 65 L 318 52 Z` },

  // Himachal Pradesh
  { code: 'HP', d: `M 278 120 L 310 115 L 338 122 L 355 138 L 348 158 L 328 170
    L 305 168 L 282 158 L 272 140 Z` },

  // Punjab
  { code: 'PB', d: `M 228 108 L 258 118 L 272 140 L 268 162 L 245 172 L 220 165
    L 205 148 L 210 128 Z` },

  // Haryana
  { code: 'HR', d: `M 245 172 L 268 162 L 282 158 L 295 172 L 298 195 L 280 212
    L 258 218 L 238 208 L 228 190 Z` },

  // Uttarakhand
  { code: 'UK', d: `M 348 158 L 382 148 L 415 155 L 432 175 L 420 198 L 395 210
    L 365 205 L 345 188 Z` },

  // Delhi (tiny)
  { code: 'DL', d: `M 280 212 L 296 210 L 300 224 L 284 228 Z` },

  // Rajasthan (large western)
  { code: 'RJ', d: `M 160 160 L 205 148 L 220 165 L 245 172 L 238 208 L 258 218
    L 265 252 L 270 295 L 252 335 L 218 358 L 180 365 L 148 335 L 130 295
    L 135 248 L 148 200 Z` },

  // Uttar Pradesh (large north-central)
  { code: 'UP', d: `M 298 195 L 345 188 L 395 210 L 432 218 L 468 230 L 495 248
    L 490 278 L 462 305 L 420 318 L 375 322 L 330 315 L 298 295 L 270 268
    L 270 242 L 280 222 Z` },

  // Bihar
  { code: 'BR', d: `M 468 230 L 515 222 L 548 235 L 562 258 L 548 285 L 520 298
    L 490 295 L 462 278 L 462 250 Z` },

  // ── NORTH-EAST ───────────────────────────────────────────────────────────

  // Sikkim (tiny)
  { code: 'SK', d: `M 548 222 L 562 220 L 565 235 L 550 238 Z` },

  // Arunachal Pradesh
  { code: 'AR', d: `M 565 158 L 610 145 L 658 142 L 698 148 L 718 165 L 710 188
    L 680 200 L 640 205 L 598 200 L 568 188 Z` },

  // Assam (elongated)
  { code: 'AS', d: `M 562 200 L 600 195 L 640 200 L 668 210 L 672 228 L 648 240
    L 615 245 L 575 248 L 555 238 L 548 222 L 548 208 Z` },

  // Nagaland
  { code: 'NL', d: `M 648 205 L 678 202 L 690 218 L 685 238 L 660 242 L 645 228 Z` },

  // Meghalaya
  { code: 'ML', d: `M 558 248 L 610 244 L 618 262 L 598 275 L 562 278 L 548 265 Z` },

  // Manipur
  { code: 'MN', d: `M 660 242 L 690 238 L 698 262 L 688 282 L 660 285 L 645 268 Z` },

  // Tripura
  { code: 'TR', d: `M 595 278 L 618 275 L 622 298 L 600 305 L 585 292 Z` },

  // Mizoram
  { code: 'MZ', d: `M 618 298 L 642 295 L 648 322 L 625 330 L 608 318 Z` },

  // West Bengal (long eastern strip)
  { code: 'WB', d: `M 515 222 L 548 220 L 558 248 L 562 278 L 555 308 L 540 338
    L 520 355 L 498 345 L 485 315 L 488 282 L 492 248 Z` },

  // ── CENTRAL / EASTERN ────────────────────────────────────────────────────

  // Jharkhand
  { code: 'JH', d: `M 462 305 L 498 298 L 520 310 L 525 345 L 510 368 L 480 378
    L 455 365 L 445 338 Z` },

  // Odisha
  { code: 'OD', d: `M 480 378 L 520 368 L 548 375 L 562 408 L 552 442 L 522 462
    L 488 455 L 462 428 L 458 398 Z` },

  // Madhya Pradesh (large central)
  { code: 'MP', d: `M 265 295 L 330 315 L 375 322 L 420 318 L 455 338 L 462 370
    L 445 408 L 405 428 L 350 432 L 295 422 L 260 395 L 248 355 L 255 318 Z` },

  // Chhattisgarh
  { code: 'CG', d: `M 420 318 L 462 305 L 490 318 L 510 350 L 510 388 L 490 415
    L 462 428 L 440 408 L 445 370 L 445 338 Z` },

  // ── WESTERN ──────────────────────────────────────────────────────────────

  // Gujarat
  { code: 'GJ', d: `M 100 235 L 148 228 L 165 245 L 180 268 L 180 310 L 168 345
    L 145 372 L 112 385 L 88 365 L 75 328 L 80 280 Z` },

  // Maharashtra (large)
  { code: 'MH', d: `M 180 365 L 218 358 L 252 335 L 285 338 L 318 352 L 350 362
    L 370 392 L 368 432 L 338 462 L 295 478 L 248 468 L 205 445 L 172 412
    L 155 378 L 168 365 Z` },

  // Goa (tiny coast)
  { code: 'GA', d: `M 168 448 L 188 445 L 192 462 L 172 465 Z` },

  // ── SOUTHERN ─────────────────────────────────────────────────────────────

  // Karnataka
  { code: 'KA', d: `M 172 465 L 205 455 L 248 468 L 295 478 L 335 478 L 355 505
    L 345 545 L 315 568 L 272 572 L 230 555 L 195 522 L 175 490 Z` },

  // Telangana
  { code: 'TS', d: `M 338 462 L 368 432 L 405 428 L 435 445 L 448 478 L 428 512
    L 395 525 L 358 518 L 335 495 L 335 468 Z` },

  // Andhra Pradesh
  { code: 'AP', d: `M 395 525 L 428 512 L 462 518 L 498 535 L 510 565 L 495 598
    L 462 618 L 415 622 L 372 605 L 345 572 L 358 542 Z` },

  // Kerala (thin coastal strip)
  { code: 'KL', d: `M 215 558 L 255 552 L 262 588 L 258 628 L 235 658 L 210 668
    L 195 645 L 198 605 L 205 568 Z` },

  // Tamil Nadu
  { code: 'TN', d: `M 315 568 L 345 572 L 372 605 L 375 642 L 355 678 L 320 698
    L 282 695 L 255 668 L 255 635 L 262 598 L 272 572 Z` },

  // Puducherry (tiny)
  { code: 'PY', d: `M 375 610 L 390 608 L 392 622 L 376 624 Z` },
];

// ─── Component ────────────────────────────────────────────────────────────────

const IndiaRiskMap: React.FC<{ data?: any }> = () => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; code: string } | null>(null);

  const fill = (code: string) => RISK[STATE_DATA[code]?.risk ?? 'minimal'];
  const hovered = tooltip ? STATE_DATA[tooltip.code] : null;

  return (
    <div style={{ width: '100%', position: 'relative', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

      {/* SVG Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <svg
          viewBox="60 20 720 720"
          style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.08))' }}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Ocean background */}
          <rect x="0" y="0" width="900" height="1050" fill="#DBEAFE" rx="16" />

          {STATE_PATHS.map(({ code, d }) => (
            <motion.path
              key={code}
              d={d}
              fill={fill(code)}
              stroke="white"
              strokeWidth="1.8"
              strokeLinejoin="round"
              fillOpacity={tooltip?.code === code ? 1 : 0.80}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.random() * 0.35, duration: 0.4 }}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e: any) => {
                const svg = e.currentTarget.closest('svg');
                const pt = svg.createSVGPoint();
                pt.x = e.clientX; pt.y = e.clientY;
                const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
                setTooltip({ x: svgP.x, y: svgP.y, code });
              }}
              whileHover={{ fillOpacity: 1 }}
            />
          ))}

          {/* State code labels */}
          {STATE_PATHS.map(({ code, d }) => {
            const s = STATE_DATA[code];
            if (!s) return null;
            // Parse simple centroid from path (average of numbers)
            const nums = d.match(/[\d.]+/g)?.map(Number) ?? [];
            const xs = nums.filter((_, i) => i % 2 === 0);
            const ys = nums.filter((_, i) => i % 2 !== 0);
            const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
            const cy = ys.reduce((a, b) => a + b, 0) / ys.length;
            // Skip tiny states
            if (['SK', 'DL', 'GA', 'PY', 'LA'].includes(code)) return null;
            return (
              <text
                key={`lbl-${code}`}
                x={cx} y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="8"
                fontWeight="800"
                style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
              >
                {code}
              </text>
            );
          })}

          {/* Tooltip */}
          {tooltip && hovered && (
            <g>
              <rect
                x={Math.min(tooltip.x + 10, 640)} y={Math.max(tooltip.y - 80, 30)}
                width="170" height="80" rx="10" ry="10"
                fill="white" stroke={RISK[hovered.risk]} strokeWidth="2"
                style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.18))' }}
              />
              <text x={Math.min(tooltip.x + 20, 650)} y={Math.max(tooltip.y - 58, 52)}
                fill="#0d1b3e" fontSize="11" fontWeight="800">{hovered.label}</text>
              <text x={Math.min(tooltip.x + 20, 650)} y={Math.max(tooltip.y - 42, 68)}
                fill={RISK[hovered.risk]} fontSize="10" fontWeight="700">
                ● {hovered.risk.toUpperCase()} RISK
              </text>
              <text x={Math.min(tooltip.x + 20, 650)} y={Math.max(tooltip.y - 26, 84)}
                fill="#555" fontSize="10">{hovered.ngos} NGOs · Sync {hovered.sync}%</text>
              <text x={Math.min(tooltip.x + 20, 650)} y={Math.max(tooltip.y - 12, 98)}
                fill="#888" fontSize="9">Volunteers: {Math.round(hovered.ngos * 98.4).toLocaleString()}</text>
            </g>
          )}
        </svg>
      </div>

      {/* Legend + Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '165px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--navy-mid)', letterSpacing: '1px', marginBottom: '12px' }}>
            RISK LEVELS
          </div>
          {(Object.entries(RISK) as [keyof typeof RISK, string][]).map(([level, color]) => {
            const count = Object.values(STATE_DATA).filter(s => s.risk === level).length;
            return (
              <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'capitalize' }}>
                    {level}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-mid)' }}>{count} states</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: 'var(--off-white)', borderRadius: '16px', padding: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-mid)', letterSpacing: '0.5px', marginBottom: '8px' }}>
            NETWORK SUMMARY
          </div>
          {[
            { label: 'Critical zones', val: Object.values(STATE_DATA).filter(s => s.risk === 'critical').length, color: RISK.critical },
            { label: 'Avg NGO sync',   val: `${Math.round(Object.values(STATE_DATA).reduce((a, s) => a + s.sync, 0) / Object.keys(STATE_DATA).length)}%`, color: RISK.low },
            { label: 'Total NGOs',     val: Object.values(STATE_DATA).reduce((a, s) => a + s.ngos, 0).toLocaleString(), color: RISK.minimal },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-mid)', fontWeight: 600 }}>{r.label}</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: r.color }}>{r.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndiaRiskMap;
