import { Directive, Input, ElementRef, HostListener, EventEmitter, Output } from '@angular/core';
import { MovableParentDirective } from './movable-parent.directive';
import { ConstantPool } from '@angular/compiler';
import { ConcatSource } from 'webpack-sources';

@Directive({
  selector: '[resizeparent]'
})
export class ResizeParentDirective extends MovableParentDirective{
  @Input('minWidth') minWidth: number = 50;
  @Input('minHeight') minHeight: number = 50;
  @Input('initialWidth') initialWidth: number = 50;
  @Input('initialHeight') initialHeight: number = 50;
  @Input('movableElementId') movableElementId: string = '';
  @Output() elementResized: EventEmitter<{movedElementId: string, width: number, height:number}> = new EventEmitter();
  
  resizeDotOffset:{x:number, y:number} = {x:0, y:0}
  movableParentTopLeftCords: {x: number, y: number} = {x: 0, y: 0};
  constructor(elRef: ElementRef) { 
    super(elRef);
  }

  @HostListener('mousedown', ['$event'])
  calculateDotOffset(data:any){
    this.resizeDotOffset = {x: data.pageX - this.elRef.nativeElement.offsetLeft - this.elementToMove.offsetLeft, 
                            y: data.pageY - this.elRef.nativeElement.offsetTop - this.elementToMove.offsetTop}
  }

calculatedSize(data:{pageX: number, pageY:number}){
    let parentOffset = {x: this.elementToMove.offsetLeft, y: this.elementToMove.offsetTop}
    let width = data.pageX - parentOffset.x - this.resizeDotOffset.x; 
    let height = data.pageY - parentOffset.y - this.resizeDotOffset.y;
    return {width: width < this.minWidth ? this.minWidth : width, height: height < this.minHeight ? this.minHeight : height}
  }


  @HostListener('document:mouseMove', ['$event'])
  doMouseMove(data:any){
    let that = this;
    // let parentOffset = {x: this.elementToMove.offsetLeft, y: this.elementToMove.offsetTop}

    if (this.isInMoveState) {
      let newCords = this.calculateNewPosition({x: data.pageX, y: data.pageY})
      let correctedPosition = this.calculateNewPosition({x: data.pageX, y: data.pageY});
      let cs = this.calculatedSize(data);
      this.elementToMove.style.width = cs.width + 'px';
      this.elementToMove.style.height = cs.height + 'px';
    }
  }

  setInitialSize(position: {width: number, height: number, [props: string]: any}){
    this.elementToMove.style.width = position.width + 'px';
    this.elementToMove.style.height = position.height + 'px';
    // this.elRef.nativeElement.style.top = this.elRef.nativeElement.offsetTop + position.height
    // this.elRef.nativeElement.style.left = this.elRef.nativeElement.offsetLeft + position.width
  }

  @HostListener('document:mouseup', ['$event'])
  disacitvateMoveMode(event: MouseEvent){
    if (this.isInMoveState){
      let calculatedWidthAndHeight = this.calculatedSize(event)
      this.dispatchEventOnMovedElement({pageX: calculatedWidthAndHeight.width, pageY: calculatedWidthAndHeight.height})  
    }
    this.isInMoveState = false;
  }

  ngOnInit(){
    
    // this.doNotInformAboutChanges = true;
    this.elementToMove = this.getElementToMove();
    this.setInitialSize({width: this.initialWidth, height: this.initialHeight})
    // this.isInMoveState = true;
    // this.doMouseMove({pageX:this.initialWidth, pageY: this.initialHeight})
    // this.isInMoveState = false;
    // this.doNotInformAboutChanges = false;
  }

  dispatchEventOnMovedElement(data: {pageX: number, pageY: number}){
    let eventData = {
      movedElementId: this.movableElementId,
      width: data.pageX,
      height: data.pageY
    }
    if (!this.doNotInformAboutChanges) this.elementResized.emit(eventData)
  }

}
