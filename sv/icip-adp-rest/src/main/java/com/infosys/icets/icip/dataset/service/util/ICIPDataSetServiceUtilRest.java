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
package com.infosys.icets.icip.dataset.service.util;

import java.util.List;
import java.util.Map;
import java.sql.SQLException;
import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.properties.ProxyProperties;


/**
 * The Class ICIPDataSetServiceUtilRest.
 *
 * @author icets
 */
@Component("restds")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPDataSetServiceUtilRest extends ICIPDataSetServiceUtilRestAbstract {

	public ICIPDataSetServiceUtilRest(ProxyProperties proxyProperties) {
		super(proxyProperties);
	}

	
	@Override
	public ICIPDataset updateDataset(ICIPDataset dataset) {
		return super.updateDataset(dataset);
	}
@Override
    public <T> T getDatasetDataAsList(ICIPDataset dataset, SQLPagination pagination, DATATYPE datatype, Class<T> clazz)
            throws SQLException {
        // TODO Auto-generated method stub
        return null;
    }

	
}
