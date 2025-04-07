import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AdapterServices } from '../adapter/adapter-service';
import { Services } from '../services/service';
import { DatasetServices } from '../dataset/dataset-service';
import { LedsModalService } from 'leds-lib';

@Component({
  selector: 'app-annotate-config',
  templateUrl: './annotate-config.component.html',
  styleUrls: ['./annotate-config.component.scss']
})
export class AnnotateConfigComponent implements OnInit ,AfterViewChecked  {
  @Input() public data: any;
  organization = localStorage.getItem('organization')
  tagsList: Array<string> = ['OTHER'];
  tokenizer: string;
  tokenizers = []
  ocrMethods = []
  language: string
  OCRMethodList = [];
  ocrMethod: string
  LanguageList = [];
  process_as_pdf: boolean = false;
  sorting: boolean = false;
  processasImage: boolean = false;
  deleteExisting: boolean = false;
  showTagData: boolean = false;
  selectable: boolean = false;
  loadingPageForSpinner: boolean = false;
  listOfTags: any;
  OCRList = [
    {
      "displayName": "Online OCR",
      "key": "1",
      "value": "online"
    },
    {
      "displayName": "Azure OCR",
      "key": "2",
      "value": "azure"
    },
    {
      "displayName": "Tessaract OCR",
      "key": "3",
      "value": "tocr"
    }
  ]
  multi: boolean = false;
  TokenizerList: any = [];
  listOfTokenizer = [
    { name: "Space Tokenizer", value: "spaceTokenizer", desc: "Word tokenize by space. Available for all file types." },
    { name: "English Tokenizer", value: "englishTokenizer", desc: "Tokenize on English words using NLTK. Available for all file types." },
    { name: "Sentence Tokenizer", value: "sentenceTokenizer", desc: "Tokenize text based on sentences. Available for all file types." },
    { name: "Line Tokenizer", value: "lineTokenizer", desc: "Tokenize text in the document line wise. Available for PDFs and Images only." },
    { name: "Para Tokenizer", value: "paraTokenizer", desc: "Identify paragraphs and tokenize. Available for PDFs and Word docs only." },
    { name: "Table Tokenizer", value: "tableTokenizer", desc: "Pick only tables present in the document. Available for all file types." },
    { name: "Page Tokenizer", value: "pageTokenizer", desc: "Page wise split of text in a document. Available for PDFs, Word docs, XLS." },
    { name: "Doc Tokenizer", value: "docTokenizer", desc: "Send the complete text in the document as one entity. Available for all file types." }
  ]
  LanguagesList = [
    {
      "Language": "English",
      "languageCode": "eng",
      "trainedData": "eng.traineddata"
    },
    {
      "Language": "Castilian Spanish",
      "languageCode": "spa",
      "trainedData": "spa.traineddata"
    },
    {
      "Language": "Portuguese",
      "languageCode": "por",
      "trainedData": "por.traineddata"
    },
    {
      "Language": "French",
      "languageCode": "fra",
      "trainedData": "fra.traineddata"
    },
    {
      "Language": "Russian",
      "languageCode": "rus",
      "trainedData": "rus.traineddata"
    },
    {
      "Language": "German",
      "languageCode": "deu",
      "trainedData": "deu.traineddata"
    },
    {
      "Language": "Japanese",
      "languageCode": "jpn",
      "trainedData": "jpn.traineddata"
    },
    {
      "Language": "Korean",
      "languageCode": "kor",
      "trainedData": "kor.traineddata"
    },
    {
      "Language": "Chinese - Simplified",
      "languageCode": "chi_sim",
      "trainedData": "chi_sim.traineddata"
    },
    {
      "Language": "Chinese - Traditional",
      "languageCode": "chi_tra",
      "trainedData": "chi_tra.traineddata"
    }
  ]
  languages = []
  OCR_ID: any;
  dataset_details: any = [];
  OCR_data: any;

  constructor(private apiservice: AdapterServices,
    private Service: Services,
    private modalService: LedsModalService,
    private changeDetectorRef: ChangeDetectorRef,
    private datasetsService: DatasetServices)
     { }

     ngAfterViewChecked(): void {
      this.changeDetectorRef.detectChanges();
    }

