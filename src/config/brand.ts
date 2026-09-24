export interface CoachBrandInfo {
  slug: string;
  name: string;
  headline: string;
  focus: string;
  fideRated: boolean;
  avatarPlaceholderInitial: string;
}

export const BRAND_CONFIG = {
  name: "TWO ROOKS",
  shortName: "Two Rooks",
  tagline: "Live chess coaching. One coach, one student, one board.",
  heroSubcopy: "Shreyash builds your foundations. Tapesh, a FIDE-rated player, sharpens your game. Classes run live on Google Meet.",
  domain: "tworooks.com",
  contactEmail: "hello@tworooks.com",
  whatsappNumber: "+91 98765 43210", // PLACEHOLDER: Update with real WhatsApp business number
  social: {
    instagram: "@tworookschess",
    youtube: "@tworookschess",
    twitter: "@tworookschess",
  },
  location: "India / Global Online",
  coaches: {
    shreyash: {
      slug: "shreyash",
      name: "Shreyash",
      headline: "Foundations & Beginner Specialist",
      focus: "Absolute beginners, children, piece movement, opening principles, basic tactics, checkmate patterns, board understanding, building confidence.",
      fideRated: false,
      avatarPlaceholderInitial: "S",
    },
    tapesh: {
      slug: "tapesh",
      name: "Tapesh",
      headline: "FIDE-Rated Competitive Player & Coach",
      focus: "Openings and lines, advanced tactics, positional play, calculation, strategy, game analysis, tournament preparation.",
      fideRated: true,
      avatarPlaceholderInitial: "T",
    },
  },
  trustSignals: [
    "1:1 on Google Meet",
    "Pay securely with Razorpay",
    "Reschedule up to 12 hours before",
  ],
  defaultCurrency: "INR" as const,
  currencySymbol: "₹",
};
