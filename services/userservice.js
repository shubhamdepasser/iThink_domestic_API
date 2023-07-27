const validator = require('validator');
const bcrypt = require('bcryptjs');
var express = require('express');
var mysqlpool = require('../dbconfig');
const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
var session = require('express-session');
const app = express();
const md5 = require('md5');
const date = require('date-and-time');
var randomize = require('randomatic');
var decode = require('decode-html');
const nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var sendMail = require('../method/sendMail');
var htmlspecialchars = require('htmlspecialchars');

exports.login_user = async function(form_data, req, res, next) 
{  
    try{
    var userdata = [];
    userdata = await User.login_user(form_data);
    //console.log(userdata);
    if (userdata.length == 0)
    { 
        res.status(200).json({
            status_code : 200,
            status: 'error',
            message : "Email id does not exist.",
            user: []
        });
        return;
    }
    else
    {
        var user_data_array = [];
        const map = new Map();
        for (const user of userdata) 
        {
            var db_user_email = user.email.toLowerCase();
            var formdata_user_email = form_data.email.toLowerCase();
            var db_user_password = user.password;
            var formdata_user_password = md5(form_data.password);
            var user_id = user.id
            var mobile_token_exp_date = user.mobile_token_exp_date;
            var mobile_access_token = user.mobile_access_token;
            const pattern = date.compile('YYYY-MM-DD');
            const now = new Date();
            var current_date = date.format(now, pattern);
            mobile_token_exp_date = date.format(mobile_token_exp_date, pattern);
            
            if(mobile_token_exp_date > current_date)
            {
                
                mobile_access_token    =mobile_access_token;
                mobile_token_exp_date  =mobile_token_exp_date;
                
            }
            else
            {
                mobile_access_token = md5(randomize('*', 30)).substr(0, 30);
                mobile_token_exp_date = date.format(date.addYears(now, 1), pattern) ;
                console.log(mobile_token_exp_date)
                console.log(current_date)

            }
            if(db_user_email == formdata_user_email && db_user_password == formdata_user_password)
            {
                if(user.status == 1 || user.status == 0)
                {
                    map.set(db_user_email, true);    // set any value to Map
                    user_data_array.push({
                        user_id                 :user.id,
                        first_name              :decode(user.first_name),
                        last_name               :decode(user.last_name),
                        user_name               :decode(user.user_name),
                        user_type               :user.user_type,
                        email                   :decode(user.email),
                        gender                  :decode(user.gender),
                        date_of_birth           :decode(user.date_of_birth),
                        profile_pic             :decode(user.profile_pic),
                        mobile                  :user.mobile,
                        mobile_verify           :user.mobile_verify,
                        email_verify            :user.email_verify,
                        status                  :user.status,
                        mobile_access_token     :mobile_access_token,
                        mobile_token_exp_date   :mobile_token_exp_date,         
                    });
                
                    //console.log(date.format(date.addYears(now, 1), pattern));
                    
                    
                    //console.log("select from user table done");
                    var update_last_login_and_mobile_access_token = await User.update_last_login_and_mobile_access_token(user_id,mobile_access_token,mobile_token_exp_date,current_date);
                    //console.log("Update to user table done");
                    var insert_user_login_details_query = await User.insert_user_login_details_query(user_id,current_date,'1');
                    //console.log("insert in user_login_details table done");
                    
                    
                    res.status(200).json({
                        status_code : 200,
                        status: 'success',
                        message : "Login successful",
                        user : user_data_array,
                    });
                    return;
                }
                else if (user.status == 2) 
                {
                    res.status(200).json({
                        status_code : 200,
                        status: 'error',
                        message : "Account is blocked. Try to contact Admin.",
                        user: []
                    });
                    return;
                }
                else
                {
                    res.status(200).json({
                        status_code : 200,
                        status: 'error',
                        message : "Some Error Occured! Try again later.",
                        user: []
                    });
                    return;
                }
            }
            else
            {
                res.status(200).json({
                    status_code : 200,
                    status: 'error',
                    message : "Email id & password does not match.",
                    user: []
                });
                return;
            }
        }
        
    }
} 
catch(e)
{
    res.status(200).json({
        status_code : 400,
        status: 'error',
        message : "Some Error Occured! Try again later.",
        err: e,
    });
    return;
}
            
};

       
  
