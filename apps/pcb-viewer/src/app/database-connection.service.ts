import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DatabaseConnectionService {

  pickAndPlaceTable: string = 'altium_pick_and_place';
  pcbViewerView: string = 'pcb_viewer';
  pdfTable: string = 'pdf_documents';

  constructor() {  }

  async get_pdf_src(item_nr: string){

    const array_to_pdf_file = function (array: Array<number>): string{
      const arraBuffer = (new Uint8Array(array)).buffer;
      const fileBlob = new Blob([arraBuffer], {type: 'application/pdf'});
      const file = new File([fileBlob], 'bestückungsplan.pdf', {type: 'application/pdf'});
      const fileUrl = URL.createObjectURL(file);
      console.log(fileUrl);
      return fileUrl;
    }

    return fetch('http://prot-subuntu:8081/cad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({q: `
        USE cad;
    
        SELECT 
          document
        FROM 
          ${this.pdfTable}
        WHERE
          platine_komplett = '${item_nr}' OR
          platine_vorbest = '${item_nr}'
      `})  
    })
      .then(data => data.json())
      .then(data => data.recordset[0].document['data'])
      .catch(err => {
        console.error(`Tried to get a pdf for ${item_nr} but failed. Sorry!`);
        console.error(err.message);
        return [];
      })
      .then(array_to_pdf_file)
      .catch(err => {
        console.error(`Converting the pdf for ${item_nr} failed. Sorry!`);
        console.error(err.message);
        return '';
      });
  }

  async get_complete_ressource_list(item_nr: string){

    return fetch('http://prot-subuntu:8081/cad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({q: `
        USE cad;

        SELECT
          pos,
          Fach,
          Menge,
          Artikel,
          Resnum,
          ressourcen_nummer,
          bezeichnung,
          Matchcode,
          fertigungstyp,
          Vorbest_Platine,
          Komplettbest_Platine,
          fertiger_artikel,
          seite,
          x_position,
          y_position,
          rotation
        FROM 
            ${this.pcbViewerView}
        WHERE 
          Vorbest_Platine = '${item_nr}' OR
          Komplettbest_Platine = '${item_nr}'
        ORDER BY 
            bezeichnungsbuchstabe ASC, bezeichnungsnummer ASC, pos ASC
      `})  
    })
      .then(data => data.json())
      .then(data => data.recordset)
      .catch(err => (console.error(err), []));
  }
}
