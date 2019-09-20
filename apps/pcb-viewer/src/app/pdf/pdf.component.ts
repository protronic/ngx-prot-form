import { DialogComponent } from '../dialog/dialog.component';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {Component, OnInit, ViewChild, HostListener, Output, EventEmitter, Renderer2} from '@angular/core';
import {PdfViewerComponent, PDFDocumentProxy, PDFProgressData} from 'ng2-pdf-viewer';
import {PDFTreeNode} from 'pdfjs-dist';
import { HttpClient } from '@angular/common/http';
import {MatDialog, MatDialogConfig, MatTableDataSource} from '@angular/material';
import {MatSort} from '@angular/material/sort';
import {Sort} from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { DatabaseConnectionService } from '../database-connection.service';

export interface OutlineItem {
  pos?: string;
  des?: string;
  art?: string;
  quan?: string;
  match?: string
}

export interface Formular {
  id: string;
  time: string;
  showBot: boolean;
  showTop: boolean;
  showBoth: boolean;
  showSMD: boolean;
  showTHT: boolean;
  pageNr: number;
  currentRow: number;
  highlightedRow: string;
  changedComps: string;
  parentForm: string;
  platinenNr: string;
  comment: string;
  log: JSON;
}

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.css']
})
export class PdfComponent implements OnInit {
  article: string;
  articleName: string;
  pdfSrc: string;
  pdf: PDFDocumentProxy;
  isLoaded = false;

//  outline: PDFTreeNode[] = [];
//  thtOutline: PDFTreeNode[] = [];
//  smdOutline: PDFTreeNode[] = [];
  outlineTop: OutlineItem[];
  outlineBot: OutlineItem[] = [];
  smdOutlineTop: OutlineItem[];
  smdOutlineBot: OutlineItem[] = [];
  thtOutlineTop: OutlineItem[] = [];
  thtOutlineBot: OutlineItem[] = [];
  dataSource: OutlineItem[];
  currentData: OutlineItem[];
  formulare: Formular[];
  columnsToDisplay = ['position', 'designator', 'artikelnummer', 'matchcode'];

  bonus_info: Array<any> = [];
  fertigung: String[];
  attachments: String[] = [];
  hasComps = false;
  comps: String[] = [];
  n: number;
  selectMultiple: boolean;
  jsonFile: String[];
  json: Object;
  showSMD: boolean;
  showTHT: boolean;
  showBoth: boolean;
  showBot = false;
  showTop = true;
  checkSMD = true;
  checkTHT = false;
  pageNr = 1;
  totalPages;
  prevDis = true;
  nextDis = false;
  zoom = 2;
  smallDis = false;
  bigDis = false;
  showPDF = false;
  highlightedRow: Array<string> = [''];
  currentRow =-1;
  hasRows = false;
  rows: NodeListOf<Element>;

