import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { of } from 'rxjs';

import { PortfolioAddComponent } from './portfolio-add.component';
import { PortfolioService } from '../../../services/portfolio.service';
import { MessageService } from '../../../services/message.service';
import { Portfolio } from '../../../models/portfolio';

describe('PortfolioAddComponent', () => {
  let component: PortfolioAddComponent;
  let fixture: ComponentFixture<PortfolioAddComponent>;
  let usmPortfolioService: PortfolioService;
  let messageService: MessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        MatDialogModule
      ],
      declarations: [
        PortfolioAddComponent
      ],
      providers: [
        PortfolioService,
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioAddComponent);
    component = fixture.componentInstance;
    usmPortfolioService = TestBed.inject(PortfolioService);
    messageService = TestBed.inject(MessageService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with a new UsmPortfolio', () => {
    expect(component.usmPortfolio).toBeDefined();
    expect(component.usmPortfolio instanceof Portfolio).toBeTruthy();
  });

  it('should validate portfolio name', () => {
    // Empty portfolio name
    component.usmPortfolio.portfolioName = '';
    spyOn(messageService, 'info');
    component.onSave();
    expect(messageService.info).toHaveBeenCalledWith("Portfolio name can't be empty", "IAMP");

    // Portfolio name too long
    component.usmPortfolio.portfolioName = 'a'.repeat(101);
    component.onSave();
    expect(messageService.info).toHaveBeenCalledWith("Portfolio name cannot be more than 100 characters", "IAMP");
  });

  it('should call createPortfolio when in create mode', () => {
    component.edit = false;
    component.usmPortfolio.portfolioName = 'Test Portfolio';
    spyOn(component, 'createPortfolio');
    component.onSave();
    expect(component.createPortfolio).toHaveBeenCalled();
  });

  it('should call updatePortfolio when in edit mode', () => {
    component.edit = true;
    component.usmPortfolio.portfolioName = 'Test Portfolio';
    spyOn(component, 'updatePortfolio');
    component.onSave();
    expect(component.updatePortfolio).toHaveBeenCalled();
  });

  it('should clear portfolio data', () => {
    component.usmPortfolio.portfolioName = 'Test Portfolio';
    component.usmPortfolio.description = 'Test Description';
    component.showNameLengthErrorMessage = true;
    component.showDescLengthErrorMessage = true;
    
    component.clearWave();
    
    expect(component.usmPortfolio.portfolioName).toBeNull();
    expect(component.usmPortfolio.description).toBeNull();
    expect(component.showNameLengthErrorMessage).toBeFalse();
    expect(component.showDescLengthErrorMessage).toBeFalse();
  });
});
