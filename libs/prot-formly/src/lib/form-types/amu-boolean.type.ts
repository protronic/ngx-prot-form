import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-amu-boolean-type',
  template: `
    <label>{{ to.label }}</label>
    <div>
    <input class="" type="checkbox" (change)="onChange($event)"> 
    </div>
    <input type="text" [formControl]="formControl" [formlyAttributes]="field" [(ngModel)]="result" style="display: none;">
    <br />
  `,
})
export class AmuBooleanTypeComponent extends FieldType {

  public low_active;
  public result;

  constructor(){
    super()

    // try{
    //   this.low_active = this.to["low_active"];
    //   this.value_list = this.to['value_list'];
    // }
    // catch(e){
      
    // }
  }

  safeAssign(value: string){
    try{
      return this.to[value]
    }
    catch(e){
      return undefined
    }
  }

  onChange(e){    
    this.low_active = this.safeAssign('low_active')
    let mask = this.safeAssign('mask')
    let checked = e.target.checked
    let value = (this.low_active ? !checked : checked) ? parseInt(mask, 2) : 0;
    this.result = JSON.stringify({
      key: this.key,
      value: value,
      mask: mask
    });
    console.log(this.result)
  }
}

