import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { HttpClientModule } from '@angular/common/http';
import {MatDialogModule} from '@angular/material';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {MatGridListModule} from '@angular/material/grid-list';
import {RouterModule, Routes} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatSortModule} from '@angular/material/sort';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { PdfComponent } from './pdf/pdf.component';
import { DialogComponent } from './dialog/dialog.component';

const appRoutes: Routes = [{

 path: '**',

 component: PdfComponent

}];

@NgModule({
  declarations: [
    AppComponent,
    PdfComponent,
    DialogComponent,
  ],
  imports: [
    BrowserModule,
    PdfViewerModule,
    HttpClientModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatGridListModule,
    MatTableModule,
    MatInputModule,
    MatMenuModule,
    MatIconModule,
    MatSortModule,
    FormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [DialogComponent]
})
export class AppModule { }