exports.forgot_password = async function(form_data, req, res, next) 
{
    try{
    var Email = form_data.email;
    if(Email != "")
    {
        var userdata;
        var user_onboard;
        userdata = await User.forgot_password(form_data);
        var user_data_array = [];
        var user_table = 0;
        var onboard_user_table = 0;
        if (userdata.length > 0)
        { 
            user_table = 1;
            const map = new Map();
            for (const user of userdata) 
            {  
                user_data_array = user;
            }
        }
        else
        {
            user_onboard = await User.onboard_forgot_password(form_data);
            if (user_onboard.length > 0)
            { 
                onboard_user_table = 1;
                const map = new Map();
                for (const user of user_onboard) 
                {  
                    user_data_array = user;
                }
            }
        }
        if(user_table == 1 || onboard_user_table == 1)
        {
            var OTP = Math.floor(1000 + Math.random() * 9000);
            console.log(OTP);
            var unique_key = md5(randomize('*', 30)).substr(0, 32);
            const current_date = new Date();
            console.log(current_date);
            var update_user_query;
            var update_user_key_array = [];
            if(user_table > 0)
            {
                var row_id = user_data_array.id;
                var db_user_name = decode(user_data_array.first_name)+" "+decode(user_data_array.last_name);
                update_user_query = "UPDATE user set app_unique_key_forgot_password= ? ,app_forgot_password_date= ?,app_is_password_reset='0' where id=?";
                update_user_key_array = [OTP, current_date, row_id];
            }
            else
            {
                var row_id = user_data_array.id;
                var db_user_name = decode(user_data_array.first_name)+" "+decode(user_data_array.last_name);
                update_user_query = "UPDATE user set app_unique_key_forgot_password= ? ,app_forgot_password_date= ?,app_is_password_reset='0' where id=?";
                update_user_key_array = [OTP, current_date, row_id];
            }
            
            var result_update_user_query = await User.update_user_forgot_pass_query(update_user_query,update_user_key_array);
            console.log(result_update_user_query);
            if(result_update_user_query)
            {
                
                var send_mail = sendMail.send_mail_aws("cholkeshubham1996@gmail.com","kuldeep@depasserinfotech.in",'Forgot Password','OTP = '+OTP);
                if(send_mail)
                {
                    res.status(200).json({
                        status : "success",
                        status_code : 200,
                        message : "OTP sent successfully to your mobile number and email",
                    });
                    return;
                }
                else
                {
                    res.status(200).json({
                        status : "error",
                        status_code : 200,
                        message : "Something went wrong!!! please try again.",
                    });
                    return;
                }
            }
            else
            {
                res.status(200).json({
                    status_code : 200,
                    status: 'error',
                    message : "Some Error Occured! Please try again.",
                });
                return;
            }
        }
        else
        {
            res.status(200).json({
                status_code : 200,
                status: 'error',
                message : "Email id does not exist.",
            });
            return;
        }
    }
    else
    {
        res.status(200).json({
            status_code : 200,
            status: 'error',
            message : "Please enter Email ID.",
        });
        return;
    }   
}catch(e)
{
    res.status(200).json({
        status_code : 400,
        status: 'error',
        message : "Some Error Occured! Try again later.",
        err: e,
    });
    return;
}        
};

