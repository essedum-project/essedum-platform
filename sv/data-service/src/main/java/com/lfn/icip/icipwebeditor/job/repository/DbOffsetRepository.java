package com.lfn.icip.icipwebeditor.job.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.lfn.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.lfn.icip.icipwebeditor.job.util.DbOffset;

// TODO: Auto-generated Javadoc
/**
 * The Interface DbOffsetRepository.
 */
@NoRepositoryBean
public interface DbOffsetRepository extends JpaRepository<ICIPInternalJobs, Integer> {

	/**
	 * Gets the db offset.
	 *
	 * @return the db offset
	 */
	public DbOffset getDbOffset();

}
