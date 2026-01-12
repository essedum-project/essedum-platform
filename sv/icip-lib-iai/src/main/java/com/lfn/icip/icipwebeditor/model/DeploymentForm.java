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

package com.lfn.icip.icipwebeditor.model;

import java.io.Serializable;
import java.sql.Timestamp;
import java.time.LocalDateTime;

import jakarta.persistence.*;


import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The Class DeploymentForm.
 * Entity for tracking agent deployment information and compliance.
 */
@Entity
@Table(name = "deployment_form", schema = "essedum_coredb")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DeploymentForm implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "agent_name", length = 255, nullable = false)
    private String agentName;

    @Column(name = "agent_version", length = 100, nullable = false)
    private String agentVersion;

    @Column(name = "deployment_environment", length = 100)
    private String deploymentEnvironment;

    @Column(name = "deployment_datetime", nullable = false)
    private LocalDateTime deploymentDatetime;

    @Column(name = "build_release_id", length = 100)
    private String buildReleaseId;

    @Column(name = "agent_package_location", length = 500)
    private String agentPackageLocation;

    @Column(name = "hash_checksum", length = 255)
    private String hashChecksum;

    @Column(name = "target_nodes_hosts", columnDefinition = "JSON")
    private String targetNodesHosts;

    @Column(name = "impacted_services", columnDefinition = "JSON")
    private String impactedServices;

    @Column(name = "dependencies", columnDefinition = "TEXT")
    private String dependencies;

    @Column(name = "health_check_status", length = 100)
    private String healthCheckStatus;

    @Column(name = "backup_confirmation", nullable = false)
    private Boolean backupConfirmation = false;

    @Column(name = "change_freeze_compliance", nullable = false)
    private Boolean changeFreezeCompliance = false;

    @Column(name = "security_patch_verification", nullable = false)
    private Boolean securityPatchVerification = false;

    @Column(name = "approver_name_role", length = 255)
    private String approverNameRole;

    @Column(name = "cab_approval_reference", length = 100)
    private String cabApprovalReference;

    @Column(name = "change_request_id", length = 100)
    private String changeRequestId;

    @Column(name = "rollback_procedure_reference", length = 255)
    private String rollbackProcedureReference;

    @Column(name = "previous_stable_agent_version", length = 100)
    private String previousStableAgentVersion;

    @Column(name = "smoke_test_status", length = 100)
    private String smokeTestStatus;

    @Column(name = "performance_test_summary", columnDefinition = "TEXT")
    private String performanceTestSummary;

    @Column(name = "ssl_tls_certificate_check", nullable = false)
    private Boolean sslTlsCertificateCheck = false;

    @Column(name = "dr_readiness", nullable = false)
    private Boolean drReadiness = false;

    @Column(name = "data_retention_confirmation", nullable = false)
    private Boolean dataRetentionConfirmation = false;

    @Column(name = "antivirus_patch_confirmation", nullable = false)
    private Boolean antivirusPatchConfirmation = false;

    @Column(name = "deployment_owner", length = 255)
    private String deploymentOwner;

    @Column(name = "infra_support_contacts", columnDefinition = "TEXT")
    private String infraSupportContacts;

    @Column(name = "audit_poc_details", columnDefinition = "TEXT")
    private String auditPocDetails;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at", nullable = false)
    private Timestamp updatedAt;

    @PrePersist
    protected void onCreate() {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Timestamp(System.currentTimeMillis());
    }
}

