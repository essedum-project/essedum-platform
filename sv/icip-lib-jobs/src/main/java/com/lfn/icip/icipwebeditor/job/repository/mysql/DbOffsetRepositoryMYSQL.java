package com.lfn.icip.icipwebeditor.job.repository.mysql;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.job.repository.DbOffsetRepository;
import com.lfn.icip.icipwebeditor.job.util.DbOffset;

// TODO: Auto-generated Javadoc
/**
 * The Interface DbOffsetRepositoryMYSQL.
 */
@Profile("mysql")
@Repository
public interface DbOffsetRepositoryMYSQL extends DbOffsetRepository {

	/**
	 * Gets the db offset.
	 *
	 * @return the db offset
	 */
	@Query(value = "SELECT TIMESTAMPDIFF(MINUTE, NOW(), UTC_TIMESTAMP()) AS dboffset", nativeQuery = true)
	public DbOffset getDbOffset();

}
