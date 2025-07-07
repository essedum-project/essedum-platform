import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsToTime'
})
export class SecondsToTimePipe implements PipeTransform {
  transform(milliseconds: number): string {
    if (!milliseconds)
      return "00:00:00.0";
    const totalSeconds = milliseconds * 1000;
    const hours = Math.floor(totalSeconds / (60 * 60 * 1000));
    const minutes = Math.floor((totalSeconds % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((totalSeconds % (60 * 1000)) / 1000);
    const millisecondsPart = Math.floor((totalSeconds % 1000) % 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millisecondsPart}`;
  }
  private pad(num: number, size: number = 2): string {
    return num.toString().padStart(size, '0');
  }
}