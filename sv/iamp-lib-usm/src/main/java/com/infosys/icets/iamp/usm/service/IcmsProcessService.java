/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.iamp.usm.service;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.IcmsProcess;

public interface IcmsProcessService {

	IcmsProcess save(IcmsProcess icmsProcess) throws SQLException;

    Page<IcmsProcess> findAll(Pageable pageable) throws SQLException;

    IcmsProcess findOne(Integer id) throws SQLException;

    void delete(Integer id) throws SQLException;

    PageResponse<IcmsProcess> getAll(PageRequestByExample<IcmsProcess> req) throws SQLException;

    public IcmsProcess toDTO(IcmsProcess icmsProcess, int depth);
    
    List<Map<String,?>> getAllProcessesByUserRole(Integer userId, Integer projectid) throws SQLException;

}
