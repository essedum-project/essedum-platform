package com.infosys.icets.ai.comm.lib.util.telemetry.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.infosys.icets.ai.comm.lib.util.telemetry.domain.TelemetryEvents;


@Repository
public interface TelemetryEventsRepository extends JpaRepository<TelemetryEvents,Long>{

	@Query("SELECT EXISTS (SELECT 1 FROM TelemetryEvents WHERE eid = ?1 AND ets = ?2 AND mid = ?3 AND actor_id = ?4 AND actor_type = ?5)")
    boolean existsByEidAndEtsAndMidAndActorIdAndActorType(String eid, Long ets, String mid, String actorId, String actorType);
	
	List<TelemetryEvents> findByMid(String mid);
	
	void deleteById(Integer id);
}
