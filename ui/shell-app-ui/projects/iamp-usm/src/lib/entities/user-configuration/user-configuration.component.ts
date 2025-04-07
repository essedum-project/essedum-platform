import { Component, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';
import { OrgProject } from '../../models/OrgProject';
import { Role } from '../../models/role';
import { UserProjectRole } from '../../models/user-project-role';
import { Users } from '../../models/users';
import { MessageService } from '../../services/message.service';
import { OrganisationService } from '../../services/organisation.service';
import { RoleConfigurationService } from '../../services/role-configuration.service';
import { UserConfigurationService } from '../../services/user-configuration.service';
import { UserOrganizationRoleService } from '../../services/user-organization-role.service';
import { UserProjectRoleService } from '../../services/user-project-role.service';
import { UsersService } from '../../services/users.service';


@Component({
  selector: 'app-user-configuration',
  templateUrl: './user-configuration.component.html',
  styleUrls: ['./user-configuration.component.css']
})
export class UserConfigurationComponent implements OnInit {
  busy:Subscription;
  exampleUser:Users
  lazyloadevent = {
    first: 0,
    rows: 3000,
    sortField: null,
    sortOrder: 1,
    filters: null,
    multiSortMeta: null,
  };
  userList: Users[];
  user:Users=new Users();
  isEdit:Boolean=false
  userMapping: UserProjectRole=new UserProjectRole();
  userMappingList: UserProjectRole[];
  anyUserUpdated: boolean=false;
  roleList: Role[];
  currentOrganisation: any;
  organizationList: OrgProject[];
  selectedRoleList:Role[]=[]
  tempUser: Users;
  domainList: any;
  selectedDomain:string='';
  fiteredRoleList: any[];
  userSaved: boolean;
  userOrg:OrgProject;
  userMappingArray:UserProjectRole[]=[]
  filteredOrganisationList: OrgProject[];
  roleListList: any[][]=[];
  filteredUserList: Users[];
  userInfyFilter:string;
  userCustFilter:string;
  page = 1;
  page_extended = 1;
  custpage_extented=1
  pageSize=10
  custPageSize=10
  pageSizeArray=[10,20,50,100]
  customerUserList: any[]=[];
  infosysUserList: any[]=[];
  filteredCustomerUserList: Users[];
  filteredInfosysUserList: Users[];
  tabIndex=0
  allUserMappingList: UserProjectRole[];
  isDbLogin: boolean;
  
  constructor(private userConfigService:UserConfigurationService,
    private usersService:UsersService,
    private messageService: MessageService,
    private userOrganisationRoleService:UserOrganizationRoleService,
    private userProjectRoleService:UserProjectRoleService,
    private roleService:RoleConfigurationService,
    private organisationService:OrganisationService ) { }

  ngOnInit() {
    
    this.findAllUsers();
    this.fetchOrganisations();
    
    this.userMappingArray.push(new UserProjectRole())
  }
  
  getCustPageNo(current: number) {
    let tempList=[]
    this.filteredCustomerUserList.forEach((ele,index)=>{
      tempList.push((index+1).toString())
    })
    
    
  return tempList[current - 1];
  }
  getInfyPageNo(current: number) {
    let tempList=[]
    this.filteredInfosysUserList.forEach((ele,index)=>{
      tempList.push((index+1).toString())
    })
    
  
  return tempList[current - 1];
  }

  setPageSize(pageSize:number){
    if(pageSize){
      this.pageSize=pageSize
    }
   
    
  }
  setCustPageSize(pageSize){
    
    this.custPageSize=pageSize
    
  }
  setCustPageNo(pageNo){
    if(pageNo){
      this.custpage_extented=pageNo
    }
    
  }
  setinfPageNo(pageNo){
    if(pageNo){
      this.page_extended=pageNo
    }
   
  }
  searchCustomerUserList(userFilter){
    console.log(userFilter);
    
    this.filteredUserList=[]
    if(userFilter=="" ||userFilter==undefined){
      this.filteredCustomerUserList=this.customerUserList
    }
    else{
      this.filteredCustomerUserList=this.customerUserList.filter(user=>{
        return (user.user_f_name.toLowerCase().includes(userFilter.toLowerCase()) || user.user_email.toLowerCase().includes(userFilter.toLowerCase())
        || JSON.stringify(user.Groups).toLowerCase().includes(userFilter.toLowerCase()))
      }
    )
    }
   
  }
  searchInfosysUserList(userFilter){
    
    console.log(userFilter);
    
    this.filteredUserList=[]
    if(userFilter=="" ||userFilter==undefined){
      this.filteredInfosysUserList=this.infosysUserList
    }
    else{
      this.filteredInfosysUserList=this.infosysUserList.filter(user=>{
        return (user.user_f_name.toLowerCase().includes(userFilter.toLowerCase()) || user.user_email.toLowerCase().includes(userFilter.toLowerCase())
        || JSON.stringify(user.Groups).toLowerCase().includes(userFilter.toLowerCase()))
      }
    )
    }
   
  }
  inc(){
    this.userMappingArray.push(new UserProjectRole())
  }
  dec(i:number){
   
    
    this.userMappingArray.splice(i,1)
    this.userMappingArray.pop()

  }
  findAllUsers(){
    this.customerUserList=[]
    this.infosysUserList=[]
    this.exampleUser=new Users();
    this.busy=this.usersService.findAll(this.exampleUser,this.lazyloadevent).subscribe(res=>{
      

      let activeProfiles=false
      if(JSON.parse(sessionStorage.getItem('activeProfiles')).includes("dbjwt")){
        this.userList=res.content
      this.computeUsers(this.userList)
        this.fetchAllUserMappings();
        this.isDbLogin=true
      }else{
        this.isDbLogin=false
        this.customerUserList=[]
        this.infosysUserList=[]
        this.fetchAllAzureUser();
      }
      
    }, error => this.messageService.error("Error in fetching users","CyberNext"))

  }

  computeUsers(userList:any[]){

    userList.forEach(ele=>{
     let domain=ele.user_email.split("@")
      if(domain[1]=="infosys.com"){
        this.infosysUserList.push(ele)
      }
      else{
        this.customerUserList.push(ele)
      }
    })
     
    this.searchCustomerUserList("")
    this.searchInfosysUserList("")
  }
  computeAzureUser(azureUserList:any){
    azureUserList.forEach(ele=>{
      let tempUser=new Users()
      tempUser.user_f_name=ele.displayName
      tempUser.user_login=ele.displayName
      tempUser.user_email=ele.email

      let role=[];
      if(ele.roles){
        
        ele.roles.forEach(element => {      
       role.push(element)
        });
        
        
      }
      tempUser["Groups"]=role;
        // console.log(role);
        console.log(tempUser["Groups"]);
    //  tempUser["Groups"]=ele.roles
    
     

    
      let domain=tempUser.user_email.split("@")
      if(domain[1]=="infosys.com"){
        this.infosysUserList.push(tempUser)
      }
      else{
        this.customerUserList.push(tempUser)
      }
      
    })
    
    
    this.searchCustomerUserList("")
    this.searchInfosysUserList("")

    // this.fetchAllUserMappings()

  }
  fetchRolesForProject(id,index){

    let exampleRole=new Role()
    exampleRole.projectId=id
    
    this.busy=this.roleService.findAll(exampleRole,this.lazyloadevent).subscribe(res=>{
      
      this.roleList=res.content
      this.fiteredRoleList=this.roleList
      this.filterRole()

      this.roleListList[index]=this.fiteredRoleList
    })
    
  }

  filterRole(){
  //  let orgList= this.fetchOneOrganisations(org);
    this.userMappingList.forEach(mapping => {
      this.roleList.forEach((role,index) => {
        if(mapping.role_id.id==role.id){
          this.fiteredRoleList.splice(index,1)
        }
      });
  });
  if(this.userMappingArray.length>0)
    this.userMappingArray.forEach(mapping => {
      this.roleList.forEach((role,index) => {
        if(mapping.role_id && mapping.role_id.id==role.id){
          this.fiteredRoleList.splice(index,1)
        }
      });
    });
  
  
  }
  fetchOrganisations(){
   
    this.currentOrganisation=JSON.parse(sessionStorage.getItem("project"))
    this.busy=this.organisationService.findAll(new OrgProject(),this.lazyloadevent).subscribe(res=>{

    this.organizationList=res.content
    

    this.filterOrganisationBasedOnDomains()
   
    
  
   });
    
  }

  fetchOneOrganisations(org){
   
    this.currentOrganisation=JSON.parse(sessionStorage.getItem("project"))
    this.busy=this.organisationService.findAll(org,this.lazyloadevent).subscribe(res=>{

    this.organizationList=res.content
    
   });
    
  }
  
  filterOrganisationBasedOnDomains(){
   
    
    if(this.tempUser)
      this.filteredOrganisationList=this.organizationList.filter(org=>{
        let domainList:any[]=JSON.parse(org.domainName)
      
        let domain=this.tempUser.user_email.split("@")[1]
        if(domainList)
          return domainList.includes(domain)
        else
          return false;

      })
  }
  getDomainList(org:OrgProject){
    if(org.domainName){
      this.domainList=JSON.parse(org.domainName)
      this.selectedDomain=this.domainList[0]
    }
    else{
      this.domainList=[]
    }
      
  }
  saveUser(user:Users){
    user.activated=true
    user.onboarded=true
    user.force_password_change=false
    user.user_act_ind=false

    // user.user_email=user.user_email+"@"+this.selectedDomain

    
    this.userConfigService.create(user).subscribe(res=>{
      this.messageService.info("New User Created ","CyberNext");
      this.findAllUsers()
      // this.user=new Users()
      this.domainList=[]
      // userMapping.user_id=res
      // this.saveMapping(userMapping)
      this.userSaved=true
      this.tempUser=res
      this.fetchOrganisations()
      this.fetchUserMappings(this.tempUser)
    }, error => this.messageService.error(error,"CyberNext"))
  }
  fetchUserMappings(user:Users){
  
    let userProjectRole=new UserProjectRole();
    userProjectRole.user_id=user
    this.busy= this.userProjectRoleService.findAll(userProjectRole,this.lazyloadevent).subscribe(res=>{
      this.userMappingList=res.content
      
    })
  }

  fetchAllUserMappings(){
  
    let userProjectRole=new UserProjectRole();
 
    this.busy= this.userProjectRoleService.findAll(userProjectRole,this.lazyloadevent).subscribe(res=>{
      this.allUserMappingList=res.content
      let tempCustUserList=[]
      this.customerUserList.forEach((ele,index)=>{

      // for the Azure user create the List of azureIdOfOrganisation of all org and the 
      this.customerUserList[index]["Org"]=[]
      this.customerUserList[index]["Groups"]=[]
      tempCustUserList.push(ele.user_email)
      })
      let tempInfyUserList=[]
      this.infosysUserList.forEach((ele,index)=>{
        this.infosysUserList[index]["Org"]=[]
        this.infosysUserList[index]["Groups"]=[]
        tempInfyUserList.push(ele.user_email)
      })
     
      this.allUserMappingList.forEach(mapping=>{
        if(tempInfyUserList.indexOf(mapping.user_id.user_email) !=-1){
          let index =tempInfyUserList.indexOf(mapping.user_id.user_email)
          this.infosysUserList[index]["Groups"].push(mapping.role_id.name)
        }
        else if(tempCustUserList.indexOf(mapping.user_id.user_email) !=-1){
          let index =tempCustUserList.indexOf(mapping.user_id.user_email)
          this.customerUserList[index]["Groups"].push(mapping.role_id.name)
        }
       
       })

       
       
    })

    console.log(this.customerUserList);
    
  }

  fetchAllAzureUser(){
    this.busy=this.userConfigService.getAzureUser().subscribe(res=>{
     this.computeAzureUser(res);
    }, error => this.messageService.error("Error in fetching Azure Users","Cyber Central")
    )
  }

  showEdit(user:Users){
    if(!this.isEdit){
      this.isEdit=true
      this.user=user
      this.tempUser=user
     
      this.fetchOrganisations()
      this.fetchUserMappings(user)
    }
    else{
      this.isEdit=false
      this.user=new Users()
    }

    this.tabIndex=3
  }
  cancelEdit(){
    if(!this.isEdit)
      this.isEdit=true
    else{
      this.isEdit=false
      this.user=new Users()
    }
    
    if(this.anyUserUpdated){
     this.findAllUsers()
    }
    this.anyUserUpdated=false
    this.userMappingArray=[]
    this.userMappingArray.push(new UserProjectRole)
  }
  updateUser(user:Users){
    this.userConfigService.update(user).subscribe(res=>{
      this.messageService.info("User Updated ","CyberNext");
      this.anyUserUpdated=true
      this.tempUser=this.user
      // userMapping.user_id=user
      // console.log(UserMapping);
      
      // this.saveMapping(userMapping)
    }, error => this.messageService.error(error,"Error while Updating User"))
  }
  saveMapping(userMappingArray:UserProjectRole[]){
   
   let mappingList=[]
   this.userMappingArray.forEach(mapping=>{
    mapping.user_id=this.tempUser
    mapping.portfolio_id=JSON.parse(sessionStorage.getItem('portfoliodata'))
    mappingList.push(mapping)
    
   })
 
  
    this.userOrganisationRoleService.createAll(mappingList).subscribe(res=>{
      this.messageService.info("Mapping Added Successfully ","CyberNext");
      // this.userMappingArray=[]
      // this.fetchUserMappings(this.user)
      this.findAllUsers()
    }, error => this.messageService.error(error,"CyberNext"))

   this.userSaved=false
   this.userMappingArray=[]
   this.isEdit=false
   this.user=new Users()
  }
  deleteMapping(userMapping:UserProjectRole){
    this.userOrganisationRoleService.delete(userMapping.id).subscribe(res=>{
      this.messageService.info("Mapping Deleted ","CyberNext");
      this.fetchUserMappings(this.user)
    }, error => this.messageService.error(error,"CyberNext"))
  }
  deleteUser(user:Users){
    this.userConfigService.delete(user.id).subscribe(res=>{
      this.messageService.info("User Deleted ","CyberNext");
      this.findAllUsers();
    }, error => this.messageService.error(error,"CyberNext"))
  }
}
