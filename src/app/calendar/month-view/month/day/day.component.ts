import { Component, OnInit, Input, HostListener } from '@angular/core';
import { SetColorsDirective } from '../../../../directives/set-colors.directive';
import { CommunicationService } from '../../../../services/communication.service'
import { ConcatSource } from 'webpack-sources';
import { ConstantPool } from '@angular/compiler';

@Component({
  selector: 'day',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.css']
})
export class DayComponent implements OnInit {
  @Input() colorThemeHue: number = 240;
  @Input() isItCueentMonthDay: boolean = true;
  constructor(private communicator: CommunicationService) { }
  @Input() dayDescriptor: {
    dayMonthIndex: number, 
    dayWeekIndex: number, 
    dayName: string, 
    month: number, 
    year: number,
    events?: any[]
  } = {dayMonthIndex: 0, dayWeekIndex: 0, dayName: '', month: 0, year: 0}

  informObjectCreated(){
    this.communicator.inform(
      'dayComponentCreated', 
      {day: this.dayDescriptor.dayMonthIndex, month: this.month, year: this.year}
    )
  }

  get events() { 
    if (this.dayDescriptor.events == undefined) return []
    if (typeof(this.dayDescriptor.events.entries) == 'function') return []
    return this.dayDescriptor.events.entries
  }
  set events(val: any) {
    this.dayDescriptor.events!.entries = val;
  }
  get monthDayIndex() {return this.dayDescriptor.dayMonthIndex;}
  get day() {return this.dayDescriptor.dayMonthIndex}
  get month() {return this.dayDescriptor.month}
  get year() {return this.dayDescriptor.year}
  get dayWeekIndex():number {return this.dayDescriptor.dayWeekIndex;}
  get uniqueId() {return `${this.month}/${this.day}`}

  grayDayClas = {
    'gray-day': !this.isItCueentMonthDay
  }


  @HostListener('click')
  onClick(){
    if(this.isItCueentMonthDay){
      let dataToSend = {
        day: this.dayDescriptor.dayMonthIndex,
        month: this.dayDescriptor.month,
        year: this.dayDescriptor.year,
        cw: 0,
        dayWeekIndex: this.dayWeekIndex,
        events: this.events
      }
      this.communicator.inform('eventViewerShouldBeDisplayed', dataToSend);
    }
  }

  ngOnDestroy(){
    this.communicator.unsubscribe(this.uniqueId);
  }

  ngOnInit(): void {
    this.communicator.subscribe(this.uniqueId, this.handleMessages.bind(this),
     ['eventWasMovedAndDayWasCreated', 'calendarEventsForDay', 'switchTaskViewerToNextDayOfTheSameYear'])
  }
  ngAfterViewInit(): void{
    this.informObjectCreated();
  }
  handleMessages(eventType: string, data: any){
    if (eventType == 'eventWasMovedAndDayWasCreated'){
      if (data.day == this.day && data.month == this.month) this.getNewEvents();
    }
    if (eventType == 'switchTaskViewerToNextDayOfTheSameYear'){
      if (data.day == this.day && data.month == this.month && data.year == this.year){
        this.onClick();
      } 
    }
    if (eventType == 'calendarEventsForDay'){
      if (data != null){
        if (data.year == this.year && this.month == data.month && data.day == this.day){
          
          this.events = data.events;
          let a = this.events
        }
      }
    }      
  }
  getNewEvents(){
    this.communicator.inform('provideCalendarEventsForSingleDay', 
    {day: this.day, month: this.month, year: this.year})
  }

  getBgColorDependOnEventsNumber(){
    if (!this.isItCueentMonthDay) return 'rgb(200, 200, 200)';
    if (this.events.length == 0) return  `hsl(${this.colorThemeHue}, 80%, 80%)`;
    if (this.events.length <=  2) return `hsl(${this.colorThemeHue}, 80%, 70%)`;
    if (this.events.length <=  4) return `hsl(${this.colorThemeHue}, 80%, 60%)`;
    if (this.events.length <=  6) return `hsl(${this.colorThemeHue}, 80%, 50%)`;
    if (this.events.length <=  8) return `hsl(${this.colorThemeHue}, 80%, 40%)`;
    return `hsl(${this.colorThemeHue}, 80%, 30%)`;
  }

}