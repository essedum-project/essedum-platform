import { Component,ViewEncapsulation } from '@angular/core';
import { Services } from './services/service';

@Component({
  selector: 'app-root',
  templateUrl: './aip.component.html',
  styleUrls: ['./aip.component.scss'],
  // encapsulation: ViewEncapsulation.ShadowDom
})
export class AipComponent {
  constructor(private service:Services) {};

  title = 'aip-app';
  ngOnInit(): void {
    // this.service.getPermission("cip").subscribe(
    //   (resp) => {
    //     sessionStorage.setItem("cipAuthority", JSON.parse(resp).map(p => p.permission));
    //   })
  };
}
