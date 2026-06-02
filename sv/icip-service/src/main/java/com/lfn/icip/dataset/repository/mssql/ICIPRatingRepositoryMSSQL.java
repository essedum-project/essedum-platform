package com.lfn.icip.dataset.repository.mssql;

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

@Profile("mssql")
@Repository
public interface ICIPRatingRepositoryMSSQL extends ICIPRatingRepository{

	@Query(value = "SELECT id, module, element, elementAlias, organization,"
			+ "[user], rating, feedback FROM mlrating "
			+ "where [user]=:user and module=:module "
			+ "and organization=:org",nativeQuery=true)
	List<ICIPRating> getRatingByUserAndModuleAndOrganization(Integer user, String module, String org);
	
	@Query(value = "SELECT id, module, element, elementAlias, organization,"
			+ "[user], rating, feedback FROM mlrating "
			+ "where [user]=:user and module=:module "
			+ "and organization=:org and element=:ele",nativeQuery=true)
	ICIPRating getRatingByUserAndModuleAndOrganizationAndElement(Integer user, String module, String org, String ele);
	
	@Modifying
	@Query(value="INSERT INTO mlrating(module, element, elementAlias, organization, [user], rating, feedback) "
			+ "values (:module, :element, :elementAlias, :organization, :user, :rating, :feedback)",nativeQuery=true)
	void customSaveRating(@Param("module") String module, @Param("element") String element, @Param("elementAlias") String elementAlias, 
			@Param("organization") String organization, @Param("user") Integer user, @Param("rating") Integer rating,
			@Param("feedback") String feedback);
	
	@Override
	default ICIPRating save(ICIPRating rating) {
		customSaveRating(rating.getModule(), rating.getElement(), rating.getElementAlias(), rating.getOrganization(), rating.getUser(), 
				rating.getRating(), rating.getFeedback());
		return rating;
	}
	
	@Query(value = "SELECT a.element AS id, a.module AS module, b.elementAlias AS elementAlias, "
			+ "a.avv AS avgRating, b.[user] AS [USER], b.rating AS rating, b.feedback AS feedback "
			+ "FROM (SELECT module, element, AVG(rating) AS avv FROM mlrating GROUP BY module, element) "
			+ "AS a INNER JOIN(SELECT id, module, element, elementAlias, organization, "
			+ "[user], rating, feedback FROM mlrating WHERE module= :module AND "
			+ "ORGANIZATION= :org AND [USER]= :user) AS b ON a.module=b.module AND a.element = b.element", nativeQuery = true)
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
			+ "AND [user] = :user", nativeQuery = true)
	public List<String> getAllModuleByUserOrganization(@Param("user") Integer user, @Param("org") String org);

	@Modifying
	@Transactional
	@Query(value="DELETE FROM mlrating WHERE id=:id", nativeQuery = true)
	public void customDeleteRating(@Param("id") Integer id);
	
	@Override
	default void deleteRating(Integer id){
		customDeleteRating(id);
	}
}
