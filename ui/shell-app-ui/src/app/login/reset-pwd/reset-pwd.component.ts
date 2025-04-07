import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { MessageService } from '../../services/message.service';
import { ApisService } from '../../services/apis.service';
import { MessageBarComponent } from 'leds-lib';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

@Component({
	selector: 'app-reset-pwd',
	templateUrl: './reset-pwd.component.html',
	styleUrls: ['./reset-pwd.component.scss']
})
export class ResetPwdComponent implements OnInit {
	emailid: any;
	busy: Subscription = new Subscription();
	securityKey;
	title:string = '';
	constructor(
		public dialogRef: MatDialogRef<ResetPwdComponent>,
		private emailService: ApisService,
		private matSnackbar: MatSnackBar,
		private titleService: Title
	) { 
		this.title = this.titleService.getTitle();
	}

	ngOnInit(): void {
		console.log('Inside reset compponent');
	}
	forgotpwd() {
		if (this.emailid == undefined || this.emailid == null || this.emailid.trim().length == 0)
			// return this.messageService.error('Email cannot be empty', 'Error');
			return this.errorMsg('Email cannot be empty, Error');
		else if (!this.emailid.match(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/))
			// this.messageService.error('Please Provide valid Email', '+this.title);
			this.errorMsg('Please Provide valid Email, '+this.title);
		else {
			this.emailService.checkEmail(this.emailid).subscribe(
				(res) => {
					let mail;
					mail = window.btoa(this.emailid);
					const data = new FormData();
					let protocol = window.location.protocol;
					let hostName = window.location.hostname;
					let port = window.location.port;
					let emailMessage = `To reset your password please click on the following link ${protocol}//${hostName}:${port}/#/resetpassword/${mail}`;
					let emailObject = {
						to: this.emailid,
						subject: 'Reset Password',
						message: emailMessage
					};
					for (let key in emailObject) {
						data.append(key, emailObject[key]);
					}
					this.busy = this.emailService.forgotPassword(data).subscribe(
						(res) => {
							// this.messageService.info('Email Sent. Please check your mailbox.', '+this.title);
							this.infoMsg('Email Sent. Please check your mailbox., '+this.title);
							this.dialogRef.close();
						},
						(error) => {
							// this.messageService.error('Couldnot send mail. Please try after sometime.', '+this.title);
							this.errorMsg('Couldnot send mail. Please try after sometime., '+this.title);
						}
					);
				},
				(error) => {
					// this.messageService.error('User not registered. Please Register.', '+this.title);
					this.errorMsg('User not registered. Please Register., '+this.title);
				}
			);
		}
	}

	errorMsg(data1) {
		let data = {
			message: data1, // message whch to be shown
			button: false, // want to show button or only close icon button
			type: 'error', // type of message design
			successButton: 'Ok', // success button name
			errorButton: 'Cancel' // error button name
		};
		let duration: any = 2000;
		let horizontalPosition: any = 'center';
		let verticalPosition;
		let panelClass;
		this.matSnackbar.openFromComponent(MessageBarComponent, {
			data: data,
			duration: duration,
			horizontalPosition: horizontalPosition,
			verticalPosition: verticalPosition,
			panelClass: panelClass
		});
	}

	infoMsg(data1) {
		let data = {
			message: data1, // message whch to be shown
			button: false, // want to show button or only close icon button
			type: 'info', // type of message design
			successButton: 'Ok', // success button name
			errorButton: 'Cancel' // error button name
		};
		let duration: any = 2000;
		let horizontalPosition: any = 'center';
		let verticalPosition;
		let panelClass;
		this.matSnackbar.openFromComponent(MessageBarComponent, {
			data: data,
			duration: duration,
			horizontalPosition: horizontalPosition,
			verticalPosition: verticalPosition,
			panelClass: panelClass
		});
	}
}
