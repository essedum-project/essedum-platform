import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { log } from "console";
import { ApisService } from "src/app/services/apis.service";

@Component({
  selector: "app-notification-menu",
  templateUrl: "./notification-menu.component.html",
  styleUrls: ["./notification-menu.component.scss"],
})
export class NotificationMenuComponent implements OnInit {
  scrollConfig = {
    suppressScrollX: true,
    wheelSpeed: 4,
    minScrollbarLength: 20,
    maxScrollbarLength: 80,
  };
  notificationForYou = [];
  totalElements: number = 0;
  lazyloadevent = {
    first: 0,
    rows: 1000,
    sortField: null,
    sortOrder: null,
  };
  locations = [
    { value: "Informations", viewValue: "Informations" },
    { value: "Actions", viewValue: "Actions" },
  ];
  selectedLocation = "Informations";
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private apisService: ApisService
  ) {}
  selectCard = (eventObj: any) => {
    const temp = eventObj.target.closest(".DSA_selectionCard").classList;
    temp.contains("DSA_active")
      ? temp.remove("DSA_active")
      : temp.add("DSA_active");
  };
  ngOnInit(): void {
    console.log("NotificationMenuComponent");
    this.getNotificationData();
  }
  getNotificationData() {
    let roleId = JSON.parse(sessionStorage.getItem("role") || "").id;
    let notify: any = new Object();
    notify.readFlag = false;
    notify.roleId = roleId;
    this.apisService
      .findAllNotifications(notify, this.lazyloadevent)
      .subscribe((res: any) => {
        console.log(res);
        this.totalElements = res.totalElements;
        res.content.forEach((element: any) => {
          if (element.dateTime) {
            let isoDate = element.dateTime;
            let date = new Date(isoDate);
            let istDate = date.toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            });
            element["actualDate"] = element.dateTime;
            element.dateTime = istDate;
          }
          this.notificationForYou.push(element);
        });
      });
  }
  navigate(data: any) {
    console.log(data);
    console.log(this.router.url);
    data.readFlag = true;
    let user = JSON.parse(sessionStorage.getItem("user") || "");
    data.userId = user.id;
    data.dateTime = data["actualDate"];
    console.log(data);
    delete data["actualDate"];
    console.log(data);
    this.apisService.updateNotification(data).subscribe((res: any) => {
      console.log(res);
      this.getNotificationData();
      this.router.navigate([data.actionLink], {
        relativeTo: this.route,
      });
    });
  }
}
