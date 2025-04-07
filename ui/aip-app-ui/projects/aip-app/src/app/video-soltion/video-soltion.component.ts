import { Component, OnInit } from '@angular/core';
import { Services } from '../services/service';

@Component({
  selector: 'app-video-soltion',
  templateUrl: './video-soltion.component.html',
  styleUrls: ['./video-soltion.component.scss'],
})
export class VideoSoltionComponent implements OnInit {
  userInput: any = '';
  ask: boolean = false;
  answer: any =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Mauris pellentesque pulvinar pellentesque habitant. Tellus molestie nunc non blandit massa enim. Vitae aliquet nec ullamcorper sit. Integer feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Volutpat blandit aliquam etiam erat velit scelerisque in dictum. Tempus iaculis urna id volutpat lacus laoreet non curabitur gravida. Vitae congue mauris rhoncus aenean vel elit scelerisque mauris pellentesque. Scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique. Scelerisque fermentum dui faucibus in ornare';
  constructor(private service: Services) {}
  ngOnInit(): void {}
  changesOccur(input: any) {
    if (input && input != null) {
      this.service.testcss().subscribe(
        (res: any) => {
          console.log(res);
          this.ask = true;
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
}
