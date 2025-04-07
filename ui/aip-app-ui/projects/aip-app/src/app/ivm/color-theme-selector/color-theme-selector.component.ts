import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-color-theme-selector',
  templateUrl: './color-theme-selector.component.html',
  styleUrls: ['./color-theme-selector.component.scss']
})
export class ColorThemeSelectorComponent implements OnInit  {
  menus=['menu1','menu2','menu3','menu4']
  constructor(){}
  ngOnInit(): void {
      
  }
  
}
