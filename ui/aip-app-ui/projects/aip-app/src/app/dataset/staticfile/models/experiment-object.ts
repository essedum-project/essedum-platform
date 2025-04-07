export interface ExperimentObject {
    experiment_id: number;
    experiment_name: string;
    object_id: number;
    base_object_id: number;
    user_id: number;
    target_attribute: string;
    train_test_split: string;
    run_id: any;
    collection_name: any;
    is_active: string;
    final_version_for_prediction: string;
    prediction_input:any[];
    prediction_output:any[];
}
