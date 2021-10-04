import { Component, OnInit, Input } from '@angular/core';
import { CommunicationService } from '../../services/communication.service'
import { CalendarObjectProviderService } from '../services/calendar-object-provider.service'
// import { EEXIST } from 'constants';
// import { ConcatSource } from 'webpack-sources';
import { UniqueIdProviderService } from '../../services/unique-id-provider.service';
import { EventManagerService } from '../services/event-manager.service';
import { WindowSizeEvaluatorService } from '../../services/window-size-evaluator.service'
import { ValidatorService } from '../services/validator.service';
// import { ConstantPool } from '@angular/compiler';

@Component({
  selector: 'task-viewer',
  templateUrl: './task-viewer.component.html',
  styleUrls: ['./task-viewer.component.css']
})
export class TaskViewerComponent implements OnInit {
  private _shouldMoveWindowBeVisible: boolean = false;
  dayWeekIndex: number = 0;
  uniqueId: string = 'taskViewerId'
  allCalendarEvents: any;
  get shouldDisplayMobileVersion() {return this.windowSizeEvaluator.isWindowTooNarrow(700)}
  @Input() day: number = 0;
  @Input() month: number = 0;
  @Input() year: number = 0;
  @Input() cw: number = 0;
  @Input() events: any[] = [];
  shouldBeDisplayed: boolean = false;
  set shouldMoveWindowBeVisible(val: boolean) {
    this._shouldMoveWindowBeVisible = val;
    if (val == false) this.eventToMoveId = '';
  }
  get shouldMoveWindowBeVisible() {return this._shouldMoveWindowBeVisible}
  eventToMoveId: string = '';
  private indexOfTaskToShowInForm: number = 0;
  shouldShowEditFrom: boolean = false;
  get formTask() {return this.events[this.indexOfTaskToShowInForm]}
  // get formHour(){return this.events[this.indexOfTaskToShowInForm].hours}
  // get formDuration(){return this.events[this.indexOfTaskToShowInForm].duration}
  // get formSummary(){return this.events[this.indexOfTaskToShowInForm].summary}
  // get formDescription(){return this.events[this.indexOfTaskToShowInForm].description}


  openMoveWindow(uniqueId: string) {
    this.eventToMoveId = uniqueId;
    this.shouldMoveWindowBeVisible = true;
  }
  showEditForm(index: number){
    this.shouldShowEditFrom = true;
    this.indexOfTaskToShowInForm = index;
  }

  get entries() {return this.events}
  get dayAsString() {return this.calendarProvider.getDayName(this.dayWeekIndex)}
  get currentDate() {
    return `${this.day} / ${this.month} / ${this.year} CW: ${this.cw}`
  }
  constructor(
    private communicator: CommunicationService,
    private eventManager: EventManagerService,
    private calendarProvider: CalendarObjectProviderService,
    private uuidProvider: UniqueIdProviderService,
    private windowSizeEvaluator: WindowSizeEvaluatorService,
    private validator: ValidatorService,
  ) { 
    communicator.subscribe(this.uniqueId, this.handleMessages.bind(this), 
    ['eventViewerShouldBeDisplayed', 'calendarEvents', 'taskEditFormShouldBeClosed'])
  }


  setTaskMinutes(event:any, uniqueId: string){
    this.modifyIfValid(uniqueId, 'minutes', event.target.innerText, this.validator.isMinutesValid.bind(this,event.target.innerText))
  }
  setTaskHours(event:any, uniqueId: string){
    this.modifyIfValid(uniqueId, 'hours', event.target.innerText, this.validator.isHoursValid.bind(this,event.target.innerText))
  }
  setTaskDuration(event:any, uniqueId: string){
    this.modifyIfValid(uniqueId, 'duration', event.target.innerText, this.validator.isDurationValid.bind(this,event.target.innerText))
  }
  setTaskSummary(event:any, uniqueId: string){
    this.modifyIfValid(uniqueId, 'summary', event.target.innerText, this.validator.isSummaryValid.bind(this,event.target.innerText))
  }
  setTaskDescription(event: any, uniqueId: string){
    this.modifyIfValid(uniqueId, 'description', event.target.innerText, ()=>{return true;})
  }



