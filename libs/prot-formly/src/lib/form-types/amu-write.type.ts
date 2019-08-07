import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-amu-boolean-type',
  template: `
    <label>{{ to.label }}</label>
    <div>
    <input class="form-control" type="text" (change)="onChange($event)"> 
    </div>
    <input type="text" [formControl]="formControl" [formlyAttributes]="field" [(ngModel)]="result" style="display: none;">
    <br />
  `,
})
export class AmuWriteTypeComponent extends FieldType {

  result;


  onChange(e){

  }
  
}