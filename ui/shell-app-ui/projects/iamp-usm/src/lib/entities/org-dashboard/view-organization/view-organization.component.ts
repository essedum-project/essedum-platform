import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';
import { DashConstant } from '../../../models/dash-constant';
import { UsmModules } from '../../../models/module';
import { ModuleOrganization } from '../../../models/ModuleOrganization';
import { OrgProject } from '../../../models/OrgProject';
import { Role } from '../../../models/role';
import { ApisService } from '../../../services/apis.service';
import { MessageService } from '../../../services/message.service';
import { ModuleOrganisationService } from '../../../services/module-organisation.service';
import { ModulesService } from '../../../services/modules.service';
import { OrganisationService } from '../../../services/organisation.service';
import { RoleConfigurationService } from '../../../services/role-configuration.service';
import { UserConfigurationService } from '../../../services/user-configuration.service';
@Component({
  selector: 'app-view-organization',
  templateUrl: './view-organization.component.html',
  styleUrls: ['./view-organization.component.css']
})
export class ViewOrganizationComponent implements OnInit {

  @Input() organization:any; 
  busy: Subscription;
  roleList: Role[];
  lazyloadevent = {
    first: 0,
    rows: 3000,
    sortField: null,
    sortOrder: 1,
    filters: null,
    multiSortMeta: null,
  };

  selectedOrganization:OrgProject
  selectedModuleOrganization:ModuleOrganization[]=[]
  newModuleOrganisation:ModuleOrganization=new ModuleOrganization()
  // moduleList:String[]=["CyberGaze","CyberCompass","CyberHunt","CyberWatch","CyberScan","CyberAnalytics"]
  moduleList:UsmModules[]=[]
  filteredModuleList:any[]=[]
  minDate: Date;
  isEdit=false;
  anyModuleUpdated: any;
  cybergazeStatus: string;
  cyberscanStatus: string;
  cyberwatchStatus: string;
  cyberhuntStatus: string;
  cybercompassStatus: string;
  cyberanalytics: string;
  cyberanalyticsStatss: string;
  moduleObjectArray: UsmModules[]=[];
  roleModuleList: any=[];
  progressDate:any 
  progressValue: number;
  color:any
  totalDays: number;
  newRoleModule:DashConstant=new DashConstant()
  landingPage: any="";
  existingLandingPageList: any[]=[];
  existingRoleList: any[]=[];
  constructor(private userService:UserConfigurationService,
    private messageService: MessageService,
    private roleService:RoleConfigurationService,
    private organisationService:OrganisationService,
    private moduleOrganizationService:ModuleOrganisationService,
    private datePipe:DatePipe,
    private moduleService:ModulesService,
    private apisService:ApisService
    ) { }

  ngOnInit() {
    this.selectedOrganization=this.organization
    this.minDate=new Date()
    // this.fetchAllModuleOrganization()
    // this.fetchModuleArray();
    // this.getModules()
    // this.computeProgress()
    this.getCurrentOrg()
    
  }
  
  getRoleListForOrg(org){
    let role=new Role()
    role.projectId=org.id
    
    this.roleService.findAll(role,this.lazyloadevent).subscribe(res=>{

      this.roleList=res.content
    })
  }
  getCurrentOrg(){
    let example=new OrgProject()
    example.id=this.organization.id
    this.organisationService.findAll(example,this.lazyloadevent).subscribe(res=>{
      this.selectedOrganization=this.organization
      this.getRoleListForOrg(this.selectedOrganization);
      this.getLandingPage()
    })
  }

  saveLandingPage(newRoleModule:DashConstant){
    let value=this.landingPage

    newRoleModule.project_id=this.selectedOrganization
    newRoleModule.project_name=this.selectedOrganization.name
 

    if(this.checkDuplicate(newRoleModule.keys)){
    this.apisService.createDashConstant(newRoleModule).subscribe(res=>{

      this.newRoleModule=new DashConstant()
      
      this.landingPage=""
      this.messageService.info("Landing Page Added","Cyber Central");
      this.getLandingPage()
    }, error => this.messageService.error(error,"Cyber Central"))
    }
    else{
    this.messageService.error("Duplicates not allowed","Cyber Central")
    }
      
    
  }

  checkDuplicate(role){
    if(this.existingRoleList.includes(role)){
      return false
    }
    else{
      return true
    }
  }
  deleteLandingPage(dashconst){
    this.apisService.deleteDashConstants(dashconst.id).subscribe(res=>{
      this.messageService.info("Removed dashboard","Cyber Central")
      this.getLandingPage()
    })
  }


