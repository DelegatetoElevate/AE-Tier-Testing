import { TIERS, TIER0 } from '@/lib/scoring';

// The signature wristband pill. size: '', 'big', or 'huge'.
export function Band({ tier, size = '' }) {
  const label = tier === 0 ? `Level 0 · ${TIER0}` : `Level ${tier} · ${TIERS[tier - 1].name}`;
  return (
    <span className={`band t${tier} ${size}`.trim()}>
      <span className="swatch" />
      {label}
    </span>
  );
}

// A row of pips, one per movement, shaded by level reached.
export function Pips({ levels }) {
  return (
    <span className="pips">
      {levels.map((lvl, i) => (
        <span key={i} className={`pip on${lvl}`} />
      ))}
    </span>
  );
}
