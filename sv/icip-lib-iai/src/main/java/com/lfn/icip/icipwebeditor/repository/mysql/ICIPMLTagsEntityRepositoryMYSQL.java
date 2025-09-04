package com.lfn.icip.icipwebeditor.repository.mysql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.model.ICIPTagsEntity;
import com.lfn.icip.icipwebeditor.repository.ICIPMLTagsEntityRepository;
@Profile("mysql")
@Repository
public interface ICIPMLTagsEntityRepositoryMYSQL  extends ICIPMLTagsEntityRepository{

	
	
	@Query(value="Select * from mltagsentity where tag_id in (:tagIds) and entity_id = :entityId and entity_type = :entityType and organization= :organization",nativeQuery = true)
	List<ICIPTagsEntity> findAllTagsByTagIdsAndentityIdAndEntityTypeAndOrganization(@Param("tagIds") List <Integer> tagIds,@Param("entityId") Integer entityId, @Param("entityType")String entityType,@Param("organization") String organization);



	@Query(value="Select * from mltagsentity where  entity_id = :entityId and entity_type = :entityType and organization= :organization",nativeQuery = true)
	List<ICIPTagsEntity> findAllTagsByentityIdAndEntityTypeAndOrganization(@Param("entityId") Integer entityId, @Param("entityType")String entityType,@Param("organization") String organization);

}
