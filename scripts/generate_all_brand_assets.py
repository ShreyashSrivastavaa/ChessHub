import os
from PIL import Image, ImageDraw, ImageFont

# Define directory
PUBLIC_DIR = "public"
os.makedirs(PUBLIC_DIR, exist_ok=True)

# 1. Standalone Knight Icon SVG (Vector)
KNIGHT_SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" fill="none">
  <defs>
    <!-- Metallic Gold Gradient -->
    <linearGradient id="goldMane" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF2B2"/>
      <stop offset="20%" stop-color="#E5C158"/>
      <stop offset="55%" stop-color="#CFA859"/>
      <stop offset="80%" stop-color="#A67C1E"/>
      <stop offset="100%" stop-color="#73500B"/>
    </linearGradient>
    <!-- Secondary Gold Accent -->
    <linearGradient id="goldAccent" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#996E14"/>
      <stop offset="40%" stop-color="#D4AF37"/>
      <stop offset="80%" stop-color="#FCE38A"/>
      <stop offset="100%" stop-color="#E5C158"/>
    </linearGradient>
    <!-- Base Gradient -->
    <linearGradient id="goldBase" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#80570F"/>
      <stop offset="25%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#FFF0A8"/>
      <stop offset="75%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#80570F"/>
    </linearGradient>
    <!-- Dark Shading for head -->
    <linearGradient id="darkHead" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#222228"/>
      <stop offset="45%" stop-color="#141418"/>
      <stop offset="100%" stop-color="#0A0A0D"/>
    </linearGradient>
    <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <g filter="url(#subtleGlow)">
    <!-- 1. Outer Golden Mane Crest -->
    <path d="M 33 13 C 37 8, 45 10, 52 14 C 64 22, 73 36, 75 52 C 77 68, 71 83, 62 96 C 59 100, 54 102, 49 102 C 55 98, 62 89, 64 78 C 66 64, 60 48, 50 36 C 44 28, 38 21, 33 13 Z"
          fill="url(#goldMane)" />

    <!-- 2. Dark Knight Head & Neck Body -->
    <path d="M 31 16 
             C 32 12, 28 8, 25 9 
             C 24 13, 26 18, 26 21 
             L 21 27 
             C 16 33, 11 39, 13 46 
             C 14 49, 17 50, 20 48 
             C 22 47, 21 44, 19 44 
             C 17 44, 16 42, 17 40 
             C 19 36, 23 32, 26 31 
             C 24 37, 23 44, 25 50 
             C 28 58, 34 68, 38 78 
             C 41 85, 43 94, 44 102 
             L 52 102 
             C 52 92, 48 81, 44 71 
             C 40 60, 36 50, 35 39 
             C 34 32, 35 25, 33 18 
             Z" 
          fill="url(#darkHead)" />

    <!-- 3. Golden Ear / Crown Accent -->
    <path d="M 27 8 C 30 7, 34 11, 32 17 C 28 17, 25 13, 27 8 Z" 
          fill="url(#goldAccent)" />

    <!-- 4. Inner Golden Neck Muscle Sweep -->
    <path d="M 36 29 C 40 37, 44 47, 44 58 C 44 71, 39 84, 34 94 C 38 88, 41 78, 41 68 C 41 57, 38 47, 33 39 C 32 37, 34 32, 36 29 Z" 
          fill="url(#goldAccent)" />

    <!-- 5. Stylized Eye Slit -->
    <path d="M 24 29 C 26 29, 28 31, 26 33 C 24 33, 22 31, 24 29 Z" 
          fill="#FFF2B2" />

    <!-- 6. Chest Highlight Ridge -->
    <path d="M 23 48 C 24 55, 29 65, 34 74 C 33 73, 29 64, 27 56 C 25 52, 24 49, 23 48 Z" 
          fill="url(#goldAccent)" opacity="0.85" />

    <!-- 7. Pedestal Upper Ring / Torus Collar -->
    <rect x="22" y="103" width="38" height="5" rx="2.5" fill="url(#goldBase)" />

    <!-- 8. Pedestal Lower Plinth Foot -->
    <path d="M 17 113 C 17 110, 20 109, 23 109 L 59 109 C 62 109, 65 110, 65 113 C 65 114, 64 115, 62 115 L 20 115 C 18 115, 17 114, 17 113 Z" 
          fill="url(#goldBase)" />
  </g>
