import { Component, OnInit, Input } from '@angular/core';
import { Z_PARTIAL_FLUSH } from 'zlib';
import { CommunicationService } from '../../../services/communication.service';

@Component({
  selector: 'month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.css']
})
export class MonthComponent implements OnInit {
  @Input() events: any[] = []
  @Input() currentYear: number = 0;
  @Input() monthDescriptor: {
    monthIndex: number,
    monthName: string,
    weeks: {cwIndex: number, days: any[]}[]
  } = {monthIndex: 0, monthName: '', weeks: [{cwIndex: 0, days: []}]}
  @Input() year: number = 0;
  columnNames: string[] = ['CW', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  get monthName() {return this.monthDescriptor.monthName}
  get weeks()     {return this.monthDescriptor.weeks}
  get cwIndexes() {
    let cwIndexes: any[] = [];
    for(let week of this.weeks){
      cwIndexes.push(week.cwIndex)
    }
    return cwIndexes;
  }
  getDays(indexOfCw: number) { 
    let that = this;
    function getDays(cwIndex: number){
      function singleMatch(element: any) { return element.cwIndex == cwIndex }
      return that.weeks.findIndex(singleMatch)
    }
    return this.weeks[getDays(indexOfCw)].days
  }

  doesDayBelongToCurrentMonth(dayMonthIndex: number, currentMonthIndex: number){
    return dayMonthIndex == currentMonthIndex;
  }
  



  constructor(private communicator: CommunicationService) { }

  displayWeekView(data: any){
    let year = this.currentYear;
    let month = this.monthDescriptor.monthIndex;
    if (this.monthDescriptor.monthIndex == 11 && data == 1) {year++; month = 0}
    if (this.monthDescriptor.monthIndex == 0 && data >51) {year--; month = 11}
    this.communicator.inform('displayWeekView', {
      cwIndex: data,
      monthIndex: month,
      currentYear: year
    })
  }

  ngOnInit(): void {
  }

}
