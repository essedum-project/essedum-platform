export class TagEventDTO {
  selectedTagList: any[];
  selectedAdapterType: string[] = [];
  selectedAdapterInstance: string[] = [];
  selectedMlAdapterConnectionType: string[] = [];
  selectedMlAdapterCategoryType: string[] = [];
  selectedMlAdapterSpecType: string[] = [];
  selectedMlSpecTemplateCapabilityType: string[] = [];
  selectedMlInstanceAdapterType: string[] = [];
  selectedMlInstanceConnectionType: string[] = [];
  selectedDatasetTopicType: string[] = [];
  // Portfolio specific fields
  portfolioName: string[] = [];
  portfolioDescription: string[] = [];

  constructor(
    selectedTagList,
    selectedAdapterType,
    selectedAdapterInstance,
    selectedMlAdapterConnectionType,
    selectedMlAdapterCategoryType,
    selectedMlAdapterSpecType,
    selectedMlSpecTemplateCapabilityType,
    selectedMlInstanceAdapterType,
    selectedMlInstanceConnectionType,
    selectedDatasetTopicType,
    portfolioName = [],
    portfolioDescription = []
  ) {
    this.selectedAdapterInstance = selectedAdapterInstance;
    this.selectedAdapterType = selectedAdapterType;
    this.selectedTagList = selectedTagList;
    this.selectedMlAdapterConnectionType = selectedMlAdapterConnectionType;
    this.selectedMlAdapterCategoryType = selectedMlAdapterCategoryType;
    this.selectedMlAdapterSpecType = selectedMlAdapterSpecType;
    this.selectedMlSpecTemplateCapabilityType =
      selectedMlSpecTemplateCapabilityType;
    this.selectedMlInstanceAdapterType = selectedMlInstanceAdapterType;
    this.selectedMlInstanceConnectionType = selectedMlInstanceConnectionType;
    this.selectedDatasetTopicType = selectedDatasetTopicType;    this.portfolioName = portfolioName;
    this.portfolioDescription = portfolioDescription;
  }

  getSelectedTagList() {
    return this.selectedTagList;
  }
  
  getSelectedAdapterType() {
    return this.selectedAdapterType;
  }
  
  getSelectedAdapterInstance() {
    return this.selectedAdapterInstance;
  }
  
  getSelectedMlAdapterConnectionType() {
    return this.selectedMlAdapterConnectionType;
  }
  
  getSelectedMlAdapterCategoryType() {
    return this.selectedMlAdapterCategoryType;
  }
  
  getSelectedMlAdapterSpecType() {
    return this.selectedMlAdapterSpecType;
  }
  
  getSelectedMlSpecTemplateCapabilityType() {
    return this.selectedMlSpecTemplateCapabilityType;
  }
  
  getSelectedMlInstanceAdapterType() {
    return this.selectedMlInstanceAdapterType;
  }
  
  getSelectedMlInstanceConnectionType() {
    return this.selectedMlInstanceConnectionType;
  }
    getSelectedDatasetTopicType() {
    return this.selectedDatasetTopicType;
  }

  getPortfolioName() {
    return this.portfolioName;
  }

  getPortfolioDescription() {
    return this.portfolioDescription;
  }
  
  setSelectedTagList(selectedTagList) {
    this.selectedTagList = selectedTagList;
  }
  
  setSelectedAdapterType(selectedAdapterType) {
    this.selectedAdapterType = selectedAdapterType;
  }
  
  setSelectedAdapterInstance(selectedAdapterInstance) {
    this.selectedAdapterInstance = selectedAdapterInstance;
  }
  
  setSelectedMlAdapterConnectionType(selectedMlAdapterConnectionType) {
    this.selectedMlAdapterConnectionType = selectedMlAdapterConnectionType;
  }
  
  setSelectedMlAdapterCategoryType(selectedMlAdapterCategoryType) {
    this.selectedMlAdapterCategoryType = selectedMlAdapterCategoryType;
  }
  
  setSelectedMlAdapterSpecType(selectedMlAdapterSpecType) {
    this.selectedMlAdapterSpecType = selectedMlAdapterSpecType;
  }
    setSelectedMlSpecTemplateCapabilityType(
    selectedMlSpecTemplateCapabilityType
  ) {
    this.selectedMlSpecTemplateCapabilityType =
      selectedMlSpecTemplateCapabilityType;
  }
    setSelectedMlInstanceAdapterType(selectedMlInstanceAdapterType) {
    this.selectedMlInstanceAdapterType = selectedMlInstanceAdapterType;
  }
  
  setSelectedMlInstanceConnectionType(selectedMlInstanceConnectionType) {
    this.selectedMlInstanceConnectionType = selectedMlInstanceConnectionType;
  }
  
  setSelectedDatasetTopicType(selectedDatasetTopicType) {
    this.selectedDatasetTopicType = selectedDatasetTopicType;
  }

  setPortfolioName(portfolioName) {
    this.portfolioName = portfolioName;
  }

  setPortfolioDescription(portfolioDescription) {
    this.portfolioDescription = portfolioDescription;
  }
}
