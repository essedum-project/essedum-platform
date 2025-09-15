package com.lfn.icip.icipwebeditor.repository.mysql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.repository.ICIPMLAIWorkerLogsRepository;


// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPMLAIWorkerLogsRepositoryMYSQL.
 */
@Profile("mysql")
@Repository
public interface ICIPMLAIWorkerLogsRepositoryMYSQL extends ICIPMLAIWorkerLogsRepository{

}
