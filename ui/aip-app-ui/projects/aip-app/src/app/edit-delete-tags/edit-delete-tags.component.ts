import { Component } from '@angular/core';
import { Services } from '../services/service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-edit-delete-tags',
  templateUrl: './edit-delete-tags.component.html',
  styleUrls: ['./edit-delete-tags.component.scss']
})
export class EditDeleteTagsComponent {
  id: any;
  filterquery: any = "";
  cardTitle: string = "Tags";
  category = [];
  tags;
  tagsBackup;
  tagId: any;
  entityId: any;
  allTags: any;
  gg: any
  tagStatus = {};
  catStatus = {};
  selectedTag = [];
  selectTag = [];
  searchtext: any='';
  createFlag: boolean = false;
  page: number = 1;
  totalItems: number = 0;
  lastPage: number = 0;
  currentPage: number = 0;
  itemsPerPage: number = 10;
  edit: boolean = false;
  flag: boolean = false;
  pp: Object[] = [];
  allTag: any = {
    label: "", category: ""
  }

  constructor(private service: Services, private router: Router, public dialogRef: MatDialogRef<EditDeleteTagsComponent>, public dialog: MatDialog,
    private route: ActivatedRoute,) {

  }
  ngOnInit(): void {
    this.pp = [];
    this.page = 1;
    this.getTags();


    console.log("categori value is:", this.category);
    // console.log("value of tag array is:",this.tags);
    // console.log("value of tagstatus array is:",this.tagStatus);
    // console.log("value of catstatus array is:",this.catStatus);

  }
  // search(event:any){
  //   this.gg.filter((e:any)=>{
  //     return e.label.includes(this.searchtext)
  //   })
  //   this.totalItems = this.gg.length;
  //   console.log("length of arry is:",this.totalItems);

  //   this.lastPage = Math.floor((this.totalItems - 1) / this.itemsPerPage)+1;

  // }
  getTags() {
    this.tags = {};

    let filteredGG = []
    this.tagsBackup = {};
    this.service.getMlTags().subscribe((resp) => {
      // this.allTags = resp;
      if (this.searchtext != '') {
        resp.forEach((tag) => {
          if (tag.label.includes(this.searchtext) ||tag.category.includes(this.searchtext)) {
            filteredGG.push(tag);
          }
        });
        this.gg = filteredGG.slice(0, this.itemsPerPage);
        this.allTags=filteredGG
      } else {
        this.gg = resp.slice(0, this.itemsPerPage);
        this.allTags=resp

      }
      this.totalItems = this.allTags.length;
      console.log("length of arry is:", this.totalItems);

      this.lastPage = Math.floor((this.totalItems - 1) / this.itemsPerPage) + 1;
      console.log("value of last page is:", this.lastPage);
      console.log("all tages are:", this.allTags);


      resp.forEach((tag) => {
        if (this.category.indexOf(tag.category) == -1) {
          this.category.push(tag.category);
        }
        this.tagStatus[tag.category + ' - ' + tag.label] = false;
      });
      this.category.forEach((cat) => {
        let ss = {
          viewValue: cat,
          value: cat
        };

        this.pp.push(ss);
        this.tags[cat] = this.allTags
          .filter((tag) => tag.category == cat)
          .slice(0, 10);
        this.tagsBackup[cat] = this.allTags.filter(
          (tag) => tag.category == cat
        );
        this.catStatus[cat] = false;
      });
    });
    console.log("categori value is last:", this.category);



  }
  filterz() {

  }
  deletetag(id: number) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.service.deleteTag(id).subscribe(res => {
          this.service.message('Deleted Sucessfully', 'success');
          this.ngOnInit();
        }, error => {
          this.service.message(JSON.stringify(error), 'error');
        });
      }
      else
        this.service.message('Could not delete the plugin', 'error');
    })
  }
  editTagName(gg) {
    this.createFlag = true;
    this.edit = false;
    this.flag = false;
    this.id = gg.id;
    this.allTag = {
      label: gg.label, category: gg.category
    }



  }

  backTolist() {
    this.createFlag = false;
    this.edit = false;
    this.flag = false;
    this.router.navigate(["../../edit-delete-tags"], {
      relativeTo: this.route,
    });

  }
  createNewLabel() {
    this.createFlag = true;
    this.edit = true;
    this.flag = false;
    this.allTag = {
      label: "", category: ""
    }
  }
  createNewCategory() {
    this.createFlag = true;
    this.flag = true;


    console.log("heloo ", this.createFlag);
  }

  saveTags() {
    if (this.allTag.label && this.allTag.category) {
      console.log("data  is", this.allTag);
      this.service.createTagLabel(this.allTag).subscribe(res => {
        this.service.message("Created Successfully", 'success');
        this.createFlag = false;
        this.allTag = { label: "", category: "" };

        this.ngOnInit()
      },
        error => {
          this.service.message(JSON.stringify(error), 'error');
        });
    }
    else {
      this.service.message('Please enter required details', 'error')
    }
  }
  saveCategory() {
    if (this.allTag.label && this.allTag.category) {
      console.log("data of category is", this.allTag);
      this.service.createTagLabel(this.allTag).subscribe(res => {
        this.service.message("Created Successfully", 'success');
        this.createFlag = false;
        this.allTag = { label: "", category: "" };

        this.ngOnInit()
      },
        error => {
          this.service.message(JSON.stringify(error), 'error');
        });
    }
    else {
      this.service.message('Please enter required details', 'error')
    }

  }

  updateTag() {
    if (this.allTag.label && this.allTag.category) {
      console.log("data  is", this.allTag);
      // console.log("id is:",this.allTag);
      this.service.updateTagLabel(this.id, this.allTag).subscribe(res => {
        this.service.message("Created Successfully", 'success');
        this.createFlag = false;
        this.allTag = { label: "", category: "" };

        this.ngOnInit()
      },
        error => {
          this.service.message(JSON.stringify(error), 'error');
        });
    }
    else {
      this.service.message('Please enter required details', 'error')
    }
  }

  updateDisplayedTags(page: number) {
    if (page == 1) {
      const startIndex = 0;
      const endIndex = Math.min(startIndex + this.itemsPerPage, this.totalItems);
      this.gg = this.allTags.slice(startIndex, endIndex);
    }
    else {
      this.currentPage = page - 1;
      const startIndex = this.currentPage * this.itemsPerPage;
      const endIndex = Math.min(startIndex + this.itemsPerPage, this.totalItems);
      this.gg = this.allTags.slice(startIndex, endIndex);
    }

  }

  nav(choice: string) {
    switch (choice) {
      case 'Next':
        this.page += 1;
        if (this.page > this.lastPage) {
          this.page = this.lastPage;
        }
        break;
      case 'Prev':
        this.page -= 1;
        if (this.page < 0) {
          this.page = 0;
        }
        break;
      case 'First':
        this.page = 1;
        break;
      case 'Last':
        this.page = this.lastPage;
        break;
    }

    this.updateDisplayedTags(this.page);
  }

}





