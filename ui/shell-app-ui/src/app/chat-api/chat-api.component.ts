import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ChatbotServices } from '../chatbot/chatbot.service';

@Component({
  selector: 'app-chat-aip',
  templateUrl: './chat-api.component.html',
  styleUrls: ['./chat-api.component.scss']
})

export class ChatApiComponent implements OnInit {

  @Output() closeChatbot = new EventEmitter<boolean>();
  @Input() selectedInstance: string;
  @Input() chat_title: any;
  isMaximize: boolean = false;
  mashuplist: any;
  agentlist: any = [];
  noChatbot: boolean = false;
  sessionView: boolean = false;
  compData: any;
  selectedIndex: any;
  menuOpen: boolean = false;
  userSession: any;
  sessionResp: boolean;
  sessionId: any = 'new';
  originalStyle = {};
  groups = {
    Today: [],
    Yesterday: [],
    Earlier: []
  };
  groupName: any = ['Today', 'Yesterday', 'Earlier'];
  dragSess: boolean = false;
  offsetX = 0;
  offsetY = 0;
  show: boolean = false;
  count = 0;
  chatExtras: any;
  mashName: any;

  constructor(
    private chatbotServ: ChatbotServices
  ) { }

  ngOnInit(): void {
    this.menuOpen = false;
    if (sessionStorage.getItem('lastChat') != null) {
      this.show = false;
      this.sessionId = 'current';
      this.show = true;
    }
    this.getNewAipChatBot();
    this.openNav();
  }

  // get all chatbots from mashup
  getNewAipChatBot() {
    this.chatbotServ.getAllMashups().subscribe((res) => {
      this.mashuplist = res;
      this.agentlist = [];
      let objInstance = {};
      this.mashuplist.forEach((ele) => {
        let template = JSON.parse(ele.template)
        for (let i = 0; i < template?.contents?.length; i++) {
          try {
            if (template.contents[i].type === 'chatbot') {
              this.agentlist.push({ 
                "agent": ele.name, 
                "title": template.contents[i].title, 
                "instance": template.contents[i].url,
                "chatExtras": template.chatExtras? template.chatExtras : {}
              })
              objInstance[template.contents[i].url] = null;
            }
          } catch (ex) { }
        }
      });

      if (sessionStorage.getItem('lastChat') == null) {
        this.show = false;
        if (this.agentlist.length) {
          this.mashName = this.agentlist[0].agent;
          this.selectedInstance = this.agentlist[0].instance
          this.chatExtras = this.agentlist[0].chatExtras;
          this.chat_title = this.agentlist[0].title
          this.sessionId = 'new';
          let lastChat = {}
          lastChat[this.selectedInstance] = this.chat_title;
          sessionStorage.setItem("lastChat", JSON.stringify(lastChat));
          this.show = true;
          sessionStorage.setItem('chatId', JSON.stringify(objInstance));
          sessionStorage.setItem('agent', this.mashName);
        } else {
          this.noChatbot = true
        }
      } else {
        let lastChat = JSON.parse(sessionStorage.getItem('lastChat'));
        this.selectedInstance = Object.keys(lastChat)[0];
        this.chat_title = lastChat[this.selectedInstance];
        this.mashName = this.agentlist.find(agent => agent.instance == this.selectedInstance).agent;
        this.chatExtras = this.agentlist.find(agent => agent.instance == this.selectedInstance).chatExtras;
      }
    });
  }

  // open and close chatbot functionality
  openNav() {
    document.getElementById("mySidepanel")?.classList.add('sidepanel');
  }

  closeNav() {
    this.closeChatbot.emit(false);
    this.sessionView = false;
    document.getElementById("mySidepanel").style.display = "none";
  }

  // select chatbot from dropdown menu
  selectChange(value): void {
    this.selectedInstance = value.instance;
    this.sessionView = false;
    this.chat_title = value.title;
    this.chatExtras = value.chatExtras? value.chatExtras : '';
    this.sessionId = 'new';
    sessionStorage.setItem("currentChatData", null);
    let lastChat = {}
    lastChat[this.selectedInstance] = this.chat_title;
    sessionStorage.setItem("lastChat", JSON.stringify(lastChat));
    sessionStorage.setItem('agent', value.agent);
  }

  // history of chatSessions done by a user
  // render and format history of chatSessions
  getAllSessions() {
    let userId = JSON.parse(sessionStorage.getItem('user')).id.toString();
    if (this.sessionView && (this.userSession == undefined || this.userSession.length == 0)) {
      this.sessionResp = false;
      this.chatbotServ.getChatHistory(userId, this.selectedInstance).subscribe((res) => {
        this.sessionResp = true;
        this.userSession = res;
        if (this.userSession.records.length > 0)
          this.groupChatHistory();
      });
    }
  }

  groupChatHistory() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    this.userSession.records.forEach((chat) => {
      if (chat.summary != null && chat.summary != '') {
        let chatDate = new Date(chat.chat_date);
        chatDate.setHours(0, 0, 0, 0);

        chat.chat_timeFormat = this.getTime(chat.chat_time.toString());
        if (+chatDate == +today) {
          this.groups['Today'].push(chat);
        }
        else if (+chatDate == +yesterday) {
          this.groups['Yesterday'].push(chat);
        }
        else {
          this.groups['Earlier'].push(chat);
        }
      }
    });

