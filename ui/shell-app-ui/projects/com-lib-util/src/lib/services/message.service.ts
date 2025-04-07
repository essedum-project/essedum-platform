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
// Template pack-angular:web/src/app/service/message.service.ts.p.vm
//
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable } from "rxjs/Observable";
@Injectable()
export class MessageService {
 constructor(private snackBar: MatSnackBar) {}

 private messageSource = new Subject<any>();

 messageSource$ = this.messageSource.asObservable();

 info(message: string, action: string) {
  this.snackBar.open(message, action, {
   duration: 2000,
  });
 }

 error(message: string, action: string) {
  this.snackBar.open(message, action, {
   duration: 8000,
  });
 }
}
