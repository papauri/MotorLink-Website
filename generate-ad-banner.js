const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const WIDTH = 1200;
const HEIGHT = 628;
const OUTPUT_PATH = path.join(__dirname, 'motorlink-ad-banner.png');

// Build the SVG design - Neutral modern theme with stacking cards aesthetic
const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background gradient - neutral dark -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2c2f33"/>
      <stop offset="50%" style="stop-color:#3a3d42"/>
      <stop offset="100%" style="stop-color:#4a4d52"/>
    </linearGradient>

    <!-- Card gradient - white to light gray -->
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#f8f9fa"/>
    </linearGradient>

    <!-- Accent green gradient -->
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2d6a4f"/>
      <stop offset="100%" style="stop-color:#40916c"/>
    </linearGradient>

    <!-- Teal gradient -->
    <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2a9d8f"/>
      <stop offset="100%" style="stop-color:#52b788"/>
    </linearGradient>

    <!-- Soft shadow filter -->
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.25"/>
    </filter>

    <!-- Subtle pattern -->
    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" stroke-width="0.5" stroke-opacity="0.03"/>
    </pattern>

    <!-- Dot pattern -->
    <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="15" cy="15" r="1.5" fill="white" opacity="0.04"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGrad)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#dots)"/>

  <!-- Decorative circles -->
  <circle cx="1100" cy="100" r="300" fill="white" opacity="0.02"/>
  <circle cx="-50" cy="550" r="350" fill="white" opacity="0.02"/>

  <!-- CARD 1: Main Hero Card -->
  <rect x="80" y="60" width="1040" height="508" rx="28" fill="url(#cardGrad)" filter="url(#shadow)"/>
  
  <!-- Top accent line -->
  <rect x="80" y="60" width="1040" height="4" rx="2" fill="url(#accentGrad)"/>

  <!-- LEFT SECTION: Brand and Content -->

  <!-- Brand logo box -->
  <rect x="120" y="100" width="64" height="64" rx="18" fill="url(#accentGrad)"/>
  <text x="152" y="142" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="white" text-anchor="middle" font-weight="700">🚗</text>

  <!-- Brand name -->
  <text x="200" y="130" font-family="Segoe UI, Arial, sans-serif" font-size="36" font-weight="900" fill="#1a1a1a" letter-spacing="-0.5">MotorLink</text>
  <text x="200" y="152" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="600" fill="#6c757d" letter-spacing="1">MALAWI'S CAR MARKETPLACE</text>

  <!-- Main headline -->
  <text x="120" y="220" font-family="Segoe UI, Arial, sans-serif" font-size="44" font-weight="900" fill="#1a1a1a" letter-spacing="-1.5">The modern way to buy, sell &amp; rent</text>
  <text x="120" y="268" font-family="Segoe UI, Arial, sans-serif" font-size="44" font-weight="900" fill="#2d6a4f" letter-spacing="-1.5">vehicles in Malawi</text>

  <!-- Subtitle -->
  <text x="120" y="310" font-family="Segoe UI, Arial, sans-serif" font-size="16" fill="#495057">A complete automotive ecosystem — from finding your perfect car to connecting</text>
  <text x="120" y="332" font-family="Segoe UI, Arial, sans-serif" font-size="16" fill="#495057">with verified dealers, garages, and rental companies across all 28 districts.</text>

  <!-- Service badges -->
  <rect x="120" y="360" width="80" height="36" rx="18" fill="#f1f3f5"/>
  <text x="160" y="383" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700" fill="#343a40" text-anchor="middle">🛒 Buy</text>

  <rect x="210" y="360" width="80" height="36" rx="18" fill="#f1f3f5"/>
  <text x="250" y="383" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700" fill="#343a40" text-anchor="middle">🏷 Sell</text>

  <rect x="300" y="360" width="90" height="36" rx="18" fill="#f1f3f5"/>
  <text x="345" y="383" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700" fill="#343a40" text-anchor="middle">🔑 Rent</text>

  <rect x="400" y="360" width="100" height="36" rx="18" fill="#f1f3f5"/>
  <text x="450" y="383" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700" fill="#343a40" text-anchor="middle">🔧 Service</text>

  <rect x="510" y="360" width="110" height="36" rx="18" fill="#f1f3f5"/>
  <text x="565" y="383" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700" fill="#343a40" text-anchor="middle">🤖 AI-Powered</text>

  <!-- CTA Button -->
  <rect x="120" y="420" width="220" height="52" rx="26" fill="url(#accentGrad)" filter="url(#shadow)"/>
  <text x="230" y="453" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="800" fill="white" text-anchor="middle">Explore MotorLink →</text>

  <!-- RIGHT SECTION: Stats and Powered By -->

  <!-- Stats boxes -->
  <rect x="760" y="100" width="150" height="90" rx="16" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
  <text x="835" y="140" font-family="Segoe UI, Arial, sans-serif" font-size="32" font-weight="900" fill="#2d6a4f" text-anchor="middle">5,000+</text>
  <text x="835" y="168" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="600" fill="#6c757d" text-anchor="middle">Active Listings</text>

  <rect x="930" y="100" width="150" height="90" rx="16" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
  <text x="1005" y="140" font-family="Segoe UI, Arial, sans-serif" font-size="32" font-weight="900" fill="#2d6a4f" text-anchor="middle">200+</text>
  <text x="1005" y="168" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="600" fill="#6c757d" text-anchor="middle">Verified Dealers</text>

  <rect x="760" y="210" width="150" height="90" rx="16" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
  <text x="835" y="250" font-family="Segoe UI, Arial, sans-serif" font-size="32" font-weight="900" fill="#2d6a4f" text-anchor="middle">28</text>
  <text x="835" y="278" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="600" fill="#6c757d" text-anchor="middle">Districts</text>

  <rect x="930" y="210" width="150" height="90" rx="16" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
  <text x="1005" y="250" font-family="Segoe UI, Arial, sans-serif" font-size="32" font-weight="900" fill="#2d6a4f" text-anchor="middle">FREE</text>
  <text x="1005" y="278" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="600" fill="#6c757d" text-anchor="middle">To Start</text>

  <!-- Powered by ProManaged IT section -->
  <rect x="760" y="330" width="320" height="160" rx="20" fill="#1a1a1a"/>
  
  <text x="920" y="370" font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="700" fill="#6c757d" text-anchor="middle" letter-spacing="2">PLATFORM BUILT &amp; MANAGED BY</text>

  <!-- ProManaged IT Logo -->
  <rect x="870" y="390" width="48" height="48" rx="14" fill="url(#tealGrad)"/>
  <text x="894" y="422" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="white" text-anchor="middle" font-weight="700">⚙</text>
  <text x="935" y="422" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="900" fill="white">ProManaged IT</text>

  <text x="920" y="460" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#adb5bd" text-anchor="middle">Professional IT solutions &amp; managed hosting</text>

  <text x="920" y="482" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#2a9d8f" font-weight="700" text-anchor="middle">promanaged-it.com →</text>

  <!-- Footer bar -->
  <rect x="80" y="528" width="1040" height="40" rx="0" fill="#f1f3f5"/>
  <rect x="80" y="528" width="1040" height="1" fill="#dee2e6"/>
  <text x="110" y="553" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#6c757d">MotorLink Malawi — Connecting Malawi's automotive community since 2025. Built with love by ProManaged IT.</text>
  <text x="1090" y="553" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="700" fill="#2d6a4f" text-anchor="end">promanaged-it.com/motorlink</text>
</svg>
`;

async function generateBanner() {
  try {
    console.log('Generating MotorLink ad banner...');

    // Convert SVG to PNG using sharp
    await sharp(Buffer.from(svg))
      .resize(WIDTH, HEIGHT, {
        fit: 'fill',
      })
      .png({ quality: 100 })
      .toFile(OUTPUT_PATH);

    console.log(`Banner saved to: ${OUTPUT_PATH}`);
    console.log(`Dimensions: ${WIDTH}x${HEIGHT}px`);

    // Verify the file was created
    const stats = fs.statSync(OUTPUT_PATH);
    console.log(`File size: ${(stats.size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('Error generating banner:', error);
    process.exit(1);
  }
}

generateBanner();
