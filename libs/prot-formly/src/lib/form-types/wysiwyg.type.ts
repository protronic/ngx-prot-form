import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

// import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
 selector: 'formly-field-input',
 template: `
   <label *ngIf="to.label">{{ to.label }}</label>
   <input type="input" [formControl]="formControl" [formlyAttributes]="field" [(ngModel)]="wValue" style="visibility: hidden;">
   <ngx-wig [(ngModel)]="wValue"></ngx-wig>   
 `,
 styleUrls: [
  // 'wysiwyg.type.scss'
 ]
})
export class WysiwygFieldInput extends FieldType {
  wValue: string = "";

  // editorConfig: AngularEditorConfig = {
  //   editable: true,
  //   // spellcheck: true,
  //   height: '25rem',
  //   minHeight: '5rem',
  //   placeholder: 'Enter text here...',
  //   translate: 'no',
  //   // uploadUrl: 'v1/images', // if needed
  //   customClasses: [ // optional
  //     {
  //       name: "quote",
  //       class: "quote",
  //     },
  //     {
  //       name: 'redText',
  //       class: 'redText'
  //     },
  //     {
  //       name: "titleText",
  //       class: "titleText",
  //       tag: "h1",
  //     },
  //   ]
  // };
}