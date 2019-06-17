import { Injectable } from '@angular/core';
import { SqlWrapperService } from './sql.wrapper.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseInteractionService {
  
  private schemaDB: any;
  private modelDB: any;

  private linkInitiatedMap: object = {};

  private schemaDoc: object = {};
  
  constructor(private pouchDBService: SqlWrapperService) {
    
    this.schemaDB = this.connectDatabase('http://prot-subuntu:5985/ang-formly-schemata');
    this.modelDB = this.connectDatabase('http://prot-subuntu:5985/ausgefuellte_formulare');
  }

  connectDatabase(link: string): any | null {
    if (this.linkInitiatedMap[link] === undefined){
      this.linkInitiatedMap[link] = this.pouchDBService.newPouchDB(link);
      return this.linkInitiatedMap[link];
    }
    else {
      return this.linkInitiatedMap[link];
    }
  }

  getSchema(schemaName: string): Promise<object>{
    function replaceFunctionString(rootDoc){
      for(let key in rootDoc){
        if (rootDoc[key].validators != undefined){
          for(let validator in rootDoc[key].validators){
            rootDoc[key].validators[validator].expression = new Function('field', rootDoc[key].validators[validator].expression);
            rootDoc[key].validators[validator].message = new Function('error', 'fieldConfig', rootDoc[key].validators[validator].message);
          }
        }
        if (rootDoc[key].asyncValidators != undefined){
          for(let validator in rootDoc[key].asyncValidators){
            rootDoc[key].asyncValidators[validator].expression = new Function('field', rootDoc[key].asyncValidators[validator].expression);
            rootDoc[key].asyncValidators[validator].message = new Function('error', 'fieldConfig', rootDoc[key].asyncValidators[validator].message);
          }
        }
        if (rootDoc[key].fieldArray && rootDoc[key].fieldArray.fieldGroup){
          replaceFunctionString(rootDoc[key].fieldArray.fieldGroup);
        }
      }
    }

    return new Promise((resolve, reject) =>{
      this.pouchDBService.get(this.schemaDB, schemaName)
        .then(val => {
          this.schemaDoc = val;
          replaceFunctionString(val['schema']);
          
          console.log({schemaDoc: this.schemaDoc})
          resolve(val);
        })
        .catch(err => {
          console.error(err);
        });
    });    
  }

  saveModel(model: any): Promise<any>{
    return new Promise((resolve, reject) => {
      console.log({schemaDoc: this.schemaDoc})
      model['#parentForm'] = this.schemaDoc['name'];
      if(this.schemaDoc['primaryKey'] === '#created'){
        if (model['modelKey'] == undefined){
          model['modelKey'] = `${this.schemaDoc['name']}-${(new Date()).getTime()}`;
        }
      }
      else {
        model['modelKey'] = `${this.schemaDoc['primaryKey']}-${model[this.schemaDoc['primaryKey']]}`;    
      }
      
      console.log(this.pouchDBService.put(this.modelDB, model).then( value => (resolve(value))));
    });
  }

  saveHistory(old_model: any){
    return new Promise( (resolve) => (resolve()));
  }

  getModel(modelDocument: string): Promise<object>{
    return this.pouchDBService.get(this.modelDB, modelDocument);
  }

  getSearchableFields(): Array<string>{
    let result: Array<string> = [];

    for(let i = 0; i < this.schemaDoc['schema'].length; i++){
      // console.log(this.schemaDoc['schema']);
      if(this.schemaDoc['schema'][i]['searchable']){ 
        result.push(this.schemaDoc['schema'][i]['key']);
      }
    }
    return result;
  }

  getUniqueSearchable(field: string, value: any): Promise<object> | null {
    return new Promise((resolve, reject) => {
      let fieldValueMap = [{field: field, value: value}]

      this.pouchDBService.find(this.modelDB, fieldValueMap)
        .then( keyList => {
          if (keyList.length > 1){
            reject('search was ambiguous');
            console.log({message: 'search was ambiguous', keys: keyList, fieldValueMap: fieldValueMap});
          }
          else if (keyList.length === 0){
            reject('search gave no match');
            console.log({message: 'search gave no match', keys: keyList, fieldValueMap: fieldValueMap});
          }
          else{
            // this.schemaDoc = doc['docs'][0];
            resolve(this.getModel(keyList[0]));
            console.log({message: 'found a document to autocomplete', keys: keyList[0], fieldValueMap: fieldValueMap});
          }
        })
        .catch( err => {
          reject(err.message);
          console.error(err);
        });
    })
  }
}