  databaseTracking = 'http://prot-subuntu:5985/ausgefuellte_formulare/';
  bestueckung = false;
  reparatur = false;
  platine = '';
  comment = '';
  changedComps: OutlineItem[] = [];
  loginstatus: string;
  username: string;
  addInfo: string[];
  platinenNr: string;
  formID: string;

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  //hebt Reihe(n) und Komponente(n) hervor nachdem auf Kopmonente geklickt wurde
  //arbeitet stark mit BackgroundLayer des PDFs und ist auf dessen Beschaffenheit angepasst
  @HostListener('dblclick') onMouseOver() {
    if(this.currentData===undefined) this.currentData=this.filterDataSource();
    this.currentRow=-1;
    let change = false;
    this.clearAll();
    if (!this.selectMultiple) {
      change = true;
    }
    if (!this.hasComps) {
      this.getComps();
    }
    this.rows = document.querySelectorAll('.mat-row');
    let selectedText: string = window.getSelection().toString();
//    console.log(selectedText);
    if (selectedText.substr(0, 2) === 'PA') {
      selectedText = selectedText.substr(2);
      const splitText = selectedText.split('0');
      selectedText = splitText[0];
      for (let i = 1; i < splitText.length - 1; i++) {
        selectedText += splitText[i] + '0';
      }
      for (let i = 0; i < this.jsonFile.length; i++) {
        const designators: string = this.jsonFile[i]['Designator'];
        if ((designators.includes(selectedText + ', ') || designators.includes(', ' + selectedText) || designators === selectedText)
        &&((this.jsonFile[i]['Side']==='TopLayer'&&this.showTop)||(this.jsonFile[i]['Side']==='BottomLayer'&&this.showBot))
        &&((this.jsonFile[i]['ImportID']==="1"&&this.showSMD)||(this.jsonFile[i]['ImportID']==="2"&&this.showTHT)||(!this.showTHT&&!this.showSMD))) {
//          console.log(selectedText + ' found at row ' + i.toString());
          if (this.showBoth) {
             this.dialog.open(DialogComponent, {height: '45%',
                                                width: '30%',
                                                'data': ['Component', selectedText, this.article, this.bonus_info.filter(entry => (entry['bezeichnung'] === selectedText)) ]});
          }
          selectedText = selectedText.split(' ')[0];
          this.highlightedRow.push(selectedText);
          this.highlight(selectedText + ' ');
          //getting currentRow
          for(let j=0; j<this.currentData.length; j++){
            if(this.currentData[j]['des']===selectedText){
              this.currentRow=j;
              break;
            }
          }
          //scrolling to currentRow
          for (let j = 0; j < this.rows.length; j++) {
            const designator = this.dataSource[j]['des'];
            if (this.highlightedRow.includes(designator)) {
              this.rows[j].parentElement.scrollTop = (this.currentRow) * this.rows[j].getBoundingClientRect().height;
              break;
            }
          }
          this.selectMultiple = true;
          if(this.bestueckung) this.highlightBezeichnerListe(selectedText);
          if (change) {
            this.selectMultiple = false;
          }
          // highlighting all components
//          const names: string[] = this.jsonFile[i]['Designator'].split(', ');
//          for (let j = 0; j < names.length; j++) {
//            this.highlight(names[j] + ' ');
//          }
//          this.selectMultiple = false;
          break;
        }
      }
     } else if(selectedText.substr(0, 2) === 'CO') {
          selectedText = selectedText.substr(2);
          selectedText = selectedText.split(' ')[0];
//          console.log(selectedText);
          for (let i = 0; i < this.jsonFile.length; i++) {
            const designators: string = this.jsonFile[i]['Designator'];
            if ((designators.includes(selectedText + ', ') || designators.includes(', ' + selectedText) || designators === selectedText)
            &&((this.jsonFile[i]['Side']==='TopLayer'&&this.showTop)||(this.jsonFile[i]['Side']==='BottomLayer'&&this.showBot))
            &&((this.jsonFile[i]['ImportID']==="1"&&this.showSMD)||(this.jsonFile[i]['ImportID']==="2"&&this.showTHT)||(!this.showTHT&&!this.showSMD))) {
//              console.log(selectedText + ' found at row ' + i.toString());
              if (this.showBoth) {
                this.dialog.open(DialogComponent, {height: '45%',
                                                   width: '30%',
                                                   'data': ['Component', selectedText, this.article, this.bonus_info.filter(entry => (entry['bezeichnung'] === selectedText)) ]});
              }
              selectedText = selectedText.split(' ')[0];
              this.highlightedRow.push(selectedText);
              this.highlight(selectedText + ' ');
              //getting currentRow
              for(let j=0; j<this.currentData.length; j++){
                if(this.currentData[j]['des']===selectedText){
                  this.currentRow=j;
                  break;
                }
              }
              //scrolling to currentRow
              for (let j = 0; j < this.rows.length; j++) {
                const designator = this.dataSource[j]['des'];
                if (this.highlightedRow.includes(designator)) {
                  this.rows[j].parentElement.scrollTop = (this.currentRow) * this.rows[j].getBoundingClientRect().height;
                  break;
                }
              }
              this.selectMultiple = true;
              if(this.bestueckung) this.highlightBezeichnerListe(selectedText);
              if (change) {
                this.selectMultiple = false;
              }
              // highlighting all components
//              const names: string[] = this.jsonFile[i]['Designator'].split(', ');
//              for (let j = 0; j < names.length; j++) {
//                this.highlight(names[j] + ' ');
//              }
              break;
            }
          }
     }
  }

  @HostListener('document:keydown', ['$event']) keyPressed(event: KeyboardEvent) {
    //andere Taste wegen schreiben?
    if (event.key === 'Enter') {
      this.enter();
    }
  }

  constructor(private renderer: Renderer2, private httpService: HttpClient, private dialog: MatDialog, private route: ActivatedRoute, private db_con: DatabaseConnectionService) {
  }

  //holt Daten und setzt StandardEinstellungen
  ngOnInit() {
    this.route.queryParams
        .subscribe(params => {
          this.article = params.artikelnummer;
          this.loginstatus = params.loginstatus;
          this.username = params.username;
          this.formID = params.model;
          if (this.article !== undefined ) {
            //momentan: für SMD als Standard
            //aufgerufen falls keine Nummer übergeben
            this.showBoth = true;
            this.showSMD = false;
            this.showTHT = false;
            this.reparatur = true;
            this.bestueckung = false;
            this.selectMultiple = false;

            //holt alle formulare mit spezifizierter Artikelnummer
            this.db_con.get_formular(this.article)
              .then(data =>{
                this.formulare = data.map( entry => ({
                  id: entry['_id'],
                  time: entry['Datum'],
                  showBot: entry['showBot']==='true',
                  showTop: entry['showTop']==='true',
                  showBoth: entry['showBoth']==='true',
                  showSMD: entry['showSMD']==='true',
                  showTHT: entry['showTHT']==='true',
                  pageNr: parseInt(entry['pageNr'], 10),
                  currentRow: parseInt(entry['currentRow'], 10),
                  highlightedRow: entry['highlightedRow'],
                  changedComps: entry['changedComps'],
                  parentForm: entry['parentForm'],
                  platinenNr: entry['platinenNr'],
                  comment: entry['comment'],
                  log: entry['log']
                }));
              })


            // Eingriff:
            this.db_con.get_complete_ressource_list(this.article)
              .then(data => {
                this.jsonFile = data.map( entry => ({
                  "Center-x": entry['x_position'],
                  "Center-y": entry['y_position'],
                  Comment: entry['ressourcen_nummer'],
                  Designator: entry['bezeichnung'],
                  ImportID: entry['fertigungstyp'] === 'SMD' ? "1" : "2",
                  Rotation: entry['rotation'],
                  Side: entry['seite']
                }) );

                this.fertigung = data.map( entry => ({
                  Artikel: entry['Artikel'],
                  Fach: entry['Fach'],
                  Matchcode: entry['Matchcode'],
                  Menge: entry['Menge'],
                  Resnum: entry['Resnum']
                }));

                this.bonus_info = data;
                this.pdfSrc = `http://prot-nas/pdf/altium/${data[0]['Komplettbest_Platine']}/AssemblyDrawings.pdf`;
                this.showPDF = true;
              })


            // this.db_con.get_pdf_src(this.article)
            //   .then(pdfSrc => {
            //     this.pdfSrc = pdfSrc;
            //     this.showPDF = true;
            //   })

          } else if (this.article === undefined) {

          }
        });





  }

