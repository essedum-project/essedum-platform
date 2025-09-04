package com.lfn.icip.icipwebeditor.job.repository.postgresql;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.job.repository.DbOffsetRepository;
import com.lfn.icip.icipwebeditor.job.util.DbOffset;

// TODO: Auto-generated Javadoc
/**
 * The Interface DbOffsetRepositorypostgresql.
 */
@Profile("postgresql")
@Repository
public interface DbOffsetRepositoryPOSTGRESQL extends DbOffsetRepository {

	/**
	 * Gets the db offset.
	 *
	 * @return the db offset
	 */
	@Query(value = "SELECT Extract (epoch FROM (NOW() - (NOW() at time zone 'utc')))/60 AS dboffset", nativeQuery = true)
	public DbOffset getDbOffset();

}
