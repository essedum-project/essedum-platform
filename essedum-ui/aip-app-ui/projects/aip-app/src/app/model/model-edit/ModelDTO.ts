export class ModelDTO {
  id: number = 0;
  fedId: String = '';
  adapterId: String = '';
  appName: String = '';
  fedName: String = '';
  status: String = '';
  artifacts: String = '';
  container: String = '';
  appDescription: String = '';
  fedDescription: String = '';
  version: String = '';
  createdOn: Date = new Date();
  createdBy: String = '';
  syncDate: Date = new Date();
  appModifiedDate: Date = new Date();
  fedModifiedDate: Date = new Date();
  fedModifiedBy: String = '';
  appModifiedBy: String = '';
  appOrg: String = '';
  fedOr: String = '';
}
