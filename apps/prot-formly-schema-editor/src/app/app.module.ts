import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AceModule, AceConfigInterface, ACE_CONFIG } from 'ngx-ace-wrapper';

import { ProtFormlyModule } from 'libs/prot-formly/src';
import { ProtFormlyWrapperComponent } from './prot-formly-wrapper/prot.formly.wrapper.component';

import { AppComponent } from './app.component';

const DEFAULT_ACE_CONFIG: AceConfigInterface = {
  tabSize: 2
};

@NgModule({
  declarations: [
    AppComponent,
    ProtFormlyWrapperComponent
  ],
  imports: [
    AceModule,
    BrowserModule,
    ProtFormlyModule
  ],
  providers: [
    {
      provide: ACE_CONFIG,
      useValue: DEFAULT_ACE_CONFIG
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
