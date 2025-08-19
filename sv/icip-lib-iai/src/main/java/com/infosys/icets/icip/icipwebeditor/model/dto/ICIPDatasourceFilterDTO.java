package com.infosys.icets.icip.icipwebeditor.model.dto;

import groovy.transform.EqualsAndHashCode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ICIPDatasourceFilterDTO {
	
    private String name;
    
    private String alias;
  
}
