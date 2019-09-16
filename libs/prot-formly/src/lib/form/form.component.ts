import { Component, OnInit, OnChanges, ViewChild, ViewEncapsulation, Input, ElementRef, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { DatabaseInteractionService } from 'libs/data/service/src';

export interface WriteMode {
  name: string,
  submitLabel: string,
  modeLabel: string, 
  modeClass: any,
  verifyMode: Function
}

export const AvailableModes: Array<WriteMode> = [
  {
    name: 'writeall', 
    modeLabel: 'Belibiges Schreiben', 
    submitLabel: 'Übertragen', 
    modeClass: {'btn-primary': true, 'btn-secondary': false, 'btn-info': false},
    verifyMode: (async (control) => (new Promise( resolve => { resolve(true) })))
  },
  {
    name: 'overrideonly', 
    modeLabel: 'Nur Bearbeiten', 
    submitLabel: 'Überschreiben', 
    modeClass: {'btn-primary': false, 'btn-secondary': true, 'btn-info': false},
    verifyMode: (async (control) => {
      let result = new Promise( resolve => (resolve()));
      return result;
    })
  },
  {
    name: 'newonly', 
    modeLabel: 'Nur Anlegen', 
    submitLabel: 'Anlegen', 
    modeClass: {'btn-primary': false, 'btn-secondary': false, 'btn-info': true},
    verifyMode: (async (control) => (new Promise( resolve => { resolve(true) })))
  }
]

@Component({
  selector: 'prot-form-component',
  templateUrl: './form.component.html',
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
  schemaPrimaryKey: string;
  modelKey: string;
  previousModel: object;

  public autoAutoComplete: boolean = true;
  private mode: WriteMode = AvailableModes[0];
  public submitButtonConfig = {
    label: this.mode.submitLabel, 
    class: this.getSubmitButtonColorConfig('btn-primary'), 
    disabled: false};
  public modeButtonConfig = {
    label: this.mode.modeLabel, 
    class: this.mode.modeClass, 
    disabled: false
  };
  public autoCompleteButtonConfig = {
    label: this.autoAutoComplete ? 'Autocomplete Ausschalten' : 'Autocomplete Einschalten', 
    class: {}, 
    disabled: false
  };
  public createNewChargeConfig = {
    label: 'Neue Seriennummer/ChargenNummer Anlegen',
    class: {'btn-primary': true},
    disabled: false
  }

  clearModel(){
    
    Object.keys(this.modelDocument).map( key => (this.form[key] = (this.modelDocument[key] instanceof Array) ? [] : '' ))
    this.model = null;
    this.modelDocument = {};
    this.modelKey = undefined;
  }

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

  getSubmitButtonColorConfig(color: string){
    let result = {
      'btn-primary': false,
      'btn-success': false,
      'btn-danger': false,
      'btn-warning': false,
    };
    result[color] = true;
    return result;
  }

  ngOnInit() {
    console.log(navigator['usb'])    
    if (this._formular != ''){
      this.databaseInteractionService.getSchema(this._formular)      
        .then((val) => {
          this.fields = val['schema'];
          this.searchableFields = this.databaseInteractionService.getSearchableFields();
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
                if (this.autoAutoComplete){
                  this.modelDocument = newModel;
                }
              })
              .catch( err => {
                console.error(err);
              });
          }
        }
      );
    }
  }

  submit() {
    let model = this.modelDocument;
    for(let key in model){
      if(model[key] === '') delete model[key];
    }
    this.sendData(model, true);
  }

  newCharge() {
    this.previousModel = {};
    Object.keys(this.modelDocument).forEach(key => {
      this.previousModel[key] = this.modelDocument[key];
    });
    this.modelDocument = {};    
  }

  revert(previousModel: object){
    // delete previousModel['_rev'];
    this.modelDocument = previousModel;
    this.sendData(previousModel, false);
  }

  sendData(model: object, submitButton: boolean) {
    if(this.form.valid){
      console.log({model: model});
      this.submitButtonConfig.class = this.getSubmitButtonColorConfig('btn-warning');
      this.databaseInteractionService.getModel(model['modelKey'])
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
          return Promise.all([this.databaseInteractionService.saveModel(models.new)]);
        })
        .then(val => {
          this.submitButtonConfig.class = this.getSubmitButtonColorConfig('btn-success');
        })
        .catch(err => {
          console.error(err);
          this.submitButtonConfig.class = this.getSubmitButtonColorConfig('btn-danger');
        });
    }
  }

  replaceAsyncValidator(fn: Function){
    let index;
    let validator = this.fields[this.schemaPrimaryKey].asyncValidators.filter( (value, index, array) => (value.name === 'writemodeValidator'))[0];
    if (validator) index = this.fields[this.schemaPrimaryKey].asyncValidators.indexOf(validator) 
    else {
      this.fields[this.schemaPrimaryKey].asyncValidators.push({name: 'writemodeValidator', validation: this.mode.verifyMode})
      index = this.fields[this.schemaPrimaryKey].asyncValidators.length - 1
    }

    this.fields[this.schemaPrimaryKey].asyncValidators[index] = {
      name: 'writemodeValidator',
      validation: this.mode.verifyMode
    }
  }

  // jump to mode


  // cicle mode
  changeMode(){
    let oldMode = this.mode;
    this.mode = AvailableModes[(AvailableModes.indexOf(oldMode) + 1) % (Object.keys(AvailableModes).length)];
    this.updateModeData(this.mode, oldMode);
  }

  updateModeData(newMode: WriteMode, oldMode: WriteMode){    
    this.submitButtonConfig.class = {
      'btn-primary': true,
      'btn-success': false,
      'btn-danger': false,
      'btn-warning': false,
    }
    this.submitButtonConfig.label = newMode.submitLabel;
    this.submitButtonConfig.disabled = false;

    this.modeButtonConfig.class = newMode.modeClass;
    this.modeButtonConfig.label = newMode.modeLabel;
    this.modeButtonConfig.disabled = false;

    console.log('modechange', {from: oldMode, to: newMode});
  }

  toggleAutoComplete(){
    this.autoAutoComplete = !this.autoAutoComplete;
  }
}
