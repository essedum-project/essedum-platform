import { Component } from '@angular/core';
import { Services } from '../services/service';

import { MatDialog } from '@angular/material/dialog';
import { ReplaySubject, Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { OptionsDTO } from '../DTO/OptionsDTO';
import { saveAs as importedSaveAs } from "file-saver";
import { JSONPath } from 'jsonpath-plus';
import { DatasourceConfigComponent } from '../datasource/datasource-config/datasource-config.component';

@Component({
  selector: 'app-copy-pipelines',
  templateUrl: './copy-pipelines.component.html',
  styleUrls: ['./copy-pipelines.component.scss']
})
export class CopyPipelinesComponent {
  
  type: string = "secondary";
  headerBg: string = "transparent";
  filteredPipelines: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredPipelines1: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  pipelines: any[];
  pipelines1: any[];
  pipelineAlias: any[];
  pipelineAlias1: any[];
  
  pipelineAlias2:  any = [];
  pipelineAlias3:  any = [];

  projects: any;
  projects1: any = [];
  pipelineService: any;
  create: boolean = false;
  pp: Object[] = [];
  ppp:Object[] = [];

  pp1: Object[] = [];
  ppp1: Object[] = [];

  check: boolean = false;
  check1: boolean = false;
  import : boolean = false
  selectedPipelines10:any=[];
  selectedPipelines20:any=[];
  project: any;
 
  projectId: any;
  selectedPipelines = new FormControl();
  selectedPipelines1 = new FormControl();
  finalPipelines: any = [];
  finalPipelines1: any = [];
  selectedProject: any
  tableData = []
  // selectedProducts3: any
  importedFile: File
  pipelinesImport: any[];
  errormessage = ""
 
  pointerevent: string = "auto";
  busy: Subscription;
  constructor(

    private services: Services,
    private dialog: MatDialog) {
      this.selectedPipelines.setValue([])

  }
  ngOnInit() {
    this.pp = [];
    this.ppp = [];
    this.ppp1=[];
    this.pp1=[];
    this.fetchPipelines();
    this.fetchProject();
    this.fetchProject1();
    // this.fetchPipelines1();


  }

  fetchProject() {
    this.services.getProjectNames().subscribe(res => {
      this.projects = res;
      this.projects.sort((a: { toLowerCase: () => number; }, b: { toLowerCase: () => number; }) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
      let index = this.projects.indexOf(sessionStorage.getItem("organization"));
      this.projects.splice(index, 1)
      console.log("value of projects is:", this.projects);
      this.projects.forEach((cat: any) => {
        this.ppp.push(cat);
        let ss = {
          viewValue: cat,
          value: cat
        };

        this.pp.push(ss);
      })
  console.log("ppp value:",this.ppp);
    })


  }
  fetchProject1(){
    this.services.getProjectNames().subscribe(res => {
      this.projects1 = res;
      this.projects1.sort((a: { toLowerCase: () => number; }, b: { toLowerCase: () => number; }) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
     
      console.log("value of projects is:", this.projects1);
      this.projects1.forEach((cat: any) => {
        this.ppp1.push(cat);
        let ss = {
          viewValue: cat,
          value: cat
        };

        this.pp1.push(ss);
      })

    })

  }
  

  fetchPipelines() {
    this.services.getPipelineNames(sessionStorage.getItem('organization')).subscribe(res => {
      this.pipelines = res;
      console.log("resp is:",res);
      this.filteredPipelines.next(this.pipelines.slice());
      res.forEach((ele: { alias: any; name: any; })=> {
       
        this.pipelineAlias2.push(new OptionsDTO(ele.alias, ele.name));
      });
      // console.log("pipeline value is:", this.pipelines);
      // console.log("filtereedpipeline value is:", this.filteredPipelines);
      this.pipelineAlias = this.pipelines.map((pipeline) => pipeline.alias);
      // // console.log("valude of pipelineAlias is",this.pipelineAlias);
      // this.pipelineAlias.forEach((cat) => {
      //   let ss = {
      //     viewValue: cat,
      //     value: cat
      //   };

      //   this.pipelineAlias2.push(ss);
      // })

    })




  }
  fetchPipelines1(){ this.services.getPipelineNames(this.selectedProject).subscribe(res => {
    this.pipelines1 = res;
    this.filteredPipelines1.next(this.pipelines1.slice());
    res.forEach((ele: { alias: any; name: any; })=> {
     
      this.pipelineAlias3.push(new OptionsDTO(ele.alias, ele.name));
    });
    // console.log("pipeline value is:", this.pipelines);
    // console.log("filtereedpipeline value is:", this.filteredPipelines);
    this.pipelineAlias1 = this.pipelines1.map((pipeline) => pipeline.alias);
    // // console.log("valude of pipelineAlias is",this.pipelineAlias);
    // this.pipelineAlias.forEach((cat) => {
    //   let ss = {
    //     viewValue: cat,
    //     value: cat
    //   };

    //   this.pipelineAlias2.push(ss);
    // })

  })

  }
  // this.services.message("Created Successfully", 'success');
  // this.services.message('Please enter required details', 'error')
  onSave() {
    let pipeliness = []
    if(this.project == null){
      this.services.message('Select Project', 'error')
        return;

    }
    // console.log(this.selectedPipelines10);
    
    // console.log("selecteed piple is ",this.selectedPipelines);
    if (this.finalPipelines.length == 0) {
      if(this.selectedPipelines10){
        this.selectedPipelines10.forEach(element => {
          this.pipelineAlias2.forEach((val)=>{
            if(element==val.viewValue){
              pipeliness.push(val.value)
            }
          })
          
        });
        console.log("value of pipelines si:",pipeliness);
      }
        // if (this.selectedPipelines.value != null) {
        //     this.selectedPipelines.value.forEach((element: { name: any; }) => {
        //         pipeliness.push(element);
        //         console.log(element+"pipelinesssss");
                
        //     });
        //     this.pipelineAlias2.forEach((ele)=>{
        //       console.log(ele)
        //     })
        //     console.log("value of pipelines si:",pipeliness);
        // }
        else {
          this.services.message('Select Pipeline', 'error')
            return;
        }
    }
    else {
        pipeliness = this.finalPipelines;
    }

    this.copyPipelines(pipeliness);
    if(this.check!=false)
    {
      this.check=false;
    }

  }
  onExport(){
    let pipeliness = []
    console.log("value of seletc is",this.selectedPipelines1);
    console.log(this.selectedPipelines20);
    if (this.finalPipelines1.length == 0) {
      if(this.selectedPipelines20){
        this.selectedPipelines20.forEach(element => {
          this.pipelineAlias3.forEach((val)=>{
            if(element==val.viewValue){
              pipeliness.push(val.value)
            }
          })
          
        });
        // console.log("value of pipelines si:",pipeliness);
      }

        // if (this.selectedPipelines1.value != null) {
        //     this.selectedPipelines1.value.forEach((element: { name: any; }) => {
        //         pipeliness.push(element);
        //     });
       // }
        else {
            
            this.services.message('Please select Pipelines.', 'error')
            return;
        }
    }
    else {
        pipeliness = this.finalPipelines1;
    }

    this.exportPipelines(pipeliness);

  }
 
  copyPipelines(pipelines: any[]) {
    this.pointerevent = "none";
    this.busy = this.services.copyPipelines(sessionStorage.getItem('organization'), this.project, pipelines, this.projectId).subscribe(
        (res) => {
          this.services.message("Copy pipelines has started. Check the Job Status", 'success');
          
           
            this.pointerevent = "auto";
           
        },
        (error) => {
            if (error instanceof TypeError)
            this.services.message("Copy pipelines has already been done for this project", 'error');
            else if(error == "Scheduler Paused")
              this.services.message("Scheduler paused. Please resume and retrigger", "error");
            else  this.services.message('Copy pipelines failed', 'error') ;
              this.pointerevent = "auto";
        },
        () => {
            this.project = null
            this.finalPipelines = []
            this.selectedPipelines.setValue([])
            this.create = false;
        }
    );
}
  editPipelines() {
    this.check = !this.check;
    if (this.check) {
      this.pipelines.forEach((pipeline: { name: any; }) => this.finalPipelines.push(pipeline.name))
      this.selectedPipelines.setValue([]);
    }
    else {
      this.finalPipelines = [];
    }

  }
  editPipelines1() {
    this.check1 = !this.check1
    if (this.check1) {
        this.pipelines1.forEach((pipeline: { name: any; }) => this.finalPipelines1.push(pipeline.name))
        this.selectedPipelines1.setValue([]);
    }
    else {
        this.finalPipelines1 = [];
    }
}
  OnProjectChange(event: any) {
  this.selectedPipelines = new FormControl();
  
    
    this.project = event.option.value;
    // console.log("value of project is",this.project);
    this.services.getProjectByName(this.project).subscribe(res => {
      this.projectId = res.id
      console.log("value of projectid is",this.projectId);
    })
  }
  cancel(){
    this.create = false;
    if(this.check!=false)
      {
        this.check=false;
      }
      console.log('value of check is',this.check);
  }
  OnProjectChange1(event:any){
  
    this.  selectedPipelines1 = new FormControl();
   
    this.selectedProject = event.option.value;
    // console.log("value of event is",event);
    // console.log("value of event is",this.selectedProject);
   this.fetchPipelines1();
    this.services.getPipelineNames(event).subscribe(res => {
        this.pipelines1 = res;
        this.filteredPipelines1.next(this.pipelines1.slice());
    })

  }

  
  exportPipelines(pipelines: any[]) {
    try{
        let fileBlob: any;
        let pipeliness: BlobPart
        this.busy = this.services.exportPipelines(this.selectedProject, pipelines).subscribe(
            (res) => {
               
                pipeliness = JSON.stringify(res)
                if (res && this) {
                    fileBlob = new Blob([pipeliness], { type: "json" });
                    importedSaveAs(fileBlob, "pipelines.json");
                }
            },
            (error) => { }
        );
    }
    catch(Exception){
    console.log("expection is",Exception);
    this.services.message('Some error occured', 'error')
    
    }

}
addfile(event: { target: { files: File[]; }; }) {
  if (event.target.files[0].name.endsWith(".csv") || event.target.files[0].name.endsWith(".xlsx")
  || event.target.files[0].name.endsWith(".json")) {
  this.tableData = []
  this.importedFile = event.target.files[0];
  this.readJson(this.importedFile)
  } else
      this.services.message('File format not supported.', 'error');
}


readJson(file1: Blob) {
  try{
      this.tableData = []
      const reader = new FileReader();
      reader.onload = (e) => {
          try{
              this.errormessage = ""
              this.pipelinesImport = JSON.parse(JSON.parse(reader.result.toString().trim()).pipelines);
          }
          catch(error){
              this.errormessage = "Uploaded file is invalid"
          }
          this.pipelinesImport.forEach((ele: { jsonContent: string; alias: any; type: any; }) => {
              let datasources = JSONPath({ path: '$..datasource', json: JSON.parse(ele.jsonContent) })
              datasources = [...new Map(datasources.map((item: any) => [JSON.stringify(item), item])).values()];
              let dsrc = []
              datasources.forEach((ele: { name: any; }) => {
                  if(dsrc.findIndex(x => x.name === ele.name) < 0) dsrc.push(ele)
              });
              let content = {}
              content["name"] = ele.alias
              content["type"] = ele.type
              content["datasource"] = dsrc
              this.tableData.push(content)
          });
          if(this.tableData.length < 0 ) this.errormessage = "No pipelines found"
      }
      reader.readAsText(file1)
      console.log("tabel data is",this.tableData);
  }
  catch(Exception){
  this.services.message('Some error occured', 'error')
  }
}
 save(){
  let formData = new FormData();
  formData.append('file', this.importedFile);
  this.services.importPipelines(formData).subscribe(res => {
      this.import = false
      this.services.message("Importing", 'success');
  },err=>{
    if(err == "Scheduler Paused")
      this.services.message("Scheduler paused. Please resume and retrigger", "error");
    else
      this.services.message('Some Error occured ', 'error')
  })
 }
 saveDatasource(data) {
  console.log("data is :",data);
  // try{   
  //     let model = {alias:"",name:"",description:"",organization:""}
  //     model.alias = data.alias
  //     model.name = data.name
  //     model.description = "imported"
  //     model.organization = sessionStorage.getItem('organization')
  //     const dialogRef = this.dialog.open(DatasourceConfigComponent, {
  //         width: "60%",
  //         height: "90%",
  //         disableClose: true,
  //         data: JSON.parse(JSON.stringify(model)),
  //     });
  //     dialogRef.afterClosed().subscribe((result) => {
  //     });
  // }
  // catch(Exception: any){
  //  this.services.message('Some error occured', 'error')
  // }

}
}


// this.services.message("Created Successfully", 'success');
  // this.services.message('Please enter required details', 'error')