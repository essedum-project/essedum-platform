import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-app-navigation',
    templateUrl: './app-navigation.component.html',
    styleUrls: ['./app-navigation.component.scss'],
    standalone: false
})
export class AppNavigationComponent implements OnInit {

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
  ) { }
  url: SafeResourceUrl;
  showFlag: boolean = false;

  ngOnInit(): void {
    const routeData = this.route.snapshot.data;
    let unsafeUrl = routeData['iframeUrl'] || sessionStorage.getItem("seclevelroute");
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
    if (!unsafeUrl || unsafeUrl == "./" || unsafeUrl == "undefined") {
      this.showFlag = true;
    } else {
      this.showFlag = false;
    }
  }

}
