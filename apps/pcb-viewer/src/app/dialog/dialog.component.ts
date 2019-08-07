import { HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {
  sageExport: Object[] = [];
  sageExportObject: Object;
  database: string;
  article: string;
  sageExportSrc: string;
  ressourcen: Object[] = [];
  ressourcenSrc: string;
  selectedText: string;
  comp: string[];
  headers: string[] = ['Designator', 'Quantity', 'Comment', 'Matchcode', 'Lieferant', 'HArtikelnummer', 'Hersteller', 'Einzelpreis'];

  constructor(private httpService: HttpClient,  private dialogRef: MatDialogRef<DialogComponent>, @Inject(MAT_DIALOG_DATA) data) {
    this.selectedText = data[0];
    this.article = data[1];
    this.database = data[2];
    this.sageExportSrc = this.database + this.article;
    this.ressourcenSrc = data[3];
  }

  ngOnInit() {
     this.httpService.get(this.sageExportSrc).subscribe(
      data => {
        this.sageExportObject = data;
        this.sageExport = this.sageExportObject['Array'];
      },
      (err: HttpErrorResponse) => {
        console.log (err.message);
      });
//    this.httpService.get(this.thtSrc).subscribe(
//      data => {
//        this.tht = data as Object[];
//      },
//      (err: HttpErrorResponse) => {
//        console.log (err.message);
//      });
//    this.httpService.get(this.smdSrc).subscribe(
//      data => {
//        this.smd = data as Object[];
//      },
//      (err: HttpErrorResponse) => {
//        console.log (err.message);
//      });
    this.httpService.get(this.ressourcenSrc).subscribe(
      data => {
//        this.ressourcen = data as Object[];
        this.ressourcen = data['rows'];
      },
      (err: HttpErrorResponse) => {
        console.log (err.message);
      });
    this.getInfo();
  }

  close() {
        this.dialogRef.close();
   }

  getInfo() {
     new Promise(resolve => setTimeout(() => resolve(), 250))
      .then(() => {
        for (let i = 0; i < this.sageExport.length; i++) {
          // find comp in sage-export and get article number
          const designators: string = this.sageExport[i]['Designator'];
          if (designators.includes(this.selectedText + ', ') || designators.includes(', ' + this.selectedText) || designators === this.selectedText) {
            this.comp = [];
            const articleNr: string = this.sageExport[i]['Comment'];
            let des: string = '';
            for (let j = 0; j < this.sageExport.length; j++) {
              if (this.sageExport[j]['Comment'] === articleNr) {
                des += this.sageExport[j]['Designator'] + ', ';
              }
            }
            this.comp.push('Designator(s): ' + des);
            // find articleNr in ressourcenliste and get info
            for (let j = 0; j < this.ressourcen.length; j++) {
              if (this.ressourcen[j]['value']['Resnum'] === articleNr) {
                const keys = Object.keys(this.ressourcen[j]['value']);
                for (let k = 0; k < Object.keys(this.ressourcen[j]['value']).length; k++) {
                  if (keys[k] !== 'Artikel') {
                    this.comp.push(keys[k] + ': ' + this.ressourcen[j]['value'][keys[k]]);
                  }
                }
                break;
              }
            }
            break;
          }
        }
      })
      .catch(err => console.error('p5', err));
  }

}
