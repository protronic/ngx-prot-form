import { Injectable, Optional } from '@angular/core';

export class SqlWrapperServiceConfig {
  enpointUrl = 'http://prot-subuntu:8081/formly';
}

@Injectable({
  providedIn: 'root'
})
export class SqlWrapperService {

  private _endpointUrl: string = 'http://prot-subuntu:8081/formly';
  private mapDBNames = (dbName: string): {table: string, view: string} => {
    if(dbName === 'http://prot-subuntu:5985/ang-formly-schemata')
      return {table: 'schema', view: 'schemadetails'};
    if(dbName === 'http://prot-subuntu:5985/ausgefuellte_formulare')
      return {table: 'model', view: 'modeldetails'};
  }

  constructor(@Optional() config: SqlWrapperServiceConfig) {
    if (config) { this._endpointUrl = config.enpointUrl }
  }

  private updateDocument(doc: string, table: string, modelKey: string): Promise<Body>{
    let query = `
      UPDATE 
        ${table}
      SET
        log = '${doc}'
      WHERE 
        JSON_VALUE(log, '$."modelKey"') = '${modelKey}';
    `
    return this.postData(query);
  }

  private insertDocument(doc: string, table: string): Promise<Body>{  
    let tempDoc = JSON.parse(doc);

    let query = `      
      INSERT 
        INTO ${table} (log)
      SELECT 
        value 
      FROM 
        OPENJSON('${(tempDoc instanceof(Array) ? doc : [doc])}');
    `
    return this.postData(query);
  }

  private getDocument(docID: string, table: string): Promise<Body>{
    let query = `
      SELECT
        log
      FROM 
        ${table}
      WHERE 
        _key = '${docID}' OR _id = '${docID}';
    `
    return this.postData(query);
  }
  
  private findDocuments(fieldValueMap: {field: string, value: string}[], table: string){
    let query = `
      SELECT 
        _key
      FROM
        ${table}
      WHERE 
        ${fieldValueMap.map( val => (`JSON_VALUE(log, '$."${val.field}"')='${val.value}'`)).join(' AND ')}
    `
    return this.postData(query)
  }

  private postData(query: string): Promise<Body>{  
    return fetch(this._endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({q: query})
    })
  }

  newPouchDB(name: string): any {
    return {name: name};
  }

  async get(db: any, docName: string): Promise<any> {
    console.log({sqlGet: [docName, this.mapDBNames(db.name).view]});
    return this.getDocument(docName, this.mapDBNames(db.name).view)
      .then( (response) => (response.json()))
      .then( (response) => {
        console.log({sqlGetResponse: response && response.recordset ? JSON.parse(response.recordset[0].log) : undefined});
        return JSON.parse(response && response.recordset ? response.recordset[0].log : undefined);
      })
      .catch( err => (console.error(err), undefined));
  }

  async put(db: any, model: any): Promise<any>{
    console.log({sqlPut: [model, this.mapDBNames(db.name).table]});

    return this.get(db, model['modelKey'])
      .then( response => {
        if(response === undefined){
          // insert
          this.insertDocument(JSON.stringify(model), this.mapDBNames(db.name).table)
            .then( (response) => (response.json()))
            .then( (response) => {
              console.log({sqlPutResponseInsert: response});
              // TODO: braucht erfolgsbewertung -> response.rowsAffected = [1, 1]
              return response;
            });
        }
        else{
          // update
          this.updateDocument(JSON.stringify(model), this.mapDBNames(db.name).table, model["modelKey"])
            .then( (response) => (response.json()))
            .then( (response) => {
              console.log({sqlPutResponseUpdate: response});
              // TODO: braucht erfolgsbewertung -> response.rowsAffected = [1, 1]
              return response;
            });
        }
      })
      .catch( err => (console.error(err), err));
  }

  async find(db: any, fiVaMap: any): Promise<any>{
    console.log({sqlFind: [fiVaMap, this.mapDBNames(db.name).view]});
    return this.findDocuments(fiVaMap, this.mapDBNames(db.name).view)
      .then( (response) => (response.json()))
      .then( (response) => (response && response.recordset ? response.recordset.map( value => (value._key) ) : []))
      .then( (response) => {
        console.log({sqlFindResponse: response});
        return response;
      })
      .catch( (err) => (console.error(err), err));
  }
}
