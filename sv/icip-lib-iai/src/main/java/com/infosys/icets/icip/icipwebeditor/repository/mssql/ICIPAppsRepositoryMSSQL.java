/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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