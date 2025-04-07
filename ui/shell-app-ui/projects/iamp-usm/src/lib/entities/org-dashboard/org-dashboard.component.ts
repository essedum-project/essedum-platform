import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Audit } from '../../models/audit';
import { UsmModules } from '../../models/module';
import { ModuleOrganization } from '../../models/ModuleOrganization';
import { OrgProject } from '../../models/OrgProject';
import { Role } from '../../models/role';
import { UserProjectRole } from '../../models/user-project-role';
import { AuditService } from '../../services/audit.service';
import { MessageService } from '../../services/message.service';
import { ModuleOrganisationService } from '../../services/module-organisation.service';
import { ModulesService } from '../../services/modules.service';
import { OrganisationService } from '../../services/organisation.service';
import { RoleConfigurationService } from '../../services/role-configuration.service';
import { ConfirmationDialogComponent } from '../../shared-modules/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-org-dashboard',
  templateUrl: './org-dashboard.component.html',
  styleUrls: ['./org-dashboard.component.css']
})
export class OrgDashboardComponent implements OnInit {
  orgFilter:string
  currentOrganisation:any
  organizationList:OrgProject[]=[];
  lazyloadevent = {
    first: 0,
    rows: 3000,
    sortField: null,
    sortOrder: 1,
    filters: null,
    multiSortMeta: null,
  };
  isCreateOrg=false
  organizationListString: string;
  busy: Subscription;
  isOrg: boolean;
  selectedOrganisation: OrgProject;
  selectedModuleOrganizationList: ModuleOrganization[]=[];
  minDate: Date;
  expiredSubscriptions: any=0;
  activeSubscription: any=0;
  recentlyExpiredSubscriptions: any=0;
  newOrganisationList: any[]=[];
  orgList: any[];
  filteredOrganisationList: any[];
  cybergazeStatus: string[]=[];
  cybercompassStatus: string[]=[];
  cyberhuntStatus: string[]=[];
  cyberwatchStatus: string[]=[];
  cyberanalyticsStatus: string[]=[];
  cyberscanStatus: string[]=[];
 
  isTableView:boolean=true
  moduleObjectArray: UsmModules[];

  page = 1;
  page_extended = 1;
  pageSize=10
  pageSizeArray=[10,20,50,100]
  filteredModuleList: any[] =[];
  expired: any=0;
  active :any =0
  cybergazeExpired: any=0;
  cybergazeActive: any=0;
  intelActive: any=0;
  intelExpired: any=0;
  scanActive: any=0;
  scanExpired: any=0;
  analyticsActive: any=0;
  analyticsExpired: any=0;
  watchActive: any=0;
  watchExpired: any=0;
  huntActive: any=0;
  huntExpired: any=0;
  compassActive: any=0;
  compassExpired: any=0;
  cyberscanIntel: any;
  cyberintelStatus: any;
  userMappingList: UserProjectRole[]=[];
  roleList:Role[]=[]
  orgToEdit: any;
  evaluation: any=0;
  cybercompassExpired: any=0;
  cybergazeEvaluation: any=0;
  cybercompassEvaluation: any=0;
  cyberintelEvaluation: any=0;
  cyberhuntEvaluation: any=0;
  cyberwatchEvaluation: any=0;
  cyberscanEvaluation: any=0;
  managerAccess:any=false
  filteredSortedOrganisationList: any;
  orgNameSortStatus=''
  orgIdSortStatus=''
  orgDateSortStatus=''
  orignalUnsortedList: any[];
  currentOrg: any;
  currentRoleObject: any;
  currentUserObject: any;
  currentOrgObject: any;
  constructor(
    private organisationService:OrganisationService,
    private moduleOrganizationService:ModuleOrganisationService,
    private messageService: MessageService,
    private moduleService:ModulesService,
    private roleService:RoleConfigurationService, 
    private auditService:AuditService,
    public dialog: MatDialog

  ) { }

