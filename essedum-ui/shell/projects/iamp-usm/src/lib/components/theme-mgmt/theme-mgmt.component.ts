import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DashConstant } from '../../models/dash-constant';
import { Project } from '../../models/project';
import { AppTheme, DashboardTheme, Theme, WidgetTheme, BCCTheme } from '../../models/theme';
import { DashConstantService } from '../../services/dash-constant.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'lib-theme-mgmt',
  templateUrl: './theme-mgmt.component.html',
  styleUrls: ['./theme-mgmt.component.css']
})
export class ThemeMgmtComponent implements OnInit {

  paletteArray: string[] = ['Black'];
  theme = new Theme();
  busy: Subscription;
  themeId;

  constructor(public dashConstantService: DashConstantService, private messageService: MessageService) {
    this.theme.apptheme = new AppTheme()
    this.theme.bcctheme = new BCCTheme()
    this.theme.dashboardtheme = new DashboardTheme()
    this.theme.widgettheme = new WidgetTheme()
    this.theme.widgettheme.colorpalette = []
  }

  ngOnInit(): void {
    this.fetchTheme();
  }

  save() {
    let project = JSON.parse(sessionStorage.getItem('project'));
    if (this.theme.widgettheme.proritizeThemeColorArr?.length == 0) {
      this.theme.widgettheme.proritizeThemeColor = false
    }
    if (this.theme.apptheme.themecolor)
      project.theme = this.theme.apptheme.themecolor
    else {
      project.theme = sessionStorage.getItem("defaultTheme")
      this.theme.apptheme.themecolor = sessionStorage.getItem("defaultTheme")
    }
    if (this.paletteArray[0] == 'Black')
      this.theme.widgettheme.colorpalette = [];
    else
      this.theme.widgettheme.colorpalette = this.paletteArray;
    let dashconstant = new DashConstant()
    dashconstant.keys = "Project Theme"
    dashconstant.value = JSON.stringify(this.theme)
    dashconstant.project_id = new Project({ id: project.id })
    dashconstant.project_name = project.name
    dashconstant.id = this.themeId
    this.busy = this.dashConstantService.saveTheme(dashconstant).subscribe(
      (res) => {
        this.themeId = res.toString().split(':')[1];
        sessionStorage.setItem("AppCacheDashConstant", "true");
        sessionStorage.setItem("UpdatedUser", "true");
        sessionStorage.setItem('project', JSON.stringify(project))
        this.messageService.info("Theme saved successfully", '');
      }, error => this.messageService.error("Could not save theme", '')
    )
  }

