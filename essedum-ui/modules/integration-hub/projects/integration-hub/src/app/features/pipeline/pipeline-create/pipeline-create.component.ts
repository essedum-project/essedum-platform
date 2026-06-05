import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { StreamingServices } from '@essedum/shared-lib';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef,MatDialog } from '@angular/material/dialog';
import { Services, EventBusService } from '@essedum/shared-lib';
import { Router } from '@angular/router';

@Component({
    selector: 'app-pipeline-create',
    templateUrl: './pipeline-create.component.html',
    styleUrls: ['./pipeline-create.component.scss'],
    standalone: false
})
export class PipelineCreateComponent implements OnInit {
  @Output() responseLink = new EventEmitter<any>();
  @Output() modalClosed = new EventEmitter<void>();
  @Input() interfaceType: string = "pipeline";
  name = '';
  alias = '';
  description = '';
  groups: boolean = false
  type: any;
  ssTypes = ['DragAndDrop', 'DragNDropLite', 'Binary', 'NativeScript', 'Agents'];
  inputColumns = new FormControl('', Validators.required);
  selectedFile: File;
  importedJson: string;
  isAuth: any = false;
  fileData: any = {
    'agenttype': '',
    'filetype': 'Python3',
    'files': [],
    'config': []
  };
  @Input('dataset') matData: any;
  plugins = []
  options = []
  isTemplate: boolean = false
  edit: boolean = false
  script: any[] = [];
  errFlag: boolean = false;
  fetchOrg: string;

  constructor(
    public dialogRef: MatDialogRef<PipelineCreateComponent>,
    public dialog: MatDialog,
    private Services: Services,
    private router: Router,
    private eventBus: EventBusService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    dialogRef.disableClose = true;
  }


  ngOnInit() {
    this.authentications();
    if (this.data) {
      if (this.data.type) {
        this.type = this.data.type;
      }
      if (this.data.interfacetype) {
        this.interfaceType = this.data.interfacetype;
      }
      if (this.data.edit) {
        this.edit = this.data.edit
      }
      if (this.data) {
        if (this.data.canvasData) {
          if (this.data.canvasData.is_template) {
            this.isTemplate = true;
          }
          if (this.data.canvasData.type) {
            this.type = this.data.canvasData.type;
          }
          if (this.data.canvasData.alias) {
            this.alias = this.data.canvasData.alias;
          }
          if (this.data.canvasData.description) {
            this.description = this.data.canvasData.description;
          }
          if (this.data.canvasData.interfacetype) {
            this.interfaceType = this.data.canvasData.interfacetype;
          }
        }
      }
      let databckp = structuredClone(this.data)
      if (this.data?.action) {
        this.data.canvasData = databckp
        delete this.data.canvasData.created_date
      }
    }
    
    // Handle MCP-specific setup
    if (this.interfaceType === 'mcp-pipeline') {
      this.options = [{ viewValue: 'MCP Server', value: 'mcpServer' }];
      this.type = 'mcpServer';
    } else if (this.interfaceType === 'pipeline-agent') {
      this.options = [{ viewValue: 'AI Agent', value: 'AIAgent' }];
      this.type = 'AIAgent';
    } else if (this.interfaceType === 'app-pipeline') {
      this.options = [{ viewValue: 'App Pipeline', value: 'appPipeline' }];
      this.type = 'appPipeline';
    } else {
      this.getAllPlugins();
    }
    
    this.ssTypes.push('Azure');
    this.ssTypes.push('Vertex');
    this.ssTypes.push('ICMM');
    this.ssTypes.push('Mlflow');
    this.ssTypes.push('AWS');
    this.ssTypes.push('CodeBuddy');
    this.ssTypes.push('Haystack');

    this.groups = true

  }

  authentications() {
    this.Services.getPermission("cip").subscribe(
      (cipAuthority) => {
        // edit/update permission
        if (cipAuthority.includes("edit")) this.isAuth = false;
      }
    );
  }

  checkAll(event) {
    this.isTemplate = event;
  }

