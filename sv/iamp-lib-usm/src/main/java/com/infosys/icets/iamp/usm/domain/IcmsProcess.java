/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.iamp.usm.domain;

import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.EqualsAndHashCode;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import lombok.Getter;
import lombok.Setter;

@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "process_id", scope = IcmsProcess.class)
@Table(name = "usm_process")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class IcmsProcess implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@EqualsAndHashCode.Include
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer process_id;
	
	@NotNull
	@Size(max = 255)
	private String process_name;
	
	@NotNull
	@Size(max = 255)
	private String process_display_name;
	
	@NotNull
	@Size(max = 500)
	private String process_description;
	
	@NotNull
	private String workflow_id;
	
	@NotNull
	private Boolean is_active;
	
	@NotNull
	private LocalDateTime created_date;
	
	@NotNull
	private LocalDateTime last_updated_date;
	
	@NotNull
	@Size(max = 100)
	private String last_updated_user;
	
	@JoinColumn(name="project_id")
	@ManyToOne
	private Project project_id;
	
}
