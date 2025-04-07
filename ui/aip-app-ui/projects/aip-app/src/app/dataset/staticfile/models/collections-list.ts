import { ConnectionList } from './connection-list';

export interface CollectionList {
    collection_name: string;
    // collection_id: number;
    user_id: number;
    description: string;
    connectionsCreated: ConnectionList[];
}
export interface CreateCollection {
    collection_name: string;
}