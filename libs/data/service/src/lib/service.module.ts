import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';

import { CommonModule } from '@angular/common';

import { SqlWrapperServiceConfig } from './service/sql.wrapper.service'

// import { SqlWrapperService } from './service/sql.wrapper.service';
// import { DatabaseInteractionService } from './service/database.interaction.service';


@NgModule({
  imports:      [ CommonModule ],
  declarations: [  ],
  exports:      [  ]
})
export class ServiceModule {
  constructor (@Optional() @SkipSelf() parentModule: ServiceModule) {
    if (parentModule) {
      throw new Error(
        'ServiceModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(sqlWrapperConfig: SqlWrapperServiceConfig): ModuleWithProviders {
    return {
      ngModule: ServiceModule,
      providers: [
        { provide: SqlWrapperServiceConfig, useValue: sqlWrapperConfig }
      ]
    };
  }
}


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/