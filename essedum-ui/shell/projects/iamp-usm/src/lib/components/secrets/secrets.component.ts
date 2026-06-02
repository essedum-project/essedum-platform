import { HttpParams } from "@angular/common/http";
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
  SimpleChanges,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "../../services/message.service";
import { SecretService } from "../../services/secret.service";
import { DeleteComponent } from "../../shared-modules/confirm-delete/delete.component";
import { SecretAddComponent } from "./secret-add/secret-add.component";
import { debounceTime, Observable, Subject } from "rxjs";

@Component({
  selector: "lib-secrets",
  templateUrl: "./secrets.component.html",
  styleUrls: ["./secrets.component.css"],
})
export class SecretsComponent {
  showList: boolean = true;
  dashConstantList: MatTableDataSource<any> = new MatTableDataSource();

  displayedColumns: string[] = ["#", "Id", "Keys", "Actions"];
  showCreate: boolean = false;
  configureTheme: boolean = false;
  edit: boolean = false;
  view: boolean = false;
  type: string;
  keys: string = "";
  keyId: any;
  passcode: string = "";
  pageNumber: number = 0;
  pageSize: number = 10;
  data: any = [];
  showPass: boolean;
  hidePass: boolean = true;
  title: string;
  showLoader: boolean;
  search: string = "";
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = [5, 10, 20];
  noOfItems: number;
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  lastRefreshedTime: Date | null = null;
  pagedRoles: any[] = [];
  secretContent: any = [];
  organization: string;
  filterKey = "";
  hoverStates: boolean[] = [];
  page: number = 0;
  rowsPerPage: number = 5;
  totalrecords: number = 0;
  lastPage: number = 0;
  searchSubject = new Subject<string>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confirmDialog: MatDialog,
    private secretsService: SecretService,
    public messageService: MessageService,
    private changeDetectionRef: ChangeDetectorRef,
    public dialog: MatDialog
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.organization) this.refreshComplete();
  }

  ngOnInit() {
    try {
      this.organization = sessionStorage.getItem("organization");
    } catch (e) {
      this.organization = null;
      console.error("Unable to access sessionStorage:", e);
    }
    this.pageSize = this.itemsPerPage[0];
    this.pageNumber = 1;
    this.getCountBySearch();
    this.getList();
    this.indexChanged();
    this.route.params.subscribe((params) => {
      this.type = params["type"];
    });
    if (this.type == "edit") {
      this.route.params.subscribe((params) => {
        this.keys = params["key"];
      });
      this.showCreate = true;
      this.edit = true;
      this.showLoader = true;
      this.secretsService.getPasscode(this.keys).subscribe(
        (res: any) => {
          this.showLoader = false;
          this.hidePass = true;
          this.passcode = res;
        },
        (error) => {
          // this.showPass=false;
        }
      );
    }
    console.log("data", this.data);
    this.dashConstantList = this.data;
    this.lastRefreshTime();

    this.searchSubject
      .pipe(
        debounceTime(300) // wait 300ms after last keystroke
      )
      .subscribe((searchText) => {
        this.filterItem(searchText);
      });
  }

  indexChanged() {
    if (this.pageNumberChanged) {
      this.pageNumber = 1;
      this.startIndex = 0;
      this.endIndex = 5;
    }
  }
  nextPage() {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      this.changePage();
    }
  }

  prevPage() {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.changePage();
    }
  }

  changePage(page?: number) {
    if (page && page >= 1 && page <= this.noOfPages) this.pageNumber = page;
    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      this.pageChanged.emit(this.pageNumber);
      if (this.pageNumber > 5) {
        this.endIndex = this.pageNumber;
        this.startIndex = this.endIndex - 5;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }
    }
    this.getList();
  }

  rowsPerPageChanged() {
    if (this.pageSize == 0) {
      this.pageSize = this.prevRowsPerPageValue;
    } else {
      this.pageSizeChanged.emit(this.pageSize);
      this.prevRowsPerPageValue = this.pageSize;
      this.changeDetectionRef.detectChanges();
    }
  }

  onSearchInput(event: any) {
    this.searchSubject.next(event.target.value);
  }

  filterItem(searchText: string) {
    this.search = searchText?.toLowerCase().trim() || "";

    if (!this.search) {
      this.refreshComplete();
      return;
    }

    this.noOfPages = 0;
    this.noOfItems = 0;
    this.getList();
    this.getCountBySearch();
  }

  getList(): void {
    this.data = [];
    let param: HttpParams = new HttpParams()
      .set("page", this.pageNumber)
      .set("size", this.pageSize)
      .set("search", this.search)
      .set("project", sessionStorage.getItem("organization"));

    this.secretsService.getSecretsList(param).subscribe((res) => {
      this.data = res || [];
      this.dashConstantList = this.data; // just set data
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
      this.pageSize = this.pageSize || 5;
      this.lastRefreshTime();
    });
  }
  getCount() {
    this.secretsService.getSecreteCount().subscribe((res) => {
      console.log("count", res);
      this.noOfItems = res;
    });
  }

  getCountBySearch() {
    let param: HttpParams = new HttpParams();
    param = param.set("search", this.search.toString());
    this.secretsService.getSecreteCountBySearch(param).subscribe((res) => {
      this.noOfItems = res;
    });
  }

  editKey(secret: any) {
    this.router.navigate([secret.key + "/edit"], { relativeTo: this.route });
  }

  deleteKey(secrets: any) {
    let dialogRef = this.confirmDialog.open(DeleteComponent, {
      disableClose: true,
      width: "30%",
      data: {
        title: "Delete Secret key",
        message:
          "Are you sure do you want to delete the secret named '" +
          secrets.key +
          " ?",
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === "yes") {
        this.secretsService.deleteKey(secrets.key).subscribe(
          (resp) => {
            this.messageService.messageNotification(
              `Secret Key Deleted Successfully`
            );
            this.refreshComplete();
          },
          (error) => {
            this.messageService.messageNotification(
              `Error while deleting ${error}`,
              "error"
            );
          }
        );
      }
    });
  }

  optionChange(event: Event) {
    let i: number = event.target["selectedIndex"];
    this.pageSize = this.itemsPerPage[i];
    this.pageNumber = 1;
    this.getList();
  }

  selectedButton(i) {
    if (i == this.pageNumber) return { color: "white", background: "#7b39b1" };
    else return { color: "black" };
  }

  createView() {
    this.showCreate = true;
    this.edit = false;
  }

  createSecretKey() {
    const dialogRef = this.dialog.open(SecretAddComponent, {
      height: "67%",
      width: "50%",
      disableClose: true,
      data: {
        edit: false,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshComplete();
      }
    });
  }

  editSecretKey(secret: any) {
    this.getPasscode(secret).subscribe({
      next: (response) => {
        this.showLoader = false;
        this.hidePass = true;
        this.passcode = response;
        this.openEditDialog(secret);
      },
      error: (error) => {
        this.showLoader = false;
        console.error("Error fetching passcode:", error);
      },
    });
  }

  getPasscode(value): Observable<any> {
    return this.secretsService.getPasscode(value.key);
  }

  openEditDialog(secret) {
    const dialogRef = this.dialog.open(SecretAddComponent, {
      height: "67%",
      width: "50%",
      disableClose: true,
      data: {
        edit: true,
        passcode: this.passcode,
        secret,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshComplete();
      }
    });
  }

  viewSecretKey(secret: any) {
    const dialogRef = this.dialog.open(SecretAddComponent, {
      height: "67%",
      width: "50%",
      disableClose: true,
      data: {
        view: true,
        secret,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshComplete();
      }
    });
  }

  onCreate() {
    this.secretsService.createKey(this.keys, this.passcode).subscribe(
      (res) => {
        this.messageService.messageNotification(`${res}, ${res.body}`);
        this.listView();
        this.refreshComplete();
      },
      (err) => {
        console.log(err);
        this.messageService.messageNotification(`Error ${err}`, "error");
      }
    );
  }

  onUpdate() {
    this.secretsService
      .updateKey(this.keys, this.passcode)
      .subscribe((res: any) => {
        this.messageService.messageNotification(`Updated Successfully ${res}`);
        this.hideValue();
      });
  }

  getValue() {
    this.hidePass = false;
    this.showPass = true;
  }

  hideValue() {
    this.hidePass = true;
    this.showPass = false;
  }

  listView() {
    if (this.edit) {
      this.refreshComplete();
      this.router.navigate(["../../"], { relativeTo: this.route });
    }
    this.showCreate = false;
  }

  onClear() {
    this.keys = "";
    this.passcode = "";
  }

  refreshComplete() {
    this.search = "";
    this.onClear();
    this.noOfPages = 0;
    this.getCountBySearch();
    setTimeout(() => {
      this.getList();
    }, 500);
    this.lastRefreshTime();
  }

  lastRefreshTime() {
    setTimeout(() => {
      this.lastRefreshedTime = new Date();
    }, 1000);
  }

  getRowNumber(index: number): number {
    return this.pageNumber * this.rowsPerPage + index + 1 - this.rowsPerPage;
  }
}
