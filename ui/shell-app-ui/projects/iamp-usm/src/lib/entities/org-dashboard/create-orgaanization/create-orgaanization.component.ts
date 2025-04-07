import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Audit } from '../../../models/audit';
import { DashConstant } from '../../../models/dash-constant';
import { UsmModules } from '../../../models/module';
import { ModuleOrganization } from '../../../models/ModuleOrganization';
import { OrgProject } from '../../../models/OrgProject';
import { Role } from '../../../models/role';
import { UsmPermissions } from '../../../models/usm-permissions';
import { UsmRolePermissions } from '../../../models/usm-role-permissions';
import { ApisService } from '../../../services/apis.service';
import { AuditService } from '../../../services/audit.service';
import { MessageService } from '../../../services/message.service';
import { ModuleOrganisationService } from '../../../services/module-organisation.service';
import { ModulesService } from '../../../services/modules.service';
import { OrganisationService } from '../../../services/organisation.service';
import { PermissionConfigurationService } from '../../../services/permission-configuration.service';
import { RoleConfigurationService } from '../../../services/role-configuration.service';


@Component({
  selector: 'app-create-orgaanization',
  templateUrl: './create-orgaanization.component.html',
  styleUrls: ['./create-orgaanization.component.css']
})
export class CreateOrgaanizationComponent implements OnInit {
  noOfDomains
  domainName:string
  propertyList=["QRadar","Demisto"]
  statusList=['Not Opted',"Subscribe","Evaluation"]
  noOfProperties:{"Property":string,"Authorization":string,"User":string,"URL":string,"APIKey":string}[]=[]
  tempProperty:{"Property":string,"Authorization":string,"User":string,"URL":string,"APIKey":string}={"Property":"","Authorization":"","User":"","URL":"","APIKey":""}
  busy:Subscription;
  currentOrganisation:any
  organizationsList:any;
  lazyloadevent = {
    first: 0,
    rows: 3000,
    sortField: null,
    sortOrder: 1,
    filters: null,
    multiSortMeta: null,
  };
  permissionsList:UsmPermissions[][]=[]
  isCreateOrg=false
  files: Array<FileUploadModel> = [];
  org:OrgProject=new OrgProject()
  isEdit: any;
  anyOrgUpdated: any;
  orgLogo:string;
  disableupload: boolean;
  alt_img: any;
  orgLogoName: string;
  filteredOrganisationList: any;
  orgSavedShowModule: boolean=false;
  savedOrganisation: OrgProject;
  newModuleOrganisation: ModuleOrganization=new ModuleOrganization();
  newModuleOrganisationList: ModuleOrganization[]=[]
  // filteredModuleList: string[] =["CyberGaze","CyberCompass","CyberHunt","CyberWatch","CyberScan","CyberAnalytics"]
  filteredModuleList: string[]=[]
  cybergazeStatus: string;
  cybercompassStatus: string;
  cyberhuntStatus: string;
  cyberwatchStatus: string;
  cyberscanStatus: string;
  cyberanalyticsStatss: string;
  lazyload = { first: 0, rows: 1000, sortField: null, sortOrder: null };
  minDate: Date;
  selectedModuleOrganization: ModuleOrganization[];
  modulesAddedShowRoles: boolean;
  enableModuleCancel: boolean;
  mom = moment;
  moduleOrganisations:ModuleOrganization[]=[]
  moduleListforOrg: ModuleOrganization[]=[];
  newRole: Role=new Role();
  roleList: Role[]=[];
  roleAddedShowModules: boolean;
  showAllModules:boolean
  selectedModule:String;
  selectedUrl:String;
  newRoleModule:DashConstant=new DashConstant()
  moduleAccessGiven: boolean;
  moduleList: any[];
  moduleObjectArray:UsmModules[]=[]
  noOfModule:{"Role":string,"module":string,"navigateTo":string,"permission":UsmPermissions}[]=[];
  noOfRoleModule:{"Role":Role,"module":UsmModules,"navigateTo":string,"permission":any[]}[][]=[];
  tempModuleList: any[]=[];
  orgFilter:any
  completePermissionsList: UsmPermissions[];
  savedDomains: any[]=["infosys.com"];
  selectedRole=""
  addRoleList: any=[];
  addedPermissionList: any=[];
  createdRole: any;
  roleModuleList: any=[];
  azureRoleList: any[]=[];
  tempDomain: string="";
  isDbLogin: boolean;
  noOfModules: ModuleOrganization[]=[];
  isDataSourceTested: boolean;
  cyberwatch:string
  dashboard:string
  ai:string
  orgNameToEdit: any;
  currentOrg: any;
  currentRole: any;
  currentRoleObject: any;
  currentUserObject: any;
  constructor(
    private apisService:ApisService,
    private messageService: MessageService,
    private organisationService:OrganisationService,
    private sanitizer: DomSanitizer,
    private moduleOrganizationService:ModuleOrganisationService,
    private datePipe:DatePipe,
    private roleService:RoleConfigurationService,
    private moduleService:ModulesService,
    private permissionService:PermissionConfigurationService,
    private auditService:AuditService,

  ) { }
  @Input() organizationList: any; 
  @Input() orgToEdit: any; 
  @Output() goBack= new EventEmitter<boolean>();
  ngOnInit() {
    this.currentRole=JSON.parse(sessionStorage.getItem('role')).name
    this.currentRoleObject=JSON.parse(sessionStorage.getItem('role'))
    this.currentUserObject=JSON.parse(sessionStorage.getItem('user'))
    this.currentOrg=JSON.parse(sessionStorage.getItem('project'))
    this.minDate=new Date()
    this.organizationsList=this.organizationList
    this.cyberwatch="../../../../assets/image/Icons_SVG/CyberWatch Logo.svg"
    this.dashboard="../../../../assets/image/Icons_SVG/Dashboard.svg"
    this.ai="../../../../assets/image/Icons_SVG/data_base_icon.png"
    
    if(!this.orgToEdit){
     
    }
    else{
     this.showEdit(this.orgToEdit)
    }
    this.fetchModuleArray()
    this.filteredOrganisationList=this.organizationList
    this.noOfModule.push({"Role":"","module":"","navigateTo":"","permission":new UsmPermissions})
    this.noOfRoleModule=[]
    this.fetchAzureRoles()
    // this.getModules()
    
    if(JSON.parse(sessionStorage.getItem('activeProfiles'))[1]=="dbjwt"){
   
      this.isDbLogin=true
    }else{
      this.isDbLogin=false
    
    }
  }
  addAuditEntry(auditMessage:string,ordName:string){
    let audit:Audit=new Audit()
    audit.isAuditSuccess=true
    audit.auditUser=this.currentUserObject.user_f_name
    audit.auditRole=this.currentRoleObject.name
    audit.auditTimestamp=new Date()
  
    
    audit.auditOrg=ordName
    audit.auditType="USM"
    audit.auditMessage=auditMessage

    this.auditService.createAudit(audit).subscribe(res=>{

    }, error => this.messageService.error("Audit Error","Cyber Central"))

  }
  getImageLink(moduleName:string){
    if(moduleName.toLowerCase().includes("watch")){
     return "../../../../assets/image/Icons_SVG/CyberWatch Logo.svg"
    }
    else if(moduleName.toLowerCase().includes("dashboard")){
      return "../../../../assets/image/Icons_SVG/Dashboard.svg"
    }
    else if(moduleName.toLowerCase().includes("cip")){
      return undefined
    }
  }

