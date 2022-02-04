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


 @Injectable({
  providedIn: 'root'
})
 export class FiledataService {
   Data = [
    {
      "scopeId": 2,
      "scopeName": "Background",
      "orderId": 1,
      "help": "Helllo I am Help 1",
      "scopePlanSubSetups": [
        {
          "scopeId": 1,
          "parentscopeId": 2,
          "scopeName": "Purpose of this Document",
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
          "scopeId": 4,
          "parentscopeId": 3,
          "scopeName": "Nonconformity and corrective action",
          "orderId": 0
        },
        {
          "scopeId": 5,
          "parentscopeId": 3,
          "scopeName": "Continual Improvement",
          "orderId": 0
        }
      ]
    },
    {
      "scopeId": 6,
      "scopeName": "Scope of the ISMS",
      "orderId": 2,
      "help": "Helllo I am Help 15",
      "scopePlanSubSetups": [
        {
          "scopeId": 7,
          "parentscopeId": 4,
          "scopeName": "Scope exclusion",
          "orderId": 0
        },
        {
          "scopeId": 8,
          "parentscopeId": 4,
          "scopeName": "Scope Description",
          "orderId": 0
        }
      ]
    },
    {
      "scopeId": 9,
      "scopeName": "ISMS Policy",
      "orderId": 3,
      "help": "Helllo I am Help 251",
      "scopePlanSubSetups": [
        {
          "scopeId": 10,
          "parentscopeId": 5,
          "scopeName": "Objectives of the ISMS",
          "orderId": 0
        },
        {
          "scopeId": 11,
          "parentscopeId": 5,
          "scopeName": "Applicability",
          "orderId": 0
        }
      ]
    }];

   dataChange = new BehaviorSubject<FileNode[]>([]);
 
   get data(): FileNode[] { return this.dataChange.value; }
 
   constructor() {
     this.initialize();
   }
 
   initialize() {
     this.dataChange.next(this.Data);
   }

   addNode(obj: any) {

    const node = {
      "scopeId": +this.uid(),
      "scopeName": obj.scopeName,
      "orderId": 2,
      "help": obj.help,
      "scopePlanSubSetups": []
    }
    this.Data.push(node);
    this.dataChange.next(this.Data);
   }

   removeNode(scopeId: number) {
    this.Data = this.Data.filter(element => {
      if(element.scopePlanSubSetups) element.scopePlanSubSetups = element.scopePlanSubSetups.filter(child => child.scopeId !== scopeId);
      return element.scopeId !== scopeId;
    });
    this.dataChange.next(this.Data);
   }

   addChildNode(scopeId: number, obj: any) {
    const node = {
      "scopeId": +this.uid(),
      "parentscopeId": scopeId,
      "scopeName": obj.scopeName,
      "orderId": 2,
    }

    this.Data = this.Data.map((scope) => {
      if(scope.scopeId !== scopeId) return scope;
        scope.scopePlanSubSetups.push(node);
      return scope;
    })

    this.dataChange.next(this.Data);
   }

   uid(){
    return Date.now() + Math.random();
  }
 }