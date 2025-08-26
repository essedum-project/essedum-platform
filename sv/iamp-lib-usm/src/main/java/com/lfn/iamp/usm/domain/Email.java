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

package com.lfn.iamp.usm.domain;

import java.io.Serializable;
import java.time.ZonedDateTime;
import lombok.EqualsAndHashCode;

import jakarta.persistence.Column;
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
import lombok.ToString;

@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id", scope = Email.class)
@Table(name = "usm_emails")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Email implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@EqualsAndHashCode.Include
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column(name = "mail_id")
	private Integer mailId;
	
	@NotNull
	private String email_from;
	
	@NotNull
	private String email_to;
	
	private String email_cc;
	
	private String email_bcc;
	
	@NotNull
	private String email_subject;
	
	@NotNull
	private String email_body;
	
	@NotNull
	private Integer attachment_count;
	
	private Boolean is_incoming;
	
	@NotNull
	private Boolean is_processed;
	
	@NotNull
	private String mail_type;
	
	private String mail_pushed_to_folder;
	
	private String mail_box_name;
	
	private String sent_status;
	
	private String failure_reason;
	
	@NotNull
	private ZonedDateTime sent_date;
	
	@NotNull
	private Boolean is_active;
	
	private Boolean is_read_reciept;
	
	private Boolean is_delivery_notification;
	
	private String mail_archival_path;
	
	private Integer ref_id;
	
	private Integer notification_mail_id;
	
	@Column(name = "case_id")
	private String caseId;
	
	private Boolean is_follow_up;
	
	@Column(name = "is_read")
	private Boolean isRead;
	
	private String importance;
	
	private ZonedDateTime created_date;
	
	private ZonedDateTime last_updated_date;
	
	private String local_mail_archival_path;
	
	private Integer retry_count;
	
	@JoinColumn(name="project_id")
	@ManyToOne
	private Project projectId;
	
	private String attachments;
}