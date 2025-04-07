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
  ComponentFactoryResolver
} from '@angular/core';
import { TreeComponent } from '@ali-hm/angular-tree-component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Drawflow from 'drawflow';
import * as _ from "lodash";
import { PipelineService } from '../services/pipeline.service'
import { Services } from '../services/service'
import { PipelinenodeDirective } from '../pipeline-node.directive';
import { TreeStructureComponent } from '../tree-structure/tree-structure.component';
import { EnlCodeEditorComponent } from '../enl-code-editor/enl-code-editor.component';
import { CreateEndpointComponent } from '../endpoint/create-endpoint/create-endpoint.component';
import { DomSanitizer } from '@angular/platform-browser';
import { LeapTelemetryService } from 'com-lib-util';

@Component({
  selector: 'app-draw-flow',
  templateUrl: './draw-flow.component.html',
  styleUrls: ['./draw-flow.component.scss'],
})
export class DrawFlowComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  nodesBkp = [];
  @Input()
  // nodes: any[] = [];
  nodes: any[] = []
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

  editor!: any;
  editDivHtml: HTMLElement;
  editButtonShown: boolean = false;

  drawnNodes: any[] = [];
  selectedNodeId: string;
  selectedNode: any = {};
  componentRef
  components

  link1
  link2
  script

  lastMousePositionEv: any;
  @ViewChild(TreeComponent, { static: false }) private tree: TreeComponent;
  @ViewChild(PipelinenodeDirective, { static: false }) pipelinenode!: PipelinenodeDirective;
  // @ViewChild('entry', {read: ViewContainerRef, static: true }) entry: ViewContainerRef;


  nodeModal: ElementRef;
  @ViewChild('content') set setNodeModal(el: ElementRef) {
    this.nodeModal = el;
  }

  constructor(
    private telemetryService: LeapTelemetryService,
    private modalService: NgbModal, private pipelineService: PipelineService,
    private service: Services, private componentFactoryResolver: ComponentFactoryResolver,
    elemRef: ElementRef, public viewContainerRef: ViewContainerRef) { 
      const selectorName = elemRef.nativeElement.tagName.toLowerCase();
      console.log("selector=",selectorName)
    }
    

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

    this.fetchPluginData()
    this.drawingData = JSON.parse(this.pipelineDetails.json_content)
    if (this.drawingData && this.drawingData.drawflow && Object.keys(this.drawingData.drawflow.Home.data).length > 0) {
      console.log('this.drawingData :>> ', this.drawingData);
      this.editor.import(this.drawingData);
    }
    // this.editor.addNode('GROUP', 0, 0, 1200, 100, 'GROUP', { elements: []},  `` );
    // this.editor.addNode('GROUP', 0, 0, 0, 100, 'GROUP', { elements: []},  `` );

  }

  ngOnDestroy(): void {
    // document.getElementsByTagName("head")[0].removeChild(this.link1)
    // document.getElementsByTagName("head")[0].removeChild(this.link2)
    // document.body.removeChild(this.script)
  }


  private resetAllInputsOutputs() {
    this.nodes.forEach((node) => {
      node.inputs = 1;
      node.outputs = 1;
    });
  }

  private addEditorEvents() {
    // Events!
    this.editor.on('nodeCreated', (id: any) => {
      console.log('Editor Event :>> Node created ' + id, this.editor.getNodeFromId(id));
      var node = this.editor.getNodeFromId(id)
      const g = {};
      const m = document.getElementById("node-" + id);
      for (var _ = 0; _ < node.data.inputs.length; _++) {
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
      for (var _ = 0; _ < node.data.outputs.length; _++) {
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
      this.pipelineDetails.jsoncontent = this.editor.drawflow
    });

    this.editor.on('nodeRemoved', (id: any) => {
      console.log('Editor Event :>> Node removed ' + id);
      Object.keys(this.editor.drawflow.drawflow.Home.data).forEach(ele => {
        if (this.editor.drawflow.drawflow.Home.data[ele].class === "GROUP") {
          const findIndex = this.editor.drawflow.drawflow.Home.data[ele].data.elements.indexOf(id);
          if (findIndex !== -1) {
            this.editor.drawflow.drawflow.Home.data[ele].data.elements.splice(findIndex, 1);
          }
        }
      })
      this.pipelineDetails.jsoncontent = this.editor.drawflow
    });

    this.editor.on('nodeSelected', (id: any) => {
      console.log('Editor Event :>> Node selected ' + id, this.editor.getNodeFromId(id));
      this.selectedNode = this.editor.drawflow.drawflow.Home.data[`${id}`];
      console.log('Editor Event :>> Node selected :>> this.selectedNode :>> ', this.selectedNode);
      console.log('Editor Event :>> Node selected :>> this.selectedNode :>> ', this.selectedNode.data);
      this.pipelineDetails.jsoncontent = this.editor.drawflow
    });

    this.editor.on('click', (e: any) => {
      console.log('Editor Event :>> Click :>> ', e);

      if (e.target.closest('.drawflow_content_node') != null || e.target.classList[0] === 'drawflow-node') {
        if (e.target.closest('.drawflow_content_node') != null) {
          this.selectedNodeId = e.target.closest('.drawflow_content_node').parentElement.id;
        } else {
          this.selectedNodeId = e.target.id;
        }
        this.selectedNode = this.editor.drawflow.drawflow.Home.data[`${this.selectedNodeId.slice(5)}`];
      }
      if (e.detail == 2) {
        const m = document.getElementById("node-" + this.selectedNode.id);
        const tempnode = m.getElementsByTagName("ng-template")
        if (tempnode && this.selectedNode.data.component && this.selectedNode.data.component!="") {
          const componentFactory =
            this.componentFactoryResolver.resolveComponentFactory(this.components[this.selectedNode.data.component]);
          if (this.pipelinenode) {
            const viewContainerRef = this.pipelinenode.viewContainerRef;
            viewContainerRef.clear();
            this.componentRef?.destroy();

            this.componentRef =
              viewContainerRef.createComponent(componentFactory);
            this.componentRef.instance.data = this.selectedNode.data;
            this.componentRef.instance.event?.subscribe(value => {
              for (let key in value) {
                this.editor.drawflow.drawflow.Home.data[`${this.selectedNodeId.slice(5)}`].data[key] = value[key]
              }
            });
            const ele = document.getElementById("ele")
            ele.id = ""
            tempnode[0].parentNode.appendChild(ele)
            // tempnode["pnode"].remove()
          }

        }
      }

      if (e.target.closest('#editNode') != null || e.target.classList[0] === 'edit-node-button') {
        // Open modal with Selected Node
        this.open(this.nodeModal, this.selectedNodeId);
      }

      if (e.target.closest('#editNode') === null) {
        this.hideEditButton();
      }
      this.pipelineDetails.jsoncontent = this.editor.drawflow
    });



    this.editor.on('moduleCreated', (name: any) => {
      console.log('Editor Event :>> Module Created ' + name);
      this.pipelineDetails.jsoncontent = this.editor.drawflow
    });

    this.editor.on('moduleChanged', (name: any) => {
      console.log('Editor Event :>> Module Changed ' + name);
      this.pipelineDetails.jsoncontent = this.editor.drawflow
    });

    this.editor.on('connectionCreated', (connection: any) => {
      console.log('Editor Event :>> Connection created ', connection);
      const nodeInfo = this.editor.getNodeFromId(connection.input_id);
      const outNodeInfo = this.editor.getNodeFromId(connection.output_id);
      if (!nodeInfo.data.inputOptions || (nodeInfo.data.inputOptions && !nodeInfo.data.inputOptions[connection.input_class])) { }
      else if (nodeInfo.data.inputOptions[connection.input_class] != outNodeInfo.name) {
        const length = nodeInfo.inputs[connection.input_class].connections.length
        const removeConnectionInfo = nodeInfo.inputs[connection.input_class].connections[length - 1];
        this.editor.removeSingleConnection(removeConnectionInfo.node, connection.input_id, removeConnectionInfo.input, connection.input_class);
        this.service.messageService("Connection not allowed", "Error");
      }
      this.pipelineDetails.jsoncontent = this.editor.drawflow
    });

    this.editor.on('connectionRemoved', (connection: any) => {
      console.log('Editor Event :>> Connection removed ', connection);
      this.pipelineDetails.jsoncontent = this.editor.drawflow
    });

    this.editor.on('contextmenu', (e: any) => {
      console.log('Editor Event :>> Context Menu :>> ', e);

      if (e.target.closest('.drawflow_content_node') != null || e.target.classList[0] === 'drawflow-node') {
        if (e.target.closest('.drawflow_content_node') != null) {
          this.selectedNodeId = e.target.closest('.drawflow_content_node').parentElement.id;
        } else {
          this.selectedNodeId = e.target.id;
        }
        this.selectedNode = this.editor.drawflow.drawflow.Home.data[`${this.selectedNodeId.slice(5)}`];

        this.showEditButton();
      }
      this.pipelineDetails.jsoncontent = this.editor.drawflow
    });

    this.editor.on('zoom', (zoom: any) => {
      console.log('Editor Event :>> Zoom level ' + zoom);
      this.pipelineDetails.jsoncontent = this.editor.drawflow
    });

    this.editor.on('addReroute', (id: any) => {
      console.log('Editor Event :>> Reroute added ' + id);
      this.pipelineDetails.jsoncontent = this.editor.drawflow
    });

    this.editor.on('removeReroute', (id: any) => {
      console.log('Editor Event :>> Reroute removed ' + id);
      this.pipelineDetails.jsoncontent = this.editor.drawflow
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

  private showEditButton() {
    this.editButtonShown = true;
    this.editDivHtml = document.createElement('div');
    this.editDivHtml.id = 'editNode';
    this.editDivHtml.innerHTML = '<i class="fas fa-pen"></i>';
    this.editDivHtml.style.display = 'block';
    this.editDivHtml.style.position = 'absolute';
    this.editDivHtml.className = 'edit-node-button';

    const selectedNodeHtml = document.getElementById(this.selectedNodeId);
    selectedNodeHtml.append(this.editDivHtml);
  }

  private hideEditButton() {
    this.editButtonShown = false;
    this.editDivHtml = document.getElementById('editNode');
    if (this.editDivHtml) {
      this.editDivHtml.remove();
    }
  }

  open(content: any, nodeId: string) {
    this.hideEditButton();

    const oldNodeIdNumber = parseInt(nodeId.slice(5));
    this.selectedNode = this.editor.drawflow.drawflow.Home.data[`${oldNodeIdNumber}`];
    const oldNodeStringified = JSON.stringify(this.selectedNode);
    // const { inputsCount, outputsCount } = this.countInOutputsOfNode(JSON.parse(oldNodeStringified));

    const modalRef = this.modalService.open(content, { size: 'xl', backdrop: 'static', keyboard: false });

    modalRef.dismissed.subscribe((reason) => {
      if (typeof reason == 'object') {
        const newDrawnNode = reason;
        newDrawnNode.name = newDrawnNode.data.name;
        newDrawnNode.html = `<div>${newDrawnNode.name}</div>`;

        if (oldNodeStringified != JSON.stringify(this.selectedNode)) {
          // Create Node
          newDrawnNode.id = this.editor.addNode(
            newDrawnNode.name,
            1,
            1,
            newDrawnNode.pos_x,
            newDrawnNode.pos_y,
            newDrawnNode.class,
            newDrawnNode.data,
            newDrawnNode.html,
            newDrawnNode.typenode
          );

          // Reestablish connections
          this.reestablishOldConnections(JSON.parse(oldNodeStringified), newDrawnNode.id);

          // Remove Old Node
          this.editor.removeNodeId(nodeId);
        }
      }
    });
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
    console.log('changes :>> ', changes);

    if (
      changes.drawingData &&
      changes.drawingData.currentValue &&
      changes.drawingData.currentValue.length > 0 &&
      Object.keys(JSON.parse(changes.drawingData.currentValue).drawflow.Home.data).length > 0
    ) {
      this.editor.import(JSON.parse(changes.drawingData.currentValue));
    }
  }

  ngOnInit(): void {
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
    // this.initDrawingBoard();
    // this.editor.editor_mode = this.locked != null && this.locked == false ? 'edit' : 'fixed';
  }

  telemetryImpression() {
    this.telemetryService.start();
    this.telemetryService.impression("aip-app", "list", "DrawFlowComponent");
  }

  ngAfterViewInit(): void {
    this.initDrawingBoard();
    this.editor.editor_mode = this.locked != null && this.locked == false ? 'edit' : 'fixed';
  }


  onDrawflowEvent(e: any) {
    switch (e.type) {
      case 'dragstart':
        console.log('Drawflow Event: DragStart :>> e :>> ', e);
        this.selectedNode = {}
        this.selectedNode.data = JSON.parse(
          JSON.stringify([...this.nodesBkp].find((node) => node.name === e.target.outerText?.trim()))
        );
        break;
      case 'dragenter':
        console.log('Drawflow Event: DragEnter :>> e :>> ', e);
        break;
      case 'dragover':
        console.log('Drawflow Event: DragOver :>> e :>> ', e);
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'dragleave':
        console.log('Drawflow Event: DragLeave :>> e :>> ', e);
        break;
      case 'drop':
        console.log('Drawflow Event: Drop :>> e :>> ', e);
        e.preventDefault();
        this.addNodeToDrawBoard(e.clientX, e.clientY);
        // this.resetAllInputsOutputs();
        break;

      default:
        console.log('Other Drawflow Event :>> e :>> ', e);
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

      console.log('addNodeToDrawBoard :>> this.selectedNode :>> ', this.selectedNode);

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
      console.log("editor:=", this.editor)
    }
  }

  onClear() {
    this.editor.clear();
  }

  onSave() {
    console.log("editor values=", this.editor.drawflow)
    // this.streamItem.json_content = JSON.stringify(this.newCanvas);
    //   this.busy = this.streamingServicesService.update(this.streamItem).subscribe(
    //     response => {
    //       if (run)
    //         this.messageService.info('Updated!', 'Updated Successfully');
    //       this.ngOnInit();
    //     },
    //     error => {
    //       if (run)
    //         this.messageService.error(
    //           'Error!',
    //           'Canvas not updated due to error: ' + error
    //         )
    //     }
    //   );    
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
    console.log(this.transform);

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

  fetchPluginData() {
    this.pipelineService.listJsonByType(this.pipelineDetails.type).subscribe(response => {
      this.nodes = [];
      let resp = JSON.parse(response)
      this.nodesBkp = JSON.parse(resp.pluginData);
      var data = JSON.parse(resp.pluginData),
        tree = function (data, root) {
          var t = {};
          data.forEach(({ id, parentCategory, alias, name, inputs, inputOptions, outputs,
            position_x, position_y, codeGeneration, icon }) => {
            let iconPresent = icon ? "fa fa-" + icon : ""
            Object.assign(t[id] = t[id] || {},
              {
                label: id,
                name: name,
                alias: alias,
                inputs: inputs,
                inputOptions: inputOptions,
                outputs: outputs,
                position_x: position_x,
                position_y: position_y,
                codeGeneration: codeGeneration,
                icon: iconPresent
              });
            t[parentCategory] = t[parentCategory] || {};
            t[parentCategory].children = t[parentCategory].children || [];
            t[parentCategory].children.push(t[id]);
          });
          return t[root].children;
        }(data, "");

      console.log(tree);
      this.nodes = tree;
      this.tree.treeModel.update();
      this.tree.sizeChanged();
    });
  }
}
