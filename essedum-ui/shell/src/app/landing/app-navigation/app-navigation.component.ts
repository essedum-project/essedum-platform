import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-app-navigation',
  templateUrl: './app-navigation.component.html',
  styleUrls: ['./app-navigation.component.scss']
})
export class AppNavigationComponent implements OnInit {

  constructor(
    private sanitizer: DomSanitizer,
  ) { }
  url: SafeResourceUrl;
  showFlag: boolean = false;

  ngOnInit(): void {
    let unsafeUrl = sessionStorage.getItem("seclevelroute");
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
    if (unsafeUrl == "./") {
      this.showFlag = true;
    } else {
      this.showFlag = false;
    }
  }

}
