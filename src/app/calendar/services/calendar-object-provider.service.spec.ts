import { TestBed } from '@angular/core/testing';

import { CalendarObjectProviderService } from './calendar-object-provider.service';
import { EventManagerService } from './event-manager.service';

xdescribe('CalendarObjectProviderService', () => {
  let service: CalendarObjectProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventManagerService]
    });
    service = TestBed.inject(CalendarObjectProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct CWs', () => {
    let calendar = new CalendarObjectProviderService(new EventManagerService());
    let transformToValid = function(m: number):0|1|2|3|4|5|6|7|8|9|10|11{
      return <0|1|2|3|4|5|6|7|8|9|10|11>m;
    }
    let testCases = [
      {input: {year: 2021, month: transformToValid(7), day: 23}, expected: 34},
      {input: {year: 2021, month: transformToValid(11), day: 31}, expected: 52},
      {input: {year: 2022, month: transformToValid(0), day: 1}, expected: 52},
      {input: {year: 2021, month: transformToValid(0), day: 1}, expected: 53},
      {input: {year: 2021, month: transformToValid(0), day: 4}, expected: 1},
      {input: {year: 2021, month: transformToValid(0), day: 3}, expected: 53},
      {input: {year: 2020, month: transformToValid(11), day: 30}, expected: 53},
      {input: {year: 2016, month: transformToValid(11), day: 31}, expected: 52},
      {input: {year: 2017, month: transformToValid(0), day: 1}, expected: 52},
      {input: {year: 2013, month: transformToValid(0), day: 1}, expected: 1},
      {input: {year: 2012, month: transformToValid(11), day: 31}, expected: 1},
      {input: {year: 2022, month: transformToValid(10), day: 1}, expected: 44},
      {input: {year: 2023, month: transformToValid(11), day: 31}, expected: 52},
      {input: {year: 2024, month: transformToValid(0), day: 1}, expected: 1},
      {input: {year: 2024, month: transformToValid(11), day: 29}, expected: 52},
      {input: {year: 2024, month: transformToValid(11), day: 30}, expected: 1},
      {input: {year: 2025, month: transformToValid(0), day: 1}, expected: 1},
      {input: {year: 2028, month: transformToValid(3), day: 2}, expected: 13},
      {input: {year: 2028, month: transformToValid(3), day: 9}, expected: 14},
    ]
      for (let testCase of testCases){
        expect(calendar.getCW(testCase.input.year, testCase.input.month, testCase.input.day)).toBe(testCase.expected)
      }
  });
  it('should return correct first day of CW', ()=>{
    let calendar = new CalendarObjectProviderService(new EventManagerService());
    let dateToString = function(date: any){
      return `${date.year}, ${date.month}, ${date.day}`
    }
    let testCases = [
      {input: {year: 2021, cw: 5}, expected: '2021, 1, 1'},
      {input: {year: 2021, cw: 30}, expected: '2021, 6, 26'},
      {input: {year: 2021, cw: 52}, expected: '2021, 11, 27'},
      {input: {year: 2022, cw: 52}, expected: '2022, 11, 26'},
      {input: {year: 2022, cw: 1}, expected: '2022, 0, 3'},
      {input: {year: 2025, cw: 1}, expected: '2024, 11, 30'},
      {input: {year: 2026, cw: 53}, expected: '2026, 11, 28'},
      {input: {year: 2027, cw: 53}, expected: '2027, undefined, -1'},
      {input: {year: 2027, cw: 52}, expected: '2027, 11, 27'},
      {input: {year: 2028, cw: 52}, expected: '2028, 11, 25'},
    ]
    for (let testCase of testCases){
      let calculatedResult = calendar.getDateOfFirstCWDay(testCase.input.year, testCase.input.cw)
      expect(dateToString(calculatedResult)).toBe(testCase.expected)
    }
  });
  it('should return correct last day of CW', ()=>{
    let calendar = new CalendarObjectProviderService(new EventManagerService());
    let dateToString = function(date: any){
      return `${date.year}, ${date.month}, ${date.day}`
    }
    let testCases = [
      {input: {year: 2021, cw: 5}, expected: '2021, 1, 7'},
      {input: {year: 2024, cw: 9}, expected: '2024, 2, 3'},
      {input: {year: 2024, cw: 52}, expected: '2024, 11, 29'},
      {input: {year: 2024, cw: 1}, expected: '2024, 0, 7'},
      {input: {year: 2024, cw: 40}, expected: '2024, 9, 6'},
      {input: {year: 2024, cw: 22}, expected: '2024, 5, 2'},
      {input: {year: 2026, cw: 53}, expected: '2027, 0, 3'},
      {input: {year: 2027, cw: 53}, expected: '-1, -1, -1'},
      {input: {year: 2028, cw: 52}, expected: '2028, 11, 31'},
      {input: {year: 2029, cw: 1}, expected: '2029, 0, 7'},
    ]
    for (let testCase of testCases){
      let calculatedResult = calendar.getDateOfLastCWDay(testCase.input.year, testCase.input.cw)
      expect(dateToString(calculatedResult)).toBe(testCase.expected)
    }
  })

  it('should return correct CW contained in given month', ()=>{
    let calendar = new CalendarObjectProviderService(new EventManagerService());
    let toString = function(array: any[]) {return array.join(',')}
    let testCases = [
      {input: {year: 2028, month: 1}, expected: '5,6,7,8,9'},
      {input: {year: 2028, month: 6}, expected: '26,27,28,29,30,31'},
      {input: {year: 2028, month: 11}, expected: '48,49,50,51,52'},
      {input: {year: 2030, month: 0}, expected: '1,2,3,4,5'},
      {input: {year: 2031, month: 11}, expected: '49,50,51,52,1'},
      {input: {year: 2032, month: 11}, expected: '49,50,51,52,53'},
      {input: {year: 2033, month: 0}, expected: '53,1,2,3,4,5'},
      
    ]
    for (let testCase of testCases){
      let claculatedOutput = calendar.getCWNumbersForMonth(testCase.input.year, testCase.input.month)
      expect(toString(claculatedOutput)).toBe(testCase.expected)
    }
  })
  it('should return correct day descriptors of given CW', ()=>{
    let calendar = new CalendarObjectProviderService(new EventManagerService())
    let testCases = [
      {input: {year: 2028, cw: 22}, output: {key: 'dayMonthIndex', values: [29, 30, 31, 1, 2, 3, 4]}},
      {input: {year: 2028, cw: 22}, output: {key: 'dayWeekIndex', values: [1, 2, 3, 4, 5, 6, 7]}},
      {input: {year: 2028, cw: 22}, output: {key: 'dayName', values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}},
      {input: {year: 2027, cw: 52}, output: {key: 'dayMonthIndex', values: [27, 28, 29, 30, 31, 1, 2]}},
      {input: {year: 2027, cw: 52}, output: {key: 'dayWeekIndex', values: [1, 2, 3, 4, 5, 6, 7]}},
      {input: {year: 2027, cw: 52}, output: {key: 'year', values: [2027, 2027, 2027, 2027, 2027, 2028, 2028]}},
    ]
    function getValuesFromDescriptor(key: string, descriptors: any[]){
      let outputArray: any[] = [];
      for(let i of descriptors){
        outputArray.push(i[key])
      }
      return outputArray
    }
    for (let tc of testCases){
      let descriptors = calendar.getDaysOfCW(tc.input.year, tc.input.cw);
      let calculatedValues = getValuesFromDescriptor(tc.output.key, descriptors)
      expect(calculatedValues).toEqual(tc.output.values)
    }
  })
});

// getSingleDayDescriptor(date: {year: number, month: number, day: number}): any {
//   let dateAsString = this.getDateAsString(date.year, date.month, date.day);
//   let dateAsObject = this.getDateObject(date.year, date.month, date.day);
//   function convertDayIndex(dayIndexSaturday0: number) {
//     return dayIndexSaturday0 == 0 ? 7 : dayIndexSaturday0;
//   }
//   return { 
//     dayMonthIndex: date.day, 
//     dayWeekIndex: convertDayIndex(dateAsObject.getDay()),
//     dayName: this.getDayName(dateAsObject.getDay()),
//     month: date.month,
//     year: date.year
//   }
// }

