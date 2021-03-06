import { Injectable } from '@angular/core';
// Attention: does not support rgba, as there is no need for this here

@Injectable({
  providedIn: 'root'
})
export class ColorToRGBService {
  cvs: any;
  constructor() { 
    this.createCanvas();
  }

  transform(color: string):number[]{
    let ctx = this.cvs.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    let output: number[] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
    output.splice(3, 1); // number[]
    return output;
  }

  createCanvas(){
    this.cvs = document.createElement('canvas');
    this.cvs.height = 1;
    this.cvs.width =  1;  
    }
}
