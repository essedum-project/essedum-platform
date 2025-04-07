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

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EmailPartialDTO {

	private Integer id;

	private Integer mailId;

	private String email_from;

	private String email_to;

	private String email_cc;

	private String email_bcc;

	private String email_subject;
	
	private String mail_type;
	
	private String sent_status;

	private ZonedDateTime sent_date;

	private String caseId;
	
	private Boolean isRead;
	
	public EmailPartialDTO(Integer id, String email_from, String email_subject, String mail_type, String sent_status,
			ZonedDateTime sent_date, String caseId, Boolean isRead) {
		super();
		this.id = id;
		this.email_from = email_from;
		this.email_subject = email_subject;
		this.mail_type = mail_type;
		this.sent_status = sent_status;
		this.sent_date = sent_date;
		this.caseId = caseId;
		this.isRead = isRead;
	}

	public EmailPartialDTO(Integer id, Integer mailId, String email_from, String email_to, String email_cc,
			String email_bcc, String email_subject, ZonedDateTime sent_date, String caseId) {
		super();
		this.id = id;
		this.mailId = mailId;
		this.email_from = email_from;
		this.email_to = email_to;
		this.email_cc = email_cc;
		this.email_bcc = email_bcc;
		this.email_subject = email_subject;
		this.sent_date = sent_date;
		this.caseId = caseId;
	}

}
