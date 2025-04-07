export class ClusteringWorkflow {

    id: number;
    alias: string;
    name: string;
    workflowDetails: { selectedDataset: string };

    constructor(json?: any) {
        this.workflowDetails = { selectedDataset: '' }; 

        if (json != null) {
            this.id = json.id;
            this.alias = json.alias;
            this.name = json.name;
            
            if (json.workflowDetails) {
                if (typeof json.workflowDetails === 'string') {
                    try {
                        this.workflowDetails = JSON.parse(json.workflowDetails);
                    } catch (e) {
                        console.error("Error parsing workflowDetails:", e);
                        this.workflowDetails = { selectedDataset: '' };
                    }
                } else {
                    this.workflowDetails = json.workflowDetails; 
                }
            }
        }
    }

    getSelectedDataset(): string {
        return this.workflowDetails.selectedDataset;
    }
}
