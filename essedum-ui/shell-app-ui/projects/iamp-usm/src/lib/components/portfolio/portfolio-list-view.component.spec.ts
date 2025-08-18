import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterTestingModule } from '@angular/router/testing'
import {APP_BASE_HREF} from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { UsmPortfolio } from '../../models/portfolio';
import { UsmPortfolioService } from '../../services/portfolio.service';
import { UsmPortfolioListViewComponent } from './portfolio-list-view.component';



describe('UsmPortfolioListViewComponent', () => {
  let component: UsmPortfolioListViewComponent;
  let fixture: ComponentFixture<UsmPortfolioListViewComponent>;
  let testId: number;
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsmPortfolioListViewComponent ],
      imports: [
        FormsModule, 
        ReactiveFormsModule, 
        NgxPaginationModule,
        MatTableModule,
        MatPaginatorModule,
        MatCardModule,
		
		
        MatTabsModule,
        BrowserAnimationsModule,
        RouterTestingModule.withRoutes([
            {path: 'usm-portfolio-list', component: UsmPortfolioListViewComponent },
            {path: 'usm-portfolio-list/create', component: UsmPortfolioListViewComponent },
            {path: 'usm-portfolio-list/:id/:view', component: UsmPortfolioListViewComponent }
        ])
      ],
      providers: [UsmPortfolioService,
          {provide: APP_BASE_HREF, useValue: '/'}
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));  

  it(`should retrieve usm-portfolio`, async(() => {
    fixture = TestBed.createComponent(UsmPortfolioListViewComponent);
    component = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    component.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: 1, filters: null, multiSortMeta: null });
  }));

  it(`should create usm-portfolio`, async(() => {
    fixture = TestBed.createComponent(UsmPortfolioListViewComponent);
    component = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    component.usmPortfolio= new UsmPortfolio({
				'portfolioName':'AAAAA',
				'description':'AAAAA',
				'last_updated':'null',
       
    });
    component.onSave();
    
  }));

  it(`should update usm-portfolio`, async(() => {
    fixture = TestBed.createComponent(UsmPortfolioListViewComponent);
    component = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    component.usmPortfolio= new UsmPortfolio({
				'id':testId,
				'portfolioName':'AABBAAA',
				'description':'AABBAAA',
				'last_updated':'null',
    });
    component.updateWave();
  }));

  it(`should delete usm-portfolio`, async(() => {
    fixture = TestBed.createComponent(UsmPortfolioListViewComponent);
    component = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    component.usmPortfolio = new UsmPortfolio({
				'id':testId
    });
    component.delete(component.usmPortfolio);
  }));

  afterEach(() => {
    testId = component.testId;
    expect(component.testCreate).toBeTruthy();
  });

});