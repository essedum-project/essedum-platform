package com.lfn.icip.icipwebeditor.repository.mssql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedEntities;
import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedEntityRepository;
@Profile("mssql")
@Repository
public interface ICIPMLFederatedEntityRepositoryMSSQL  extends ICIPMLFederatedEntityRepository  {
	  @Query(value="Select * from((SELECT * FROM mlfederatedentities t1 where t1.ptype := entityType and t1.pid :=entityId and organization := organization)union all (Select * from mlfederatedentities where  t1.ctype := entityType and t1.cid :=entityId and organization := organization)) ",nativeQuery=true)
		List<ICIPMLFederatedEntities> findLinkedEntitiesByTypeAndIDAndOrganization(@Param("entityType")String entityType,@Param("entityId") Integer entityId,@Param("organization") String organization);
	  
	  
	  @Query(value="SELECT * FROM mlfederatedentities t1 where t1.pId =:pId and t1.pType =:pType and t1.cId =:cId and t1.cType =:cType and t1.organization =:organization",nativeQuery=true)
		List<ICIPMLFederatedEntities> findLinkedEntities(@Param("pId")Integer childId,@Param("pType")String pType,@Param("cId")Integer parentId,@Param("cType")String cType ,@Param("organization")String organization);
}
