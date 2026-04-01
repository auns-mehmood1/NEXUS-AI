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

export interface HomeStat {
  value: string;
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

export interface PublicContent {
  languages: LanguageOption[];
  homeStats: HomeStat[];
  homeHeroModelIds: string[];
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
