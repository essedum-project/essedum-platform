import { Injectable } from '@angular/core';

@Injectable()
export class AppGlobals {

    private isAPIActive: boolean = false;
    private isDivActive: String = null;
    private dataSourcePlugin = undefined;
    private currentList: any[];

    getAPIStatus(): boolean {
        return this.isAPIActive;
    }

    setAPIStatus(status: boolean): void {
        this.isAPIActive = status;
    }

    getCurrentList(): any[] {
        return this.currentList;
    }

    setCurrentList(list: any[]): void {
        this.currentList = list;
    }

    getDivStatus(): String {
        return this.isDivActive;
    }

    setDivStatus(status: String): void {
        this.isDivActive = status;
    }

    getDataSourcePlugin(): any {
        return this.dataSourcePlugin;
    }

    setDataSourcePlugin(value: any): void {
        this.dataSourcePlugin = value;
    }
}