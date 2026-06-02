package com.lfn.icip.icipwebeditor.job.util;

import org.springframework.stereotype.Component;

import com.lfn.icip.icipwebeditor.job.service.impl.DbOffsetService;

import lombok.Getter;

// TODO: Auto-generated Javadoc
/**
 * The Class TimeUtils.
 */
@Component

/**
 * Gets the offset.
 *
 * @return the offset
 */
@Getter
public class TimeUtils {

	/** The offset. */
	private int offset;

	/**
	 * Instantiates a new time utils.
	 *
	 * @param offsetService the offset service
	 */
	public TimeUtils(DbOffsetService offsetService) {
		this.offset = offsetService.getDBTimeOffset();
	}

}
