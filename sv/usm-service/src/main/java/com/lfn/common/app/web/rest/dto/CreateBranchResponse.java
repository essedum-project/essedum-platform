package com.lfn.common.app.web.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBranchResponse {
    private boolean success;
    private String message;
    private String repoName;
    private String branchName;
    private String sourceBranch;
    private String commitSha;
    private boolean alreadyExisted;
}
