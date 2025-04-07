import { Component, OnInit } from '@angular/core';
import { Services } from '../services/service';

@Component({
  selector: 'app-solution-bot',
  templateUrl: './solution-bot.component.html',
  styleUrls: ['./solution-bot.component.scss'],
})
export class SolutionBotComponent implements OnInit {
  history: any = [];
  userInput: any = '';
  userName: any;
  constructor(private service: Services) {}

  ngOnInit() {
    this.history.push({
      user: 'bot',
      solution: 'Hi, I am your bot. How can I help you?',
    });
    this.userName = JSON.parse(sessionStorage.getItem('user')).user_f_name;
  }
  changesOccur() {
    if (this.userInput.length != '' && this.userInput != null) {
      this.history.push({ user: this.userName, solution: this.userInput });
      this.service.testcss().subscribe(
        (res: any) => {
          this.history.push({ user: 'bot', solution: res });
          console.log(res);
          this.userInput = '';
        },
        (err: any) => {
          console.log(err);
        }
      );
    } else {
      this.service.message('Please enter your query', 'info');
    }
  }
  re_ask(question: any) {
    this.userInput = question;
  }
}
