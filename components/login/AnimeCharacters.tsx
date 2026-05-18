export function ChibiGirl() {
  return (
    <svg viewBox="0 0 200 320" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Hair back */}
      <ellipse cx="100" cy="85" rx="72" ry="78" fill="#2d1b4e" />
      <ellipse cx="100" cy="55" rx="68" ry="65" fill="#3c2468" />
      {/* Hair sides */}
      <path d="M30 95 Q20 180 38 250 Q42 260 46 250 Q36 180 40 100Z" fill="#2d1b4e" />
      <path d="M170 95 Q180 180 162 250 Q158 260 154 250 Q164 180 160 100Z" fill="#2d1b4e" />
      {/* Face */}
      <ellipse cx="100" cy="90" rx="48" ry="52" fill="#fff5f0" />
      {/* Blush */}
      <ellipse cx="60" cy="105" rx="12" ry="7" fill="#ffb3c1" opacity="0.5" />
      <ellipse cx="140" cy="105" rx="12" ry="7" fill="#ffb3c1" opacity="0.5" />
      {/* Eyes */}
      <ellipse cx="68" cy="88" rx="12" ry="14" fill="#3c2468" />
      <ellipse cx="132" cy="88" rx="12" ry="14" fill="#3c2468" />
      <ellipse cx="71" cy="85" rx="5" ry="6" fill="white" opacity="0.8" />
      <ellipse cx="135" cy="85" rx="5" ry="6" fill="white" opacity="0.8" />
      <circle cx="73" cy="92" r="2" fill="white" opacity="0.6" />
      <circle cx="137" cy="92" r="2" fill="white" opacity="0.6" />
      {/* Mouth */}
      <path d="M90 108 Q100 118 110 108" stroke="#e88b9a" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Bangs */}
      <path d="M40 60 Q55 35 80 48 Q72 25 90 38 Q95 18 100 38 Q105 18 110 38 Q128 25 120 48 Q145 35 160 60 Q140 30 100 28 Q60 30 40 60Z" fill="#3c2468" />
      {/* Hair ornaments - cherry blossoms */}
      <circle cx="148" cy="68" r="6" fill="#ffb7c5" />
      <g transform="translate(148, 68) scale(0.5)">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx="0" cy="-8" rx="3" ry="6" fill="#ffb7c5" transform={`rotate(${angle})`} />
        ))}
      </g>
      <circle cx="52" cy="72" r="5" fill="#ffb7c5" />
      <g transform="translate(52, 72) scale(0.4)">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx="0" cy="-8" rx="3" ry="6" fill="#ffb7c5" transform={`rotate(${angle})`} />
        ))}
      </g>
      {/* Body - sailor collar */}
      <path d="M52 140 L30 125 Q20 130 18 140 L52 150Z" fill="white" />
      <path d="M148 140 L170 125 Q180 130 182 140 L148 150Z" fill="white" />
      <path d="M52 140 L100 155 L148 140 L160 180 Q165 195 155 210 L130 220 L100 225 L70 220 L45 210 Q35 195 40 180Z" fill="white" />
      {/* Sailor top */}
      <path d="M52 140 L100 155 L148 140 L160 180 L140 175 L100 185 L60 175 L40 180Z" fill="#4a6fa5" />
      {/* Ribbon */}
      <path d="M85 155 L70 140 L55 155Z" fill="#e84a7a" />
      <path d="M115 155 L130 140 L145 155Z" fill="#e84a7a" />
      <circle cx="100" cy="155" r="4" fill="#e84a7a" />
      {/* Skirt */}
      <path d="M45 210 L40 230 L60 235 L85 240 L100 242 L115 240 L140 235 L160 230 L155 210Z" fill="#4a6fa5" />
      <path d="M40 230 Q100 255 160 230" stroke="#3a5a8a" strokeWidth="2" fill="none" />
      {/* Legs */}
      <rect x="78" y="240" width="12" height="35" rx="5" fill="#fff5f0" />
      <rect x="110" y="240" width="12" height="35" rx="5" fill="#fff5f0" />
      {/* Shoes */}
      <ellipse cx="84" cy="278" rx="10" ry="6" fill="#e84a7a" />
      <ellipse cx="116" cy="278" rx="10" ry="6" fill="#e84a7a" />
      {/* Arms */}
      <path d="M40 175 Q25 200 30 230" stroke="#fff5f0" strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M160 175 Q175 200 170 230" stroke="#fff5f0" strokeWidth="12" fill="none" strokeLinecap="round" />
      {/* Sparkles */}
      <text x="20" y="40" fontSize="12" opacity="0.6">✨</text>
      <text x="165" y="30" fontSize="10" opacity="0.5">🌟</text>
      <text x="10" y="170" fontSize="8" opacity="0.4">💫</text>
      <text x="175" y="160" fontSize="10" opacity="0.5">💖</text>
    </svg>
  );
}

