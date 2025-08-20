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

package com.lfn.icip.dataset.service.aspect;

import java.util.ArrayList;
import java.util.List;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.lfn.icip.dataset.cache.EncryptionCache;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.dataset.util.DecryptPassword;

// TODO: Auto-generated Javadoc
/**
 * The Class DecryptionAspect.
 *
 * @author essedum
 */
@Aspect
@Component
public class DecryptionAspect {

	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(DecryptionAspect.class);

	/** The i ICIP datasource service. */
	private IICIPDatasourceService iICIPDatasourceService;

	/** The password. */
	private String password;

	/** The encryption cache. */
	@Autowired
	private EncryptionCache encryptionCache;

	/** The env. */
	@Autowired
	private Environment env;

	/** The Constants. */
	private static final String PSTR = "password";

	/** The Constant VAULT. */
	private static final String VAULT = "_vault";

	/** The Constant AUTHDETAILS. */
	private static final String AUTHDETAILS = "AuthDetails";

	/** The Constant AUTHPARAMS. */
	private static final String AUTHPARAMS = "authParams";

	/** The Constant AUTHTYPE. */
	private static final String AUTHTYPE = "AuthType";

	/** The Constant BASICAUTH. */
	private static final String BASICAUTH = "BasicAuth";

	/** The Constant OAUTH. */
	private static final String OAUTH = "OAuth";

	/** The Constant CLIENTSECRET. */
	private static final String CLIENTSECRET = "client_secret";

	/** The Access Token. */
	private static final String ACCESSTOKEN = "access_token";

	/**
	 * Instantiates a new decryption aspect.
	 *
	 * @param iICIPDatasourceService the i ICIP datasource service
	 * @param key                    the key
	 */
	public DecryptionAspect(IICIPDatasourceService iICIPDatasourceService, @Value("${encryption.key}") String key) {
		super();
		this.iICIPDatasourceService = iICIPDatasourceService;
		this.password = key;
	}

	/**
	 * Before advice.
	 *
	 * @param joinPoint  the join point
	 * @param datasource the datasource
	 */
	@Before(value = "execution(* com.lfn.icip.dataset.service.util.IICIPDataSourceServiceUtil.*(..)) and args(datasource)", argNames = "datasource")
	public void beforeAdvice(JoinPoint joinPoint, ICIPDatasource datasource) {
		decryptPassword(datasource);
	}

	/**
	 * Before advice.
	 *
	 * @param joinPoint the join point
	 * @param dataset   the dataset
	 */
	@Before(value = "execution(* com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.*(..)) and args(dataset,..)", argNames = "dataset")
	public void beforeAdvice(JoinPoint joinPoint, ICIPDataset dataset) {
		decryptPassword(dataset);
	}

	/**
	 * Before advice.
	 *
	 * @param joinPoint the join point
	 * @param dataset   the dataset
	 */
	@Before(value = "execution(* com.lfn.icip.dataset.service.util.ICIPDataSetServiceUtilSqlAbstract.*(..)) and args(dataset,..)", argNames = "dataset")
	public void beforeAdviceSql(JoinPoint joinPoint, ICIPDataset dataset) {
		decryptPassword(dataset);
	}

	/**
	 * Gets the value from vault key.
	 *
	 * @param vaultKeyJson the vault key json
	 * @return the value from vault key
	 */
	private void getValueFromVaultKey(JSONObject vaultKeyJson) {
		JSONObject vaultKeys = new JSONObject();

		vaultKeyJson.keySet().parallelStream().forEach(key -> {
			vaultKeys.put(key, vaultKeyJson.get(key));
			if (vaultKeyJson.has(key + VAULT) && vaultKeyJson.getBoolean(key + VAULT)) {
				vaultKeys.put(key + "_vault_key", vaultKeyJson.optString(key));
			}
		});

		vaultKeys.keySet().parallelStream().forEach(key -> {
			vaultKeyJson.put(key, vaultKeys.get(key));
			if (vaultKeys.has(key + VAULT) && vaultKeys.getBoolean(key + VAULT)) {
				vaultKeyJson.put(key, DecryptPassword.getValue(env, key, vaultKeys)[0]);

			}
		});

	}

	/**
	 * Decrypt password.
	 *
	 * @param dataset the dataset
	 */
	public void decryptPassword(ICIPDataset dataset) {
		ICIPDatasource ds = iICIPDatasourceService.getDatasource(dataset.getDatasource().getId());
		String connectionDetails1 = ds.getConnectionDetails();
		JSONObject decryptSource = new JSONObject(connectionDetails1);
		getValueFromVaultKey(decryptSource);

		String encrypted = decryptSource.has(PSTR) ? decryptSource.get(PSTR).toString() : "";
		if (!encrypted.isEmpty() && encrypted.startsWith("enc")) {
			getDecryptedDatasource(ds, decryptSource, encrypted);
		}

		if (dataset.getDatasource().getCategory().equalsIgnoreCase("rest")) {
			decryptRestSource(dataset.getDatasource(), decryptSource);
		}

		ds.setConnectionDetails(decryptSource.toString());
		dataset.setDatasource(ds);
	}

