package com.infosys.icets.ai.comm.lib.util.telemetry.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.infosys.icets.ai.comm.lib.util.telemetry.domain.OpenTelemetryEvents;


@Repository
public interface OpenTelemetryEventsRepository extends JpaRepository<OpenTelemetryEvents,Long>{

}
