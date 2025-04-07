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
import jakarta.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import lombok.Getter;
import lombok.Setter;

@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id", scope = RoleProcess.class)
@Table(name = "usm_role_process")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Getter
@Setter
public class RoleProcess implements Serializable {

	private static final long serialVersionUID = 1L;
	
	@Id
	@EqualsAndHashCode.Include
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@JoinColumn(name = "process_id")
	@ManyToOne
	private IcmsProcess process_id;
	
	@JoinColumn(name = "role_id")
	@ManyToOne
	private Role role_id;
	
	private Integer role_hierarchy;
	
	private LocalDateTime last_updated_date;
	
	@Size(max = 100)
	private String last_updated_user;
	
	private Boolean is_role_based_search_access;
	
	private Boolean is_role_based_reassign_access;
	
	private Boolean is_role_based_assign_access;
	
	private Boolean is_role_based_transfer_access;
	
	private Boolean is_role_based_bulkPage_access;
	
	private Boolean is_role_based_manualPage_access;
	
	@JoinColumn(name="project_id")
	@ManyToOne
	private Project project_id;

}