</svg>'''

# 2. Full Horizontal Logo SVG with Wordmark & Tagline (Dark Background / Transparent)
FULL_LOGO_SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 90" fill="none">
  <defs>
    <linearGradient id="goldManeFull" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF2B2"/>
      <stop offset="25%" stop-color="#E5C158"/>
      <stop offset="60%" stop-color="#CFA859"/>
      <stop offset="85%" stop-color="#A67C1E"/>
      <stop offset="100%" stop-color="#73500B"/>
    </linearGradient>
    <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF0A8"/>
      <stop offset="35%" stop-color="#E5C158"/>
      <stop offset="70%" stop-color="#CFA859"/>
      <stop offset="100%" stop-color="#AA8022"/>
    </linearGradient>
    <linearGradient id="goldBaseFull" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#80570F"/>
      <stop offset="30%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#FFF0A8"/>
      <stop offset="70%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#80570F"/>
    </linearGradient>
    <linearGradient id="darkHeadFull" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#282832"/>
      <stop offset="50%" stop-color="#141418"/>
      <stop offset="100%" stop-color="#08080A"/>
    </linearGradient>
  </defs>

  <!-- Left: Knight Icon (Scaled inside 70x80 box, offset x=6, y=6) -->
  <g transform="translate(6, 4) scale(0.68)">
    <!-- Outer Golden Mane Crest -->
    <path d="M 33 13 C 37 8, 45 10, 52 14 C 64 22, 73 36, 75 52 C 77 68, 71 83, 62 96 C 59 100, 54 102, 49 102 C 55 98, 62 89, 64 78 C 66 64, 60 48, 50 36 C 44 28, 38 21, 33 13 Z"
          fill="url(#goldManeFull)" />

    <!-- Dark Knight Head -->
    <path d="M 31 16 
             C 32 12, 28 8, 25 9 
             C 24 13, 26 18, 26 21 
             L 21 27 
             C 16 33, 11 39, 13 46 
             C 14 49, 17 50, 20 48 
             C 22 47, 21 44, 19 44 
             C 17 44, 16 42, 17 40 
             C 19 36, 23 32, 26 31 
             C 24 37, 23 44, 25 50 
             C 28 58, 34 68, 38 78 
             C 41 85, 43 94, 44 102 
             L 52 102 
             C 52 92, 48 81, 44 71 
             C 40 60, 36 50, 35 39 
             C 34 32, 35 25, 33 18 
             Z" 
          fill="url(#darkHeadFull)" />

    <!-- Golden Ear -->
    <path d="M 27 8 C 30 7, 34 11, 32 17 C 28 17, 25 13, 27 8 Z" fill="url(#goldTextGrad)" />

    <!-- Inner Golden Sweep -->
    <path d="M 36 29 C 40 37, 44 47, 44 58 C 44 71, 39 84, 34 94 C 38 88, 41 78, 41 68 C 41 57, 38 47, 33 39 C 32 37, 34 32, 36 29 Z" fill="url(#goldTextGrad)" />

    <!-- Eye Slit -->
    <path d="M 24 29 C 26 29, 28 31, 26 33 C 24 33, 22 31, 24 29 Z" fill="#FFF2B2" />

    <!-- Pedestal Rings -->
    <rect x="22" y="103" width="38" height="5" rx="2.5" fill="url(#goldBaseFull)" />
    <path d="M 17 113 C 17 110, 20 109, 23 109 L 59 109 C 62 109, 65 110, 65 113 C 65 114, 64 115, 62 115 L 20 115 C 18 115, 17 114, 17 113 Z" fill="url(#goldBaseFull)" />
  </g>

  <!-- Right: Wordmark & Tagline -->
  <!-- "CHESS" in pure white, "HUB" in metallic gold -->
  <text x="74" y="50" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', Montserrat, sans-serif" font-size="34" font-weight="800" letter-spacing="0.02em">
    <tspan fill="#FFFFFF">CHESS</tspan><tspan fill="url(#goldTextGrad)">HUB</tspan>
  </text>

  <!-- Tagline: "— LEARN  PLAY  IMPROVE —" -->
  <line x1="75" y1="67" x2="108" y2="67" stroke="#CFA859" stroke-width="1.2" opacity="0.8"/>
  <text x="114" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif" font-size="9" font-weight="600" fill="#E0DCD3" letter-spacing="0.28em">
    LEARN  PLAY  IMPROVE
  </text>
  <line x1="288" y1="67" x2="321" y2="67" stroke="#CFA859" stroke-width="1.2" opacity="0.8"/>
</svg>'''

