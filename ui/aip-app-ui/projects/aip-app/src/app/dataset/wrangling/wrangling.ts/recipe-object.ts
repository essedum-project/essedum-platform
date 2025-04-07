export class RecipeObject {
	recipe_id: number;
	recipe_name: string;
	recipe_type: string;
	// object_id: number;
	object_name: string;
	function_name: string[];
	args: Object[];
	transformed_file_name: string;	
	collection_name: string[];
	connection_id: number;
	created_timestamp: string;
	updated_timestamp: string;
	is_active: string;
	transformations_applied: any[];
	first_load: string;
	mode: string;
	screen: string;
	// user_id: string;
	object_dimensions:string[];
	datatypes_required: string;
	dataset_type: string;
	dataset_name: string;
    aip_login: string;
    org: string;
}