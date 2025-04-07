import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges } from '@angular/core';
import { ChatbotServices } from './chatbot.service';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
@Component({
  selector: 'app-chatbot-aip',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})

export class ChatbotComponentAIP implements OnInit, OnChanges {
  @Input() instance;
  @Input() title;
  @Input() sessionId;
  @Input() chatExtras;
  @Output() closeHistory = new EventEmitter<boolean>();
  hide : boolean = false;

  userChatTime;
  chatPostObj = {
    chat_id: '',
    chat_user_query: '',
    chat_user_id: '',
  }
  options: any = [
    {
      "viewValue": "Authenticate",
      "value": "Authenticate"
    }
  ];
  defaultSelected = this.options[0].viewValue;
  showSettingDropdown: boolean = false;
  chatHistoryArray = [];
  feedbackText = '';
  feedbackObj = {
    'rating': null,
    'chat_id': '',
    'feedback': '',
    'chat_user_id': ''
  }
  successText = '';
  userId = '';
  introBotObj = {
    'chat_bot_id': '',
    'chat_user_id': ''
  }
  introBotTime;
  chatIntroArr = [];
  count = 0;
  showSpinner: boolean = false
  resval: any;
  formResult: any;
  suggest: boolean = false;
  preData: any = {};
  currentChatData: any[];
  showHistory: boolean = false;
  formAlias: any;
  array: number[] = [];
  headerLogoImage: any;
  footerLogoImage: any;
  isFooterDetails: boolean = false;
  footerLogo: string = '';
  footerText: string = '';

  constructor(
    public dialog: MatDialog,
    private chatbotServ: ChatbotServices,
    private _renderer2: Renderer2,
    private sanitizer: DomSanitizer,
    private router: Router,
    private changeDetectionRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    let date = new Date();
    this.introBotTime = this.formateTimeDisplay(date);

    this.userId = JSON.parse(sessionStorage.getItem("user")).id;
    this.chatPostObj.chat_id = this.sessionId;
    this.feedbackObj.chat_id = this.sessionId;
    this.chatPostObj.chat_user_id = this.userId;
    this.feedbackObj.chat_user_id = this.userId;
    this.introBotObj.chat_user_id = this.userId;
    this.introBotObj.chat_bot_id = null;

    this.updateChatExtras();
  }

  updateChatExtras() {
    if(this.chatExtras && this.chatExtras['footerLogo']) {
      this.isFooterDetails = true;
      this.footerLogo = this.chatExtras['footerLogo'];
    }
    if(this.chatExtras && this.chatExtras['footerText']) {
      this.isFooterDetails = true;
      this.footerText = this.chatExtras['footerText'];
    }
  }