	/**
	 * Gets the decrypted datasource.
	 *
	 * @param ds            the ds
	 * @param decryptSource the decrypt source
	 * @param encrypted     the encrypted
	 * @return the decrypted datasource
	 */
	private void getDecryptedDatasource(ICIPDatasource ds, JSONObject decryptSource, String encrypted) {
		String decrypted = null;
		if (encryptionCache.getCache().containsKey(encrypted)) {
			logger.debug("getting from Encryption Cache");
			decrypted = encryptionCache.getCache().get(encrypted);
		} else {
			logger.debug("decrypting password");
			decrypted = DecryptPassword.decrypt(encrypted, password, ds.getSalt());
			if (decrypted != null)
				encryptionCache.getCache().put(encrypted, decrypted);
		}
		decryptSource.put(PSTR, decrypted);
	}

	private String getRestDecryptedValue(ICIPDatasource ds, String encrypted, String decryptKey) {
		String decrypted = null;
		if (encryptionCache.getCache().containsKey(encrypted)) {
			logger.debug("getting from Encryption Cache");
			decrypted = encryptionCache.getCache().get(encrypted);
		} else {
			logger.debug("decrypting password");
			String salt = ds.getSalt();
			decrypted = DecryptPassword.decrypt(encrypted, password, salt);
			if (decrypted != null)
				encryptionCache.getCache().put(encrypted, decrypted);
		}
		return decrypted;
	}

	private String getRestOauthDecryptedValue(ICIPDatasource ds, String encrypted, String decryptKey) {
		String decrypted = null;
		if (encryptionCache.getCache().containsKey(encrypted)) {
			logger.debug("getting from Encryption Cache");
			decrypted = encryptionCache.getCache().get(encrypted);
		} else {
			logger.debug("decrypting password");
			JSONObject salt = new JSONObject(ds.getSalt());
			decrypted = DecryptPassword.decrypt(encrypted, password, salt.getString(decryptKey));
			if (decrypted != null)
				encryptionCache.getCache().put(encrypted, decrypted);
		}
		return decrypted;
	}

	/**
	 * Decrypt rest source.
	 *
	 * @param ds            the ds
	 * @param decryptSource the decrypt source
	 */
	private void decryptRestSource(ICIPDatasource ds, JSONObject decryptSource) {
		JSONObject authDetais = new JSONObject(decryptSource.optString(AUTHDETAILS));
		getValueFromVaultKey(authDetais);
		decryptSource.put(AUTHDETAILS, authDetais);

		if (decryptSource.optString(AUTHTYPE).equalsIgnoreCase(BASICAUTH)) {
			String encPassword = authDetais.optString(PSTR);
			if (!encPassword.isEmpty() && encPassword.startsWith("enc")) {
				String decryptPass = getRestDecryptedValue(ds, encPassword, PSTR);
				authDetais.put(PSTR, decryptPass);
				decryptSource.put(AUTHDETAILS, authDetais);
			}
		} else if (decryptSource.optString(AUTHTYPE).equalsIgnoreCase(OAUTH)) {
			JSONObject authParams = new JSONObject(authDetais.optString(AUTHPARAMS));
			getValueFromVaultKey(authParams);
			authDetais.put(AUTHPARAMS, authParams);

			String encPassword = authParams.optString(CLIENTSECRET);
			if (!encPassword.isEmpty() && encPassword.startsWith("enc")) {
				String decryptPass = getRestOauthDecryptedValue(ds, encPassword, CLIENTSECRET);
				authParams.put(CLIENTSECRET, decryptPass);
				authDetais.put(AUTHPARAMS, authParams);
				decryptSource.put(AUTHDETAILS, authDetais);
			}

			String encToken = decryptSource.optString(ACCESSTOKEN);
			if (!encToken.isEmpty() && encToken.startsWith("enc")) {
				String decryptToken = getRestOauthDecryptedValue(ds, encToken, ACCESSTOKEN);
				decryptSource.put(ACCESSTOKEN, decryptToken);
			}

		}
	}

	/**
	 * Decrypt password.
	 *
	 * @param datasource the datasource
	 */
	public void decryptPassword(ICIPDatasource datasource) {
		JSONObject decryptSource = new JSONObject(datasource.getConnectionDetails());
		getValueFromVaultKey(decryptSource);
		String encrypted = decryptSource.has(PSTR) ? decryptSource.get(PSTR).toString() : "";
		if (!encrypted.isEmpty() && encrypted.startsWith("enc")) {
			getDecryptedDatasource(datasource, decryptSource, encrypted);
		}

		if (datasource.getCategory().equalsIgnoreCase("rest")) {
			decryptRestSource(datasource, decryptSource);
		}

		datasource.setConnectionDetails(decryptSource.toString());
	}

}
