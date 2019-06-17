import { Component } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';

@Component({
  selector: 'formly-array-type',
  template: `
    <label *ngIf="to.label">{{ to.label }}</label>
    <div *ngFor="let field of field.fieldGroup;let i = index;" class="row">
      <formly-field class="col-sm-10" [field]="field"></formly-field>
      <div class="col-sm-2">
        <button class="btn btn-danger" type="button" (click)="remove(i)">Remove</button>
      </div>
    </div>
    <div class="text-right">
      <button class="btn btn-primary" type="button" (click)="add()">{{ to.addText ? to.addText : add }}</button>
    </div>
  `,
})
export class ArrayTypeComponent extends FieldArrayType {}


/**  Copyright 2018 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */