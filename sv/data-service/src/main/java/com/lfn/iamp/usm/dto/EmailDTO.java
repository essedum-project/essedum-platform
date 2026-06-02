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

package com.lfn.iamp.usm.dto;

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
