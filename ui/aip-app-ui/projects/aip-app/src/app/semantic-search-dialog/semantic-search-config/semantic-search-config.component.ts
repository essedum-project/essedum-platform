import { Component, OnInit } from '@angular/core';
import { SemanticService } from '../../services/semantic.services';

@Component({
  selector: 'app-semantic-search-config',
  templateUrl: './semantic-search-config.component.html',
  styleUrls: ['./semantic-search-config.component.scss']
})
export class SemanticSearchConfigComponent implements OnInit {

  semantic = ['Ingest', 'Infer']
  ingestData = {
    "dataset_id": "",
    "organization": "",
    "config": {
      "DatasetExtractorConfig": { "local_path": "/RAG_data/DEMCRDTC94193" },
      "DatasetChunkerConfig": { "chunk_size": 1000, "chunk_overlap": 50 },
      "EmbeddingFunctionsConfig": { "embedding_type": "HuggingFace" },
      "VectorStoreConfig": { "DB_Type": "Faiss", "index": "" }
    }
  }
  inferData = {
    "config": {
      "VectorStoreConfig": {
        "query": "",
        "DB_Type": "Faiss",
        "index": ""
      },
      "LLMConfig": {
        "query": ""
      },
      "EmbeddingConfig": {
      }
    }
  }
  payload = []
  basicReqTab: string = 'headersTab';
  selected: boolean = false;
  j: number = 0;
  toggle: string = 'Infer';
  requestMethods = [
    { viewValue: 'GET', value: 'GET' },
    { viewValue: 'POST', value: 'POST' },
    { viewValue: 'PUT', value: 'PUT' },
    { viewValue: 'DELETE', value: 'DELETE' }];
  attributes = { RequestType: '', RequestUrl: '' }
  dynamicHeadersArray: Array<DynamicParamsGrid> = [];
  headersDynamic: any = {};
  data: any;

  constructor(
    private semanticService: SemanticService,
  ) { } 

  ngOnInit(): void {
    this.semanticService.getConfigByName(this.semantic[0]).subscribe( (res) => {
      this.data = res;
      console.log(this.data);
    });
      
    this.payload.push(this.ingestData);
    this.payload.push(this.inferData);
  }

  select() {
    this.selected = !this.selected;
    this.j = this.selected ? 1 : 0;
    this.toggle = this.selected ? this.semantic[0] : this.semantic[1];
  }

  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = 'headersTab';
        break;
      case 1:
        this.basicReqTab = 'viewTab';
        break;
      case 2:
        this.basicReqTab = 'editTab';
        break;
    }
  }

  addHeadersRow() {
    if (this.dynamicHeadersArray.length == 0) {
      this.dynamicHeadersArray = [];
    }
    this.headersDynamic = { key: "", value: "" };
    this.dynamicHeadersArray.push(this.headersDynamic);
    return true;
  }

  deleteHeadersRow(index) {
    this.dynamicHeadersArray.splice(index, 1);
    return true;
  }

}

export class DynamicParamsGrid {
  key: string;
  value: string;
}
