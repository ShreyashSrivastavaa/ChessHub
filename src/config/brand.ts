export interface CoachBrandInfo {
  slug: string;
  name: string;
  headline: string;
  focus: string;
  fideRated: boolean;
  avatarPlaceholderInitial: string;
}

export const BRAND_CONFIG = {
  name: "ChessHub",
  shortName: "ChessHub",
  tagline: "Learn. Play. Improve.",
  heroSubcopy: "Shreyash builds your foundations. Tapesnu, a FIDE-rated player, sharpens your game. Classes run live on Google Meet.",
  domain: "chess-hub-six.vercel.app",
  contactEmail: "shreyashsr2004@gmail.com",
  whatsappNumber: "+91 99309 17551",
  social: {
    instagram: "@chesshub",
    youtube: "@chesshub",
    twitter: "@chesshub",
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
      name: "Tapesnu",
      headline: "FIDE-Rated Competitive Player & Coach",
      focus: "Openings and lines, advanced tactics, positional play, calculation, strategy, game analysis, tournament preparation.",
      fideRated: true,
      avatarPlaceholderInitial: "T",
    },
    tapesnu: {
      slug: "tapesh",
      name: "Tapesnu",
      headline: "FIDE-Rated Competitive Player & Coach",
      focus: "Openings and lines, advanced tactics, positional play, calculation, strategy, game analysis, tournament preparation.",
      fideRated: true,
      avatarPlaceholderInitial: "T",
    },
    tapeshnu: {
      slug: "tapesh",
      name: "Tapesnu",
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
