/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

//package com.lfn.iamp.usm.domain;
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


