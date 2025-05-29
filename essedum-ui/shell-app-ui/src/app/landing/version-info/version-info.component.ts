import { Component, OnInit,Inject} from "@angular/core";
import { MAT_DIALOG_DATA,MatDialogRef } from "@angular/material/dialog";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";



@Component({
  selector: "lib-version-info",
  templateUrl: "./version-info.component.html",
  styleUrls: ["./version-info.component.css"],
})
export class VersionInfoComponent implements OnInit {
 
    constructor( 
    public dialogRef: MatDialogRef<VersionInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer,
    public https: HttpClient){
      
    }

    urlsafe: SafeResourceUrl;
    isReportPresent: boolean = false;

    ngOnInit(){
      this.buildReports();
    }

    close(){
      this.dialogRef.close();
    }
    
    buildReports() {
      this.https.get("../dependency.html", { responseType: "text" }).subscribe(
        (data) => {
          this.isReportPresent = true;
          this.urlsafe = this.sanitizer.bypassSecurityTrustHtml(data);
        },
        (error) => {
          this.isReportPresent = false;
        }
      );
    }

    scrollTo(element: any): void {
      (document.getElementById(element) as HTMLElement).scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
    }
}

