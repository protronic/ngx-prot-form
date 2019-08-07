import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {
  article: string;
  ressourcen: Object[] = [];
  selectedText: string;
  comp: string[] = [];
  headers: string[] = ['Designator', 'Quantity', 'Comment', 'Matchcode', 'Lieferant', 'HArtikelnummer', 'Hersteller', 'Einzelpreis']; // maybe

  constructor(private dialogRef: MatDialogRef<DialogComponent>, @Inject(MAT_DIALOG_DATA) data) {
    this.selectedText = data[0];
    this.article = data[1];
    this.ressourcen = data[3];
  }

  ngOnInit() {
    for (let j = 0; j < this.ressourcen.length; j++) {
      const keys = Object.keys(this.ressourcen[j]);
      for (let k = 0; k < Object.keys(this.ressourcen[j]).length; k++) {
        if (keys[k] !== 'Artikel') {
          this.comp.push(keys[k] + ': ' + this.ressourcen[j][keys[k]]);
        }
      }
      break;
    }
  }

  close() {
        this.dialogRef.close();
   }
}
