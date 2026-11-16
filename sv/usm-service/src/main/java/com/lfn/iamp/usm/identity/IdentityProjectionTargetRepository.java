package com.lfn.iamp.usm.identity;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IdentityProjectionTargetRepository extends JpaRepository<IdentityProjectionTarget, Integer> {
	List<IdentityProjectionTarget> findByProjectId(Integer projectId);

	List<IdentityProjectionTarget> findBySyncStatus(String syncStatus);
}
