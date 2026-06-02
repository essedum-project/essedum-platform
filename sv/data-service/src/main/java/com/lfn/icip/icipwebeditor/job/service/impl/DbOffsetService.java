package com.lfn.icip.icipwebeditor.job.service.impl;

import java.time.ZonedDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.icip.icipwebeditor.job.repository.DbOffsetRepository;
import com.lfn.icip.icipwebeditor.job.util.DbOffset;

import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
/**
 * The Class DbOffsetService.
 */
@Service

/** The Constant log. */
@Log4j2
public class DbOffsetService {

	/** The repository. */
	@Autowired
	private DbOffsetRepository repository;

	@Autowired
//	private JobSyncExecutorService sf;
	/**
	 * Gets the DB time offset.
	 *
	 * @return the DB time offset
	 */
	public Integer getDBTimeOffset() {
		try {
			DbOffset offset = repository.getDbOffset();
			if (offset != null) {
				return offset.getDboffset();
			}
		} catch (Exception ex) {
			log.error("DBOffset not found");
		}
		int offsetinmin = 0 - (ZonedDateTime.now().getOffset().getTotalSeconds() / 60);
		log.info("Assigning " + offsetinmin + " as offset");
		return offsetinmin;
	}

}
