import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButtons, IonButton, IonGrid, IonRow, IonCol, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  moon,
  sunny 
} from 'ionicons/icons';
import { CustomCalendarComponent } from "../components/custom-calendar/custom-calendar.component";
import { DatePipe } from '@angular/common';
import { SlideDrawerComponent } from "../components/slide-drawer/slide-drawer.component";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonLabel,
    IonCol,
    IonRow,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonButtons,
    IonButton,
    IonGrid,
    DatePipe,
    CustomCalendarComponent,
    SlideDrawerComponent
  ],
})
export class HomePage implements OnInit {
  public paletteToggle: 'dark' | 'light' = 'dark';
  
  public currentDate: string = '';
  public dateLabel: string = '';
  public weekView: boolean = true;
  public contentHeight: string = '97%';

  private cd = inject(ChangeDetectorRef);

  get paletteIcon() {
    return this.paletteToggle === 'dark' ? 'sunny' : 'moon';
  }

  constructor() {
    addIcons({ 
      sunny,
      moon
    });
  }

  ngOnInit(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // Initialize the dark palette based on the initial
    // value of the prefers-color-scheme media query
    this.initializeDarkPalette(prefersDark.matches);

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener('change', (mediaQuery) => this.initializeDarkPalette(mediaQuery.matches));
  }

  // Check/uncheck the toggle and update the palette based on isDark
  private initializeDarkPalette = (isDark: boolean) => {
    this.paletteToggle = isDark ? 'dark' : 'light';
    this.toggleDarkPalette(isDark);
  }

  // Listen for the toggle check/uncheck to toggle the dark palette
  public toggleChange = () => {
    this.paletteToggle  = this.paletteToggle === 'dark' ? 'light' : 'dark';
    this.toggleDarkPalette(this.paletteToggle === 'dark');
  }

  // Add or remove the "ion-palette-dark" class on the html element
  private toggleDarkPalette = (shouldAdd: boolean) => document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);

  public changeDate = () => {
    console.log('changeDate: updated date: ', this.currentDate)
  }

  public changeDateLabel = (value: string) => {
    this.dateLabel = value;
  }

  public changeCalendarView = (slideY: number) => {
    this.weekView = (slideY > 0) ? false : true;
    this.cd.detectChanges();
  }
}
