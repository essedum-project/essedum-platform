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
package com.infosys.icets.icip.icipmodelserver.repository.mssql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.icipmodelserver.model.ICIPModelProvider;
import com.infosys.icets.icip.icipmodelserver.model.ICIPModelServers;
import com.infosys.icets.icip.icipmodelserver.repository.ICIPModelProvidersRepository;
import com.infosys.icets.icip.icipmodelserver.repository.ICIPModelServersRepository;
import com.infosys.icets.icip.icipmodelserver.repository.mysql.ICIPModelServersRepositoryMYSQL;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPModelServersRepositoryMSSQL.
 */
@Profile("mssql")
@Repository
public interface ICIPModelProvidersRepositoryMSSQL extends ICIPModelProvidersRepository {}
