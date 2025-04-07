import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-datasource-description',
  templateUrl: './datasource.description.component.html',
  styleUrls: ['./datasource.description.component.scss']
})
export class DatasourceDescriptionComponent {
  @Input() cardTitle: String = "Datasource";
  @Input() cardToggled: boolean = false;
  @Input() datasourceAlias: String;
  @Input() card: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }
  @Output() newItemEvent = new EventEmitter<boolean>();
  ngOnInit() {
    console.log("datasource");

  }
  numSequence(n: number): Array<number> {
    return Array(n);
  }
  toggler() {
    this.cardToggled = !this.cardToggled;
    console.log(this.cardToggled);
    this.newItemEvent.emit(this.cardToggled);
  }
  routeBackToModelList() {
    this.router.navigate(["../../"], { relativeTo: this.route })
  }
}
