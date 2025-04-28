//
// Copyright © 2016-2017 Infosys Limited, Bangalore, India. All Rights Reserved.
// * Except for any open source software components embedded in this
// * Infosys proprietary software program (Program), this Program is protected
// * by copyright laws, international treaties and other pending or existing
// * intellectual property rights in India, the United States and other countries.
// * Except as expressly permitted, any unauthorized reproduction, storage,
// * transmission in any form or by any means (including without limitation
// * electronic, mechanical, printing, photocopying, recording or otherwise),
// * or any distribution of this Program, or any portion of it,
// * may result in severe civil and criminal penalties, and
// * will be prosecuted to the maximum extent possible under the law.
// Template pack-angular:web/src/app/base-entities/entity-detail.component.ts.e.vm
//
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, Inject } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { DatePipe } from "@angular/common";
import { MessageService } from "../../services/message.service";
import { Role } from "../../models/role";
import { RoleService } from "../../services/role.service";
import { HelperService } from "../../services/helper.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { LeapTelemetryService } from "../../telemetry-util/telemetry.service";
import { OpenTelemetryService } from "../../telemetry-util/open-telemetry.service";
@Component({
 //moduleId: module.id,
 templateUrl: "role-detail-new.component.html",
 providers: [DatePipe],
 selector: "role-detail-new",
})
export class RoleDetailNewComponent implements OnInit, OnDestroy {
 role: Role;
 private params_subscription: any;
 edit: boolean;

 @Input() sub: boolean = false;
 @Output() onSaveClicked = new EventEmitter<Role>();
 @Output() onCancelClicked = new EventEmitter();

 constructor(
  public route: ActivatedRoute,
  private dialogRef: MatDialogRef<RoleDetailNewComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any,
  public router: Router,
  public messageService: MessageService,
  public helperService: HelperService,
  public elementRef: ElementRef,
  public roleService: RoleService,
  private telemetryService: LeapTelemetryService,
  private openTelemetryService: OpenTelemetryService
 ) {}

 ngOnInit() {
  this.telemetryImpression();
  if (this.sub) {
   return;
  }

  this.params_subscription = this.route.params.subscribe((params) => {
   let id = params["id"];

   if (this.data) {
    this.edit = true;
    this.roleService.getRole(this.data).subscribe(
     (role) => {
      this.role = role;
     },
     (error) => this.messageService.error("ngOnInit error", "IAMP")
    );
   } else {
    this.edit = false;
    this.role = new Role();
   }
  });
 }

 telemetryImpression() {
//   this.telemetryService.impression("iamp-usm", "detail", "RoleDetailNewComponent");
  this.openTelemetryService.startTelemetry("iamp-usm", "RoleDetailNewComponent", "detail");
 }

 ngOnDestroy() {
    let activeSpan = this.openTelemetryService.fetchActiveSpan();
    this.openTelemetryService.endTelemetry(activeSpan);
    if (!this.sub) {
    this.params_subscription.unsubscribe();
    }
 }

 onSave() {
  if (this.edit) {
   this.onUpdate();
  } else {
   this.roleService.create(this.role).subscribe(
    (role) => {
     this.role = new Role();
     if (this.sub) {
      this.onSaveClicked.emit(this.role);
      this.messageService.info("Saved OK and msg emitted", "IAMP");
     } else {
      this.messageService.info("Saved OK", "IAMP");
      //this.router.navigate(['/role-list']);
     }
    },
    (error) => this.messageService.error("Could not save", "IAMP")
   );
  }
 }

 onUpdate() {
  this.roleService.update(this.role).subscribe(
   (role) => {
    this.role = role;
    if (this.sub) {
     this.onSaveClicked.emit(this.role);
     this.messageService.info("Updated OK and msg emitted", "IAMP");
    } else {
     this.messageService.info("Updated OK", "IAMP");
    }
   },
   (error) => this.messageService.error("Could not update", "IAMP")
  );
 }

 onCancel() {
  if (this.sub) {
   this.onCancelClicked.emit("cancel");
   this.messageService.info("Cancel clicked and msg emitted", "IAMP");
  }
 }
 close() {
  this.dialogRef.close();
 }
}