  fetchTheme() {
    let project = JSON.parse(sessionStorage.getItem('project'));
    this.dashConstantService.getDashConstsCheck().subscribe((res) => {
      let projectTheme = res.filter((item) => (item.keys == "Project Theme"))[0];
      let tempdashboardbgcolor = res.filter((item) => (item.keys == "DashboardName_Background_Color"))[0];
      let tempdashboardtextcolor = res.filter((item) => (item.keys == "DashboardName_Text_Color"))[0];
      let tempSidebarbgcolor = res.filter((item) => (item.keys == "Sidebar_Background_Color"))[0];
      let tempSidebartextcolor = res.filter((item) => (item.keys == "Sidebar_Text_Color"))[0];
      let tempSidebarTextIconHover = res.filter((item) => (item.keys == "Sidebar_TextIconHover_Color"))[0];
      let tempSidebarhighlightcolor = res.filter((item) => (item.keys == "Sidebar_Highlight_Color"))[0];
      let tempSidebarhovercolor = res.filter((item) => (item.keys == "Sidebar_Hover_Color"))[0];
      let temptoggledashcolor = res.filter((item) => item.keys == "ToggleUnderline_Color")[0];
      if (projectTheme && projectTheme.value) {
        this.themeId = projectTheme.id
        this.theme = JSON.parse(projectTheme.value)
        this.paletteArray = this.theme.widgettheme.colorpalette;
        if (this.paletteArray.length == 0)
          this.paletteArray = ['Black']
      } else {
        if (tempdashboardbgcolor && tempdashboardbgcolor.value)
          this.theme.dashboardtheme.backgroundcolor = tempdashboardbgcolor.value
        if (tempdashboardtextcolor && tempdashboardtextcolor.value)
          this.theme.dashboardtheme.titlecolor = tempdashboardtextcolor.value
        if (tempSidebarbgcolor && tempSidebarbgcolor.value)
          this.theme.apptheme.sidebarbackgroundcolor = tempSidebarbgcolor.value
        if (tempSidebartextcolor && tempSidebartextcolor.value) {
          this.theme.apptheme.sidebartextcolor = tempSidebartextcolor.value
          this.theme.apptheme.sidebariconcolor = tempSidebartextcolor.value
        }
        if (tempSidebarhighlightcolor && tempSidebarhighlightcolor.value)
          this.theme.apptheme.sidebaractivecolor = tempSidebarhighlightcolor.value
        if (tempSidebarTextIconHover && tempSidebarTextIconHover.value)
          this.theme.apptheme.sidebartexticonhovercolor = tempSidebarTextIconHover.value
        if (tempSidebarhovercolor && tempSidebarhovercolor.value)
          this.theme.apptheme.sidebarhovercolor = tempSidebarhovercolor.value
        if (temptoggledashcolor && temptoggledashcolor.value)
          this.theme.dashboardtheme.toggleactiveunderlinecolor = tempSidebarhighlightcolor.value
      }
      if (!this.theme.apptheme) this.theme.apptheme = new AppTheme()
      if (!this.theme.bcctheme) this.theme.bcctheme = new BCCTheme()
      if (sessionStorage.getItem("defaultTheme"))
        this.theme.apptheme.themecolor = sessionStorage.getItem("defaultTheme")
      if (project && project.theme)
        this.theme.apptheme.themecolor = project.theme
    })
  }

  /**
   * Checks if any widget theme settings are configured
   */
  hasWidgetThemeSettings(): boolean {
    return !!(this.theme.widgettheme && (
      this.theme.widgettheme.backgroundcolor ||
      this.theme.widgettheme.bordercolor ||
      this.theme.widgettheme.textcolor ||
      this.theme.widgettheme.tilebackgroundcolor ||
      this.theme.widgettheme.borderradius ||
      this.theme.widgettheme.fontfamily ||
      this.theme.widgettheme.bordershadow ||
      this.theme.widgettheme.boldtitle
    ));
  }

  /**
   * Track by function for palette array
   */
  trackByMethod(index: number, item: string): number {
    return index;
  }

  /**
   * Clear all theme settings
   */
  clear(): void {
    this.theme.apptheme = new AppTheme();
    this.theme.bcctheme = new BCCTheme();
    this.theme.dashboardtheme = new DashboardTheme();
    this.theme.widgettheme = new WidgetTheme();
    this.theme.widgettheme.colorpalette = [];
    this.paletteArray = ['Black'];
  }

  /**
   * Remove theme attribute from priority array
   */
  removeThemeAttr(type: string): void {
    if (this.theme.widgettheme.proritizeThemeColorArr) {
      const index = this.theme.widgettheme.proritizeThemeColorArr.indexOf(type);
      if (index > -1) {
        this.theme.widgettheme.proritizeThemeColorArr.splice(index, 1);
      }
    }
  }

  /**
   * Add theme attribute to priority array
   */
  addThemeAttr(type: string): void {
    if (!this.theme.widgettheme.proritizeThemeColorArr) {
      this.theme.widgettheme.proritizeThemeColorArr = [];
    }
    
    if (!this.theme.widgettheme.proritizeThemeColorArr.includes(type)) {
      this.theme.widgettheme.proritizeThemeColorArr.push(type);
    }
  }

  /**
   * Toggle bold title setting
   */
  changeBoltTitle(): void {
    if (this.theme.widgettheme.boldtitle) {
      this.addThemeAttr('boldtitle');
    } else {
      this.removeThemeAttr('boldtitle');
    }
  }

  /**
   * Toggle border shadow setting
   */
  changeBorderShadow(): void {
    if (this.theme.widgettheme.bordershadow) {
      this.addThemeAttr('bordershadow');
    } else {
      this.removeThemeAttr('bordershadow');
    }
  }
}
