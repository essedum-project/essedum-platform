
export class UsmPortfolio {
    id: number;
    portfolioName: string;
    description: string;
    last_updated: any;
    constructor(json?: any) {
        if (json != null) {
            this.id = json.id;
            this.portfolioName = json.portfolioName;
            this.description = json.description;
            this.last_updated = json.last_updated;
        }
    }

    // Utils

    static toArray(jsons: any[]): UsmPortfolio[] {
        let usm_portfolios: UsmPortfolio[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                usm_portfolios.push(new UsmPortfolio(json));
            }
        }
        return usm_portfolios;
    }
}