  // hourValidationClass = {'valid': false,'notValid': false}
  // validateHours(event: any){
  //   setTimeout(()=>{
  //     let isValid = this.hoursMinutesValidationFunctionFactory(24)(event.target.innerText)
  //     event.target.style.backgroundColor = isValid?'rgb(180, 255, 180)':'rgb(255, 180, 180)'
  //   })
  // }
  // validateMinutes(event: any){
  //   setTimeout(()=>{
  //     let isValid = this.hoursMinutesValidationFunctionFactory(59)(event.target.innerText)
  //     event.target.style.backgroundColor = isValid?'rgb(180, 255, 180)':'rgb(255, 180, 180)'
  //   })
  // }
  // validateDuration(event: any){
  //   setTimeout(()=>{
  //     let isValid = this.durationValidationFunction(event.target.innerText)
  //     event.target.style.backgroundColor = isValid?'rgb(180, 255, 180)':'rgb(255, 180, 180)'
  //   })
  // }
  // validateSummary(event: any){
  //   setTimeout(()=>{
  //     let isValid = this.summaryValidationFunction(event.target.innerText)
  //     event.target.style.backgroundColor = isValid?'rgb(180, 255, 180)':'rgb(255, 180, 180)'
  //   })
  // }

  add0prefix(n: number){
    return parseInt(n.toString()) < 10 ? `0${parseInt(n.toString())}` : n;
  }

  handleMessages(eventType: string, data: any){
    if (eventType == 'calendarEvents') {
      this.allCalendarEvents = data;
    }
    if (eventType == 'eventViewerShouldBeDisplayed'){
      this.day = data.day;
      this.month = data.month;
      this.year = data.year;
      this.cw = data.cw;
      this.dayWeekIndex = data.dayWeekIndex,
      this.events = data.events;
      this.shouldBeDisplayed = true;
    }
    if (eventType == 'taskEditFormShouldBeClosed'){
      this.shouldShowEditFrom = false;
    }
  }

  switchToAnotherDay(offset: -1 | 1){
    let nextDate:any;
    if (offset == 1) nextDate = this.calendarProvider.getNextDay({year: this.year, month: this.month, day: this.day});
    if (offset == -1) nextDate = this.calendarProvider.getPreviousDay({year: this.year, month: this.month, day: this.day});
    if (this.year == nextDate.year){
      this.communicator.inform('switchTaskViewerToNextDayOfTheSameYear', nextDate);
    } else {
      this.communicator.inform('switchTaskViewerToNextDayDifferentYear', nextDate);
    }
    this.shouldMoveWindowBeVisible = false;
  }

  ngOnInit(): void {
    this.communicator.inform('provideCalendarEvents', '')
  }

  close(){
    this.shouldBeDisplayed = false;
    this.shouldMoveWindowBeVisible = false;
  }

  addEventAfter(event: any, uniqueId: string){
    let eventToAddAfterIndex = this.getIndexOfElemetnInArray(this.events, 'uniqueId', uniqueId);
    this.events.splice(eventToAddAfterIndex, 0, {
      hours: 0, minutes: 0, duration: 0, summary: '', description: '', uniqueId: this.uuidProvider.getUniqueId()
    })
    // debugger
  }

  removeEvent(event:any, uniqueId: string){
    let eventToBeRemovedIndex = this.getIndexOfElemetnInArray(this.events, 'uniqueId', uniqueId);
    this.events.splice(eventToBeRemovedIndex, 1);
  }

  // onFocusOut(event: any, modificationTarget: string, uniqueId: string){
  //   event.target.style.backgroundColor = ''
  //   this.modifyNote(event, modificationTarget, uniqueId)
  // }

  // modifyNote(event: any, modificationTarget: string, uniqueId: string){
  //   event.stopPropagation();
  //   let valueFromField = event.target.innerText;