exports.reset_password = async function(form_data, req, res, next) 
{
    try{
    const regex = RegExp('/^(?=.*\d)(?=.*[@#\-_$%^&+=ยง!\?])(?=.*[a-z])(?=.*[A-Z])[0-9A-Za-z@#\-_$%^&+=ยง!\?]{8,50}$/');    var unique_key_forgot_password = form_data.unique_key_forgot_password;
    var password = form_data.password;
    var email = form_data.email;
    var confirm_password = form_data.confirm_password;
    var unique_key_forgot_password = form_data.unique_key_forgot_password;
    if(unique_key_forgot_password != "")
    {
        if(password == '' && password.length < 8)
        {
            res.status(200).json({
                status_code : 200,
                status: 'error',
                message : "Password should have minimum eight characters"
            });
            return;
        }

        if(confirm_password == '' && confirm_password.length < 8)
        {
            res.status(200).json({
                status_code : 200,
                status: 'error',
                message : "Password should have minimum eight characters"
            });
            return;
        }
        if(regex.test(password)) 
        {
            res.status(200).json({
                status_code : 200,
                status: 'error',
                message : "Password should contain alphanumeric, special characters, Upper and lower case."
            });
            return;
        }

        else if(regex.test(confirm_password)) 
        {
            res.status(200).json({
                status_code : 200,
                status: 'error',
                message : "Password should contain alphanumeric, special characters, Upper and lower case."
            });
            return;
        }
        if(password != confirm_password)
        {
            res.status(200).json({
                status_code : 200,
                status: 'error',
                message : "Password and Confirm Password should match"
            });
            return;
        }
        const current_date = new Date();
            
        var userdata;
        var user_onboard;
        var get_reset_password_query;
        get_reset_password_query = "SELECT id from user where email=? and app_is_password_reset = '0'";
        userdata = await User.reset_password(get_reset_password_query,email);
        var user_data_array = [];
        var user_table = 0;
        var onboard_user_table = 0;
        if (userdata.length > 0)
        { 
            user_table = 1;
            const map = new Map();
            for (const user of userdata) 
            {  
                user_data_array = user;
            }
        }
        else
        {   
            var get_reset_password_query2;
            get_reset_password_query2 = "SELECT id from user where email=? and app_is_password_reset = '0'";
            user_onboard = await User.reset_password(get_reset_password_query2,email);
           
            if (user_onboard.length > 0)
            { 
                onboard_user_table = 1;
                const map = new Map();
                for (const user of user_onboard) 
                {  
                    user_data_array = user;
                }
            }
        }
        if(user_table == 1 || onboard_user_table == 1)
        {
            var update_user_query;
            var update_user_key_array = [];
            if(user_table > 0)
            {
                var row_id = user_data_array.id;
                update_user_query = "UPDATE user set password=?,app_is_password_reset='1' where id = ?";
                update_user_key_array = [md5(password), row_id];
            }
            else
            {
                var row_id = user_data_array.id;
                update_user_query = "UPDATE user set password=?,app_is_password_reset='1' where id = ?";
                update_user_key_array = [md5(password), row_id];
            }
            
            var result_update_user_query = await User.update_user_password_query(update_user_query,update_user_key_array);
            console.log(result_update_user_query);
            if(result_update_user_query)    
            {
                res.status(200).json({
                    status_code : 200,
                    status: 'success',
                    message : "success"
                });
                return;
            }
            else
            {
                res.status(200).json({
                    status_code : 200,
                    status: 'error',
                    message : "Some Error Occured! Please try again."
                });
                return;
            }
        }
        else
        {
            res.status(200).json({
                status_code : 200,
                status: 'error',
                message : "Some Error Occured! Please try again"
            });
            return;
        }
    }
    else
    {
        res.status(200).json({
            status_code : 401,
            status: 'error',
            message : "Invalid request.."
        });
        return;
    }   
}catch(e)
{
    res.status(200).json({
        status_code : 400,
        status: 'error',
        message : "Some Error Occured! Try again later.",
        err: e,
    });
    return;
}     
};
        //return user_array;
        
    