  /**
 * Get pdf information after it's loaded
 * @param pdf
 */

  //ausgeführt nachdem PDF geladen
  afterLoadComplete(pdf: PDFDocumentProxy) {
    this.pdf = pdf;
    this.isLoaded = true;
    this.loadOutline();
    this.totalPages = pdf.numPages;
  }

  //gibt Hingtergrundfarbe für Reihe wieder, in Referenz zu highlightedRow
  backgroundCalc(row: Array<any>){
    return this.highlightedRow.includes(row['des']) ? '#d4bff9' : '';
  }

  //zoom in
  big() {
    if (this.smallDis) {
      this.smallDis = false;
    }
    if (this.zoom < 5) {
      this.zoom = this.zoom + 0.25;
    }
    if ( this.zoom === 5) {
      this.bigDis = true;
    }
    new Promise(resolve => setTimeout(() => resolve(), 1000))
      .then(() => {
        for (let i = 0; i < this.dataSource.length; i++) {
          const designator: string = this.dataSource[i]['des'];
          if (this.highlightedRow.includes(designator)) {
            this.highlight(this.dataSource[i]['des'] + ' ');
          }
        }
      })
      .catch(err => console.error('p4', err));
  }

  //alt: wählt Outline, die angezeigt wird
  changeData() {
    if (this.showBoth && this.showBot) {
      this.dataSource = this.outlineBot;
    } else if (this.showBoth && this.showTop) {
      this.dataSource = this.outlineTop;
    } else if (this.showSMD && this.showBot) {
      this.dataSource = this.smdOutlineBot;
    } else if (this.showSMD && this.showTop) {
      this.dataSource = this.smdOutlineTop;
    } else if (this.showTHT && this.showBot) {
      this.dataSource = this.thtOutlineBot;
    } else if (this.showTHT && this.showTop) {
      this.dataSource = this.thtOutlineTop;
    }
    this.dataSource.sort(function(a, b) {return parseInt(a['pos'], 10) < parseInt(b['pos'], 10) ? -1:1; });
  }

  //ändert Status von SelectMultiple und ggf clearAll()
  changeMultiple(){
    this.selectMultiple = !this.selectMultiple;
    if(!this.selectMultiple) this.clearAll();
  }

  //aufgerufen, wenn Checkbox Reparatur aufgerufen
  changeRep() {
    this.clearAll()
    this.currentRow=-1;
    this.reparatur = !this.reparatur;
    if ((this.showSMD && this.reparatur) || (this.reparatur && this.showTHT)) {
      this.changedComps = [];
      this.platine = '';
      this.comment = '';
      this.showSMD = false;
      this.showTHT = false;
      this.bestueckung = false;
    }
    this.currentData=this.filterDataSource();
  }

  //alt für checkbox SMD
  changeSMD() {
    this.checkSMD = !this.checkSMD;
    if (this.checkSMD && this.checkTHT) {
      this.showBoth = true;
      this.showSMD = false;
      this.showTHT = false;
    } else if (this.checkSMD && !this.checkTHT) {
      this.showBoth = false;
      this.showSMD = true;
      this.showTHT = false;
    } else if (!this.checkSMD && this.checkTHT) {
      this.showBoth = false;
      this.showSMD = false;
      this.showTHT = true;
    } else if (!this.checkSMD && !this.checkTHT) {
      this.showBoth = false;
      this.showSMD = false;
      this.showTHT = false;
    }
    this.changeData();
  }

  //aufgerufen, wenn Checkbox SMD aktiviert
  changeSmd() {
    this.clearAll()
    this.currentRow=-1;
    this.showSMD = !this.showSMD;
    if ((this.showSMD && this.reparatur) || (this.showSMD && this.showTHT)) {
      if(this.reparatur) {
        this.changedComps = [];
        this.comment = '';
        this.platine = '';
      }
      this.reparatur = false;
      this.showTHT = false;
      this.bestueckung = true;
    }
    this.currentData=this.filterDataSource();
  }

  //alt für checkbox THT
  changeTHT() {
    this.checkTHT = !this.checkTHT;
    if (this.checkSMD && this.checkTHT) {
      this.showBoth = true;
      this.showSMD = false;
      this.showTHT = false;
    } else if (this.checkSMD && !this.checkTHT) {
      this.showBoth = false;
      this.showSMD = true;
      this.showTHT = false;
    } else if (!this.checkSMD && this.checkTHT) {
      this.showBoth = false;
      this.showSMD = false;
      this.showTHT = true;
    } else if (!this.checkSMD && !this.checkTHT) {
      this.showBoth = false;
      this.showSMD = false;
      this.showTHT = false;
    }
    this.changeData();
  }

