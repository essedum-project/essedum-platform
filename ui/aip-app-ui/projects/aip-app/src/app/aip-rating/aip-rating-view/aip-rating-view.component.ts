import { Component, Input, OnInit } from '@angular/core';
import { Services } from '../../services/service';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-aip-rating-view',
  templateUrl: './aip-rating-view.component.html',
  styleUrl: './aip-rating-view.component.scss'
})
export class AipRatingViewComponent implements OnInit {

  @Input() selectedModule;
  @Input() selectedElement;

  isExpanded: boolean = false;
  cardTitle = 'Rating';
  tooltip: string = 'above';
  moduleList = [];
  modules = [];
  iconIterations = Array(5).fill(0);
  
  org : String;
  pageNumber : number = 1;
  size : any;
  user: any;
  ratingResult: number = 0;
  ratingCount: any;

  constructor(
    private services : Services,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.pageNumber = 1;
    this.size = 10;
    this.org = sessionStorage.getItem("organization");
    this.user = JSON.parse(sessionStorage.getItem("user")).id
    this.route.params.subscribe((params) => {
      if(params['type']) this.selectedModule = params['type'];
    });

    this.getAllModules();
    this.getAllRating();
    this.getAllRatingCount();
  }

  getAllRating() {
    let param = new HttpParams();
    param = param.set('org', this.org.toString());
    param = param.set('module', this.selectedModule);
    param = param.set('element', this.selectedElement);
    param = param.set('page', this.pageNumber);
    param = param.set('size', this.size);
    param = param.set('user', this.user);

    this.services.getAllRatingByUser(param).subscribe(resp =>{
      this.ratingResult = resp;
    })
  }

  getAllModules() {
    this.services.getRatingModules().subscribe(resp => {
      this.modules = resp;
      resp.forEach(element => {
        this.moduleList.push({ viewValue: element, value: element });
      });
    });
  }

  getAllRatingCount() {
    let param = new HttpParams();
    param = param.set('org', this.org.toString());
    param = param.set('module', this.selectedModule);
    param = param.set('element', this.selectedElement);
    param = param.set('user', this.user);
    this.services.getAllRatingByUserCount(param).subscribe(resp =>{
      this.ratingCount = resp;
    });
  }

  moduleChange($event) {
    this.router.navigate(["../" + $event], {
      relativeTo: this.route,
    });
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  toggler(isExpanded: boolean) {
    if (isExpanded) {
      return { width: '78%', margin: '0 0 0 22%' };
    } else {
      return { width: '100%', margin: '0%' };
    }
  }

  pageChanged(event){
    this.pageNumber = event.pageIndex;
    this.getAllRating();
  }

  back() {
    this.location.back();
  }

}
