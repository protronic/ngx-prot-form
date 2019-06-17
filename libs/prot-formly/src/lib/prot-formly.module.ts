import { BrowserModule } from '@angular/platform-browser';
// import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule} from '@angular/common/http';

import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';

import { NgSelectModule } from '@ng-select/ng-select';

import { NgxWigModule } from 'ngx-wig';
import { FormComponent } from './form/form.component';

import { RepeatTypeComponent } from './form-types/repeat-section.type';
import { ArrayTypeComponent } from './form-types/array.type';
import { WysiwygFieldInput } from './form-types/wysiwyg.type';
import { FormlyFieldTypeahead } from './form-types/typeahead.type.component';

@NgModule({
  declarations: [
    FormComponent,
    RepeatTypeComponent,
    ArrayTypeComponent,
    WysiwygFieldInput,
    FormlyFieldTypeahead,
  ],
  imports: [
    // CommonModule,
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule, 
    NgSelectModule,
    NgxWigModule,
    FormlyModule.forRoot({
      types: [
        { name: 'repeat', component: RepeatTypeComponent },
        { name: 'array', component: ArrayTypeComponent },
        { name: 'editor', component: WysiwygFieldInput },
        { name: 'typeahead', component: FormlyFieldTypeahead },
      ],
    }),
    FormsModule,
    FormlyBootstrapModule,
  ],
  providers: [  ],
  exports: [FormComponent]
})
export class ProtFormlyModule { }



