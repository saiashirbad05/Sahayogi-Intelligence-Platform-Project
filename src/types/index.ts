export interface NGO {
  id: string;
  name: string;
  specialty?: string;
  location?: string;
  region?: string;
  mission?: string;
  verified: boolean;
  type: 'NGO';
  impact_score?: number;
  image_gallery?: string[];
  banner?: string;
}

export interface Volunteer {
  id: string;
  name: string;
  location?: string;
  specialty?: string;
  verified: boolean;
  type: 'Volunteer';
}

export interface RiskReport {
  id: string;
  district: string;
  need_score: number;
  top_category: string;
  report_count: number;
}
