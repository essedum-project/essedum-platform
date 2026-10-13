package com.lfn.iamp.usm.publishing;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Integer> {
	List<Asset> findByProjectIdIn(List<Integer> projectIds);
}
