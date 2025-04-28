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
// Template pack-angular:web/src/app/-entities/entity-list.component.ts.e.vm
//
import { Component, Input, Output, OnChanges, EventEmitter, SimpleChanges, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { PageResponse } from "../../support/paging";
import { MessageService } from "../../services/message.service";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ConfirmDeleteDialogComponent } from "../../support/confirm-delete-dialog.component";
import { Role } from "../../models/role";
import { RoleDetailComponent } from "./role-detail.component";
import { RoleService } from "../../services/role.service";
import { HelperService } from "../../services/helper.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { RoleDetailNewComponent } from "./role-detail-new.component";
import { LeapTelemetryService } from "../../telemetry-util/telemetry.service";
import { OpenTelemetryService } from "../../telemetry-util/open-telemetry.service";
@Component({
    //moduleId: module.id,
    templateUrl: "role-detail-list.component.html",
    selector: "role-detail-list",
})
export class RoleDetailListComponent implements OnInit, OnDestroy {
    @Input() header = "Roles...";

    // When 'sub' is true, it means this list is used as a one-to-many list.
    // It belongs to a parent entity, as a result the addNew operation
    // must prefill the parent entity. The prefill is not done here, instead we
    // emit an event.
    // When 'sub' is false, we display basic search criterias
    @Input() sub: boolean;
    @Output() onAddNewClicked = new EventEmitter();

    roleToDelete: Role;
    displayedColumns: string[] = ["name", "description", "actions"];
    RoleList: MatTableDataSource<any>;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    //foreign key dependencies
    // basic search criterias (visible if not in 'sub' mode)
    example: Role = new Role();

    // list is paginated
    currentPage: PageResponse<Role> = new PageResponse<Role>(0, 0, []);

    constructor(
        public router: Router,
        public roleService: RoleService,
        public messageService: MessageService,
        public confirmDeleteDialog: MatDialog,
        public confirmDialog: MatDialog,
        public helperService: HelperService,
        private telemetryService: LeapTelemetryService,
        private openTelemetryService: OpenTelemetryService
    ) { }

    /**
     * When used as a 'sub' component (to display one-to-many list), refreshes the table
     * content when the input changes.
     */

    ngOnInit() {
        this.telemetryImpression();
        this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null, filters: null, multiSortMeta: null });
    }

    ngOnDestroy(): void {
        let activeSpan = this.openTelemetryService.fetchActiveSpan();
        this.openTelemetryService.endTelemetry(activeSpan);
    }

    telemetryImpression() {
        // this.telemetryService.impression("iamp-usm", "detail", "RoleDetailListComponent");
        this.openTelemetryService.startTelemetry("iamp-usm", "RoleDetailListComponent", "detail");
    }

    ngOnChanges(changes: SimpleChanges) {
        this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null, filters: null, multiSortMeta: null });
    }

    /**
     * Invoked when user presses the search button.
     */
    search() {
        if (!this.sub) {
            this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: 1, filters: null, multiSortMeta: null });
        }
    }

    /**
     * Invoked while inititializing component to fetch datatable.
     */
    loadPage(event) {
        this.roleService.findAll(this.example, event).subscribe(
            (pageResponse) => {
                (this.currentPage = pageResponse), (this.RoleList = new MatTableDataSource(this.currentPage.content));
                this.RoleList.paginator = this.paginator;
            },
            (error) => this.messageService.error("Could not get the results", "IAMP")
        );
    }

    onRowSelect(event: any) {
        let id = event.id;
        this.router.navigate(["/role", id]);
    }

    addNew() {
        let dialogRef = this.confirmDialog.open(RoleDetailNewComponent, {
            disableClose: true,
            height: "50vh",
            width: "54vw",
        });
        dialogRef.afterClosed().subscribe((result) => {
            this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null, filters: null, multiSortMeta: null });
        });
    }
    editRole(user) {
        let dialogRef = this.confirmDialog.open(RoleDetailNewComponent, {
            disableClose: true,
            height: "50vh",
            width: "54vw",
            data: user.id,
        });
        dialogRef.afterClosed().subscribe((result) => {
            this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null, filters: null, multiSortMeta: null });
        });
    }

    showDeleteDialog(rowData: any) {
        let roleToDelete: Role = <Role>rowData;

        let dialogRef = this.confirmDeleteDialog.open(ConfirmDeleteDialogComponent);
        dialogRef.afterClosed().subscribe((result) => {
            if (result === "delete") {
                this.delete(roleToDelete);
            }
        });
    }

    private delete(roleToDelete: Role) {
        let id = roleToDelete.id;

        this.roleService.delete(id).subscribe(
            (response) => {
                this.currentPage.remove(roleToDelete);
                this.messageService.info("Deleted OK", "IAMP!");
            },
            (error) => this.messageService.error("Could not delete!", "IAMP")
        );
    }
    rowSelected(item: Role) {
        this.router.navigate(["/role-view", item.id]);
    }
    setSelectedEntities(event) { }
}
