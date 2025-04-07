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
package com.infosys.icets.icip.dataset.service.util.rest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Matchers.anyObject;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.net.URISyntaxException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;

import org.apache.commons.codec.DecoderException;
import org.json.JSONException;
import org.junit.jupiter.api.Test;

import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.properties.ProxyProperties;
import com.infosys.icets.icip.dataset.service.util.ICIPDataSourceServiceUtilRest;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doReturn;
import org.mockito.runners.MockitoJUnitRunner;

import static org.mockito.Matchers.anyInt;
import static org.mockito.Matchers.anyObject;

/**
 * @author icets
 */
class ICIPDataSourceServiceUtilRESTTest {
	@Test
	void test() throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, DecoderException {

		ICIPDataSourceServiceUtilRest dsr = mock(ICIPDataSourceServiceUtilRest.class);

		ICIPDatasource ds = new ICIPDatasource();
		ds.setConnectionDetails("{\"authUrl\":\"\",\"password\":\"\",\"authParams\":\"{}\",\"auth\":\"BearerToken\",\"authToken\":\"7706189859f2b010b862d1c6262b68756e827265\",\"noProxy\":\"true\",\"url\":\"https://infosysjira.tools.infosysapps.com/rest/api/2/issue/createmeta\",\"username\":\"\",\"auth_vault\":false}");
		ds.setDescription("Testing REST Datasource ");
		ds.setId(1049);
		ds.setName("REST Datasource");
		ds.setOrganization("Acme");
		ds.setSalt("");
		ds.setType("REST");
		when(dsr.testConnection(anyObject())).thenReturn(true);
		assertEquals(true, dsr.testConnection(ds));
	}
}
