import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ApisService } from "../../services/apis.service";
import { MessageService } from "../../services/message.service";
@Component({
 selector: "app-static-landing",
 templateUrl: "./static-landing.component.html",
 styleUrls: ["./static-landing.component.css"],
})
export class StaticLandingComponent implements OnInit {
 constructor(
  // private broadcasterdashService:BroadcasterService,
  // private dashservice:DashConstantService,
  private router: Router,
  private routing: ActivatedRoute,
  private apisService: ApisService,
  private message: MessageService
 ) {}
 data: boolean = false;
 lazyloadevent = {
  first: 0,
  rows: 1000,
  sortField: null,
  sortOrder: 1,
  filters: null,
  multiSortMeta: null,
 };
 href1: any;
 href2: any;
 href3: any;
 href4: any;
 href5: any;
 href6: any;
 href7: any;
 href8: any;
 imghref: any;
 hrefn1: any;
 hrefn2: any;
 hrefn3: any;
 hrefn4: any;
 hrefn5: any;
 hrefn6: any;
 hrefn7: any;
 hrefn8: any;
 hrefi1: any;
 hrefi2: any;
 hrefi3: any;
 hrefi4: any;
 hrefi5: any;
 hrefi6: any;
 hrefi7: any;
 hrefi8: any;

 ngOnInit() {
  let pid;
  try{
    pid = JSON.parse(sessionStorage.getItem("project")).id;
  } catch (e) {
  console.error("JSON.parse error - ", e["message"]);
  }
  
  // this.broadcasterdashService.backgroundColorEnabled("true");
  this.apisService.getDashConsts().subscribe((res) => {
   res.forEach((item) => {
    if (item.project_id != null && item.project_id.id == pid && item.keys == "static") {
        let value;
        try{
          value = JSON.parse(item.value);
        } catch (e) {
        console.error("JSON.parse error - ", e["message"]);
        }
     this.imghref = value;
     this.data = true;
    }
    if (this.data) {
     if (this.imghref != undefined) {
      this.href1 = this.imghref.img1;
      this.href2 = this.imghref.img2;
      this.href3 = this.imghref.img3;
      this.href4 = this.imghref.img4;
      this.href5 = this.imghref.img5;
      this.href6 = this.imghref.img6;
      this.href7 = this.imghref.img7;
      this.href8 = this.imghref.img8;
      this.hrefn1 = this.imghref.imgn1;
      this.hrefn2 = this.imghref.imgn2;
      this.hrefn3 = this.imghref.imgn3;
      this.hrefn4 = this.imghref.imgn4;
      this.hrefn5 = this.imghref.imgn5;
      this.hrefn6 = this.imghref.imgn6;
      this.hrefn7 = this.imghref.imgn7;
      this.hrefn8 = this.imghref.imgn8;
      this.hrefi1 = this.imghref.imgi1;
      this.hrefi2 = this.imghref.imgi2;
      this.hrefi3 = this.imghref.imgi3;
      this.hrefi4 = this.imghref.imgi4;
      this.hrefi5 = this.imghref.imgi5;
      this.hrefi6 = this.imghref.imgi6;
      this.hrefi7 = this.imghref.imgi7;
      this.hrefi8 = this.imghref.imgi8;
     }
    } else {
     this.hrefn1 = "Business Control Center";
     this.hrefn2 = "Sell Dashboard";
     this.hrefn3 = "IIMS";
     this.hrefn4 = "Operation Dashboard";
     this.hrefn5 = "Friction Diagnostics";
     this.hrefn6 = "Nexthink";
     this.hrefn7 = "Service Management Dashboard";
     this.hrefn8 = "Infosys CyberGaze";
     this.hrefi1 = "./assets/images/static1.PNG";
     this.hrefi2 = "./assets/images/static2.PNG";
     this.hrefi3 = "./assets/images/static3.PNG";
     this.hrefi4 = "./assets/images/static4.PNG";
     this.hrefi5 = "./assets/images/static5.PNG";
     this.hrefi6 = "./assets/images/static6.PNG";
     this.hrefi7 = "./assets/images/static7.PNG";
     this.hrefi8 = "./assets/images/static8.PNG";
    }
   });
  });
 }

 pageroute(i) {
  let route: any;
  if (this.data) {
   if (i == 1) {
    route = this.href1;
   }
   if (i == 2) {
    route = this.href2;
   }
   if (i == 3) {
    route = this.href3;
   }
   if (i == 4) {
    route = this.href4;
   }
   if (i == 5) {
    route = this.href5;
   }
   if (i == 6) {
    route = this.href6;
   }
   if (i == 7) {
    route = this.href7;
   }
   if (i == 8) {
    route = this.href8;
   }
   if (route.startsWith("http")) {
    window.open(route);
   } else {
    this.router.navigate([route]);
   }
  } else {
   this.message.info("Default Page, Please Create Mapping", "LEAP");
  }
 }
}
