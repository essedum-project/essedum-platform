package com.lfn.ai.comm.lib.util.factory;

import com.lfn.ai.comm.lib.util.service.SecretsManager;

public interface SecretsManagerFactory {

	SecretsManager getSecretsManager(String name);
}
