import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LedsModalService } from 'leds-lib';
import { PipelineCreateComponent } from 'projects/aip-app/src/app/pipeline-create/pipeline-create.component';
import { Services } from 'projects/aip-app/src/app/services/service';

@Component({
  selector: 'app-common-edit',
  templateUrl: './common-edit.component.html',
  styleUrls: ['./common-edit.component.scss'],
})
export class CommonEditComponent implements OnInit {
  @Input() data;
  type: any;
  constructor(
    public dialog: MatDialog,
    private service: Services,
    private modalService: LedsModalService
  ) {}
  ngOnInit(): void {
    if (this.data.type == 'PIPELINE') {
      this.pipelineEdit(this.data.id);
    }
  }
  pipelineEdit(id: any) {
    this.service.getStreamingServices(id).subscribe(
      (pageResponse) => {
        const dialogRef = this.dialog.open(PipelineCreateComponent, {
          height: '80%',
          width: '60%',
          minWidth: '60vw',
          disableClose: true,
          data: {
            canvasData: pageResponse,
            edit: true,
          },
        });
        dialogRef.afterClosed().subscribe((result) => {
          this.modalService.dismissAll();
        });
      },
      (error) =>
        this.service.messageService('Could not get the results', 'error')
    );
  }
}
