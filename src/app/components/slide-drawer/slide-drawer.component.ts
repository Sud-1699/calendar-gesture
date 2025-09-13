import { AfterViewInit, Component, ElementRef, inject, Input, input, OnDestroy, OnInit, output, Renderer2, viewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, GestureController, GestureConfig } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { remove } from 'ionicons/icons';

@Component({
  selector: 'app-slide-drawer',
  templateUrl: './slide-drawer.component.html',
  styleUrls: ['./slide-drawer.component.scss'],
  imports: [
    IonContent,
    IonIcon,
    IonButton,
    IonToolbar,
    IonHeader,
    IonButtons
  ],
})
export class SlideDrawerComponent implements OnInit, OnDestroy, AfterViewInit {

  static instanceCount: number = 0;

  public contentHeight = input.required<string>();
  public minOpenHeight = input.required<number>();
  public maxOpenHeight = input.required<number>();
  public minViewHeight = input.required<number>();
  public maxViewHeight = input.required<number>();

  public slideYEvent = output<number>();

  public _content = viewChild<IonContent>('ion-content');

  private state: 'top' | 'bottom' = 'top';
  private thresholdHeight: number = 20;

  public slideId: string = 'header';

  get content() {
    return this._content();
  }

  private gestureCtrl = inject(GestureController);
  private element = inject(ElementRef);
  private renderer = inject(Renderer2);

  constructor() {
    addIcons({
      remove
    });

    SlideDrawerComponent.instanceCount++;
    this.slideId = `header-${SlideDrawerComponent.instanceCount}`;
  }

  ngOnInit() { }

  ngOnDestroy() {
    SlideDrawerComponent.instanceCount--;
  }

  async ngAfterViewInit() {
    this.renderer.setStyle(this.element.nativeElement, 'top', `${this.minOpenHeight()}px`);
    this.renderer.setStyle(this.element.nativeElement, 'height', `cal(100vh - ${this.maxViewHeight()}px)`);

    const options: GestureConfig = {
      el: document.querySelector(`#${this.slideId}`)!,
      direction: 'y',
      gestureName: 'slide-drawer',
      onStart: (ev) => this.renderer.setStyle(this.element.nativeElement, 'transition', 'none'),
      onMove: (ev) => {
        const deltaY: number = Math.round(ev.deltaY);

        if (this.state === 'bottom' && (deltaY + this.maxOpenHeight()) >= 0 && deltaY < 0) { //Bottom to Top slide
          this.renderer.setStyle(this.element.nativeElement, 'transform', `translateY(${deltaY + this.maxOpenHeight()}px)`);
          this.renderer.setStyle(this.element.nativeElement, 'height', `calc(100vh - ${this.maxViewHeight()}px)`);
        } else if (this.state === 'top' && deltaY >= 0 && deltaY <= this.maxOpenHeight()) { //Top to Bottm slide
          this.renderer.setStyle(this.element.nativeElement, 'transform', `translateY(${deltaY}px)`);
          this.slideYEvent.emit(deltaY);
        }
      },
      onEnd: (ev) => {
        // do something when the gesture ends
        const deltaY: number = Math.round(ev.deltaY);
        this.renderer.setStyle(this.element.nativeElement, 'transition', '0.3s linear'); //ease-out
        if (this.state === 'bottom') {
          if ((deltaY + this.maxOpenHeight()) <= 0) {
            console.log("onEnd1: deltaY", deltaY);
            this.renderer.setStyle(this.element.nativeElement, 'transform', `translateY(0px)`);
            this.renderer.setStyle(this.element.nativeElement, 'height', `calc(100vh - ${this.maxViewHeight()}px)`);
            this.state = 'top';
            this.slideYEvent.emit(0);
          } else {
            console.log("onEnd2: deltaY", deltaY);
            this.renderer.setStyle(this.element.nativeElement, 'transform', `translateY(${this.maxOpenHeight()}px)`);
            this.renderer.setStyle(this.element.nativeElement, 'height', `calc(100vh - ${this.minViewHeight()}px)`);
            this.slideYEvent.emit(this.maxOpenHeight());
          }
        } else if (this.state === 'top') {
          if (deltaY >= (this.maxOpenHeight() - this.thresholdHeight)) {
            console.log("onEnd3: deltaY", deltaY);
            this.renderer.setStyle(this.element.nativeElement, 'transform', `translateY(${this.maxOpenHeight()}px)`);
            this.renderer.setStyle(this.element.nativeElement, 'height', `calc(100vh - ${this.minViewHeight()}px)`);
            this.state = 'bottom';
            this.slideYEvent.emit(this.maxOpenHeight());
          } else {
            console.log("onEnd4: deltaY", deltaY);
            this.renderer.setStyle(this.element.nativeElement, 'transform', `translateY(0px)`);
            this.renderer.setStyle(this.element.nativeElement, 'height', `calc(100vh - ${this.maxViewHeight()}px)`);
            this.slideYEvent.emit(0);
          }
        }
      }
    };

    const gesture = await this.gestureCtrl.create(options);
    gesture.enable();
  }
}
