export interface ChartRequestParameter {
  
    columns:
    {
        x: string;
        y: string
    };
    columns_type:
    {
        x: string;
        y: string
    };
    value: string;
    chart_type: string;
    legends:
    {
        color: string;
        size: string;
        shape: string
    };
    aggregate:
    {
        x: string;
        y: string
    };
    chart_layout: string;
    period: number;
    valueaggregate: string;
    filter: any | string;
    screen: string;
   
    word_frequecy: number;
}
