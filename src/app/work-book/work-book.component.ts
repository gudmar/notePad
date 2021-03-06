import { Component, OnInit, Input, Output, ChangeDetectorRef, HostListener } from '@angular/core';
import { FalseDataMockService } from '../services/false-data-mock.service';
import { UniqueIdProviderService } from '../services/unique-id-provider.service';
import { NextColorGeneratorService } from '../services/next-color-generator.service'
import { DescriptorToDataService } from '../services/descriptor-to-data.service'
import { CommunicationService } from '../services/communication.service'
import { StorageManagerService } from '../services/storage-manager.service'
import { FileOperationsService } from '../services/file-operations.service';
import { DocumentValidatorService } from '../services/document-validator.service';
import { GetActiveNoteDataService } from '../services/get-active-note-data.service';
import { WindowSizeEvaluatorService } from '../services/window-size-evaluator.service';
import { GetDocumentService } from '../services/get-document.service';


@Component({
  selector: 'work-book',
  templateUrl: './work-book.component.html',
  styleUrls: ['./work-book.component.css'],
  providers: [
    FalseDataMockService,
              UniqueIdProviderService,
              NextColorGeneratorService
             ]
})
export class WorkBookComponent implements OnInit {
  _document: any = this.mockDataProvider.getDocumentFromMemory();
  _activeSheetId: string = this.document.activeSheetId;
  private _calendarInputs:any;
  currentSheetBgColor: string = '';
  currentSheetPages: any[] = [];
  currentSheetStartPageId: string = '';
  application: string = 'notes'
  // application: string = 'notes' //'calendar'
  listOfSheets:any[] = this.document.sheets;
  uniqueId: string = "workBookId"
  @Input() shouldBeHidden: boolean = false;
  @Input() documentContent: any;
  

  set activeSheetId(val: string){
    this._activeSheetId = val;
  }
  set document(val: any) {
    this._document = val;
    if (this._document.links == undefined) this.document.links = [];
    this.calendarInputs = val.calendarInputs
  };
  set calendarInputs(val: any){
    this._calendarInputs = val;
  }

  get activeSheetId() {return this._activeSheetId; }
  get document() {return this._document}
  get calendarInputs() {
    return this._calendarInputs;
  }

  colorGenerator = new NextColorGeneratorService();
  constructor(
    private descriptorTranslator: DescriptorToDataService, 
    private mockDataProvider: FalseDataMockService, 
    private idProvider: UniqueIdProviderService,
    private messenger: CommunicationService,
    private storageManager: StorageManagerService,
    private changeDetector: ChangeDetectorRef,
    private fileOperations: FileOperationsService,
    private documentValidator: DocumentValidatorService,
    private activeNoteGetter: GetActiveNoteDataService,
    private documentProvider: GetDocumentService
  ) { 
    messenger.subscribe(
      this.uniqueId, 
      this.handleMessages.bind(this), 
      ['storageOperation', 
      //  'addNextSheet', 
       'saveDocument', 
       'loadDocument', 
       'LoadFromFile',
       'switchToCalendar', 
       'switchToNotes',
      //  'changeSheetTitle',
       'loadFreshDocument',
       'saveToFile',
       'gotFileWithDataToLoad',
       'saveToLastUsedKey',
      //  'pageWasClicked',
       'clearAllCalendarInputs',
       'provideDocumentToChildComponent'
      //  'setLastAddedPageId'
      ]
    )
  }

  // getDocument(){
  //   let lastUsedDocument = this.storageManager.getLastUsedNoteDocument();
  //   if (lastUsedDocument != null){
  //     this.document = this.storageManager.loadContent(lastUsedDocument)
  //   } else {
  //     // this.document = this.storageManager.getFreshDocument();
  //     this.document = this.storageManager.getNewDocumentWithInstructions();
  //   }
  //   console.dir(this.document)
  // }

