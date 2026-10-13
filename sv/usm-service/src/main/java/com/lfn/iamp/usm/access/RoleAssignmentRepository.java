package com.lfn.iamp.usm.access;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleAssignmentRepository extends JpaRepository<RoleAssignment, Integer> {

	List<RoleAssignment> findByUserIdAndRevokedAtIsNull(Integer userId);

	List<RoleAssignment> findByRevokedAtIsNull();
}
