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

package com.lfn.ai.comm.lib.util.listener;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.Instant;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.lfn.ai.comm.lib.util.logger.AuditLogger;

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
