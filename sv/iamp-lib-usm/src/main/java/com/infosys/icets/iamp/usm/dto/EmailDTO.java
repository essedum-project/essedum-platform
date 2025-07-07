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
package com.infosys.icets.iamp.usm.dto;

import java.time.ZonedDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmailDTO {

	private Integer id;
	
	private Integer mailId;
	
	private String email_from;
	
	private String email_to;
	
	private String email_cc;
	
	private String email_bcc;
	
	private String email_subject;
	
	private String email_body;
	
	private Integer attachment_count;
	
	private Boolean is_incoming;
	
	private Boolean is_processed;
	
	private String mail_type;
	
	private String mail_pushed_to_folder;
	
	private String mail_box_name;
	
	private String sent_status;
	
	private String failure_reason;
	
	private ZonedDateTime sent_date;
	
	private Boolean is_active;
	
	private Boolean is_read_reciept;
	
	private Boolean is_delivery_notification;
	
	private String mail_archival_path;
	
	private Integer ref_id;
	
	private Integer notification_mail_id;
	
	private String caseId;
	
	private Boolean is_follow_up;
	
	private Boolean isRead;
	
	private String importance;
	
	private ZonedDateTime created_date;
	
	private ZonedDateTime last_updated_date;
	
	private String local_mail_archival_path;
	
	private Integer retry_count;

	private ProjectDTO projectId;
	
	private String attachments;
}