  //aufgerufen, wenn Checkbox THT aktiviert
  changeTht() {
    this.clearAll()
    this.currentRow=-1;
    this.showTHT = !this.showTHT;
    if ((this.showTHT && this.reparatur) || (this.showTHT && this.showSMD)) {
      if(this.reparatur){
        this.changedComps = [];
        this.platine = '';
        this.comment = '';
      }
      this.reparatur = false;
      this.showSMD = false;
      this.bestueckung = true;
    }
    this.currentData=this.filterDataSource();
  }

  //Zeige Formulare mit bestimmter PlatinenNr zur Auswahl an und lade danach ausgewähltes
  chooseForm(){
    const dialogRef = this.dialog.open(DialogComponent, {height: '45%',
                                         width: '30%',
                                         'data': ['Form']});
    const data = [];
    dialogRef.afterClosed().subscribe(result => {
      if(result==='all'){
        if(this.formulare.length>0){
          const dialog = this.dialog.open(DialogComponent, {height: '45%',
                                         width: '30%',
                                         'data': ['Choose', this.formulare]});
          dialog.afterClosed().subscribe(res => {
            this.formID = res;
            for(let i=0; i<this.formulare.length; i++){
              if(this.formulare[i].id===res){
                this.loadForm(this.formulare[i]);
                break;
              }
            }
          })
        }else{
          const dialog = this.dialog.open(DialogComponent, {height: '20%',
                                         width: '30%',
                                         'data': ['NoForms']});
        }

      } else{
        this.platine = result;
        for(let i=0; i<this.formulare.length; i++){
          if(this.formulare[i].platinenNr === this.platine){
            data.push(this.formulare[i]);
          }
        }
        if(data.length>0){
          const dialog = this.dialog.open(DialogComponent, {height: '45%',
                                         width: '30%',
                                         'data': ['Choose', data]});
          dialog.afterClosed().subscribe(res => {
            this.formID = res;
            for(let i=0; i<this.formulare.length; i++){
              if(this.formulare[i].id===res){
                this.loadForm(this.formulare[i]);
                break;
              }
            }
          })
        }else{
          const dialog = this.dialog.open(DialogComponent, {height: '20%',
                                         width: '30%',
                                         'data': ['NoForms']});
        }

      }

    });

  }

  //mache alle Hervorhebungen rückgängig
  clearAll() {
    this.highlightedRow = [];
    for (let i = 0; i < document.querySelector('.textLayer').querySelectorAll('span').length; i++) {
      this.renderer.removeStyle(document.querySelector('.textLayer').querySelectorAll('span')[i], 'background-color');
    }
  }

  //SQL Query gibt String statt Array zurück
  //Hole also Des aus String und füge entsprechende Kopmonenten zu Array hinzu
  convertComps(s: string){
    const liste = s.split('"');
    const comp = {pos: '', des: '', quan: '', art: '', match: ''};
    this.changedComps = [];
    for(let i=1; i<liste.length; i++){
      if(liste[i] === 'des'){
        const des = liste[i+2];
        for (let j = 0; j < this.dataSource.length; j++) {
          if (this.dataSource[j]['des'] === des) {
            this.changedComps.push(this.dataSource[j]);
            break;
          }
        }
      }
    }
  }

  //SQL Query gibt String anstatt Array zurück
  //Hole also Des aus String und füge diese zu Array hinzu
  convertRow(s: string){
    this.highlightedRow = [];
    const liste = s.split('"');
    for(let i=1; i<liste.length-1; i++){
      if(liste[i]!==','){
        this.highlightedRow.push(liste[i]);
      }
    }
  }

  //springt in die nächste Zeile
  //aufgerufen, wenn Enter oder Button weiter gedrückt
  enter() {
    if(this.bestueckung){
      if(this.currentData===undefined) this.currentData=this.filterDataSource();
      this.clearAll();

      //falls man alle Komponenten mit der gelichen Artikelnummer auswählt, wird gleich zum nächsten mit anderer Artikelnummer weitergegangen
      if(this.currentRow!==-1 && this.bestueckung && this.currentRow<this.currentData.length){
        const art = this.currentData[this.currentRow]['art'];
        while(this.currentRow<this.currentData.length && this.currentData[this.currentRow]['art']===art){
          this.currentRow++;
        }
      }else{
        this.currentRow++;
      }

      if (this.currentRow<this.currentData.length){
        this.highlightedRow[0] = this.currentData[this.currentRow]['des'];
      } else{
        this.highlightedRow[0]='';
      }
      this.highlight(this.highlightedRow[0]+' ');

      //scrolling und highlighting
      new Promise(resolve => setTimeout(() => resolve(), 500))
        .then(() => {
          this.rows = document.querySelectorAll('.mat-row');
          for (let i = 0; i < this.rows.length; i++) {
            const designator = this.dataSource[i]['des'];
            if (this.highlightedRow.includes(designator)) {
              this.rows[i].parentElement.scrollTop = (this.currentRow) * this.rows[i].getBoundingClientRect().height;
              break;
            }
          }

          if (!this.hasComps) {
            this.getComps();
          }
          let change = false;
          if(!this.selectMultiple){
            change = true;
            this.selectMultiple = true;
          }
          if (this.bestueckung) this.highlightBezeichnerListe(this.highlightedRow[0]);
          if(change){
            this.selectMultiple = false;
          }
        })
        .catch((err) => (console.error('p1', err)));
    }

  }