  handleMessages(eventType: string, data: any){
    if (eventType === "storageOperation") { 
      let feedback = this.storageManager.handleStorageOperation(data, this.document);
      // if (feedback.information === 'dataLoaded'){
      //   if (feedback.payload!= null){
      //     this.reloadDocument(feedback.payload)
      //     // this.document = feedback.payload;
      //     // this.listOfSheets = this.document.sheets;
      //     // this.activeSheetId = this.document.activeSheetId;    
      //     // this.initializeNewSheet(this.activeSheetId)    
      //   }
      // }
      if (feedback.information === 'keysExistingInStorage'){
        
      }
      
      if (feedback.information === 'newContent'){
        this.loadDocumentToView(feedback.payload)
      }
      // feedback.information: [dataSaved, dataLoaded, storageCleared, keysExistingInStorage]
    }
    if (eventType == "provideDocumentToChildComponent"){
      console.log(this.document)
      this.messenger.inform('providingDocumentObjectToWorkbookChild', this.document)
    }
    // if (eventType == 'pageWasClicked'){
    //   if(this.isHiddable) this.shouldBeHidden = true;
    // }
    if (eventType == 'clearAllCalendarInputs'){
      this.document.calendarInputs = [];
      this.calendarInputs = this.document.calendarInputs;
    }
    // if (eventType === 'addNextSheet'){
    //   if (data.after == 'last'){
    //     let lastSheetDescriptor: any = Object.values(this.listOfSheets[this.listOfSheets.length - 1])[0]
    //     this.listOfSheets.push(this.storageManager.getNextSheet(this.colorGenerator.getColorAfterGiven(lastSheetDescriptor.originalColor)))
    //   }
    // }
    if (eventType === 'saveDocument'){
      let copyOfDocument = JSON.parse(JSON.stringify(this.document));
      let activeNoteData = this.getActiveNoteData();
      if (activeNoteData != null) {
        this.changeNoteContent(copyOfDocument, activeNoteData.content, activeNoteData.uniqueId)
      }
      this.storageManager.saveContentAs(data, this.document)
      
    }
    if (eventType === 'saveToLastUsedKey'){
      let activeNoteData = this.activeNoteGetter.getActiveNoteData(this.messenger);
      this.storageManager.saveAsLastUsedKey(this.document, activeNoteData);
    }
    if (eventType == 'loadDocument'){
      let newDocument = this.storageManager.loadContent(data)
      this.reloadDocument(newDocument)
    }
    if (eventType == 'LoadFromFile'){
      this.reloadDocument(data)
    }
    if (eventType == 'switchToCalendar'){
      this.application = 'calendar'
    }
    if (eventType == 'switchToNotes'){this.application = 'notes'}
    // if (eventType == "changeSheetTitle"){
    //   if (data.uniqueId == this.activeSheetId){
    //     this.extractSheetDescriptor(data.uniqueId).title = data.title;
    //   }
    // }
    if (eventType =='loadFreshDocument'){
      let newDocument = this.storageManager.getNewDocumentAndClearLastUsed();
      this.reloadDocument(newDocument)
    }
    if (eventType == 'saveToFile'){
      this.messenger.inform('displaySaveToFileWindow', this.document)
    }
    // if (eventType == 'setLastAddedPageId'){
    //   this.setLastAddedPageId(data)
    // }
  }

  // ****************** MOVE TO SERVICE ******************************
  getActiveNoteData(){
    let tempId = 'getActiveNoteContent'
    let activeNote: any = null;
    let messageHandler = function(eventType: string, data: any){activeNote = data;}
    this.messenger.subscribe(tempId, messageHandler, ['activeNoteDataIs']);
    let wasTransmissionSuccess:boolean = this.messenger.informWithFeedback('getActiveNoteContent', '');
    this.messenger.unsubscribe(tempId);
    return activeNote
  }
  changeNoteContent(documentInstance: any, activeNoteContent:string, noteId:string){
    
  }
  /**************************************************************/

  reloadDocument(documentData: any){
    this.loadDocumentToView(this.mockDataProvider.getFreshDocument())
    this.loadDocumentToView(documentData)

  }

  loadDocumentToView(documentData: any){
    this.document = documentData;
    this.messenger.inform('providingDocumentObjectToWorkbookChild', this.document);
    // setTimeout(()=>{this.calendarInputs = this.document.calendarInputs;});
  }

  ngAfterViewInit(){
    setTimeout(()=>{this.calendarInputs = this.document.calendarInputs;});
  }



  ngOnInit(): void {
    // this.getDocument();
    this.document = this.documentProvider.getDocument();
    this.calendarInputs = this.document.calendarInputs;
  }

  extractSheetDescriptor(sheetId: string): any{
    let descriptor = this.descriptorTranslator.getElementFromArrayById(this.listOfSheets, sheetId);
    if (descriptor == undefined) return null;
    let _sheetDescriptor = descriptor.content
    return _sheetDescriptor
  }
}
