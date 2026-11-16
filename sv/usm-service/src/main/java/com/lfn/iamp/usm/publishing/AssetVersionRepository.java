package com.lfn.iamp.usm.publishing;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetVersionRepository extends JpaRepository<AssetVersion, Integer> {
	List<AssetVersion> findByAssetIdIn(List<Integer> assetIds);

	List<AssetVersion> findByStatus(String status);
}