  deleteRoleModule(role,index){
  
    this.noOfRoleModule.splice(index,1)
    this.deleteRole(role)

  }
  getStartEndDateCheck():any{
    this.noOfModules.forEach(ele=>{
      if(ele.subscription!="Not Opted"){
        if(!(ele.startdate && ele.enddate) ){
          return true
        }
      }
    })
  }
  getExpireValue(days:number){
    if(days>365){
      if((days%365)!=0){
        return (Math.round(days)/ 365).toFixed(2)+ "years"
      }
      else{
        return days/365+ "years"
      }
     
    }
    else if(days > 30){
      let daysLeft=days%30
      if(daysLeft>0){
        return ((days-daysLeft)/30)+" month"+" and "+daysLeft+" days"
      }
      else{
        return ((days-daysLeft)/30)+" months"
      }
      
    }
    else{
      return days+" days"
    }

  }
  getProgress(startdate ,enddate ):any{
     enddate=new Date(enddate)
     startdate=new Date(startdate)
    let  minDate=new Date()
     let n=Math.floor((Date.UTC(startdate.getFullYear(), startdate.getMonth(), startdate.getDate()) - Date.UTC(minDate.getFullYear(),minDate.getMonth(), minDate.getDate()) ) /(1000 * 60 * 60 * 24));
    
     if(n>=0)
      return Math.floor((Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate()) - Date.UTC(startdate.getFullYear(),startdate.getMonth(), startdate.getDate()) ) /(1000 * 60 * 60 * 24));
     else{
      return Math.floor((Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate()) - Date.UTC(minDate.getFullYear(),minDate.getMonth(), minDate.getDate()) ) /(1000 * 60 * 60 * 24));
     }
  }
  getTotalDays(startdate ,enddate ):any{
    enddate=new Date(enddate)
    startdate=new Date(startdate)
    return Math.floor((Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate()) - Date.UTC(startdate.getFullYear(),startdate.getMonth(), startdate.getDate()) ) /(1000 * 60 * 60 * 24));
  }

  fetchAzureRoles(){
    let existingRoleList:string[]=[]
    let exampleRole=new Role()
    exampleRole.projectId=null
    this.roleService.findAll(exampleRole,this.lazyload).subscribe(res=>{
      res.content.forEach(ele=>{
        existingRoleList.push(ele.name)
      })
      console.log(existingRoleList);
      
    this.roleService.getAzureRole().subscribe(ele=>{
      let role:any=[]
      role=ele

      role.forEach(element => {
       
        if(!existingRoleList.includes(element.roleName)){
          this.azureRoleList.push(element.roleName)
        }

      });
      
    })

  }, error => this.messageService.error("Error in fetching Azure Groups","Cyber Central"))
    
  }

  fetchAllPermissions(index,module:string,role:string){
   
    
    let exampleUsmPermissions=new UsmPermissions()
  
    exampleUsmPermissions.module=module
   
    
    this.busy=this.permissionService.findAllPermissions(exampleUsmPermissions,this.lazyload).subscribe(res=>{
      let assignedPermissions=[]
      let assignedToRole=[]
      let assignedModules=[]
      
      
      this.noOfModule.forEach(ele=>{
       
        if(ele.module==module){
          assignedPermissions.push(ele.permission.permission)
          assignedToRole.push(ele.Role)
          assignedModules.push(ele.module)
        }

      })
    
      let tempList=res.content
      this.completePermissionsList=res.content
      
      this.permissionsList[index]=tempList
     tempList.forEach((ele,i)=>{
      
          assignedPermissions.forEach((res,j)=>{
           
            
            if(res==ele.permission && assignedToRole[j]==role && assignedModules[j]==module && this.permissionsList[index].includes(ele)  ){
              let i=this.permissionsList[index].indexOf(ele)
              this.permissionsList[index].splice(i,1) 
                  
            }
            // else if(res!=ele.permission && !this.permissionsList[index].includes(ele) ){

            //   this.permissionsList[index].push(ele)
            // }
           
            
          })
       
        // return !assignedPermissions.includes(ele.permission) || assignedToRole[i]!=role
      })
      
    }, error => this.messageService.error(error,"Cyber Central"))
  }
  createViewForOrganisation(name:string){
    this.organisationService.viewCreationForWatch(name).subscribe(res=>{

    }, error => {
    
      this.messageService.error(error,"Cyber Central")
    });
  }


  fetchModuleArray(){
    
    this.moduleService.findAll(new UsmModules,this.lazyloadevent).subscribe(res=>{
      this.moduleObjectArray=res.content
      this.computeModuleArray(this.moduleObjectArray)
    // this.moduleObjectArray.forEach(ele=>{
   
    //   this.filteredModuleList.push[ele.name]
    //   let moduleOrganisation=new ModuleOrganization()
    //   moduleOrganisation.module=ele
     
    //   this.newModuleOrganisationList.push(moduleOrganisation)
    // })
      
    }

    , error => {
    
      this.messageService.error(error,"Cyber Central")
    }
    )

   
   
  }
  resetModuleArray(moduleObjectArray:UsmModules[]){
    this.noOfModules=[]
    moduleObjectArray.forEach(ele=>{
      let temp:ModuleOrganization=new ModuleOrganization()
      if(ele.name=="cip" || ele.name=="Dashboard" ){
        temp.module=ele
        temp.subscription="Subscribe"
        temp.enddate=new Date()
        temp.startdate=new Date()
        this.noOfModules.push(temp)

      }else{
        temp.module=ele
        temp.subscription="Not Opted"
        this.noOfModules.push(temp)
      }
  
      
     
    })
    console.log(moduleObjectArray);
    console.log(this.noOfModules);
    

  }
  computeModuleArray(moduleObjectArray){
   this.resetModuleArray(moduleObjectArray)

    if(this.isEdit){
      let tempModuleList:UsmModules[]=[]
      let example:ModuleOrganization=new ModuleOrganization()

        example.organisation=new OrgProject()
        example.organisation.id=this.org.id
        console.log(example);
        
        
    example.organisation.logo=null
  this.moduleOrganizationService.findAll(example,this.lazyloadevent).subscribe(res=>{
    res.content.forEach(ele=>{
      this.noOfModules.forEach((ele2,j)=>{
       if(ele2.module.name==ele.module.name){
        this.noOfModules[j]=ele
       console.log("After"+ele.enddate);
       
     
        
        this.noOfModules[j].startdate=new Date(ele.startdate)
        this.noOfModules[j].enddate=new Date(ele.enddate)
        let temp=this.noOfModules[j].enddate.toString()
        if(temp.includes('-')){
          this.noOfModules[j].enddate= moment(this.noOfModules[j].enddate).add(1,'days').toDate();
          this.noOfModules[j].startdate=moment(this.noOfModules[j].startdate).add(1,'days').toDate();
        }
        
       }
      })
    })
  },error=>this.messageService.error(error,"Cyber Central"))
}
  
    console.log(this.noOfModules);
    
  }
  
  // filterModuleList(){

  // }

  filterModuleListByRoles(role,index){
    this.tempModuleList=[]
    this.fetchAllModuleOrganization()
    this.noOfModule.forEach(ele=>{
      let module=ele.module
      if(this.moduleList){

      }
    })
    this.tempModuleList=this.moduleList
  }


  search(orgFilter){
    if(orgFilter=="" ||orgFilter==undefined){
      this.filteredOrganisationList=this.organizationsList
    }
    else{
     
        this.filteredOrganisationList=this.organizationsList.filter(org=>{
       
        return org.name.toLowerCase().includes(orgFilter.toLowerCase())
      }
    )
  }
   
  }
  fetchOrganisations(){
    this.currentOrganisation=JSON.parse(sessionStorage.getItem("project"))
    this.busy=this.organisationService.findAll(new OrgProject(),this.lazyloadevent).subscribe(res=>{

    this.organizationsList=res.content
    this.search("")
      
   });
    
  }

  addDomains(tempDomain:string){
    if(tempDomain.trim()!='' ){
      if(!this.savedDomains.includes(tempDomain)){
        if(this.savedDomains.length<11){
          this.savedDomains.push(tempDomain)
          this.tempDomain=""
        }
        else{
          this.messageService.error("Organisation can have max 10 domains","CyberNext")
        }
      }
      else{
        this.messageService.error("Duplicates not alowed","Cyber Central")
      }
    }
  
   
  }
  removeDomain(index){
    this.savedDomains.splice(index,1)

  }
  checkForBadDates(){
    let bad=0
    this.noOfModules.forEach(ele=>{
      if(ele.subscription!="Not Opted"){
        if(ele.enddate==undefined || ele.startdate==undefined){
          bad++
        }
      }
    })
    if(bad>0){
      return false
    }
    else{
      return true
    }

  }
  checkForDomain(org:OrgProject){
    console.log(org);
    
    let otherDomainCount=0
    console.log(otherDomainCount);
    this.savedDomains.forEach(ele=>{
      if(ele!="infosys.com"){
        otherDomainCount++
      }
    })
    console.log(this.org.name);
    
    if(otherDomainCount>0 ){
      
      return true;
    }
    else{
      if(org.name.trim()=="Cyber Central Management" ){
        return true
      }
      return false
    }

  }
  saveOrg(org:OrgProject){
    
    if(this.checkForBadDates() && this.checkForDomain(org)){
      org.portfolioId=JSON.parse(sessionStorage.getItem('portfoliodata'))
      org.projectdisplayname=org.name
      
      let domainArray=[]
      // org.domainName.split(",").forEach(domain=>{
      //   domainArray.push(domain.trim())
      // })
      domainArray=this.savedDomains
  
      org.domainName=JSON.stringify(domainArray)
      // this.datePipe2 = new DatePipe("en-US");
    
      org.lastUpdated=new Date();
      
     
      
  
      let duplicateFlag=0
      this.noOfProperties.forEach(prop=>{
      
        
        if(this.noOfProperties[this.noOfProperties.length-1].Property==prop.Property &&
              this.noOfProperties.length>1){
          ++duplicateFlag
        }
      })
      if(duplicateFlag>=2){
        this.messageService.info("Duplicate Property","Cybernext")
      }
      else{
      org.productDetails=JSON.stringify(this.noOfProperties)
      this.organisationService.create(org).subscribe(res=>{
     
        // this.createViewForOrganisation(this.org.name)
        this.savedOrganisation=res
        this.noOfProperties.forEach(property=>{
          console.log(property)
          // this.saveDatasource(property);
        })
        this.savedDomains=JSON.parse(this.savedOrganisation.domainName)
        this.saveModuleOrgList(this.savedOrganisation)
        this.orgLogo=undefined
        this.org=new OrgProject()
        this.orgNameToEdit=""
        // this.savedDomains=[]

        this.messageService.info("Organization Created ","Cyber Centeral");
        this.noOfProperties=[]
       
        this.orgSavedShowModule=true
        this.createLandingDashboard(this.savedOrganisation)
        this.addAuditEntry(this.savedOrganisation.name +" organization created",this.savedOrganisation.name)
      }, error => {
       
        this.messageService.error(error,"Cyber Central")
      }
    )
    }
    }
    else{
      if(!this.checkForBadDates())
          this.messageService.error('Please provide the proper start dates and end dates','Cyber Central')
      else if(!this.checkForDomain(org)){
        this.messageService.error('Please enter one domain other than infosys.com','Cyber Central')
      }
    }
  
 
  
  }
  saveModuleOrgList(savedOrganisation){
    let temp=[]
    console.log(this.noOfModules);
    
    this.noOfModules.forEach(moduleOrganization=>{
      moduleOrganization.organisation=savedOrganisation
      moduleOrganization.enddate= this.datePipe.transform(moduleOrganization.enddate, 'yyyy-MM-dd');
      moduleOrganization.startdate= this.datePipe.transform(moduleOrganization.startdate, 'yyyy-MM-dd');
      
      temp.push(moduleOrganization)
      console.log(module);
      
      if(moduleOrganization.id==undefined || moduleOrganization.id==null ){
        if( moduleOrganization.subscription!="Not Opted"){
          moduleOrganization.subscriptionstatus=true
          this.moduleOrganizationService.create(moduleOrganization).subscribe(res=>{
          
          },error=>this.messageService.error(error,"Cyber Central"))
        }
      }else{
        if( moduleOrganization.subscription!="Not Opted" ){
          moduleOrganization.subscriptionstatus=true
          this.moduleOrganizationService.update(moduleOrganization).subscribe(res=>{
          },error=>this.messageService.error(error,"Cyber Central"))
        }
        else{
          console.log(moduleOrganization);
          
          this.deleteModuleForOrg(moduleOrganization.id)
        }
        
      }
  
    })
  // this.noOfModules=[]
  
  this.cancelModuleSave()
    
  }

 updateOrg(org:OrgProject){
  
   
  if(this.checkForBadDates() && this.checkForDomain(org)){
    org.portfolioId=JSON.parse(sessionStorage.getItem('portfoliodata'))
    org.projectdisplayname=org.name
    
    let domainArray=[]
    // org.domainName.split(",").forEach(domain=>{
    //   domainArray.push(domain.trim())
    // })
    domainArray=this.savedDomains
    org.domainName=JSON.stringify(domainArray)

    let duplicateFlag=0
    this.noOfProperties.forEach(prop=>{
    
      
      if(this.noOfProperties[this.noOfProperties.length-1].Property==prop.Property &&
            this.noOfProperties.length>1){
        ++duplicateFlag
      }
    })
    if(duplicateFlag>=2){
      this.messageService.info("Duplicate Property","Cyber Central")
    }
    else{
      org.productDetails=JSON.stringify(this.noOfProperties)
     
      
      this.busy=this.organisationService.update(org).subscribe(res=>{
        this.noOfProperties.forEach(property=>{
          console.log(property)
          // this.saveDatasource(property);
        })
        this.savedOrganisation=res
      
        this.savedDomains=JSON.parse(this.savedOrganisation.domainName)
      
        this.saveModuleOrgList(this.savedOrganisation)
        this.messageService.info("Organization Updated ","Cyber Central");
        this.org=new OrgProject()
        // this.savedDomains=[]
        this.anyOrgUpdated=true
        this.orgSavedShowModule=true
        this.fetchAllModuleOrganization();
        this.fetchAllRoles(this.savedOrganisation)
        
        this.noOfProperties=[]
        this.addAuditEntry(this.savedOrganisation.name +" organization updated",this.savedOrganisation.name)
      }, error => this.messageService.error(error,"Cyber Central"))
    }
    
 
  }
  else{
     
       if(!this.checkForBadDates())
          this.messageService.error('Please provide the proper start dates and end dates','Cyber Central')
      else if(!this.checkForDomain(org)){
        this.messageService.error('Please enter one domain other than infosys.com','Cyber Central')
      }
  }

  }

  
  deleteModuleForOrg(index){
    this.moduleOrganizationService.delete(index).subscribe(res=>{
      this.fetchAllModuleOrganization()
      this.messageService.info("Module removed successfully","Cyber Central")
     
      this.selectedModuleOrganization=this.filterModuleList(this.selectedModuleOrganization)
    },error=>this.messageService.error(error,"Cyber Central"))
  }
  deleteRole(role){
   
    console.log(this.newRole);
    this.roleService.delete(role.id).subscribe(res=>{
      this.fetchAllRoles(this.savedOrganisation);
      this.newRole=new Role()
      this.messageService.info("Group Deleted ","Cyber Central");
      this.addAuditEntry(role.name +" role deleted",this.savedOrganisation.name)
    }, error => this.messageService.error(error,"Cyber Central"))
  }

  showEdit(org){
    if(!this.isEdit){
      this.isEdit=true
      this.org=org
      let example=new OrgProject()
      example.id=org.id
      this.busy=this.organisationService.findAll(example,this.lazyloadevent).subscribe(res=>{
     
      
      this.org.lastUpdated=res.content[0].lastUpdated
      this.orgNameToEdit=org.name
      if(this.org.domainName && this.org.domainName!=""){
        this.savedDomains=JSON.parse(this.org.domainName)
      }
     
  
      if(org.productDetails)
        this.noOfProperties=JSON.parse(org.productDetails)
     
      });
       
    }
    else{
      this.isEdit=false
      this.org=new OrgProject()
      this.orgNameToEdit=""
    }
  }
  cancelAddition(){
    
    this.savedOrganisation=new OrgProject()
    this.org=new OrgProject()
    this.orgNameToEdit=""
    this.savedDomains=[]
    this.tempDomain=''
    // this.fetchOrganisations()
    this.fetchModuleArray()
    this.orgSavedShowModule=false
    this.modulesAddedShowRoles=false
    this.showAllModules=false
    this.roleAddedShowModules=false
    this.isEdit=false
    
    this.roleList=[]
    this.moduleListforOrg=[]
    this.noOfModules=[]
    // this.router.navigate(["././configurationBeta/OrgDashboard"], { relativeTo: this.route });
    this.orgToEdit=undefined
    this.goBack.emit(false)
  }
  cancelEdit(){
   
    // if(!this.isEdit)
    //   this.isEdit=true
    // else{
      this.isEdit=false
      this.org=new OrgProject()
      this.orgNameToEdit=""
      this.savedDomains=[]
      this.noOfProperties=[]
      this.fetchModuleArray()
      this.noOfModules=[]
      // this.router.navigate(["././configurationBeta/OrgDashboard"], { relativeTo: this.route });
      this.orgToEdit=undefined
      this.goBack.emit(false)
      
    // }
    this.fetchOrganisations()
    this.orgSavedShowModule=false
    this.modulesAddedShowRoles=false
    // this.modulesAddedShowRoles=false
    // if(this.anyOrgUpdated){
    //  this.fetchOrganisations()
    // }
    this.anyOrgUpdated=false

  }

  saveRole(newRole:Role):any{
    let roleAdded=new Role()
    newRole.permission=true
    newRole.projectId=this.savedOrganisation.id
   this.roleService.create(newRole).subscribe(res=>{
     roleAdded=res
     this.fetchAllRoles(this.savedOrganisation);
     this.newRole=new Role()
     this.messageService.info("New Group Created ","Cyber Central");
     this.roleAddedShowModules=false
     
     this.addRoleList.push(res)
     
     return res
    //  this.broadcasterService.setRoleListUpdated(true)
   }, error => this.messageService.error(error,"Cyber Central"))
    return roleAdded
  }
  cancelRoleAddition(){
    this.modulesAddedShowRoles=false
    this.orgSavedShowModule=false
    this.enableModuleCancel=false
    this.roleAddedShowModules=true
    
    this.fetchAllModuleOrganization()
    this.fetchAllRoles(this.savedOrganisation)
  }

 incModule(){
   this.noOfModule.push({"Role":"","module":"","navigateTo":"","permission":new UsmPermissions})
   
 }
 
  decModule(index){
    this.noOfModule.splice(index,1)
 
  }
  
  cancelAddeModule(){
    this.modulesAddedShowRoles=false
    this.orgSavedShowModule=false
    this.enableModuleCancel=false
    this.roleAddedShowModules=false
    this.moduleAccessGiven=true
  }
  saveModule(noOfModule){
  
    let createdConstants=[]
    
    noOfModule.forEach(module=>{
     
      let newRolePermission: UsmRolePermissions =new  UsmRolePermissions()

      let value={"label":module.module,"icon":"folder","url":module.navigateTo}
      let newRoleModule:DashConstant=new DashConstant()
      newRoleModule.project_id=this.savedOrganisation
      newRoleModule.project_name=this.savedOrganisation.name
      newRoleModule.keys=module.Role+" Side"
      newRoleModule.value=JSON.stringify(value)
  
    this.completePermissionsList.forEach(ele=>{

      newRolePermission.permission=module.permission
      // if(ele.module==module.module && ele.permission==module.permission){
      //   newRolePermission.permission=ele
      //   console.log(newRolePermission);
      // }
    })
     
     
    this.roleList.forEach(ele=>{
        if(ele.name==module.Role){
          newRolePermission.role=ele
        }
    })
  
    
  if(createdConstants.includes(module.module.toString())){
    this.saveRolePermissions(newRolePermission)
  }
  else{

    this.apisService.createDashConstant(newRoleModule).subscribe(res=>{
      if(res){

        createdConstants.push(JSON.parse(res.value).label.toString())
        console.log(createdConstants);
        
      }
        
      
      this.newRoleModule=new DashConstant()
      // this.newRoleModuleLand=new DashConstant()
      this.selectedModule=""
      this.selectedUrl=""
      this.messageService.info("Module Added","CyberNext");
      // this.getModules();
     
      this.saveRolePermissions(newRolePermission)
     
      this.noOfModule=[]
      this.noOfModule.push({"Role":"","module":"","navigateTo":"","permission":new UsmPermissions})
    }, error => this.messageService.error(error,"CyberNext"))

  }
  
      
    })
   
    
  }

  saveRolePermissions(newRolePermission:UsmRolePermissions):UsmRolePermissions{
    
      this.permissionService.create(newRolePermission).subscribe(res=>{
     
        return res
      }, error => this.messageService.error(error,"CyberNext"))
   
      return newRolePermission
  
  }
  fetchAllRoles(Org){
    let exampleRole=new Role()
    exampleRole.projectId=Org.id
   
    this.busy=this.roleService.findAll(exampleRole,this.lazyloadevent).subscribe(res=>{
      this.roleList=res.content
    
     
    })
  }
  inc() {
    let duplicateFlag=0
    this.noOfProperties.forEach(prop=>{
    
      
      if(this.noOfProperties[this.noOfProperties.length-1].Property==prop.Property &&
            this.noOfProperties.length>1){
        ++duplicateFlag
      }
    })
    if(duplicateFlag>=2){
      this.messageService.info("Duplicate Property","Cybernext")
    }
    else{
      this.noOfProperties.push({"Property":"--Select--","Authorization":"","User":"","URL":"","APIKey":""});
    }
  }
  dec(index){
    this.noOfProperties.splice(index, 1);

  
    // this.noOfProperties.pop()
  }
  onClick() {
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    
    fileUpload.click();
}
cancelFile() {
  this.org.logo=null
 this.orgLogo=''
 this.orgLogoName=''
}
setFileData(event, field, isImage) {
  if (event && event.target.files && event.target.files[0]) {
    const file = event.target.files[0];
    if (isImage && !/^image\//.test(file.type)) {
      return;
    }
    if (event.target.files[0].type == "image/png" || event.target.files[0].type == "image/jpeg " || event.target.files[0].type == "image/svg") {
      if ((event.target.files[0].size / 1024) < 50) {
        this.disableupload = false;
        this.organisationService.toBase64(file, base64Data => {
          
          
          this.org.logo = base64Data;
          this.alt_img = this.org.logo

          this.alt_img
            = this.sanitizer.bypassSecurityTrustUrl("data:image/png;base64," + this.alt_img);
  
                 this.orgLogoName=this.orgLogo.split('^(.+)\/([^/]+)$').pop()       
        });
       
        
      }
      else {
        this.disableupload = true;
        this.messageService.error("Select file less than 50KB", "CyberNext")
      }
    }
    else {
      this.disableupload = true;
      this.messageService.error("Select only PNG/JPEG/SVG file", "CyberNext")
    }
  }
}
// retryFile(file: FileUploadModel) {
  
