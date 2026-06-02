package com.lfn.ai.comm.lib.util.dto;

import org.springframework.data.domain.Pageable;

import com.lfn.iamp.usm.domain.Project;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Secret {

	String key;
	String value;
	Integer id;
	String secretStore;
	String accessUrl;
	String organization;
	Project project;
	Pageable pageable;
	
	private String search;

	// Add getter and setter methods
	public String getSearch() {
	    return search;
	}

	public void setSearch(String search) {
	    this.search = search;
	}
	
}
