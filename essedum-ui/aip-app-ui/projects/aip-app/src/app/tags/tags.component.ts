import { Component, Input } from '@angular/core';
import { Services } from '../services/service';
import { TagsService } from '../services/tags.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss'],
})
export class TagsComponent {
  @Input('data') data: any;
  @Input('entityType') entityType: any;
  @Input('componentType') componentType: string;
  category = [];
  tags;
  tagsBackup;
  tagId: any;
  entityId: any;
  allTags: any;
  tagStatus = {};
  catStatus = {};
  selectedTag = [];
  selectTag = [];
  constructor(
    private service: Services,
    private tagService: TagsService,
    private dialogRef: MatDialogRef<TagsComponent>
  ) {}

  ngOnInit(): void {
    this.getTags();
  }

  closeModal() {
    this.dialogRef.close('close the modal');
  }

  getSelectedTags() {
    if (this.entityType == 'pipeline') {
      this.service
        .getMappedTags(this.data.cid, this.entityType)
        .subscribe((resp) => {
          console.log(resp.body);
          resp.body.forEach((tag: any) => {
            this.selectedTag.push(tag);
            this.tagStatus[tag.category + ' - ' + tag.label] = true;
          });
        });
    } else {
      this.service
        .getMappedTags(this.data.id, this.entityType)
        .subscribe((resp) => {
          console.log(resp.body);
          resp.body.forEach((tag: any) => {
            this.selectedTag.push(tag);
            this.tagStatus[tag.category + ' - ' + tag.label] = true;
          });
        });
    }
  }

  getTags() {
    this.tags = {};
    this.tagsBackup = {};
    this.service.getMlTags().subscribe((resp) => {
      this.allTags = resp;

      resp.forEach((tag) => {
        if (this.category.indexOf(tag.category) == -1) {
          this.category.push(tag.category);
        }
        this.tagStatus[tag.category + ' - ' + tag.label] = false;
      });
      this.category.forEach((cat) => {
        this.tags[cat] = this.allTags
          .filter((tag) => tag.category == cat)
          .slice(0, 10);
        this.tagsBackup[cat] = this.allTags.filter(
          (tag) => tag.category == cat
        );
        this.catStatus[cat] = false;
      });
    });
    this.getSelectedTags();
  }
  slice(): any {
    throw new Error('Method not implemented.');
  }
  filter(arg0: (tags: any) => boolean): any {
    throw new Error('Method not implemented.');
  }
  filterByTag(tag) {
    let id = [];
    this.selectedTag.forEach((t: any) => {
      id.push(t.id);
    });
    this.tagStatus[tag.category + ' - ' + tag.label] =
      !this.tagStatus[tag.category + ' - ' + tag.label];
    if (!this.tagStatus[tag.category + ' - ' + tag.label]) {
      const index = id.indexOf(tag.id);
      this.selectedTag.splice(index, 1);
    } else {
      this.selectedTag.push(tag);
    }
    console.log(this.selectedTag, 'selectedTag after filter');
  }
  showMore(category) {
    this.catStatus[category] = !this.catStatus[category];
    if (this.catStatus[category])
      this.tags[category] = this.allTags.filter(
        (tag) => tag.category == category
      );
    else
      this.tags[category] = this.allTags
        .filter((tag) => tag.category == category)
        .slice(0, 10);
  }
  dismiss() {
    // If using Angular Material Dialog, close the dialog like this:
    // Inject MatDialogRef<TagsComponent> in the constructor:
    // constructor(
    //   private dialogRef: MatDialogRef<TagsComponent>,
    //   ...
    // ) {}

    // Then close the dialog:
    this.dialogRef.close('close the modal');
    let tagData = [];
    this.selectedTag.forEach((tag: any) => {
      tagData.push(tag);
    });
    this.tagService.tags = tagData;
  }
  updateTag() {
    let ids = [];
    console.log(this.entityType);
    console.log(this.selectedTag, 'selectedTag');
    this.selectedTag.forEach((tag: any) => {
      ids.push(tag.id);
    });
    this.selectedTag = [];
    this.tagId = ids.join(',');
    if (this.entityType == 'pipeline') {
      this.service
        .updateTags(this.tagId, this.entityType, this.data.cid)
        .subscribe(
          (resp) => {
            console.log(resp);
            this.service.messageService(resp, 'Tags updated.');
          },
          (error) => {
            this.service.messageService(error);
          }
        );
    } else {
      this.service
        .updateTags(this.tagId, this.entityType, this.data.id)
        .subscribe(
          (resp) => {
            console.log(resp);
            this.service.messageService(resp, 'Tags updated.');
          },
          (error) => {
            this.service.messageService(error);
          }
        );
    }
  }
}
