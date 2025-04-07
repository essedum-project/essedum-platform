import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtertag'
})
export class FiltertagPipe implements PipeTransform {

  transform(value: any,args?: any): any {
    if(!value) return null;
    if(!args)  return value;
    args=args.toLowerCase();
    return value.filter(function(item:any){
      return JSON.stringify(item).toLowerCase().includes(args);
    })

  }

}
