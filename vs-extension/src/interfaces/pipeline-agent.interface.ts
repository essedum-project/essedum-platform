export interface PipelineAgentCard {
    type: string;
    alias: string;
    createdDate: string;
    created_by: string;
    id: string;
    [key: string]: any;
}

/**
 * Project info interface
 */
export interface ProjectInfo {
  id?: number | string;
  projectId?: number | string;
  name?: string;
  projectname?: string;
}

/**
 * Role info interface
 */
export interface RoleInfo {
  id?: number | string;
  roleId?: number | string;
  name?: string;
  rolename?: string;
}