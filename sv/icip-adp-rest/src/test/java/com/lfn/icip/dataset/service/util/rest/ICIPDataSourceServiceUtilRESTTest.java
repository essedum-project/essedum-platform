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

package com.lfn.icip.dataset.service.util.rest;

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

import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.properties.ProxyProperties;
import com.lfn.icip.dataset.service.util.ICIPDataSourceServiceUtilRest;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doReturn;
import org.mockito.runners.MockitoJUnitRunner;

import static org.mockito.Matchers.anyInt;
import static org.mockito.Matchers.anyObject;

/**
 * @author essedum
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
