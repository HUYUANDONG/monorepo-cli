export namespace Table {
  export interface Pageable {
    pageNum?: number;
    pageNow?: number;
    pageSize?: number;
    page: number;
    limit: number;
    total: number;
  }
  export interface StateProps {
    tableData: any[];
    pageable: Pageable;
    searchParam: {
      [key: string]: any;
    };
    searchInitParam: {
      [key: string]: any;
    };
    totalParam: {
      [key: string]: any;
    };
    icon?: {
      [key: string]: any;
    };
  }
}
