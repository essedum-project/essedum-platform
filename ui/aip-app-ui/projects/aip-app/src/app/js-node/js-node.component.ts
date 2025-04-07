import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Element } from '../sharedModule/pipeline-model/canvas';
import { MatDialog } from '@angular/material/dialog';
import { ModalViewEditPropertiesComponent } from '../pipeline.description/modal-view-edit-properties/modal-view-edit-properties.component';
import { LeapTelemetryService } from 'com-lib-util';


@Component({
  selector: 'app-js-node',
  templateUrl: './js-node.component.html',
  styleUrls: ['./js-node.component.scss']
})
// export class JsNodeComponent {

// }
export class JsNodeComponent implements OnInit {
  @Input() element: Element;
  @Input() pipelineArg: any;
  @Input() name: String = '';
  @Input() savenode: any;
  @Output() delete = new EventEmitter<Element>();
  @Output() save = new EventEmitter<Element>();

  constructor(
    private telemetryService: LeapTelemetryService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.telemetryImpression();    
    
  }

  telemetryImpression() {
    this.telemetryService.start();
    this.telemetryService.impression("aip-app", "list", "JsNodeComponent");
  }

  getPosition_x() {
    return this.element.position_x + 'px';
  }

  getPosition_y() {
    return this.element.position_y + 'px';
  }
  
  onViewEditElementPropertiesClick(e:any) {
    const dialogRef = this.dialog.open(ModalViewEditPropertiesComponent, {
        width: '60%',
        height: '90%',
        disableClose: true,
        data: {
            element: this.element,
            name : this.name,
            pipelineArg : this.pipelineArg,
        }
    });
    dialogRef.afterClosed().subscribe(result => {
       if (result.action === 'delete') {
        this.delete.emit(result.element);
      }
      if (result.action === 'save') {
        this.save.emit(result);
      }
      if (result.action === 'create'){
        this.save.emit(result);
      }
      
    });
  }

  formatValue(val: string) {
    if (val) {
      return val
        .split(/(?=[A-Z])/)
        .join(' ').substring(0, 30);
    }
    else
      return 'undefined'
  }
}