  //   let isValid: boolean = false;
  //   if (modificationTarget == 'hours') { 
  //     isValid = this.modifyIfValid(uniqueId, modificationTarget, valueFromField, 
  //       this.hoursMinutesValidationFunctionFactory(24))
  //   } else if (modificationTarget == 'minutes') {
  //     isValid = this.modifyIfValid(uniqueId, modificationTarget, valueFromField, 
  //       this.hoursMinutesValidationFunctionFactory(59))
  //   } else if (modificationTarget == 'summary') { 
  //     isValid = this.modifyIfValid(uniqueId, modificationTarget, valueFromField, this.summaryValidationFunction)
  //   } else if (modificationTarget == 'duration') { 
  //     isValid = this.modifyIfValid(uniqueId, modificationTarget, valueFromField, this.durationValidationFunction)
  //   } else if (modificationTarget == 'description') { 
  //     isValid = true;
  //     this.modifyEvent(uniqueId, modificationTarget, valueFromField);
  //   }
  //   if (modificationTarget == "hours" || modificationTarget == "minutes"){
  //     let a = this.add0prefix(this.getOriginalValue(uniqueId, modificationTarget));
    
  //     if (!isValid) event.target.innerText = this.add0prefix(this.getOriginalValue(uniqueId, modificationTarget))
  //     event.target.innerText = this.add0prefix(event.target.innerText)
  //   } else {
  //     if (!isValid) event.target.innerText = this.getOriginalValue(uniqueId, modificationTarget)
  //     if (modificationTarget == 'duration') event.target.innerText = parseInt(event.target.innerText)
  //   }
    
  // }
  // summaryValidationFunction(toValidate: any){
  //   return toValidate.toString().length <= 50;
  // }

  // hoursMinutesValidationFunctionFactory(maxVal: number){
  //   let max = maxVal;
  //   return (toValidate:string | number) => {
  //     let digitRe = new RegExp('\\d{1,2}');
  //     let nonDigitRe = new RegExp('\\D')
  //     let a = nonDigitRe.test(toValidate.toString())
  //     let b  = digitRe.test(toValidate.toString())
  //     if (nonDigitRe.test(toValidate.toString())) return false;
  //     if (!digitRe.test(toValidate.toString())) return false;
  //     if (parseInt(toValidate.toString()) < 0 || parseInt(toValidate.toString()) >= maxVal) return false;

  //     return true;  
  //   }
  // }
  // durationValidationFunction(toValidate: string | number){
  //   let nonDigitRe = new RegExp('\\D')
  //   if (toValidate == '') return false;
  //   if (nonDigitRe.test(toValidate.toString())) return false;
  //   if (parseInt(toValidate.toString()) > 999) return false
  //   return true;
  // }
  
  modifyIfValid(uniqueId: string, key: string, newValue: any, conditionFunction: Function){
    let isValid = conditionFunction(newValue);
    if (isValid) this.modifyEvent(uniqueId, key, newValue);
    return isValid
  }
  modifyEvent(uniqueId: string, key: string, newValue: any){
    let objectToModify: any = this.events[this.getIndexOfElemetnInArray(this.events, 'uniqueId', uniqueId)]
    objectToModify[key] = newValue;
  }

  // getOriginalValue(uniqueId: string, key: string){
  //   return this.events[this.getIndexOfElemetnInArray(this.events, 'uniqueId', uniqueId)][key]
  // }

  getIndexOfElemetnInArray(array: any[], matchKey: string, value: any){
    let singleMatch = function(element: any) { return element[matchKey] == value; }
    return array.findIndex(singleMatch);
  }

  addFirstTask(){
    let executionStatus = this.eventManager.addFirstTask(
      {day: this.day, month: this.month, year: this.year}, 
      this.allCalendarEvents, 
      this.uuidProvider.getUniqueId()
  )
    this.events = this.eventManager.fetchDayEvents(this.year, this.month, this.day, this.allCalendarEvents).entries
    this.infromComponentsAboutChange(executionStatus)
  }

  infromComponentsAboutChange(whatObjecsWereAdded: any){
    if (whatObjecsWereAdded.newDayWasCreated) this.informDayComponentsAboutChange();
  }

  informDayComponentsAboutChange(){
    this.communicator.inform('eventWasMovedAndDayWasCreated', {day: this.day, month: this.month})
  }
  informMonthComponentsAboutChange(){
    this.communicator.inform('eventWasMovedAndMonthWasCreated', {month: this.month})
  }
  

}
