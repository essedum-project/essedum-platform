export interface ConnectionList {
    connection_id: number;    
    collection_name: string[];
    connection_name: string;
    connection_type: string;
    database_type: string;
    server_name: string;
    database_name: string;
    user_id: number;
    password: string;
    file_path: string;
    file_type: string;
    remarks: string;
    created_timestamp: string;
    updated_timestamp: string;
    is_active: string;
    object_id: number;
    object_name: string;
    object_type: string;
    add_query: string;
    catalog_added: string;
    group_field: string;
    object_dimensions: string[];
    datatypes_required: string;
    dataset_type: string;
}