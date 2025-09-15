package com.lfn.icip.icipwebeditor.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;

import com.lfn.icip.icipwebeditor.model.ICIPImageSaving;

@NoRepositoryBean
public interface ICIPImageSavingRepository extends JpaRepository<ICIPImageSaving,Integer> {

	ICIPImageSaving getByNameAndOrg(String name, String org);
	
	@Query(value="select * from mlappimage where organization=?1", nativeQuery = true)
	List<ICIPImageSaving> getByOrg(String org);
	

}
