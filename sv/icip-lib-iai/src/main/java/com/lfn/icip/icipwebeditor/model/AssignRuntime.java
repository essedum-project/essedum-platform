package com.lfn.icip.icipwebeditor.model;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.lfn.ai.comm.lib.util.domain.BaseDomain;
import com.lfn.icip.icipwebeditor.model.dto.ICIPStreamingServicesDTO;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignRuntime {
	/** The cid. */
	@EqualsAndHashCode.Include
	private Integer cid;

	/** The name. */
	private String name;

	private String alias;
	/** The description. */
	private String description;

	/** The job id. */
	@JsonAlias({ "job_id" })
	private String jobId;

	/** The version. */
	private Integer version;

	/** The json content. */
	@JsonAlias({ "json_content" })
	private String jsonContent;

	/** The type. */
	private String type;

	/** The organization. */
	private String organization;

	private String tags;
	private String interfacetype;
	/** The created by. */
	@JsonAlias({ "created_by" })
	private String createdBy;

	@JsonAlias({ "is_template" })
	private boolean isTemplate;

	@JsonAlias({ "is_app" })
	private boolean isApp;

	private String defaultRuntime;


}
