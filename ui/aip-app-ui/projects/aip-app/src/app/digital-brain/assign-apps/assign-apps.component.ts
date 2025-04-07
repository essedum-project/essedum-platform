import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../../services/service';

@Component({
  selector: 'app-assign-apps',
  templateUrl: './assign-apps.component.html',
  styleUrls: ['./assign-apps.component.scss']
})
export class AssignAppsComponent {
  source = [];
  target = [];
  format = {
    add: "Available",
    remove: "Chosen",
    all: "All",
    none: "None",
    draggable: true,
    locale: "da",
  };
  isAuth: any = true;       //add Authentication for this
  userGroups: any[] = [];
  selectedUserGroup: any;
  //groupName:String="";
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: Services
  ) { }
  ngOnInit() {
    this.getAllDgAppList();
    this.getListGroup();
  }
  getListGroup() {
    let params: HttpParams = new HttpParams();
    //console.log('filter',this.filter);

    // if(this.filter.length>=1){
    //   params =params.set('group_names',this.filter);
    // }
    params = params.set('project', sessionStorage.getItem('organization'));
    //this.groupName='TestGroup_102';
    this.service.getUserGroup(params).subscribe(res => {
      console.log('userGroup', res);
      res.forEach((group) => {
        this.userGroups.push({
          viewValue: group.groupName,
          value: group.groupName
        });
      })
    })
  }
  getAllDgAppList() {
    //this.selectedApp=[];
    this.service.getDgappsList().subscribe((resp) => {
      resp.forEach((element: any) => {
        this.source.push({
          name: element.appId,
          alias: element.appName
        })
      })
    })
    console.log('items', this.source);

  }
  onSelect(event: any) {
    this.selectedUserGroup = event
    console.log('selected', this.selectedUserGroup);
  }
  assignApps() {
    console.log('selectedGroup', this.selectedUserGroup);
    console.log('target', this.target);
    let appIds = [];
    this.target.forEach((apps) => {
      appIds.push(apps.name);
    })
    this.service.assignAppsToGroup(this.selectedUserGroup, appIds).subscribe((resp) => {
      console.log(resp);
      this.service.messageService(resp, 'Done! Apps Assigned To UserGroup');
    })
  }
  routeBackToList() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  fetcharray(event) {
    const temp = [];
    event.forEach((element) => {
      console.log('fetchele', element);

      let obj = {}
      obj["name"] = element._id
      obj["alias"] = element._name
      temp.push(obj);
    });
    this.target = temp;
    console.log('this.target', this.target);

  }
}