export function ChibiCat() {
  return (
    <svg viewBox="0 0 180 260" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="90" cy="190" rx="55" ry="65" fill="#fff5f0" />
      {/* Head */}
      <ellipse cx="90" cy="95" rx="55" ry="50" fill="#fff5f0" />
      {/* Ears */}
      <path d="M45 65 L35 15 L70 55Z" fill="#fff5f0" />
      <path d="M135 65 L145 15 L110 55Z" fill="#fff5f0" />
      {/* Inner ears */}
      <path d="M47 60 L40 28 L65 55Z" fill="#ffb3c1" opacity="0.5" />
      <path d="M133 60 L140 28 L115 55Z" fill="#ffb3c1" opacity="0.5" />
      {/* Eyes */}
      <ellipse cx="68" cy="90" rx="10" ry="13" fill="#3c2468" />
      <ellipse cx="112" cy="90" rx="10" ry="13" fill="#3c2468" />
      <ellipse cx="71" cy="87" rx="4" ry="5" fill="white" opacity="0.8" />
      <ellipse cx="115" cy="87" rx="4" ry="5" fill="white" opacity="0.8" />
      {/* Blush */}
      <ellipse cx="52" cy="102" rx="8" ry="5" fill="#ffb3c1" opacity="0.4" />
      <ellipse cx="128" cy="102" rx="8" ry="5" fill="#ffb3c1" opacity="0.4" />
      {/* Nose & Mouth */}
      <ellipse cx="90" cy="97" rx="3" ry="2" fill="#e88b9a" />
      <path d="M82 102 Q90 110 98 102" stroke="#e88b9a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="20" y1="90" x2="52" y2="96" stroke="#ddd" strokeWidth="1" />
      <line x1="18" y1="105" x2="50" y2="105" stroke="#ddd" strokeWidth="1" />
      <line x1="160" y1="90" x2="128" y2="96" stroke="#ddd" strokeWidth="1" />
      <line x1="162" y1="105" x2="130" y2="105" stroke="#ddd" strokeWidth="1" />
      {/* Scarf */}
      <path d="M50 135 Q90 150 130 135 Q135 150 130 160 Q90 175 50 160 Q45 150 50 135Z" fill="#e84a7a" />
      <path d="M125 145 Q145 155 140 175 Q135 185 145 190 Q155 178 150 155Z" fill="#e84a7a" />
      {/* Arms/paws */}
      <ellipse cx="42" cy="175" rx="15" ry="12" fill="#fff5f0" />
      <ellipse cx="138" cy="175" rx="15" ry="12" fill="#fff5f0" />
      {/* Paw pads */}
      <circle cx="42" cy="173" r="3" fill="#ffb3c1" opacity="0.5" />
      <circle cx="38" cy="170" r="2" fill="#ffb3c1" opacity="0.5" />
      <circle cx="46" cy="170" r="2" fill="#ffb3c1" opacity="0.5" />
      <circle cx="138" cy="173" r="3" fill="#ffb3c1" opacity="0.5" />
      <circle cx="134" cy="170" r="2" fill="#ffb3c1" opacity="0.5" />
      <circle cx="142" cy="170" r="2" fill="#ffb3c1" opacity="0.5" />
      {/* Tail */}
      <path d="M140 220 Q165 200 170 170 Q175 150 165 155" stroke="#fff5f0" strokeWidth="8" fill="none" strokeLinecap="round" />
      {/* Belly */}
      <ellipse cx="90" cy="195" rx="30" ry="35" fill="white" opacity="0.6" />
      {/* Feet */}
      <ellipse cx="65" cy="250" rx="18" ry="10" fill="#fff5f0" />
      <ellipse cx="115" cy="250" rx="18" ry="10" fill="#fff5f0" />
      {/* Toe beans */}
      <circle cx="60" cy="247" r="3" fill="#ffb3c1" opacity="0.5" />
      <circle cx="65" cy="245" r="3" fill="#ffb3c1" opacity="0.5" />
      <circle cx="70" cy="247" r="3" fill="#ffb3c1" opacity="0.5" />
      <circle cx="110" cy="247" r="3" fill="#ffb3c1" opacity="0.5" />
      <circle cx="115" cy="245" r="3" fill="#ffb3c1" opacity="0.5" />
      <circle cx="120" cy="247" r="3" fill="#ffb3c1" opacity="0.5" />
    </svg>
  );
}

export function FloatingHearts() {
  return (
    <svg viewBox="0 0 120 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.3">
        <text x="10" y="30" fontSize="18">💕</text>
        <text x="80" y="60" fontSize="14">🌸</text>
        <text x="30" y="90" fontSize="12">✨</text>
        <text x="70" y="120" fontSize="16">🎀</text>
        <text x="20" y="150" fontSize="14">💖</text>
        <text x="60" y="175" fontSize="12">🌟</text>
        <text x="90" y="20" fontSize="10">💫</text>
      </g>
    </svg>
  );
}
