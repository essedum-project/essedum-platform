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
