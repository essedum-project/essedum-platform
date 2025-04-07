import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LedsLibService, LedsModalService } from 'leds-lib';
import { RecipeObject } from '../wrangling.ts/recipe-object';
import { Subscription } from 'rxjs';
import { WranglingService } from '../wranglingService/wrangling.service';
import { WranglingDataService } from '../wranglingService/wrangling-data.service';
import { Services } from '../../../services/service';

@Component({
  selector: 'app-add-view-recipe',
  templateUrl: './add-view-recipe.component.html',
  styleUrls: ['./add-view-recipe.component.scss']
})
export class AddViewRecipeComponent {
  @Input() fileData:any;
  @Input() alias:any;
  @Input() datasetName:any;

  basicReqTab: any = 'create';
  showRecipe:boolean=true;
 // recipeList:any[]=[{viewValue:'w1', value:'w1'},{viewValue:'Test', value:'Test'}]
  recipeName:any;
  selectedRecipe:any;
  recipeList: RecipeObject[] = [];
  recipeNameCheck: boolean;
  displaySpinner:boolean=false;
  private reciepeSubscription: Subscription = new Subscription();
  recipeType:string='transformation';
  pyjoburl: any;
  recipeNameList: string[] = [];
  options: any = [];
  constructor(
    private ledsLibService: LedsLibService,
    private modalService: LedsModalService,
    private router: Router,
    private route: ActivatedRoute,
    private catalogueService: WranglingService,
    private dataService: WranglingDataService,
    private services: Services,
  ){}
  // ngOnInit(){
  //   console.log('fileData in addview',this.fileData);
  //   this.getPyJobUrl();
  //   this.getRecipeDetails();
  // }
  ngOnInit() {
    console.log('fileData in addview', this.fileData);
    this.getPyJobUrl().then(() => {
        this.getRecipeDetails();
    });
  }

  getPyJobUrl(): Promise<void> {
      return new Promise((resolve, reject) => {
          this.services.pyjob(localStorage.getItem('organization')).subscribe(
              resp => {
                  this.pyjoburl = resp;
                  resolve();
              },
              error => {
                  reject(error);
              }
          );
      });
  }

  ngOnChanges(){
    this.ngAfterViewInit();
  }

