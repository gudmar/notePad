import { Injectable } from '@angular/core';
import { UniqueIdProviderService } from './unique-id-provider.service';
import { NextColorGeneratorService } from './next-color-generator.service'

@Injectable({
  providedIn: 'root'
})
export class StorageManagerService {
  constructor(private idProvider: UniqueIdProviderService,
    private colorProvider: NextColorGeneratorService) { }

  saveContent(data: any){
    console.dir(data)
    localStorage.setItem('notePad', JSON.stringify(data))
  }

  loadContent(){
    let content = localStorage.getItem('notePad')
    if (content == null) return content
    return JSON.parse(content);
  }

  clearStorage(){
    localStorage.clear();
  }

  removeItemFromStorage(key: string){
    localStorage.removeItem(key)
  }

  getAllItemsFromStorage(){
    return Object.keys(localStorage);
  }

  handleStorageOperation(operationType: string, applicationData: any){
    if (operationType === 'saveWholeDocument') { 
      this.saveContent(applicationData);
      return {information: 'dataSaved'}
    }
    if (operationType === 'loadWholeDocument'){
      return {information: 'dataLoaded', payload: this.loadContent()}
    }
    if (operationType === 'clearStorage'){
      this.clearStorage();
      return {information: 'sotrageCleared'}
    }
    if (operationType === 'getAllKeysFromStorage'){
      return {information: 'keysExistingInStorage', payload: this.getAllItemsFromStorage()}
    }
    if (operationType === 'newDocument'){
      return {information: 'newContent', payload: this.getFreshDocument()}
    }


    return {information: 'operation not supported'}
  }

  // ('loadWholeDocument')"
  // >
  // </wb-button>
  // <wb-button [uniqueId] = "'clearStorageId'"
  //         [isPushed] = "false"
  //         [pictogram] = "'Clear'"
  //         (wasClicked) = "passDataFromStorageToWBComponent('clearStorage')"
  // >
  // </wb-button>
  // <wb-button [uniqueId] = "'GetAllFromStoratge'"
  //     [isPushed] = "false"
  //     [pictogram] = "'Get all'"
  //     (wasClicked) = "passDataFromStorageToWBComponent('getAllKeysFromStorage')"

  getFreshDocument(){
    this.colorProvider.restart();
    let startColor = this.colorProvider.getNextColor();
    let newSheet = this.getFreshSheet(startColor);
    return {
      activeSheetId: Object.keys(newSheet)[0],
      sheets: [newSheet],
      calendarInputs: this.getFreshCalendar(),
    }
    
  }

  getNextAddedPage(){
    let color = this.colorProvider.getNextColor();
    return this.getPage(color, 'mock-page', []);
  }
  getFreshCalendar(){
    return {}
  }
  getFreshSheet(startColor: string){
    let freshPage = this.getFreshPage(startColor);
    return this.getSheet(startColor, 'newSheet', [freshPage], Object.keys(freshPage)[0])
    }
  getFreshPage(startColor: string){
    return this.getPage(startColor, 'newPage', []);
  }
  getSheet(color: string, title: string, pages:any[], startPageId: string){
    let id = this.idProvider.getUniqueId();
    let output = {[id]: {}}
    output[id] = {
      bgColor: color,
      title: title,
      pages: pages,
      startPageId: startPageId
    }
    return output
  }

  getPage(color: string, title: string, content: any[]){
    let id = this.idProvider.getUniqueId();
    let output = {[id]: {}}
    output[id] = {
      notes: content,
      bgColor: color,
      title: title
    }
    return output;
  }

  getNote(initialWidth: number, initialHeight: number, initialTop: number, initialLeft: number, content: string){
    let output = {
      uniqueId: this.idProvider.getUniqueId(),
      initialWidth: initialWidth,
      initialHeight: initialHeight,
      initialTop: initialTop,
      initialLeft: initialLeft,
      content: content
    }
    return output
  }

}