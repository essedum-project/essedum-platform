/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipwebeditor.repository.mssql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import jakarta.transaction.Transactional;

import com.infosys.icets.icip.icipwebeditor.model.ICIPApps;

import com.infosys.icets.icip.icipwebeditor.repository.ICIPAppsRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPPluginRepositoryMSSQL.
 */
@Profile("mssql")
@Repository
@Transactional
public interface ICIPAppsRepositoryMSSQL extends ICIPAppsRepository {

	@Modifying
	@Query(value="insert into mlapps ([file],job_name,name,organization,scope,status,tryoutlink,type,video_file) values (:doc,:jobname,:name, :org,:scope,:status,:tryoutlink,:type,:video_file)",nativeQuery = true)
	void customSave1(@Param("doc") String doc, @Param("jobname") String jobname, @Param("name") String name, @Param("org") String org,@Param("scope") String scope, @Param("status") String status,@Param("tryoutlink") String tryoutlink,@Param("type") String type,@Param("video_file") String video_file);

	@Override
	default ICIPApps customSave(ICIPApps app){
		customSave1(app.getFile(),app.getJobName(),app.getName(),app.getOrganization(), app.getScope(), app.getStatus(),app.getTryoutlink(),app.getType(), app.getVideoFile());
		return app;
	}
	
	@Modifying
	@Query(value="DELETE FROM mlapps WHERE id=:id", nativeQuery = true)
	public void deleteApp1(@Param("id") Integer id);
	
	@Override
	default void deleteApp(ICIPApps app){
		deleteApp1(app.getId());
	}
}