  computeProgress(){
    let org= this.selectedOrganization
    org['ModulesOrg'].forEach((element,i) => {
     this.progressValue=0
     this.totalDays=0
     this.progressDate=0
 
      let enddate=new Date(element.enddate)
      let startdate=new Date(element.startdate)
     this.totalDays= Math.floor((Date.UTC(enddate.getFullYear(), enddate.getMonth(),enddate.getDate()) - Date.UTC(this.minDate.getFullYear(), this.minDate.getMonth(), this.minDate.getDate()) ) /(1000 * 60 * 60 * 24))
     this.progressDate = Math.floor((Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate()) - Date.UTC(startdate.getFullYear(),startdate.getMonth(), startdate.getDate()) ) /(1000 * 60 * 60 * 24));
   
    
     if(enddate>this.minDate){
       if(this.progressDate>=this.totalDays){
        this.progressValue=((this.progressDate-this.totalDays)/this.progressDate)*100
        
        if(this.progressValue>=90){
          this.color="accent"
        }
       }
       else{
         this.progressValue=100
       }
    
     
      
    }
    else{
      this.progressValue=100
      this.color="accent"
    }

    if( startdate>this.minDate){
      this.progressValue=0
      this.color=""
    }
     this.selectedOrganization['ModulesOrg'][i].color=this.color
     this.selectedOrganization['ModulesOrg'][i].progressValue=this.progressValue
     this.selectedOrganization['ModulesOrg'][i].totalDays=this.totalDays
    });

