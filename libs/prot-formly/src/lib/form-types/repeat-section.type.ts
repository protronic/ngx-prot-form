import { Component, OnInit } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';

@Component({
  selector: 'formly-repeat-section',
  template: `
    <div class="card" style="padding: 10px; margin-bottom: 5px;">
      <div style="margin-bottom: 5px;">{{ to.label }}</div>
      
      <div *ngFor="let fieldx of field.fieldGroup; let i = index;" class="card row" style="margin: 10px; padding: 10px">
        <div class="collapse show" style="margin-bottom: 5px; padding: 10px" (click)="onLabelClick($event)">
          {{ this.field.model[i].name || '' }}
        </div>
        <div class="collapse">
          <formly-field class="col" [field]="fieldx"></formly-field>
          <div class="col-sm-2 d-flex align-items-center">
            <button class="btn btn-danger" type="button" (click)="remove(i)">Entfernen</button>
          </div>
        </div>
      </div>
      <div style="margin:10px 0;">
        <button class="btn btn-primary" type="button" (click)="add()">{{ to.addText }}</button>
      </div>
    </div>
  `,
})
export class RepeatTypeComponent extends FieldArrayType implements OnInit {
  labelClass = [];
  contentClass = [];
 
  ngOnInit(){

  }

  onLabelClick(event){
    function toggleClassShow(toChange){
      if(toChange.split(' ').includes('show')){
        return toChange.split(' ').filter((value: string) => {if(value != 'show') return true; else return false;}).join(' ');
      }
      else {
        return toChange + ' show';
      }
    }
    console.log(this)
    // this.labelClass = toggleClassShow(this.labelClass);
    this.contentClass = toggleClassShow(this.contentClass);
  }
}


/**  Copyright 2018 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */