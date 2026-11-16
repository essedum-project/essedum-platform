package com.lfn.iamp.usm.identity;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Default connector for every target_type: logs the intended push and reports
 * success, so the outbox → worker → status flow is demonstrable end-to-end
 * without real Git/K8s/IAM/gateway infra. Swap in real per-type connectors by
 * implementing {@link ProjectionConnector} with a matching targetType().
 *
 * Set identity.projection.simulate=false to make it a no-op that leaves rows
 * pending (useful to test the retry path / "⚠️ not caught up yet" UI).
 */
@Component
public class SimulatedProjectionConnector implements ProjectionConnector {

	private static final Logger log = LoggerFactory.getLogger(SimulatedProjectionConnector.class);

	@Value("${identity.projection.simulate:true}")
	private boolean simulate;

	@Override
	public String targetType() {
		return "*"; // fallback handler for all target types
	}

	@Override
	public boolean apply(IdentityProjectionTarget target) {
		if (!simulate) {
			log.info("[identity-projection] simulate=false — leaving {} for project {} pending",
					target.getTargetType(), target.getProjectId());
			return false;
		}
		log.info("[identity-projection] (simulated) pushed {} binding for project {}",
				target.getTargetType(), target.getProjectId());
		return true;
	}
}
