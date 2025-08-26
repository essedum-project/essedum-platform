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

package com.infosys.icets.icip.icipwebeditor.job.quartz.model;

import java.io.Serializable;
import java.sql.Blob;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;

import lombok.Data;

// TODO: Auto-generated Javadoc
/**
 * The Class QrtzTriggers.
 * 
 * @author icets
 *
 */
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "QRTZ_TRIGGERS")
@IdClass(QrtzTriggersId.class)

/**
 * Instantiates a new qrtz triggers.
 */

/**
 * Instantiates a new qrtz triggers.
 */
@Data
public class QrtzTriggers implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The schedule name. */
	@Id
	@Column(name = "SCHED_NAME")
	private String scheduleName;

	/** The trigger name. */
	@Id
	@Column(name = "TRIGGER_NAME")
	private String triggerName;

	/** The trigger group. */
	@Id
	@Column(name = "TRIGGER_GROUP")
	private String triggerGroup;

	/** The job name. */
	@Column(name = "JOB_NAME")
	private String jobName;

	/** The job group. */
	@Column(name = "JOB_GROUP")
	private String jobGroup;

	/** The description. */
	@Column(name = "DESCRIPTION")
	private String description;

	/** The next fire time. */
	@Column(name = "NEXT_FIRE_TIME")
	private long nextFireTime;

	/** The prev fire time. */
	@Column(name = "PREV_FIRE_TIME")
	private long prevFireTime;

	/** The priority. */
	@Column(name = "PRIORITY")
	private int priority;

	/** The trigger state. */
	@Column(name = "TRIGGER_STATE")
	private String triggerState;

	/** The trigger type. */
	@Column(name = "TRIGGER_TYPE")
	private String triggerType;

	/** The start time. */
	@Column(name = "START_TIME")
	private long startTime;

	/** The end time. */
	@Column(name = "END_TIME")
	private long endTime;

	/** The calendar name. */
	@Column(name = "CALENDAR_NAME")
	private String calendarName;

	/** The misfire instr. */
	@Column(name = "MISFIRE_INSTR")
	private int misfireInstr;

	/** The job data. */
	@Column(name = "JOB_DATA")
	private String jobData;

	/**
	 * Equals.
	 *
	 * @param obj the obj
	 * @return the boolean value
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		QrtzTriggers other = (QrtzTriggers) obj;
		if (this.getCalendarName() == null) {
			if (other.getCalendarName() != null)
				return false;
		} else if (!calendarName.equals(other.getCalendarName()))
			return false;
		if (this.getDescription() == null) {
			if (other.getDescription() != null)
				return false;
		} else if (!description.equals(other.getDescription()))
			return false;
		if (this.getEndTime() != other.getEndTime())
			return false;
		if (this.getJobData() == null) {
			if (other.getJobData() != null)
				return false;
		} else if (!jobData.equals(other.getJobData()))
			return false;
		if (this.getJobGroup() == null) {
			if (other.getJobGroup() != null)
				return false;
		} else if (!jobGroup.equals(other.getJobGroup()))
			return false;
		if (this.getJobName() == null) {
			if (other.getJobName() != null)
				return false;
		} else if (!jobName.equals(other.getJobName()))
			return false;
		if (this.getMisfireInstr() != other.getMisfireInstr())
			return false;
		if (this.getNextFireTime() != other.getNextFireTime())
			return false;
		if (this.getPrevFireTime() != other.getPrevFireTime())
			return false;
		if (this.getPriority() != other.getPriority())
			return false;
		if (this.getScheduleName() == null) {
			if (other.getScheduleName() != null)
				return false;
		} else if (!scheduleName.equals(other.getScheduleName()))
			return false;
		if (this.getStartTime() != other.getStartTime())
			return false;
		if (this.getTriggerGroup() == null) {
			if (other.getTriggerGroup() != null)
				return false;
		} else if (!triggerGroup.equals(other.getTriggerGroup()))
			return false;
		if (this.getTriggerName() == null) {
			if (other.getTriggerName() != null)
				return false;
		} else if (!triggerName.equals(other.getTriggerName()))
			return false;
		if (this.getTriggerState() == null) {
			if (other.getTriggerState() != null)
				return false;
		} else if (!triggerState.equals(other.getTriggerState()))
			return false;
		if (this.getTriggerType() == null) {
			if (other.getTriggerType() != null)
				return false;
		} else if (!triggerType.equals(other.getTriggerType()))
			return false;
		return true;
	}

	/**
	 * hashCode.
	 *
	 * @return the hashcode
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((this.getCalendarName() == null) ? 0 : calendarName.hashCode());
		result = prime * result + ((this.getDescription() == null) ? 0 : description.hashCode());
		result = prime * result + (int) (this.getEndTime() ^ (this.getEndTime() >>> 32));
		result = prime * result + ((this.getJobData() == null) ? 0 : jobData.hashCode());
		result = prime * result + ((this.getJobGroup() == null) ? 0 : jobGroup.hashCode());
		result = prime * result + ((this.getJobName() == null) ? 0 : jobName.hashCode());
		result = prime * result + this.getMisfireInstr();
		result = prime * result + (int) (this.getNextFireTime() ^ (this.getNextFireTime() >>> 32));
		result = prime * result + (int) (this.getPrevFireTime() ^ (this.getPrevFireTime() >>> 32));
		result = prime * result + this.getPriority();
		result = prime * result + ((this.getScheduleName() == null) ? 0 : scheduleName.hashCode());
		result = prime * result + (int) (this.getStartTime() ^ (this.getStartTime() >>> 32));
		result = prime * result + ((this.getTriggerGroup() == null) ? 0 : triggerGroup.hashCode());
		result = prime * result + ((this.getTriggerName() == null) ? 0 : triggerName.hashCode());
		result = prime * result + ((this.getTriggerState() == null) ? 0 : triggerState.hashCode());
		result = prime * result + ((this.getTriggerType() == null) ? 0 : triggerType.hashCode());
		return result;
	}

}
