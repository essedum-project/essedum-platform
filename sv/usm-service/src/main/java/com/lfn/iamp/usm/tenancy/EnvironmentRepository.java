package com.lfn.iamp.usm.tenancy;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnvironmentRepository extends JpaRepository<Environment, Integer> {
	List<Environment> findByProjectId(Integer projectId);
}
