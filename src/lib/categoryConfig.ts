export type CategoryConfig = {
  id: string;
  titleTr: string;
  titleEn: string;
  showOnHome?: boolean;
};

export const CATEGORY_CONFIG = {
  electricVehicles: {
    id: '16714',
    titleTr: 'Elektrikli Araçlar',
    titleEn: 'Electric Vehicles',
    showOnHome: true,
  },
  testDrives: {
    id: '5',
    titleTr: 'Test Sürüşleri',
    titleEn: 'Test Drives',
    showOnHome: true,
  },
  motorsports: {
    id: '3',
    titleTr: 'Motor Sporları',
    titleEn: 'Motorsports',
    showOnHome: true,
  },
  campaigns: {
    id: '5801',
    titleTr: 'Kampanyalar',
    titleEn: 'Campaigns',
    showOnHome: true,
  },
  interviews: {
    id: '12',
    titleTr: 'Röportajlar',
    titleEn: 'Interviews',
    showOnHome: true,
  },
  commercialVehicles: {
    id: '7368',
    titleTr: 'Ticari Araçlar',
    titleEn: 'Commercial Vehicles',
    showOnHome: true,
  },
  fuel: {
    id: '18327',
    titleTr: 'Akaryakıt',
    titleEn: 'Fuel',
    showOnHome: true,
  },
  tires: {
    id: '18324',
    titleTr: 'Lastik',
    titleEn: 'Tires',
    showOnHome: true,
  },
  concept: {
    id: '5802',
    titleTr: 'Konsept',
    titleEn: 'Concept',
    showOnHome: true,
  },
  allNews: {
    id: '4',
    titleTr: 'Tüm Haberler',
    titleEn: 'All News',
  },
} satisfies Record<string, CategoryConfig>;

export const HOME_CATEGORY_ORDER: CategoryConfig[] = [
  CATEGORY_CONFIG.electricVehicles,
  CATEGORY_CONFIG.testDrives,
  CATEGORY_CONFIG.motorsports,
  CATEGORY_CONFIG.campaigns,
  CATEGORY_CONFIG.commercialVehicles,
  CATEGORY_CONFIG.fuel,
  CATEGORY_CONFIG.tires,
  CATEGORY_CONFIG.concept,
  CATEGORY_CONFIG.interviews,
];

export const NAVBAR_NEWS_CATEGORIES: CategoryConfig[] = [
  CATEGORY_CONFIG.campaigns,
  CATEGORY_CONFIG.motorsports,
  CATEGORY_CONFIG.interviews,
  CATEGORY_CONFIG.electricVehicles,
  CATEGORY_CONFIG.allNews,
];

export const SITEMAP_CATEGORY_IDS = [
  CATEGORY_CONFIG.testDrives.id,
  CATEGORY_CONFIG.campaigns.id,
  CATEGORY_CONFIG.motorsports.id,
  CATEGORY_CONFIG.interviews.id,
  CATEGORY_CONFIG.electricVehicles.id,
  CATEGORY_CONFIG.commercialVehicles.id,
  CATEGORY_CONFIG.fuel.id,
  CATEGORY_CONFIG.tires.id,
  CATEGORY_CONFIG.concept.id,
];

export const CATEGORY_BY_ID = Object.values(CATEGORY_CONFIG).reduce<Record<string, CategoryConfig>>((acc, category) => {
  acc[category.id] = category;
  return acc;
}, {});

export function getCategoryTitleById(id: string, language: string) {
  const category = CATEGORY_BY_ID[id];

  if (!category) {
    return language === 'tr' ? 'Haberler' : 'News';
  }

  return language === 'tr' ? category.titleTr : category.titleEn;
}
