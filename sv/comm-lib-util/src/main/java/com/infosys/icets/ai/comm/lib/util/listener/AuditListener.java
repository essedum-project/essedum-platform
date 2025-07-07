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
package com.infosys.icets.ai.comm.lib.util.listener;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.Instant;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.infosys.icets.ai.comm.lib.util.logger.AuditLogger;

import ch.qos.logback.classic.LoggerContext;

public class AuditListener {

	private final Logger logger = LoggerFactory.getLogger(AuditLogger.class);

	@PrePersist
	public void onPrePersist(Object obj) {
		audit("INSERT", obj);
	}

	@PreUpdate
	public void onPreUpdate(Object obj) {
		audit("UPDATE", obj);
	}

	@PreRemove
	public void onPreRemove(Object obj) {
		audit("DELETE", obj);
	}

	private void audit(String operation, Object obj) {
		Timestamp now = Timestamp.from(Instant.now());
		Date date = new Date(System.currentTimeMillis());
		LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
		loggerContext.putProperty("auditmarker", date.toString());
		logger.info("{} on {} at {}", operation, obj.getClass().getSimpleName(), now);
		logger.info("Entity : {}", new Gson().toJson(obj));
	}

}