  ngOnInit(): void {
    try{
      this.loadingPageForSpinner = true;
      if (this.data != undefined || this.data != "null") {
        this.datasetsService.getDatasetByNameAndOrg(this.data).subscribe((res) => {
          this.dataset_details = res;
          if (res != undefined || res.length != 0) {
            try {
              let k=[]
              this.apiservice.getOCRDetails(this.dataset_details.name).subscribe((resx) => {
                if(resx.length == 0){
                  k=resx
                }
                else{
                  k.push(resx)
                }
                
                if (resx != undefined && k.length > 0) {
                  
                  this.Service.message("Fetched Successfully", "success")
                  this.OCR_data = JSON.parse(resx.json_data);
                  this.OCR_ID = resx.datasetID;
                  if (this.OCR_data != undefined) {
                    this.tagsList = this.OCR_data.listOfTags;
                    this.ocrMethod = this.OCR_data.ocrMethod;
                    if (this.ocrMethod != undefined) {
                      this.ocrMethods.push(this.OCRList.filter(x => x.value == this.ocrMethod)[0].displayName)
                    }
                    this.tokenizer = this.OCR_data.tokenizer;
                    if (this.tokenizer != undefined) {
                      this.tokenizers.push(this.listOfTokenizer.filter(x => x.value == this.tokenizer)[0].name)
                    }
                    this.language = this.OCR_data.language;
                    if (this.language != undefined) {
                      this.languages.push(this.LanguagesList.filter(x => x.languageCode == this.language)[0].Language)
                    }
                    this.processasImage = this.OCR_data.processAsImage;
                    this.process_as_pdf = this.OCR_data.processAsPDF;
                    this.deleteExisting = this.OCR_data.deleteExisting;
  
                  }
                  for (var i of this.listOfTokenizer) {
                    let val = { viewValue: i.name, value: i.value };
                    this.TokenizerList.push(val)
                  }
                  for (var t of this.LanguagesList) {
                    let val = { viewValue: t.Language, value: t.languageCode };
                    this.LanguageList.push(val)
                  }
              
                  for (var h of this.OCRList) {
                    let val = { viewValue: h.displayName, value: h.value };
                    this.OCRMethodList.push(val)
                  }
                  
                }
                this.loadingPageForSpinner = false;
              })
            } catch (Exception) {
              this.Service.message("No OCR data found", "error");
              this.loadingPageForSpinner = false;
            }
          }
        })
    }
    }
    catch(Exception){
      this.loadingPageForSpinner = false;
      this.Service.message("No Dataset found", "error");
    }
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  selectToken($event) {
    this.tokenizer = $event;
  }

  selectOCRChange($event) {
    this.ocrMethod = $event;
  }

  selectChanges($event) {
    this.language = $event;
  }

  add(event): void {
    let value = event.target.value;
    if ((value || '').trim()) {
      this.tagsList.push(value.trim());
      event.target.value = ""
    }
  }

  remove(tag: any): void {
    let index = this.tagsList.indexOf(tag);

    if (index >= 0) {
      this.tagsList.splice(index, 1);
    }
  }

  onChange(event, sorting?, processasImage?, process_as_pdf?, deleteExisting?) {
    if (sorting == true) {
      if (event.checked == true)
        this.sorting = true;
      else
        this.sorting = false;
    }
    else if (processasImage == true) {
      if (event.checked == true)
        this.processasImage = true;
      else
        this.processasImage = false;
    }
    else if (process_as_pdf == true) {
      if (event.checked == true)
        this.process_as_pdf = true;
      else
        this.process_as_pdf = false;
    }
    else if (deleteExisting == true) {
      if (event.checked == true)
        this.deleteExisting = true;
      else
        this.deleteExisting = false;
    }
  }

  createContentMiningDataset() {
    this.loadingPageForSpinner = true;
    var data = {
      "Organization": this.organization,
      "datasetName": this.dataset_details.alias,
      "datasetID": this.dataset_details.name,
      "datasetDescription": this.dataset_details.description,
      "datasetConfiguration":
      {
        "tokenizer": this.tokenizer,
        "listOfTags": this.tagsList,
        "listOfGroups": [],
        "is_sorting": false,
        "ocrMethod": this.ocrMethod,
        "language": this.language,
        "processAsImage": this.processasImage,
        "processAsPDF": this.process_as_pdf,
        "deleteExisting": this.deleteExisting
      },
    }
    if (this.OCR_ID == undefined) {
      this.apiservice.CreateOCREntity(data).subscribe((res) => {
        if (res.message == "Entity Created Successfully") {
          this.Service.message("Entity Created Successfully", "success")
          this.TokenizeFile();
        }
        else {
          this.Service.message("Entity Creation Failed", "error")
          this.loadingPageForSpinner = false;
          this.closeModal();
        }
      })
    }
    else {
      this.apiservice.EditOCREntity(data).subscribe((res) => {
        if (res.message == "Entity Edited Successfully") {
          this.Service.message("Entity Edited Successfully", "success")
          this.TokenizeFile();
        }
        else {
          this.Service.message("Failed to Edit Entity", "error")
          this.loadingPageForSpinner = false;
          this.closeModal();
        }
      })
    }
    
  }
  
  TokenizeFile() {
    var datas = {
      "Organization": this.organization,
      "datasetID": this.dataset_details.name
    }
    this.apiservice.TokenizeFile(datas).subscribe((resp) => {
      if(resp.response == "File uploaded"){
        this.Service.message("Tokenization Complete", "success")
        this.loadingPageForSpinner = false;
        this.closeModal();
        }
      else{
        this.Service.message("Tokenization Failed", "error")
        this.loadingPageForSpinner = false;
        this.closeModal();
      }
    })
  }

}