  saveDetails() {
    try {
      // if (this.isWordValid(this.name)) {
      if (this.type && this.alias.length) {
        const newCanvas = new StreamingServices();
        newCanvas.alias = this.alias;
        newCanvas.description = this.description;
        newCanvas.type = this.type;
        // newCanvas.interfacetype = this.type;
        if (newCanvas.type === 'Langchain') {
          newCanvas.interfacetype = 'chain';
        } else if (newCanvas.type === 'App') {
          newCanvas.interfacetype = 'App';
        } else if (newCanvas.type === 'Tool') {
          newCanvas.interfacetype = 'tool';
        } else {
          newCanvas.interfacetype = this.interfaceType;
        }
        
        if (this.interfaceType === 'pipeline-agent' && newCanvas.type !== 'AIAgent') {
          newCanvas.type = 'AIAgent';
        }
        
        if (this.interfaceType === 'mcp-pipeline' && newCanvas.type !== 'mcpServer') {
          newCanvas.type = 'mcpServer';
        }
        
        if (this.interfaceType === 'app-pipeline' && newCanvas.type !== 'appPipeline') {
          newCanvas.type = 'appPipeline';
        }

        newCanvas.is_template = this.isTemplate;
        const temp = [];
        if (this.inputColumns.value != null) {
          if (Array.isArray(this.inputColumns.value)) {
            newCanvas.groups = this.inputColumns.value;
          }
        }
        if (this.data && this.data.sourceToCopy) {
          if (newCanvas.type != "NativeScript" && newCanvas.type != "Binary") {
            if (this.data.pipeline_attributes) {
              newCanvas.json_content = JSON.stringify({ 'elements': this.data.sourceToCopy, 'pipeline_attributes': this.data.pipeline_attributes });
            } else {
              newCanvas.json_content = JSON.stringify({ 'elements': this.data.sourceToCopy });
            }
          }
          else {
            if (this.data.pipeline_attributes) {
              newCanvas.json_content = JSON.stringify({ 'elements': [{ 'attributes': this.data.sourceToCopy }], 'pipeline_attributes': this.data.pipeline_attributes });
            } else {
              newCanvas.json_content = JSON.stringify({ 'elements': [{ 'attributes': this.data.sourceToCopy }] });
            }
          }
        }
        // For new pipeline creation from add button ONLY for pipeline-agent, mcp-pipeline, or app-pipeline
        else if ((this.interfaceType === 'pipeline-agent' || this.interfaceType === 'mcp-pipeline' || this.interfaceType === 'app-pipeline') && (!this.data || !this.data.sourceToCopy)) {
          newCanvas.json_content = JSON.stringify({ 'created_source': 'user_defined' });
        }

        if (this.importedJson) {
          newCanvas.json_content = this.importedJson;
        }


        this.Services.create(newCanvas).subscribe((data) => {
          // Cross-MFE event: agent/data-ops MFEs can subscribe to refresh pipeline pickers.
          const created: any = data;
          this.eventBus.emit({ type: 'PIPELINE_PUBLISHED', payload: { id: created?.id ?? created?.name ?? '', version: created?.version ?? 1 } });
          this.responseLink.emit(data);

          if (data.type === 'mcpServer' && this.interfaceType === 'mcp-pipeline') {
            this.createMcpDummyFile(data);
          }
          else if (data.type === 'AIAgent' && this.interfaceType === 'pipeline-agent') {
            this.createAgentDummyFile(data);
          }
          else if (data.type === 'appPipeline' && this.interfaceType === 'app-pipeline') {
            this.createAppDummyFile(data);
          }
          else if (data.type == "NativeScript" && this.data.copy) {
            if (data.json_content) {
              let json_content = JSON.parse(data.json_content)
              
              if (json_content.elements && json_content.elements[0] && 
                  json_content.elements[0].attributes && json_content.elements[0].attributes.files && 
                  json_content.elements[0].attributes.files.length > 0) {
                
                let script_file = json_content.elements[0].attributes.files[0];
                
                let actualFileName = script_file;
                if (typeof script_file === 'string') {
                  if (script_file.startsWith('[') && script_file.endsWith(']')) {
                    try {
                      const filesArray = JSON.parse(script_file);
                      actualFileName = filesArray.find((f: string) => f.endsWith('.py')) || filesArray[0];
                    } catch (e) {
                      const cleanStr = script_file.slice(1, -1);
                      const filesArray = cleanStr.split(',').map(f => f.trim().replace(/["\']/g, ''));
                      actualFileName = filesArray.find(f => f.endsWith('.py')) || filesArray[0];
                    }
                  }
                }
                
                let script_pipeline_name = actualFileName.split('_')[0];

                this.Services.readNativeFile(script_pipeline_name, data.organization, script_file).subscribe(
                  resp => {
                    const textDecoder = new TextDecoder('utf-8');
                    this.script = textDecoder.decode(resp).split('\n');
                    const newFileName = data.name + "_" + data.organization + ".py";
                    json_content.elements[0].attributes.files[0] = newFileName;
                    data.json_content = JSON.stringify(json_content);
                    const formData: FormData = new FormData();
                    let script = this.script.join('\n')
                    let scriptFile = new Blob([script], { type: 'text/plain' });
                    formData.set('scriptFile', scriptFile);
                    this.Services.createNativeFile(data.name, data.organization, newFileName, json_content.elements[0].attributes.filetype, formData).subscribe(
                      () => {
                        this.Services.update(data).subscribe(
                          () => {
                          },
                          (updateError) => {
                            console.error('Error updating pipeline after file creation:', updateError);
                          }
                        );
                      },
                      (fileError) => {
                        console.error('Error creating native file for copy:', fileError);
                      }
                    );
                  }, error => {
                    console.error('Error reading source file for copy:', error);
                  }
                );
              }
            }
          }
          
          this.Services.message("Created Sucessfully.", "success");
          this.dialogRef.close(data);

          if (this.data.edit || this.data.copy) {
            this.dialogRef.close(data);
          } else {
            this.closeModal();
             this.dialogRef.close(data);
          }
 
        },
          error => {
              this.Services.message(`Error: ${error}`, 'error');
          }

        );
      } else {
        this.errFlag = true
      }
    }
    catch (Exception) {
      this.Services.message("Some error occured",'error');
    }


  }
  getAllPlugins() {
    let org
    this.plugins = []
    this.options = []
    this.Services.getConstantByKey('icip.aip.pluginView').subscribe((response) => {
      this.fetchOrg = response.body;
      if (this.fetchOrg == 'all') {
        this.Services.getAllPlugins(sessionStorage.getItem('organization')).subscribe(res => {
          this.plugins = res.filter(r => r.type != null);
          this.plugins.push({ type: "NativeScript" })
          this.plugins.forEach((opt) => {
            let val = { viewValue: opt.type, value: opt.type };
            if (opt.type === 'NativeScript') {
              this.options.push(val);
            }
          })
          this.type=this.options[0].value;
        },
          error => {
            this.Services.message('Error '+error,'error');
          }
        );
      }
      else {
        this.Services.getAllPluginsByOrg(sessionStorage.getItem('organization')).subscribe(res => {
          this.plugins = res.filter(r => r.type != null);
          this.plugins.push({ type: "NativeScript" })
          this.plugins.forEach((opt) => {
            let val = { viewValue: opt.type, value: opt.type };
          if (opt.type === 'NativeScript') {
              this.options.push(val);
            }
          })
          this.type=this.options[0].value;
        },
          error => {
            this.Services.message('Error '+error,'error');
          }
        )
      }
    });
  }

  closeModal() {
    if (this.data && (this.data.edit || this.data.copy || this.router.url.includes('/initiative'))) {
      this.dialogRef.close();
    } else {
      this.dialogRef.close();
      this.dialogRef.afterClosed().subscribe(() => {
        this.modalClosed.emit();
      });
    }
  }

  
  closePipelineOpenDialog(): void {
    const openDialogs = this.dialog.openDialogs;
    for (const dialog of openDialogs) {
      if (dialog.componentInstance instanceof PipelineCreateComponent) {
        dialog.close();
      }
    }
  }

  dropChange(val) {
    if (this.data && this.data.canvasData) {
      this.data.canvasData.groups = this.inputColumns.value;
    }
  }


  onFileChanged(event: { target: { files: File[]; }; }) {
    try {
      this.selectedFile = event.target.files[0];
      const fileReader = new FileReader();
      fileReader.readAsText(this.selectedFile, 'UTF-8');
      fileReader.onload = () => {
        const json = JSON.parse(fileReader.result as string);
        this.importedJson = JSON.stringify(json, null, 2);
      };
      fileReader.onerror = (error) => {
      };
    }
    catch (Exception) {
      this.Services.message("Some error occured",'error')
    }


  }

  selectedz(data) {
    try {
      return JSON.stringify(data);
    }
    catch (Exception) {
     
    }
  }


  omit_special_char(event) {
    var k = event.charCode
    return this.isValidLetter(k);
  }

  isValidLetter(k) {
    return ((k >= 65 && k <= 90) || (k >= 97 && k <= 122) || (k >= 48 && k <= 57) || [8, 9, 13, 16, 17, 20, 95].indexOf(k) > -1)
  }

  isWordValid(word) {
    word = word.toString()
    return true
  }

  editDetails() {
    try {
      const editCanvas = this.data.canvasData;
      this.Services.getStreamingServices(editCanvas.cid).subscribe((res) => {
        editCanvas.job_id = res.job_id;
        editCanvas.is_template = this.isTemplate;
        editCanvas.alias = this.alias;
        editCanvas.description = this.description;
        editCanvas.type = this.type;
  
        if (this.importedJson) {
          editCanvas.json_content = this.importedJson;
        } else {
          editCanvas.json_content = res.json_content;
        }

        this.Services.update(editCanvas).subscribe((response) => {
          this.Services.message('Updated Successfully', 'success');
          this.responseLink.emit(response);
          this.dialogRef.close(response);
        },
          error => this.Services.message('Canvas not updated due to error: ' + error, 'error')
        );

      });
    }
    catch (Exception) {
      this.Services.message("Some error occured", "error")
    }
  }

  /**
   * Create dummy MCP configuration file
   */
  private createMcpDummyFile(pipelineData: any): void {
    const organization = sessionStorage.getItem('organization') || 'defaultorg';
    const dynamicFilename = `${pipelineData.name}_${organization}.json`;
    
    const mcpConfig = {
      mcpServers: {
        [pipelineData.name]: {
          command: "python",
          args: ["-m", "mcp_server"],
          description: `MCP Server configuration for ${pipelineData.alias}`,
          version: "1.0.0",
          tools: [],
          resources: []
        }
      },
      createdBy: "AIP MCP Pipeline Generator",
      createdAt: new Date().toISOString(),
      pipelineName: pipelineData.name,
      organization: organization
    };
    
    // Preserve original json_content from add API response (created_source flag)
    let originalJsonContent = {};
    try {
      if (pipelineData.json_content) {
        originalJsonContent = JSON.parse(pipelineData.json_content);
      }
    } catch (e) {
      console.warn('Could not parse original json_content:', e);
    }
    
    // Update the pipeline's json_content with the MCP configuration, preserving created_source
    pipelineData.json_content = JSON.stringify({
      ...originalJsonContent,
      elements: [{
        type: 'mcpServer',
        name: pipelineData.name,
        config: mcpConfig,
        filename: dynamicFilename
      }]
    });
    
    // Update the pipeline using update API
    this.Services.update(pipelineData).subscribe(
      (updateResponse) => {
        // Create file content using create API
        const jsonContent = JSON.stringify(mcpConfig, null, 2);
        const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
        const formData = new FormData();
        formData.set('scriptFile', jsonBlob, dynamicFilename);
        
        // Call create API to save the dummy file using name from API response
        this.Services.createNativeFile(pipelineData.name, organization, dynamicFilename, 'json', formData).subscribe(
          (createResponse) => {
          },
          (createError) => {
            console.error('Error creating MCP dummy file:', createError);
          }
        );
      },
      (error) => {
        console.error('Error updating MCP pipeline with configuration:', error);
      }
    );
  }

  /**
   * Create dummy Agent configuration file
   */
  private createAgentDummyFile(pipelineData: any): void {
    const organization = sessionStorage.getItem('organization') || 'defaultorg';
    const dynamicFilename = `${pipelineData.name}_${organization}.json`;
    
    const agentConfig = {
      agent: {
        name: pipelineData.name,
        alias: pipelineData.alias,
        description: pipelineData.description,
        type: "AIAgent",
        interface: "pipeline-agent",
        model: {
          provider: "openai",
          model_name: "gpt-3.5-turbo",
          temperature: 0.7,
          max_tokens: 1000
        },
        tools: [],
        memory: {
          type: "conversation",
          max_history: 10
        },
        system_prompt: `You are ${pipelineData.alias}, an AI agent created to assist users.`
      },
      configuration: {
        version: "1.0.0",
        created_by: "AIP Agent Pipeline Generator",
        created_at: new Date().toISOString(),
        organization: organization,
        environment: "development"
      }
    };
    
    let originalJsonContent = {};
    try {
      if (pipelineData.json_content) {
        originalJsonContent = JSON.parse(pipelineData.json_content);
      }
    } catch (e) {
      console.warn('Could not parse original json_content:', e);
    }
    
    pipelineData.json_content = JSON.stringify({
      ...originalJsonContent,
      elements: [{
        type: 'AIAgent',
        name: pipelineData.name,
        config: agentConfig,
        filename: dynamicFilename
      }]
    });
    
    this.Services.update(pipelineData).subscribe(
      (updateResponse) => {
        const jsonContent = JSON.stringify(agentConfig, null, 2);
        const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
        const formData = new FormData();
        formData.set('scriptFile', jsonBlob, dynamicFilename);
        
        this.Services.createNativeFile(pipelineData.name, organization, dynamicFilename, 'json', formData).subscribe(
          (createResponse) => {
          },
          (createError) => {
            console.error('Error creating Agent dummy file:', createError);
          }
        );
      },
      (error) => {
        console.error('Error updating Agent pipeline with configuration:', error);
      }
    );
  }

  /**
   * Create dummy App Pipeline configuration file
   */
  private createAppDummyFile(pipelineData: any): void {
    const organization = sessionStorage.getItem('organization') || 'defaultorg';
    const dynamicFilename = `${pipelineData.name}_${organization}.json`;
    
    const appConfig = {
      appPipeline: {
        name: pipelineData.name,
        alias: pipelineData.alias,
        description: pipelineData.description,
        type: "appPipeline",
        interface: "app-pipeline",
        version: "1.0.0",
        configuration: {
          runtime: "nodejs",
          entrypoint: "index.js",
          dependencies: [],
          environment: {}
        },
        endpoints: [],
        services: []
      },
      metadata: {
        created_by: "AIP App Pipeline Generator",
        created_at: new Date().toISOString(),
        organization: organization,
        environment: "development"
      }
    };
    
    // Preserve original json_content from add API response (created_source flag)
    let originalJsonContent = {};
    try {
      if (pipelineData.json_content) {
        originalJsonContent = JSON.parse(pipelineData.json_content);
      }
    } catch (e) {
      console.warn('Could not parse original json_content:', e);
    }
    
    // Update the pipeline's json_content with the App configuration, preserving created_source
    pipelineData.json_content = JSON.stringify({
      ...originalJsonContent,
      elements: [{
        type: 'appPipeline',
        name: pipelineData.name,
        config: appConfig,
        filename: dynamicFilename
      }]
    });
    
    // Update the pipeline using update API
    this.Services.update(pipelineData).subscribe(
      (updateResponse) => {
        // Create file content using create API
        const jsonContent = JSON.stringify(appConfig, null, 2);
        const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
        const formData = new FormData();
        formData.set('scriptFile', jsonBlob, dynamicFilename);
        
        // Call create API to save the dummy file using name from API response
        this.Services.createNativeFile(pipelineData.name, organization, dynamicFilename, 'json', formData).subscribe(
          (createResponse) => {
          },
          (createError) => {
            console.error('Error creating App Pipeline dummy file:', createError);
          }
        );
      },
      (error) => {
        console.error('Error updating App Pipeline with configuration:', error);
      }
    );
  }

}