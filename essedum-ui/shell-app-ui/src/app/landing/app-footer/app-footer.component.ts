import { Component, OnInit } from '@angular/core';
import { ApisService } from '../../services/apis.service';


@Component({
  selector: 'app-footer',
  templateUrl: './app-footer.component.html',
  styleUrls: ['./app-footer.component.scss']
})
export class AppFooterComponent implements OnInit {

  constructor(
    private licenseService: ApisService,
  ) { }
  numberOfDays :any;
  isColor: boolean;
  leapAppYear = "2024";
  footerHeight: any = "3.6vw";
  footerTextSize: any = "1vw";

  ngOnInit(): void {

    if(sessionStorage.getItem("leapAppYear") != "" || sessionStorage.getItem("leapAppYear") != undefined){
      this.leapAppYear = sessionStorage.getItem("leapAppYear");
    }

    this.licenseService.getLicenseConfigResource().subscribe(
    (res) =>{
      this.numberOfDays=res;
    
      if (this.numberOfDays<= -1){
        window.location.href=sessionStorage.getItem("contextPath")+'licenseexpired.html';
      }
    }
    
    )
    let clientWidth = document.documentElement.clientWidth;
    let screenChangeRatio = window.outerWidth/screen.width;
    let screenMultiple = window.outerWidth/ window.document.documentElement.clientWidth;
    let minOfClientDimension = clientWidth * screenChangeRatio;
    this.footerHeight = ((minOfClientDimension * 3.2) / 100) * (screenMultiple) + 'px';
    //document.documentElement.style.setProperty("--footerHeight",this.footerHeight);
    // this.footerTextSize = ((minOfClientDimension * 1) / 100) * (screenMultiple) + 'px';
    // document.documentElement.style.setProperty("--footerTextSize", this.footerTextSize);
  }
}