    console.log( this.selectedOrganization);
    
  }
  getModules(){
    
     this.apisService.getDashConstsForProject(this.selectedOrganization).subscribe((res) => {
       let project;
       try {
        project = this.selectedOrganization
       } catch (e) {
        console.error("JSON.parse error - ", e.message);
       }
      
      res.forEach(item=>{
       let roleModule:{"id":"","role":"","module":"","navigateTo":""}={"id":"","role":"","module":"","navigateTo":""};
       let sidebarValue=JSON.parse(item.value).label
       let navigateTo=JSON.parse(item.value).url
       roleModule.id=item.id
         roleModule.role=item.keys.split(' ')[0]
         
         roleModule.module=sidebarValue
         roleModule.navigateTo=navigateTo
         this.roleModuleList.push(roleModule)
         
        }
        
      )
     }
     )
    
  
     
   }
   getLandingPage(){
    this.existingLandingPageList=[]
    this.existingRoleList=[]
    this.apisService.getDashConstsForProject(this.selectedOrganization).subscribe((res) => {
      let project;
      try {
       project = this.selectedOrganization
      } catch (e) {
       console.error("JSON.parse error - ", e.message);
      }
     
      this.existingLandingPageList = res.filter(
        (item) =>
          item.project_id.id == project.id &&
          item.project_name == project.name &&
          item.keys.includes(" Land")
      );
        console.log(this.roleList);
        
      // this.getRoleListForOrg(this.selectedModuleOrganization)
        console.log(this.existingLandingPageList);
        
      let existingRoleList=[]
      this.existingLandingPageList.forEach(res=>{
        this.existingRoleList.push(res.keys)
      })
      console.log(existingRoleList);
      this.roleList.filter(item=>{
        return !(existingRoleList.includes(item.name+" Land"))
      })
      
    }
    )
   
    

    
 
    
  }

  fetchModuleArray(){
    
    this.moduleService.findAll(new UsmModules,this.lazyloadevent).subscribe(res=>{
      this.moduleObjectArray=res.content
  
    this.moduleObjectArray.forEach(ele=>{
      this.moduleList.push(ele)
    })
      
    } , error => this.messageService.error(error,"Error in fetchinng modules"))

   
  }
  save(moduleOrganization:ModuleOrganization){
    // moduleOrganization.startdate=new Date()
    moduleOrganization.organisation=this.selectedOrganization
    moduleOrganization.enddate= this.datePipe.transform(moduleOrganization.enddate, 'yyyy-MM-dd');
    moduleOrganization.startdate= this.datePipe.transform(moduleOrganization.startdate, 'yyyy-MM-dd');
    moduleOrganization.subscriptionstatus=true
   console.log(moduleOrganization.startdate);
   console.log();
   
   
    console.log(moduleOrganization);
    
    this.moduleOrganizationService.create(moduleOrganization).subscribe(res=>{
      this.messageService.info("Module added successfully","Cybernext")
      this.newModuleOrganisation=new ModuleOrganization()
      this.fetchAllModuleOrganization()

    },error=>this.messageService.error(error,"Cybernext"))
    
  }
  fetchAllModuleOrganization(){

    let example:ModuleOrganization=new ModuleOrganization()
    example.organisation=this.selectedOrganization
    example.organisation.logo=null
    this.moduleOrganizationService.findAll(example,this.lazyloadevent).subscribe(res=>{
      // this.selectedModuleOrganization=res.content
      this.selectedModuleOrganization= this.filterModuleList(res.content);
    },error=>this.messageService.error(error,"Cybernext"))
    
    
  }

  
  
  filterModuleList(selectedModuleOrganization:ModuleOrganization[]){
    this.filteredModuleList=this.moduleObjectArray
  
    
    selectedModuleOrganization.forEach( (ele,index)=>{
      this.setStatus(ele)
      if(ele.enddate<this.minDate){
        selectedModuleOrganization[index].subscriptionstatus=false
      }
      else{
        selectedModuleOrganization[index].subscriptionstatus=true
      }
   
      this.moduleObjectArray.forEach((module,index)=>{
        if(module.name==ele.module.name){
          this.filteredModuleList.splice(index,1)
        }
      })
      // this.filteredModuleList=this.moduleObjectArray.filter(module=>{
      //   return module.name!=ele.module.name
      // })
      
      if(this.filteredModuleList.indexOf(ele.module)>-1)
        this.filteredModuleList.splice(this.filteredModuleList.indexOf(ele.module),1)
    })

    return selectedModuleOrganization;
  }

  delete(index){
    this.moduleOrganizationService.delete(index).subscribe(res=>{
      this.fetchAllModuleOrganization()
      this.resetStatus()
      this.messageService.info("Module deleted successfully","Cybernext")
      
      
      this.selectedModuleOrganization=this.filterModuleList(this.selectedModuleOrganization)
    },error=>this.messageService.error(error,"Cybernext"))
  }


  update(moduleOrganisation){
    this.moduleOrganizationService.update(moduleOrganisation).subscribe(res=>{
      this.messageService.info("Module updated successfully","Cybernext")
      this.fetchAllModuleOrganization()
      this.anyModuleUpdated=true
      this.isEdit=false
    },error=>this.messageService.error(error,"Cybernext"))
  }

  
  showEdit(moduleOrganisation){
    if(!this.isEdit){
      this.isEdit=true
     this.newModuleOrganisation=moduleOrganisation
      // this.fetchOrganisations()
      
      // this.fetchUserMappings(user)
    }
    else{
      this.isEdit=false
      this.newModuleOrganisation=new ModuleOrganization()
    }
  }
  cancelEdit(){
    if(!this.isEdit)
      this.isEdit=true
    else{
      this.isEdit=false
      this.newModuleOrganisation=new ModuleOrganization()
      
    }
    
    if(this.anyModuleUpdated){
     this.fetchAllModuleOrganization()
    }
    this.anyModuleUpdated=false

  }
  setStatus(moduleOrganisation:ModuleOrganization){
    if(moduleOrganisation.module.name=="Cyber Gaze" && moduleOrganisation.enddate<this.minDate){
      this.cybergazeStatus="Expired"

    }
    else if(moduleOrganisation.module.name=="Cyber Gaze" && moduleOrganisation.enddate>=this.minDate){
      this.cybergazeStatus="Active"
    }
    
    if(moduleOrganisation.module.name=="Cyber Compass" && moduleOrganisation.enddate<this.minDate){
      this.cybercompassStatus="Expired"
    }
    else if(moduleOrganisation.module.name=="Cyber Compass" && moduleOrganisation.enddate>=this.minDate){
      this.cybercompassStatus="Active"
    }

    if(moduleOrganisation.module.name=="Cyber Hunt" && moduleOrganisation.enddate<this.minDate){
      this.cyberhuntStatus="Expired"
    }
    else if(moduleOrganisation.module.name=="Cyber Hunt" && moduleOrganisation.enddate>=this.minDate){
      this.cyberhuntStatus="Active"
    }

    if(moduleOrganisation.module.name=="Cyber Watch" && moduleOrganisation.enddate<this.minDate){
      this.cyberwatchStatus="Expired"
    }
    else if(moduleOrganisation.module.name=="Cyber Watch" && moduleOrganisation.enddate>=this.minDate){
      this.cyberwatchStatus="Active"
    }

    if(moduleOrganisation.module.name=="Cyber Scan" && moduleOrganisation.enddate<this.minDate){
      this.cyberscanStatus="Expired"
    }
    else if(moduleOrganisation.module.name=="Cyber Scan" && moduleOrganisation.enddate>=this.minDate){
      this.cyberscanStatus="Active"
    }
    if(moduleOrganisation.module.name=="Cyber Analytics" && moduleOrganisation.enddate<this.minDate){
      this.cyberanalyticsStatss="Expired"
    }
    else if(moduleOrganisation.module.name=="Cyber Analytics" && moduleOrganisation.enddate>=this.minDate){
      this.cyberanalyticsStatss="Active"
    }


  }

  resetStatus(){
    this.cyberscanStatus=undefined
    this.cyberhuntStatus=undefined
    this.cyberwatchStatus=undefined
    this.cybercompassStatus=undefined
    this.cybergazeStatus=undefined
    this.cyberanalyticsStatss=undefined
  }
  
}