exports.get_pincode_state_city = async function(form_data, req, res, next) 
{
    try{
    
        var get_city_state;
        var pincode = form_data.pincode;
        var state = form_data.state;
        var is_city_state_for_pincode = form_data.is_city_state_for_pincode;
        if(is_city_state_for_pincode == 0)
        {
            get_city_state = await User.get_state();
            var user_data_array = [];
            var user_table = 0;
            var onboard_user_table = 0;
            if (get_city_state.length > 0)
            { 
                res.status(200).json({
                    status_code : 200,
                    status: 'success',
                    state_data : get_city_state
                });
                return;
            }
            else
            {
                res.status(200).json({
                    status_code : 401,
                    status: 'error',
                    message : "Invalid request.."
                });
                return;
            }
        }else if(is_city_state_for_pincode == 1)
        {
            get_city_state = await User.get_pincode_state_city(pincode);
            var user_data_array = [];
            var user_table = 0;
            var onboard_user_table = 0;
            if (get_city_state.length > 0)
            { 
                res.status(200).json({
                    status_code : 200,
                    status: 'success',
                    city_state_data : get_city_state
                });
                return;
            }
            else
            {
                res.status(200).json({
                    status_code : 401,
                    status: 'error',
                    message : "Invalid request.."
                });
                return;
            }
        }
        else
        {
            get_citys_from_state = await User.get_citys_from_state(state);
            var user_data_array = [];
            var user_table = 0;
            var onboard_user_table = 0;
            if (get_citys_from_state.length > 0)
            { 
                res.status(200).json({
                    status_code : 200,
                    status: 'success',
                    get_citys_from_state : get_citys_from_state
                });
                return;
            }
            else
            {
                res.status(200).json({
                    status_code : 401,
                    status: 'error',
                    message : "Invalid request.."
                });
                return;
            }
        }
    }catch(e)
    {
        res.status(200).json({
            status_code : 400,
            status: 'error',
            message : "Some Error Occured! Try again later.",
            err: e,
        });
        return;
    }
};