  //filtert angezeigte Komponenten
  filterDataSource(){
    if(this.reparatur){
      return this.dataSource;
    }
    else if(this.showTHT){
      return this.dataSource.filter( row => (this.bonus_info.find( entry => (entry.ressourcen_nummer === row.art))['fertigungstyp'] === 'THT'));
    }
    else{
      return this.dataSource.filter( row => (this.bonus_info.find( entry => (entry.ressourcen_nummer === row.art))['fertigungstyp'] === 'SMD'));
    }
  }

  //holt KomponentenNamen aus PDF
  getComps() {
    this.comps = [];
    this.n = 0;

    const textLayer: NodeListOf<Element> = document.querySelectorAll('.textLayer');
//      console.log('textLayer');
    const divs: NodeListOf<Element> = textLayer[0].querySelectorAll('span');
//      console.log('divs');
//    console.log(divs.length);
    if (divs.length > 0) {
      this.hasComps = true;
    }
    for (let i = 0; i < divs.length; i++) {
      const name: string = divs[i].innerHTML;
//        console.log(name);
      if (name.substr(0, 2) === 'CO') {
//        console.log(name);
//          console.log(divs[i].outerHTML);
        if (i < 10) {
          this.comps.push('   ' + i.toString() + ' ' + divs[i].innerHTML.substr(2));
        } else if (i < 100) {
          this.comps.push('  ' + i.toString() + ' ' + divs[i].innerHTML.substr(2));
        } else if (i < 1000) {
          this.comps.push(' ' + i.toString() + ' ' + divs[i].innerHTML.substr(2));
        } else if (i < 10000) {
          this.comps.push(i.toString + ' ' + divs[i].innerHTML.substr(2));
        }
      }
    }
  }

  //hebt text im PDF hervor
  highlight(text: string) {
    for (let i = 0; i < this.comps.length; i++) {
      if (this.comps[i].substr(5) === text) {
//        console.log('Gotcha!' + node.title);
//        console.log(this.comps[i]);
        const n = parseInt(this.comps[i].substr(0, 4), 10);
//        console.log(this.n);
//        this.renderer.setValue(document.querySelector('.textLayer').querySelectorAll('div')[this.n], this.comps[i].substr(5));
//        this.renderer.setStyle(document.querySelector('.textLayer').querySelectorAll('div')[this.n], 'color', 'black');
//        this.renderer.setStyle(document.querySelector('.textLayer').querySelectorAll('div')[this.n], 'font-size', '30px');
        this.renderer.setStyle(document.querySelector('.textLayer').querySelectorAll('span')[n], 'background-color', '#5300e8');
        this.renderer.setStyle(document.querySelector('.textLayer').querySelectorAll('span')[n], 'height', '3vh');
        this.renderer.setStyle(document.querySelector('.textLayer').querySelectorAll('span')[n], 'width', '5vh');
      }
    }
    text = text.split(' ')[0];
    let add = true;
    for (let i = 0; i < this.changedComps.length; i++) {
      if (this.changedComps[i]['des'] === text) {
        add = false;
        break;
      }
    }
    if (add) {
      for (let i = 0; i < this.dataSource.length; i++) {
        if (this.dataSource[i]['des'] === text) {
          this.changedComps.push(this.dataSource[i]);
          break;
        }
      }
    }
  }

  //hebt bezeichner, sowie alle Komponenten in dessen BezeichnerListe hervor
  highlightBezeichnerListe(bezeichner: string){
    for(let i=0; i<this.bonus_info.length; i++){
      if(this.bonus_info[i]['bezeichnung']===bezeichner){
        let liste = this.bonus_info[i]['bezeichner_liste'];
        liste = liste.split(',');
        const currentDes = [];
        for(let j=0; j<this.currentData.length; j++){
          currentDes.push(this.currentData[j]['des']);
        }
        for(let j=0; j<liste.length; j++){
          if(currentDes.includes(liste[j])){
            this.highlight(liste[j]+' ');
            this.highlightedRow.push(liste[j]);
          }
        }
        break;
      }
    }
  }

  //lädt übergebenes Formular
  loadForm(form: Formular){
    this.currentRow = form.currentRow;
    this.platine = form.platinenNr;
    this.comment = form.comment;
    this.pageNr = form.pageNr;
    this.showBot = form.showBot;
    this.showTop = form.showTop;
    this.showBoth = form.showBoth;
    this.showTHT = form.showTHT;
    this.showSMD = form.showSMD;
    this.bestueckung = form.parentForm === 'Bestückung';
    this.reparatur = form.parentForm !== 'Bestückung';
    this.currentData = this.filterDataSource();
    this.convertComps(form.changedComps);
    this.convertRow(form.highlightedRow);
    //highlight Komponenten
    if(!this.hasComps){this.getComps();}
    for(let j=0; j<this.highlightedRow.length; j++){
      this.highlight(this.highlightedRow[j] + ' ');
    }
    //scroll zur richtigen Zeile
    this.rows = document.querySelectorAll('.mat-row');
    for (let j = 0; j < this.rows.length; j++) {
      const designator = this.dataSource[j]['des'];
      if (this.highlightedRow.includes(designator)) {
        this.rows[j].parentElement.scrollTop = (this.currentRow) * this.rows[j].getBoundingClientRect().height;
        break;
      }
    }
  }

