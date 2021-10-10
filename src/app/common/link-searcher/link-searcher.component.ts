import { Component, OnInit, Input, HostListener } from '@angular/core';
import { UniqueIdProviderService } from '../../services/unique-id-provider.service';
import { CommunicationService } from '../../services/communication.service';
import { link } from 'fs';
import { ConcatSource } from 'webpack-sources';

@Component({
  selector: 'link-searcher',
  templateUrl: './link-searcher.component.html',
  styleUrls: ['./link-searcher.component.css'],
  providers: [UniqueIdProviderService]
})
export class LinkSearcherComponent implements OnInit {
  @Input() linkDescriptorArray: any[] = [];
  filter: string = '';
  shouldBeDisplayed: boolean = true;
  currentlyVisibleLinks: any[] = [];
  searchFilter: string = '';
  uniqueId: string = 'linkSeracherId'
  constructor(
    private uuidProvider: UniqueIdProviderService, 
    private communicator: CommunicationService
  ) { 
    this.communicator.subscribe(this.uniqueId, this.handleMessages.bind(this), ['openLinkSearcher'])
  }

  ngOnInit(): void {
  }

  handleMessages(eventType: string, data: any){
    if (eventType == "openLinkSearcher"){this.shouldBeDisplayed=true;}
  }


  openAddLinkForm(){
    this.communicator.inform('openAddLinkForm', this.linkDescriptorArray);
  }
  getFilter(event:any){
    this.filter = event.target.innerText;
  }
  close(){
    this.shouldBeDisplayed = false;
  }

  descriptorCompare(a: any, b: any){
    let strA = a.topic + ' ' + a.description;
    let strB = b.topic + ' '  + b.description;
    return strA.localeCompare(strB);
  }

  shouldLinkBeDisplayed(linkDescriptor:any){
    let stringToFindIn = linkDescriptor.topic + ' ' + linkDescriptor.description;
    let valueToFind = this.filter;
    return this.doesStringContain(stringToFindIn, valueToFind)
  }

  doesStringContain(stringToFindIn:string, pattern: string){
    return stringToFindIn.toLocaleLowerCase().indexOf(pattern.toLocaleLowerCase()) == -1 ? false : true;
  }

  showEditLinkWindow(event:any){
    this.communicator.inform('openEditLinkForm', {links: this.linkDescriptorArray, linkDescriptor: event});
  }

}