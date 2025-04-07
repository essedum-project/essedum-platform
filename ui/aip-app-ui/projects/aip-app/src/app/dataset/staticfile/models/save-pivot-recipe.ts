export interface SavePivotObject {
    // recipe_id: number;
    user_id: number;
    object_id: number;
    recipe_name: string;
    recipe_type: string;
    transformed_file_name: string;
    function_name: string[] | string;
    args: Object[] | string;
    screen: string;
    rows: any;
    columns: any;
    values: any;
    filter: any;
    connection_id: number;
    created_timestamp: string;
    updated_timestamp: string;
    is_active: string;
}