  //alt: holt Outline mit Komponenten aus PDF
  loadOutline() {
    this.outlineTop = [];
    this.outlineBot = [];
    this.smdOutlineTop = [];
    this.smdOutlineBot = [];
    this.thtOutlineTop = [];
    this.thtOutlineBot = [];
    let top1 = 1; //counter for smd
    let bot1 = 1;
    let top2 = 1; //counter for tht
    let bot2 = 1;
    let top3 = 1; //counter for both
    let bot3 = 1;
    this.pdf.getOutline()
      .then((outline: any[]) => {
        //console.log(outline[0])
        const my_outline: PDFTreeNode[] = outline[0].items[0].items[0].items[0].items;
        for (let index = 0; index < my_outline.length; index++) {
          const title = my_outline[index].title;
          for (let i = 0; i < this.jsonFile.length; i++) {
            const designators: string = this.jsonFile[i]['Designator'];
              if (designators === title) {
                const platine: string = this.jsonFile[i]['ImportID'];
                const side: string = this.jsonFile[i]['Side'];
                const artNum: string = this.jsonFile[i]['Comment'];
                let matchCode: string;
                if (this.showBoth) {
                  for (let j = 0; j < this.fertigung.length; j++) {
                    if (this.fertigung[j]['Resnum'] === artNum) {
                      matchCode = this.fertigung[j]['Matchcode'];
                      break;
                    }
                  }
                } else if (this.showSMD || this.showTHT) {
                  for (let j = 0; j < this.fertigung.length; j++) {
                    if (this.fertigung[j]['RessourceNummer'] === artNum) {
                      matchCode = this.fertigung[j]['Matchcode'];
                      break;
                    }
                  }
                }
                if (side === 'TopLayer') {
                  const item = {pos: top3.toString(),
                                des: title,
                                art: artNum,
                                match: matchCode
                                };
                  this.outlineTop.push(item);
                  top3++;
                } else if (side === 'BottomLayer') {
                  const item = {pos: bot3.toString(),
                                des: title,
                                art: artNum,
                                match: matchCode
                                };
                  this.outlineBot.push(item);
                  bot3++;
                }
                if (!this.showBoth) {
                  for (let h = 0; h < this.fertigung.length; h++) {
                    if (artNum === this.fertigung[h]['RessourceNummer']) {
                      const posi = this.fertigung[h]['Pos'];
                      if (platine === '1.0' || platine === '1') {
                        if (side === 'TopLayer') {
                          const item = {pos: posi,
                                        des: title,
                                        art: artNum,
                                        match: matchCode
                                        };
                          this.smdOutlineTop.push(item);
                          top1++;
                        } else if (side === 'BottomLayer') {
                          const item = {pos: posi,
                                        des: title,
                                        art: artNum,
                                        match: matchCode
                                        };
                          this.smdOutlineBot.push(item);
                          bot1++;
                        }
                        break;
                      } else if (platine === '2.0' || platine === '2') {
  //                      this.thtOutline.push(array_element);
                          if (side === 'TopLayer') {
                            const item = {pos: posi,
                                          des: title,
                                          art: artNum,
                                          match: matchCode
                                          };
                            this.thtOutlineTop.push(item);
                            top2++;
                          } else if (side === 'BottomLayer') {
                              const item = {pos: posi,
                                            des: title,
                                            art: artNum,
                                            match: matchCode
                                            };
                              this.thtOutlineBot.push(item);
                              bot2++;
                          }
                          break;
                      }
                    }
                  }
                }
              }
          }
        }
      }, err => console.error('p6', err))
      ;
    this.smdOutlineTop.sort(function(a, b) {return parseInt(b['pos'], 10) - parseInt(a['pos'], 10); });
    this.smdOutlineBot.sort(function(a, b) {return parseInt(b['pos'], 10) - parseInt(a['pos'], 10); });
    this.thtOutlineTop.sort(function(a, b) {return parseInt(b['pos'], 10) - parseInt(a['pos'], 10); });
    this.thtOutlineBot.sort(function(a, b) {return parseInt(b['pos'], 10) - parseInt(a['pos'], 10); });
//    this.changeData();
  }

  //öffnet InfoDialog über gesamten Vorgang
  //TO-DO: noch mehr Info wie z.B. Modellnummer u.Ä. reinpacken (alles was nicht in GUI einsehbar)
  moreInfo(){
    this.addInfo = [];
    this.addInfo.push('Artikelname: ' + this.articleName);
    this.addInfo.push('Artikelnummer: ' + this.article);
    this.addInfo.push('Benutzer: ' + this.username);
    this.addInfo.push('Login-Status: ' + this.loginstatus);
    if(this.changedComps.length!==0){
      //sortiere nach Designator
      this.changedComps.sort(function(a,b) {return a['des']<b['des'] ? -1:1;});
      let comp = this.changedComps[0]['des'];
      for(let i=1; i<this.changedComps.length; i++){
        comp+= ', ' + this.changedComps[i]['des'];
      }
      this.addInfo.push('Betrachtete Komponeneten: ' + comp);
    }

    if(this.bestueckung) this.addInfo.push('Auftragsnummer. ' + this.fertigung[0]['Fertigungsauftragsnummerbc']);
    this.dialog.open(DialogComponent, {height: '45%',
                                       width: '30%',
                                       'data':['Article', this.addInfo, this.bestueckung]});
  }

