package com.lfn.ai.comm.lib.util.service.impl;

import java.security.KeyException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.ai.comm.lib.util.dto.ResolvedSecret;
import com.lfn.ai.comm.lib.util.dto.Secret;
import com.lfn.ai.comm.lib.util.factory.SecretsManagerFactory;
import com.lfn.ai.comm.lib.util.service.SecretsManager;
import com.lfn.ai.comm.lib.util.service.SecretsManagerService;
@Service
public class SecretsManagerServiceImpl implements SecretsManagerService {

	@Autowired
	private SecretsManagerFactory smfactory;

	@Autowired(required=false)
    private  SecretsManager secretManager;

	

	SecretsManager getSecretResolver(String name) {
		return smfactory.getSecretsManager(name + "secretmanager");
	}

	@Override
	public ResolvedSecret resolveSecret(Secret secret) throws KeyException {
		
		 ResolvedSecret	  resolvedSecret = secretManager.resolveSecret(secret);
		return resolvedSecret;
	}

}
