import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {
  art: string;
  article: string;
  ressourcen: Object[] = [];
  formulare: Object[];
  selectedText: string;
  comp: string[] = [];
  reparatur = false;
  bestueckung = false;
  component = false;
  choose = false;
  display= ['Id', 'Art', 'Time'];
  headers: string[] = ['Designator', 'Quantity', 'Comment', 'Matchcode', 'Lieferant', 'HArtikelnummer', 'Hersteller', 'Einzelpreis']; // maybe

  constructor(private dialogRef: MatDialogRef<DialogComponent>, @Inject(MAT_DIALOG_DATA) data) {
    this.art=data[0];
    if(this.art==='Component'){
      this.selectedText = data[1];
      this.article = data[2];
      this.ressourcen = data[3];
      this.reparatur = false;
      this.bestueckung = false;
      this.component = true;
    }else if(this.art==='Article'){
      this.comp=data[1];
      this.bestueckung = data[2];
      this.reparatur = !data[2];
    }else if(this.art==='Choose'){
      this.formulare = data[1];
      this.choose = true;
    }

  }

  ngOnInit() {
    if(this.art==='Component'){
      for (let j = 0; j < this.ressourcen.length; j++) {
        const keys = Object.keys(this.ressourcen[j]);
        for (let k = 0; k < Object.keys(this.ressourcen[j]).length; k++) {
          if (keys[k] !== 'Artikel') {
            this.comp.push(keys[k] + ': ' + this.ressourcen[j][keys[k]]);
          }
        }
        break;
      }
    }else if(this.art==='Article'){

    }else if(this.art==='Choose'){

    }

  }

  close(result?: string) {
        this.dialogRef.close(result);
   }
}
