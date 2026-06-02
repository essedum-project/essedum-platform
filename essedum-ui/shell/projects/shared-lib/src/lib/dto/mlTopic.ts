export class MlTopic {
  datasetId: String;
  organization: String;
  topicName: String;
  adapterInstance: String;
  status: String;
  description: String;
  constructor(datasetId, organization, topicName, adapterInstance, status,description) {
    this.datasetId = datasetId;
    this.organization = organization;
    this.topicName = topicName;
    this.adapterInstance = adapterInstance;
    this.status = status;
    this.description=description
  }
}
