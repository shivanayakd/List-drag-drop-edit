/**
 * File node data with nested structure.
 * Each node has a filename, and a type or a list of children.
 */
 export class FileNode {
    constructor(
    public scopeId: number,
    public scopeName: string,
    public scopePlanSubSetups?: FileNode[],
    public help?: any,
    public parentscopeId?: number
    ){}
  }
  
  /** Flat node with expandable and level information */
  export class FileFlatNode {
    constructor(
      public expandable: boolean,
      public scopeName: string,
      public level: number,
      public scopeId: number,
      public help?: any
    ) {}
  }

  