exports.get_otp = async function(form_data, req, res, next) 
{
    try{
    var mobile = form_data.mobile;
    var user_id = htmlspecialchars(form_data.id);
    var email = htmlspecialchars(form_data.email);
    var type = form_data.type;
    var OTP = Math.floor(1000 + Math.random() * 9000);
    console.log(OTP);  
    var update_opt_query;
    var update_opt_data_array;
    if(type == 0)
    {
        //update_opt_query = "UPDATE user set app_unique_key_forgot_password= ? where email=?";
        //update_opt_data_array = [OTP, email];
        var Email = form_data.email;
        if(Email != "")
        {
            var userdata;
            var user_onboard;
            userdata = await User.forgot_password(form_data);
            var user_data_array = [];
            var user_table = 0;
            var onboard_user_table = 0;
            if (userdata.length > 0)
            { 
                user_table = 1;
                const map = new Map();
                for (const user of userdata) 
                {  
                    user_data_array = user;
                }
            }
            else
            {
                user_onboard = await User.onboard_forgot_password(form_data);
                if (user_onboard.length > 0)
                { 
                    onboard_user_table = 1;
                    const map = new Map();
                    for (const user of user_onboard) 
                    {  
                        user_data_array = user;
                    }
                }
            }
            if(user_table == 1 || onboard_user_table == 1)
            {
                
                var unique_key = md5(randomize('*', 30)).substr(0, 32);
                const current_date = new Date();
                console.log(current_date);
                var update_user_query;
                var update_user_key_array = [];
                if(user_table > 0)
                {
                    var row_id = user_data_array.id;
                    var db_user_name = decode(user_data_array.first_name)+" "+decode(user_data_array.last_name);
                    update_user_query = "UPDATE user set app_unique_key_forgot_password= ? ,app_forgot_password_date= ?,app_is_password_reset='0' where id=?";
                    update_user_key_array = [OTP, current_date, row_id];
                }
                else
                {
                    var row_id = user_data_array.id;
                    var db_user_name = decode(user_data_array.first_name)+" "+decode(user_data_array.last_name);
                    update_user_query = "UPDATE user set app_unique_key_forgot_password= ? ,app_forgot_password_date= ?,app_is_password_reset='0' where id=?";
                    update_user_key_array = [OTP, current_date, row_id];
                }
                
                var result_update_user_query = await User.update_user_forgot_pass_query(update_user_query,update_user_key_array);
                console.log(result_update_user_query);
                if(result_update_user_query)
                {
                    
                    var send_mail = sendMail.send_mail_aws("cholkeshubham1996@gmail.com","kuldeep@depasserinfotech.in",'Forgot Password','OTP = '+OTP);
                    if(send_mail)
                    {
                        res.status(200).json({
                            status : "success",
                            status_code : 200,
                            message : "OTP sent successfully to your mobile number and email",
                            OTP: OTP
                        });
                        return;
                    }
                    else
                    {
                        res.status(200).json({
                            status : "error",
                            status_code : 200,
                            message : "Something went wrong!!! please try again.",
                        });
                        return;
                    }
                }
                else
                {
                    res.status(200).json({
                        status_code : 200,
                        status: 'error',
                        message : "Some Error Occured! Please try again.",
                    });
                    return;
                }
            }
            else
            {
                res.status(200).json({
                    status_code : 200,
                    status: 'error',
                    message : "Email id does not exist.",
                });
                return;
            }
        }
        else
        {
            res.status(200).json({
                status_code : 200,
                status: 'error',
                message : "Please enter Email ID.",
            });
            return;
        }
    }
    else if(type == 1)
    {
        update_opt_query = "UPDATE user set mobile_account_details_otp= ? where email=?";
        update_opt_data_array = [OTP, email];
        var update_opt = await User.get_otp(update_opt_query,update_opt_data_array);
    
        if (update_opt == 1)
        { 
            var send_mail = sendMail.send_mail_aws("cholkeshubham1996@gmail.com","kuldeep@depasserinfotech.in",'Mobile account details OTP','OTP = '+OTP);
            if(send_mail)
            {
                res.status(200).json({
                    status : "success",
                    status_code : 200,
                    message : "OTP sent successfully to your mobile number and email",
                    OTP: OTP
                });
                return;
            }
            else
            {
                res.status(200).json({
                    status : "error",
                    status_code : 200,
                    message : "Something went wrong!!! please try again.",
                });
                return;
            }
        }
        else
        {
            res.status(200).json({
                status_code : 401,
                status: 'error',
                message : "Invalid request.."
            });
            return;
        }
        
    }
    else if(type == 2)
    {
        update_opt_query = "UPDATE user set mobile_bank_rate_chart_otp= ? where email=?";
        update_opt_data_array = [OTP, email];
        var update_opt = await User.get_otp(update_opt_query,update_opt_data_array);
    
        if (update_opt == 1)
        { 
            var send_mail = sendMail.send_mail_aws("cholkeshubham1996@gmail.com","kuldeep@depasserinfotech.in",'Mobile bank rate chart OTP','OTP = '+OTP);
            if(send_mail)
            {
                res.status(200).json({
                    status : "success",
                    status_code : 200,
                    message : "OTP sent successfully to your mobile number and email",
                    OTP: OTP
                });
                return;
            }
            else
            {
                res.status(200).json({
                    status : "error",
                    status_code : 200,
                    message : "Something went wrong!!! please try again.",
                });
                return;
            }
        }
        else
        {
            res.status(200).json({
                status_code : 401,
                status: 'error',
                message : "Invalid request.."
            });
            return;
        }
    }
    else if(type == 3)
    {
        update_opt_query = "UPDATE user set mobile_account_details_otp= ? where email=?";
        update_opt_data_array = [OTP, email];
        var update_opt = await User.get_otp(update_opt_query,update_opt_data_array);
    
        if (update_opt == 1)
        { 
            var send_mail = sendMail.send_mail_aws("cholkeshubham1996@gmail.com","kuldeep@depasserinfotech.in",'Mobile bank rate chart OTP','OTP = '+OTP);
            if(send_mail)
            {
                res.status(200).json({
                    status : "success",
                    status_code : 200,
                    message : "OTP sent successfully to your mobile number and email",
                    OTP: OTP
                });
                return;
            }
            else
            {
                res.status(200).json({
                    status : "error",
                    status_code : 200,
                    message : "Something went wrong!!! please try again.",
                });
                return;
            }
        }
        else
        {
            res.status(200).json({
                status_code : 401,
                status: 'error',
                message : "Invalid request.."
            });
            return;
        }
    }
    
}
catch(e)
{
    res.status(200).json({
        status_code : 400,
        status: 'error',
        message : "Some Error Occured! Try again later.",
        err: e,
    });
    return;
}
    
     
};

