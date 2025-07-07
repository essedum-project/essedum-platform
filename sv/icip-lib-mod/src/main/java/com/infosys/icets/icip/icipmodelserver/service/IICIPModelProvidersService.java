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
package com.infosys.icets.icip.icipmodelserver.service;

import java.util.List;

import com.infosys.icets.icip.icipmodelserver.model.ICIPModelProvider;
import com.infosys.icets.icip.icipmodelserver.model.dto.ICIPModelProvidersDTO;

// TODO: Auto-generated Javadoc
/**
 * The Interface IICIPModelProvidersService.
 */
public interface IICIPModelProvidersService {

	ICIPModelProvidersDTO save(ICIPModelProvidersDTO modelProvider);

	ICIPModelProvider findById(Integer id);

	List<ICIPModelProvider> findAllByOrg(String org);

	void delete(ICIPModelProvider server);
}
