/**
 * Business Configuration — Single Source of Truth
 * 
 * NOTE: Never hardcode prices, coach names, contact details or policies in UI components.
 * Always import them from this file.
 */

export type CoachingLevelId = "beginner" | "advanced";

export interface CoachingPlan {
  id: CoachingLevelId;
  name: string;
  tagline: string;
  priceRupees: number;
  pricePaise: number;
  durationMinutes: number;
  description: string;
  audience: string;
  topics: string[];
}

export interface CoachProfile {
  slug: string;
  name: string;
  displayName: string;
  roleTitle: string;
  photoUrl?: string; // Optional real photo path
  bio: string; // Factual bio without invented ratings
  experience?: string; // Optional factual chess experience; hidden if empty
  specialties: string[]; // Teaching specialties
}

export const BUSINESS_CONFIG = {
  name: "ChessHub",
  legalName: "ChessHub Coaching",
  tagline: "Learn. Play. Improve.",
  heroSubtext:
    "Personalized chess coaching for beginners and advanced players. Build your strategy, sharpen your tactics, and become a more confident player with ChessHub.",
  email: "shreyashsr2004@gmail.com",
  phone: "+91 9930917551",
  phoneDisplay: "+91 99309 17551",
  contactCoachName: "Tapesnu",
  timezone: process.env.NEXT_PUBLIC_TIMEZONE || "Asia/Kolkata",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://chess-hub-six.vercel.app",

  paymentPolicy: {
    description:
      "No online payments on this website. Students contact the coaches directly to discuss payment and finalize booking confirmation.",
    requireDirectContact: true,
  },

  plans: {
    beginner: {
      id: "beginner" as CoachingLevelId,
      name: "Beginner Coaching",
      tagline: "For newcomers & players building fundamentals",
      priceRupees: 500,
      pricePaise: 50000,
      durationMinutes: 60,
      audience: "Newcomers and players building fundamentals",
      description:
        "Master the foundational principles of chess, piece harmony, and key tactical motifs through patient 1:1 guidance.",
      topics: [
        "Rules and piece movement",
        "Opening principles",
        "Basic tactics and checkmates",
        "Strategic thinking and practice positions",
      ],
    },
    advanced: {
      id: "advanced" as CoachingLevelId,
      name: "Advanced Coaching",
      tagline: "For players aiming for competitive edge",
      priceRupees: 800,
      pricePaise: 80000,
      durationMinutes: 60,
      audience: "Players who know the fundamentals and want to improve competitive play",
      description:
        "Sharpen tactical acuity, refine opening repertoires, and master complex endgame technique tailored to competitive play.",
      topics: [
        "Advanced tactical patterns",
        "Opening preparation",
        "Positional understanding",
        "Endgame technique",
        "Game analysis and strategic improvement",
      ],
    },
  } as Record<CoachingLevelId, CoachingPlan>,

  coaches: [
    {
      slug: "shreyash",
      name: "Shreyash",
      displayName: "Shreyash",
      roleTitle: "Chess Coach & Co-founder",
      bio: "Passionate about chess education and helping learners develop strong board vision, sound opening fundamentals, and disciplined strategic thinking from move one.",
      experience: "Years of dedicated coaching with junior and adult learners building systematic chess foundations.",
      specialties: [
        "Opening fundamentals",
        "Tactical vision & pattern recognition",
        "Calculation discipline",
        "Interactive game review",
      ],
    },
    {
      slug: "tapesnu",
      name: "Tapesnu",
      displayName: "Tapesnu",
      roleTitle: "Chess Coach & Co-founder",
      bio: "Dedicated competitive chess player and coach focusing on strategic nuances, opening systems, and deep positional understanding for tournament and club competitors.",
      experience: "Competitive match play and personalized game analysis for advancing students.",
      specialties: [
        "Competitive opening preparation",
        "Positional evaluation",
        "Dynamic calculation",
        "Endgame mastery",
      ],
    },
  ] as CoachProfile[],

  howItWorksSteps: [
    {
      stepNumber: 1,
      title: "Choose your coaching level",
      description: "Select Beginner (₹500/session) or Advanced (₹800/session) based on your current comfort and goals.",
    },
    {
      stepNumber: 2,
      title: "Select an available date and session",
      description: "Pick a date and convenient time slot from our real-time availability calendar.",
    },
    {
      stepNumber: 3,
      title: "Contact us to discuss payment and finalize your booking",
      description: "Reach out via email or phone with your booking reference to finalize payment directly with the coaches.",
    },
    {
      stepNumber: 4,
      title: "Receive booking confirmation and attend your lesson",
      description: "Once confirmed by the coaches, join your personalized 1:1 online coaching session.",
    },
  ],
};

/**
 * Server-safe price resolution:
 * Never trust price from the browser. Always compute server-side based on level.
 */
export function getPlanByLevel(level: string): CoachingPlan {
  const normalized = level.toLowerCase().trim();
  if (normalized === "advanced") {
    return BUSINESS_CONFIG.plans.advanced;
  }
  return BUSINESS_CONFIG.plans.beginner;
}
