/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FileNode } from 'src/models/types';


/**
 * The file structure tree data in string. The data could be parsed into a Json object
 */
 const TREE_DATA = JSON.stringify({
  Applications: {
    Calendar: 'app',
    Chrome: 'app',
    Webstorm: 'app'
  },
    angular: {
        compiler: 'ts',
        core: 'ts'
    },
    material2: {
        button: 'ts',
        checkbox: 'ts',
        input: 'ts'
    },
  Downloads: {
    October: 'pdf',
    November: 'pdf',
    Tutorial: 'html'
  },
  Baloons: {
    October: 'pdf',
    November: 'pdf',
    Tutorial: 'html'
  },
  Pictures: {
    Sun: 'png',
    Woods: 'jpg',
    Contents: 'dir',
    Pictures: 'dir'
  }
});

const NEW_DATA = [
  {
      "id": "1",
      "children": [
          {
              "id": "1/1",
              "filename": "Calendar",
              "children": []
          },
          {
              "id": "1/2",
              "filename": "Chrome",
              "children": []
          },
          {
              "id": "1/3",
              "filename": "Webstorm",
              "children": []
          }
      ],
      "filename": "Applications",
      "info": "info 1"
  },
  {
      "id": "2",
      "children": [
          {
              "id": "2/1",
              "filename": "compiler",
              "children": []
          },
          {
              "id": "2/2",
              "filename": "core",
              "children": []
          }
      ],
      "filename": "angular",
      "info": "info 2"
  },
  {
      "id": "3",
      "children": [
          {
              "id": "3/1",
              "filename": "button",
              "children": []
          },
          {
              "id": "3/2",
              "filename": "checkbox",
              "children": []
          },
          {
              "id": "3/3",
              "filename": "input",
              "children": []
          }
      ],
      "filename": "material2",
      "type": "info3"
  },
  {
      "id": "4",
      "children": [
          {
              "id": "4/1",
              "filename": "October",
              "children": []
          },
          {
              "id": "4/2",
              "filename": "November",
              "children": []
          },
          {
              "id": "4/3",
              "filename": "Tutorial",
              "children": []
          }
      ],
      "filename": "Downloads",
      "info": "info 4"
  }
]

const Data = [
  {
    "scopeId": 2,
    "scopeName": "Background",
    "orderId": 1,
    "help": "Helllo I am Help 1",
    "scopePlanSubSetups": [
      {
        "scopeSubId": 1,
        "scopeId": 2,
        "scopeSubName": "Purpose of this Document",
        "orderId": 0
      }
    ]
  },
  {
    "scopeId": 3,
    "scopeName": "Improvement",
    "orderId": 10,
    "help": "Helllo I am Help 12",
    "scopePlanSubSetups": [
      {
        "scopeSubId": 2,
        "scopeId": 3,
        "scopeSubName": "Nonconformity and corrective action",
        "orderId": 0
      },
      {
        "scopeSubId": 3,
        "scopeId": 3,
        "scopeSubName": "Continual Improvement",
        "orderId": 0
      }
    ]
  },
  {
    "scopeId": 4,
    "scopeName": "Scope of the ISMS",
    "orderId": 2,
    "help": "Helllo I am Help 15",
    "scopePlanSubSetups": [
      {
        "scopeSubId": 4,
        "scopeId": 4,
        "scopeSubName": "Scope exclusion",
        "orderId": 0
      },
      {
        "scopeSubId": 5,
        "scopeId": 4,
        "scopeSubName": "Scope Description",
        "orderId": 0
      }
    ]
  },
  {
    "scopeId": 5,
    "scopeName": "ISMS Policy",
    "orderId": 3,
    "help": "Helllo I am Help 251",
    "scopePlanSubSetups": [
      {
        "scopeSubId": 6,
        "scopeId": 5,
        "scopeSubName": "Objectives of the ISMS",
        "orderId": 0
      },
      {
        "scopeSubId": 7,
        "scopeId": 5,
        "scopeSubName": "Applicability",
        "orderId": 0
      }
    ]
  }];
 @Injectable({
  providedIn: 'root'
})
 export class FiledataService {
   dataChange = new BehaviorSubject<FileNode[]>([]);
 
   get data(): FileNode[] { return this.dataChange.value; }
 
   constructor() {
     this.initialize();
   }
 
   initialize() {
     // Parse the string to json object.
     const dataObject = JSON.parse(TREE_DATA);
 
     // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
     //     file node as children.
     const data = this.buildFileTree(dataObject, 0);
     // Notify the change.
     this.dataChange.next(NEW_DATA);
   }
 
   /**
    * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
    * The return value is the list of `FileNode`.
    */
   buildFileTree(obj: {[key: string]: any}, level: number, parentId: string = '0'): FileNode[] {
     return Object.keys(obj).reduce<FileNode[]>((accumulator, key, idx) => {
       const value = obj[key];
       const node = new FileNode('','',[],'');
       node.filename = key;
       /**
        * Make sure your node has an id so we can properly rearrange the tree during drag'n'drop.
        * By passing parentId to buildFileTree, it constructs a path of indexes which make
        * it possible find the exact sub-array that the node was grabbed from when dropped.
        */
       node.id = `${parentId}/${idx}`;
 
       if (value != null) {
         if (typeof value === 'object') {
           node.children = this.buildFileTree(value, level + 1, node.id);
         } else {
           node.info = value;
         }
       }
 
       return accumulator.concat(node);
     }, []);
   }
 }