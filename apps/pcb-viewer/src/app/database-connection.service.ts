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

  async save_formular_model(model){
    return fetch('http://prot-subuntu:8081/formly', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({q: `
        INSERT INTO model (log) VALUES ('${JSON.stringify(model)}')
      `})
    })
   }

   async update_document(id, new_doc){
    return fetch('http://prot-subuntu:8081/formly', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({q: `
        UPDATE model SET log = '${JSON.stringify(new_doc)}' WHERE _id = ${id}
      `})
    })
   }

  async get_formular(item_nr: string){
    return fetch('http://prot-subuntu:8081/formly', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({q: `
      SELECT
        _id,
        JSON_VALUE(log, '$."Datum"') AS 'Datum',
        JSON_VALUE(log, '$."showBot"') AS 'showBot',
        JSON_VALUE(log, '$."showTop"') AS 'showTop',
        JSON_VALUE(log, '$."showBoth"') AS 'showBoth',
        JSON_VALUE(log, '$."showSMD"') AS 'showSMD',
        JSON_VALUE(log, '$."showTHT"') AS 'showTHT',
        JSON_VALUE(log, '$."pageNr"') AS 'pageNr',
        JSON_VALUE(log, '$."currentRow"') AS 'currentRow',
        JSON_QUERY(log, '$."highlightedRow"') AS 'highlightedRow',
        JSON_QUERY(log, '$."betrachtete_Komponenten"') AS 'changedComps',
        JSON_VALUE(log, '$."parentForm"') AS 'parentForm',
        JSON_VALUE(log, '$."Platinennummer"') AS 'platinenNr',
        JSON_VALUE(log, '$."Fehlerbeschreibung"') AS 'comment',
        log
      FROM
        model
      WHERE
        JSON_VALUE(log, '$."Artikelnummer"') = '${item_nr}'
      `})
    })
    .then(data => data.json())
    .then(data => data.recordset)
    .catch(err => {
      console.error(`Tried to get models but failed.`);
      console.error(err.message);
      return [];
    })
   }

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
      SELECT
      pos,
      Fach,
      Menge,
      Artikel,
      pcb_viewer.Resnum,
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
      rotation,
      bezeichner_liste
   FROM
      ${this.pcbViewerView} INNER JOIN
      (
          SELECT
              Resnum,
              STRING_AGG(bezeichnung, ',') AS bezeichner_liste
          FROM
              pcb_viewer
          WHERE
              Vorbest_Platine = '${item_nr}' OR
              Komplettbest_Platine = '${item_nr}'
          GROUP BY
              resnum
      ) AS bez_sub ON pcb_viewer.Resnum = bez_sub.Resnum
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
