package com.lfn.iamp.usm.publishing;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionEventRepository extends JpaRepository<PromotionEvent, Integer> {
	List<PromotionEvent> findByAssetVersionId(Integer assetVersionId);

	List<PromotionEvent> findByGateAndAction(String gate, String action);
}
