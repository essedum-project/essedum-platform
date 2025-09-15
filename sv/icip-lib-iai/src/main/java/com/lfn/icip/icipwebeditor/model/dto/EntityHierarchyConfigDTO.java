package com.lfn.icip.icipwebeditor.model.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntityHierarchyConfigDTO {
	private Integer nodeId;
    
    private String nodeName;
    
    private String nodeCode;

	private Integer parentId;
	
    private String parentName;
    
	
	private String projectId;
    
	
    private String entityCode;

    private String nodeAttributes;

    private boolean isExpanded=false;
    
    private List<EntityHierarchyConfigDTO> childNodes;

}
