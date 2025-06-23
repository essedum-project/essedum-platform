import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApisService } from '../../services/apis.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MessageService } from '../../services/message.service';

interface Userprofile {
  user_f_name: string;
  user_l_name: string;
  user_email: string;
  profileImage?: Blob; // Optional for image, use null or '' if undefined
  user_contact_number: string;
  designation: string;
}

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
  url = "";
  showProfileInfo = false;
  showUploadElements = false;
  uploading = false;
  profileImageName: string | null = null; // Store image name
  //usertest:Users
  retrievedDesignation: string;
  retrievedFirstName: string;
  retrievedLastName:string;
  retrievedEmail:string;
  retrievedContactNumber: string;
  profileImage: string = "";
  isProfileImage=sessionStorage.getItem("profileImage");
  @Output() dashboardprofileupdate = new EventEmitter<any>();


  constructor(
  private ApisServices : ApisService,
  private messageService :MessageService,
  public dialogRef : MatDialogRef<MyProfileComponent>,


  ) { }

  ngOnInit(): void {
    const userString = sessionStorage.getItem("user");
    const userObject = JSON.parse(userString)

    if (userObject && userObject.hasOwnProperty('profileImage')) {
      this.profileImage = userObject.profileImage;
      this.url = "data:image/png;base64," +  this.profileImage
     } else {
      this.profileImage = "";
     this.url = ""; 
     }
    this.retrievedFirstName  = userObject?.user_f_name
    this.retrievedLastName = userObject?.user_l_name
    this.retrievedEmail = userObject?.user_email
    this.retrievedContactNumber = JSON.parse(sessionStorage.getItem("user")).contact_number
    this.retrievedDesignation = userObject?.designation

}


 onImageSelected(event: any) {


  // this.profileImage = event.target.files[0];
  if (!event.target.files || event.target.files.length === 0) {
    return;
  }
   const file = event.target.files[0];
  if (file.size > 1048576) { // 1 MB limit (adjust as needed)
    this.messageService.error('File size exceeds limit (1 MB). Please select a smaller image.', 'Invalid Input');
    return;
  }
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedMimeTypes.includes(file.type)) {
    this.messageService.error('Invalid file type. Only JPEG, PNG, and GIF images are allowed.', 'Invalid Input');
   return;
  }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      if (reader.result) {
        this.profileImage = reader.result as string;
        this.showUploadElements = true;
      } else {
        this.messageService.error('Error reading image file.', 'error');
      }
    };

  this.toBase64(event.target.files[0], (base64Data) => {
    this.profileImage = base64Data;
    // this.user.profileImageName = event.target.files[0].name;
    this.url = "data:image/png;base64," + this.profileImage;
  });



 }
 private isValidFirstName(name: string): boolean {
 return /^[a-zA-Z][a-zA-Z0-9 \-\_\.]*?$/.test(name); 
}
private isValidLastName(name: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9 \-\_\.]*?$/.test(name);
}

async updateProfile(): Promise<void> {
  if (!this.profileImage) {
    this.messageService.error('Please select an image file to update profile picture.', 'Invalid Input');
    return;
  }
  if (!this.isValidFirstName(this.retrievedFirstName)) {
    this.messageService.error('Please enter a valid first name without special characters.', 'Invalid Input');
    return;
  }
  if (!this.isValidLastName(this.retrievedLastName)) {
    this.messageService.error('Please enter a valid last name without special characters.', 'Invalid Input');
    return;
  }

  const user = JSON.parse(sessionStorage.getItem('user'));
  if(this.profileImage.startsWith("data")){
    this.profileImage = this.profileImage.split(",")[1];
  }
 user.profileImage = this.profileImage; 
  user.designation = this.retrievedDesignation;
  user.user_f_name = this.retrievedFirstName;
  user.user_l_name = this.retrievedLastName;
  user.contact_number = this.retrievedContactNumber;
  user.user_email = this.retrievedEmail

  sessionStorage.setItem('user', JSON.stringify(user));
  this.uploading = true;

    this.ApisServices.update(user).subscribe(response=>{


       this.ApisServices.refreshProfileImage()
       this.messageService.Success('Profile updated successfully!', 'Success');

    },(error => {

      this.messageService.error('An error occurred while updating profile.', 'Error');
   }
 ));

  this.ApisServices.refreshProfileImage()

}




onCancelClick() {
    this.showUploadElements = true;
    this.profileImage = ''; // Reset image preview
  }

toBase64(file: File, cb: Function) {
    const fileReader: FileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = function (e: any) {
     const base64Data = e.target.result.substr(e.target.result.indexOf("base64,") + "base64,".length);
     cb(base64Data);
    };
   }

   closePopup(){
    this.dialogRef.close("cancel");
   }




}