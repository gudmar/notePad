import { Component, OnInit, Input } from '@angular/core';
import { StorageManagerService } from '../../services/storage-manager.service';
import { CommunicationService } from '../../services/communication.service'
import { UniqueIdProviderService } from '../../services/unique-id-provider.service'

@Component({
  selector: 'save-load-window',
  templateUrl: './save-load-window.component.html',
  styleUrls: ['./save-load-window.component.css']
})
export class SaveLoadWindowComponent implements OnInit {
  itemsFromStorage: any[] = [];
  private _currentlySelectedItem: string = '';
  set currentlySelectedItem(val: string){
    this._currentlySelectedItem = val;

  }
  get currentlySelectedItem() {return this._currentlySelectedItem}
  keys: any[] = [];
  @Input() shouldBeDisplayed: boolean = false;
  @Input() isItSaveApplicationVariant: boolean = true;
  uniqueId: string = 'saveLoadId';
  constructor(
    private storageManager: StorageManagerService,
    private communicator: CommunicationService,
    private uuidProvider: UniqueIdProviderService
  ) { 
    communicator.subscribe(
      this.uniqueId, 
      this.handleMessages.bind(this), 
      ['displaySaveWindow', 'displayLoadWindow']
    )
  }
  isThisActive(key: string){
    return {
      active: key == this._currentlySelectedItem
    }    
  }

  keyChosen(data: any){
    this.currentlySelectedItem = data;

  }

  handleMessages(eventType: string, data: any){
    if (eventType === 'displaySaveWindow') {
      this.isItSaveApplicationVariant = true;
      this.shouldBeDisplayed = true;
    }
    if (eventType === 'displayLoadWindow') {
      this.isItSaveApplicationVariant = false;
      this.shouldBeDisplayed = true;
    }
  }

  getAllKesyFromStorage(){

    return this.storageManager.getAllItemsFromStorage()
  }

  setCurrentlySelectedItem(value: string){
    this.currentlySelectedItem = value;
  }

  confirmation(){
    this.communicator.inform('saveDocument', this.currentlySelectedItem);
    this.shouldBeDisplayed = false;
    console.error('Save load component: should bind input event of editable element to currentValue')
  }

  removeCurrent(){
    this.storageManager.deleteSingleKey(this.currentlySelectedItem);
    this.refresh();
  }

  negation(){}

  shutSaveLoadWindow(){
    this.shouldBeDisplayed = false;
  }

  clearAllContent(){
    this.storageManager.clearStorage();
    this.refresh();
  }

  generateMocks(){
      for (let i = 0; i < 40; i++){
        localStorage.setItem(`test ${i}`, '')
    }
    this.refresh();
  }

  refresh(){
    this.keys = this.getAllKesyFromStorage().sort((a, b) => a.localeCompare(b));
  }

  ngOnInit(): void {
    this.refresh();
  }

}
