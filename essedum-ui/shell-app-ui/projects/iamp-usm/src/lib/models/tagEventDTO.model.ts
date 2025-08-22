export class TagEventDTO {
  selectedAdapterType: string[] = [];
  // Portfolio specific fields
  portfolioName: string[] = [];
  portfolioDescription: string[] = [];
  selectedRoleName: string[] = [];

  constructor(
    selectedAdapterType = [],
    portfolioName = [],
    portfolioDescription = [],
    selectedRoleName = []
  ) {
    this.selectedAdapterType = selectedAdapterType || [];
    this.portfolioName = portfolioName || [];
    this.portfolioDescription = portfolioDescription || [];
    this.selectedRoleName = selectedRoleName || [];
  }


  
  getSelectedAdapterType() {
    return this.selectedAdapterType;
  }
  


  getPortfolioName() {
    return this.portfolioName;
  }

  getPortfolioDescription() {
    return this.portfolioDescription;
  }

  
  setSelectedAdapterType(selectedAdapterType) {
    this.selectedAdapterType = selectedAdapterType;
  }

  setPortfolioName(portfolioName) {
    this.portfolioName = portfolioName;
  }

  setPortfolioDescription(portfolioDescription) {
    this.portfolioDescription = portfolioDescription;
  }
}