  ngOnInit() {
    this.currentRoleObject=JSON.parse(sessionStorage.getItem('role'))
    this.currentUserObject=JSON.parse(sessionStorage.getItem('user'))
    this.currentOrgObject=JSON.parse(sessionStorage.getItem('project'))
    this.currentOrg=JSON.parse(sessionStorage.getItem('project')).name
    if(JSON.parse(sessionStorage.getItem('role')).name.toLowerCase()=="manager"){
      this.managerAccess=true
    }
    
    this.fetchOrganisations()
    this.minDate=new Date()
    
    
    this.computeOrganisationList()
  
    this.fetchModuleArray();
  }

  
  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: {
        title: 'Delete Org',
        message:   ' will be deleted '
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.messageService.info("org delete work","")
      }
    }, error => this.messageService.error("error"," Msg.APP"));
  }
  addAuditEntry(auditMessage:string,orgName:string){
    let audit:Audit
    audit.isAuditSuccess=true
    audit.auditUser=this.currentUserObject.user_f_name
    audit.auditRole=this.currentRoleObject.name
    audit.auditTimestamp=new Date()
    audit.auditOrg=orgName
    audit.auditType="USM"
    audit.auditMessage=auditMessage

    this.auditService.createAudit(audit).subscribe(res=>{

    }, error => this.messageService.error("Audit Error","Cyber Central"))

  }
  sort(sorttype,status) {

  
    
    if(sorttype=="orgName"){
      if(status==''){
        if (this.filteredOrganisationList) {
          this.orignalUnsortedList=this.filteredOrganisationList
          this.orgNameSortStatus='desc'
          this.orgDateSortStatus=''
        this.orgIdSortStatus=''
          this.filteredOrganisationList.sort(function (a, b) {
            var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
            if (nameA < nameB) //sort string ascending
              return -1;
            if (nameA > nameB)
              return 1;
            return 0; //default return value (no sorting)
          });
        }
      }
      else if(status=='desc'){
       this.orgNameSortStatus='asc'
       this.orgDateSortStatus=''
        this.orgIdSortStatus=''
        if (this.filteredOrganisationList) {
          this.filteredOrganisationList.sort(function (a, b) {
            var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
            if (nameA > nameB) //sort string ascending
              return -1;
            if (nameA < nameB)
              return 1;
            return 0; //default return value (no sorting)
          });
        }
      }
      else{
        this.orgDateSortStatus=''
        this.orgIdSortStatus=''
        this.orgNameSortStatus=''
        this.search(this.orgFilter)
        // this.filteredOrganisationList=this.organizationList.slice(
        
      }
     
    }
    else if(sorttype=="orgId"){
      if(status==''){
        if (this.filteredOrganisationList) {
          this.orignalUnsortedList=this.filteredOrganisationList
          this.orgIdSortStatus='desc'
          this.orgNameSortStatus=''
          this.orgDateSortStatus=''
          this.filteredOrganisationList.sort(function (a, b) {
            var nameA = a.id, nameB = b.id;
            if (nameA < nameB) //sort string ascending
              return -1;
            if (nameA > nameB)
              return 1;
            return 0; //default return value (no sorting)
          });
        }
      }
      else if(status=='desc'){
       this.orgIdSortStatus='asc'
       this.orgNameSortStatus=''
       this.orgDateSortStatus=''
        if (this.filteredOrganisationList) {
          this.filteredOrganisationList.sort(function (a, b) {
            var nameA = a.id, nameB = b.id;
            if (nameA > nameB) //sort string ascending
              return -1;
            if (nameA < nameB)
              return 1;
            return 0; //default return value (no sorting)
          });
        }
      }
      else{
        this.orgNameSortStatus=''
        this.orgDateSortStatus=''
        this.orgIdSortStatus=''
        this.search(this.orgFilter)
        // this.filteredOrganisationList=this.organizationList.slice(0)
       
      }
     
    }
    else if(sorttype=="orgDate"){
      if( status=='' ){
        if (this.filteredOrganisationList) {
          this.orignalUnsortedList=this.filteredOrganisationList
          this.orgDateSortStatus='desc'
          this.orgIdSortStatus=''
          this.orgNameSortStatus=''
          this.filteredOrganisationList.sort(function (a, b) {
            var nameA = new Date(a.lastUpdated), nameB = new Date(b.lastUpdated);
            if (nameA < nameB) //sort string ascending
              return -1;
            if (nameA > nameB)
              return 1;
            return 0; //default return value (no sorting)
          });
        }
      }
      else if(status=='desc'){
       this.orgDateSortStatus='asc'
       this.orgIdSortStatus=''
       this.orgNameSortStatus=''
        if (this.filteredOrganisationList) {
          this.filteredOrganisationList.sort(function (a, b) {
            var nameA = new Date(a.lastUpdated), nameB = new Date(b.lastUpdated);
            if (nameA > nameB) //sort string ascending
              return -1;
            if (nameA < nameB)
              return 1;
            return 0; //default return value (no sorting)
          });
        }
      }
      else{
        this.orgDateSortStatus=''
        this.orgIdSortStatus=''
        this.orgNameSortStatus=''
        this.search(this.orgFilter)
        // this.filteredOrganisationList=this.organizationList.slice(0)
      }
     
    }
    
  }
  DSpopoverbind(thisElement) {
   
    
    if (thisElement.type == 'mouseenter') {

      if (document.getElementById("DSA_popoverMainBody")) {
        document.getElementById("DSA_popoverMainBody").parentNode.removeChild(document.getElementById('DSA_popoverMainBody'));

      }


      var rect = thisElement.target.getBoundingClientRect();

      var iDiv = document.createElement('div');
      iDiv.id = 'DSA_popoverMainBody';
      iDiv.className = 'DSA_popoverMainBody';
      document.getElementsByTagName('body')[0].appendChild(iDiv);
      var cln = thisElement.target.closest(".DSA_popoverMainCtr").querySelector('.DSA_popoverInner').cloneNode(true);
      document.querySelector('.DSA_popoverMainBody').appendChild(cln);
      // document.getElementById('DSA_popoverMainBody').querySelector('.DSA_popoverclose').id = 'DSA_popoverclose';

      var wdth = document.getElementById('DSA_popoverMainBody').offsetWidth;
      var hgth = document.getElementById('DSA_popoverMainBody').offsetHeight;
      var itemwdth = thisElement.target.offsetWidth;
      var itemhgth = thisElement.target.offsetHeight;


      if (thisElement.target.getAttribute('data-Pos') == 'left') {
        document.getElementById('DSA_popoverMainBody').style.left = (rect.left - 20 - wdth) + 'px';
        document.getElementById('DSA_popoverMainBody').style.top = (rect.top - ((hgth - itemhgth) / 2) +30) + 'px';
        document.getElementById('DSA_popoverMainBody').classList.add('DSA_leftArrow');
      }
      if (thisElement.target.getAttribute('data-Pos') == 'right') {
        document.getElementById('DSA_popoverMainBody').style.top = (rect.top - ((hgth - itemhgth) / 2)) + 'px';
        document.getElementById('DSA_popoverMainBody').style.left = (rect.right + 10) + 'px';
        document.getElementById('DSA_popoverMainBody').classList.add('DSA_rightArrow');
      }
      if (thisElement.target.getAttribute('data-Pos') == 'top') {
        document.getElementById('DSA_popoverMainBody').style.top = (rect.top - itemhgth - 10 - hgth) + 'px';
        document.getElementById('DSA_popoverMainBody').classList.add('DSA_topArrow');
        document.getElementById('DSA_popoverMainBody').style.left = (rect.left + (itemwdth - wdth) / 2) + 'px';
      }
      if (thisElement.target.getAttribute('data-Pos') == 'bottom') {
        document.getElementById('DSA_popoverMainBody').style.top = (rect.top + itemhgth )+ 30 + 'px';
        document.getElementById('DSA_popoverMainBody').style.width =  '245px';
        document.getElementById('DSA_popoverMainBody').classList.add('DSA_bottomArrow');
        document.getElementById('DSA_popoverMainBody').style.left = (rect.left + (itemwdth - wdth) / 2)+ 60+ 'px';
        console.log(rect.top + itemhgth +30);
        
      }


      /*this.bindEvent(document.getElementById('DSA_popoverMainBody'), 'click', function (e) {
        document.getElementById("DSA_popoverMainBody").parentNode.removeChild(document.getElementById('DSA_popoverMainBody'));
      });*/
      this.bindEvent(document.getElementById('DSA_popoverMainBody'), 'mouseleave', function (e) {
        document.getElementById("DSA_popoverMainBody").parentNode.removeChild(document.getElementById('DSA_popoverMainBody'));
      });
      // this.bindEvent(document.getElementById('DSA_popoverclose'), 'click', function (e) {
      //   document.getElementById('DSA_popoverMainBody').parentNode.removeChild(document.getElementById('DSA_popoverMainBody'));
      // });



    }
    else if (thisElement.type == 'mouseleave') {

    }


  }

  
  bindEvent(el, eventName, eventHandler) {
    if (el.addEventListener) {
      el.addEventListener(eventName, eventHandler, false);
    } else if (el.attachEvent) {
      el.attachEvent('on' + eventName, eventHandler);
    }
  }

  DSpopover(thisElement){
    this.DSpopoverbind(thisElement);

    } 
  editOrg(org){
    this.orgToEdit=org;
    this.goToCreateOrg()
    
  }
  getPageNo(current: number) {
    let tempList=[]
    this.filteredOrganisationList.forEach((ele,index)=>{
      tempList.push((index+1).toString())
    })
    
  return tempList[current - 1];
  }
  setPageSize(pageSize:number){
    if(pageSize){
      this.pageSize=pageSize
    }
  }
  search(orgFilter){
    if(orgFilter=="" ||orgFilter==undefined){
      this.orgFilter=""
      this.orgNameSortStatus=''
        this.orgDateSortStatus=''
        this.orgIdSortStatus=''
      let tempList=this.organizationList
      this.filteredOrganisationList=this.organizationList.slice()
      
      this.organizationList=tempList
    }
    else{
     
      this.filteredOrganisationList=this.organizationList.filter(org=>{
       
        return org.name.toLowerCase().includes(orgFilter.toLowerCase())
      }
    )
    this.filteredSortedOrganisationList=this.filteredOrganisationList
    }
   
  }
  fetchAllModuleOrganization(){


    this.moduleOrganizationService.findAll(new ModuleOrganization(),this.lazyloadevent).subscribe(res=>{
      this.selectedModuleOrganizationList=res.content
      // console.log(  this.selectedModuleOrganizationList);
      
      // this.setActiveAndExpiredValue(this.selectedModuleOrganizationList)
      this.compassActive=0
    this.compassExpired=0
    this.cybercompassEvaluation=0
    this.cyberwatchEvaluation=0
    this.watchActive=0
    this.watchExpired=0
    this.intelActive=0
    this.intelExpired=0
    this.cyberintelEvaluation=0
    this.scanActive=0
    this.scanExpired=0
    this.cyberscanEvaluation=0
    this.analyticsActive=0
    this.analyticsExpired=0

    this.cybergazeActive=0
    this.cybergazeExpired=0
    this.cybergazeEvaluation=0
    this.huntActive=0
    this.huntExpired=0
    this.cyberhuntEvaluation=0
      this.selectedModuleOrganizationList.forEach(ele=>{
        this.setStatusTop(ele);
      })
      
    },error=>this.messageService.error("Error in fetching organizations","Cybernext"))

   
    
  }
  setActiveAndExpiredValue(selectedModuleOrganizationList:ModuleOrganization[]){
    this.expiredSubscriptions=0
    this.activeSubscription=0
    this.recentlyExpiredSubscriptions=0
    
    selectedModuleOrganizationList.forEach(element => {
   
      
      if(this.minDate>element.enddate){
        this.expiredSubscriptions++
        if(this.dayDiff(this.minDate,element.enddate)<=30){
          this.recentlyExpiredSubscriptions++
        }
      }
      else{
        this.activeSubscription++
       
        
      }
      

    });
  }

  dayDiff(d1:Date, d2:Date)
  {
    var diff = Math.abs(d1.getTime() - new Date(d2).getTime());
    var diffDays = Math.ceil(diff / (1000 * 3600 * 24)); 
    return diffDays;
  }
  goToCreateOrg(){
    this.isCreateOrg=true
    this.isOrg=false
    console.log(this.orgToEdit);
   
  }
  goToDashboard(){
    this.isCreateOrg=false
    this.isOrg=false
    // this.fetchOrganisations()
    this.orgDateSortStatus=''
    this.orgIdSortStatus=''
    this.orgNameSortStatus=''
    this.orgToEdit=undefined
    this.computeOrganisationList()
    this.fetchAllModuleOrganization();
  }

  onGoBack(back:boolean){
    
    
    this.isCreateOrg=back
    this.isOrg=back
    this.orgToEdit=false
    // this.fetchOrganisations()
    this.orgToEdit=undefined
    this.orgDateSortStatus=''
    this.orgIdSortStatus=''
    this.orgNameSortStatus=''
    this.computeOrganisationList()
    this.fetchAllModuleOrganization()
  }
  selectOrg(org:OrgProject){
    this.isOrg=true
    this.selectedOrganisation=org;
    
    
  }
  fetchModuleArray(){
    
    this.moduleService.findAll(new UsmModules,this.lazyloadevent).subscribe(res=>{
      this.moduleObjectArray=res.content
  
    this.moduleObjectArray.forEach(ele=>{
      this.filteredModuleList.push(ele.name.toLowerCase())
    })
    }
    , error => {
      this.messageService.error(error,"CyberNext")
    }
    )

  
   
   
  }
  fetchOrganisations(){
    this.isOrg=false
    this.currentOrganisation=JSON.parse(sessionStorage.getItem("project"))
    this.busy=this.organisationService.findAll(new OrgProject(),this.lazyloadevent).subscribe(res=>{
    
    this.organizationList=res.content
    this.fetchAllModuleOrganization() 
   this.newOrganisationList=this.organizationList
    
   });
  
    
  }
  deleteOrg(org){
    // this.organisationService.delete(id).subscribe(res=>{
    //   this.computeOrganisationList()
    //   this.fetchAllModuleOrganization()
    //   this.messageService.info("Deleting organization","CyberNext")

    // }, error => this.messageService.error(error,"CyberNext"))
    
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      data: {
        title: 'Delete',
        message: 'Organization will be deleted permanently.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
       this.organisationService.delete(org.id).subscribe(res=>{
        this.computeOrganisationList()
        this.fetchAllModuleOrganization()
        this.messageService.info("Deleting organization","Cyber Central")
        this.addAuditEntry(org.name +" organizations deleted",org.name)

      }, error => this.messageService.error(error,"Cyber Central"))
      }
    }, error => this.messageService.error("Error while deletion"," Cyber Central"));
  }
  computeOrganisationList(){
    
    this.organisationService.findAll(new OrgProject(),this.lazyloadevent).subscribe(res=>{

      this.organizationList=res.content
      // this.fetchAllModuleOrganization() 
     
      this.busy= this.moduleOrganizationService.findAll(new ModuleOrganization(),this.lazyloadevent).subscribe(res=>{
        this.selectedModuleOrganizationList=res.content
       
        this.setActiveAndExpiredValue(this.selectedModuleOrganizationList)
        
        this.organizationList.forEach((ele,index)=>{
        
          //Timezone change
          if (ele.lastUpdated != null && ele.lastUpdated != undefined) {
            let uploadSeconds: any = ele.lastUpdated.toString();
            uploadSeconds = +uploadSeconds * 1000 - 19800000;
            uploadSeconds = moment(uploadSeconds).format();
            ele.lastUpdated = uploadSeconds;
          }

          let temp=new Date(ele.lastUpdated).toString()
          if(temp.includes('-')){
            ele.lastUpdated=moment(ele.lastUpdated ).add(1,'days').toDate();
            
          }
          
          this.organizationList[index]["Modules"]=[]
          this.organizationList[index]["ModulesOrg"]=[]
          this.organizationList[index]["Groups"]=[]
          this.organizationList[index]["User"]=[]
          
          let tempList:any[]=[]
          let tempListmoduleOrg:any[]=[]
          this.resetStatus()
     
          this.selectedModuleOrganizationList.forEach(moduleOrg=>{
          
            if(moduleOrg.organisation.name==ele.name){
              tempList.push(moduleOrg.module)
              tempListmoduleOrg.push(moduleOrg)
              this.setStatus(moduleOrg);
            }
            ;
            
          })
 
         
          
      let domainArray=[]
      domainArray.push(JSON.parse(this.organizationList[index].domainName))
      this.organizationList[index]['domain']=JSON.parse(this.organizationList[index].domainName)
      let tempDomain=""
      if(JSON.parse(this.organizationList[index].domainName)){
        JSON.parse(this.organizationList[index].domainName).forEach(element => {
          tempDomain=tempDomain+element+","
        });
        if(tempDomain.length>0){
          tempDomain=tempDomain.substring(0,tempDomain.length-1)
        }
        this.organizationList[index]['domainString']=tempDomain
      }
     
      this.organizationList[index]["Modules"]=tempList
      this.organizationList[index]["ModulesOrg"]=tempListmoduleOrg
      
      this.organizationList[index]['cybergazeStatus']=this.cybergazeStatus
      this.organizationList[index]['cybercompassStatus']=this.cybercompassStatus
      this.organizationList[index]['cyberhuntStatus']=this.cyberhuntStatus
      this.organizationList[index]['cyberwatchStatus']=this.cyberwatchStatus
      this.organizationList[index]['cyberanalyticsStatus']=this.cyberanalyticsStatus
      this.organizationList[index]['cyberscanStatus']=this.cyberscanStatus
      this.organizationList[index]['Active']=this.active
      this.organizationList[index]['Expired']=this.expired
      this.organizationList[index]['Evaluation']=this.evaluation
      this.expired=0
      this.active=0
      this.evaluation=0
   
        

    })
   
   let role=new Role()
   role.projectId=null
   
  this.busy= this.roleService.findAll(role,this.lazyloadevent).subscribe(res=>{
    this.roleList=res.content
    // console.log(this.roleList);
    console.log(this.organizationList);
    
    this.organizationList.forEach((ele,index)=>{
      let tempList2=[]
      let tempList3=[]
      let tempRoleIdList=[]
    this.roleList.forEach(role=>{
      // console.log(role.projectId==ele.id);
      
      if(role.projectId==ele.id){
        // console.log(tempList2.includes(role.id));
        
        if(tempRoleIdList.indexOf(role.id)==-1){
          tempList2.push(role)
          tempRoleIdList.push(role.id)
        }
      
         tempList3.push(role) 
  
      }
    })
    this.organizationList[index]["Groups"]=tempList2
    this.organizationList[index]["User"]=tempList3
  })
 

  
  })
    
  console.log(this.organizationList);
    this.search("")
  
        
      },error=>this.messageService.error("Error in fetching organizations","Cybernext"))
  
      
     });
    
   
    
  }
  resetStatus(){
    this.cybergazeStatus=[]
    this.cybercompassStatus=[]
    this.cyberhuntStatus=[]
    this.cyberwatchStatus=[]
    this.cyberanalyticsStatus=[]
    this.cyberscanStatus=[]
    

    
  }
  setStatusTop(moduleOrg){
    //Timezone change
    let temp=new Date(moduleOrg.enddate).toString()
    if(temp.includes('-')){
      moduleOrg.enddate=moment(moduleOrg.enddate).add(1,'days').toDate();
      moduleOrg.startdate=moment(moduleOrg.startdate).add(1,'days').toDate();
    }
    
    if( moduleOrg.subscription=="Evaluation" &&  this.getProgress(moduleOrg.enddate)>=0){
      
      if(moduleOrg.module.name=="Cyber Gaze"){
        this.cybergazeStatus.push("Evaluation")
        
        this.cybergazeEvaluation++
      }
      else  if(moduleOrg.module.name=="Cyber Compass"){
        this.cybercompassStatus.push("Evaluation")
        this.cybercompassEvaluation++
      }
      else  if(moduleOrg.module.name=="Cyber Intel"){
        this.cyberintelStatus.push("Evaluation")
        this.cyberintelEvaluation++
      }else  if(moduleOrg.module.name=="Cyber Hunt"){
        this.cyberhuntStatus.push("Evaluation")
        this.cyberhuntEvaluation++
      }else  if(moduleOrg.module.name=="Cyber Watch"){
        this.cyberwatchStatus.push("Evaluation")
        this.cyberwatchStatus.push(moduleOrg.startdate)
        this.cyberwatchStatus.push(moduleOrg.enddate)
        
        this.cyberwatchEvaluation++
      }else  if(moduleOrg.module.name=="Cyber Scan"){
        this.cyberscanStatus.push("Evaluation")
        this.cyberscanEvaluation++
      }
      
      
    }
    else{
      
    if(moduleOrg.module.name=="Cyber Gaze" && this.getProgress(moduleOrg.enddate)<0){
      this.cybergazeStatus.push("Expired")
  
      this.cybergazeExpired++
    }
    else if(moduleOrg.module.name=="Cyber Gaze" && this.getProgress(moduleOrg.enddate)>=0){
      this.cybergazeStatus.push("Active")
    
      this.cybergazeActive++
    }
    if(moduleOrg.module.name=="Cyber Compass" && this.getProgress(moduleOrg.enddate)<0){
     
      this.cybercompassStatus.push("Expired")
  
      this.compassExpired++
    }
    else if(moduleOrg.module.name=="Cyber Compass" &&this.getProgress(moduleOrg.enddate)>=0){
      this.cybercompassStatus.push("Active")
 
      this.compassActive++
    }
    if(moduleOrg.module.name=="Cyber Hunt" && this.getProgress(moduleOrg.enddate)<0){
      this.cyberhuntStatus.push("Expired")

      this.huntExpired++
    }
    else if(moduleOrg.module.name=="Cyber Hunt" && this.getProgress(moduleOrg.enddate)>=0){
      this.cyberhuntStatus.push("Active")
  
      this.huntActive++
    }
    if(moduleOrg.module.name=="Cyber Watch" && this.getProgress(moduleOrg.enddate)<0){
      this.cyberwatchStatus.push("Expired")
      this.cyberwatchStatus.push(moduleOrg.startdate)
      this.cyberwatchStatus.push(moduleOrg.enddate)

      this.watchExpired++
    }
    else if(moduleOrg.module.name=="Cyber Watch" && this.getProgress(moduleOrg.enddate)>=0){
      this.cyberwatchStatus.push("Active")
       this.cyberwatchStatus.push(moduleOrg.startdate)
      this.cyberwatchStatus.push(moduleOrg.enddate)
      this.watchActive++
    }
    if(moduleOrg.module.name=="Cyber Analytics" && this.getProgress(moduleOrg.enddate)<0){
      this.cyberanalyticsStatus.push("Expired")
    
      this.analyticsExpired++
    }
    else if(moduleOrg.module.name=="Cyber Analytics" && this.getProgress(moduleOrg.enddate)>=0){
      this.cyberanalyticsStatus.push("Active")
 
      this.analyticsActive++

    }
    if(moduleOrg.module.name=="Cyber Scan" && this.getProgress(moduleOrg.enddate)<0){
      this.cyberscanStatus.push("Expired")
   
      this.scanExpired++
    }
    else if(moduleOrg.module.name=="Cyber Scan" && this.getProgress(moduleOrg.enddate)>=0){
      this.cyberscanStatus.push("Active")
     
      this.scanActive++
    }
    if(moduleOrg.module.name=="Cyber Intel" && this.getProgress(moduleOrg.enddate)<0){
      this.cyberintelStatus.push("Expired")
      
      this.intelExpired++
    }
    else if(moduleOrg.module.name=="Cyber Intel" &&this.getProgress(moduleOrg.enddate)>=0){
      this.cyberintelStatus.push("Active")
      
      this.intelActive++
    }

    }
   

  }
  switchTableView(value){
    this.isTableView=value
  }
  getProgress(enddate ):any{
    enddate=new Date(enddate)
    // startdate=new Date(startdate)
   let  minDate=new Date()
    let n=Math.floor((Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate()) - Date.UTC(minDate.getFullYear(),minDate.getMonth(), minDate.getDate()) ) /(1000 * 60 * 60 * 24));
   return n;
    // if(n>=0)
    //  return Math.floor((Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate()) - Date.UTC(startdate.getFullYear(),startdate.getMonth(), startdate.getDate()) ) /(1000 * 60 * 60 * 24));
    // else{
    //  return Math.floor((Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate()) - Date.UTC(minDate.getFullYear(),minDate.getMonth(), minDate.getDate()) ) /(1000 * 60 * 60 * 24));
    // }
 }
  setStatus(moduleOrg){
    //Timezone change
    let temp=new Date(moduleOrg.enddate).toString()
    if(temp.includes('-')){
      moduleOrg.enddate=moment(moduleOrg.enddate).add(1,'days').toDate();
      moduleOrg.startdate=moment(moduleOrg.startdate).add(1,'days').toDate();
    }
    if( moduleOrg.subscription=="Evaluation" && this.getProgress(moduleOrg.enddate)>=0){
      this.evaluation++
       
      if(moduleOrg.module.name=="Cyber Gaze"){
        this.cybergazeStatus.push("Evaluation")
       
      }
      else  if(moduleOrg.module.name=="Cyber Compass"){
        this.cybercompassStatus.push("Evaluation")
        this.cybercompassStatus.push(moduleOrg.startdate)
        this.cybercompassStatus.push(moduleOrg.enddate)
      }
      else  if(moduleOrg.module.name=="Cyber Intel"){
        this.cyberintelStatus.push("Evaluation")
   
      }else  if(moduleOrg.module.name=="Cyber Hunt"){
        this.cyberhuntStatus.push("Evaluation")
        
      }else  if(moduleOrg.module.name=="Cyber Watch"){
        this.cyberwatchStatus.push("Evaluation")
        this.cyberwatchStatus.push(moduleOrg.startdate)
        this.cyberwatchStatus.push(moduleOrg.enddate)
        
      }else  if(moduleOrg.module.name=="Cyber Scan"){
        this.cyberscanStatus.push("Evaluation")
        
      }
    }
    else{
      
    if(moduleOrg.module.name=="Cyber Gaze"  && this.getProgress(moduleOrg.enddate)<0){
      this.cybergazeStatus.push("Expired")
      this.expired++
      
    }
    else if(moduleOrg.module.name=="Cyber Gaze" && this.getProgress(moduleOrg.enddate)>=0){
      this.cybergazeStatus.push("Active")
      this.active++
      
    }
    if(moduleOrg.module.name=="Cyber Compass"  && this.getProgress(moduleOrg.enddate)<0){
     
      this.cybercompassStatus.push("Expired")
      this.cybercompassStatus.push(moduleOrg.startdate)
      this.cybercompassStatus.push(moduleOrg.enddate)
      this.expired++
     
    }
    else if(moduleOrg.module.name=="Cyber Compass"  && this.getProgress(moduleOrg.enddate)>=0){
      this.cybercompassStatus.push("Active")
      this.cybercompassStatus.push(moduleOrg.startdate)
      this.cybercompassStatus.push(moduleOrg.enddate)
      this.active++
     
    }
    if(moduleOrg.module.name=="Cyber Hunt"  && this.getProgress(moduleOrg.enddate)<0){
      this.cyberhuntStatus.push("Expired")
      this.expired++
     
    }
    else if(moduleOrg.module.name=="Cyber Hunt"  && this.getProgress(moduleOrg.enddate)>=0){
      this.cyberhuntStatus.push("Active")
      this.active++
     
    }
    if(moduleOrg.module.name=="Cyber Watch" && this.getProgress(moduleOrg.enddate)<0){
      this.cyberwatchStatus.push("Expired")
      this.cyberwatchStatus.push(moduleOrg.startdate)
      this.cyberwatchStatus.push(moduleOrg.enddate)
     
      this.expired++
     
    }
    else if(moduleOrg.module.name=="Cyber Watch" && this.getProgress(moduleOrg.enddate)>=0){
      this.cyberwatchStatus.push("Active")
      this.cyberwatchStatus.push(moduleOrg.startdate)
      this.cyberwatchStatus.push(moduleOrg.enddate)
     
      this.active++
      
    }
    if(moduleOrg.module.name=="Cyber Analytics" && this.getProgress(moduleOrg.enddate)<0){
      this.cyberanalyticsStatus.push("Expired")
      this.expired++
     
    }
    else if(moduleOrg.module.name=="Cyber Analytics" && this.getProgress(moduleOrg.enddate)>=0){
      this.cyberanalyticsStatus.push("Active")
      this.active++
     
    }
    if(moduleOrg.module.name=="Cyber Scan"  && this.getProgress(moduleOrg.enddate)<0){
      this.cyberscanStatus.push("Expired")
      this.expired++
     
    }
    else if(moduleOrg.module.name=="Cyber Scan" && this.getProgress(moduleOrg.enddate)>=0){
      this.cyberscanStatus.push("Active")
      this.active++
      
    }
    if(moduleOrg.module.name=="Cyber Intel"  && this.getProgress(moduleOrg.enddate)<0){
      this.cyberintelStatus.push("Expired")
      this.expired++
     
    }
    else if(moduleOrg.module.name=="Cyber Intel"  && this.getProgress(moduleOrg.enddate)>=0){
      this.cyberintelStatus.push("Active")
      this.active++
      
    }

    }
    


  }
  fetchParticularOrganisations(org:OrgProject){
    this.isOrg=true
    this.busy=this.organisationService.findAll(new OrgProject(),this.lazyloadevent).subscribe(res=>{

    this.organizationList=res.content

    this.organizationListString=JSON.stringify(this.organizationList);

   });
    
  }



}
