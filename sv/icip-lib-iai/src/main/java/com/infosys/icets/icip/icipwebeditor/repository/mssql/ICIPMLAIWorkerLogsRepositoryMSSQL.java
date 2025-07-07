package com.infosys.icets.icip.icipwebeditor.repository.mssql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.icipwebeditor.repository.ICIPMLAIWorkerLogsRepository;


// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPMLAIWorkerLogsRepositoryMSSQL.
 */
@Profile("mssql")
@Repository
public interface ICIPMLAIWorkerLogsRepositoryMSSQL extends ICIPMLAIWorkerLogsRepository{

}
