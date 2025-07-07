package com.infosys.icets.icip.icipwebeditor.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.infosys.icets.icip.icipwebeditor.model.ICIPTagsEntity;

@NoRepositoryBean
public interface ICIPMLTagsEntityRepository extends JpaRepository<ICIPTagsEntity, Integer> {

	List<ICIPTagsEntity> findAllTagsByTagIdsAndentityIdAndEntityTypeAndOrganization(List<Integer> tagIds, Integer entityId, String entityType, String organization);

	List<ICIPTagsEntity> findAllTagsByentityIdAndEntityTypeAndOrganization(Integer entityId, String entityType,
			String organization);

	
	
	
	
}
