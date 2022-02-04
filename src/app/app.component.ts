import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, OnInit} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {Observable, of as observableOf} from 'rxjs';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FileFlatNode, FileNode } from 'src/models/types';
import { FiledataService } from 'src/services/filedata.service';
import { FormBuilder, FormGroup } from '@angular/forms';

/**
 * @title Tree with flat nodes
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  // providers: [FileDatabase]
})
export class AppComponent implements OnInit {

  treeControl: FlatTreeControl<FileFlatNode>;
  treeFlattener: MatTreeFlattener<FileNode, FileFlatNode>;
  dataSource: MatTreeFlatDataSource<FileNode, FileFlatNode>;
  // expansion model tracks expansion state
  expansionModel = new SelectionModel<number>(true);
  dragging = false;
  expandTimeout: any;
  expandDelay = 1000;
  validateDrop = true;
  activeEditNodeId: string = '';
  newItem: string = '';
  addType: any;
  showedit: boolean = false;
  scopeForm: FormGroup = this.fb.group({
    scopeName: [''],
    help: ['']
  });

  constructor(private database: FiledataService, private fb: FormBuilder) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
      this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<FileFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    database.dataChange.subscribe(data => this.rebuildTreeForData(data));
  }

  ngOnInit(): void {
  }

  transformer = (node: FileNode, level: number) => {
    // console.log('>>>>>> transformer', node);
    return new FileFlatNode(!!node.scopePlanSubSetups, node.scopeName, level, node.scopeId, node.help);
  }
  private _getLevel = (node: FileFlatNode) => node.level;
  private _isExpandable = (node: FileFlatNode) => node.expandable;
  private _getChildren = (node: FileNode): Observable<FileNode[]> => observableOf(node.scopePlanSubSetups || []);
  hasChild = (_: number, _nodeData: FileFlatNode) => _nodeData.expandable;

  // DRAG AND DROP METHODS

  shouldValidate(event: MatCheckboxChange): void {
    this.validateDrop = event.checked;
  }

  /**
   * This constructs an array of nodes that matches the DOM
   */
  visibleNodes(): FileNode[] {
    const result: FileNode[] = [];

    function addExpandedChildren(node: FileNode, expanded: number[]) {
      result.push(node);
      if (expanded.includes(node.scopeId) && node.scopePlanSubSetups) {
        node.scopePlanSubSetups.map((child) => addExpandedChildren(child, expanded));
      }
    }
    this.dataSource.data.forEach((node) => {
      addExpandedChildren(node, this.expansionModel.selected);
    });
    return result;
  }

  /**
   * Handle the drop - here we rearrange the data based on the drop event,
   * then rebuild the tree.
   * */
  drop(event: CdkDragDrop<string[]>) {
    // console.log('origin/destination', event.previousIndex, event.currentIndex);
  
    // ignore drops outside of the tree
    if (!event.isPointerOverContainer) return;

    // construct a list of visible nodes, this will match the DOM.
    // the cdkDragDrop event.currentIndex jives with visible nodes.
    // it calls rememberExpandedTreeNodes to persist expand state
    const visibleNodes = this.visibleNodes();

    // deep clone the data source so we can mutate it
    const changedData = JSON.parse(JSON.stringify(this.dataSource.data));

    // recursive find function to find siblings of node
    function findNodeSiblings(arr: Array<any>, id: number) {
      let result, subResult;
      arr.forEach((item, i) => {
        if (item.scopeId && item.scopeId === id) {
          result = arr;
        } else if (item.scopePlanSubSetups) {
          subResult = findNodeSiblings(item.scopePlanSubSetups, id);
          if (subResult) result = subResult;
        } else {
          // console.log('>>>>>>>');
        }
      });
      return result;
    }
    
    // determine where to insert the node
    const nodeAtDest = visibleNodes[event.currentIndex] || [];
    const newSiblings:Array<any> = findNodeSiblings(changedData, nodeAtDest.scopeId) || [];
    if (!newSiblings) return;
    const insertIndex = newSiblings.findIndex(s => s.scopeId === nodeAtDest.scopeId);

    // remove the node from its old place
    const node = event.item.data;
    const siblings:Array<any> = findNodeSiblings(changedData, node.scopeId) || [];
    const siblingIndex = siblings.findIndex(n => n.scopeId === node.scopeId);
    const nodeToInsert: FileNode = siblings.splice(siblingIndex, 1)[0];
    if (nodeAtDest?.scopeId === nodeToInsert?.scopeId) return;
    // ensure validity of drop - must be same level
    const nodeAtDestFlatNode = this.treeControl.dataNodes.find((n) => nodeAtDest.scopeId === n.scopeId);
    if (this.validateDrop && nodeAtDestFlatNode?.level !== node.level) {
      alert('Items can only be moved within the same level.');
      return;
    }
    
    // insert node 
    console.log('>>>>>> changed',  changedData);
    newSiblings.splice(insertIndex, 0, nodeToInsert);
    // rebuild tree with mutated data
    this.rebuildTreeForData(changedData);
  }

  /**
   * Experimental - opening tree nodes as you drag over them
   */
  dragStart() {
    this.dragging = true;
  }
  dragEnd() {
    this.dragging = false;
  }
  dragHover(node: FileFlatNode) {
    if (this.dragging) {
      clearTimeout(this.expandTimeout);
      this.expandTimeout = setTimeout(() => {
        this.treeControl.expand(node);
      }, this.expandDelay);
    }
  }
  dragHoverEnd() {
    if (this.dragging) {
      clearTimeout(this.expandTimeout);
    }
  }

  /**
   * The following methods are for persisting the tree expand state
   * after being rebuilt
   */

  rebuildTreeForData(data: any) {
    this.dataSource.data = data;
    this.expansionModel.selected.forEach((id) => {
        const node = this.treeControl.dataNodes.find((n) => n.scopeId === id);
        if(node) this.treeControl.expand(node);
      });
  }

  /**
   * Not used but you might need this to programmatically expand nodes
   * to reveal a particular node
   */
  private expandNodesById(flatNodes: FileFlatNode[], ids: number[]) {
    if (!flatNodes || flatNodes.length === 0) return;
    const idSet = new Set(ids);
    return flatNodes.forEach((node) => {
      if (idSet.has(node.scopeId)) {
        this.treeControl.expand(node);
        let parent = this.getParentNode(node);
        while (parent) {
          this.treeControl.expand(parent);
          parent = this.getParentNode(parent);
        }
      }
    });
  }

  private getParentNode(node: FileFlatNode): FileFlatNode | null {
    const currentLevel = node.level;
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (currentNode.level < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  onSave(eve: Event, node: FileFlatNode, nodeVal: string) {
    const updated = this.dataSource.data.map(element => {
      if(element.scopeId === node.scopeId) {
        element.scopeName = nodeVal;
        return element;
      }else if(element.scopePlanSubSetups && element.scopePlanSubSetups.length > 0) {
        const updateChild = element.scopePlanSubSetups.map(child => {
          if(child.scopeId !== node.scopeId) {
            return child;
          }
          child.scopeName = nodeVal;
          return child;
        })
        element.scopePlanSubSetups = updateChild;
      } 
      return element;
    });
    const changedData = JSON.parse(JSON.stringify(updated));
    this.rebuildTreeForData(changedData);
    this.activeEditNodeId = "";
  }

  onDelete(node: FileFlatNode) {
    this.database.removeNode(node.scopeId);
    this.activeEditNodeId = "";
  }

  onAddChild(node: FileFlatNode, nodeVal: string) {
    this.addType = {type: 'child', parentId: node.scopeId};
    this.scopeForm.get("help")?.disable();
    this.showedit = true;
  }

  addItem() {
    this.addType = {type: 'parent', parentId: null};
    this.scopeForm.get("help")?.enable();
    this.activeEditNodeId = "";
    this.showedit = true;
  }
  
  formSubmit() {
    if(this.addType.type === 'parent') {
      this.database.addNode(this.scopeForm.value);
    }
    if(this.addType.type === 'child') {
      this.database.addChildNode(this.addType.parentId, this.scopeForm.value);
    }
    this.showedit = false;
  }

  _hasChildren(id: number) {
    const element: FileNode = this.dataSource.data.filter((ele) => ele.scopeId === id)[0];
    return element.scopePlanSubSetups && element.scopePlanSubSetups.length > 0;;
  }
}