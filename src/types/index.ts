export interface Service {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  facility: string | null;
  organization: string | null;
  address: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  phoneRaw: string | null;
  scheduleText: string | null;
  scheduleStructured: ScheduleEntry[] | null;
  holidayException: string | null;
  requirements: string | null;
  recommendedFor: string | null;
  categories: CategoryInfo[];
  demographics: DemographicInfo[];
  source: "bigburgh" | "county";
  lastUpdated: string | null;
}

export interface ScheduleEntry {
  days: number[];
  open: string;
  close: string;
}

export interface CategoryInfo {
  slug: string;
  nameEn: string;
  nameEs: string;
  icon: string;
  displayOrder: number;
}

export interface DemographicInfo {
  slug: string;
  nameEn: string;
  nameEs: string;
}

export interface CrisisResource {
  id: number;
  name: string;
  organization: string | null;
  phone: string | null;
  phoneRaw: string | null;
  description: string | null;
  scheduleText: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  displayOrder: number;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  demographic?: string;
  neighborhood?: string;
  openNow?: boolean;
}

export type Locale = "en" | "es";
