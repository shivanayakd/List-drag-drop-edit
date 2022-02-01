/**
 * File node data with nested structure.
 * Each node has a filename, and a type or a list of children.
 */
 export class FileNode {
    constructor(
    public id: string,
    public children: FileNode[],
    public filename: string,
    public type: any
    ){}
  }
  
  /** Flat node with expandable and level information */
  export class FileFlatNode {
    constructor(
      public expandable: boolean,
      public filename: string,
      public level: number,
      public type: any,
      public id: string
    ) {}
  }