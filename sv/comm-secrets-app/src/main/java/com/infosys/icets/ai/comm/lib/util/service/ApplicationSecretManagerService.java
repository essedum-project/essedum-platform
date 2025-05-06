package com.infosys.icets.ai.comm.lib.util.service;

import java.security.KeyException;
import java.util.List;

import javax.management.openmbean.KeyAlreadyExistsException;

import com.infosys.icets.ai.comm.lib.util.dto.ResolvedSecret;
import com.infosys.icets.ai.comm.lib.util.dto.Secret;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;

public interface ApplicationSecretManagerService extends SecretsManager{

		
	public ResolvedSecret resolveSecret(Secret secret) throws KeyException;

	public String addSecret(Secret secret) throws KeyAlreadyExistsException,LeapException;

	public String updateSecret(Secret secret) throws KeyException;

	public String deleteSecret(Secret secret) throws KeyException;

	public List<Secret> listSecret(Secret secret);
	public Long getSecreteCount(Secret secret);
	
}
