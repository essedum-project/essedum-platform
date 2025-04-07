import { Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-output-schema',
  templateUrl: './output-schema.component.html',
  styleUrls: ['./output-schema.component.scss']
})
export class OutputSchemaComponent {
  @Input() id: string;
  @Input() value: string;
  @Input() text: string;
  @Input() removeTemplate: (id:string) => void;
  @ViewChild('texttocopy') textToCopy: ElementRef;
  pi: boolean = false;
  
  setTempAgent(type, divId) {
    console.log(type);
    document.getElementById(divId + '-value').innerText = type;
  }
  onContentChange($event) {
    console.log($event);
  }

  callRemoveTemplate() {
    if (this.removeTemplate) {
      this.removeTemplate(this.id);
    }
  }

  copyText() {
    const text = this.textToCopy.nativeElement.innerText;
    navigator.clipboard.writeText(text).then(() => {
      console.log('Text copied to clipboard:', text);
      this.pi = true;
      setTimeout(() => {
        this.pi = false;
      },500);
      
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }
}

