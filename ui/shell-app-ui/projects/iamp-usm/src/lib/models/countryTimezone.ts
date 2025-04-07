import { Project } from "./project";

export class CountryTimezone{
    id: number;
    country: string;
    tz_name: string;
    country_code: string;
    regional_settings: string;
    is_active: boolean;
    project_id: Project;

    constructor(json?: any){
        if(json != null){
            this.id = json.id;
            this.country = json.country;
            this.tz_name = json.tz_name;
            this.regional_settings = json.regional_settings;
            this.is_active = json.is_active;
            this.project_id = json.project_id;
        }
    }

    static toArray(jsons: any[]): CountryTimezone[] {
        let countryTimezones: CountryTimezone[] = [];
        if (jsons != null) {
         for (let json of jsons) {
            countryTimezones.push(new CountryTimezone(json));
         }
        }
        return countryTimezones;
    }

}