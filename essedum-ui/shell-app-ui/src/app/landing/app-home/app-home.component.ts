import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApisService } from '../../services/apis.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-home',
  templateUrl: './app-home.component.html',
  styleUrls: ['./app-home.component.scss']
})
export class AppHomeComponent implements OnInit {
  lazyloadevent = {
    first: 0,
    rows: 1000,
    sortField: "id",
    sortOrder: 1,
    filters: null,
    multiSortMeta: null
  };
  userProject: any = new Object();
  filteredModuleList: any = [];
  instArr: any = [];
  uninstArr: any = [];
  project: string = "";
  portfolio: string = "";
  highlightedLabel;
  constructor
    (
      private router: Router,
      private apiService: ApisService,
      private route: ActivatedRoute,
      private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.fetchPortfolioPoject();
    let module: any;
    this.apiService.findAllModules(module, this.lazyloadevent).subscribe(res => {
      res.content.forEach(ele => {
        if (ele.url === undefined || ele.url === "" || ele.url === null) {
            // Only add to uninstArr if module name is 'cip' or 'usm'
            if (ele.name === 'cip' || ele.name === 'usm') {
            this.uninstArr.push(ele);
            }
        } else {
             // Only add to uninstArr if module name is 'cip' or 'usm'
            if (ele.name === 'cip' || ele.name === 'usm') {
            this.instArr.push(ele);
            }
        }
      })
    }, error => {
      console.log("unable to fetch modules", error)
    })

    try {
      let user = JSON.parse(sessionStorage.getItem("user"));
      this.userProject.user_id = user;
      this.userProject.project_id = JSON.parse(sessionStorage.getItem("project"));
      this.userProject.role_id = JSON.parse(sessionStorage.getItem("role"));

    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
    this.highlightedLabel = sessionStorage.getItem("highlightedLabel") || "";
    let constant: any = new Object();
    constant.project_id = new Object({ id: this.userProject["project_id"]["id"] });
    constant["keys"] = this.userProject.role_id.name + " Land";
    this.apiService.getDashConsts().subscribe(
      (res) => {
        let temp = this.userProject.user_id.user_login + " " + this.userProject.role_id.name + " USLand";
        if (res.filter((item) => item.keys == temp).length != 0) {
          constant["keys"] = temp;
          res = res.filter((item) => item.project_id.id == constant.project_id.id && item.keys == constant.keys);
          if (res && res.length > 0) {
            this.router.navigate([res[0]["value"]], { relativeTo: this.route });
          }
        } else if (res.filter((item) => item.keys == this.userProject.role_id.name + " Land").length != 0) {
          res = res.filter((item) => item.project_id.id == constant.project_id.id && item.keys == constant.keys);
          this.router.navigate([res[0]["value"]], { relativeTo: this.route });
        }
      },
      (error) => {
        this.messageService.error("unable to fetch mapping", "LEAP");
      }
    );
  }
  navigateUrl(url: string) {
    if (url.includes("http")) {
      window.open(url);
    } else
      this.router.navigate([url], { relativeTo: this.route });
  }

  fetchPortfolioPoject() {
    try {
      this.project = JSON.parse(sessionStorage.getItem("project") || '').name;
      this.portfolio = JSON.parse(sessionStorage.getItem("portfoliodata") || '').portfolioName;
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }
  }
}
