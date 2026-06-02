package com.lfn.icip.icipwebeditor.repository.mssql;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedRuntime;
import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedRuntimeRepository;

@Profile("mssql")
@Repository
public interface ICIPMLFederatedRuntimeRepositoryMSSQL extends ICIPMLFederatedRuntimeRepository {
   
	@Query("SELECT r FROM ICIPMLFederatedRuntime r WHERE (:id IS NULL OR r.id = :id) "
			+ "AND (:connid IS NULL OR r.connid = :connid) " + "AND (:connport IS NULL OR r.connport = :connport) "
			+ "AND (:isEXIPorts IS NULL OR r.isEXIPorts = :isEXIPorts) "
			+ "AND (:exiPorts IS NULL OR r.exiPorts = :exiPorts) "
			+ "AND (:pipelineid IS NULL OR r.pipelineid >= :pipelineid) " + "AND (:appid IS NULL OR r.appid = :appid) " // Changed
																														// '=='
																														// to
																														// '='
			+ "AND (:connendpoint IS NULL OR r.connendpoint = :connendpoint) "
			+ "AND (:isAssigned IS NULL OR r.isAssigned = :isAssigned)")
	List<ICIPMLFederatedRuntime> findBySearch(@Param("id") Integer id, @Param("connid") Integer connid,
			@Param("connport") Integer connport, @Param("isEXIPorts") Boolean isEXIPorts,
			@Param("exiPorts") Integer exiPorts, @Param("pipelineid") Integer pipelineid, @Param("appid") Integer appid,
			@Param("connendpoint") Integer connendpoint, @Param("isAssigned") Boolean isAssigned);

	@Query(value = "SELECT * FROM mlfederatedruntimes e WHERE e.isAssigned = 0 AND e.connid = :connid LIMIT 1", nativeQuery = true)
	Optional<ICIPMLFederatedRuntime> findFirstUnassignedPort(@Param("connid") Integer connid);


    Optional<ICIPMLFederatedRuntime> findByPipelineid(Integer pipelineid);
    Optional<ICIPMLFederatedRuntime> findByAppid(Integer appid);
    Optional<List<ICIPMLFederatedRuntime>> findByConnid(Integer id);
}