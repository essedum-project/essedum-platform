import { Location } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { Services } from '../../services/service';
import { RaiservicesService } from '../../services/raiservices.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-ivm-view-all-initiative',
  templateUrl: './ivm-view-all-initiative.component.html',
  styleUrls: ['./ivm-view-all-initiative.component.scss'],
})
export class IvmViewAllInitiativeComponent implements OnInit {
  endIndex: any;
  startIndex: number;
  itemsPerPage: number[] = [8,16,24,32,40,48,56,64,72,80];
  noOfItems: number ;
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  pageSize: number;
  pageNumber: number;
  noOfPages: number = 0;
  pageArr: number[] = [];
  questionnaireId: any;  
  pageNumberInput: number ;
  deleteInitiative: boolean;
  viewOnlyMyInitiatives=false;
  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private ivmService: RoleService,
    private raiservice: RaiservicesService,
    public services: Services
  ) {}
  data: any = [];
  ngOnInit(): void {
    this.pageSize = this.itemsPerPage[0];
    this.pageNumber = 1;
    if (this.pageNumber && this.pageNumber >= 5) {
      this.endIndex = this.pageNumber + 2;
      this.startIndex = this.endIndex - 5;
    } else {
      this.startIndex = 0;
      this.endIndex = 5;
    }
    this.pageSize = this.itemsPerPage[0];
    this.authorization()
    //
   
  }
  toviewInitiative(name: any, id: any) {
    this.router.navigate(['../viewinitiative/' + id + '/' + name], {
      relativeTo: this.route,
    });
    sessionStorage.setItem('initiativeId', JSON.stringify(id));
  }
  authorization() {
    this.services.getPermission('cip').subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes('delete-initiative'))
          this.deleteInitiative = true;
        if (cipAuthority.includes('view-only-my-initiatives'))
          this.viewOnlyMyInitiatives = true;
        if(! this.viewOnlyMyInitiatives){
        this.initiativeList();}
        else{
        this.initiativeMyList();
        }
      },
      (error) => {
        console.log(
          `error when calling getPermission method. Error Details:${error}`
        );
      }
    );
  }
  initiativeList() {
    this.pageNumberInput=this.pageNumber;
    this.raiservice
      .initiativeList(this.pageNumber - 1, this.pageSize)
      .subscribe((res: any) => {
        this.data = res;
        this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
        this.pageArr = [...Array(this.noOfPages).keys()];
      });
    this.pageSize = this.pageSize || 6;
    this.initiativeListCount();
  }
  initiativeListCount() {
    let params: HttpParams = new HttpParams();
    params = params.set('organization', sessionStorage.getItem('organization'));
    this.raiservice
    .initiativeListCount(params).subscribe((res) => {
      this.noOfItems = res;
    });
  }
  initiativeMyList() {
    this.pageNumberInput=this.pageNumber;
    this.raiservice
      .ViewOnlyMyInitiativeList(this.pageNumber - 1, this.pageSize)
      .subscribe((res: any) => {
        this.data = res;
        this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
        this.pageArr = [...Array(this.noOfPages).keys()];
      });
    this.pageSize = this.pageSize || 6;
    this.initiativeMyListCount();
  }
  initiativeMyListCount() {
    let params: HttpParams = new HttpParams();
    params = params.set('organization', sessionStorage.getItem('organization'));
    this.raiservice
    .initiativeMyListCount(params).subscribe((res) => {
      this.noOfItems = res;
    });
  }
  nextPage() {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      this.changePage();
    }
  }
  prevPage() {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.changePage();
    }
  }
  changePage(page?: number) {
    if (page && page >= 1 && page <= this.noOfPages) this.pageNumber = page;
    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      this.pageChanged.emit(this.pageNumber);
      if (this.pageNumber > 5) {
        this.endIndex = this.pageNumber + 2;
        this.startIndex = this.endIndex - 3;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }
    }
    this.initiativeList();
  }
  optionChange(event: Event) {
    let i: number = event.target['selectedIndex'];
    this.pageSize = this.itemsPerPage[i];
    this.pageNumber = 1;
    this.initiativeList();

  }
  selectedButton(i) {
    if (i == this.pageNumber) return { color: 'white', background: '#7b39b1' };
    else return { color: 'black' };
  }
  navigateBack() {
    this.location.back();
  }
  navigateInbox() {
    this.router.navigate(['../inbox'], { relativeTo: this.route });
  }
}
