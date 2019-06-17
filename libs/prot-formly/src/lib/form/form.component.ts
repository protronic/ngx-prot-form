import { Component, OnInit, OnChanges, ViewChild, ViewEncapsulation, Input, ElementRef, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { DatabaseInteractionService } from 'libs/data/service/src';

@Component({
  selector: 'prot-form-component',
  template: `
  <div class="card" style="padding: 10px;">
    <form #frm [formGroup]="form" (ngSubmit)="submit(modelDocument)">
      <formly-form [form]="form" [fields]="fields" [model]="modelDocument"></formly-form>
    </form>
    <div>
      <button 
        type="submit" 
        class="btn" 
        [ngClass]="{
          'btn-warning': btn === 'warning',
          'btn-primary': btn === 'primary', 
          'btn-danger': btn === 'danger', 
          'btn-success': btn === 'success'}"
        (click)="submit(modelDocument)"
      >Absenden</button>
      <button
          style="margin-left: 10px;"
          class="btn btn-danger"
          [disabled]="previousModel === undefined"
          (click)="revert(previousModel)"
      >Rückgängig</button>
    </div>
    <!--
    <div *ngIf="debug">
      <hr>
      <a [href]='modelLink' target='_parent' class="btn btn-outline-light" style="width: 100%; margin-bottom: 5px;">Modellink</a>
      <br>
      <a [href]='schemaLink' target='_parent' class="btn btn-outline-light" style="width: 100%; margin-bottom: 5px;">Schemalink</a>
      <br>
      <a [href]='historyLink' target='_parent' class="btn btn-outline-light" style="width: 100%; margin-bottom: 5px;">Historylink</a>
    </div>
    -->
  </div>
  `,
  // styles: [],
  styleUrls: [
    // './app.component.css',
    './form.component.scss',
    // '../../../node_modules/bootstrap/dist/css/bootstrap.css'
  ]
})
export class FormComponent implements OnInit {
  @Input() set formular(formular: string) {
    this._formular = formular;
    this.formularChange(formular);
  };
  @Input() model = null;
  @Input() debug = true;

  @ViewChild('frm', { read: true, static: false}) rootFormElement: ElementRef;

  constructor(private databaseInteractionService: DatabaseInteractionService) { }

  private _formular: string;
  form = new FormGroup({});
  modelDocument = {};
  fields: FormlyFieldConfig[] = [{}];
  searchableFields: Array<string>;
  listenersDefined: boolean = false;
  modelLink: string = "http://prot-subuntu:5985/_utils/#database/ausgefuellte_formulare/";
  schemaLink: string = "http://prot-subuntu:5985/_utils/#database/ang-formly-schemata/";
  historyLink: string = "http://prot-subuntu:5985/_utils/#database/ausgefuellte_formulare_history/";
  btn: string = 'primary';
  schemaPrimaryKey: string;
  modelKey: string;
  previousModel: object;

  formularChange(formular: string) {
    if (formular != ''){
      this.databaseInteractionService.getSchema(formular)      
        .then((val) => {
          this.fields = val['schema'];
          this.searchableFields = this.databaseInteractionService.getSearchableFields();
          this.schemaPrimaryKey = val['primaryKey'];
          console.log(this.fields)
        });
    }
  }

  ngOnInit() {
    console.log(navigator['usb'])    
    if (this._formular != ''){
      this.databaseInteractionService.getSchema(this._formular)      
        .then((val) => {
          this.fields = val['schema'];
          this.searchableFields = this.databaseInteractionService.getSearchableFields();
          this.schemaLink += val['_id'];
          this.schemaPrimaryKey = val['primaryKey'];
          this.form.valueChanges.subscribe(
            (change) => {
              if (!this.listenersDefined && this.searchableFields.every((value, index, array): boolean => {
                return Object.keys(change).includes(value);
              })){
                console.log({form: change});
                this.addSearchableFieldListeners();
                this.listenersDefined = true;
                
              }
            }
          );
          console.log(this.fields)
        });
    }
    // this.formularChange();
    console.log(this.model)

    if (this.model != null){
      this.databaseInteractionService.getModel(this.model.toString())
        .then(val => {
          this.modelDocument = val;
          console.log({val: val, primary: this.schemaPrimaryKey, res: val[this.schemaPrimaryKey]});
          this.modelLink = `http://prot-subuntu:5985/_utils/#database/ausgefuellte_formulare/${this.modelDocument['_id']}`;
          this.historyLink = `http://prot-subuntu:5985/_utils/#database/ausgefuellte_formulare_history/${this.modelDocument['_id']}`;
          console.log(val)
        });
    }
  }

  addSearchableFieldListeners(){
    for(let i = 0; i < this.searchableFields.length; i++){
      console.log(this.searchableFields[i])
      this.form.get(this.searchableFields[i]).valueChanges.subscribe(
        (change) => {
          if(change != null && this.form.get(this.searchableFields[i]).valid && change != ''){
            console.log({change: change});
            this.databaseInteractionService.getUniqueSearchable(this.searchableFields[i], change)
              .then( newModel => {
                console.log(newModel);
                this.modelDocument = newModel;
                this.modelLink = `http://prot-subuntu:5985/_utils/#database/ausgefuellte_formulare/${this.modelDocument['_id']}`;
                this.historyLink = `http://prot-subuntu:5985/_utils/#database/ausgefuellte_formulare_history/${this.modelDocument['_id']}`;
              })
              .catch( err => {
                console.error(err);
              });
          }
        }
      );
    }
  }

  submit(model: object) {
    for(let key in model){
      if(model[key] === '') delete model[key];
    }
    this.sendData(model, true);
  }

  revert(previousModel: object){
    // delete previousModel['_rev'];
    this.modelDocument = previousModel;
    this.sendData(previousModel, false);
  }

  sendData(model: object, submitButton: boolean) {
    if(this.form.valid){
      console.log({model: model});
      this.btn = 'warning';
      this.databaseInteractionService.getModel(model['_id'])
        .then(old_doc => {
          // let old_rev = old_doc['_rev'];
          // model['_rev'] = old_rev;
          // model['_attachments'] = old_doc['_attachments'] == undefined ? {} : old_doc['_attachments'];
          delete old_doc['_attachments'];
          // let old_base64 = btoa(JSON.stringify(old_doc));
          // model['_attachments'][old_rev] = {
          //   "content_type": "application/json",
          //   "data": old_base64
          // }
          model['#changed_user'] = window['Wiki'] === undefined || window['Wiki']['UserName'] === undefined ? 'Unbekannt' : window['Wiki']['UserName'];
          model['#changed_time'] = (new Date()).getTime();
          if(this.previousModel === undefined || submitButton)
            this.previousModel = old_doc;
          else
            this.previousModel = undefined;
          return {new: model, old: old_doc};
        })
        .catch(err => {
          // create a new doc
          console.error(err);
          return {new: model, old: {'_id': model['_id']}};
        })
        .then(models => {
          return Promise.all([this.databaseInteractionService.saveModel(models.new), this.databaseInteractionService.saveHistory(models.old)]);
        })
        .then(val => {
          this.btn = 'success';
        })
        .catch(err => {
          console.error(err);
          this.btn = 'danger';
        });
    }
  }
}
