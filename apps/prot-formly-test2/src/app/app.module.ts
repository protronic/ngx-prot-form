import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';

import { AppComponent } from './app.component';

import { ProtFormlyModule } from 'libs/prot-formly/src';
import { ServiceModule } from 'libs/data/service/src';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    ProtFormlyModule,
    ServiceModule.forRoot({enpointUrl: 'http://prot-subuntu:8081/formly'})
  ],
  providers: [],
  // bootstrap: [AppComponent]
  entryComponents: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {  }

  ngDoBootstrap(){
    const protForm = createCustomElement(AppComponent, { 
      injector: this.injector
     });
    customElements.define('prot-form', protForm);
  }
}
