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

import { Project } from "./project";
import { Portfolio } from "./portfolio";

export class DashConstant {
 id: number;
 project_name: string;
 keys: string;
 value: string;
 project_id: Project;
 portfolio_id: Portfolio;
 constructor(json?: any) {
  if (json != null) {
   this.id = json.id;
   this.project_name = json.project_name;
   this.keys = json.keys;
   this.value = json.value;
   this.project_id = json.project_id;
    this.portfolio_id = json.portfolio_id
  }
 }

 // Utils

 static toArray(jsons: any[]): DashConstant[] {
  let dash_constants: DashConstant[] = [];
  if (jsons != null) {
   for (let json of jsons) {
    dash_constants.push(new DashConstant(json));
   }
  }
  return dash_constants;
 }
}
