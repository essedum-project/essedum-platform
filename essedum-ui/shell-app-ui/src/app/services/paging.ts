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
// Template pack-angular:web/src/app/support/paging.ts.p.vm
//

export class PageResponse<E> {
 constructor(public totalPages: number, public totalElements: number, public content: E[]) {}

 // remove the passed element from the content array.
 remove(element: E) {
  let indexToRemove: number = this.content.indexOf(element);
  this.content.splice(indexToRemove, 1);
  this.totalElements = this.totalElements - 1;
 }
}

export class PageRequestByExample<E> {
 constructor(public example: E, public lazyLoadEvent: any) {}
}