  //alt: aufgerufen, um eine Komponente hervorzuheben
  navigateTo(node: string) {
    //    const searchObject = { caseSensitive: true, findPrevious: undefined, highlightAll: true, phraseSearch: true, query: node.title + ' ' };
    //    console.log('navigateTo:' + node.title);
    //    console.log('   ' + node.dest[0].num + ', ' + node.dest[0].gen + ', ' + node.dest[1].name + ', ' + node.dest[2]);
    //    dest[0] --> page to jump to; dest[1] --> kind of zoom
        if (!this.hasComps) {
          this.getComps();
        }
        if (!this.selectMultiple) {
          this.clearAll();
        }
        this.highlight(node + ' ');
    //    this.pdfComponent.pdfFindController.executeCommand('find', searchObject);

  }

  //nächste Seite
  next(reset: boolean) {
    this.currentRow=-1;
    if (this.pageNr < 2) {
      this.pageNr = this.pageNr + 1;
      this.showTop = false;
      this.showBot = true;
      if (this.prevDis) {
        this.prevDis = false;
      }
      if (this.pageNr = this.pdf.numPages) {
        this.prevDis = false;
        this.nextDis = true;
      }
    }
    this.changeData();
    if (reset) {
      this.clearAll();
    }
    this.currentData = this.filterDataSource();
  }

  //aufgerufen, nachdem eine Seite des PDF geladen wurde
  pageRendered(e: CustomEvent) {
    new Promise(resolve => setTimeout(() => resolve(), 1000))
      .then(() => {
          this.changeData();
          if(this.formID!==undefined&&this.formulare.length>0){
            for(let i=0; i<this.formulare.length; i++){
              if(this.formulare[i].id===this.formID){
                this.loadForm(this.formulare[i]);
                break;
              }
            }
          }
        })
      .catch((err) => console.error('p2', err));
  }

  //vorherige Seite
  prev(reset: boolean) {
    this.currentRow=-1;
    if (this.pageNr > 1) {
      this.pageNr = this.pageNr - 1;
      this.showTop = true;
      this.showBot = false;
      if (this.nextDis) {
        this.nextDis = false;
      }
      if (this.pageNr === 1) {
        this.prevDis = true;
        this.nextDis = false;
      }
    }
    this.changeData();
    if (reset) {
      this.clearAll();
    }
    this.currentData = this.filterDataSource();
  }

  //hebt Reihe, sowie benötigte Komponente(n) im PDF hervor
  rowClicked(pos: number, des: string) {
    //  console.log(this.dataSource)
    if(this.currentData === undefined) this.currentData = this.filterDataSource();
    pos = Number(pos.toString());
    for(let i=0; i<this.currentData.length; i++){
      if(Number(this.currentData[i]['pos'])===pos){
        this.currentRow=i;
        break;
      }
    }
      // this.changeSMD()
      // this.changeTHT()
      // console.log({outlineBot: this.outlineBot, outlineTop: this.outlineTop, smdOutlineBot: this.smdOutlineBot, smdOutlineTop: this.smdOutlineTop, thtOutlineBot: this.thtOutlineBot, thtOutlineTop: this.thtOutlineTop})
    if (!this.hasComps) {
      this.getComps();
    }
    let change = false;
    if (!this.selectMultiple) {
      this.clearAll();
      change = true;
    }
    this.highlightedRow.push(des);
    if(!this.bestueckung){
      this.highlight(des + ' ');
    } else {
      this.selectMultiple = true;
      this.highlightBezeichnerListe(des);
      if (change) {
        this.selectMultiple = false;
      }
    }
  }

  //öffnet Tab mit bestimmten Link
  showAttach(id: string) {
    let url='';
    switch(id){
      case 'PDF': {url = `http://prot-nas/pdf/altium/${this.bonus_info[0]['Komplettbest_Platine']}/AssemblyDrawings.pdf`; break;}
      case 'Wiki': url = `http://prot-subuntu:8080/prot-wiki/Wiki.jsp?page=Artikelauskunft&currentNum=${this.article}#section-Artikelauskunft-PCB`;
    }
    window.open(url, '_blank');
  }

  //zoom out
  small() {
    if (this.bigDis) {
      this.bigDis = false;
    }
    if (this.zoom > 0.5) {
      this.zoom = this.zoom - 0.25;
    }
    if (this.zoom === 0.5) {
      this.smallDis = true;
    }
    new Promise(resolve => setTimeout(() => resolve(), 1000))
      .then(() => {
        for (let i = 0; i < this.dataSource.length; i++) {
          const designator: string = this.dataSource[i]['des'];
          if (this.highlightedRow.includes(designator)) {
            this.highlight(this.dataSource[i]['des'] + ' ');
          }
        }
      })
      .catch(err => console.error('p3', err));
  }

