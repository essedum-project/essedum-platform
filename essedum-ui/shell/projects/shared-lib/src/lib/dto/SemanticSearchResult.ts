import { SemanticSearchContext } from "./SemanticSearchContext";

export class SemanticSearchResult {
  index: String;
  semanticSearchContextReferencesList: SemanticSearchContext[];
  summary: String;
  figure: any;
  tickets: any;
  dataset_id: String;
  dataset_type: String;
  organization: String;
  constructor() {
  }
}
