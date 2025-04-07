// import { HttpEventType } from "@angular/common/http";
import { Component, Output, EventEmitter, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { RaiservicesService } from "projects/aip-app/src/app/services/raiservices.service";
import { Services } from "projects/aip-app/src/app/services/service";

// interface FileUpload {
//     file: File;
//     progress: number;
//     uploaded: boolean;
// }

@Component({
    selector: 'dialog-create',
    templateUrl: 'dialog-create.html',
    styleUrls: ['./common-create.component.scss']
})
export class CommonCreateDialogComponent {
    @Output() reloads = new EventEmitter<boolean>();
    // files: FileUpload[] = [];
    customCreateName = this.data?.customCreateName;
    constructor(
        public dialogRef: MatDialogRef<CommonCreateDialogComponent>,
        private service: Services,
        private raiService: RaiservicesService,
        @Inject(MAT_DIALOG_DATA) public data: any) { }


    createLink(childId: any, childType: any) {
        let relatedbody = [];
        relatedbody.push({
            parentId: Number(this.data?.initiativeId),
            parentType: 'INITIATIVE',
            childId: childId,
            childType: childType,
        });
        this.service.createlinkage(relatedbody).subscribe((val) => {
            if (val.status == 200) {
                this.service.message('Successful', 'success');
                this.dialogRef.close();
                this.raiService.changeData(true);
                this.reloads.emit(true);
            } else {
                this.service.message(val, 'error');
            }
            // this.raiService.changeData(true);
        });
    }

    responseLink($event) {
        console.log($event);
        if (this.data?.mainItems == 'Connection') {
            this.createLink($event.body.id, 'CONNECTION');
        }
        if (this.data?.mainItems == 'Dataset') {
            this.createLink($event.id, 'DATASET');
        }
        if (this.data?.mainItems == 'Pipeline') {
            this.createLink($event.cid, 'PIPELINE');
        }
        if (this.data?.mainItems == 'Model') {
            this.createLink($event.body.id, 'MODEL');
        }
        if (this.data?.mainItems == 'Endpoint') {
            this.createLink($event.body.id, 'ENDPOINT');
        }
        if (this.data?.mainItems == 'App') {
            this.createLink($event.id, 'App');
        }
    }

    // onFileSelected(event: Event): void {
    //     const target = event.target as HTMLInputElement;
    //     if (target.files) {
    //         for (let i = 0; i < target.files.length; i++) {
    //             const file = target.files[i];
    //             this.files.push({ file, progress: 0, uploaded: false });
    //             this.uploadFile(this.files.length - 1);
    //         }
    //     }
    // }

    // uploadFile(index: number): void {
    //     const uploadData = new FormData();
    //     uploadData.append('file', this.files[index].file, this.files[index].file.name);
    //     this.service.uploadFileToServer(uploadData).subscribe(event => {
    //         if (event.type === HttpEventType.UploadProgress) {
    //             this.files[index].progress = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
    //         } else if (event.type === HttpEventType.Response) {
    //             this.files[index].uploaded = true;
    //         }
    //     })
    //     // this.http.post('YOUR_UPLOAD_URL_HERE', uploadData, {
    //     //   reportProgress: true,
    //     //   observe: 'events',
    //     //   headers: new HttpHeaders({
    //     //     'enctype': 'multipart/form-data'
    //     //   })
    //     // }).subscribe(event => {
    //     //   if (event.type === HttpEventType.UploadProgress) {
    //     //     this.files[index].progress = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
    //     //   } else if (event.type === HttpEventType.Response) {
    //     //     this.files[index].uploaded = true;
    //     //   }
    //     // });

    // }

    // deleteFile(index: number): void {
    //     this.files.splice(index, 1);
    // }
}