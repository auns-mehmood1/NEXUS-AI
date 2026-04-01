'use client';

import useSWR from 'swr';
import { contentApi, modelsApi } from './api';

export interface Model {
  id: string;
  icon: string;
  bg: string;
  name: string;
  lab: string;
  org: string;
  desc: string;
  tags: string[];
  badge: string;
  badgeClass: string;
  rating: number;
  reviews: number;
  price: string;
  types: string[];
  price_start: number;
  context: string;
  provider: string;
}

export interface LanguageOption {
  code: string;
  label: string;
}

export interface ChatPanelTab {
  key: string;
  label: string;
}

export interface QuickActionGroup {
  group: string;
  items: string[];
}

export interface TypeChip {
  key: string;
  label: string;
}

export interface AgentTemplate {
  id: string;
  icon: string;
  name: string;
  desc: string;
  tags: string[];
  popular: boolean;
}

export interface BillingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  current: boolean;
  cta: string;
}

export interface HomePageStat {
  value: string;
  label: string;
}

export interface HomePageHero {
  eyebrow: string;
  title: string;
  accent: string;
  subtitle: string;
  description: string;
  placeholder: string;
  cta: string;
}

export interface HomePageAction {
  icon: string;
  label: string;
  prompt: string;
}

export interface HomePageFeatureCard {
  icon: string;
  title: string;
  description: string;
  href: string;
}

export interface HomePageLabCard {
  icon: string;
  name: string;
  summary: string;
  href: string;
}

export interface HomePageComparisonRow {
  model: string;
  lab: string;
  context: string;
  inputPrice: string;
  outputPrice: string;
  multimodal: boolean;
  speed: string;
  speedTone: 'accent' | 'amber' | 'blue' | 'rose' | 'teal';
  bestFor: string;
}

export interface HomePageTrendingCard {
  badge: string;
  badgeTone: 'accent' | 'amber' | 'blue' | 'rose' | 'teal';
  lab: string;
  title: string;
  description: string;
  prompt: string;
}

export interface HomePageBudgetBucket {
  icon: string;
  tone: 'accent' | 'amber' | 'blue' | 'rose' | 'teal';
  title: string;
  description: string;
  cta: string;
  href: string;
}

export interface HomePageUseCase {
  icon: string;
  title: string;
  models: string;
  cta: string;
  prompt: string;
}

export interface HomePageNewsletter {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  placeholder: string;
  buttonLabel: string;
  finePrint: string;
}

export interface HomePageFooterLink {
  label: string;
  href: string;
}

export interface HomePageFooter {
  brand: string;
  links: HomePageFooterLink[];
}

export interface HomePageContent {
  stats: HomePageStat[];
  hero: HomePageHero;
  featuredModelIds: string[];
  heroActions: HomePageAction[];
  builderFeatures: HomePageFeatureCard[];
  labs: HomePageLabCard[];
  comparisonRows: HomePageComparisonRow[];
  trending: HomePageTrendingCard[];
  budgetBuckets: HomePageBudgetBucket[];
  useCases: HomePageUseCase[];
  newsletter: HomePageNewsletter;
  footer: HomePageFooter;
}

export interface PublicContent {
  languages: LanguageOption[];
  homePage: HomePageContent;
  chatPanel: {
    tabs: ChatPanelTab[];
    prompts: Record<string, string[]>;
    quickActions: QuickActionGroup[];
  };
  marketplaceTypeChips: TypeChip[];
  discoverCategories: string[];
  agentTemplates: AgentTemplate[];
  agentWizardSteps: string[];
  billingPlans: BillingPlan[];
}

const SWR_OPTIONS = {
  revalidateOnFocus: false,
  keepPreviousData: true,
} as const;

export function useModels(params?: {
  search?: string;
  type?: string;
  lab?: string;
  maxPrice?: number;
}) {
  return useSWR(
    ['/models', params ?? {}],
    ([, query]) => modelsApi.list(query).then((response) => response.data as Model[]),
    SWR_OPTIONS,
  );
}

export function usePublicContent() {
  return useSWR(
    'content/public',
    () => contentApi.public().then((response) => response.data as PublicContent),
    SWR_OPTIONS,
  );
}
