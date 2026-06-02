package com.lfn.icip.icipwebeditor.job.repository.mssql;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.job.repository.DbOffsetRepository;
import com.lfn.icip.icipwebeditor.job.util.DbOffset;

// TODO: Auto-generated Javadoc
/**
 * The Interface DbOffsetRepositoryMSSQL.
 */
@Profile("mssql")
@Repository
public interface DbOffsetRepositoryMSSQL extends DbOffsetRepository {

	/**
	 * Gets the db offset.
	 *
	 * @return the db offset
	 */
	@Query(value = "SELECT DATEDIFF(MINUTE, GETDATE(), GETUTCDATE()) as dboffset", nativeQuery = true)
	public DbOffset getDbOffset();

}
