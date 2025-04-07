import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LedsModalService } from 'leds-lib';
import { Services } from '../services/service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-aip-rating',
  templateUrl: './aip-rating.component.html',
  styleUrl: './aip-rating.component.scss'
})
export class AipRatingComponent implements OnInit {
  rating: any;

  constructor (
    private modalService: LedsModalService,
    private service: Services,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  @Input() rateData;
  @Output() refresh = new EventEmitter();
  selectedModule
  selectedElement;
  selectedElementAlias;
  previousRating;
  newRating;
  previousFeedback;
  newFeedback;
  feedback;

  ngOnInit() {
    if (this.rateData) {
      this.selectedModule =this.rateData.selectedModule;
      this.selectedElement = this.rateData.selectedElement;
      this.selectedElementAlias = this.rateData.selectedElementAlias;
      this.previousRating = this.rateData.previousRating || 0;
      this.previousFeedback = this.rateData.previousFeedback || '';
      this.rating = this.previousRating;
      this.feedback = this.previousFeedback;
    }
  }

  ratingChange(rate) {
    this.newRating = rate;
    this.rating = rate;
  }

  keyupChanges(feed) {
    this.newFeedback = this.feedback;
  }
  
  submit() {
    let postData = {
      "module" : this.selectedModule,
      "element" : this.selectedElement,
      "elementAlias" : this.selectedElementAlias,
      "user" : JSON.parse(sessionStorage.getItem("user")).id,
      "organization" : sessionStorage.getItem("organization"),
      "rating" : this.newRating || this.rating,
      "feedback" : this.newFeedback,
    }
    // api call for save
    this.service.saveRating(postData).subscribe(res =>{
      this.service.message("Rating saved successfully","success");
      this.closeModal()
    },(err)=>{
      this.service.message("Error in saving Rating","error");
      this.closeModal();
    })
  }

  closeModal() {
    this.modalService.dismissAll();
    this.refresh.emit(true);
  }

  navigateToDetailedRating() {
    this.router.navigate(['../rating/'+this.selectedModule], { relativeTo: this.route });
  }
}

