import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import {Inject, INJECTOR, Injectable} from '@angular/core';

import { RouterTestingModule } from '@angular/router/testing'
import { ManageUsersComponent } from './manage-users.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MessageService as Messagser } from '../../services/message.service';
import { MessageService } from '../../services/message.service';
import { MessageService  as message1} from '../../shared-modules/services/message.service';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Subscription } from "rxjs";
import { Msg } from "../../shared-modules/services/msg";
import { OrgUnitService } from "../../services/org-unit.service";
import { UserUnitService } from "../../services/user-unit.service";
import { ConfirmDeleteDialogComponent } from "../../support/confirm-delete-dialog.component";
import { OrgUnit } from "../../models/org-unit";
import { Project } from "../../models/project";
import { UserUnit } from "../../models/user-unit";
import { Users } from "../../models/users";
import { UsersService } from "../../services/users.service";
import { ProjectService } from "../../services/project.service";
import { UserProjectRoleService } from "../../services/user-project-role.service";
import { RoleService } from "../../services/role.service";
import { Role } from "../../models/role";
import { UserProjectRole } from "../../models/user-project-role";
import { PageResponse } from "../../support/paging";
import { ActivatedRoute, Router } from "@angular/router";
import {AuthService} from  '../../services/auth.service'
import {APP_BASE_HREF} from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Organisation } from '../../models/organisation';
// import iamp from '../../services/user-unit.service';

