import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { startWith } from 'rxjs/operators';
import { filter } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
import { distinctUntilChanged } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';
import { of as observableOf } from 'rxjs';

@Component({
  selector: 'formly-field-typeahead',
  template: `
    <label *ngIf="to.label">{{ to.label }}</label>
    <ng-select [items]="options$ | async"
      [placeholder]="to.placeholder"
      [typeahead]="search$"
      [formControl]="formControl">
    </ng-select> 
  `,
  styleUrls: [
    '../../../../../node_modules/@angular/material/prebuilt-themes/deeppurple-amber.css',
    '../../../../../node_modules/@ng-select/ng-select/themes/default.theme.css'
  ]
})
export class FormlyFieldTypeahead extends FieldType implements OnDestroy {
  onDestroy$ = new Subject<void>();
  search$ = new EventEmitter();
  options$;

  values: string[] = [];

  ngOnInit() {
    console.log(this);
    this.options$ = this.search$.pipe(
      takeUntil(this.onDestroy$),
      startWith(''),
      filter(v => v !== null),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((term: string) => {
        if ((!term || term === '')) {
          return observableOf(this.values);
        }

        return observableOf(this.values.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10));
      }),
    );
    
    this.options$.subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.complete();
  }
}