    this.groupName.forEach(group => {
      this.groups[group].sort((a, b) => b.chat_timeFormat - a.chat_timeFormat);
    });
  }

  getTime(timeStr) {
    let [hours, minutes, period] = timeStr.split(/[:\s]/);

    if (period === 'PM' && hours !== '12') {
      let h = 12 + Number(hours);
      hours = h.toString();
    } else if (period === 'AM' && hours === '12') {
      hours = '0';
    }

    let date = new Date();
    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));

    return date.getTime();
  }
  // history screen button
  refreshHistory() {
    this.userSession = [];
    this.groups = {
      Today: [],
      Yesterday: [],
      Earlier: []
    }
    this.getAllSessions();
  }

  closeHistory($event) {
    this.sessionView = !$event;
    if (this.sessionView) {
      this.getAllSessions();
    }
  }

  // session new and past session to be send to chatbot component
  getChatSession(sessionId) {
    this.sessionId = sessionId;
  }

  addNewChat() {
    this.sessionId = 'new' + this.count++;
  }

  // maximise and minimise functionality of chatbot
  maximize() {
    const chatStyle = document.getElementById('draggableChat')
    this.originalStyle['height'] = chatStyle.style.height;
    this.originalStyle['width'] = chatStyle.style.width;
    this.originalStyle['left'] = chatStyle.style.left;
    this.originalStyle['top'] = chatStyle.style.top;

    if (this.sessionView) {
      if (chatStyle.style.left) {
        chatStyle.style.left = '50vh';
        chatStyle.style.top = '';
        document.getElementById("sidepanelcomponents").style.left = '-41vh';
        document.getElementById("sidepanelcomponents").style.top = '0%';
        this.dragSess = true;
      }
      else {
        chatStyle.style.left = '0';
        chatStyle.style.top = '0';
        document.getElementById("mySidepanel").classList.add('modal-fullscreen-withComponent');
      }
      chatStyle.style.height = '';
      chatStyle.style.width = '';
    }
    else {
      chatStyle.style.left = '0';
      chatStyle.style.top = '0';
      chatStyle.style.height = '100vh';
      chatStyle.style.width = '100vw';
      document.getElementById("mySidepanel").classList.add('modal-fullscreen');
    }
    document.getElementById("mySidepanel").style.top = '9%';
    if (document.getElementById("chatDiv")) {
      document.getElementById("chatDiv").style.height = "calc(100vh - 20vh)";
      document.getElementById("chatDiv").scrollIntoView({ behavior: 'smooth' });
    }
    if (document.getElementById("chatContainer")) {
      document.getElementById("chatContainer").style.height = "76vh";
    }
  }

  restore() {
    this.isMaximize = !this.isMaximize;
    const chatStyle = document.getElementById('draggableChat')
    chatStyle.style.height = '';
    chatStyle.style.width = '';
    chatStyle.style.left = this.originalStyle['left'];
    chatStyle.style.top = this.originalStyle['top'];
    document.getElementById("mySidepanel").style.width = "23%";
    document.getElementById("mySidepanel").style.right = '0%';
    document.getElementById("mySidepanel").style.top = '0%';
    if (this.sessionView) {
      document.getElementById("mySidepanel").classList.remove('modal-fullscreen');
      if (this.dragSess) {
        document.getElementById("sidepanelcomponents").style.top = '6%';
        this.dragSess = false;
      }
    }
    else {
      document.getElementById("mySidepanel").classList.remove('modal-fullscreen-withComponent');
    }
    if (document.getElementById("chatDiv")) {
      document.getElementById("chatDiv").style.height = "calc(100% - 18vh)";
      document.getElementById("chatDiv").scrollIntoView({ behavior: 'smooth' });
    }
  }

  // drag and drop functionality of chatbot
  onDragEnd(event) {
    event.preventDefault();
  }

  onDragStart(event) {
    event.dataTransfer.setData('text/plain', "draggableChat");
    const data = event.dataTransfer.getData('text/plain');
    const element = document.getElementById(data);
    if (element.offsetLeft == 0 && element.offsetTop == 50) {
      this.offsetX = 160;
      this.offsetY = 10;
    }
    else {
      this.offsetX = event.clientX - element.offsetLeft;
      this.offsetY = event.clientY - element.offsetTop;
    }
  }

  @HostListener('body:dragover', ['$event']) onBodyDragOver(event) {
    event.preventDefault(); // Necessary to allow drop
  }

  @HostListener('body:drop', ['$event']) onBodyDrop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text/plain');
    document.getElementById('mySidepanel').style.position = 'relative';
    const element = document.getElementById(data);
    if(event.clientX > window.innerWidth*3/4 || event.clientY > window.innerHeight*3/4) {
      element.style.right = '0px';
      element.style.top = '0px';
      element.style.left = '';
    } else {
      element.style.position = 'absolute';
      element.style.left = (event.clientX - this.offsetX) + 'px';
      element.style.top = (event.clientY - this.offsetY) + 'px';
    }
  }

}
