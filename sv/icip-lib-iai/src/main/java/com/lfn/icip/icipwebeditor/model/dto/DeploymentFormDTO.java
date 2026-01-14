/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.icipwebeditor.model.dto;

import java.io.Serializable;
import java.sql.Timestamp;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The Class DeploymentFormDTO.
 * Data Transfer Object for agent deployment information and compliance.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeploymentFormDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    @JsonProperty("agent_name")
    private String agentName;

    @JsonProperty("agent_version")
    private String agentVersion;

    @JsonProperty("deployment_environment")
    private String deploymentEnvironment;

    @JsonProperty("deployment_datetime")
    private LocalDateTime deploymentDatetime;

    @JsonProperty("cname")
    private String cname;

    @JsonProperty("org")
    private String org;

    @JsonProperty("build_release_id")
    private String buildReleaseId;

    @JsonProperty("agent_package_location")
    private String agentPackageLocation;

    @JsonProperty("hash_checksum")
    private String hashChecksum;

    @JsonProperty("target_nodes_hosts")
    private String targetNodesHosts;

    @JsonProperty("impacted_services")
    private String impactedServices;

    private String dependencies;

    @JsonProperty("health_check_status")
    private String healthCheckStatus;

    @JsonProperty("backup_confirmation")
    private Boolean backupConfirmation;

    @JsonProperty("change_freeze_compliance")
    private Boolean changeFreezeCompliance;

    @JsonProperty("security_patch_verification")
    private Boolean securityPatchVerification;

    @JsonProperty("approver_name_role")
    private String approverNameRole;

    @JsonProperty("cab_approval_reference")
    private String cabApprovalReference;

    @JsonProperty("change_request_id")
    private String changeRequestId;

    @JsonProperty("rollback_procedure_reference")
    private String rollbackProcedureReference;

    @JsonProperty("previous_stable_agent_version")
    private String previousStableAgentVersion;

    @JsonProperty("smoke_test_status")
    private String smokeTestStatus;

    @JsonProperty("performance_test_summary")
    private String performanceTestSummary;

    @JsonProperty("ssl_tls_certificate_check")
    private Boolean sslTlsCertificateCheck;

    @JsonProperty("dr_readiness")
    private Boolean drReadiness;

    @JsonProperty("data_retention_confirmation")
    private Boolean dataRetentionConfirmation;

    @JsonProperty("antivirus_patch_confirmation")
    private Boolean antivirusPatchConfirmation;

    @JsonProperty("deployment_owner")
    private String deploymentOwner;

    @JsonProperty("infra_support_contacts")
    private String infraSupportContacts;

    @JsonProperty("audit_poc_details")
    private String auditPocDetails;

    @JsonProperty("created_at")
    private Timestamp createdAt;

    @JsonProperty("updated_at")
    private Timestamp updatedAt;
}

