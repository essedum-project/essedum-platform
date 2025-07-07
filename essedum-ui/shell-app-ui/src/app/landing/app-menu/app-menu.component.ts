import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-menu-item',
  templateUrl: './app-menu.component.html',
  styleUrls: ['./app-menu.component.scss']
})
export class AppMenuComponent implements OnInit, OnChanges {

  @Input() items: any;
  @ViewChild('childMenu', { static: false }) public childMenu: any;
  @Output() breadcrumb = new EventEmitter<any[]>();
  showSubHeader: boolean = false;
  subHeaderItems: any;
  sidebarbgcolor: boolean = false;
  sidebartextcolor: boolean = false;
  sidebarhovercolor: boolean = false;
  sidebartexticonhovercolor:boolean=false;
  constructor(public router: Router) {
  }

  ngOnInit() {
    if (document.documentElement.style.getPropertyValue("--childsidebarbg-color") == "true")
      this.sidebarbgcolor = true
    if(document.documentElement.style.getPropertyValue("--childsidebartexticonhover-color")=="true")
      this.sidebartexticonhovercolor=true
    if (document.documentElement.style.getPropertyValue("--childsidebartext-color") == "true")
      this.sidebartextcolor = true
    if (document.documentElement.style.getPropertyValue("--childsidebarhover-color") == "true")
      this.sidebarhovercolor = true
  }

  ngOnChanges(changes: SimpleChanges): void {
    changes['items']?.currentValue.forEach(a => {
      if(a.children.length != 0){
        this.showSubHeader = true;
        return;
      }else{
        this.showSubHeader = false;
      }
    })
  }

  Highlight(child: any) {
    if (child.parent && child.parent[2])
      sessionStorage.setItem("SeclevelhighlightedLabel", child.parent[2]);
    let temp = [child.parent];
    temp[0].push(child.label)
    this.breadcrumb.emit(temp[0])
    this.removeFilters();
  }
  createSubHeader(items: any) {
    this.showSubHeader = true;
    this.subHeaderItems = items;
  }

  resetvalues(){
    this.showSubHeader = false;
    this.subHeaderItems = null;
  }
  
  passDataToParent(event: any) {
    this.breadcrumb.emit(event)

  }
  get hideTabLeftBtn1() {
    let tabsBox = document.getElementById("tabsBox1");
    if (!tabsBox) return true;
    else if (tabsBox.scrollLeft <= 5) return true;
    else return false;
  }

  get hideTabRightBtn1() {
    let tabsBox = document.getElementById("tabsBox1");
    if (!tabsBox) return true;
    else if (tabsBox.scrollLeft + tabsBox.clientWidth >= tabsBox.scrollWidth - 5) return true;
    else return false;

  }

  clickOnLeftBtn1() {
    console.log("click on left")
    let tabsBox = document.getElementById("tabsBox1");
    tabsBox!.scrollLeft -= 250;

  }

  clickOnRightBtn1() {
    let tabsBox = document.getElementById("tabsBox1");
    tabsBox!.scrollLeft += 250;

  }
  removeFilters() {
    sessionStorage.removeItem('SelectedProcess')
    sessionStorage.removeItem('drilldown')
    let url = window.location.href;
    if (!url.includes("cc")) {
      sessionStorage.removeItem("level2sidebar");
    }
  }

  checkAndOpenExtLink(url: any) {
    window.open(url, "_blank");
  }

}
