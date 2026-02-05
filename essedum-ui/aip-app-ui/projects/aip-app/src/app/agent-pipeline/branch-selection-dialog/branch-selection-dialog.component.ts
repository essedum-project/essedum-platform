import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Services } from '../../services/service';
import { GitHubService } from '../../sharedModule/services/github.service';

@Component({
  selector: 'branch-selection-dialog',
  templateUrl: './branch-selection-dialog.component.html',
  styleUrls: ['./branch-selection-dialog.component.scss']
})
export class BranchSelectionDialogComponent implements OnInit {
  branchForm: FormGroup;
  availableBranches: string[] = [];
  filteredDestinationBranches: string[] = [];
  isDeploying = false;
  isLoadingBranches = false;
  isLoadingSourceBranches = false;
  sourceRepoName = ''; // Will be set dynamically with owner/repo format
  gitUsername: any;
  gitSelectedRepo: any;
  gitSelectedBranch: any;
  environment: string = '';
  isDirectDeploy: boolean = false;
  errorMsgGithub="Please goto ESSEDUM Codespace tab to push your changes to GitHub repo before triggering deployment";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<BranchSelectionDialogComponent>,
    private fb: FormBuilder,
    private service: Services,
    private githubService: GitHubService
  ) {
    this.branchForm = this.fb.group({
      sourceBranch: ['', Validators.required],
      destinationBranch: ['', Validators.required],
      prTitle: [''],
      prDescription: [''],
      assignee: ['']
    });
  }

  ngOnInit(): void {
    this.isDirectDeploy = this.data.isDirectDeploy || false;
    this.environment = this.data.environment || '';
    
    // Set PR title and assignee validators only when creating PR
    if (this.isDirectDeploy) {
      this.branchForm.get('prTitle')?.setValidators([Validators.required]);
      this.branchForm.get('prTitle')?.updateValueAndValidity();
      
      // Set default assignee from session
      const currentUser = sessionStorage.getItem('username') || '';
      this.branchForm.patchValue({ assignee: currentUser });
    }
    
    this.loadSourceBranch();
  }

  /**
   * Load available branches from repository and filter destination branches by environment
   */
  loadAvailableBranches(): void {
    this.isLoadingSourceBranches = true;
    this.availableBranches = [];
    this.filteredDestinationBranches = [];
    this.githubService.getBranches(this.gitSelectedRepo).subscribe(
      (branches) => {
        this.availableBranches = branches.filter(branch => {
          const lowerBranch = branch.toLowerCase();
          return !lowerBranch.includes('uat') && 
                 !lowerBranch.includes('staging') && 
                 !lowerBranch.includes('production');
        });
        if (this.environment) {
          const envPrefix = this.environment.toLowerCase();
          this.filteredDestinationBranches = branches.filter(branch => 
            branch.toLowerCase().includes(envPrefix)
          );
        } else {
          this.filteredDestinationBranches = branches;
        }
        
        this.isLoadingSourceBranches = false;
        this.isLoadingBranches = false;
      },
      (error) => {
        this.service.message(this.errorMsgGithub , 'error');
        console.log(this.errorMsgGithub + this.gitSelectedRepo, error);
        this.isLoadingSourceBranches = false;
        this.isLoadingBranches = false;
      }
    );
  }

  /**
   * Load source branch from API and pre-populate if available
   */
  loadSourceBranch(): void {
    if (!this.data.cname || !this.data.organisation) {
      return;
    }

    this.service.getGitConfig(this.data.cname, this.data.organisation).subscribe(
      (response) => {
        this.gitUsername = response.gituser;
        this.gitSelectedRepo = response.repo;
        if (response && response.bname) {
          const apiSourceBranch = response.bname;
          this.branchForm.patchValue({
            sourceBranch: apiSourceBranch
          });
          this.loadAvailableBranches();
        } else {
          if (this.gitSelectedBranch) {
            this.branchForm.patchValue({
              sourceBranch: this.gitSelectedBranch
            });
          }
        }
      },
      (error) => {
        if (this.gitSelectedBranch) {
          this.branchForm.patchValue({
            sourceBranch: this.gitSelectedBranch
          });
        } else {
          console.log(this.errorMsgGithub, '  Error loading source branch configuration:', error); 
          this.service.message(this.errorMsgGithub , 'error');
        }
      }
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Save git configuration after successful deployment
   */
  saveGitConfig(sourceBranch: string, destinationBranch: string): void {
    if (!this.data.cname || !this.gitSelectedRepo || !sourceBranch) {
      this.service.message('Missing required data for saving git config', 'warning');
      this.isDeploying = false;
      this.dialogRef.close({
        sourceBranch: sourceBranch,
        destinationBranch: destinationBranch,
        pushSuccess: true
      });
      return;
    }

    const currentUser = sessionStorage.getItem('username') || 'demo';
    const gitConfigPayload = {
      id: null,
      cname: this.data.cname,
      org: this.data.organisation,
      gituser: this.gitUsername,
      repo: this.gitSelectedRepo,
      bname: sourceBranch,
      createdby: currentUser,
      createdat: new Date().toISOString(),
      updatedby: currentUser,
      updatedat: new Date().toISOString()
    };

    this.githubService.saveGitConfig(gitConfigPayload).subscribe({
      next: (configResponse) => {
        this.isDeploying = false;
        this.service.message('Branch configuration saved successfully', 'success');
        this.dialogRef.close({
          ...configResponse,
          sourceBranch: sourceBranch,
          destinationBranch: destinationBranch,
          pushSuccess: true
        });
      },
      error: (error) => {
        this.isDeploying = false;
        const errorMsg = error?.details || error?.error?.message || error?.message || 'Branch configuration save failed';
        this.service.message('Deployment succeeded but config save failed: ' + errorMsg, 'warning');
        this.dialogRef.close({
          sourceBranch: sourceBranch,
          destinationBranch: destinationBranch,
          pushSuccess: true
        });
      }
    });
  }

  onDeploy(): void {
    if (this.branchForm.valid) {
      this.isDeploying = true;
      const sourceBranch = this.branchForm.get('sourceBranch')?.value;
      const destinationBranch = this.branchForm.get('destinationBranch')?.value;
      const currentUser = sessionStorage.getItem('username') || 'demo';
      
      // Prepare branch-to-branch push request
      const branchToBranchRequest = {
        repoName: this.gitSelectedRepo,
        sourceBranch: sourceBranch,
        destinationBranch: destinationBranch,
        commitMessage: `Deployment from ${sourceBranch} to ${destinationBranch} - ${new Date().toISOString()}`,
        createBranchIfNotExists: true,
        forcePush: true
      };

      this.githubService.pushBranchToBranch(branchToBranchRequest).subscribe({
        next: (pushResponse) => {
          console.log('Branch-to-branch push successful:', pushResponse);
          if (pushResponse.success) {
            const successMsg = pushResponse.branchCreated 
              ? `Branch '${destinationBranch}' created and code deployed from '${sourceBranch}'`
              : `Code successfully deployed from '${sourceBranch}' to '${destinationBranch}'`;
            this.service.message(successMsg, 'success');
          } else {
            this.service.message('Deployment completed with warnings: ' + pushResponse.message, 'warning');
          }
          
          // Save git config after successful push
          this.saveGitConfig(sourceBranch, destinationBranch);
        },
        error: (error) => {
          this.isDeploying = false;
          const errorMsg = error?.error?.message || error?.message || (typeof error?.error === 'string' ? error.error : 'Branch deployment failed');
          this.service.message('Deployment failed: ' + errorMsg, 'error');
        }
      });
    }
  }

  onCreatePR(): void {
    if (this.branchForm.valid) {
      this.isDeploying = true;
      const sourceBranch = this.branchForm.get('sourceBranch')?.value;
      const destinationBranch = this.branchForm.get('destinationBranch')?.value;
      const prTitle = this.branchForm.get('prTitle')?.value;
      const prDescription = this.branchForm.get('prDescription')?.value || '';
      const assignee = this.branchForm.get('assignee')?.value || '';

      // Prepare pull request creation payload
      const pullRequestPayload = {
        repoName: this.gitSelectedRepo,
        sourceBranch: sourceBranch,
        destinationBranch: destinationBranch,
        title: prTitle,
        description: prDescription,
        assignee: assignee
      };

      console.log('Creating pull request:', pullRequestPayload);

      // Call GitHub service to create pull request
    //   this.githubService.createPullRequest(pullRequestPayload).subscribe({
    //     next: (prResponse) => {
    //       this.isDeploying = false;
    //       const successMsg = `Pull request created successfully: ${prTitle}`;
    //       this.service.message(successMsg, 'success');
          
    //       // Save git config after successful PR creation
    //       this.saveGitConfig(sourceBranch, destinationBranch);
    //     },
    //     error: (error) => {
    //       this.isDeploying = false;
    //       const errorMsg = error?.error?.message || error?.message || 'Pull request creation failed';
    //       this.service.message('PR creation failed: ' + errorMsg, 'error');
    //     }
    //   });
    // } else {
    //   this.service.message('Please fill all required fields', 'error');
    // }
    }
  }
}