exports.verify_opt = async function(form_data, req, res, next) 
{
    try{
    var mobile = form_data.mobile;
    
    var email = htmlspecialchars(form_data.email);
    var type = form_data.type;
    var OTP = form_data.otp;
    console.log(OTP);  
    var update_opt;
    var update_opt_query;
    var update_opt_data_array;
    if(type == 0)
    {
        var userdata;
        var user_onboard;
        update_opt_query = "SELECT id from user where email = ? and app_is_password_reset = '0'";
        update_opt_data_array = [email];
        update_opt = await User.verify_opt(update_opt_query,update_opt_data_array);
        if (update_opt.length != 0)
        { 
            update_opt_query = "SELECT id from user where app_unique_key_forgot_password=? and email = ? and app_is_password_reset = '0'";
            update_opt_data_array = [OTP, email];
            update_opt = await User.verify_opt(update_opt_query,update_opt_data_array);
        }
        else
        {   
            update_opt_query = "SELECT id from user where app_unique_key_forgot_password=?  and email = ? and app_is_password_reset = '0'";
            //user_onboard = await User.reset_password(get_reset_password_query2,unique_key_forgot_password);
            update_opt_data_array = [OTP, email];
            update_opt = await User.verify_opt(update_opt_query,update_opt_data_array);
            
        }
       // update_opt_query = "SELECT * FROM user where app_unique_key_forgot_password = ? and email = ?";
        
        
    }
    else if(type == 1)
    {
        update_opt_query = "SELECT * FROM user where mobile_account_details_otp = ? and email = ?";
        update_opt_data_array = [OTP, email];
        update_opt = await User.verify_opt(update_opt_query,update_opt_data_array);
    }
    else if(type == 2)
    {
        update_opt_query = "SELECT * FROM user where mobile_bank_rate_chart_otp = ? and email = ?";
        update_opt_data_array = [OTP, email];
        update_opt = await User.verify_opt(update_opt_query,update_opt_data_array);
    }
    else if(type == 3)
    {
        update_opt_query = "SELECT * FROM user where mobile_account_details_otp = ? and email = ?";
        update_opt_data_array = [OTP, email];
        update_opt = await User.verify_opt(update_opt_query,update_opt_data_array);
        if (update_opt.length != 0)
        {
            update_opt_query1 = "UPDATE user set email_verify= 1 where email=?";
            update_opt_data_array1 = [email];
            var update_opt1 = await User.get_otp(update_opt_query1,update_opt_data_array1);
        }
    }
    
    
    
    
    if (update_opt.length == 0)
    { 
        res.status(200).json({
            status_code : 200,
            status: 'error',
            message : "OTP does not match... please try again",
        });
        return;
    }
    else
    
    { 
        res.status(200).json({
            status_code : 200,
            status: 'success',
            message : "OTP matched"
        });
        return;
    }
}
catch(e)
{
    res.status(200).json({
        status_code : 400,
        status: 'error',
        message : "Some Error Occured! Try again later.",
        err: e,
    });
    return;
}  
     
};

exports.get_current_balance = async function(form_data, req, res, next) 
{
    try{
        var get_current_balance;
        var id = htmlspecialchars(form_data.id);
        var query = "SELECT total_credit_amount from user where id = ?";
        var array = [id];
        get_current_balance = await User.verify_opt(query,array);
        res.status(200).json({
            status : "success",
            status_code : 200,
            current_balance: get_current_balance
        });
        return;
    }catch(e)
    {
        res.status(200).json({
            status_code : 400,
            status: 'error',
            message : "Some Error Occured! Try again later.",
            err: e,
        });
        return;
    }
};
