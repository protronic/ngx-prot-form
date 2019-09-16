import { Injectable, Optional, assertPlatform } from '@angular/core';

export class SqlWrapperServiceConfig {
  enpointUrl = 'http://prot-subuntu:8081/formly';
}

@Injectable({
  providedIn: 'root'
})
export class SqlWrapperService {

  private _endpointUrl: string = 'http://prot-subuntu:8081/formly';

  constructor(@Optional() config: SqlWrapperServiceConfig) {
    if (config) { this._endpointUrl = config.enpointUrl }
  }

  private updateDocument(doc: string, table: string, modelKey: string): Promise<Body>{
    console.log(table, doc, modelKey);
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
    console.log(table, doc);

    let query = `      
      INSERT INTO 
        ${table} (log)
      VALUES 
        ('${(tempDoc instanceof(Array) ? doc : [doc])}');
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

  private async createNewEmptyDocument(includeChargeNumber: boolean): Promise<any>{
    let query = `
      INSERT INTO 
        model (log) 
      VALUES 
        ('{}');
      
      DECLARE @model_id INT;
      SELECT @model_id = (
        SELECT 
          SCOPE_IDENTITY()
      );

      ${includeChargeNumber ? 'INSERT INTO ChargenNummerZuordnung (ModelId) Values (@model_id);' : ''}

      SELECT 
        @model_id AS model_id,
        ChargenNummer
      FROM  
        ChargenNummerZuordnung
      WHERE 
        ModelId = @model_id;
    `
    //  .recordset[0].scope
    return this.postData(query)
      .then( response => response.json() )
      .then( response => response.recordset[0]);
  }

  async get(table: string, docName: string): Promise<any> {
    // if(!docName) throw new Error(`docName ist ${docName}.`)
    console.log({sqlGet: [docName, table]});
    return this.getDocument(docName, table)
      .then( (response) => (response.json()))
      .then( (response) => {
        console.log({sqlGetResponse: response && response.recordset ? JSON.parse(response.recordset[0].log) : undefined});
        return JSON.parse(response && response.recordset ? response.recordset[0].log : undefined);
      })
      .catch( err => (console.error(err), undefined));
  }

  async put(table: string, model: any): Promise<any>{
    console.log({sqlPut: [model, table]});

    return this.get('modeldetails', model['modelKey'])
      .then( response => {
        if(response === undefined){
          // insert
          this.insertDocument(JSON.stringify(model), table)
            .then( (response) => (response.json()))
            .then( (response) => {
              console.log({sqlPutResponseInsert: response});
              console.error('TODO: insert braucht erfolgsbewertung -> response.rowsAffected = [1, 1] / Misserfolgsbehandlung');
              return response;
            });
        }
        else{
          // update
          this.updateDocument(JSON.stringify(model), table, model["modelKey"])
            .then( (response) => (response.json()))
            .then( (response) => {
              console.log({sqlPutResponseUpdate: response});
              console.error('TODO: update braucht erfolgsbewertung -> response.rowsAffected = [1, 1] / Misserfolgsbehandlung');
              return response;
            });
        }
      })
      .catch( err => (console.error(err), err));
  }

  async find(table: string, fiVaMap: any): Promise<any>{
    console.log({sqlFind: [fiVaMap, table]});
    return this.findDocuments(fiVaMap, table)
      .then( (response) => (response.json()))
      .then( (response) => (response && response.recordset ? response.recordset.map( value => (value._key) ) : []))
      .then( (response) => {
        console.log({sqlFindResponse: response});
        return response;
      })
      .catch( (err) => (console.error(err), err));
  }
}
