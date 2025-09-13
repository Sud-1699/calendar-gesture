import { Injectable } from '@angular/core';
import { format } from 'date-fns/format';

@Injectable({
  providedIn: 'root'
})
export class DateTime {

  public formatDate = (date: string, formatStr: string) => {
    return format(new Date(date), formatStr);
  }
  
  public getWeeksStartAndEnd = (date: Date) => {
    const currentDate = new Date(date);
    const currentDay = currentDate.getDay();

    const firstDayOfWeek = new Date(currentDate);
    const lastDayOfWeek = new Date(currentDate);

    if(currentDay === 0) {
      firstDayOfWeek.setDate(currentDate.getDate() - 6);
      lastDayOfWeek.setDate(currentDate.getDate());
    } else {
      firstDayOfWeek.setDate(currentDate.getDate() - (currentDay - 1));
      lastDayOfWeek.setDate(currentDate.getDate() + (7 - currentDay));
    }

    return {
      startDate: firstDayOfWeek,
      endDate: lastDayOfWeek
    };
  }
}
