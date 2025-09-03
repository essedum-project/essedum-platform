/**
* The MIT License (MIT)
* Copyright © 2025 Infosys Limited
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
* to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
export class Portfolio {
 id: number;
 portfolioName: string;
 description: string;
 last_updated: any;
 constructor(json?: any) {
  if (json != null) {
   this.id = json.id;
   this.portfolioName = json.portfolioName;
   this.description = json.description;
   this.last_updated = json.last_updated;
  }
 }

 // Utils

 static toArray(jsons: any[]): Portfolio[] {
  let usm_portfolios: Portfolio[] = [];
  if (jsons != null) {
   for (let json of jsons) {
    usm_portfolios.push(new Portfolio(json));
   }
  }
  return usm_portfolios;
 }
}
