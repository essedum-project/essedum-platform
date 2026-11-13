package com.lfn.iamp.usm.identity;

/**
 * Pluggable connector that pushes a role binding onto one external system
 * (Git teams, Kubernetes RBAC, storage IAM, gateway keys — §8). Real
 * integrations implement this per target_type; until infra/credentials are
 * wired, {@link SimulatedProjectionConnector} stands in and reports success.
 */
public interface ProjectionConnector {

	/** The rbac_identity_projection_target.target_type this connector handles. */
	String targetType();

	/**
	 * Apply the binding to the external system.
	 *
	 * @return true if the system is now in sync, false to leave it for retry.
	 */
	boolean apply(IdentityProjectionTarget target);
}
