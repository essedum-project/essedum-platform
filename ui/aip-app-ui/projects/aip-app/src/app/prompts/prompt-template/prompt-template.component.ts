import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { HighlightPipe } from '../highlight.pipe';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
@Component({
  selector: 'app-prompt-template',
  templateUrl: './prompt-template.component.html',
  styleUrls: ['./prompt-template.component.scss']
})
export class PromptTemplateComponent{
  @Input() id: string;
  @Input() value: string;
  @Input() exist_value: string;
  @Input() text: string;
  @Input() exist_text: string;
  @Input() isEdit: boolean = true;
  @Input() removeTemplate: (id: string) => void;
  @Input() autoAddInput: (input_label: any[], id:string) => void;
  @ViewChild('texttocopy') textToCopy: ElementRef;
  pi: boolean = false;
  dummy_text: string = 'Write your message here...';
  
  constructor(private highlightPipe: HighlightPipe) { }

  setTempAgent(type, divId) {
    console.log(type);
    document.getElementById(divId + '-value').innerText = type;
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
      }, 500);

    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }

  onInput(event: Event): void {
    const div = event.target as HTMLDivElement;
    const text = div.innerText;
    const element = document.getElementById(div.id);
    const caretPosition = this.getCaretPosition(element);
    const transformedText = this.highlightPipe.transform(text);
    element.innerHTML = transformedText;
    this.setCaretPosition(element, caretPosition);
    this.getInputLabels(text);
  }

  setCaretPosition(element: HTMLElement, offset: number) {
    const range = document.createRange();
    const selection = window.getSelection();

    let currentNode = element.firstChild;
    let currentOffset = 0;

    // Traverse the text nodes to find the correct position
    while (currentNode && currentOffset + (currentNode.textContent?.length || 0) < offset) {
      currentOffset += currentNode.textContent?.length || 0;
      currentNode = currentNode.nextSibling;
    }

    // Calculate the offset within the found node
    const nodeOffset = offset - currentOffset;

    if (currentNode) {
      if (currentNode.textContent[currentNode.textContent.length - 1] === '}' && currentNode.textContent[currentNode.textContent.length - 2] === '}') {
        if (currentNode.childNodes.length > 0) {
          let lastChild = currentNode.childNodes[currentNode.childNodes.length - 1];

          // Traverse to the last text node if the last child is not a text node
          while (lastChild && lastChild.nodeType !== Node.TEXT_NODE) {
            lastChild = lastChild.lastChild;
          }

          if (lastChild && lastChild.nodeType === Node.TEXT_NODE) {
            const lastChildLength = lastChild.textContent ? lastChild.textContent.length : 0;
            range.setStart(lastChild, lastChildLength - 2); // Set the caret position before the last character
          }
        }
      } else {
        range.setStart(currentNode, nodeOffset);
      }
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

  }
  getCaretPosition(element: HTMLElement): number {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    return preCaretRange.toString().length;
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default behavior of the Enter key

      const range = document.getSelection()?.getRangeAt(0);
      if (range) {
        // Create a new line break element
        const br = document.createElement('br');

        // Insert the line break at the current caret position
        range.deleteContents();
        range.insertNode(br);
       
        // Move the caret to the start of the new line
        range.setStartAfter(br);

        range.collapse(true);

        // Update the selection
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }

  getInputLabels(content: string): void {
    const pattern = /\{\{(.*?)\}\}/g;
    let match;
    const matches = [];

    while ((match = pattern.exec(content)) !== null) {
      matches.push(match[1]);
    }
    this.autoAddInput(matches, this.id);
    // matches.forEach((match) => {
    //   this.autoAddInput(match);
    // });
  }

  clearText(): void {
    this.dummy_text = '\n';
  }
}