describe('ManageUsersComponent', () => {
  let component: ManageUsersComponent;
  let fixture: ComponentFixture<ManageUsersComponent>;
  let unitService:OrgUnitService
  let usersService:UsersService
  let userProjectRoleService:UserProjectRoleService
  let userUnitService:UserUnitService
  let roleService:RoleService
  let user_login;
  let user_id;
  let temp;
  let temp1;
  let user1;
  let temp4;
  let lazyloadevent = {
    first: 0,
    rows: 1000,
    sortField: null,
    sortOrder: 1,
    filters: null,
    multiSortMeta: null
  };
  sessionStorage.setItem('baseUrl','http://10.217.10.236:8982')
  sessionStorage.setItem('dashboard','http://10.217.10.236:8982')
  sessionStorage.setItem('authUrl','http://10.217.10.236:4208')
  sessionStorage.setItem('project','{"id":1,"name":"Acme","description":"ACME","lastUpdated":null}')
  sessionStorage.setItem('iamp','http://10.217.10.236:8982')

  beforeEach(async(() => {
    
    TestBed.configureTestingModule({
      declarations: [ ManageUsersComponent,ConfirmDeleteDialogComponent ],
      imports: [    
        RouterTestingModule,NgxPaginationModule,FormsModule,ReactiveFormsModule,MatTableModule,MatSortModule,MatPaginatorModule,MatSnackBarModule,MatDialogModule,BrowserAnimationsModule
      ],
      providers: [RoleService,UserProjectRoleService,UsersService,ProjectService,RoleService,MessageService,UserUnitService,OrgUnitService,message1,AuthService,Messagser,
        { provide: 'amsworkbench', useValue: JSON.parse(JSON.stringify(sessionStorage.getItem('baseUrl'))) },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
            {provide: APP_BASE_HREF, useValue: '/'},
            {provide: 'iamp',useValue:'http://10.217.10.236:8982'},   
            
    ],
    schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  })); 

  beforeEach(() => {
    unitService = TestBed.get(OrgUnitService)
    usersService = TestBed.get(UsersService)
    userUnitService= TestBed.get(UserUnitService)
    userProjectRoleService=TestBed.get(UserProjectRoleService)
    roleService=TestBed.get(RoleService)
    fixture = TestBed.createComponent(ManageUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('findAll of OrgUnitService should return a response',(done)=>{
    unitService.findAll(new OrgUnit(),lazyloadevent).subscribe(res=>{
      expect(res).toBeTruthy()
      temp=res.content[0].id
      done();
    })})

  it('getOrgUnit of OrgUnitService should return a response',(done)=>{
      unitService.getOrgUnit(temp).subscribe(res=>{
      expect(res).toBeTruthy()
      done();
    })
    
  })
  it('create of OrgUnitService should return a response',(done)=>{
    let content:OrgUnit=new OrgUnit({
        "name":"AAAAA",
        "organisation":new Organisation({
          "id":1
        })
      })
      unitService.create(content).subscribe(res=>{
      expect(res).toBeTruthy()
      temp=res.id
      done();
    })
    
  })
    it('update of OrgUnitService should return a response',(done)=>{
    let content:OrgUnit=new OrgUnit({
        "name":"BBBB",
        "id":temp,
        "organisation":new Organisation({
          "id":1
        })
      })
      unitService.update(content).subscribe(res=>{
      expect(res).toBeTruthy()
      temp=res.id
      done();
    })
    
  })
  it('findAll of userUnitService should return a response',(done)=>{
    userUnitService.findAll(new UserUnit(),lazyloadevent).subscribe(res=>{
      expect(res).toBeTruthy()
      // temp4=res.content[0].id
      done();
    })
  })
  // it('getUserUnit of userUnitService should return a response',(done)=>{
  //   userUnitService.getUserUnit(1).subscribe(res=>{
  //     expect(res).toBeTruthy()
  //     done();
  //   })
  // })
  
  it('create of userUnitService should return a response',(done)=>{
    // let userUnit = new UserUnit()
    // let unit = new OrgUnit();
    // userUnit.unit = unit;
    // userUnit.user = user1;
    let content:UserUnit=new UserUnit({
      "unit":new OrgUnit({
        "id":temp,
      })
    })
    userUnitService.create(content).subscribe(res=>{
      expect(res).toBeTruthy()
      temp1=res.id
      done();
    })
    
  })
  it('update of userUnitService should return a response',(done)=>{
    let content:UserUnit=new UserUnit({
      "id":temp1,
      "unit":new OrgUnit({
        "id":temp,
      })
    })
    userUnitService.update(content).subscribe(res=>{
      expect(res).toBeTruthy()
      temp1=res.id
      done();
    })
    
  })
      it('delete of userUnitService should return a response',(done)=>{
        userUnitService.delete(temp1).subscribe(res=>{
      expect(res).toBeTruthy()
      done();
    })
    
  })
    
  it('delete of OrgUnitService should return a response',(done)=>{
    unitService.delete(temp).subscribe(res=>{
    expect(res).toBeTruthy()
    done();
  })
  
})
  
  // it('findAll of UsersService should return a response',(done)=>{
  //   usersService.findAll(new Users(),lazyloadevent).subscribe(res=>{
  //     expect(res).toBeTruthy()
  //     user1=res.content[0]
  //     user_id=res.content[0].id
  //     user_login=res.content[0].user_login
  //     done();
  //   })
    
  // })
  it('findAll of userProjectRoleService should return a response',(done)=>{
    userProjectRoleService.findAll(new UserProjectRole(),lazyloadevent).subscribe(res=>{
      expect(res).toBeTruthy()
      done();
    })
    
  })
  it('update of UsersService should return a response',(done)=>{
    usersService.update(new Users()).subscribe(res=>{
      expect(res).toBeTruthy()
      done();
    })
    
  })
  // it('fetchEmployees of UsersService should return a response',(done)=>{
  //   usersService.fetchEmployees(user_login).subscribe(res=>{
  //     expect(res).toBeTruthy()
  //     done();
  //   })
    
  // })
  it('create of UsersService should return a response',(done)=>{
    usersService.create(new Users()).subscribe(res=>{
      expect(res).toBeTruthy()
      done();
    })
    
  })
  
  it('findAll of roleService should return a response',(done)=>{
    roleService.findAll(new Role(),lazyloadevent).subscribe(res=>{
      expect(res).toBeTruthy()
      done();
    })
    
  })
  it('create of userProjectRoleService should return a response',(done)=>{
    let userAuthority = new UserProjectRole()
    let authority = new Role()
    userAuthority.role_id = authority;
    userAuthority.user_id = user1;
    userProjectRoleService.create(userAuthority).subscribe(res=>{
      expect(res).toBeTruthy()
      done();
    })
    
  })

  
  
});
