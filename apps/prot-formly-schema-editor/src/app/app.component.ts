import 'brace';

import 'brace/mode/json';
import 'brace/theme/github';

import { Component, OnInit } from '@angular/core';

import { AceConfigInterface } from 'ngx-ace-wrapper';

@Component({
  selector: 'prot-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  url = new URL(window.location.href);
  formName = this.url.searchParams.get('form');

  title = 'FormlySchemaEditor';
  public content: string = '';
  private schemaID;

  loadForm: string = undefined;
  success = true;

  public config: AceConfigInterface = {
    mode: 'json',
    theme: 'github',
    readOnly : false
  };

  constructor(){
    
  }

  ngOnInit(){
    console.log(this.formName)
    if (this.formName !== null){
      this.getSchema(this.formName)
        .then( value => {
          this.content = value.schemaDoc;
          this.schemaID = value.schemaID;
        });
      this.updateForm(this.formName);
    }
  }
  // @ViewChild(AceComponent, { read: false } ) componentRef?: AceComponent;

  onValueChange(event: Event){
    // console.log(event)
  }

  updateForm(newForm: string){
    // setTimeout(() => (document.querySelector('prot-form')['formular'] = newForm), 1000);
    // setTimeout(() => (document.querySelector('prot-form')['formular'] = newForm), 2000);
  }

  onSubmit(){
    this.updateSchema(this.schemaID, this.content)
      .then( value => {
        if(value['error'] === undefined){
          this.success = true;
          this.loadForm = this.formName;
          this.updateForm(this.formName);
        }
        else{
          this.success = false;
        }
      });
    // 
  }  
  

  private getSchema(schemaName: string): Promise<{schemaID: string, schemaDoc: string }>{
    let response = fetch('http://prot-subuntu:8081/formly', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          q: `
            SELECT 
              _id,
              log 
            FROM 
              schemadetails 
            WHERE 
              _key = '${schemaName}'
          `
      })
    })
      .then( value => (value.json()))
      .then( value => ({ schemaID: value.recordset[0]._id, schemaDoc: value.recordset[0].log}));
    return response;
  }

  private updateSchema(schemaID: string, schema: string): Promise<any> {
    let response = fetch('http://prot-subuntu:8081/formly', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: `
          UPDATE 
            schemas
          SET
            log = '${schema.split("'").join("''")}'
          WHERE 
            _id = ${schemaID}
        `
      })
    })
      .then( value => (value.json()));

    return response;
  }
}
