// Sample realistic construction site photo data URLs for DPR demo records

function createSvgDataUrl(bgGradStart, bgGradEnd, iconSymbol, title, sub) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradStart}" />
        <stop offset="100%" stop-color="${bgGradEnd}" />
      </linearGradient>
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="600" height="400" fill="url(#grad)" />
    <rect width="600" height="400" fill="url(#grid)" />
    
    <!-- Site Badge overlay -->
    <rect x="24" y="24" width="140" height="28" rx="6" fill="rgba(0,0,0,0.4)" />
    <circle cx="38" cy="38" r="5" fill="#10B981" />
    <text x="50" y="43" fill="#ffffff" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="600">BUILDTWIN 360</text>
    
    <!-- Center Construction Visual -->
    <g transform="translate(300, 180)">
      <circle cx="0" cy="0" r="54" fill="rgba(255,255,255,0.12)" />
      <circle cx="0" cy="0" r="42" fill="rgba(255,255,255,0.2)" />
      <text x="0" y="14" fill="#ffffff" font-size="38" text-anchor="middle" font-family="sans-serif">${iconSymbol}</text>
    </g>
    
    <!-- Photo Details Bottom Card -->
    <rect x="20" y="295" width="560" height="85" rx="8" fill="rgba(15,23,42,0.85)" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
    <text x="36" y="325" fill="#ffffff" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="bold">${title}</text>
    <text x="36" y="348" fill="#94A3B8" font-family="Inter, system-ui, sans-serif" font-size="12">${sub}</text>
    <rect x="36" y="358" width="110" height="16" rx="4" fill="#2563EB" />
    <text x="91" y="370" fill="#ffffff" font-family="Inter, system-ui, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">VERIFIED SITE PHOTO</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_DPR_PHOTOS = {
  slabConcrete: createSvgDataUrl('#1E293B', '#0F172A', '🏗️', 'Slab Concrete Pouring - Grid B4', 'Level 03 Slab Casting | 12.5 m3 Pour Completed'),
  slabFinish: createSvgDataUrl('#334155', '#1E293B', '📐', 'Surface Leveling & Power Trowel', 'Vibrating screed finish verified by QA Inspector'),
  columnRebar: createSvgDataUrl('#1E3A8A', '#172554', '🔩', 'Column C12 Reinforcement Cage', '25mm dia main rebar with 8mm ties @ 150mm c/c'),
  excavation: createSvgDataUrl('#78350F', '#451A03', '🚜', 'Footing Excavation - Pit #04', 'Excavation depth 2.8m reached to hard strata'),
  rebarBinding: createSvgDataUrl('#1E3A8A', '#0F172A', '⛓️', 'Foundation Mat Rebar Binding', 'Bottom mesh 16mm TMT bars tying in progress'),
};
