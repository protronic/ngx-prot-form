import { Component, ViewEncapsulation, Input, OnInit } from '@angular/core';

@Component({
  selector: 'prot-formly-test2-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class AppComponent implements OnInit{
  
  formular: string
  model: string


  ngOnInit(){
    let url = new URL(location.href);
    this.formular = url.searchParams.get('formular');
    this.model = url.searchParams.get('model');
  }
  
  title = 'prot-formly-test2';
}
