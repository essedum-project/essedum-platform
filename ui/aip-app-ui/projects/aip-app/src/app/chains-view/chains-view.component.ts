import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
  DoCheck,
  ComponentFactoryResolver
} from '@angular/core';
import { TreeComponent } from '@ali-hm/angular-tree-component';
import Drawflow from 'drawflow';
import * as _ from "lodash";
import { PipelineService } from '../services/pipeline.service'
import { Services } from '../services/service'
import { PipelinenodeDirective } from '../pipeline-node.directive';
import { TreeStructureComponent } from '../tree-structure/tree-structure.component';
import { EnlCodeEditorComponent } from '../enl-code-editor/enl-code-editor.component';
import { CreateEndpointComponent } from '../endpoint/create-endpoint/create-endpoint.component';
import { DomSanitizer } from '@angular/platform-browser';
import { LedsModalService } from 'leds-lib';
import { JSONContent, Elements, ChainJob } from '../DTO/chainJob';
import { ActivatedRoute, Router } from '@angular/router';
import { LeapTelemetryService, OpenTelemetryService } from 'com-lib-util';
import {Location} from '@angular/common';

@Component({
  selector: 'app-chains-view',
  templateUrl: './chains-view.component.html',
  styleUrls: ['./chains-view.component.scss']
})
export class ChainsViewComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy, DoCheck {
  nodesBkp = [];
  @Input()
  // nodes: any[] = [];
  nodes: any[] = []
  nodesAll : any[] =[]
  @Input()
  drawingData;
  @Input()
  locked: boolean = false;
  @Input()
  showLock: boolean;
  @Input()
  showNodes: boolean = true;
  @Input()
  pipelineDetails: any;
  options = { allowDrag: true, allowDrop: true };
  // runtimes = ["local", "remote2"]

  editor!: any;
  editDivHtml: HTMLElement;
  editButtonShown: boolean = false;
  contentcopy :any;
  chainedJob;
  isNativescript;
  drawnNodes: any[] = [];
  runtimes :any;
  selectedNodeId: string;
  selectedNode: any = {};
  componentRef
  components
  createNode = false
  element

  nodeObj = { inputs: "0", outputs: "0" }
  event
  showDetails = false
  openDialog = false
  topmostRuntime;
  showlog=0
  chainList = { runNow: true, element: { elements: [] } }
  chainname;
  lastMousePositionEv: any;
  numberOfPipeline = 0;
  pipelineList = [];
  numberOfScriptsGenerated = 0;
  @ViewChild(TreeComponent, { static: false }) private tree: TreeComponent;
  @ViewChild(PipelinenodeDirective, { static: false }) pipelinenode!: PipelinenodeDirective;
  @ViewChild('content1', { static: true }) content1: ElementRef;
  @ViewChild('content3', { static: true }) content3: ElementRef;
  // @ViewChild('entry', {read: ViewContainerRef, static: true }) entry: ViewContainerRef;


  nodeModal: ElementRef;
  runtimeHtml: string;
  @ViewChild('content') set setNodeModal(el: ElementRef) {
    this.nodeModal = el;
  }


  constructor(
    private telemetryService: LeapTelemetryService,
    private telemetry: OpenTelemetryService,
    private modalService: LedsModalService, private pipelineService: PipelineService,
    private service: Services, private componentFactoryResolver: ComponentFactoryResolver,
    private _sanitizer: DomSanitizer, public viewContainerRef: ViewContainerRef,
    private route: ActivatedRoute, private _location: Location) { }

  // Private functions
  private initDrawFlow(): void {
    const drawFlowHtmlElement = <HTMLElement>document.getElementById('drawflow');
    // testEditor.addConnection();

    this.editor = new Drawflow(drawFlowHtmlElement);

    this.editor.reroute = true;
    this.editor.curvature = 0.5;
    this.editor.reroute_fix_curvature = true;
    this.editor.reroute_curvature = 0.5;
    this.editor.force_first_input = false;
    this.editor.line_path = 1;
    this.editor.editor_mode = 'edit';
    this.editor.start();

    this.getPipelines()
    this.route.params.subscribe((res) => {
      this.chainname = res['name'];
    });
    // this.drawingData = JSON.parse(this.pipelineDetails.json_content)
    if (this.chainname) {
      this.pipelineService.getChainByName(this.chainname).subscribe((res) => {
        this.chainedJob = res
        this.drawingData = this.chainedJob.flowjson ? JSON.parse(this.chainedJob.flowjson) : null
        if (this.drawingData && this.drawingData.drawflow && Object.keys(this.drawingData.drawflow.Home.data).length > 0) {
          let x = JSON.parse(this.chainedJob.flowjson).drawflow.Home.data;
          this.drawingData.drawflow.Home.data = {};
          Object.entries(x).forEach((e) =>  {
            e[1]["html"] = e[1]["html"].substring(0,e[1]["html"].indexOf("<p>")) + this.runtimeHtml;
            e[1]["data"].html = e[1]["data"].html.substring(0,e[1]["data"].html.indexOf("<p>")) + this.runtimeHtml;
            this.drawingData.drawflow.Home.data[e[0]] = e[1];
          })
          this.editor.import(this.drawingData);
        }
      });

    }
    // this.editor.addNode('GROUP', 0, 0, 1200, 100, 'GROUP', { elements: []},  `` );
    // this.editor.addNode('GROUP', 0, 0, 0, 100, 'GROUP', { elements: []},  `` );

  }

