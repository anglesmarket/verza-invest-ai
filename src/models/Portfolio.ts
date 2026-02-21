import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPortfolio extends Document {
  project: {
    name: string;
    tagline: string;
    email: string;
    phone: string;
  };
  nav: {
    home: string;
    sessions: string;
    topics: string;
    about: string;
  };
  hero: {
    greeting: string;
    name: string;
    titles: string[];
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    joinPlaceholder: string;
  };
  about: {
    sectionTitle: string;
    sectionSubtitle: string;
    paragraphs: string[];
    highlights: Array<{ label: string; value: string }>;
  };
  services: {
    sectionTitle: string;
    sectionSubtitle: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
      features: string[];
    }>;
  };
  footer: {
    copyright: string;
    tagline: string;
  };
  auth: {
    signIn: string;
    signUp: string;
    logout: string;
    register: string;
    email: string;
    password: string;
    name: string;
    googleSignIn: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    registerSuccess: string;
    loginSuccess: string;
    suggestTopic: string;
    topicEn: string;
    flashcardPrompt: string;
    submitSuggestion: string;
    suggestionNote: string;
    loginToSuggest: string;
  };
}

const PortfolioSchema: Schema = new Schema({
  project: {
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  nav: {
    home: { type: String, required: true },
    sessions: { type: String, required: true },
    topics: { type: String, required: true },
    about: { type: String, required: true }
  },
  hero: {
    greeting: { type: String, required: true },
    name: { type: String, required: true },
    titles: [{ type: String }],
    description: { type: String, required: true },
    ctaPrimary: { type: String, required: true },
    ctaSecondary: { type: String, required: true },
    joinPlaceholder: { type: String, required: true }
  },
  about: {
    sectionTitle: { type: String, required: true },
    sectionSubtitle: { type: String, required: true },
    paragraphs: [{ type: String }],
    highlights: [{
      label: { type: String, required: true },
      value: { type: String, required: true }
    }]
  },
  services: {
    sectionTitle: { type: String, required: true },
    sectionSubtitle: { type: String, required: true },
    items: [{
      icon: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      features: [{ type: String }]
    }]
  },
  footer: {
    copyright: { type: String, required: true },
    tagline: { type: String, required: true }
  },
  auth: {
    signIn: { type: String, required: true },
    signUp: { type: String, required: true },
    logout: { type: String, required: true },
    register: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    googleSignIn: { type: String, required: true },
    alreadyHaveAccount: { type: String, required: true },
    dontHaveAccount: { type: String, required: true },
    registerSuccess: { type: String, required: true },
    loginSuccess: { type: String, required: true },
    suggestTopic: { type: String, required: true },
    topicEn: { type: String, required: true },
    flashcardPrompt: { type: String, required: true },
    submitSuggestion: { type: String, required: true },
    suggestionNote: { type: String, required: true },
    loginToSuggest: { type: String, required: true }
  }
}, { timestamps: true });

const Portfolio: Model<IPortfolio> = mongoose.models.Portfolio || mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);

export default Portfolio;
