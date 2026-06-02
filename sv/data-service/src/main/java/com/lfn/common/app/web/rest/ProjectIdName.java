package com.lfn.common.app.web.rest;

import org.springframework.stereotype.Component;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Component
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectIdName {

	int projectId;
	String projectName;
} 
