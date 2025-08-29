package com.lfn.icip.dataset.repository.mysql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.icip.dataset.model.ICIPRating;
import com.lfn.icip.dataset.model.dto.ICIPRatingDetails;
import com.lfn.icip.dataset.repository.ICIPRatingRepository;

@Profile("mysql")
@Repository
public interface ICIPRatingRepositoryMYSQL extends ICIPRatingRepository{
	
	@Query(value = "SELECT a.element AS id, a.module AS module, b.elementAlias AS elementAlias, "
			+ "a.avv AS avgRating, b.user AS USER, b.rating AS rating, b.feedback AS feedback "
			+ "FROM (SELECT module, element, AVG(rating) AS avv FROM mlrating GROUP BY module, element) "
			+ "AS a INNER JOIN(SELECT * FROM mlrating WHERE module= :module AND "
			+ "ORGANIZATION= :org AND USER= :user) AS b ON a.module=b.module AND a.element = b.element", nativeQuery = true)
	public List<ICIPRatingDetails> getAllByUserAndOrganization(@Param("user") Integer user, 
			@Param("module") String module, @Param("org") String org, Pageable pageable);
	
	@Query(value = "SELECT count(*)"
			+ "FROM (SELECT module, element, AVG(rating) AS avv FROM mlrating GROUP BY module, element) "
			+ "AS a INNER JOIN(SELECT * FROM mlrating WHERE module= :module AND "
			+ "ORGANIZATION= :org AND USER= :user) AS b ON a.module=b.module AND a.element = b.element", nativeQuery = true)
	public Long getAllCountByUserAndOrganization(@Param("user") Integer user, 
			@Param("module") String module, @Param("org") String org);
	
	@Transactional
	@Modifying
	@Query(value = "Delete FROM mlrating "
			+ "WHERE ORGANIZATION= :org AND element= :element AND module IN (:module)", nativeQuery = true)
	public void deleteRatingByElementAndModuleAndOrg(@Param("element") String element,
			@Param("module") List<String> module, @Param("org") String org);
	
	@Query(value = "SELECT DISTINCT(module) FROM mlrating where organization = :org "
			+ "AND user = :user", nativeQuery = true)
	public List<String> getAllModuleByUserOrganization(@Param("user") Integer user, @Param("org") String org);

	@Override
	default void deleteRating(Integer id){
		deleteById(id);
	}
}
