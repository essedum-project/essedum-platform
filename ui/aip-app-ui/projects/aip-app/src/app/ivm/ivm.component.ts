import { Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LedsModalService } from 'leds-lib';
import { Services } from '../services/service';
import { Subscription } from 'rxjs';
import { RaiservicesService } from 'projects/aip-app/src/app/services/raiservices.service';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-ivm',
  templateUrl: './ivm.component.html',
  styleUrls: ['./ivm.component.scss'],
})
export class IvmComponent implements OnInit {
  base: any = 'assets/images/ivm_base.png';
  @ViewChild('scrollableDiv', { read: ElementRef })
  public scrollableDiv: ElementRef<any>;
  div: any;
  data: any = [];
  deleteInitiative: boolean;
  viewOnlyMyInitiatives = false;

  constructor(
    private modalService: LedsModalService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private cdref: ChangeDetectorRef,
    private service: Services,
    private raiservice: RaiservicesService,
    private dialog: MatDialog
  ) {}
  ngOnInit(): void {
    // sessionStorage.setItem('aip.breadcrumb', JSON.stringify(this.bc));
    sessionStorage.setItem('sbxBreadcrumb', null);
    this.authorization();
  }
  toInbox() {
    this.router.navigate(['./inbox'], {
      relativeTo: this.route,
    });
  }
  toConfigTemplate() {
    this.router.navigate(['./activityTemplate'], {
      relativeTo: this.route,
    });
  }
  viewAll() {
    this.router.navigate(['./viewAll'], {
      relativeTo: this.route,
    });
  }
  toviewInitiative(name: any, id: any) {
    this.router.navigate(['./viewinitiative/' + id + '/' + name], {
      relativeTo: this.route,
    });
    sessionStorage.setItem('initiativeId', JSON.stringify(id));
  }
  navigateToSearch() {
    this.router.navigate(['./searchAll'], {
      relativeTo: this.route,
    });
  }

  scrollLeft(): void {
    this.scrollableDiv.nativeElement.scrollTo({
      left: this.scrollableDiv.nativeElement.scrollLeft - 150,
      behavior: 'smooth',
    });
  }
  scrollRight() {
    this.scrollableDiv.nativeElement.scrollTo({
      left: this.scrollableDiv.nativeElement.scrollLeft + 150,
      behavior: 'smooth',
    });
  }
  open(content: any): void {
    this.modalService.openModal(content, 'standard');
  }
  modalClose(event: any) {
    // this.ngOnInit();
    this.modalService.dismissAll('close the modal');
    setTimeout(() => {
      this.data = [];
      this.initiativeList();
    }, 250);
  }
  initiativeList() {
    if (!this.viewOnlyMyInitiatives)
      this.raiservice.initiativeList(0, 5).subscribe((res: any) => {
        this.data = res;
      });
    else {
      this.raiservice.ViewOnlyMyInitiativeList(0, 5).subscribe((res: any) => {
        this.data = res;
      });
    }
  }
  refreshComplete() {
    this.ngOnInit();
  }
  authorization() {
    this.service.getPermission('cip').subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes('delete-initiative'))
          this.deleteInitiative = true;
        if (cipAuthority.includes('view-only-my-initiatives'))
          this.viewOnlyMyInitiatives = true;
        this.initiativeList();
      },
      (error) => {
        console.log(
          `error when calling getPermission method. Error Details:${error}`
        );
      }
    );
  }
  deleteInitiativeById(intiative) {
    let id = intiative.id;
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.raiservice.deleteInitiative(id).subscribe((res: any) => {
          if (res.status == 200) {
            this.service.message(res.data, 'success');
          } else {
            this.service.message(res.data, 'error');
          }
          this.refreshComplete();
        });
      }
    });
  }
}
