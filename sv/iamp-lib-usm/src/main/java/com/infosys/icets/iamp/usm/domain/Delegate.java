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
//package com.infosys.icets.iamp.usm.domain;
//
//import java.io.Serializable;
//import java.time.LocalDateTime;
//
//import jakarta.persistence.Entity;
//import jakarta.persistence.GeneratedValue;
//import jakarta.persistence.GenerationType;
//import jakarta.persistence.Id;
//import jakarta.persistence.JoinColumn;
//import jakarta.persistence.ManyToOne;
//import jakarta.persistence.Table;
//import jakarta.persistence.Transient;
//import jakarta.validation.constraints.NotNull;
//import jakarta.validation.constraints.Size;
//
//import com.fasterxml.jackson.annotation.JsonIdentityInfo;
//import com.fasterxml.jackson.annotation.ObjectIdGenerators;
//
//import lombok.EqualsAndHashCode;
//import lombok.Getter;
//import lombok.Setter;
//import lombok.ToString;
//
//@Entity
//@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id", scope = Delegate.class)
//@Table(name = "usm_delegate")
//@Getter 
//@Setter 
//@ToString
//@EqualsAndHashCode(onlyExplicitlyIncluded = true)
//public class Delegate implements Serializable {
//
//	private static final long serialVersionUID = 1L;
//
//	@Id
//	@EqualsAndHashCode.Include
//	@GeneratedValue(strategy = GenerationType.IDENTITY)
//	private Integer id;
//
//	@JoinColumn(name = "login_id")
//	@ManyToOne
//	private Users login_id;
//
//	@NotNull
//	private Integer process_id;
//
//	@NotNull
//	private Boolean is_delegate;
//
//	@NotNull
//	@Size(max = 400)
//	private String alternate_user;
//
//	private LocalDateTime start_time;
//
//	private LocalDateTime end_time;
//
//	@NotNull
//	@Size(max = 400)
//	private String reason;
//	
//	@NotNull
//	@Size(max = 400)
//	private String comments;
//	
//	@NotNull
//	@Size(max = 400)
//	private String last_updated_user;
//	
//	@NotNull
//	private LocalDateTime last_updated_date;
//	
//	@NotNull
//	private Boolean is_active;
//	
//	@JoinColumn(name = "role_id")
//	@ManyToOne
//	private Role role_id;
//	
//	@Transient
//	private String from;
//
//	@Transient
//	private String to;
//	
//	@Transient
//	private String cc;
//	
//	@Transient
//	private String subject;
//	
//	@Transient
//	private String message;
//	
//	@Transient
//	private Boolean notifyViaMail;
//	
//	@JoinColumn(name="project_id")
//	@ManyToOne
//	private Project project_id;
//}
//
