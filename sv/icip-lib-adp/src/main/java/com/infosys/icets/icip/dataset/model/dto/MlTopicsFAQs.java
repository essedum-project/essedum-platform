package com.infosys.icets.icip.dataset.model.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MlTopicsFAQs {

	private String organization;
	private String topicname;
	private List<String> suggested_queries;

}
