import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'formly-timestamp-field-type',
  template: `
  <div class="form-group">
    <label for="idInput">{{to.label}}</label>
    <input id="idInput" class="form-control" type="text" [formControl]="formControl" [formlyAttributes]="field" (change)="onChange($event)" [placeholder]="to.placeholder" [disabled]="auto_gen">
  </div>
  <div class="form-check">
    <input id="autoGen" class="form-check-input" type="checkbox" (change)="onCheckboxChange($event)">
    <label for="autoGen" class="form-check-label">{{to.label}} automatisch generieren</label>
    <input type="text" [formControl]="formControl" [formlyAttributes]="field" [(ngModel)]="result" style="display: none;">
  </div>
  <small class="form-text text-muted">{{to.description}}</small>
  `,
})
export class TimestampFieldType extends FieldType implements OnInit {

  // mögliche template optionen:
  // - label: Überschrift
  // - placeholder: Platzhalter im Eingabefeld
  // - description: Eine kurze Beschreibung, in klein unter den Eingaben

  // mögliche schema optionen: 
  // - generation = one of ['optional', 'forbidden', 'forced'];
  // - generation_method = function(modelId){ return timestampNr: string } - Eine Funktion, die die aktuelle modelId bekommt und dann (einen schon an modelId zugeordnete) timestampNr zurückgibt 
  // - 

  result = "";
  auto_gen = false;

  ngOnInit(){

  }

  onChange(event){
    // console.log(event.target.value)
    this.result = event.target.value;
    console.log(this.model)
  }

  onCheckboxChange(event){
    let check = event.target.checked;
    this.auto_gen = check
    if(check) {
      this.result = "#gen#"
      this.formControl.disable()
    }
    else {
      this.formControl.enable()    
      this.result = ""
    }
  }
}