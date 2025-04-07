package com.infosys.icets.ai.comm.lib.util.factory;

import com.infosys.icets.ai.comm.lib.util.service.SecretsManager;

public interface SecretsManagerFactory {

	SecretsManager getSecretsManager(String name);
}