  ngOnDestroy(): void {
    // document.getElementsByTagName("head")[0].removeChild(this.link1)
    // document.getElementsByTagName("head")[0].removeChild(this.link2)
    // document.body.removeChild(this.script)
    let activeSpan = this.telemetry.fetchActiveSpan();
	  this.telemetry.endTelemetry(activeSpan);
  }


  private resetAllInputsOutputs() {
    this.nodes.forEach((node) => {
      node.inputs = 1;
      node.outputs = 1;
    });
  }

  addPipeline() {
    // this.editor.addNode("GROUP", this.nodeObj.inputs, this.nodeObj.outputs, 250, 120, 'GROUP', { elements: []},  `` );
    this.selectedNode.data.inputs = parseInt(this.nodeObj.inputs)
    this.selectedNode.data.outputs = parseInt(this.nodeObj.outputs)
    this.addNodeToDrawBoard(this.event.clientX, this.event.clientY);
  }
  addPipelineAfterDelete() {
    // this.editor.addNode("GROUP", this.nodeObj.inputs, this.nodeObj.outputs, 250, 120, 'GROUP', { elements: []},  `` );
    this.selectedNode.data.inputs = parseInt(this.nodeObj.inputs)
    this.selectedNode.data.outputs = parseInt(this.nodeObj.outputs)
    this.addNodeToDrawBoard(this.event.clientX, this.event.clientY);
    this.editor.removeNodeIdwithoutDialog(this.selectedNodeId);
  }

