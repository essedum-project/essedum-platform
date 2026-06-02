import { Project } from "./project";

export class Theme {
    projectid: Project;
    id: number;
    apptheme: AppTheme;
    bcctheme: BCCTheme;
    dashboardtheme: DashboardTheme;
    widgettheme: WidgetTheme;

    constructor(json?: any) {
        if (json != null) {
            this.id = json.id;
            this.projectid = json.projectid;
            this.dashboardtheme = json.dashboardtheme;
            this.widgettheme = json.widgettheme;
            this.apptheme = json.apptheme
        }
    }

    // Utils
    static toArray(jsons: any[]): Theme[] {
        let themes: Theme[] = [];
        if (jsons != null) {
            for (let json of jsons) {
                themes.push(new Theme(json));
            }
        }
        return themes;
    }
}

export class AppTheme {
    themecolor: string;
    sidebarbackgroundcolor: string;
    sidebartextcolor: string;
    sidebariconcolor: string;
    sidebaractivecolor: string;
    sidebarhovercolor: string;
    sidebartexticonhovercolor: string;
    headercolor: string;
    headericoncolor: string;
}
export class BCCTheme {
    bccsidebarbackgroundcolor: string;
    bccsidebarhighlightcolor: string;
    bccsidebariconcolor: string;
    bccsidebarcolor: string;
    bccheadertextcolor: string;
    bccheaderbackgroundcolor: string;
}

export class DashboardTheme {
    backgroundcolor: string;
    dashboardbackgroundcolor: string;
    iconcolor: string;
    titlecolor: string;
    filtercolor: string;
    filtertextcolor: string;
    applybuttontextcolor: string;
    filterapplybuttonbackgroundcolor: string;
    widgetfilterapply: boolean;
    filterbackgroundcolor: boolean;
    dashboarddropdowncolor: string;
    toggleactivecolor: string;
    toggleactivebackgroundcolor: string;
    toggleinactivecolor: string;
    toggleinactivebackgroundcolor: string;
    toggleactiveunderlinecolor: string;
}

export class WidgetTheme {
    backgroundcolor: string;
    textcolor: string;
    bordercolor: string;
    titlecolor: string;
    colorpalette: string[];
    proritizeThemeColor: boolean;
    proritizeThemeColorArr: string[];
    tilebackgroundcolor: string;
    fontfamily: string;
    borderradius: number;
    boldtitle: boolean;
    bordershadow: boolean;
}
