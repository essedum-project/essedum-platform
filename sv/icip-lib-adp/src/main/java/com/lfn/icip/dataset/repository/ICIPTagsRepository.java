package com.lfn.icip.dataset.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.dataset.model.ICIPTags;



@Repository
public interface ICIPTagsRepository extends JpaRepository<ICIPTags, Integer>{
	ICIPTags getById(Integer id);

	
	@Query(value="SELECT * FROM mltags WHERE id IN"
			+ "(SELECT DISTINCT(tag_id)FROM mltags t1 INNER JOIN"
			+ " mltagsentity t2 ON (t1.id=t2.tag_id) WHERE ( :service is NULL OR t2.entity_type= :service)"
			+ " and ( :project is NULL OR t2.organization= :project)) ",nativeQuery=true)
	List<ICIPTags> findAllTagsByEntityTypeAndOrganization(@Param("service")String service, @Param("project")String project);

}
