import gpReferenceData from '@/data/gpReferenceData.json';

export interface GPReference {
  District: string;
  "LGD code of GP": number;
  "GP Name": string;
  "Position of GP": number;
  "Span length": number;
  "Originating Mandal Code": number;
  "Terminating Mandal Code": number;
  "Survey Completed(Yes/No)": string;
  "Originating Mandal": string;
  "Terminating Mandal": string;
  "APSFL New Ring ID": string;
  "Ring Name": string;
}

export class GPDataService {
  private static data: GPReference[] = gpReferenceData as GPReference[];

  static getAllDistricts(): string[] {
    const districts = new Set(this.data.map(gp => gp.District));
    return Array.from(districts).sort();
  }

  static getAllGPNames(): string[] {
    const gpNames = new Set(this.data.map(gp => gp["GP Name"]));
    return Array.from(gpNames).sort();
  }

  static getAllRingNames(): string[] {
    const ringNames = new Set(this.data.map(gp => gp["Ring Name"]));
    return Array.from(ringNames).sort();
  }

  static getGPsByDistrict(district: string): GPReference[] {
    return this.data.filter(gp => gp.District === district);
  }

  static getGPsByRing(ringName: string): GPReference[] {
    return this.data.filter(gp => gp["Ring Name"] === ringName);
  }

  static getGPDetails(gpName: string): GPReference | undefined {
    return this.data.find(gp => gp["GP Name"] === gpName);
  }

  static getMandals(): string[] {
    const mandals = new Set([
      ...this.data.map(gp => gp["Originating Mandal"]),
      ...this.data.map(gp => gp["Terminating Mandal"])
    ]);
    return Array.from(mandals).sort();
  }

  static searchGPs(query: string): GPReference[] {
    const lowerQuery = query.toLowerCase();
    return this.data.filter(gp => 
      gp["GP Name"].toLowerCase().includes(lowerQuery) ||
      gp.District.toLowerCase().includes(lowerQuery) ||
      gp["Ring Name"].toLowerCase().includes(lowerQuery) ||
      gp["Originating Mandal"].toLowerCase().includes(lowerQuery) ||
      gp["Terminating Mandal"].toLowerCase().includes(lowerQuery)
    );
  }

  static getGPCount(): number {
    return this.data.length;
  }

  static getDistrictSummary() {
    const summary: Record<string, { count: number, totalSpan: number }> = {};
    
    this.data.forEach(gp => {
      if (!summary[gp.District]) {
        summary[gp.District] = { count: 0, totalSpan: 0 };
      }
      summary[gp.District].count++;
      summary[gp.District].totalSpan += gp["Span length"];
    });

    return summary;
  }
}