  private addEditorEvents() {
    
    this.editor.removeNodeId = function(id) {
      
      var r = confirm("Are you sure to delete?");
      if (r == true) {
        this.removeConnectionNodeId(id);
        var moduleName = this.getModuleFromNodeId(id.slice(5))
        if(this.module === moduleName) {
          document.getElementById(id).remove();
        }
        delete this.drawflow.drawflow[moduleName].data[id.slice(5)];
        this.dispatch('nodeRemoved', id.slice(5));
      }
    }
    this.editor.removeNodeIdwithoutDialog = function(id) {

        this.removeConnectionNodeId(id);
        var moduleName = this.getModuleFromNodeId(id.slice(5))
        if(this.module === moduleName) {
          document.getElementById(id).remove();
        }
        delete this.drawflow.drawflow[moduleName].data[id.slice(5)];
        this.dispatch('nodeRemoved', id.slice(5));
      
    }
    // Events!
    this.editor.on('nodeCreated', (id: any) => {
      var node = this.editor.getNodeFromId(id)
      const g = {};
      const m = document.getElementById("node-" + id);
      for (var _ = 0; _ < node.data.inputs?.length; _++) {
        const t = node.data.inputs[_]
          , n = document.createElement("div");
        n.classList.add("input"),
          n.classList.add("input_" + (_ + 1)),
          "" != t && n.setAttribute("type", "null"),
          g["input_" + (_ + 1)] = {
            label: t,
            type: "null",
            connections: []
          },
          m.childNodes[0].appendChild(n);
        const s = document.createElement("div");
        s.classList.add("input-label"),
          s.classList.add("input-label_input_" + (_ + 1)),
          t && s.setAttribute("type", "null"),
          t && (s.innerHTML = t),
          m.childNodes[0].appendChild(s)
        this.editor.drawflow.drawflow.Home.data[id].inputs = g
      }
      const a = {};
      for (var _ = 0; _ < node.data.outputs?.length; _++) {
        const t = node.data.outputs[_]
          , n = document.createElement("div");
        n.classList.add("output"),
          n.classList.add("output_" + (_ + 1)),
          "" != t && n.setAttribute("type", "null"),
          a["output_" + (_ + 1)] = {
            label: t,
            type: "null",
            connections: []
          },
          m.childNodes[2].appendChild(n);
        const s = document.createElement("div");
        s.classList.add("output-label"),
          s.classList.add("output-label_output_" + (_ + 1)),
          t && s.setAttribute("type", "null"),
          t && (s.innerHTML = t),
          m.childNodes[2].appendChild(s)
        this.editor.drawflow.drawflow.Home.data[id].outputs = a
      }
    });

    this.editor.on('nodeRemoved', (id: any) => {
      Object.keys(this.editor.drawflow.drawflow.Home.data).forEach(ele => {
        if (this.editor.drawflow.drawflow.Home.data[ele].class === "GROUP") {
          const findIndex = this.editor.drawflow.drawflow.Home.data[ele].data.elements.indexOf(id);
          if (findIndex !== -1) {
            this.editor.drawflow.drawflow.Home.data[ele].data.elements.splice(findIndex, 1);
          }
        }
      })
    });

    this.editor.on('nodeSelected', (id: any) => {
      this.selectedNode = this.editor.drawflow.drawflow.Home.data[`${id}`];
    });

    this.editor.on('click', (e: any) => {

      if (e.target.closest('.drawflow_content_node') != null || e.target.classList[0] === 'drawflow-node') {
        if (e.target.closest('.drawflow_content_node') != null) {
          this.selectedNodeId = e.target.closest('.drawflow_content_node').parentElement.id;
        } else {
          this.selectedNodeId = e.target.id;
        }
        this.selectedNode = this.editor.drawflow.drawflow.Home.data[`${this.selectedNodeId.slice(5)}`];
      }
      if (e.detail == 2) {
        this.pipelineService.getPipelineByName(this.selectedNode.data.name).subscribe(resp => {
          // this.showDetails = true
          this.pipelineDetails = resp
          this.isNativescript=  this.pipelineDetails.type.toUpperCase() === "NATIVESCRIPT";
          // this.openDialog = true
          let m = document.getElementById("chain-drawflow")
          this.element = m.childNodes[0]
          m.removeChild(this.element)
          this.open(this.content1)
          // let doc = document.getElementById("details")
          // let newele = document.getElementById("showDetails")

          // let newele = document.createElement("div")
          // newele.classList.add("app-draw-flow")

          // doc.appendChild(newele)
          // const m = document.getElementById("node-" + this.selectedNode.id);
          // const tempnode = m.getElementsByTagName("ng-template")
          // if (tempnode) {
          //   const componentFactory =
          //     this.componentFactoryResolver.resolveComponentFactory(DrawFlowComponent);
          //   if (this.pipelinenode) {
          //     const viewContainerRef = this.pipelinenode.viewContainerRef;
          //     viewContainerRef.clear();
          //     this.componentRef?.destroy();

          //     this.componentRef =
          //       viewContainerRef.createComponent(componentFactory);
          //     this.componentRef.instance.pipelineDetails = resp;
          //     this.componentRef.instance.event?.subscribe(value => {
          //       for (let key in value) {
          //         this.editor.drawflow.drawflow.Home.data[`${this.selectedNodeId.slice(5)}`].data[key] = value[key]
          //       }
          //     });
          //     const ele = document.getElementById("ele")
          //     ele.id = ""
          //     tempnode[0].parentNode.appendChild(ele)
          //     // tempnode["pnode"].remove()
          //   }

          // }
        })
      }

      if (e.target.closest('#editNode') === null) {
        this.hideEditButton();
      }
    });



    this.editor.on('moduleCreated', (name: any) => {
    });

    this.editor.on('moduleChanged', (name: any) => {
    });

    this.editor.on('connectionCreated', (connection: any) => {
      const nodeInfo = this.editor.getNodeFromId(connection.input_id);
      const outNodeInfo = this.editor.getNodeFromId(connection.output_id);
      if (!nodeInfo.data.inputOptions || (nodeInfo.data.inputOptions && !nodeInfo.data.inputOptions[connection.input_class])) { }
      else if (nodeInfo.data.inputOptions[connection.input_class] != outNodeInfo.name) {
        const length = nodeInfo.inputs[connection.input_class].connections.length
        const removeConnectionInfo = nodeInfo.inputs[connection.input_class].connections[length - 1];
        this.editor.removeSingleConnection(removeConnectionInfo.node, connection.input_id, removeConnectionInfo.input, connection.input_class);
        this.service.messageService("Connection not allowed", "Error");
      }
    });

    this.editor.on('connectionRemoved', (connection: any) => {
    });

    this.editor.on('contextmenu', (e: any) => {

      if (e.target.closest('.drawflow_content_node') != null || e.target.classList[0] === 'drawflow-node') {
        if (e.target.closest('.drawflow_content_node') != null) {
          this.selectedNodeId = e.target.closest('.drawflow_content_node').parentElement.id;
        } else {
          this.selectedNodeId = e.target.id;
        }
        this.selectedNode = this.editor.drawflow.drawflow.Home.data[`${this.selectedNodeId.slice(5)}`];

        this.showEditButton();
      }
    });

    this.editor.on('zoom', (zoom: any) => {
    });

    this.editor.on('addReroute', (id: any) => {
    });

    this.editor.on('removeReroute', (id: any) => {
    });
    let dragElementHover = null;
    let last_x = 0;
    let last_y = 0;
    this.editor.on("mouseMove", ({ x, y }) => {
      if (this.editor.node_selected && this.editor.drag && this.editor.node_selected.classList[1] !== "GROUP") {
        const eles = document.elementsFromPoint(x, y);
        const ele = eles.filter(ele => ele.classList[1] === "GROUP");
        if (ele.length > 0) {
          dragElementHover = ele[0];
          dragElementHover.classList.add("hover-drop");
        } else {
          if (dragElementHover != null) {
            dragElementHover.classList.remove("hover-drop");
            dragElementHover = null;
          }
        }
      } else if (this.editor.node_selected && this.editor.drag && this.editor.node_selected.classList[1] == "GROUP") {
        const dragNode = this.editor.node_selected.id.slice(5);
        const dragNodeInfo = this.editor.getNodeFromId(dragNode);
        const elements = dragNodeInfo.data.elements;
        elements.forEach(eleN => {

          const node = document.getElementById(`node-${eleN}`);
          var xnew = (last_x - x) * this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom);
          var ynew = (last_y - y) * this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom);

          node.style.top = (node.offsetTop - ynew) + "px";
          node.style.left = (node.offsetLeft - xnew) + "px";

          this.editor.drawflow.drawflow[this.editor.module].data[eleN].pos_x = (node.offsetLeft - xnew);
          this.editor.drawflow.drawflow[this.editor.module].data[eleN].pos_y = (node.offsetTop - ynew);
          this.editor.updateConnectionNodes(`node-${eleN}`);

        });
      }
      last_x = x;
      last_y = y;
    })

    this.editor.on("nodeMoved", (id) => {
      const dragNode = id;
      if (dragElementHover !== null) {
        const dropNode = dragElementHover.id.slice(5);
        if (dragNode !== dropNode) {
          Object.keys(this.editor.drawflow.drawflow.Home.data).forEach(ele => {
            if (this.editor.drawflow.drawflow.Home.data[ele].class === "GROUP") {
              const findIndex = this.editor.drawflow.drawflow.Home.data[ele].data.elements.indexOf(id);
              if (findIndex !== -1) {
                this.editor.drawflow.drawflow.Home.data[ele].data.elements.splice(findIndex, 1);
              }
            }
          })
          dragElementHover.classList.remove("hover-drop");
          const dropNodeInfo = this.editor.getNodeFromId(dropNode);
          const dropNodeInfoData = dropNodeInfo.data;
          if (dropNodeInfoData.elements.indexOf(dragNode) === -1) {
            dropNodeInfoData.elements.push(dragNode);
            this.editor.updateNodeDataFromId(dropNode, dropNodeInfoData);
          }
        }
        dragElementHover = null;
      } else {
        Object.keys(this.editor.drawflow.drawflow.Home.data).forEach(ele => {
          if (this.editor.drawflow.drawflow.Home.data[ele].class === "GROUP") {
            const findIndex = this.editor.drawflow.drawflow.Home.data[ele].data.elements.indexOf(id);
            if (findIndex !== -1) {
              this.editor.drawflow.drawflow.Home.data[ele].data.elements.splice(findIndex, 1);
            }
          }
        })
      }
    })

    // this.editor.on('translate', (position: any) => {
    //   console.log(
    //     'Editor Event :>> Translate x:' + position.x + ' y:' + position.y
    //   );
    // });
  }

  private initDrawingBoard() {
    this.initDrawFlow();
    if (!this.locked) {
      this.addEditorEvents();
    }
  }
  openEditNodes(content: any, e?){
    const id=this.selectedNodeId;
    this.open(this.content3, e);

  }
  private showEditButton() {
    this.editButtonShown = true;
    this.editDivHtml = document.createElement('div');
    this.editDivHtml.id = 'editNode';
    this.editDivHtml.removeAttribute
    let content1: ElementRef; 
    this.editDivHtml.onclick = (e: MouseEvent) => {
      this.openEditNodes(null, e);
    };
    this.editDivHtml.innerHTML = '<i style="left: -2em;position: absolute;top: -0.5em;z-index: 999999999999;cursor: pointer !important;" class="icon x-24 edit-icon"></i>';
    this.editDivHtml.style.display = 'block';
    this.editDivHtml.style.position = 'relative';
    this.editDivHtml.className = 'edit-node-button';

    const selectedNodeHtml = document.getElementById(this.selectedNodeId);
    if (selectedNodeHtml) {
      selectedNodeHtml.append(this.editDivHtml);
    }
  }

  private hideEditButton() {
    this.editButtonShown = false;
    this.editDivHtml = document.getElementById('editNode');
    if (this.editDivHtml) {
      this.editDivHtml.remove();
    }
  }



  onKeyEvent(e: any) {
    // this.nameAlreadyUsed = this.checkIfNameIsUsed(e.target.value, this.selectedNode.id);
  }

  private countInOutputsOfNode(node: any) {
    let inputsCount = 0;
    let outputsCount = 0;

    Object.keys(node.inputs).forEach((inputKey) => {
      if (node.inputs[`${inputKey}`].connections.length > 0) {
        inputsCount++;
      }
    });

    Object.keys(node.outputs).forEach((outputKey) => {
      if (node.outputs[`${outputKey}`].connections.length > 0) {
        outputsCount++;
      }
    });

    return { inputsCount, outputsCount };
  }

  private checkIfNameIsUsed(name: string, id: number) {
    for (let i = 0; i < Object.keys(this.editor.drawflow.drawflow.Home.data).length; i++) {
      const nodeId = Object.keys(this.editor.drawflow.drawflow.Home.data)[i];
      if (nodeId != `${id}`) {
        if (this.editor.drawflow.drawflow.Home.data[`${nodeId}`].name == name) {
          return true;
        }
      }
    }
    return false;
  }

  private reestablishOldConnections(oldNode: any, newNodeId: number) {
    Object.keys(oldNode.inputs).forEach((inputKey) => {
      oldNode.inputs[`${inputKey}`].connections.forEach((connection: any) => {
        this.editor.addConnection(connection.node, newNodeId, connection.input, inputKey);
      });
    });

    Object.keys(oldNode.outputs).forEach((outputKey) => {
      oldNode.outputs[`${outputKey}`].connections.forEach((connection: any) => {
        this.editor.addConnection(newNodeId, connection.node, outputKey, connection.output);
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.drawingData &&
      changes.drawingData.currentValue &&
      changes.drawingData.currentValue.length > 0 &&
      Object.keys(JSON.parse(changes.drawingData.currentValue).drawflow.Home.data).length > 0
    ) {
      this.editor.import(JSON.parse(changes.drawingData.currentValue));
    }
  }

  telemetryCall(){
    this.telemetry.startTelemetry('aip-app','ChainsViewComponent', sessionStorage.getItem('organization'));
  }

  ngOnInit(): void {
    this.telemetryCall();
    this.telemetryImpression();

    // this.link1 = document.createElement('link');
    // this.link1.href = 'drawflow.min.css';
    // this.link1.rel = 'stylesheet';

    // document.getElementsByTagName('head')[0].appendChild(this.link1);
    // this.link2 = document.createElement('link');
    // this.link2.href = 'beautiful.css'
    // this.link2.rel = 'stylesheet';
    // document.getElementsByTagName('head')[0].appendChild(this.link2);
    // this.script = document.createElement('script');
    // this.script.src = "drawflow.min.js"
    // document.body.appendChild(this.script);
    this.components = {
      TreeStructureComponent: TreeStructureComponent,
      CreateEndpointComponent: CreateEndpointComponent,
      EnlCodeEditorComponent: EnlCodeEditorComponent
    }
    this.getAllRuntimes();
    // this.initDrawingBoard();
    // this.editor.editor_mode = this.locked != null && this.locked == false ? 'edit' : 'fixed';
  }

  async getAllRuntimes() {
    let c=0
    this.runtimeHtml = "";
    await this.pipelineService.fetchJobRunTypes().subscribe(resp => {
      this.runtimes = (resp);
      this.runtimeHtml = `<p>Runtime</p><select df-runtime>`;
      for (let res of resp) {
        let type = res["type"]
        let dsalias = res["dsAlias"]
        if (!c) {
          c = 1
          this.topmostRuntime = type + "-" + dsalias;
        }
        if (dsalias === undefined) {
          dsalias = ""
        }
        this.runtimeHtml += `<option>${type}-${dsalias}</option>`
      }
      this.runtimeHtml +=`</select></div></div>`
    })
  }

  telemetryImpression() {
    this.telemetryService.start();
    this.telemetryService.impression("aip-app", "list", "ChainsViewComponent");
  }

  ngAfterViewInit(): void {
    this.initDrawingBoard();
    this.editor.editor_mode = this.locked != null && this.locked == false ? 'edit' : 'fixed';
  }

  ngDoCheck() {
    if (this.editor && !this.editor.container) {
      this.ngAfterViewInit()
    }
  }


  onDrawflowEvent(e: any) {
    switch (e.type) {
      case 'dragstart':
        this.selectedNode = {}
        this.selectedNode.data = JSON.parse(
          JSON.stringify([...this.nodesBkp].find((node) => node.alias === e.target.outerText?.trim()))
        );
        break;
      case 'dragenter':
        break;
      case 'dragover':
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'dragleave':
        break;
      case 'drop':
        e.preventDefault();
        // this.pipelineService.getPipeline(this.selectedNode.data.cid).subscribe(resp=>{
        //   this.editor.import(JSON.parse(resp['json_content']));
        // })
        // this.selectedNode.data.html = `<div>${this.selectedNode.data.alias}</div>`
        // this.addNodeToDrawBoard(e.clientX, e.clientY);
        this.resetAllInputsOutputs();
        break;

      default:
        break;
    }
  }

  // Drawflow Editor Operations
  addNodeToDrawBoard(pos_x: number, pos_y: number) {
    this.editor.editor_mode = 'edit'
    if (this.editor.editor_mode === 'edit') {
      pos_x =
        pos_x * (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom)) -
        this.editor.precanvas.getBoundingClientRect().x *
        (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom));

      pos_y =
        pos_y * (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom)) -
        this.editor.precanvas.getBoundingClientRect().y *
        (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom));


      // const htmlTemplate = `<div>${this.selectedNode.data.infos.name}</div>`;
      //   const htmlTemplate = this._sanitizer.bypassSecurityTrustHtml(
      //   this.selectedNode.data.html
      // );
      const htmlTemplate = this.selectedNode.data.html;
      this.editor.addNode(
        this.selectedNode.data.name,
        this.selectedNode.data.inputs /*this.selectedNode.data.inputs*/,
        this.selectedNode.data.outputs /*this.selectedNode.data.outputs*/,
        pos_x,
        pos_y,
        'multiple',
        this.selectedNode.data,
        htmlTemplate,
        false
      );
    }
  }

  onClear() {
    this.editor.clear();
  }

  onSave() {
    for (let i = 0; i < Object.keys(this.editor.drawflow.drawflow.Home.data).length; i++) {
        const nodeId = Object.keys(this.editor.drawflow.drawflow.Home.data)[i];
        let s=this.editor.drawflow.drawflow.Home.data[`${nodeId}`];
        if (!s.data.runtime){
          this.editor.drawflow.drawflow.Home.data[`${nodeId}`].data["runtime"]=this.topmostRuntime;
        }

    }
    // this.buildDag(this.editor.drawflow.Home.data)
    let lst=this.editor.drawflow.drawflow.Home.data
    this.addElementInChain(this.editor.drawflow.drawflow.Home.data)
    this.updateChainJob(0);
    this.service.message('Saving');
    this.telemetry.addTelemetryEvent('chains saving');

  }

  changeMode() {
    this.locked = !this.locked;
    this.editor.editor_mode = this.locked != null && this.locked == false ? 'edit' : 'fixed';
  }

  onZoomOut() {
    this.editor.zoom_out();
  }

  onZoomIn() {
    this.editor.zoom_in();
  }

  onZoomReset() {
    this.editor.zoom_reset();
  }

  exportDrawingData() {
    return this.editor.export();
  }

  onSubmit() {
    this.drawingData = this.exportDrawingData();
  }
  transform = '';
  showpopup(e) {

    e.target.closest(".drawflow-node").style.zIndex = "9999";
    e.target.children[0].style.display = "block";
    //document.getElementById("modalfix").style.display = "block";

    //e.target.children[0].style.transform = 'translate('+translate.x+'px, '+translate.y+'px)';
    this.transform = this.editor.precanvas.style.transform;
    this.editor.precanvas.style.transform = '';
    this.editor.precanvas.style.left = this.editor.canvas_x + 'px';
    this.editor.precanvas.style.top = this.editor.canvas_y + 'px';

    //e.target.children[0].style.top  =  -editor.canvas_y - editor.container.offsetTop +'px';
    //e.target.children[0].style.left  =  -editor.canvas_x  - editor.container.offsetLeft +'px';
    this.editor.editor_mode = "fixed";

  }

  closemodal(e) {
    e.target.closest(".drawflow-node").style.zIndex = "2";
    e.target.parentElement.parentElement.style.display = "none";
    //document.getElementById("modalfix").style.display = "none";
    this.editor.precanvas.style.transform = this.transform;
    this.editor.precanvas.style.left = '0px';
    this.editor.precanvas.style.top = '0px';
    this.editor.editor_mode = "edit";
  }

  getPipelines() {
    this.service.getallPipelinesByOrg().subscribe((res) => {
      this.nodes = res;
      this.nodesAll=res;
      this.nodesBkp = res;
      this.tree.treeModel.update();
      this.tree.sizeChanged();
    })
  }

  filterNodes(filter){
    let arr=[]
    arr=this.nodes;
   
    this.nodes = [];
    this.nodesAll.forEach((element: any) => {
      if (element.alias.toLowerCase().includes(filter.toLowerCase())) {
        this.nodes.push(element);
      }
    });
    if (filter == "") {
      this.nodes=this.nodesAll
    }
  
  }
  open(content: any, e?): void {
    let c=0
    this.selectedNode.data.html = `<div><div class="title-box" style="line-height: 20px;padding-top: 10px;word-break: break-word;">${this.selectedNode.data.alias}</div><div class="box dbclickbox" ><p>Runtime</p><select df-runtime>`
    for(let res of this.runtimes)
      {
        
        let type= res["type"]
        let dsalias=res["dsAlias"]
        if(!c){
          c=1
          this.topmostRuntime= type+"-"+dsalias;
        }
        if(dsalias===undefined){
          dsalias=""
        }
          this.selectedNode.data.html+= `<option>${type}-${dsalias}</option>`
      }
    this.selectedNode.data.html+=`</select></div></div>`
    // this.selectedNode.data.html = `<div><div class="title-box">${this.selectedNode.data.alias}</div><div class="box dbclickbox"><p>Runtime</p><select df-runtime><option></option><option>local</option><option>remote</option></select></div></div>`
    this.event = e
    if(e){
      this.contentcopy=content;
    this.modalService.openModal(content, 'standard');
    }
    else{
      this.modalService.openModal(content, 'wide');
    }
  }

  showlogs(){
    this.showlog=1
  }

  closeModal() {
    this.openDialog = false
    // this.drawingData = this.editor.drawflow
    let m = document.getElementById("chain-drawflow")
    m.appendChild(this.element)
    // this.initDrawFlow()
  }

  updateChainJob(isParallel: number) {
    // if (this.validChainName(this.jobname) && (this.isInEdit || this.isWordValid(this.jobname))) {
    this.chainedJob.jsonContent = this.chainList.element
    this.chainedJob.flowjson = JSON.stringify(this.editor.drawflow)
    this.pipelineService.updateChainedJob(this.chainedJob.jobName, this.chainedJob).subscribe(res => {
      // this.dialogRef.close({ type: 'build', data: res });
    }, error => {
      // this.messageService.error("Error in Creating Job", error);
      // this.close();
    })
    // } else {
    //   this.messageService.error("Error", "Invalid Job Name");
    // }
  }

  addElementInChain(data) {
    this.chainList.element.elements = []
    let index = 0;
    for (let node in data) {
      index++
      let obj = { "name": "", "type": "", "id": "", "runtime": "local", "alias": "", "index": "", "connectors": [] }
      obj.name = data[node].data.name
      obj.type = data[node].data.type
      obj.runtime = data[node].data.runtime
      obj.alias = data[node].data.alias
      obj.id = node
      obj.index = index.toString()
      
      for (let inp in data[node].inputs) {
        for (let con of data[node].inputs[inp]?.connections) {
          // obj.inputs.push(con.node)
          let connector = {}
          connector["node"] = con.node
          connector["type"] = "target"
          obj.connectors.push(connector)
        }
      }
      for (let out in data[node].outputs) {
        for (let con of data[node].outputs[out]?.connections) {
          // obj.outputs.push(con.node)
          let connector = {}
          connector["node"] = con.node
          connector["type"] = "source"
          obj.connectors.push(connector)
        }
      }
      this.chainList.element.elements.push(obj)

    }
    this.buildDag(this.chainList.element.elements)

  }

  buildDag(input) {

    // get all elements from json
    let elementlist = []
    let nodelist = []
    for (let e of input)
      nodelist.push(e)

    let rootnodes = []

    // add all starting nodes to root
    for (let item of nodelist) {
      let parentid = ''
      let childid = ''
      for (let connector of item["connectors"]) {
        if (connector["type"] == "target")
          parentid = connector["node"]
        if (connector["type"] == "source")
          childid = connector["node"]
      }
      if(item["connectors"].length==0){
        elementlist.push(item)
        const index = nodelist.indexOf(item);
        if (index > -1) { // only splice array when item is found
          nodelist.splice(index, 1); // 2nd parameter means remove one item only
        }
      }
      //no parent; child exists; remove from main element list
      if (parentid == '' && childid != '') {
        rootnodes.push(item)
        elementlist.push(item)
        // elementlist[elementlist.length - 1].level = 0
      }
    }
    for (let item of rootnodes) {
      const index = nodelist.indexOf(item);
      if (index > -1) { // only splice array when item is found
        nodelist.splice(index, 1); // 2nd parameter means remove one item only
      }
    }

  //   rootnodes[0].level=0
  //   let elements=[rootnodes[0]]
  //   let parentid ='';
  //   let childid='';
  //   for (let connector of rootnodes[0]["connectors"]){
  //     if (connector["type"] == "source")
  //       childid = connector["node"]
  //   }
  //   let level=1;
  //   while(nodelist.length>0){
  //     let nodelistcopy = [];
  //       for (let item of nodelist) {
  //         nodelistcopy.push(item);
  //       }
  //   for (let item of nodelistcopy) {
  //     if(childid==item["id"]){
  //       item.level=level;
  //       level+=1;
  //       elements.push(item)
      
  //         const index = nodelist.indexOf(item);
  //         if (index > -1) { // only splice array when item is found
  //           nodelist.splice(index, 1); // 2nd parameter means remove one item only
  //         }
        
  //     for (let connector of item["connectors"]) {
       
          
  //         if (connector["type"] == "target")
  //           parentid = connector["node"]
  //         if (connector["type"] == "source")
  //           childid = connector["node"]
        
  //     }
  //   }
  //   }
  // }
    // attach children
    while (nodelist.length > 0) {
      let level = 0;
      let nodelistcopy = [];
      for (let item of nodelist) {
        nodelistcopy.push(item);
      }
      for (let item of nodelistcopy) {
        let parentid = ''
        let parentList = []

        for (let connector of item["connectors"]) {
          if (connector["type"] == "target") {
            parentid = connector["node"]
            for (let node of elementlist) {
              if (node["id"] == parentid)
                parentList.push(node)
            }
          }
        }

        
        if (parentList.length > 0) {  
          const index = nodelist.indexOf(item);
          if (index > -1) { // only splice array when item is found
            nodelist.splice(index, 1); // 2nd parameter means remove one item only
          }
          elementlist.push(item)        

          elementlist[elementlist.length - 1].parent = parentList
          //assign level
          for (let i of parentList) {
            if (i["level"] > level)
              level = i["level"]
          }
          elementlist[elementlist.length - 1].level = level + 1
        }
        // else {
        //   elementlist[elementlist.length - 1].level = 0
        // }
      }
     
    }

    for(let ind in elementlist){
      if(!elementlist[ind].level)
        elementlist[ind].level = 0
    }
    this.chainList.element.elements = elementlist;
  }


  // runChain() {
  //   this.pipelineService.getChainByName(this.chainname).subscribe((res) => {
  //     this.chainedJob = res

  //       this.pipelineService.runChainedJob(this.chainedJob.jobName, this.chainedJob).subscribe(
  //         pageResponse => {
  //           this.service.message('Chain has been Started!','success');
  //         },
  //         error => {
  //           this.service.message('Error occured');
  //         }
  //       );
  //   });
  // }

  generateScript(streamItem) {
    if(streamItem.type.toUpperCase() === "NATIVESCRIPT"){
      this.numberOfScriptsGenerated += 1;
      if (this.numberOfScriptsGenerated == this.numberOfPipeline) {
        this.pipelineService.runChainedJob(this.chainedJob.jobName, this.chainedJob).subscribe(
          pageResponse => {
            this.service.message('Chain has been Started!', 'success');
            this.telemetry.addTelemetryEvent(this.chainedJob.jobName+' chain started')
          },
          error => {
            this.service.message('Error occured');
          }
        );
      }
      else {
        this.pipelineService.getPipelineByName(this.pipelineList[this.numberOfScriptsGenerated].name).subscribe(resp => {
          if(resp)
          this.generateScript(resp);
          else
          this.service.message("Pipeline not found "+this.pipelineList[this.numberOfScriptsGenerated].name+".", "error")
        });
      }
    }
    else{
    this.service.savePipelineJSON(streamItem.name, streamItem.json_content).subscribe(
      res => {
        this.service.message('Saving Pipeline Json!', 'success');
        let path = res.path;
        let body = { pipelineName: streamItem.name, scriptPath: path[0] }

        this.service.triggerPostEvent("generateScript_" + streamItem.type, body, "").subscribe(
          resp => {
            this.service.message('Generating Script for ' + streamItem.alias + '!', 'success');
            this.service.getEventStatus(resp).subscribe(
              status => {
                if (status == 'COMPLETED') {
                this.numberOfScriptsGenerated += 1;
                  if (this.numberOfScriptsGenerated == this.numberOfPipeline) {
                    this.pipelineService.runChainedJob(this.chainedJob.jobName, this.chainedJob).subscribe(
                      pageResponse => {
                        this.service.message('Chain has been Started!', 'success');
                      },
                      error => {
                        this.service.message('Error occured');
                      }
                    );
                  }
                  else {
                    this.pipelineService.getPipelineByName(this.pipelineList[this.numberOfScriptsGenerated].name).subscribe(resp => {
                     if(resp)
                      this.generateScript(resp);
                      else
                      this.service.message("Pipeline not found "+this.pipelineList[this.numberOfScriptsGenerated].name+".", "error")
                    });
                  }
                }
                else {
                  this.service.message("Script is not generated for " + streamItem.alias + ".", "error")
                  return false
                }
              });
          },
          error => {
            // this.service.message('Could not get the results', 'error');
            this.service.message('Error! Could not generate script for' + streamItem.name + '.', 'error');
            return error
          });
      },
      error => {
        this.service.message('Could not save the file for' + streamItem.name + '', 'error');
        return error
      }
    );}
    

  }

  checkGenScript() {
    this.numberOfScriptsGenerated = 0;
    this.pipelineService.getPipelineByName(this.pipelineList[this.numberOfScriptsGenerated].name).subscribe(resp => {
      if(resp)
      this.generateScript(resp);
      else
      this.service.message("Pipeline not found "+this.pipelineList[this.numberOfScriptsGenerated].name+".", "error")

    });
  }
  runChain() {
    this.pipelineService.getChainByName(this.chainname).subscribe((res) => {
      this.chainedJob = res
      this.numberOfPipeline = res.jsonContent.element.elements.length;
      this.pipelineList = res.jsonContent.element.elements;
      this.numberOfScriptsGenerated = 0;
      this.checkGenScript()
      // let arr=[]
      //   res.jsonContent.element.elements.forEach(async (element) => {
      //     arr.push(element.name);
      // Add a 1-second timeout
      //       let busy = this.service.readGeneratedScript(element.name).subscribe(
      //         async (res) => {
      //          this.numberOfScriptsGenerated+=1;
      //           if(this.numberOfScriptsGenerated==this.numberOfPipeline){
      //             this.pipelineService.runChainedJob(this.chainedJob.jobName, this.chainedJob).subscribe(
      //               pageResponse => {
      //                 this.service.message('Chain has been Started!', 'success');
      //               },
      //               error => {
      //                 this.service.message('Error occured');
      //               }
      //             );
      //           }
      //         },
      //         async error => {
      //           this.pipelineService.getPipelineByName(element.name).subscribe(resp => {

      //             this.generateScript(resp);
      //           });
      //         }
      //       );
      //       await this.sleep(2000);         
      //     });
    });
  }

  back() {
    this._location.back();
  }
}