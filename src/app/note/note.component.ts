import { 
  Component, 
  OnInit, 
  EventEmitter, 
  Output, 
  Input, 
  Host, 
  ViewChild, 
  ElementRef, 
  HostListener 
} from '@angular/core';

import { CommunicationService } from '../services/communication.service'
import { NextColorGeneratorService } from '../services/next-color-generator.service'

@Component({
  selector: 'note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css'],
  // providers: [CommunicationService]
})
export class NoteComponent implements OnInit {
  private _isActive: boolean = false;
  @Input() initialWidth: number = 100;
  @Input() initialHeight: number = 100;
  @Input() initialTop: number = 30;
  @Input() initialLeft: number = 30;
  @Input() content: string = '';
  @Input() uniqueId: string = '';
  @Input() bgColor: string = '';
  @Input() set isActive (val: boolean) {
    this._isActive = val;
    if (val == true){
      if (this.colorManager.getFgColor(this.bgColor) === 'white') {
        this.dynamicClass['active-bgDark'] = true;
        this.dynamicClass['active-bgLight'] = false;
      }
      if (this.colorManager.getFgColor(this.bgColor) === 'black') {
        this.dynamicClass['active-bgDark'] = false;
        this.dynamicClass['active-bgLight'] = true;
      }
      this.elRef.nativeElement.querySelector('.content-holder').focus();
    } else {
      this.dynamicClass['active-bgDark'] = false;
      this.dynamicClass['active-bgLight'] = false;    
    }
  }
  get isActive() {return this._isActive}
  @Output() noteWasMoved: EventEmitter<any> = new EventEmitter();
  @Output() noteWasResized: EventEmitter<any> = new EventEmitter();
  @Output() noteContentChanged: EventEmitter<any> = new EventEmitter();
  private _wasActivated: boolean = false;
  @ViewChild('contentHolder') contentHolder: any;

  @HostListener('click', ['$event'])
  thisNoteWasClicked($event: any){
    this.messenger.inform('noteWasClicked', this.uniqueId)
    $event.stopPropagation();
  }



  dynamicClass: any = {
    'active-bgDark': false,
    'active-bgLight': false
  }

  constructor(
    private messenger: CommunicationService, 
    private colorManager: NextColorGeneratorService,
    private elRef: ElementRef
  ) { }

  informAboutMovement(data: any){
    this.noteWasMoved.emit(data)
    this.messenger.inform('noteWasMoved', {
      objectId: this.uniqueId,
      pageX: data.pageX,
      pageY: data.pageY
    })
  }

  killMe(event: any){
    event.stopPropagation();
    this.messenger.inform('killMe', this.uniqueId)
  }

  informAboutResize(data: any){
    this.noteWasResized.emit(data);
    this.messenger.inform('noteWasResized', {
      objectId: this.uniqueId,
      newWidth: data.width,
      newHeight: data.height
    })
  }

  informAboutContentChange(data: any){
    this.noteContentChanged.emit(data);
    console.dir(this.contentHolder)
    this.messenger.inform('noteContentChanged', {
      objectId: this.uniqueId,
      content: this.contentHolder.nativeElement.innerHTML
    })
  }

  handleMessages(messageType: string, data:any){
    if (messageType == 'noteWasClicked'){
      if (data == this.uniqueId){
        this.isActive = true;
      } else {
        this.isActive = false;
      }
    }
    if (messageType == 'pageWasClicked'){
      this.isActive = false;
    }
    if (messageType == 'eachNoteShouldShow'){
      this.isActive = true;
    }
  }

  ngOnInit(): void {
    this.messenger.subscribe(this.uniqueId, 
      this.handleMessages.bind(this), 
      ['noteWasClicked', 'pageWasClicked', 'eachNoteShouldShow']
    )
  }
  ngOnDestroy(): void {
    this.messenger.unsubscribe(this.uniqueId)
  }

}