  formateTimeDisplay(date) {
    let formattedDate;
    let hours = date.getHours();
    let minutes: any = date.getMinutes();
    let newformat = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    formattedDate = hours + ':' + minutes + ' ' + newformat;
    return formattedDate;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.['sessionId']?.previousValue != changes?.['sessionId']?.currentValue ||
      changes?.['instance']?.previousValue != changes?.['instance']?.currentValue) {
        this.hide = true;
      if (this.sessionId?.includes('new')) {
        this.sessionId = this.createSessionId();
        changes['sessionId'].currentValue = this.sessionId;
        let chatObj = sessionStorage.getItem("chatId") ? JSON.parse(sessionStorage.getItem("chatId")) : {};
        chatObj[this.instance] = this.sessionId;
        sessionStorage.setItem("chatId", JSON.stringify(chatObj));
        this.introBotObj.chat_user_id = this.userId;
        this.chatPostObj.chat_id = this.sessionId;
        this.getChatIntro(this.introBotObj);
      }
      else if (this.sessionId != 'current') {
        this.fetchSessionChat();
      }
    }
  }

  ngDoCheck() {
    if (this.sessionId == 'current' && document.getElementById('chatDiv')?.childNodes.length == 0) {
      this.fetchCurrentChat();
    }
  }

  createSessionId() {
    const { v4: uuidv4 } = require('uuid');
    return uuidv4();
  }

  // to get chat Intro
  getChatIntro(introBotObj) {
    if (this.chatHistoryArray.length > 0) {
      document.getElementById('chatDiv').replaceChildren();
      this.chatHistoryArray = [];
    }
    try {
      this.chatbotServ.getBotIntro(introBotObj, this.instance).subscribe((res) => {
        this.chatIntroArr = [];
        let IntroObj = { "Intro": res }
        res['chat_time'] = this.introBotTime;
        document.getElementById('chatDiv').replaceChildren();
        this.chatHistoryArray.push(IntroObj);
        sessionStorage.setItem("currentChatData", JSON.stringify(this.chatHistoryArray));
        this.createHistoryHtml(IntroObj);
      }, err => {
        // this.sampleChatbot()
      });
    } catch (ex) {
      // this.sampleChatbot()
    }
  }

  // to get current chat from session storage
  fetchCurrentChat() {
    let current = sessionStorage.getItem("currentChatData");
    let mashName = sessionStorage.getItem("agent");
    this.chatbotServ.getMashupByName(mashName).subscribe((res) => {
      this.chatExtras = JSON.parse(res?.template).chatExtras;
      this.updateChatExtras();
    });
    if (current != null) {
      this.currentChatData = JSON.parse(sessionStorage.getItem("currentChatData"));
      this.chatHistoryArray = this.currentChatData;
      this.currentChatData.forEach((element) => {
        this.createHistoryHtml(element)
        // this.showHistory
      });
      this.sessionId = JSON.parse(sessionStorage.getItem("chatId"))[this.instance];
    }
    else {
      this.getChatIntro(this.introBotObj);
    }
  }

  updateArray() {
    this.array = Array.from({ length: this.count }, (_, i) => i);
  }

  // to get chat from history sessionId 
  fetchSessionChat() {
    this.chatHistoryArray = [];
    this.chatbotServ.getUsersession(this.sessionId, this.userId, this.instance).subscribe((resp) => {
      if (resp.length > 0) {
        document.getElementById('chatDiv').replaceChildren();
        this.count = 0;
        this.chatHistoryArray = resp;
        this.chatHistoryArray.forEach((ele) => {
          this.createHistoryHtml(ele);
        })
      }
      else {
        this.getChatIntro(this.introBotObj);
      }
    }, err => {
      this.getChatIntro(this.introBotObj);
    });
  }

  // chat with chatbot
  enterPress(e) {
    if (e.code === "Enter") {
      //checks whether the pressed key is "Enter"
      let input = document.getElementsByClassName('le-c-chatbot__input').item(0).children[0] as HTMLInputElement;
      if (input.value.trim() != '')
        this.sendInput(input.value);
    }
  }

  sendInput(ev, hide?) {
    this.closeHistory.emit(true);
    this.chatPostObj.chat_user_query = ev;
    ev = hide ? this.formAlias : ev;
    let date = new Date();

    let hours = date.getHours();
    let minutes: any = date.getMinutes();

    // Check whether AM or PM
    let newformat = hours >= 12 ? 'PM' : 'AM';

    // Find current hour in AM-PM Format
    hours = hours % 12;

    // To display "0" as "12"
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    this.userChatTime = hours + ':' + minutes + ' ' + newformat;

    let div = document.createElement('div');
    let chatEle = `
    <leds-chatbot-user-message>
      <p class="clearboth le-c-chatbot__rightbubble le-u-mar-l-16 le-u-mar-b-8 clearfix" style="max-width:100%; word-wrap: break-word;">
        <span class="d-block le-u-text-black"> ##userChat## </span>
        <span class="d-inline-block float-end le-u-mar-l-8 le-u-body-xs le-u-mar-t-4 le-u-text-neutral-60">
          <span ledschatbotusermessagetime="">##userChatTime##</span>
        </span>
      </p>
    </leds-chatbot-user-message>
    `.replace('##userChat##', ev).replace('##userChatTime##', this.userChatTime);
    // div.innerHTML = chatEle;
    let safeChatEle = this.sanitizer.bypassSecurityTrustHtml(chatEle);
    div.innerHTML = safeChatEle ? safeChatEle['changingThisBreaksApplicationSecurity'].toString() : '';
    div.style.marginTop = '10px';
    div.id = 'user' + this.count;
    document.getElementById('chatDiv').appendChild(div);
    document.getElementById('user' + this.count).scrollIntoView();
    let ele = document.getElementsByClassName('le-c-chatbot__input').item(0).children[0] as HTMLInputElement;
    ele.value = '';
    this.showSpinner = true
    let userKey = "user" + this.count
    let value = {
      "chat_time": this.userChatTime,
      "chat_user_id": this.userId,
      "chat_user_query": ev
    }
    let userObj = {}
    userObj[userKey] = value;
    this.chatHistoryArray.push(userObj);
    sessionStorage.setItem("currentChatData", JSON.stringify(this.chatHistoryArray));
    try {
      this.instance = Object.keys(JSON.parse(sessionStorage.getItem('lastChat')))[0]
      this.chatPostObj.chat_id = this.sessionId;
      this.chatbotServ.sendChat(this.chatPostObj, this.instance).subscribe((res) => {
        this.hide = true;
        let lastChat = {}
        lastChat[this.instance] = this.title;
        sessionStorage.setItem("lastChat", JSON.stringify(lastChat));
        let key = "bot" + this.count;
        let currentBotChat = {};
        currentBotChat[key] = res;
        res['chat_time'] = this.formateTimeDisplay(date);
        this.chatHistoryArray.push(currentBotChat);
        sessionStorage.setItem("currentChatData", JSON.stringify(this.chatHistoryArray));
        if (res['navigateUrl'] && res['navigateUrl'].length > 0) {
          this.router.navigateByUrl([res["navigateUrl"]].toString());
        }
        this.showSpinner = false
        this.count += 1;
        this.updateArray();
        res["type"] = res["type"] ? res["type"] : "Text";
        let resp: any = res;

        this.chatPostObj.chat_id = resp.chat_id;
        this.feedbackObj.chat_id = resp.chat_id;
        let responseMinutes = minutes + Math.floor((resp.chat_response_time / (1000 * 60)) % 60);
        let botResponseTime = hours + ':' + responseMinutes + ' ' + newformat;
        this.createHtml(resp, botResponseTime);

      }, err => {
        this.showSpinner = false
      });
    } catch (ex) {
      this.showSpinner = false
    }
  }

  // create chat ui as per response
  createHistoryHtml(chat) {
    let div = document.createElement('div');
    let key = Object.keys(chat)[0];
    if (key.toString().includes('Intro')) {
      let suggestArray = [];
      for (let i of chat[key].chat_suggestions) {
        let header = Object.keys(i);
        header.forEach((key, index) => {
          suggestArray.push({
            'key': key,
            'value': i[key]
          })
        });
      }
      let suggestStr = '';
      let sugCount = 0;
      for (let suggest of suggestArray) {
        for (let i of suggest.value) {
          sugCount++;
          suggestStr += `<mat-chip role="option"
            class="mat-chip mat-focus-indicator le-u-mar-t-8 h-auto DSA_wb_chipStyle-Normal DSA_choiseChip le-u-mar-r-8 mat-primary mat-standard-chip"
            tabindex="-1" aria-disabled="false" (click)="selectChange($event)">
            <div class="mat-chip-ripple"></div>
            <div class="le-u-pad-tb-4 le-u-pad-lr-8 d-flex" style="
              background: #e0e0e0;
              border-radius: 10px;">
                <em aria-hidden="true"
                    class="icon x-16 icon-color success-big-icon ng-star-inserted"></em>
                <div class="le-u-mar-l-8 DSA_wb_mainBodyTxt2 le-u-mar-t-4" style="font-size: 12px;cursor: pointer;" id="##selectId##" value="##option##">
                    ##option##
                </div>
            </div>
            </mat-chip>`.replace('##option##', i).replace('##option##', i).replace('##option##', i)
            .replace('##selectId##', 'matSuggest' + sugCount);
        }
        let chatEle = `
          <leds-chatbot-message ng-reflect-chatbot-image="true">
            <p class="clearboth le-u-mar-r-8 le-u-mar-b-8">
              <img src="assets/images/chatbot-small.png" alt="Chatbot" class="ng-star-inserted">
              <span class="d-inline-block le-u-body-xs le-u-text-neutral-60 le-u-mar-l-8">
                <span ledschatbotmessagetime="">##botResponseTime##</span>
              </span>
              <span class="d-block le-u-mar-t-8 le-u-text-neutral-90" style="white-space: pre-line;">##botResponse##</span>
              <div class="le-u-mar-tb-4">
                  <mat-chip-list 
                    class="mat-chip-list d-flex flex-wrap le-u-pad-l-4" tabindex="0"
                    aria-required="false" aria-disabled="false" aria-invalid="false" aria-multiselectable="false"
                    role="listbox" aria-orientation="horizontal">
                    <div class="mat-chip-list-wrapper d-flex flex-wrap">
                    ##options##
                    </div>
                  </mat-chip-list>
              </div>
            </p>
          </leds-chatbot-message>
          `.replace('##botResponse##', chat[key].chat_system_intro)
          .replace('##options##', suggestStr)
          .replace('##botResponseTime##', chat[key].chat_time)
        let safeChatEle = this.sanitizer.bypassSecurityTrustHtml(chatEle);
        div.innerHTML = safeChatEle ? safeChatEle['changingThisBreaksApplicationSecurity'].toString() : '';
        div.id = key;
        document.getElementById('chatDiv').appendChild(div);
        document.getElementById(key).scrollIntoView();
        for (let i = 1; i <= sugCount; i++) {
          this._renderer2.listen(document.getElementById('matSuggest' + i), 'click', (event) => {
            let val = event.target.innerText;
            this.chatPostObj.chat_user_query = val;
            this.sendInput(val);
          });
        }
      }
    }
    else if (key.toString().includes('user')) {
      this.count += 1;
      this.updateArray();
      let chatEle = `
    <leds-chatbot-user-message>
      <p class="clearboth le-c-chatbot__rightbubble le-u-mar-l-16 le-u-mar-b-8 clearfix" style="max-width:100%; word-wrap: break-word;">
        <span class="d-block le-u-text-black"> ##userChat## </span>
        <span class="d-inline-block float-end le-u-mar-l-8 le-u-body-xs le-u-mar-t-4 le-u-text-neutral-60">
          <span ledschatbotusermessagetime="">##userChatTime##</span>
        </span>
      </p>
    </leds-chatbot-user-message>
    `.replace('##userChat##', chat[key].chat_user_query).replace('##userChatTime##', chat[key].chat_time);
      let safeChatEle = this.sanitizer.bypassSecurityTrustHtml(chatEle);
      div.innerHTML = safeChatEle ? safeChatEle['changingThisBreaksApplicationSecurity'].toString() : '';
      div.id = key;
      document.getElementById('chatDiv').appendChild(div);
      document.getElementById(key).scrollIntoView();
    }
    else if (key.toString().includes('bot')) {
      this.createHtml(chat[key], chat[key].chat_time, key);
    }
  }

  createHtml(chatres, chatTime, divKey?) {
    let divId = divKey ? divKey : 'bot' + this.count;
    let chatEle = '';
    let div = document.createElement('div');
    if (chatres.type == "Options") {
      let options = chatres.chat_options;
      let optionsStr = '';
      for (let i of options) {
        optionsStr += `<mat-chip role="option"
        class="mat-chip mat-focus-indicator le-u-mar-t-8 h-auto DSA_wb_chipStyle-Normal DSA_choiseChip le-u-mar-r-8 mat-primary mat-standard-chip"
        tabindex="-1" aria-disabled="false" (click)="selectChange($event)">
        <div class="mat-chip-ripple"></div>
        <div class="le-u-pad-tb-4 le-u-pad-lr-8 d-flex" style="
          background: #e0e0e0;
          border-radius: 10px;">
            <em aria-hidden="true"
                class="icon x-16 icon-color success-big-icon ng-star-inserted"></em>
            <div class="le-u-mar-l-8 DSA_wb_mainBodyTxt2 le-u-mar-t-4" style="font-size: 12px;" id="##selectId##" value="##option##">
                ##option##
            </div>
        </div>
    </mat-chip>`.replace('##option##', i).replace('##option##', i).replace('##option##', i);
      }
      chatEle = `
      <leds-chatbot-message ng-reflect-chatbot-image="true">
        <p class="clearboth le-u-mar-r-8 le-u-mar-b-8">
          <img src="assets/images/chatbot-small.png" alt="Chatbot" class="ng-star-inserted">
          <span class="d-inline-block le-u-body-xs le-u-text-neutral-60 le-u-mar-l-8">
            <span ledschatbotmessagetime="">##botResponseTime##</span>
          </span>
          <span class="d-block le-u-mar-t-8 le-u-text-neutral-90" style="white-space: pre-line;">##botResponse##</span>
          <div class="le-u-mar-tb-4">
                <mat-chip-list 
                    class="mat-chip-list d-flex flex-wrap le-u-pad-l-4" tabindex="0"
                    aria-required="false" aria-disabled="false" aria-invalid="false" aria-multiselectable="false"
                    role="listbox" aria-orientation="horizontal">
                    <div class="mat-chip-list-wrapper d-flex flex-wrap">
                    ##options##
                    </div>
                </mat-chip-list>
          </div>
        </p>
      </leds-chatbot-message>
      `.replace('##botResponse##', chatres.chat_system_response).replace('##botResponseTime##', chatTime).replace('##options##', optionsStr).replace('##selectId##', 'mat-chip' + this.count);
      // div.innerHTML = chatEle;
      let safeChatEle = this.sanitizer.bypassSecurityTrustHtml(chatEle);
      div.innerHTML = safeChatEle ? safeChatEle['changingThisBreaksApplicationSecurity'].toString() : '';
      div.id = divId;
      document.getElementById('chatDiv').appendChild(div);
      document.getElementById(divId).scrollIntoView();
      this._renderer2.listen(document.getElementById('mat-chip' + this.count), 'click', (event) => {
        let val = event.target.innerText;
        this.chatPostObj.chat_user_query = val;
        this.sendInput(val);
      });
    }
    else if (chatres.type == "Url") {
      let urlStr = chatres["url"];
      chatEle = `
      <leds-chatbot-message ng-reflect-chatbot-image="true">
        <p class="clearboth le-u-mar-r-8 le-u-mar-b-8">
          <img src="assets/images/chatbot-small.png" alt="Chatbot" class="ng-star-inserted">
          <span class="d-inline-block le-u-body-xs le-u-text-neutral-60 le-u-mar-l-8">
            <span ledschatbotmessagetime="">##botResponseTime##</span>
          </span>
          <span class="d-block le-u-mar-t-8 le-u-text-neutral-90" style="white-space: pre-line;">##botResponse##</span>
          <div class="le-u-mar-tb-4">
          <a href="##url##">##url##</a>
         </div>
        </p>
      </leds-chatbot-message>
      `.replace('##botResponse##', chatres.chat_system_response).replace('##botResponseTime##', chatTime).replace('##url##', urlStr.toString()).replace('##url##', urlStr.toString());
      // div.innerHTML = chatEle;
      let safeChatEle = this.sanitizer.bypassSecurityTrustHtml(chatEle);
      div.innerHTML = safeChatEle ? safeChatEle['changingThisBreaksApplicationSecurity'].toString() : '';
      div.id = divId
      document.getElementById('chatDiv').appendChild(div);
      document.getElementById(divId).scrollIntoView();
    }
    else if (chatres.type == "Form") {
      this.hide = false;
      this.changeDetectionRef.detectChanges();
      if(chatres["formAlias"] == undefined) {
      this.chatbotServ.getFormtemplateByName(chatres["chat_formName"]).subscribe(result => {
        this.formAlias = result["alias"];
        this.resval = JSON.parse(result["formtemplate"])
        chatres["formTemplate"] = this.resval;
        chatres["formAlias"] = this.formAlias;
        if (chatres["form_fields"] != undefined) {
          this.preData['data'] = chatres["form_fields"];
        }
        let x = document.getElementById("chatbot-form"+(this.count-1));
        chatEle = `
      <leds-chatbot-message ng-reflect-chatbot-image="true">
        <p class="clearboth le-u-mar-r-8 le-u-mar-b-8">
          <img src="assets/images/chatbot-small.png" alt="Chatbot" class="ng-star-inserted">
          <span class="d-inline-block le-u-body-xs le-u-text-neutral-60 le-u-mar-l-8">
            <span ledschatbotmessagetime="">##botResponseTime##</span>
          </span>
          <leds-panel id="##formview11##"></leds-panel>
        </p>
      <leds-chatbot-message>`
          .replace('##botResponseTime##', chatTime)
          .replace('##formId##', 'formview' + this.count)
          .replace('##formview11##', 'formview11' + this.count);
        let safeChatEle = this.sanitizer.bypassSecurityTrustHtml(chatEle);
        div.innerHTML = safeChatEle ? safeChatEle['changingThisBreaksApplicationSecurity'].toString() : '';
        div.id = divId;
        document.getElementById('chatDiv').appendChild(div);
        document.getElementById("formview11" + this.count).appendChild(x);
        this.hide = true;
        this.changeDetectionRef.detectChanges();
      });
    }
    else {
      this.formAlias = chatres["formAlias"];
      this.resval = chatres["formTemplate"]
      if (chatres["form_fields"] != undefined) {
        this.preData['data'] = chatres["form_fields"];
      }
      let x = document.getElementById("chatbot-form" + (this.count-1));
      chatEle = `
    <leds-chatbot-message ng-reflect-chatbot-image="true">
      <p class="clearboth le-u-mar-r-8 le-u-mar-b-8">
        <img src="assets/images/chatbot-small.png" alt="Chatbot" class="ng-star-inserted">
        <span class="d-inline-block le-u-body-xs le-u-text-neutral-60 le-u-mar-l-8">
          <span ledschatbotmessagetime="">##botResponseTime##</span>
        </span>
        <leds-panel id="##formview11##"></leds-panel>
      </p>
    <leds-chatbot-message>`
        .replace('##botResponseTime##', chatTime)
        .replace('##formId##', 'formview' + this.count)
        .replace('##formview11##', 'formview11' + this.count);
      let safeChatEle = this.sanitizer.bypassSecurityTrustHtml(chatEle);
      div.innerHTML = safeChatEle ? safeChatEle['changingThisBreaksApplicationSecurity'].toString() : '';
      div.id = divId;
      document.getElementById('chatDiv').appendChild(div);
      document.getElementById("formview11" + this.count).appendChild(x);
      this.hide = true;
      this.changeDetectionRef.detectChanges();
    }
    }
    else if (chatres.type == "Image") {
      let imageBytes = "data:image/jpeg;base64," + chatres["image"];
      chatEle = `
      <leds-chatbot-message ng-reflect-chatbot-image="true">
        <p class="clearboth le-u-mar-r-8 le-u-mar-b-8">
          <img src="assets/images/chatbot-small.png" alt="Chatbot" class="ng-star-inserted">
          <span class="d-inline-block le-u-body-xs le-u-text-neutral-60 le-u-mar-l-8">
            <span ledschatbotmessagetime="">##botResponseTime##</span>
          </span>
          <span class="d-block le-u-mar-t-8 le-u-text-neutral-90">##botResponse##</span>
          <div class="le-u-mar-tb-4 image-container">
          <img id="" src="##image##"style="width:64vh">
          </div>
        </p>
      </leds-chatbot-message>
      `.replace('##botResponse##', chatres.chat_system_response).replace('##botResponseTime##', chatTime).replace('##image##', imageBytes);
      // div.innerHTML = chatEle;
      let safeChatEle = this.sanitizer.bypassSecurityTrustHtml(chatEle);
      div.innerHTML = safeChatEle ? safeChatEle['changingThisBreaksApplicationSecurity'].toString() : '';
      div.id = divId;
      document.getElementById('chatDiv').appendChild(div);
      document.getElementById(divId).scrollIntoView();
    }
    else if (chatres.type == "Text" || chatres.type == undefined) {
      let chatsuggest = ''
      let suggestOption = ''
      let countSuggest = 0

      if (chatres.chat_suggestions?.length > 0) {
        this.suggest = true;
        chatres.chat_suggestions.forEach((element) => {
          countSuggest++;
          suggestOption +=
            `<mat-chip role="option"
            class="mat-chip mat-focus-indicator le-u-mar-t-8 h-auto DSA_wb_chipStyle-Normal 
            DSA_choiseChip le-u-mar-r-8 mat-primary mat-standard-chip" id="##suggestId##" (click)=
            tabindex="-1" aria-disabled="false">
              <div class="mat-chip-ripple"></div>
              <div class="le-u-pad-tb-4 le-u-pad-lr-8 d-flex aip-suggest" style="background: #e0e0e0;
              border-radius: 10px; cursor: pointer;">
                <em aria-hidden="true"
                  class="icon x-16 icon-color success-big-icon ng-star-inserted"></em>
                <div class="le-u-mar-l-8 le-u-mar-t-4 DSA_wb_mainBodyTxt2" style="font-size: 12px;">
                  ##item##
                </div>
              </div>
          </mat-chip>`
              .replace('##item##', element)
              .replace('##item##', element)
              .replace('##suggestId##', 'suggestId-' + this.count + '-' + countSuggest)
        });
        chatsuggest =
          `<div class="d-flex flex-wrap">
            <mat-chip-list id="##suggestListId##" class="mat-chip-list d-flex flex-wrap le-u-pad-l-4" tabindex="0"
            aria-required="false" aria-disabled="false" aria-invalid="false" aria-multiselectable="false"
            role="listbox" aria-orientation="horizontal">
              <div class="mat-chip-list-wrapper d-flex flex-wrap" id="##suggestListCount##">
                ##suggestOption##
              </div>
            </mat-chip-list>
          </div>`
            .replace('##suggestList##', chatres.chat_suggestions)
            .replace('##suggestOption##', suggestOption)
            .replace('##suggestListId##', 'suggestListId-' + this.count)
            .replace('##suggestListCount##', 'suggestListCount-' + this.count + '-' + countSuggest);
      }

      let cotEle = '';
      if (chatres.chat_chain_of_thoughts?.length > 0) {
        let chainStr = '';
        if (chatres.chat_chain_of_thoughts.forEach == undefined && chatres.chat_chain_of_thoughts.length > 0) {
          chainStr = chatres.chat_chain_of_thoughts;
        }
        else {
          chatres.chat_chain_of_thoughts.forEach((i) => {
            chainStr += this.getChainThoughts(i) + '<br>';
          })
        }

        cotEle = `
      <div>
        <leds-accordion designtype="3D" ng-reflect-design-type="3D"
          ng-reflect-hide-toggle="false" ng-reflect-multi="false">
            <mat-accordion class="mat-accordion le-c-accordion" style="display:block">
              <mat-expansion-panel class="mat-expansion-panel ng-tns-c19-20">
                <mat-expansion-panel-header
                  role="button"
                  class="mat-expansion-panel-header mat-focus-indicator ng-tns-c20-21 ng-tns-c19-20"
                  id="##headerId##"
                  tabindex="0" aria-controls="##childId##" aria-expanded="false" aria-disabled="false"
                  style="height: 30px !important; display: flex; justify-content: space-between;border-radius: 8px; padding: 6px !important;margin-bottom:4px;">
                  <span class="mat-content ng-tns-c20-21">
                      <mat-panel-title style="font-size: 14px;"
                          class="mat-expansion-panel-header-title ng-tns-c20-21">Chain of thoughts
                      </mat-panel-title>
                  </span>
                  <span
                      class="mat-expansion-indicator ng-tns-c20-21 ng-trigger ng-trigger-indicatorRotate"
                      style="transform: rotate(0deg);">
                  </span>
                </mat-expansion-panel-header>
                <div role="region" class="mat-expansion-panel-content ng-tns-c19-20 ng-trigger ng-trigger-bodyExpansion"
                  id='##childIdd##' aria-labelledby='##headerIdd##' hidden="true">
                  <div class="mat-expansion-panel-body ng-tns-c19-20">
                      <div class="le-u-mar-4 ng-tns-c19-20">
                      <span class=" d-block le-u-mar-t-8 le-u-text-neutral-90" style="white-space: pre-line;">
                        ##listBlock##
                      </span>
                      </div>
                  </div>
                </div>
              </mat-expansion-panel>
            </mat-accordion>
          </leds-accordion>
        </div>`
          .replace('##headerId##', 'cot-mat-expansion-panel-header' + this.count)
          .replace('##childId##', 'cot-cdk-accordion-child-' + this.count)
          .replace('##headerIdd##', 'cot-mat-expansion-panel-header' + this.count)
          .replace('##childIdd##', 'cot-cdk-accordion-child-' + this.count)
          .replace('##botResponse##', chatres.chat_system_response)
          .replace('##botResponseTime##', chatTime)
          .replace('##listBlock##', chainStr)
      }

      let refEle = '';
      if (chatres.references?.length > 0) {
        let optionsStr1 = '';
        let optionsStr = '';
        let org = sessionStorage.getItem('organization');
        chatres.references.forEach(async (ele, index) => {
          // this.chatbotServ.getDatasetByNameAndOrg(resp.references[index].dataset_id, org).subscribe((resBody) => {
          //   resp.references[index]['dsAlias'] = resBody.alias;
          //   resp.references[index]['dsViews'] =  resBody.views;
          //   if (resBody.attributes) {
          //     let attrs = JSON.parse(resBody.attributes)
          //     if (attrs.object)
          //     resp.references[index]['actualObject'] = attrs.object;
          //     if (attrs.path)
          //     resp.references[index]['path'] = attrs.path;
          //   }
          // });
        });
        // for (let i = 1; i <= resp.references.length; i++) {
        chatres.references.forEach(async (ele, index) => {
          let i = index + 1;
          optionsStr1 += `
        <mat-chip role="option"
          class="mat-chip mat-focus-indicator le-u-mar-t-8 h-auto DSA_wb_chipStyle-Normal DSA_choiseChip le-u-mar-r-8 mat-primary mat-standard-chip"
          tabindex="-1" aria-disabled="false">
            <div class="mat-chip-ripple"></div>
              <div class="le-u-pad-tb-4 le-u-pad-lr-8 d-flex" style="
                background: #e0e0e0;border-radius: 10px;">
                  <em aria-hidden="true"
                    class="icon x-16 icon-color success-big-icon ng-star-inserted">
                  </em>
                  <div class="le-u-mar-l-8 DSA_wb_mainBodyTxt2 le-u-mar-t-4" style="font-size: 12px;" id="##selectId##" value="##option##">
                  ##option##
                  </div>
              </div>
          </mat-chip>`
            .replace('##option##', 'Reference:' + i)
            .replace('##option##', 'Reference:' + i)
            .replace('##selectId##', 'mat-chip-' + this.count + '-' + i);
        });

        optionsStr = optionsStr1 + `<div id="##refDiv##" class="row le-u-pad-16"></div>`.replace("##refDiv##", 'refDiv' + this.count)

        refEle = `
      <div>
          <leds-accordion designtype="3D" ng-reflect-design-type="3D"
            ng-reflect-hide-toggle="false" ng-reflect-multi="false">
            <mat-accordion class="mat-accordion le-c-accordion" style="display:block">
              <mat-expansion-panel class="mat-expansion-panel ng-tns-c19-20">
                  <mat-expansion-panel-header
                      role="button"
                      class="mat-expansion-panel-header mat-focus-indicator ng-tns-c20-21 ng-tns-c19-20"
                      id="##refheaderId##"
                      tabindex="0" aria-controls="##refchildId##" aria-expanded="false" aria-disabled="false"
                      style="height: 30px !important; display: flex; justify-content: space-between;border-radius: 8px; padding: 6px !important;margin-bottom:4px;">
                      <span class="mat-content ng-tns-c20-21">
                          <mat-panel-title
                              class="mat-expansion-panel-header-title ng-tns-c20-21">References
                          </mat-panel-title>
                      </span>
                      <span
                          class="mat-expansion-indicator ng-tns-c20-21 ng-trigger ng-trigger-indicatorRotate"
                          style="transform: rotate(0deg);">
                      </span>
                  </mat-expansion-panel-header>
                  <div role="region" class="mat-expansion-panel-content ng-tns-c19-20 ng-trigger ng-trigger-bodyExpansion"
                      id='##refchildIdd##' aria-labelledby='##refheaderIdd##' hidden="true">
                      <div class="mat-expansion-panel-body ng-tns-c19-20">
                      <div class="le-u-mar-t-4" id="chipDiv">
                          <mat-chip-list 
                              class="mat-chip-list d-flex flex-wrap le-u-pad-l-4" tabindex="0"
                              aria-required="false" aria-disabled="false" aria-invalid="false" aria-multiselectable="true"
                              role="listbox" aria-orientation="horizontal">
                              <div class="mat-chip-list-wrapper d-flex flex-wrap" id="##matchiplist##">
                              ##options##
                              </div>
                          </mat-chip-list>
                      </div>
                    </div>
                  </div>
                </mat-expansion-panel>
            </mat-accordion>
          </leds-accordion>
        </div>`
          .replace('##botResponse##', chatres.chat_system_response)
          .replace('##botResponseTime##', chatTime)
          .replace('##refheaderId##', 'ref-mat-expansion-panel-header' + this.count)
          .replace('##refchildId##', 'ref-cdk-accordion-child-' + this.count)
          .replace('##refheaderIdd##', 'ref-mat-expansion-panel-header' + this.count)
          .replace('##refchildIdd##', 'ref-cdk-accordion-child-' + this.count)
          .replace('##options##', optionsStr)
          .replace("##matchiplist##", 'matchiplist-' + this.count);
      }

      chatEle = `
      <leds-chatbot-message ng-reflect-chatbot-image="true">
        <p class="clearboth le-u-mar-r-8">
          <img src="assets/images/chatbot-small.png" alt="Chatbot" class="ng-star-inserted">
          <span class="d-inline-block le-u-body-xs le-u-text-neutral-60 le-u-mar-l-8" >
            <span ledschatbotmessagetime="">##botResponseTime##</span>
          </span><span class="d-block le-u-mar-t-8 le-u-text-neutral-90" style="white-space: pre-line;">##botResponse##
          ##cot##
          ##chatsuggest##
          ##ref##
          </span>
        </p>
      </leds-chatbot-message>
      `.replace('##botResponse##', chatres.chat_system_response)
        .replace('##botResponseTime##', chatTime)
        .replace('##cot##', cotEle)
        .replace('##ref##', refEle)
        .replace('##chatsuggest##', chatsuggest);
      let safeChatEle = this.sanitizer.bypassSecurityTrustHtml(chatEle);
      div.innerHTML = safeChatEle ? safeChatEle['changingThisBreaksApplicationSecurity'].toString() : '';
      div.id = divId;
      document.getElementById('chatDiv').appendChild(div);
      document.getElementById(divId).scrollIntoView();
    }
    // div.innerHTML = chatEle;
    let c
    for (c = 0; c <= this.count; c++) {
      if (chatres.chat_chain_of_thoughts && chatres.chat_chain_of_thoughts.length > 0 && document.getElementById('cot-cdk-accordion-child-' + c) != undefined) {
        this._renderer2.listen(document.getElementById('cot-mat-expansion-panel-header' + c), 'click', (event) => {
          let id = event.currentTarget.nextElementSibling.id.substring(event.currentTarget.nextElementSibling.id.toString().lastIndexOf('-') + 1);
          if (document.getElementById(event.currentTarget.nextElementSibling.id)?.hidden.valueOf() == false && c - id == 1) {
            document.getElementById(event.currentTarget.nextElementSibling.id).hidden = true;
          }
          else if (c - id == 1) {
            document.getElementById(event.currentTarget.nextElementSibling.id).hidden = false;
            document.getElementById(event.currentTarget.nextElementSibling.id).scrollIntoView({ behavior: 'smooth' });
          }
        });
      }

      if (chatres.references && chatres.references.length > 0 && document.getElementById('ref-mat-expansion-panel-header' + c)) {
        this._renderer2.listen(document.getElementById('ref-mat-expansion-panel-header' + c), 'click', (event) => {
          let id = event.currentTarget.nextElementSibling.id.substring(event.currentTarget.nextElementSibling.id.toString().lastIndexOf('-') + 1);
          if (document.getElementById(event.currentTarget.nextElementSibling.id)?.hidden.valueOf() == false && c - id == 1) {
            document.getElementById(event.currentTarget.nextElementSibling.id).hidden = true;
          }
          else if (c - id == 1) {
            document.getElementById(event.currentTarget.nextElementSibling.id).hidden = false;
            document.getElementById(event.currentTarget.nextElementSibling.id).scrollIntoView({ behavior: 'smooth' });
          }
        });
      }
      if (document.getElementById('bot' + c) != undefined) {
        this._renderer2.listen(document.getElementById('bot' + c), 'click', (event) => {
          let refId = Number(event.target.id.split('-').splice(-2, 1)) + 1;
          if (event.target.innerText.split(':')[0] === 'Reference' && refId == c) {
            let ref = event.target.innerText.split(':').pop();
            let refEle = `
            <div class="le-u-pad-t-16" style="display: grid;">
              <leds-tooltip [tooltip]="'Preview'" [position]="##tooltipPoition##" style="float: left;">
                    ##dsDiv##
              </leds-tooltip>
              ##sourceDiv##
            </div>
            `.replace("##tooltipPoition##", 'above')
            if (chatres.references[Number(ref) - 1].dataset_id != undefined) {
              let datasetDiv = `<h2 class="aip-cursor le-u-pad-b-8"
                (click)="openDatasetPreview(selectedReferenceObject.datasetId,selectedReferenceObject.organization,selectedReferenceObject.datasetView,selectedReferenceObject.object,selectedReferenceObject.datasetName,selectedReferenceObject.actualObject,selectedReferenceObject.path)"
                style="color: var(--base-color);" id="##dsId##">
                ##dsAlias##
              </h2>`.replace("##dsId##", 'dataset-' + c + ref)
                .replace('##dsAlias##', chatres.references[Number(ref) - 1]['dataset_id'])
              refEle = refEle.replace('##dsDiv##', datasetDiv)
            }
            else {
              refEle = refEle.replace('##dsDiv##', '')
            }
            if (chatres.references[Number(ref) - 1].source != undefined) {
              let sourceDiv = `<h3 class="le-u-header-md le-u-ellipsis">##source##</h3>`
                .replace('##source##', chatres.references[Number(ref) - 1].source)
              refEle = refEle.replace('##sourceDiv##', sourceDiv.toString())
            }
            else {
              refEle = refEle.replace('##sourceDiv##', '')
            }
            if (chatres.references[Number(ref) - 1].context != undefined) {
              refEle = refEle + `<span class="d-block le-u-text-neutral-90" style="white-space: pre-line;">
                ##refContext## </span>`.replace('##refContext##', chatres.references[Number(ref) - 1].context)
            }
            else {
              refEle = refEle + ''
            }

            document.getElementById("refDiv" + (c - 1)).innerHTML = refEle;
            document.getElementById("refDiv" + (c - 1)).scrollIntoView({ behavior: 'smooth' });


          }
        });
      }

      if (chatres.chat_suggestions?.length > 0 && document.getElementById('suggestListId-' + c) != undefined) {
        let doc = document.getElementById('suggestListId-' + c);
        let suggestCount = Number(doc.firstElementChild.id.substring(doc.firstElementChild.id.lastIndexOf('-')+1));
        for (let i = 1; i <= suggestCount; i++) {
          this._renderer2.listen(document.getElementById('suggestId-' + c + '-' + i), 'click', (event) => {
            let currentid = event.currentTarget.id.substring(event.currentTarget.id.indexOf('-') + 1, event.currentTarget.id.lastIndexOf('-'));
            console.log(currentid);
            if (c - 1 == currentid) {
              let val = event.target.innerText;
              this.chatPostObj.chat_user_query = val;
              this.sendInput(val);
            }
          });
        }
      }
    }
  }

  getChainThoughts(data) {
    let chainStr1 = '';
    for (let j of Object.keys(data)) {
      chainStr1 += `<p><strong>##key##:</strong> ##value##</p>`
        .replace('##key##', j).replace('##value##', data[j]);
    }
    return chainStr1;
  }

  onSubmit($event) {
    let result = $event.data;
    // let user = JSON.parse(sessionStorage.getItem("user")).user_email
    // result["user"] = user;
    this.formResult = this.formAlias + ':' + JSON.stringify($event.data);
    this.sendInput(this.formResult, true);
  }

  // unimplemented
  openFeedbackPopup(temp) {
    this.feedbackText = '';
    // this.dialog.open(temp, {
    //   width: '30%',
    //   height: '35%'
    // });
  }

  ratingChange(ev) {
    this.feedbackObj.rating = ev;
  }

  submitRating(tempRef) {
    this.feedbackObj.feedback = this.feedbackText;
    // this.dialog.closeAll();
    this.chatbotServ.saveFeedback(this.feedbackObj, this.instance).subscribe((res) => {
      this.successText = res.toString();
      this.successPopup(tempRef);
    });
  }

  successPopup(tempRef) {
    // const dialogRef = this.dialog.open(tempRef, {
    //   width: '50%'
    // });
    // dialogRef.afterOpened().subscribe(_ => {
    //   setTimeout(() => {
    //     dialogRef.close();
    //   }, 2500)
    // });
  }

  selectChange(ev) {

  }

  openChange(ev) {

  }

}