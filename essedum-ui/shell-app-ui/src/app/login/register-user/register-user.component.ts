import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { ApisService } from "../../services/apis.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss']
})
export class RegisterUserComponent implements OnInit {
  /** Form Fields */
  username: any;
  userlogin: any;
  email: any;
  psd: any;
  confirmPsd: any;
  company: any;
  designation: any;
  cols2=2;
  lazyloadevent = { first: 0, rows: 5000, sortField: null, sortOrder: 1 };
  title:string = '';

  constructor(
    private apisService: ApisService, 
    private router: Router,
    private matSnackbar: MatSnackBar,
    private titleService: Title
  ) {
    this.title = this.titleService.getTitle();
   }

  ngOnInit() {
    this.resizeNgOnInit();
  }

  createUserAborted() {
    this.email = null;
    this.username = null;
    this.psd = null;
    this.confirmPsd = null;
    this.company = null;
    this.designation = null;
    this.userlogin = null;
    this.router.navigate(["login"]);
  }

  createNewUser() {
    if (this.username == undefined || this.username == null || this.username.trim().length == 0)
      return this.errorMsg("Name cannot be empty, Error");
    if (this.userlogin == undefined || this.userlogin == null || this.userlogin.trim().length == 0)
      return this.errorMsg("User Login cannot be empty, Error");
    if (this.psd == undefined || this.psd == null || this.psd.trim().length == 0)
      return this.errorMsg("Password cannot be empty, Error");

    if (this.confirmPsd == undefined || this.confirmPsd == null || this.confirmPsd.trim().length == 0)
      return this.errorMsg("Confirm Password cannot be empty, Error");
    
    if ( this.psd.trim().length < 8)
      return this.errorMsg("Password Should Be Minimum of 8 Characters, Error");
    if ( this.confirmPsd.trim().length < 8)
      return this.errorMsg("Confirm Password Should Be Minimum of 8 Characters, Error");
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_\[\]-{}|';:,+=|`~<\\\/>?])[A-Za-z\d!@#$%^&*_\[\]-{}|';:,+=|`~<\\\/>?].{7,19}$/.test(
        this.psd
      )
    )
    
      return this.errorMsg("Password should contain atleast 1 number, 1 uppercase and lowercase character and 1 special character, Error");
    if (!this.matchPasswordAndConfirmPassword()) 
      return this.errorMsg("Password Does not match, Error");
    if (this.email == undefined || this.email == null || this.email.trim().length == 0)
      return this.errorMsg("Email cannot be empty, Error");
    if (!this.email.match(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/))
      return this.errorMsg("This User Email does not match the required pattern, Error");
    if (this.company == undefined || this.company == null || this.company.trim().length == 0)
      return this.errorMsg("Company cannot be empty, Error");

    if (this.designation == undefined || this.designation == null || this.designation.trim().length == 0)
      return this.errorMsg("Designation cannot be empty, Error");

    this.email = this.email.trim();
    this.username = this.username.trim();
    this.psd = this.psd.trim();
    this.userlogin = this.userlogin.trim();
    this.confirmPsd = this.confirmPsd.trim();
    this.company = this.company.trim();
    this.designation = this.designation.trim();

    this.saveUser();
  }

  matchPasswordAndConfirmPassword() {
    if (this.psd == this.confirmPsd) return true;
    else {
      this.psd = null;
      this.confirmPsd = null;
      return false;
    }
  }

  saveUser() {
    let uname = this.email.split("@");

    let userDetails: any = new Object();

    // userDetails.user_login = uname[0];
    userDetails.user_email = this.email;
    userDetails.onboarded = true;
    userDetails.activated = true;
    userDetails.user_act_ind = false;
    userDetails.user_f_name = this.username;
    userDetails.user_login= this.userlogin;
    userDetails.force_password_change = false;
    userDetails.password = this.psd;

    let tempArr: any = [
      { key: "designation", value: this.designation },
      { key: "company", value: this.company },
    ];
    try {
      userDetails.clientDetails = JSON.stringify(tempArr);
    } catch (error) {}
    this.apisService.registerNewUser(userDetails).subscribe(
      (res) => {
        this.infoMsg("User Created, Login Using Credentials, "+ this.title);
        this.router.navigate(['']).then(()=>window.location.reload());
      },
      (error) => {
        this.errorMsg(error + " ERROR");
      }
    );
  }

  resizeNgOnInit(){
    this.cols2 = (window.outerWidth <= 640) ? 1 : 2;
  }

  onResizeScreen(event) {
    this.cols2 = (event.target.outerWidth <= 640) ? 1 : 2;
  }

  errorMsg(data1){
    let data = {
      message: data1, // message whch to be shown
      button: false,  // want to show button or only close icon button
      type: 'error', // type of message design
      successButton: 'Ok', // success button name
      errorButton: 'Cancel', // error button name
    }
    let duration : any = 2000;
    let horizontalPosition : any = "center";
    let verticalPosition;
    let panelClass;
    this.matSnackbar.openFromComponent(null, {
    data: data,
    duration: duration,
    horizontalPosition: horizontalPosition,
    verticalPosition: verticalPosition,
    panelClass: panelClass,
  });
  }

  infoMsg(data1){
    let data = {
      message: data1, // message whch to be shown
      button: false,  // want to show button or only close icon button
      type: 'info', // type of message design
      successButton: 'Ok', // success button name
      errorButton: 'Cancel', // error button name
    }
    let duration : any = 2000;
    let horizontalPosition : any = "center";
    let verticalPosition;
    let panelClass;
    this.matSnackbar.openFromComponent(null, {
    data: data,
    duration: duration,
    horizontalPosition: horizontalPosition,
    verticalPosition: verticalPosition,
    panelClass: panelClass,
  });
  }
}
