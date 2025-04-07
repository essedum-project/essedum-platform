export interface ChartRequestParameter {
    object_id: number;
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
    user_id: number;
    word_frequecy: number;
}