//   file.canRetry = false;
// }
private removeFileFromArray(file: FileUploadModel) {
  const index = this.files.indexOf(file);
  if (index > -1) {
        this.files.splice(index, 1);
  }
}
  deleteOrg(id){
    this.organisationService.delete(id).subscribe(res=>{
      this.fetchOrganisations();
      this.messageService.info("Error in deleting organization","Cybernext")

    }, error => this.messageService.error(error,"CyberNext"))
  }

  saveModuleOrg(moduleOrganization:ModuleOrganization){
    // moduleOrganization.startdate=new Date()
    moduleOrganization.organisation=this.savedOrganisation
    moduleOrganization.enddate= this.datePipe.transform(moduleOrganization.enddate, 'yyyy-MM-dd');
    moduleOrganization.startdate= this.datePipe.transform(moduleOrganization.startdate, 'yyyy-MM-dd');
    moduleOrganization.subscriptionstatus=true
   
    this.busy=this.moduleOrganizationService.create(moduleOrganization).subscribe(res=>{
      this.messageService.info("Module added successfully","Cybernext")
      this.newModuleOrganisation=new ModuleOrganization()
      this.fetchAllModuleOrganization();
      this.enableModuleCancel=true
      this.showAllModules=true
      
      // this.modulesAddedShowRoles=true;
      
    },error=>this.messageService.error(error,"Cybernext"))
    
  }
  
  cancelModuleSave(){
    this.modulesAddedShowRoles=true
    this.orgSavedShowModule=false
    this.enableModuleCancel=false
    
    
      let exampleRole=new Role()
      exampleRole.projectId=this.savedOrganisation.id
      let example:ModuleOrganization=new ModuleOrganization()
      example.organisation=new OrgProject()
      example.organisation.id=this.savedOrganisation.id
      example.organisation.logo=null

      //ToDO : handle asynschronous call in better way
        this.busy=this.roleService.findAll(exampleRole,this.lazyloadevent).subscribe(res2=>{
          this.roleList=res2.content

          this.moduleOrganizationService.findAll(example,this.lazyloadevent).subscribe(res1=>{
            this.moduleListforOrg=res1.content

            //changes for timezone and date decreasing 
            if(this.moduleListforOrg.length>0){
              let temp=new Date(this.moduleListforOrg[0].enddate).toString()
              if(temp.includes('-')){
                this.moduleListforOrg.forEach((ele,j)=>{
                  this.moduleListforOrg[j].enddate= moment(this.moduleListforOrg[j].enddate).add(1,'days').toDate();
                  this.moduleListforOrg[j].startdate=moment(this.moduleListforOrg[j].startdate).add(1,'days').toDate();
                })
            }
            }
            this.createRoleModuleArray()
        },error=>this.messageService.error(error,"Cybernext"))
      })
     

    
    
    
 
    this.newRole.projectId=this.savedOrganisation.id
    this.showAllModules=true
  }
 
  filterModuleList(selectedModuleOrganization:ModuleOrganization[]){
    
    selectedModuleOrganization.forEach( (ele,index)=>{
      this.setStatus(ele)
      if(ele.enddate<this.minDate){
        selectedModuleOrganization[index].subscriptionstatus=false
      }
      else{
        selectedModuleOrganization[index].subscriptionstatus=true
      }
      if(this.filteredModuleList.indexOf(ele.module.name)>-1){
        
      }
        this.filteredModuleList.splice(this.filteredModuleList.indexOf(ele.module.name),1)
    })

    
    
    return selectedModuleOrganization;
  }
  getModules(){
    // this.roleModuleList=[]
    //  this.sidebarProjectList=[]
     this.apisService.getDashConsts().subscribe((res) => {
       let project;
       try {
        project = JSON.parse(sessionStorage.getItem("project"));
       } catch (e) {
        console.error("JSON.parse error - ", e.message);
       }
       res = res.filter(
        (item) =>
         // item.project_id.id == project.id &&
         item.project_name == project.name 
         // item.keys == role.name + " Side"
       );
     }
     )
    
     
   }

  fetchAllModuleOrganization(){

    let example:ModuleOrganization=new ModuleOrganization()
    example.organisation=new OrgProject()
    example.organisation.id=this.savedOrganisation.id
    example.organisation.logo=null
    this.moduleOrganizationService.findAll(example,this.lazyloadevent).subscribe(res=>{
      this.moduleListforOrg=res.content
      
      
      // this.setModuleList( this.moduleListforOrg);
      // this.selectedModuleOrganization= this.filterModuleList(res.content);
    },error=>this.messageService.error("Error in fetching Modules","Cybernext"))

  }
  fetchModulePermissions(){
    
    this.moduleListforOrg.forEach(ele=>{
      let exampleUsmPermissions:UsmPermissions=new UsmPermissions()
      exampleUsmPermissions.module=ele.module.name
      this.busy=this.permissionService.findAllPermissions(exampleUsmPermissions,this.lazyload).subscribe(res=>{
      this.addedPermissionList.push(res.content)
      }, error => this.messageService.error("Error in fetching Modules","CyberNext"))
    })
    console.log(this.addedPermissionList);
  
  }
  saveRolePerm(i,j,permission:UsmPermissions,role:Role){

    let example=new UsmRolePermissions()
    example.role=new Role()
    example.role=role
    example.permission=new UsmPermissions()
    example.permission.module=permission.module
    example.permission.permission=permission.permission
   
   
    
    this.permissionService.findAll(example,this.lazyload).subscribe(res=>{
        console.log(res);   
        if(res.content.length==0){
          let tempRolePermission=new  UsmRolePermissions()
          tempRolePermission.role=role
          tempRolePermission.permission=permission
          this.permissionService.create(tempRolePermission).subscribe(res=>{
          
            this.noOfRoleModule[i][j].permission.push(res)
            
            if(tempRolePermission.permission.module=="Dashboard" && tempRolePermission.permission.permission=="Edit Dashboard"){
              let role=tempRolePermission.role
              role.roleadmin=true
              role.permission=true
              this.roleService.update(role).subscribe(ele=>{

              });
            }

            
          }, error => this.messageService.error(error,"CyberNext"))
         
        }
        else{
          this.messageService.error("Duplicate Permission","CyberNext")
        }
    }, error => this.messageService.error(error,"CyberNext"))
   
  }

  createRoleModuleArray(){

    this.roleList.forEach(role=>{
      let tempRoleModule:any[]=[]
   
      
      this.moduleListforOrg.forEach((moduleOrg,j)=>{
        tempRoleModule.push({"Role":role,"module":moduleOrg.module,"navigateTo":"","permission":[]})

        let example=new UsmRolePermissions()
        example.role=new Role()
        example.role=role
        example.permission=new UsmPermissions()
        example.permission.module=moduleOrg.module.name
       this.busy=this.permissionService.findAll(example,this.lazyload).subscribe(res=>{
          res.content.forEach(element => {
            tempRoleModule[j].permission.push(element)
          });
          
        })
      })
      this.noOfRoleModule.push(tempRoleModule)
    
    })
    this.getRoleModules();
    this.fetchModulePermissions();

    
  }
  deleteRolePermission(perm,i,j,k){
    this.permissionService.delete(perm.id).subscribe(res=>{
    let tempArray=[]
    // console.log(this.noOfRoleModule[i][j]);
    this.noOfRoleModule[i][j].permission.forEach(ele=>{
      // console.log(ele);
      
      if(perm.permission.module=="Dashboard" && perm.permission.permission=="Edit Dashboard"){
        let role=perm.role
        role.roleadmin=false
        role.permission=false
        this.roleService.update(role).subscribe(ele=>{
        });
      }
      if(ele.id!=perm.id){
        tempArray.push(ele)
      }
      // console.log(tempArray);
      
    })
  
    this.noOfRoleModule[i][j].permission=tempArray
    // this.noOfRoleModule[i][j].permission.push(tempArray)
    console.log(this.noOfRoleModule[i][j]);
    }, error => this.messageService.error(error,"CyberNext"))

   
    
  }

  incRole(role){
    let newRole=new Role()
    let createdRole=new Role()
    newRole.name=role
    let tempRoleModule:any[]=[]
    this.selectedRole=""
   
    newRole.permission=true
    newRole.projectId=this.savedOrganisation.id
    let duplicateRole=false
    
    
    this.roleList.forEach(exitingRole=>{
      if(exitingRole.name==newRole.name){
        duplicateRole=true
      }
    })
    if(!duplicateRole){
      newRole.permission=false
      this.roleService.create(newRole).subscribe(res=>{
  
        this.moduleListforOrg.forEach(element => {
          
          tempRoleModule.push({"Role":res,"module":element.module,"navigateTo":"","permission":[]})
        });
         this.roleList.push(res)
         this.addAuditEntry(newRole.name +" role created",this.savedOrganisation.name)
       }, error => this.messageService.error(error,"CyberNext"))
    }
    else{
      this.messageService.error("Duplicate Role","CyberNext")
    }
   
    this.noOfRoleModule.push(tempRoleModule)
    this.addRoleList.push(newRole)
    
    this.fetchModulePermissions();

  }

  createLandingDashboard(savedOrganisation){
    let newDashboard= {}
    newDashboard["category"]="board-category"
    newDashboard["appname"]=savedOrganisation.name+"_Dashboard"
    newDashboard["createdby"]=this.currentUserObject.name
    newDashboard["isdeleted"]=false
    newDashboard["project"]=savedOrganisation
    newDashboard["dashjson"]=JSON.stringify({
      title: newDashboard["appname"],
      structure: "6-6",
      boardInstanceId: 5,
      rows: [
        {
          columns: [
            { styleClass: "six wide", gadgets: [] },
            { styleClass: "six wide", gadgets: [] },
          ],
        },
      ],
      id: 5,
      parentfiltershow: true,
      filterfullwidth: false,
    });
    this.organisationService.createDashboard(newDashboard).subscribe(res=>{
      console.log(res);
      this.saveLandingPage(res.id)
      
    })
  }

  
  saveLandingPage(id){
    
    let newRoleModule=new DashConstant()
    newRoleModule.project_id=this.savedOrganisation
    newRoleModule.project_name=this.savedOrganisation.name
    newRoleModule.keys="Land"
    newRoleModule.value="./dynamicDashboard/grid/OCC/"+id

   
    this.apisService.createDashConstant(newRoleModule).subscribe(res=>{
  console.log(res);

    }, error => this.messageService.error(error,"Cyber Central"))
   
      
    
  }

  getRoleModules(){
    
    this.apisService.getDashConstsForProject(this.savedOrganisation).subscribe((res) => {
      let project;
      try {
       project = this.savedOrganisation
      } catch (e) {
       console.error("JSON.parse error - ", e.message);
      }
     
     res.forEach(item=>{
      let roleModule:{"id":"","role":"","module":"","navigateTo":""}={"id":"","role":"","module":"","navigateTo":""};
      
      
     
      if(item.keys!="Land"){
        let sidebarValue=JSON.parse(item.value).label
        let navigateTo=JSON.parse(item.value).url
        roleModule.id=item.id
          roleModule.role=item.keys.split(' Side')[0]
          
          roleModule.module=sidebarValue
          roleModule.navigateTo=navigateTo
          this.roleModuleList.push(roleModule)
      }
     
        
       }
       
       
     )
    
    }
    )

  
  }

  saveRoleModulePermission(){
  
    this.noOfRoleModule.forEach(roleModule=>{
      roleModule.forEach(ele=>{
        console.log("permission",ele.permission.length);
        
        if(ele.permission.length>0){
          let duplicateModule=false
        //  this.roleModuleList.forEach(element => {
        //    if(element.role==ele.Role.name && element.module==){

        //    }
        //  });
        
        
         let duplicate=this.roleModuleList.filter(element=>{
           console.log("Role-Module",element.role==ele.Role.name && element.module==ele.module.name);
           
          if(element.role==ele.Role.name && element.module==ele.module.name){
            return true;
          }
         })
         
         
         
         if(duplicate.length==0){
          let newRoleModule:DashConstant=new DashConstant()
          let value={"label":ele.module.name,"icon":"folder","url":""}
          newRoleModule.project_id=this.savedOrganisation
          newRoleModule.project_name=this.savedOrganisation.name
          newRoleModule.keys=ele.Role.name+" Side"
          newRoleModule.value=JSON.stringify(value)
          this.apisService.createDashConstant(newRoleModule).subscribe(res=>{
          })
         }
          
        }
        else{
          let duplicate=this.roleModuleList.filter(element=>{
            
            if(element.role==ele.Role.name && element.module==ele.module.name){
              return true;
            }
           })
           if(duplicate.length>0){
         
          
             
            this.apisService.deleteDashConstants(duplicate[0].id).subscribe(res=>{
             
            }, error => this.messageService.error(error,"CyberNext"))
           }

        }
       
      })
    
    })
    this.messageService.info("Group Details Saved","Cyber Central")
    this.noOfRoleModule=[]
    this.cancelAddition()
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
}


export class FileUploadModel {
  data: File;
  state: string;
  inProgress: boolean;
  progress: number;
  canRetry: boolean;
  canCancel: boolean;
  sub?: Subscription;
}
