package com.lfn.ai.comm.lib.util.service;

import java.security.KeyException;

import com.lfn.ai.comm.lib.util.dto.ResolvedSecret;
import com.lfn.ai.comm.lib.util.dto.Secret;

public interface SecretsManagerService {

	ResolvedSecret resolveSecret(Secret secret) throws KeyException;

}
