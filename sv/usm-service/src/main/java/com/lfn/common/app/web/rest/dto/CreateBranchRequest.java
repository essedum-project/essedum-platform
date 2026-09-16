package com.lfn.common.app.web.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBranchRequest {
    private String repoName;
    private String branchName;
    private String sourceBranch;
}
