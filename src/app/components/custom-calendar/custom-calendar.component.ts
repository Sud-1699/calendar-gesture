import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, input, model, OnInit, output } from '@angular/core';
import Day from 'src/app/models/day';
import { DateTime } from 'src/app/services/date-time.util';
import Swiper from 'swiper';

@Component({
  selector: 'app-custom-calendar',
  templateUrl: './custom-calendar.component.html',
  styleUrls: ['./custom-calendar.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CustomCalendarComponent implements OnInit {

  public multiple = input<boolean>(false);
  public firstDayOfWeek = input.required<number>();
  public presentation = input.required<string>();
  public weekView = input.required<boolean>();

  public emitChange = output<boolean>();
  public emitDateLabel = output<string>();

  public date = model.required<string>();

  public days: Array<Array<Day>> = [];
  public calendars: Array<Array<Array<Day>>> = [];
  public weeks: Array<Array<Day>> = [];
  public dayTitle: Array<string> = [];
  public numberOfWeeks: Array<string> = [];
  public numberOfWeek: string = '';

  private selectedDate!: Date;
  private currentMonthDate!: Date;
  private dayLabels: Array<string> = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  private firstTimeLabel: boolean = true;

  private dateTime = inject(DateTime);
  private cd = inject(ChangeDetectorRef);

  constructor() {
    this.selectedDate = new Date();
    this.currentMonthDate = new Date();
  }

  ngOnInit() {
    setTimeout(() => {
      this.initCalendarLayout();
    }, 200);
  }

  private initCalendarLayout = () => {
    this.renderCalendar(this.currentMonthDate);
    this.calendars.push(this.days);
    this.weeks.push(this.renderWeek());

    if (this.date()) this.updateCalendarOrWeek();
  }

  private renderCalendar = (currentMonthDate: Date) => {
    const today = new Date();

    //Calendar used in iteration
    const calendar: Date = new Date(
      currentMonthDate.getFullYear(),
      currentMonthDate.getMonth(),
      1
    );

    this.emitDateLabel.emit(calendar.toISOString());

    calendar.setDate(calendar.getDate() - ((calendar.getDay() === 0) ? 6 : calendar.getDay() - this.firstDayOfWeek()));

    this.days = [];
    this.days = this.getFullCalendar(calendar, currentMonthDate, today);
    console.log('renderCalendar: days data: ', this.days);
  }

  private renderWeek = () => {
    const today = new Date();

    const weeksStartAndEnd = this.dateTime.getWeeksStartAndEnd(today);
    const startDate = weeksStartAndEnd.startDate;
    const endDate = weeksStartAndEnd.endDate;

    return this.getFullWeek(today, startDate, endDate);
  }

  private getFullCalendar = (calendar: Date, currentMonthDate: Date, today: Date): Array<Array<Day>> => {
    let weekCounter: number = 0;
    let weeks: Array<Array<Day>> = [];
    let days: Array<Day> = [];
    this.numberOfWeeks = [];

    for (let d: number = 0; d < 42; d++) {
      // Day to be rendered
      // Seed with current date in iteration
      const day: Day = new Day();
      day.year = calendar.getFullYear();
      day.month = calendar.getMonth() + 1;

      // Populate day in month
      // Undefined date properties are not rendered
      day.date = calendar.getDate();
      day.day = calendar.getDay();
      day.fade = calendar.getMonth() !== currentMonthDate.getMonth();
      day.data = new Date(day.year!, day.month - 1!, day.date!);

      // Check for today
      if (
        calendar.getFullYear() === today.getFullYear() &&
        calendar.getMonth() === today.getMonth() &&
        calendar.getDate() === today.getDate()
      ) day.today = true;

      // Check for selection
      if (
        calendar.getFullYear() === this.selectedDate.getFullYear() &&
        calendar.getMonth() === this.selectedDate.getMonth() &&
        calendar.getDate() === this.selectedDate.getDate()
      ) day.selected = true;

      days.push(day);
      weekCounter++;

      if (weekCounter === 7) {
        weeks.push(days);
        this.numberOfWeeks.push(`W${this.getNumberOfWeek(new Date(days[0].data))}`);
        weekCounter = 0;
        days = [];
      }

      if (d <= 6 && this.firstTimeLabel) {
        const dayLabelIndex: number = (day.day + 6) % 7; // Adjust for starting day of week
        this.dayTitle.push(this.dayLabels[day.day === 0 ? 0 : dayLabelIndex + 1]);
        if (d >= 6) this.firstTimeLabel = false;
      }

      // Keep rolling
      calendar.setDate(calendar.getDate() + 1);

      // Do not render the last week
      // Depending on calendar layout
      // Some months require five weeks
      // Other six weeks (see May 2021)
      if (
        calendar.getDay() === this.firstDayOfWeek() &&
        calendar.getMonth() !== currentMonthDate.getMonth()
      ) break;
    }

    return weeks;
  }

  private getFullWeek = (today: Date, startDate: Date, endDate: Date): Array<Day> => {
    let week: Array<Day> = [];
    let currentDate: Date = new Date(startDate);

    // Emit label for view
    this.emitDateLabel.emit(startDate.toISOString());

    while (currentDate <= endDate) {
      let day: Day = new Day();
      day.year = currentDate.getFullYear();
      day.month = currentDate.getMonth() + 1;
      day.date = currentDate.getDate();
      day.day = currentDate.getDay();
      day.data = new Date(day.year!, day.month - 1!, day.date!);

      // Check for today
      if (
        currentDate.getFullYear() === today.getFullYear() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getDate() === today.getDate()
      ) day.today = true;

      // Check for selection
      if (
        currentDate.getFullYear() === this.selectedDate.getFullYear() &&
        currentDate.getMonth() === this.selectedDate.getMonth() &&
        currentDate.getDate() === this.selectedDate.getDate()
      ) day.selected = true;

      week.push(day);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    week.map((day: Day) => day.fade = week[0].month !== day.month);
    this.numberOfWeek = `W${this.getNumberOfWeek(new Date(week[0].data))}`
    console.log(`getFullWeek: week: `, week);
    return week;
  }

  private getNumberOfWeek = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDayOfYear = (date.valueOf() - firstDayOfYear.valueOf()) / 86400000;
    return Math.ceil((pastDayOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  public changeCalendar = (event: any) => {
    console.log(`changeCalendar: event: `, event);

    const swiperDetail: Swiper = (event as CustomEvent).detail[0];
    if (!swiperDetail) return;

    const direction: 'prev' | 'next' = swiperDetail.swipeDirection;
    switch (direction) {
      case 'prev':
        const previousMonthDate = new Date(this.currentMonthDate.getFullYear(), this.currentMonthDate.getMonth() - 1, 1);
        this.renderCalendar(previousMonthDate);
        const previousMonthData = this.days;
        this.currentMonthDate = previousMonthDate;
        this.calendars = [];
        this.calendars.push(previousMonthData);
        this.reRenderCalendarOrWeek(previousMonthDate, false, true);
        break;
      case 'next':
        const nextMonthDate = new Date(this.currentMonthDate.getFullYear(), this.currentMonthDate.getMonth() + 1, 1);
        this.renderCalendar(nextMonthDate);
        const nextMonthData = this.days;
        this.currentMonthDate = nextMonthDate;
        this.calendars = [];
        this.calendars.push(nextMonthData);
        this.reRenderCalendarOrWeek(nextMonthDate, false, true);
        break;
    }

    swiperDetail.update();
    this.cd.detectChanges();
  }

  public changeWeek = (event: any) => {
    console.log(`changeCalendar: event: `, event);

    const swiperDetail: Swiper = (event as CustomEvent).detail[0];
    if (!swiperDetail) return;

    const direction: 'prev' | 'next' = swiperDetail.swipeDirection;
    switch (direction) {
      case 'prev':
        let endOfPrevWeek = new Date(this.weeks[0][0].data);
        endOfPrevWeek.setDate(endOfPrevWeek.getDate() - 1);
        let startOfPrevWeek = new Date(endOfPrevWeek);
        startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 6);

        this.currentMonthDate = startOfPrevWeek;
        this.weeks = [];
        this.weeks.push(this.getFullWeek(new Date(), startOfPrevWeek, endOfPrevWeek));
        this.reRenderCalendarOrWeek(startOfPrevWeek, true, true);
        break;
      case 'next':
        let startOfNextWeek = new Date(this.weeks[0][0].data);
        startOfNextWeek.setDate(startOfNextWeek.getDate() + 1);
        let endOfNextWeek = new Date(startOfNextWeek);
        endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

        this.currentMonthDate = endOfNextWeek;
        this.weeks = [];
        this.weeks.push(this.getFullWeek(new Date, startOfNextWeek, endOfNextWeek));
        this.reRenderCalendarOrWeek(endOfNextWeek, true, true);
        break;
    }

    swiperDetail.update();
    this.cd.detectChanges();
  }

  public selectDate = (selectedDay: Day, isWeek: boolean = false) => {
    console.log(`selectDate: selected day: `, selectedDay);

    if (!isWeek) {
      this.calendars.forEach((calendar: Array<Array<Day>>) => {
        calendar.forEach((weeks: Array<Day>) => {
          weeks.forEach((day: Day) => {
            day.selected = false;

            if (
              selectedDay.year === day.year &&
              selectedDay.month === day.month &&
              selectedDay.date === day.date
            ) day.selected = true;
          });
        });
      });
    } else {
      this.weeks.forEach((week: Array<Day>) => {
        week.forEach((day: Day) => {
          day.selected = false;

          if (
            selectedDay.year === day.year &&
            selectedDay.month === day.month &&
            selectedDay.date === day.date
          ) day.selected = true;
        });
      });
    }

    const newDate = !this.presentation() ? selectedDay.data.toISOString() : this.dateTime.formatDate(selectedDay.data.toISOString(), this.presentation());
    this.date.update(() => newDate);
    this.emitChange.emit(true);
    this.reRenderCalendarOrWeek(selectedDay.data, isWeek);
    this.cd.detectChanges();
  }

  private reRenderCalendarOrWeek = (selectedDate: Date, isWeek: boolean, isSwipe: boolean = false) => {
    this.selectedDate = selectedDate;

    if (!isWeek) {
      const weeksStartAndEnd = this.dateTime.getWeeksStartAndEnd(selectedDate);
      const startDate = weeksStartAndEnd.startDate;
      const endDate = weeksStartAndEnd.endDate;

      this.weeks = [];
      this.weeks.push(this.getFullWeek(new Date(), startDate, endDate));
    } else {
      this.calendars = [];
      this.renderCalendar(selectedDate);
      this.calendars.push(this.days);
    }

    if (isSwipe) {
      if (this.weeks && this.weeks.length) {
        this.weeks.forEach((week: Array<Day>) => {
          week.forEach((day: Day) => {
            day.selected = false;
            day.today = false;

            const today = new Date();
            if (
              day.data.getFullYear() === today.getFullYear() &&
              day.data.getMonth() === today.getMonth() &&
              day.data.getDate() === today.getDate()
            ) [day.today, day.selected] = [true, !this.date()];

            if (this.date()) {
              const selectedDate = new Date(this.date());

              if (
                day.data.getFullYear() === selectedDate.getFullYear() &&
                day.data.getMonth() === selectedDate.getMonth() &&
                day.data.getDate() === selectedDate.getDate()
              ) day.selected = true;
            }
          });
        });
      }

      if (this.calendars && this.calendars.length) {
        this.calendars.forEach((calendar: Array<Array<Day>>) => {
          calendar.forEach((weeks: Array<Day>) => {
            weeks.forEach((day: Day) => {
              day.selected = false;
              day.today = false;

              const today = new Date();
              if (
                day.data.getFullYear() === today.getFullYear() &&
                day.data.getMonth() === today.getMonth() &&
                day.data.getDate() === today.getDate()
              ) [day.today, day.selected] = [true, !this.date()];

              if (this.date()) {
                const selectedDate = new Date(this.date());

                if (
                  day.data.getFullYear() === selectedDate.getFullYear() &&
                  day.data.getMonth() === selectedDate.getMonth() &&
                  day.data.getDate() === selectedDate.getDate()
                ) day.selected = true;
              }
            });
          });
        });
      }

      this.emitDateLabel.emit(selectedDate.toISOString());
    }
  }

  private updateCalendarOrWeek = () => {
    this.currentMonthDate = this.selectedDate = new Date(this.date());

    const weeksStartAndEnd = this.dateTime.getWeeksStartAndEnd(this.selectedDate);
    const startDate = weeksStartAndEnd.startDate;
    const endDate = weeksStartAndEnd.endDate;

    this.weeks = [];
    this.weeks.push(this.getFullWeek(new Date, startDate, endDate));

    this.calendars = [];
    this.renderCalendar(this.selectedDate);
    this.calendars.push(this.days);
  }
}
