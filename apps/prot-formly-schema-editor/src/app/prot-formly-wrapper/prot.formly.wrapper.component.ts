import { Component, Input, ViewEncapsulation } from '@angular/core';


@Component({
  selector: 'prot-formly-wrapper',
  templateUrl: './prot.formly.wrapper.component.html',
  styleUrls: ['./prot.formly.wrapper.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ProtFormlyWrapperComponent {
  @Input() formName: string = '';
}