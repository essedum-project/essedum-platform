import * as moment from 'moment';
import { Users } from '../models/users';


export class TimezoneUtil{

    currentUser: Users;

    setMomentTz(){
        this.currentUser = JSON.parse(sessionStorage.getItem("user"));
        let userTz = this.currentUser.timezone ? this.currentUser.timezone : 'Asia/Kolkata';
        moment.tz.setDefault(userTz);
    }

    updateToTimezone(date){
        const tz1 = moment.tz.guess()
        let utcTime = moment.tz(date, tz1).utc().format();
        let userTime = moment.utc(utcTime)
          .tz(this.currentUser.timezone ? this.currentUser.timezone : 'Asia/Kolkata')
          .format('YYYY-MMM-DD HH:mm:ss');
        return userTime;
    }

}