# 3. Favicon SVG (Black rounded squircle with centered metallic gold knight)
FAVICON_SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">
  <defs>
    <linearGradient id="favBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181D"/>
      <stop offset="100%" stop-color="#08080A"/>
    </linearGradient>
    <linearGradient id="favGoldMane" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF2B2"/>
      <stop offset="25%" stop-color="#E5C158"/>
      <stop offset="60%" stop-color="#CFA859"/>
      <stop offset="85%" stop-color="#A67C1E"/>
      <stop offset="100%" stop-color="#73500B"/>
    </linearGradient>
    <linearGradient id="favGoldAccent" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#996E14"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#FFF0A8"/>
    </linearGradient>
    <linearGradient id="favDarkHead" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#24242C"/>
      <stop offset="50%" stop-color="#141418"/>
      <stop offset="100%" stop-color="#0A0A0D"/>
    </linearGradient>
    <linearGradient id="favGoldBase" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#80570F"/>
      <stop offset="30%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#FFF0A8"/>
      <stop offset="70%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#80570F"/>
    </linearGradient>
  </defs>

  <!-- Dark Rounded Squircle Base -->
  <rect x="4" y="4" width="120" height="120" rx="28" fill="url(#favBg)"/>
  <rect x="4" y="4" width="120" height="120" rx="28" stroke="#33333E" stroke-width="2" opacity="0.6"/>

  <!-- Centered Scaled Knight Icon (scale: 0.88, offset: x=20, y=11) -->
  <g transform="translate(20, 11) scale(0.88)">
    <!-- Outer Golden Mane Crest -->
    <path d="M 33 13 C 37 8, 45 10, 52 14 C 64 22, 73 36, 75 52 C 77 68, 71 83, 62 96 C 59 100, 54 102, 49 102 C 55 98, 62 89, 64 78 C 66 64, 60 48, 50 36 C 44 28, 38 21, 33 13 Z"
          fill="url(#favGoldMane)" />

    <!-- Dark Knight Head -->
    <path d="M 31 16 
             C 32 12, 28 8, 25 9 
             C 24 13, 26 18, 26 21 
             L 21 27 
             C 16 33, 11 39, 13 46 
             C 14 49, 17 50, 20 48 
             C 22 47, 21 44, 19 44 
             C 17 44, 16 42, 17 40 
             C 19 36, 23 32, 26 31 
             C 24 37, 23 44, 25 50 
             C 28 58, 34 68, 38 78 
             C 41 85, 43 94, 44 102 
             L 52 102 
             C 52 92, 48 81, 44 71 
             C 40 60, 36 50, 35 39 
             C 34 32, 35 25, 33 18 
             Z" 
          fill="url(#favDarkHead)" stroke="url(#favGoldAccent)" stroke-width="0.75" />

    <!-- Golden Ear -->
    <path d="M 27 8 C 30 7, 34 11, 32 17 C 28 17, 25 13, 27 8 Z" fill="url(#favGoldAccent)" />

    <!-- Inner Golden Sweep -->
    <path d="M 36 29 C 40 37, 44 47, 44 58 C 44 71, 39 84, 34 94 C 38 88, 41 78, 41 68 C 41 57, 38 47, 33 39 C 32 37, 34 32, 36 29 Z" fill="url(#favGoldAccent)" />

    <!-- Eye Slit -->
    <path d="M 24 29 C 26 29, 28 31, 26 33 C 24 33, 22 31, 24 29 Z" fill="#FFF2B2" />

    <!-- Pedestal Rings -->
    <rect x="22" y="103" width="38" height="5" rx="2.5" fill="url(#favGoldBase)" />
    <path d="M 17 113 C 17 110, 20 109, 23 109 L 59 109 C 62 109, 65 110, 65 113 C 65 114, 64 115, 62 115 L 20 115 C 18 115, 17 114, 17 113 Z" fill="url(#favGoldBase)" />
  </g>
</svg>'''

# Write SVGs
with open(os.path.join(PUBLIC_DIR, "logo.svg"), "w", encoding="utf-8") as f:
    f.write(FULL_LOGO_SVG)

with open(os.path.join(PUBLIC_DIR, "logo-icon.svg"), "w", encoding="utf-8") as f:
    f.write(KNIGHT_SVG)

with open(os.path.join(PUBLIC_DIR, "favicon.svg"), "w", encoding="utf-8") as f:
    f.write(FAVICON_SVG)

print("SVGs written successfully to public/ (logo.svg, logo-icon.svg, favicon.svg)")
