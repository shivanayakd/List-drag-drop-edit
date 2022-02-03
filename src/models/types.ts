/**
 * File node data with nested structure.
 * Each node has a filename, and a type or a list of children.
 */
 export class FileNode {
    constructor(
    public id: string,
    public filename: string,
    public children?: FileNode[],
    public info?: any
    ){}
  }
  
  /** Flat node with expandable and level information */
  export class FileFlatNode {
    constructor(
      public expandable: boolean,
      public filename: string,
      public level: number,
      public id: string,
      public info?: any
    ) {}
  }

  export interface DialogData {
    animal: string;
    name: string;
  }
  