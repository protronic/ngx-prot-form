import { DialogComponent } from '../dialog/dialog.component';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {Component, OnInit, ViewChild, HostListener, Output, EventEmitter, Renderer2} from '@angular/core';
import {PdfViewerComponent, PDFDocumentProxy, PDFProgressData} from 'ng2-pdf-viewer';
import {PDFTreeNode} from 'pdfjs-dist';
import { HttpClient } from '@angular/common/http';
import {MatDialog, MatDialogConfig} from '@angular/material';
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

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.css']
})
export class PdfComponent implements OnInit {
  article: string;
  articleName: string;
  database: string = 'http://prot-subuntu:5985/pdfattachments/';
  ressourcenSrc: string;
  pdfSrc: string;
  jsonSrc = this.database + this.article;
  fertigungSrc = './assets/Fertigungsauftrag.json';
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
  columnsToDisplay = ['position', 'designator', 'artikelnummer', 'matchcode'];

  bonus_info: Array<any> = [];
  fertigung: String[];
  attachments: String[];
  hasComps = false;
  comps: String[] = [];
  n: number;
  selectMultiple = false;
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
  highlightedRow: number = 0;
  hasRows = false;
  rows: NodeListOf<Element>;

  databaseTracking = 'http://prot-subuntu:5985/ausgefuellte_formulare/';
  bestueckung = false;
  reparatur = false;
  platine: string = '';
  comment: string = '';
  changedComps: OutlineItem[] = [];
  loginstatus: string;
  username: string;

//  @ViewChild(PdfViewerComponent) private pdfComponent: PdfViewerComponent;
  @HostListener('dblclick') onMouseOver() {
    let change = false;
    if (!this.selectMultiple) {
      this.clearAll();
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
        if (designators.includes(selectedText + ', ') || designators.includes(', ' + selectedText) || designators === selectedText) {
          console.log(selectedText + ' found at row ' + i.toString());
          if (this.showBoth) {
             this.dialog.open(DialogComponent, {height: '45%',
                                                width: '30%',
                                                'data': [selectedText, this.article, this.database, this.bonus_info.filter(entry => (entry['bezeichnung'] === selectedText && entry['Artikel'] === this.article))]});
          }
          selectedText = selectedText.split(' ')[0];
          for (let j = 0; j < this.dataSource.length; j++) {
            if (selectedText === this.dataSource[j]['des']) {
              this.highlightedRow = parseInt(this.dataSource[j]['pos']);
            }
          }
          this.selectMultiple = true;
          for (let j = 0; j < this.dataSource.length; j++) {
            const position: string = this.dataSource[j]['pos'];
            if (position === this.highlightedRow.toString()) {
              this.highlight(this.dataSource[j]['des'] + ' ');
              this.rows[j].parentElement.scrollTop = this.rows[j].getBoundingClientRect().height * (j - 5);
            }
          }
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
     } else if (selectedText.substr(0, 2) === 'CO') {
          selectedText = selectedText.substr(2);
          selectedText = selectedText.split(' ')[0];
//          console.log(selectedText);
          for (let i = 0; i < this.jsonFile.length; i++) {
            const designators: string = this.jsonFile[i]['Designator'];
            if (designators.includes(selectedText + ', ') || designators.includes(', ' + selectedText) || designators === selectedText) {
//              console.log(selectedText + ' found at row ' + i.toString());
              if (this.showBoth) {
                this.dialog.open(DialogComponent, {height: '45%',
                                                   width: '30%',
                                                   'data': [selectedText, this.article, this.database, this.bonus_info.filter(entry => (entry['bezeichnung'] === selectedText))]});
              }
              selectedText = selectedText.split(' ')[0];
              for (let j = 0; j < this.dataSource.length; j++) {
                if (selectedText === this.dataSource[j]['des']) {
                  this.highlightedRow = parseInt(this.dataSource[j]['pos']);
                }
              }
              this.selectMultiple = true;
              for (let j = 0; j < this.dataSource.length; j++) {
                const position: string = this.dataSource[j]['pos'];
                if (position === this.highlightedRow.toString()) {
                  this.highlight(this.dataSource[j]['des'] + ' ');
                  this.rows[j].parentElement.scrollTop = this.rows[j].getBoundingClientRect().height * (j - 5);
                }
              }
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
    if (event.key === 'Enter') {
      this.enter();
    }
  }


  constructor(private renderer: Renderer2, private httpService: HttpClient, private dialog: MatDialog, private route: ActivatedRoute, private db_con: DatabaseConnectionService) {
  }

  ngOnInit() {
    let n = 0;
    this.route.queryParams
        .subscribe(params => {
          this.article = params.artikelnummer;
          this.loginstatus = params.loginstatus;
          this.username = params.username;
          this.ressourcenSrc = 'immer gültig';
          n++;
          if (this.article !== undefined ) {
            this.showBoth = true;
            this.showSMD = false;
            this.showTHT = false;
            this.reparatur = true;
            this.bestueckung = false;
            
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
                console.log(this.bonus_info)
              })

            this.db_con.get_pdf_src(this.article)
              .then(pdfSrc => {
                this.pdfSrc = pdfSrc;
                this.showPDF = true;
              })
          } else if (this.article === undefined) {
            // this.showBoth = false;
            // this.bestueckung = true;
            // this.reparatur = false;
            // this.fertigung = [];
            // this.httpService.get(this.ressourcenSrc)
            //   .subscribe(data => {
            //     for (let i = 0; i < data['rows'].length; i++) {
            //       this.fertigung.push(data['rows'][i]['value']);
            //     }
            //     console.log('fertigung2' + this.fertigung)
            //     this.article = this.fertigung[0]['Artikelnummer'];
            //     this.httpService.post(this.database + '/_find', {
            //       'selector': {
            //           '$or': [
            //             {
            //                 '1': this.article
            //             },
            //             {
            //                 '2': this.article
            //             }
            //           ]
            //       }
            //     }).subscribe(data2 => {
            //       if (this.article === data2['docs'][0]['1']) {
            //         this.showSMD = true;
            //         this.showTHT = false;
            //       } else if (this.article === data2['docs'][0]['2']) {
            //         this.showSMD = false;
            //         this.showTHT = true;
            //       }
            //       this.article = data2['docs'][0]['_id'];
            //       this.jsonSrc = this.database + this.article;
            //       this.pdfSrc = this.database + this.article + '/pdf';
            //       this.httpService.get(this.jsonSrc)
            //         .subscribe(data3 => {
            //           this.json = data3;
            //           this.jsonFile = this.json['Array'];
            //           this.attachments = [];
            //           const attach = this.json['_attachments'];
            //           if (attach.length === undefined) {
            //             this.attachments.push(Object.keys(attach)[0]);
            //           } else {
            //             for (let i = 0; i < attach.length; i++) {
            //               this.attachments.push(Object.keys(attach[i])[0]);
            //             }
            //           }
            //           this.showPDF = true;
            //         },
            //         (err: HttpErrorResponse) => {
            //           console.log (err.message);
            //       });
            //     });
            // });
          }
        });
    
    
   
    
    
  }

  /**
 * Get pdf information after it's loaded
 * @param pdf
 */
  afterLoadComplete(pdf: PDFDocumentProxy) {
    this.pdf = pdf;
    this.isLoaded = true;
    this.loadOutline();
    this.totalPages = pdf.numPages;
//    this.delay(20000);
  }

  pageRendered(e: CustomEvent) {
    new Promise(resolve => setTimeout(() => resolve(), 1000))
      .then(() => {
          this.changeData();
        })
      .catch((err) => console.error('p2', err));
  }

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
        console.log(outline[0])
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
                      if (platine === '1.0') {
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
                      } else if (platine === '2.0') {
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
        this.renderer.setStyle(document.querySelector('.textLayer').querySelectorAll('div')[n], 'background-color', '#5300e8');
        this.renderer.setStyle(document.querySelector('.textLayer').querySelectorAll('div')[n], 'height', '3vh');
        this.renderer.setStyle(document.querySelector('.textLayer').querySelectorAll('div')[n], 'width', '5vh');
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

  getComps() {
    this.comps = [];
    this.n = 0;

    const textLayer: NodeListOf<Element> = document.querySelectorAll('.textLayer');
//      console.log('textLayer');
    const divs: NodeListOf<Element> = textLayer[0].querySelectorAll('div');
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

  clearAll() {
    for (let i = 0; i < document.querySelector('.textLayer').querySelectorAll('div').length; i++) {
      this.renderer.removeStyle(document.querySelector('.textLayer').querySelectorAll('div')[i], 'background-color');
    }
  }

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
    this.dataSource.sort(function(a, b) {return parseInt(a['pos'], 10) - parseInt(b['pos'], 10); });
  }

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

  prev(reset: boolean) {
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
      this.highlightedRow = 0;
    }
  }

  next(reset: boolean) {
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
      this.highlightedRow = 0;
    }
  }

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
        this.selectMultiple = true;
        for (let i = 0; i < this.dataSource.length; i++) {
          const position: string = this.dataSource[i]['pos'];
          if (position === this.highlightedRow.toString()) {
            this.highlight(this.dataSource[i]['des'] + ' ');
          }
        }
        this.selectMultiple = false;
      })
      .catch(err => console.error('p3', err));
  }

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
        this.selectMultiple = true;
        for (let i = 0; i < this.dataSource.length; i++) {
          const position: string = this.dataSource[i]['pos'];
          if (position === this.highlightedRow.toString()) {
            this.highlight(this.dataSource[i]['des'] + ' ');
          }
        }
        this.selectMultiple = false;
      })
      .catch(err => console.error('p4', err));
  }

  changeBest() {
    this.bestueckung = !this.bestueckung;
    if (this.bestueckung && this.reparatur) {
      this.reparatur = false;
    }
  }

  changeRep() {
    this.reparatur = !this.reparatur;
    if (this.bestueckung && this.reparatur) {
      this.bestueckung = false;
    }
  }

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

  rowClicked(pos: number, des: string) {
    if (!this.hasComps) {
      this.getComps();
    }
    let change: boolean = false;
    if (!this.selectMultiple) {
      this.clearAll();
      change = true;
    }
    this.highlightedRow = pos;
    this.selectMultiple = true;
    for (let i = 0; i < this.dataSource.length; i++) {
      const position: string = this.dataSource[i]['pos'];
      if (position === this.highlightedRow.toString()) {
        this.highlight(this.dataSource[i]['des'] + ' ');
      }
    }
    if (change) {
      this.selectMultiple = false;
    }
  }

  showAttach(id: string) {
    const url = this.database + this.article + '/' + id;
    window.open(url, '_blank');
  }

  enter() {
    this.highlightedRow++;

      // switch page if necessary
    if (!this.showBoth) {
      for (let i = 0; i < this.fertigung.length; i++) {
        if (this.fertigung[i]['Pos'] === this.highlightedRow.toString()) {
          for (let j = 0; j < this.jsonFile.length; j++) {
            if (this.jsonFile[j]['Comment'] === this.fertigung[i]['RessourceNummer']) {
              if (this.showBot && this.jsonFile[j]['Side'] === 'TopLayer') {
                this.prev(false);
              } else if (this.showTop && this.jsonFile[j]['Side'] === 'BottomLayer') {
                this.next(false);
              }
            }
          }
        }
      }
    }

    new Promise(resolve => setTimeout(() => resolve(), 750))
      .then(() => {
        this.rows = document.querySelectorAll('.mat-row');
        for (let i = 0; i < this.rows.length; i++) {
  //      console.log(this.rows[i].querySelector('.mat-cell').innerHTML);
          const position = this.dataSource[i]['pos'];
          if (position === this.highlightedRow.toString()) {
  //        this.rows[i].scrollIntoView({ behavior: 'smooth', block: 'end' });
            this.rows[i].parentElement.scrollTop = (i - 3) * this.rows[i].getBoundingClientRect().height;
          } else if (position === (this.highlightedRow + 1).toString()) {
            break;
          }
        }

        if (!this.hasComps) {
          this.getComps();
        }
        this.clearAll();
        this.selectMultiple = true;
        for (let i = 0; i < this.dataSource.length; i++) {
          const position: string = this.dataSource[i]['pos'];
          if (position === this.highlightedRow.toString()) {
            this.highlight(this.dataSource[i]['des'] + ' ');
          }
        }
        this.selectMultiple = false;
      })
      .catch((err) => (console.error('p1', err)));
  }

}
