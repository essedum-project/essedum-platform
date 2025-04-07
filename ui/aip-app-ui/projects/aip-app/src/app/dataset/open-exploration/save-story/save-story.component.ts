import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Services } from '../../../services/service';

@Component({
  selector: 'app-save-story',
  templateUrl: './save-story.component.html',
  styleUrls: ['./save-story.component.scss']
})
export class SaveStoryComponent {
  @Input() chartUrl;
  //@Input() selectedStoryName;
  @Input() storyDescription: any;
  isShowInput: boolean = false;
  storySaveMode: string;
  @Input()storyName: any;
  image = '';
  datasetName: any;
  org: any;
  storyType: string = 'chart';
  isUpdateStory:boolean=false;
  @Input() chartDetails;
  @Output () storySaved=  new EventEmitter();

  constructor(private service: Services) { }

  ngOnChanges(change: SimpleChanges) {
    console.log('Changes',change);
    
    if (change.chartDetails.currentValue) {
      this.chartDetails = change.chartDetails.currentValue
      console.log('chartDeta', this.chartDetails);
    }
    if (change.storyName.currentValue) {
      this.isUpdateStory=true;
      this.storyName = change.selectedStoryName.currentValue
      //console.log('chartDeta', this.chartDetails);
    }
    else this.isUpdateStory=false;

  }
  ngOnInit() {
    this.datasetName = localStorage.getItem('nameid');
    console.log('datasetName', this.datasetName);
    this.org = localStorage.getItem('organization')
    console.log('orga', this.org);
    console.log('savestory', this.storySaveMode);
    console.log('imageUrl', this.chartUrl);
    //console.log('saveStorChatrt', this.chartDetails);


  }

  saveStory() {
    const name = { "story_name": this.storyName }
    console.log('saveStoryName', name);
    const desc = { "description": this.storyDescription };
    console.log('savestoryDesc', desc);
    const details = { "details": this.chartDetails }
    let reqBody = { ...name, ...desc, ...details };
    console.log('reqBody', reqBody);
    if(!this.isUpdateStory)
    this.service.saveStory(this.org, this.datasetName, this.storyType, reqBody).subscribe((res) => {
      console.log('saveStory', res);
      this.storySaved.emit('true');
      this.service.messageService(res, 'Done! Story Saved Successfully.');
    })
    if(this.isUpdateStory){
      // const selectedSName = { "story_name": this.selectedStoryName}
      // reqBody=  { ...name, ...desc, ...details };
      this.service.updateStory(this.org, this.datasetName, this.storyType, reqBody).subscribe((res) => {
        console.log('updateStory', res);
        this.storySaved.emit('true');
        this.service.messageService(res, 'Done! Story Updated Successfully.')
        
      })
    }

  }
  updateStory(){

  }
  getSaveButtonDisable() { }
  showInputField(action: any) {
    this.storySaveMode = action;
  }
}