  ngAfterViewInit(): void {
    this.ledsLibService.middleHeight();
    this.ledsLibService.equalHT();
    
  }
  // getPyJobUrl(){
  //   this.services.pyjob(localStorage.getItem('organization')).subscribe(resp => {
  //    this.pyjoburl=resp;
  //  });
  // }
  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = 'create';
        this.showRecipe=true;
        this.ngAfterViewInit();
        break;
      case 1:
        this.basicReqTab = 'edit';
        //if (!this.isVMAdapter) this.resizeing = true;
        this.recipeList;
        this.showRecipe=false;
        break;
    }
  }

  saveRecipe(action:any){
    //localStorage.setItem('datasetsCount',this.datasetsCount.toString());  
    if (this.validateRecipeName(this.recipeName)) {
      setTimeout(() => {
        this.recipeNameCheck = false;
      }, 5000);
      this.services.messageService("Recipe name already eixts","error");
      return;
    }
    const selectedRecipeObj: RecipeObject = new RecipeObject();
    selectedRecipeObj.recipe_id = 0;
    selectedRecipeObj.recipe_name = this.recipeName;
    selectedRecipeObj.object_name = this.alias;
    // selectedRecipeObj.object_id = 6;
    selectedRecipeObj.collection_name = [];    
    selectedRecipeObj.connection_id = 1;
    selectedRecipeObj.dataset_type = 'machine_learning';
    selectedRecipeObj.first_load = 'YES';
    selectedRecipeObj.object_dimensions = ['515', '31'];
    if (this.recipeType === 'transformation' || this.recipeType === 'pivot') {
     // this.recipeNameSelection.emit(selectedRecipeObj);
     // this.displayDialog = false;
      this.navigateToWrangling(selectedRecipeObj,action);
    }
    //  else if (this.recipeType === 'feature_engg') {
    //   this.navigateToFeatureEngg(selectedRecipeObj);
    // } 
    
    this.modalService.dismissAll();
    
    //console.log('filedatain dataset',this.quickStatsData);
    
  }
  editRecipe(action:any): void {
    let selectedRecipeObj: RecipeObject;
    selectedRecipeObj = this.recipeList.find(
      (obj) => obj.recipe_name === this.selectedRecipe
    );
    // selectedRecipeObj.object_name = this.selectedObject.object_name;
    // selectedRecipeObj.dataset_type = this.selectedObject.dataset_type;
    selectedRecipeObj.first_load = 'YES';
    selectedRecipeObj.datatypes_required = 'YES';
    //selectedRecipeObj.object_dimensions = this.connectionSelected.object_dimensions;
    if (this.recipeType === 'transformation' || this.recipeType === 'pivot') {
     // this.recipeNameSelection.emit(selectedRecipeObj);
      //this.displayDialog = false;
      this.navigateToWrangling(selectedRecipeObj,action);
    }
    //  else if (this.recipeType === 'feature_engg') {
    //   this.navigateToFeatureEngg(selectedRecipeObj);
    // }    
    this.modalService.dismissAll();
  }

  navigateToWrangling(selectedRecipeObj: RecipeObject,action:any): void { 
    let rName:any;
    if(action=='create'){
      rName=this.recipeName;
    }
    else if(action=='edit'){
      rName= this.selectedRecipe;
    } 
    let fData= this.fileData;  
    this.dataService.changeMessage(selectedRecipeObj);
    this.router.navigate(['./wrangling'+'/'+this.alias+'/'+action+'/'+rName],{
      state:{fileData: fData},
      relativeTo:this.route,
    })
  }
  validateRecipeName(recipeName: string): boolean {
    let condition = false;
    const object = this.recipeList.find(
      (existingRecipe) =>
        existingRecipe.recipe_name.toLowerCase() === recipeName.toLowerCase()
    );
    if (object) {
      condition = true;
     this.recipeNameCheck = true;
    }
    return condition;
  }
  getRequestObject(): Object {
    return {
      recipe_id: 0,
      recipe_name: 'NA',
      recipe_type: 'transformation',
      transformed_file_name: 'NA',
      function_name: 'NA',
      args: 'NA',
      collection_name: [],
      connection_id: 0,
      created_timestamp: 'None',
      updated_timestamp: 'None',
      is_active: 'YES',
      aip_login: 'True',
      org: localStorage.getItem('organization'),
      dataset_name: localStorage.getItem('nameid')
    };
  }
  getRecipeDetails(): void {
    //this.displaySpinner = true;
    this.reciepeSubscription.add(
      this.catalogueService
        .getExistingRecipes(this.getRequestObject(), this.pyjoburl, this.datasetName)
        .subscribe(
          (recipeDetails) => {
            console.log('add RecipeDetails',recipeDetails);
            
            if (recipeDetails.body.status_message === 'SUCCESS') {
              this.recipeList = [];
              for (const recipe of Object.keys(recipeDetails.body.response)) {
                // recipeDetails.body.response[recipe]['recipe_name'] = +recipe;
                this.recipeList.push(recipeDetails.body.response[recipe]);
              }
              const response = recipeDetails.body.response;
              for (const key in response) {
                  if (response.hasOwnProperty(key)) {
                    const recipe = response[key];
                    // this.recipeNameList.push(recipe.recipe_name);
                    let conn = { viewValue: recipe.recipe_name, value: recipe.recipe_name };
                    this.options.push(conn);
                  }
              }
              console.log('Recipe List', this.recipeList);
              console.log('Recipe Name List', this.recipeNameList);
              console.log('Recipe Names:- ', this.options);
              // if (this.recipeList.length > 0) {
              //   this.selectedTabIndex = 1;
              // } else {
              //   this.selectedTabIndex = 0;
              // }
              this.displaySpinner = false;
            } else {
              this.displaySpinner = false;
              //this.showError(recipeDetails.response);
            }
          },
          (error) => {
            if (error) {
              this.displaySpinner = false;
              //this.showError(error);
            }
          }
        )
    );
  }
  ngOnDestroy() {
    this.reciepeSubscription.unsubscribe();
  }

}
