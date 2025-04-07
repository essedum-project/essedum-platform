export class StatisticsRequestObject {
	recipe_id: number;
	recipe_name: string;
	object_id: number;
	function_name: string[];
	args: Object[];
	// mode: string;
	user_id: number;
	actions_changed: string;
	screen: string;
	target_attribute:string;
	dataset_type: string;
}