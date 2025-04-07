import { Component, OnInit } from "@angular/core";
import { DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { chatBotUrl } from '../../assets/js/chatBot';

@Component({
  selector: "chat-bot",
  templateUrl: "./chat-bot.component.html",
  styleUrls: ["./chat-bot.component.css"],
})
export class ChatBotComponent implements OnInit {
  urlObj: any = {};
  url: any = chatBotUrl;

  constructor(private sanitizer: DomSanitizer, public activeModal: NgbActiveModal) { }

  ngOnInit() {
    console.log("printing chatbot url..", chatBotUrl)
    this.urlObj.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    console.log(this.urlObj.safeUrl)
  }
  closeChat() {
    this.activeModal.close();
  }
}
