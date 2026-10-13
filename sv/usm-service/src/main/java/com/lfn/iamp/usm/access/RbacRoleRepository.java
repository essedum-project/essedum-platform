package com.lfn.iamp.usm.access;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RbacRoleRepository extends JpaRepository<RbacRole, Integer> {
	RbacRole findByName(String name);
}
