export declare class UsmPortfolio {
    id: number;
    portfolioName: string;
    description: string;
    last_updated: any;
    constructor(json?: any);
    static toArray(jsons: any[]): UsmPortfolio[];
}
