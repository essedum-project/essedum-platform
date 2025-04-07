export interface EntityDetails {
    status_message: string;
    response: ResponseDetails;
}

export interface ResponseDetails {
    object_id: number;
    object_name: string;
    object_type: string;
    connection_id: number;
    // collection_id: number;
    collection_name: string;
    add_query: string;
    catalog_added: string;
    created_timestamp: string;
    updated_timestamp: string;
    is_active: string;
    connection_name: string;
    dataframe: string;
}