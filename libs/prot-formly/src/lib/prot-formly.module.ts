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
import { AmuBooleanTypeComponent } from './form-types/amu-boolean.type';
import { AmuWriteTypeComponent } from './form-types/amu-write.type';
import { TimestampFieldType } from './form-types/timestamp-field.type';

@NgModule({
  declarations: [
    FormComponent,
    RepeatTypeComponent,
    ArrayTypeComponent,
    WysiwygFieldInput,
    FormlyFieldTypeahead,
    AmuBooleanTypeComponent,
    AmuWriteTypeComponent,
    TimestampFieldType
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
        { name: 'amubool', component: AmuBooleanTypeComponent },
        { name: 'amuwrite', component: AmuWriteTypeComponent },
        { name: 'timestampfield', component: TimestampFieldType}
      ],
    }),
    FormsModule,
    FormlyBootstrapModule,
  ],
  providers: [  ],
  exports: [FormComponent]
})
export class ProtFormlyModule { }