  //sortiert nach bestimmter Spalte
  sortData(sort: Sort) {
    const data = this.dataSource;
    if(sort.direction === ''){
      data.sort(function(a, b) {return parseInt(a['pos'], 10)<parseInt(b['pos'], 10) ? -1:1});
    }else{
      const isAsc = sort.direction==='asc';
      switch(sort.active){
        case 'position': {data.sort(function(a,b) {return (parseInt(a['pos'], 10)<parseInt(b['pos'], 10) ? -1:1)*(isAsc ? 1:-1);}); break;}
        case 'artikelnummer': data.sort(function(a,b) {return (parseInt(a['art'], 10)<parseInt(b['art'], 10) ? -1:1)*(isAsc ? 1:-1);});
      }
    }
    this.dataSource = data;
    this.currentData=this.filterDataSource();
  }

  //alt: sendet Formular an CouchDB
  submit(platine: string, comment: string) {
    if (platine !== undefined && comment !== undefined && (this.bestueckung || this.reparatur)) {
      let art: string;
      if (this.bestueckung) {
        art = 'PcbBestueckung';
      } else if (this.reparatur) {
        art = 'PcbReparatur';
      }
      const now = new Date();
      registerLocaleData(localeDe);
      const pipe = new DatePipe('de');
      const date = pipe.transform(now, 'medium');
      let item = {};
      if (this.bestueckung) {
        item = {
          'Platinennummer': platine,
          'Kommentar': comment,
          'Auftragsnummer': this.fertigung[0]['Fertigungsauftragsnummerbc'],
          'Komponenten': this.changedComps,
          'user': this.username,
          'Artikelnummer': this.article,
          'date': date,
          'parentForm': art
        };
      } else {
        item = {
          'Platinennummer': platine,
          'Kommentar': comment,
          'Komponenten': this.changedComps,
          'user': this.username,
          'Artikelnummer': this.article,
          'date': date,
          'parentForm': art
        };
      }
      const unixDate = now.getTime();
      console.log(this.loginstatus);
      this.httpService.put(this.databaseTracking + art + unixDate, item).subscribe(data => {
                  },
                  (err: HttpErrorResponse) => {
                    console.log(err.message);
      });
      this.changedComps = [];
    } else {
      if (platine === '') {
        console.log('Specify Platinennummer');
        //TODO: generate error message
      }
      if (comment === '') {
        console.log('Specify comment');
        //TODO: generate error message
      }
      if (!this.bestueckung && !this.reparatur) {
        console.log('Must specify Best�ckung or Reparatur');
        //TODO: generate error message
      }
    }
  }

  //schicke Formular nach Besückung
  submitB(platine: string){
    const now = new Date();
    registerLocaleData(localeDe);
    const pipe = new DatePipe('de');
    const date = pipe.transform(now, 'medium');
    const item = {
        'Platinennummer': platine,
        'Auftragsnummer': this.fertigung[0]['Fertigungsauftragsnummerbc'],
        'Fehlerbeschreibung': '',
        'betrachtete_Komponenten': this.changedComps,
        'Benutzer': this.username,
        'Artikelnummer': this.article,
        'Datum': date,
        'parentForm': 'Bestückung',
        'currentRow': this.currentRow,
        'highlightedRow': this.highlightedRow,
        'showBoth': this.showBoth,
        'showSMD':this.showSMD,
        'showTHT': this.showTHT,
        'showTop': this.showTop,
        'showBot': this.showBot,
        'pageNr': this.pageNr
    };
    this.db_con.save_formular_model(item);
    //console.log(item);
  }

  //schicke Formular nach Reparatur
  submitR(platine: string, comment: string){
    const now = new Date();
    registerLocaleData(localeDe);
    const pipe = new DatePipe('de');
    const date = pipe.transform(now, 'medium');
    const item = {
        'Platinennummer': platine,
        'Fehlerbeschreibung': comment,
        'betrachtete_Komponenten': this.changedComps,
        'Benutzer': this.username,
        'Artikelnummer': this.article,
        'Datum': date,
        'parentForm': 'Reparatur',
        'currentRow': this.currentRow,
        'highlightedRow': this.highlightedRow,
        'showBoth': this.showBoth,
        'showSMD':this.showSMD,
        'showTHT': this.showTHT,
        'showTop': this.showTop,
        'showBot': this.showBot,
        'pageNr': this.pageNr
    };
    this.db_con.save_formular_model(item);
    //console.log(item);
  }

  update(platine: string, comment: string){
    const now = new Date();
    registerLocaleData(localeDe);
    const pipe = new DatePipe('de');
    const date = pipe.transform(now, 'medium');
    const item = {
        'Platinennummer': platine,
        'Fehlerbeschreibung': comment,
        'betrachtete_Komponenten': this.changedComps,
        'Benutzer': this.username,
        'Artikelnummer': this.article,
        'Datum': date,
        'parentForm': 'Reparatur',
        'currentRow': this.currentRow,
        'highlightedRow': this.highlightedRow,
        'showBoth': this.showBoth,
        'showSMD':this.showSMD,
        'showTHT': this.showTHT,
        'showTop': this.showTop,
        'showBot': this.showBot,
        'pageNr': this.pageNr
    };
    this.db_con.update_document(this.formID, item);
    console.log(this.formID);
  }

}
