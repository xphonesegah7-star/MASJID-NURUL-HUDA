export interface MosqueInfo {
  name: string;
  year: string;
  subtitle: string;
}

export interface PrintSettings {
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  scale: number;
  donorsPerPage: number;
  quality: 'TAJAM' | 'STANDAR';
}

export interface Donor {
  id: string;
  no: number;
  name: string;
  date: string;
  date2?: string;
  contributionType: string;
}
