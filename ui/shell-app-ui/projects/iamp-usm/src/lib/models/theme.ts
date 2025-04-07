//
// Copyright © 2016-2017 Infosys Limited, Bangalore, India. All Rights Reserved.
// * Except for any open source software components embedded in this
// * Infosys proprietary software program (Program), this Program is protected
// * by copyright laws, international treaties and other pending or existing
// * intellectual property rights in India, the United States and other countries.
// * Except as expressly permitted, any unauthorized reproduction, storage,
// * transmission in any form or by any means (including without limitation
// * electronic, mechanical, printing, photocopying, recording or otherwise),
// * or any distribution of this Program, or any portion of it,
// * may result in severe civil and criminal penalties, and
// * will be prosecuted to the maximum extent possible under the law.
// Template pack-angular:web/src/app/base-entities/entity.ts.e.vm
//

import { Project } from "./project";

export class Theme {
    projectid: Project;
    id: number;
    apptheme: AppTheme;
    bcctheme:BCCTheme;
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
    titlecolor: string;
    filtercolor:string;
    filterapplybuttonbackgroundcolor:string;
    widgetfilterapply:boolean;
    filterbackgroundcolor:boolean;
    dashboarddropdowncolor:string;
    toggleactivecolor:string;
    toggleactivebackgroundcolor:string;
    toggleinactivecolor:string;
    toggleinactivebackgroundcolor:string;
    toggleactiveunderlinecolor:string;
}

export class WidgetTheme {
    backgroundcolor: string;
    textcolor: string;
    bordercolor: string;
    titlecolor: string;
    colorpalette: string[];
    proritizeThemeColor:boolean;
    proritizeThemeColorArr: string[];
    tilebackgroundcolor: string;
    fontfamily:string;
    borderradius:number;
    boldtitle:boolean;
    bordershadow:boolean;
}
