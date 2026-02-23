export interface StartupDetail {
  id: string;
  logo: string;
  name: string;
  tagline: string;
  industry: string;
  location: string;
  fundingGoal: number;
  fundingRaised: number;
  investorCount: number;
  description: string;
  solution: string;
  valueProposition: string;
  businessModel: string;
  founded: string;
  teamSize: number;
  founders: { name: string; role: string; bio: string }[];
  website: string;
  stage: string;
  minimumInvestment: number;
  viewCount: number;
  owner?: { _id: string; name: string; image?: string };
  recentInvestors: {
    name: string;
    image: string;
    amount: number;
    date: string;
  }[];
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount}`;
}
