package com.lfn.icip.icipwebeditor.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedEntities;
@NoRepositoryBean
public interface ICIPMLFederatedEntityRepository extends JpaRepository<ICIPMLFederatedEntities, Integer> {
	
    
	List<ICIPMLFederatedEntities> findLinkedEntitiesByTypeAndIDAndOrganization(@Param("entityType")String entityType,@Param("entityId") Integer entityId,@Param("organization") String organization);

    @Query(value="SELECT * FROM mlfederatedentities t1 where t1.pId =:pId and t1.pType =:pType and t1.cId =:cId and t1.cType =:cType and t1.organization =:organization",nativeQuery=true)
	List<ICIPMLFederatedEntities> findLinkedEntities(@Param("pId")Integer childId,@Param("pType")String pType,@Param("cId")Integer parentId,@Param("cType")String cType ,@Param("organization")String organization);
//    @Query(value="SELECT id FROM mlfederatedentities t1 where t1.pId=?1 and t1.pType=?2 and t1.cId=?3 and t1.cType=?4 and t1.organization=?5",nativeQuery=true)
//	List<ICIPMLFederatedEntities> findLinkedEntities(String pId,String pType,String cId,String cType ,String organization);
}
