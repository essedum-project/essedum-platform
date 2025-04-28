import { Context } from "./context";

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

export class Users {
 id: number;
 user_f_name: string;
 user_m_name: string;
 user_l_name: string;
 user_email: string;
 user_login: string;
 password: string;
 user_act_ind: boolean;
 user_added_by: number;
 last_updated_dts: any;
 activated: boolean;
 context: Context;
 onboarded: boolean;
 force_password_change: boolean;
 user_sec_ind: boolean;
 profileImage: any;
 clientDetails: string;
 profileImageName: string;
 country: string;
 timezone: string;
 other_details: string;
 contact_number: string;
 isUiInactivityTracked: boolean;
 constructor(json?: any) {
  if (json != null) {
   this.id = json.id;
   this.user_f_name = json.user_f_name;
   this.user_m_name = json.user_m_name;
   this.user_l_name = json.user_l_name;
   this.user_email = json.user_email;
   this.user_login = json.user_login;
   this.password = json.password;
   this.user_act_ind = json.user_act_ind;
   this.user_added_by = json.user_added_by;
   this.last_updated_dts = json.last_updated_dts;
   this.context = json.context;
   this.onboarded = json.onboarded;
   this.activated = json.activated;
   this.force_password_change = json.force_password_change;
   this.profileImage = json.profileImage;
   this.clientDetails = json.clientDetails;
   this.profileImageName=json.profileImageName;
   this.country = json.country;
   this.timezone = json.timezone;
   this.other_details = json.other_details;
   this.contact_number = json.contact_number;
   this.isUiInactivityTracked = json.isUiInactivityTracked;
  }
 }

 // Utils

 static toArray(jsons: any[]): Users[] {
  let userss: Users[] = [];
  if (jsons != null) {
   for (let json of jsons) {
    userss.push(new Users(json));
   }
  }
  return userss;
 }
}
