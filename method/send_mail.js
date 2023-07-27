const validator = require('validator');
const bcrypt = require('bcryptjs');
var express = require('express');
var mysqlpool = require('../dbconfig');
const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');
const accountSettingsModel = require('../models/accountSettingsModel');
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
const authController = require('./../controllers/authController');
const User = require('../models/userModel');
const upload = require('./../method/upoadFile');
var awsUploadDownload = require('../method/awsUploadDownloadImage');
const e = require('express');


exports.change_password = async function(form_data, req, res, next) 
{
    try{
  var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    var userdata = [];
    var user_id = form_data.id;
    var new_password = md5(form_data.new_password);
    var repeat_password =  md5(form_data.repeat_password);
    var old_password = md5(form_data.old_password);
    var db_password;
    var db_email;
    userdata = await accountSettingsModel.getUserDetailsByID(user_id);
    if (userdata.length == 0)
    { 
        res.status(200).json({
            status_code : 200,
            status: 'success',
            message : "Email id does not exist.",
        });
        return;
    }
    var user_data_array = [];
    const map = new Map();
    for (const user of userdata) 
    {    // set any value to Map
        db_password=user.password;
        db_email = user.email;
    }
    if(old_password == db_password)
    {
        if(new_password == repeat_password)
        {
            if(old_password != new_password)
            {
                var update_user_password_query;
                var update_user_key_array = [];
                const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
                const now = new Date();
                var current_date = date.format(now, pattern);
                update_user_password_query = "update user set password=?,modified_on=? where id=?";
                update_user_key_array = [new_password, current_date, user_id];
                var result_update_user_query = await accountSettingsModel.update_user_password(update_user_password_query,update_user_key_array);
                console.log(result_update_user_query);
                if(result_update_user_query[0].result)
                {
                    if(result_update_user_query[0].affectedRows == 0)
                    {
                        res.status(200).json({
                            status_code : 200,
                            status: 'success',
                            message : "Nothing Updated by user.",
                        });
                        return;
                    }
                    else{
                        var to_mail = "cholkeshubham1996@gmail.com";
                        var cc = "kuldeep@depasserinfotech.in"
                        var subject = 'Password Reset successfully'
                        var msg = "Password Reset successfully"
                        var send_mail = sendMail.send_mail_aws(to_mail,cc,subject,msg);
                        
                        
                        res.status(200).json({
                            status : "success",
                            status_code : 200,
                            message : "Password details updated successfully",
                        });
                        return;
                        
                    }
                    
                }
            }
            else
            {
                res.status(200).json({
                    status_code : 200,
                    status: 'error',
                    message : "New password cannot be same as current password",
                });
                return;
            }
        }
        else
        {
            res.status(200).json({
                status_code : 200,
                status: 'error',
                message : "New password & repeat password does not match.",
            });
            return;
        }
    }
    else
    {
        res.status(200).json({
            status_code : 200,
            status: 'error',
            message : "Current password does not match.",
        });
        return;
    }
	  var end_date_time = new Date();
	  var end_date_time_h = addZero(start_date_time.getHours(), 2);
	  var end_date_time_m = addZero(start_date_time.getMinutes(), 2);
	  var end_date_time_s = addZero(start_date_time.getSeconds(), 2);
	  var end_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
	  var res_time = end_date_time_h+" : "+end_date_time_m+" : "+end_date_time_s+" : "+end_date_time_ms;
		res.status(200).json({
        status_code : 200,
        status: 'success',
        userdata : userdata,
		req_time: req_time,
		res_time: res_time,
    });
    return;
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
    
}

exports.warehouseAddressAddEdit = async function(form_data, req, res, next) 
{  
    try{
		var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    var userdata = [];
                  
    var user_id = htmlspecialchars(form_data.id);
    var state_id = htmlspecialchars(form_data.state_id);
    var city_id = htmlspecialchars(form_data.city_id);
    var address1 = htmlspecialchars(form_data.address1);
    var address2 = htmlspecialchars(form_data.address2);
    var pincode = htmlspecialchars(form_data.pincode);
    var mobile = htmlspecialchars(form_data.mobile);
    var email = htmlspecialchars(form_data.email);
    var website = htmlspecialchars(form_data.website);
    var company_name = htmlspecialchars(form_data.company_name);
    var status = htmlspecialchars(form_data.status);
    var is_default = htmlspecialchars(form_data.is_default);
    var is_edit = htmlspecialchars(form_data.is_edit);
    console.log(is_edit)
    var edit_id = htmlspecialchars(form_data.edit_id);
    var country_id = 101;
    var pincode_data_array = [];
    var addWareHouseAdderess;
    var editWareHouseAdderess;
    var get_pincode_query = await accountSettingsModel.checkPincode(pincode);    

    pincode_data_array = get_pincode_query;
    var end_date_time = new Date();
	  var end_date_time_h = addZero(start_date_time.getHours(), 2);
	  var end_date_time_m = addZero(start_date_time.getMinutes(), 2);
	  var end_date_time_s = addZero(start_date_time.getSeconds(), 2);
	  var end_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
	  var res_time = end_date_time_h+" : "+end_date_time_m+" : "+end_date_time_s+" : "+end_date_time_ms;
    if(pincode_data_array.length == 0)
    {
        res.status(200).json({
            status_code : 200,
            status: 'error',
            message : "Invalid Pincode",
        });
        return;
    }
    
    if(is_default == 1 && status == 0)
    {
        res.status(200).json({
            status_code : 200,
            status: 'error',
            message : "Please select active checkbox",
        });
        return;
    }    
    if(is_edit == 0){
        addWareHouseAdderess = await accountSettingsModel.addWareHouseAdderess(form_data);
        if (addWareHouseAdderess)
        { 
            res.status(200).json({
                status_code : 200,
                status: 'success',
                message : "Warehouse address Added successfully.",
				req_time: req_time,
				res_time:res_time,
            });
            return;
        }
    }else{
        editWareHouseAdderess = await accountSettingsModel.editWareHouseAdderess(form_data);
        if (editWareHouseAdderess)
        { 
            res.status(200).json({
                status_code : 200,
                status: 'success',
                message : "Warehouse address Updated successfully.",
				req_time: req_time,
				res_time:res_time,
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
}

exports.viewWarehouseAddress = async function(form_data, req, res, next) 
{ 
    try{            
var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;	
    var user_id = htmlspecialchars(form_data.id);
    
    var get_WarehouseAddress = await accountSettingsModel.viewWarehouseAddress(user_id);   
    var WarehouseAddress_array = [];
    if (get_WarehouseAddress.length == 0)
    { 
        res.status(200).json({
            status_code : 200,
            status: 'success',
            message : "No Data",
            wareHouseAddress_data : WarehouseAddress_array,
        });
        return;
    }
    for (const WarehouseAddress of get_WarehouseAddress) 
    {    // set any value to Map
        WarehouseAddress_array.push({
            id                      :WarehouseAddress.id,
            user_id                 :WarehouseAddress.user_id,
            company_name            :decode(WarehouseAddress.company_name),
            website                 :WarehouseAddress.website,
            mobile                  :decode(WarehouseAddress.mobile),
            contact_person          :decode(WarehouseAddress.contact_person),
            email                   :decode(WarehouseAddress.email),
            address1                :decode(WarehouseAddress.address1),
            address2                :decode(WarehouseAddress.address2),
            pincode                 :WarehouseAddress.pincode,
            city_id                 :WarehouseAddress.city_id,
            state_id                :WarehouseAddress.state_id,
            country_id              :WarehouseAddress.country_id,
            status                  :WarehouseAddress.status,
            is_default              :WarehouseAddress.is_default,
            city_name               :WarehouseAddress.city_name,
            state_name              :WarehouseAddress.state_name,
            country_name            :WarehouseAddress.country_name,
        });
        
    } 
	var end_date_time = new Date();
  var end_date_time_h = addZero(start_date_time.getHours(), 2);
  var end_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var end_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var end_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var res_time = end_date_time_h+" : "+end_date_time_m+" : "+end_date_time_s+" : "+end_date_time_ms;
    res.status(200).json({
        status_code : 200,
        status: 'success',
        wareHouseAddress_data : WarehouseAddress_array,
		req_time: req_time,
		res_time:res_time,
    });
    return;
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
}

exports.add_edit_poc_contact_details = async function(form_data, req, res, next) 
{
    try{         
var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;	
    var contact_type = htmlspecialchars(form_data.contact_type);
    var contact_type = htmlspecialchars(form_data.contact_name);
    var contact_type = htmlspecialchars(form_data.contact_mobile);
    var contact_type = htmlspecialchars(form_data.contact_email);
    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    var created_datetime = date.format(now, pattern);
    var poc_id = htmlspecialchars(form_data.poc_id);
    var is_edit = htmlspecialchars(form_data.is_edit);
    if(is_edit == 1){
        console.log("2");
        var is_exist = await accountSettingsModel.check_to_delete_poc_contact_details(poc_id);   
        console.log(is_exist);
        if (is_exist.length == 0)
        { 
            res.status(200).json({
                status_code : 200,
                status: 'success',
                message : "POC data does not exist.",
            });
            return;
        }
        else
        {
            var edit_poc_contact = await accountSettingsModel.update_poc_contact_details(form_data);  
var end_date_time = new Date();
  var end_date_time_h = addZero(start_date_time.getHours(), 2);
  var end_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var end_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var end_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var res_time = end_date_time_h+" : "+end_date_time_m+" : "+end_date_time_s+" : "+end_date_time_ms;			
            if (edit_poc_contact == 0)
            { 
                res.status(200).json({
                    status_code : 200,
                    status: 'error',
                    message : "Some Error Occured! Please try again.",
					req_time: req_time,
					res_time: res_time
                });
                return;
            }else{
                res.status(200).json({
                    status_code : 200,
                    status: 'success',
                    message : "POC details updated successfully",
					req_time: req_time,
					res_time: res_time
                });
                return;
            }
        }
    }
    else{
        console.log("3");
        var add_poc_contact = await accountSettingsModel.add_poc_contact_details(form_data); 
        console.log("4");  
        console.log(add_poc_contact);
			
        if (add_poc_contact == 0)
        { 
            res.status(200).json({
                status_code : 200,
                status: 'error',
                message : "Some Error Occured! Please try again.",
				req_time: req_time,
				res_time: end_req_time()
            });
            return;
        }else{
            res.status(200).json({
                status_code : 200,
                status: 'success',
                message : "POC submitted successfully.",
				req_time: req_time,
				res_time: end_req_time()
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
}
function end_req_time(){
	var end_date_time = new Date();
  var end_date_time_h = addZero(start_date_time.getHours(), 2);
  var end_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var end_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var end_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var res_time = end_date_time_h+" : "+end_date_time_m+" : "+end_date_time_s+" : "+end_date_time_ms;
  return res_time;
}
exports.delete_poc_contact_details = async function(form_data, req, res, next) 
{
	var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    try{                  
    var delete_id = htmlspecialchars(form_data.poc_id);
    console.log(delete_id)
    var is_exist = await accountSettingsModel.check_to_delete_poc_contact_details(delete_id);   
    if (is_exist.length == 0)
    { 
        res.status(200).json({
            status_code : 200,
            status: 'error',
            message : "POC data does not exist.",
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    }
    else
    {
        var delete_poc_contact = await accountSettingsModel.delete_poc_contact_details(delete_id);   
    
        if (delete_poc_contact == 0)
        { 
            res.status(200).json({
                status_code : 200,
                status: 'error',
                message : "Some Error Occured! Please try again.",
				req_time: req_time,
				res_time: end_req_time()
            });
            return;
        }else{
            res.status(200).json({
                status_code : 200,
                status: 'success',
                message : "POC Removed successfully.",
				req_time: req_time,
				res_time: end_req_time()
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
}

exports.poc_contact_details = async function(form_data, req, res, next) 
{
    try{   
var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;	
    var user_id = htmlspecialchars(form_data.id);
    
    var poc_contact_details = await accountSettingsModel.poc_contact_details(user_id);   
    var poc_ITL_details = await accountSettingsModel.poc_ITL_details(user_id);   
    var poc_contact_details_array = [];
    if (poc_contact_details.length == 0)
    { 
        res.status(200).json({
            status_code : 200,
            status: 'success',
            message : "No Data",
            poc_contact_details : poc_contact_details,
            poc_ITL_details: poc_ITL_details,
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    }
    else{
        res.status(200).json({
            status_code : 200,
            status: 'success',
            poc_contact_details : poc_contact_details,
            poc_ITL_details : poc_ITL_details,
			req_time: req_time,
				res_time: end_req_time()
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
}

exports.update_rate_us = async function(form_data, req, res, next) 
{
    try{         
var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;	
    var user_id = htmlspecialchars(form_data.id);
    var rate_us_option_1  = htmlspecialchars(form_data.rate_us_option_1);
    var rate_us_option_2  = htmlspecialchars(form_data.rate_us_option_2);
    var rate_us_option_3  = htmlspecialchars(form_data.rate_us_option_3);
    var rate_us_option_4  = htmlspecialchars(form_data.rate_us_option_4);
    var rate_us_option_5  = htmlspecialchars(form_data.rate_us_option_5);
    var rate_us_option_6  = htmlspecialchars(form_data.rate_us_option_6);
    var specify_issue     = htmlspecialchars(form_data.specify_issue);
    var specify_issue2    = htmlspecialchars(form_data.specify_issue2);
    var rate_us_data = await accountSettingsModel.get_rate_us_data(user_id);   
    var rate_us_data_array = [];
    if (rate_us_data.length == 0)
    { 
        var insert_user_extra_query = await accountSettingsModel.insert_user_extra_query(form_data);  

        if(insert_user_extra_query){
            var insert_user_rate_us_history_query = await accountSettingsModel.insert_user_rate_us_history_query(form_data);    
            res.status(200).json({
                status_code : 200,
                status: 'success',
                message: 'Rate Us setting submitted successfully',
				req_time: req_time,
				res_time: end_req_time()
            });
            return;
        }
        else
        {
            res.status(200).json({
                status_code : 200,
                status: 'error',
                message: 'Some Error Occured! Please try again.',
				req_time: req_time,
				res_time: end_req_time()
            });
            return;
        }
    }
    else{
        var update_user_extra_query = await accountSettingsModel.update_user_extra_query(form_data);  

        if(update_user_extra_query){
            var insert_user_rate_us_history_query = await accountSettingsModel.insert_user_rate_us_history_query(form_data);    
            res.status(200).json({
                status_code : 200,
                status: 'success',
                message: 'Rate Us Updated successfully',
				req_time: req_time,
				res_time: end_req_time()
            });
            return;
        }
        else
        {
            res.status(200).json({
                status_code : 200,
                status: 'error',
                message: 'Some Error Occured! Please try again.',
				req_time: req_time,
				res_time: end_req_time()
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
}

exports.add_training_session = async function(form_data, req, res, next) 
{
    try{                  
	var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    var user_id                         = htmlspecialchars(form_data.id);
    var training_date                   = htmlspecialchars(form_data.training_date);
    var training_topic                  = htmlspecialchars(form_data.training_topic);
    var training_session_time           = htmlspecialchars(form_data.training_session_time);
    var get_add_training_session = await accountSettingsModel.get_add_training_session(form_data);
       
   console.log(get_add_training_session)
    if (get_add_training_session.length == 0)
    { 
        var get_training_session_list = await accountSettingsModel.getUserDetailsByID(user_id); 
        console.log(get_training_session_list);
        var vendor_name = get_training_session_list[0]['first_name'];
        var vendor_email = get_training_session_list[0]['email'];
        var company_name = get_training_session_list[0]['company_name'];
        var get_user_training_topics = await accountSettingsModel.get_user_training_topics(training_topic);
        
        var topic_title = get_user_training_topics[0]['topic_title'];
        var time_slot_array = ['10:00 : 10:30 am','10:30 : 11:00 am','11:00 : 11:30 am','11:30 : 12:00 pm','12:00 : 12:30 pm','12:30 : 01:00 pm','01:00 : 01:30 pm','01:30 : 02:00 pm',
        '02:00 : 02:30 pm','02:30 : 03:00 pm','03:00 : 03:30 pm','03:30 : 04:00 pm','04:00 : 04:30 pm','04:30 : 05:00 pm','05:00 : 05:30 pm','05:30 : 06:00 pm','06:00 : 06:30 pm','06:30 : 07:00 pm'];
        var session_time = time_slot_array[training_session_time];
        var booked_slot = training_date +' '+ session_time;
        var add_training_session = await accountSettingsModel.add_training_session(form_data);   
        if(add_training_session == 1)
        {
            var email_array = [];
            email_array['email_type']       = '26';
            email_array['subject']          = 'Your registration for the Training session is successful';
            email_array['user_name']        = vendor_name;
            email_array['email']            = 'cholkeshubham1996@gmail.com';
            email_array['email_sub_type']   = 1;
            email_array["booked_slot"]      = booked_slot;
            email_array['topic_title']      = topic_title;    
            email_array['base_url']         = "base_url";
            email_array['cc_email']         = '';
            email_array['cc_email_list']    = '';
            //send_email(email_array);
            var send_mail = sendMail.send_mail_aws_by_array(email_array);
            //console.log(email_array);
            //Admin Mail
            email_array_admin = [];
            email_array_admin['email_type']       = '26';
            email_array_admin['subject']          = 'New registration for the Training session';
            email_array_admin['user_name']        = 'Milan';
            email_array_admin['email']            = 'kuldeep@depasserinfotech.in ';
            email_array_admin['email_sub_type']   = 2;
            email_array_admin['vendor_name']      = vendor_name;
            email_array_admin['company_name']     = company_name;
            email_array_admin["booked_slot"]      = booked_slot;
            email_array_admin['topic_title']      = topic_title;    
            email_array_admin['base_url']         = "base_url";
            email_array_admin['cc_email']         = '';
            email_array_admin['cc_email_list']    = '';
            //send_email(email_array);
            send_mail = sendMail.send_mail_aws_by_array(email_array_admin);

            res.status(200).json({
                status_code : 200,
                status: 'success',
                message: 'Your registration for the Training session is successful',
				req_time: req_time,
				res_time: end_req_time()
            });
            return;
        }
        else
        {
            res.status(200).json({
                status_code : 200,
                status: 'error',
                message: 'Some Error Occured! Please try again.',
				req_time: req_time,
				res_time: end_req_time()
            });
            return;
        }
    }
    else{
        res.status(200).json({
            status_code : 200,
            status: 'error',
            message: 'Selected time slot already occupied.',
			req_time: req_time,
				res_time: end_req_time()
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
}

exports.view_training_session = async function(form_data, req, res, next) 
{
    try{                  
	var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    var user_id = htmlspecialchars(form_data.id);
    var get_training_session = await accountSettingsModel.view_training_session(form_data);   
    var get_training_session_topics = await accountSettingsModel.get_training_session_topics();   
    var training_topics = [];
    for (const training_session_topics of get_training_session_topics) 
    {
        training_topics.push({
            id                         :training_session_topics.id,
            topic_title                 :training_session_topics.topic_title
        });
    }
    if (get_training_session.length == 0)
    { 
        res.status(200).json({
            status_code : 200,
            status: 'success',
            message: 'No data found',
            training_session_data: [],
            training_topics: training_topics,
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    
    }
    else{
        res.status(200).json({
            status_code : 200,
            status: 'success',
            training_session_data: get_training_session,
            training_topics: training_topics,
			req_time: req_time,
				res_time: end_req_time()
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
}

exports.view_invoice_setting = async function(form_data, req, res, next) 
{
    try{         
	var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    let date4 = new Date();
    let d = date4.getHours()+':'+date4.getMinutes()+':'+date4.getSeconds()+':'+date4.getMilliseconds();
    let time_array = 'invoice_setting_start- '+d;         
    var user_id = htmlspecialchars(form_data.id);
    var get_user_extra_details = await accountSettingsModel.get_user_extra_details(form_data);   
    //console.log(get_user_extra_details);
    var get_invoice_array = [];
    for (const invoice of get_user_extra_details) 
    {
        get_invoice_array.push({
            id                      :invoice.id,
            company_name            :invoice.company_name,
            cin                     :invoice.cin,
            gst_no                  :invoice.gst_no,
            invoice_prefix          :invoice.invoice_prefix,
            invoice_suffix          :invoice.invoice_suffix,
            company_logo            :await upload.get_images_S3('uploads/nodejs_uploads/company_logo/temp_file/',invoice.company_logo),
            company_signature       :await upload.get_images_S3('uploads/nodejs_uploads/company_logo/temp_file/',invoice.company_signature),
           
        });
    }
    if (get_user_extra_details.length == 0)
    { 
        res.status(200).json({
            status_code : 200,
            status: 'success',
            invoice_details: [],
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    }
    else{
        let date2 = new Date();
                let d2 = date2.getHours()+':'+date2.getMinutes()+':'+date2.getSeconds()+':'+date2.getMilliseconds();
                time_array += '_____________invoice_setting_Stop- '+d2;
              console.log(time_array);
        res.status(200).json({
            status_code : 200,
            status: 'success',
            invoice_details: get_invoice_array,
			req_time: req_time,
				res_time: end_req_time()
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
}

exports.update_invoice_setting = async function(form_data, req, res, next) 
{
    try{                  
	var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    var user_id         = htmlspecialchars(form_data.id);
    var company_name    = htmlspecialchars(form_data.company_name);
    var cin             = htmlspecialchars(form_data.cin);
    var gst_no          = htmlspecialchars(form_data.gst_no);
    var invoice_prefix  = htmlspecialchars(form_data.invoice_prefix);
    var invoice_suffix  = htmlspecialchars(form_data.invoice_suffix);
    var invoiceLogo      = htmlspecialchars(form_data.company_logo);
    var invoiceSignature = htmlspecialchars(form_data.company_signature);
    if(cin.length > 21 && cin.length != '')
    {
        res.status(200).json({
            status_code : 200,
            status: 'error',
            message: 'Only 21-character CIN number is allowed.',
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    }

    var invoiceLogoupload="";
    if(invoiceLogo != "")
    {
        await new Promise(async resolve => {
            invoiceLogoupload = await upload.awsUploadImage(invoiceLogo,'uploads/nodejs_uploads/company_logo/');
            resolve(invoiceLogoupload);
        });
    }
    console.log("invoiceLogoupload");
    console.log(invoiceLogoupload);
    if(invoiceLogoupload == 'error')
    {
        res.status(200).json({
            status_code : 200,
            status: 'error',
            message: 'Some Error Occured! Please try again.',
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    }
    var invoiceSignatureupload = "";
    if(invoiceSignature != "")
    {
        await new Promise(async resolve => {
            invoiceSignatureupload = await upload.awsUploadImage(invoiceSignature,'uploads/nodejs_uploads/company_logo/');
            resolve(invoiceSignatureupload);
        });
    }
    console.log("invoiceSignatureupload");
    console.log(invoiceSignatureupload);
    //var invoiceSignatureupload = await upload.image_upload(invoiceSignature);
    if(invoiceSignatureupload == 'error')
    {
        res.status(200).json({
            status_code : 200,
            status: 'error',
            message: 'Some Error Occured! Please try again.',
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    }  
    
    if(invoiceSignatureupload == 'error')
    {
        res.status(200).json({
            status_code : 200,
            status: 'error',
            message: 'Some Error Occured! Please try again.',
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    }  
    
    var get_user_extra_details = await accountSettingsModel.get_user_extra_details(form_data);   
    //console.log(get_user_extra_details);
    if (get_user_extra_details.length == 0)
    { 
        res.status(200).json({
            status_code : 200,
            status: 'error',
            message: 'Some Error Occured! Please try again.',
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    }
    else{
        var update_user_extra = await accountSettingsModel.update_user_invoice_setting(form_data,invoiceLogoupload,invoiceSignatureupload);
        if(update_user_extra == 1){
            res.status(200).json({
                status_code : 200,
                status: 'success',
                message: "invoice settings uploaded successfully",
				req_time: req_time,
				res_time: end_req_time()
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
}

exports.update_label_setting = async function(form_data, req, res, next) 
{
    try{                  
	var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    var user_id                 = htmlspecialchars(form_data.id);
    var label_edit_id           = htmlspecialchars(form_data.label_edit_id);
    var shipping_label_size     = htmlspecialchars(form_data.shipping_label_size);
    var display_cod_prepaid     = htmlspecialchars(form_data.display_cod_prepaid);
    var display_shipper_mobile  = htmlspecialchars(form_data.display_shipper_mobile);
    var display_shipper_address = htmlspecialchars(form_data.display_shipper_address);
    var display_short_address   = htmlspecialchars(form_data.display_short_address);
    
    var get_user_extra_details = await accountSettingsModel.get_update_label_setting_details(user_id);   
    //console.log(get_user_extra_details);
    if (get_user_extra_details.length == 0)
    { 
        var insert_user_extra = await accountSettingsModel.insert_label_setting(form_data);
        if(update_user_extra == 1){
            res.status(200).json({
                status_code : 200,
                status: 'success',
                message: "label setting submitted successfully",
				req_time: req_time,
				res_time: end_req_time()
            });
            return;
        }
    }
    else{
        var update_user_extra = await accountSettingsModel.update_update_label_setting(form_data);
        if(update_user_extra == 1){
            res.status(200).json({
                status_code : 200,
                status: 'success',
                message: "label setting uploaded successfully",
				req_time: req_time,
				res_time: end_req_time()
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
}

exports.view_label_setting = async function(form_data, req, res, next) 
{
    try{                  
	var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    var user_id                 = htmlspecialchars(form_data.id);
    
    var get_user_extra_details = await accountSettingsModel.get_update_label_setting_details(user_id);   
    //console.log(get_user_extra_details);
    if (get_user_extra_details.length == 0)
    { 
        res.status(200).json({
            status_code : 200,
            status: 'success',
            message: 'No data found',
            label_setting_data: [],
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    
    }
    else{
        res.status(200).json({
            status_code : 200,
            status: 'success',
            label_setting_data: get_user_extra_details,
			req_time: req_time,
				res_time: end_req_time()
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
}


exports.view_billing_address = async function(form_data, req, res, next) 
{
    try{                  
	var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    var user_id = htmlspecialchars(form_data.id);
    var get_billing_address = await accountSettingsModel.view_billing_address(form_data);   
   
    if (get_billing_address.length == 0)
    { 
        res.status(200).json({
            status_code : 200,
            status: 'success',
            message: 'No data found',
            billing_address_data: [],
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    
    }
    else{
        res.status(200).json({
            status_code : 200,
            status: 'success',
            billing_address_data: get_billing_address,
			req_time: req_time,
				res_time: end_req_time()
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
}
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
exports.view_account_settings = async function(form_data, req, res, next) 
{
    try{               
	var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    var user_id = htmlspecialchars(form_data.id);
    var get_account_details = await accountSettingsModel.view_account_settings(form_data);   
    var get_account_array = [];
    var type = form_data.type;
    for (const WarehouseAddress of get_account_details) 
    {
        get_account_array.push({
            id                      :WarehouseAddress.id,
            first_name                 :WarehouseAddress.first_name,
            last_name            :decode(WarehouseAddress.last_name),
            user_name               :WarehouseAddress.user_name,
            company_name                  :decode(WarehouseAddress.company_name),
            mobile          :decode(WarehouseAddress.mobile),
            vendor_code                   :WarehouseAddress.vendor_code,
            vendor_website                 : WarehouseAddress.vendor_website,
            email                :WarehouseAddress.email,
            mobile_verify                :WarehouseAddress.mobile_verify,
            alt_mobile                 :WarehouseAddress.alt_mobile,
            
            pdf_logo_img                 : type == 0 ? WarehouseAddress.pdf_logo_img == '' ? '': await upload.get_images_S3('uploads/nodejs_uploads/company_logo/temp_file/',WarehouseAddress.pdf_logo_img) : '',
            profile_type                :capitalizeFirstLetter(WarehouseAddress.profile_type),
            company_type              :capitalizeFirstLetter(WarehouseAddress.company_type),
            gstin_no                  :WarehouseAddress.gstin_no,
            document_1_type              :capitalizeFirstLetter(WarehouseAddress.document_1_type),
            document_1_number               :WarehouseAddress.document_1_number,
            document_1_name_on              :WarehouseAddress.document_1_name_on,
            document_1_front            : type == 1 ? WarehouseAddress.document_1_front == '' ? '': await get_base64_aws_image('customer_documents/pan_card/size_small',WarehouseAddress.document_1_front) : '',
            document_1_back            : type == 1 ? WarehouseAddress.document_1_back == '' ? '': await get_base64_aws_image('customer_documents/pan_card/size_small',WarehouseAddress.document_1_back) : '',


            document_1_front1            : type == 1 ? WarehouseAddress.document_1_front == '' ? '': 'https://itl-uploads.s3.ap-south-1.amazonaws.com/uploads/onboard_documents/pan_card/size_large/'+WarehouseAddress.document_1_front : '',
            document_1_disapproved_remark              :WarehouseAddress.document_1_disapproved_remark,
            document_1_is_approved               :WarehouseAddress.document_1_is_approved,
            document_2_type              :capitalizeFirstLetter(WarehouseAddress.document_2_type),
            document_2_number            :WarehouseAddress.document_2_number,
            document_2_name_on              :WarehouseAddress.document_2_name_on,
            document_2_front               : type == 2 ? WarehouseAddress.document_2_front == '' ? '': await get_base64_aws_image('customer_documents/id_proof/size_small',WarehouseAddress.document_2_front) : '',
            document_2_back              : type == 2 ? WarehouseAddress.document_2_back == ''? '': await get_base64_aws_image('customer_documents/id_proof/size_small',WarehouseAddress.document_2_back) : '',
            document_2_is_approved            :WarehouseAddress.document_2_is_approved,
            document_2_disapproved_remark              :WarehouseAddress.document_2_disapproved_remark,
            cancelled_cheque               : type == 3 ? WarehouseAddress.cancelled_cheque == '' ? '' : await get_base64_aws_image('customer_documents/cancelled_cheque/size_large',WarehouseAddress.cancelled_cheque) : '',
            cancelled_cheque_disapproved_remark              :WarehouseAddress.cancelled_cheque_disapproved_remark,
            cancelled_cheque_is_approved            :WarehouseAddress.cancelled_cheque_is_approved,
            parent_user_id              :WarehouseAddress.parent_user_id,
            responsible_user_id               :WarehouseAddress.responsible_user_id,
            status              :WarehouseAddress.status,
            kyc_disapprove_count            :WarehouseAddress.kyc_disapprove_count,
            user_bank_details_id              :WarehouseAddress.user_bank_details_id,
            api_access_token               :WarehouseAddress.api_access_token,
            api_secret_key              :WarehouseAddress.api_secret_key,
        });
    }
    if (get_account_details.length == 0)
    { 
        res.status(200).json({
            status_code : 200,
            status: 'success',
            message: 'No data found',
            account_details: [],
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    
    }
    else{
        res.status(200).json({
            status_code : 200,
            status: 'success',
            account_details: get_account_array,
			req_time: req_time,
				res_time: end_req_time()
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
}
function get_base64_aws_image(path,file_name)
{
    try{
    return new Promise((resolve, reject) => {
    var Request = require("request");
            var form_data = {
                "access_token": "a022dc0e94289b6eb2e9c1880b3ca940",
                "secret_key": "a47283c3ea822661c82f95869973fb20",
                "data" : 
                {
                    "0": 
                    {
                    "folder_path": path,
                    "file_name": file_name
                    }
                }
            } 
            Request.post({
                "headers": { "content-type": "application/json" },
                "url": "https://alpha2.ithinklogistics.com/itl_app/kyc_doc/get.json",
                "body": JSON.stringify(form_data)
            }, async(error, response, body) => {
                if(error) {
                    res.status(200).json({
                        status_code : 200,
                        status: 'error',
                        message: 'Something went wrong!!! please try again.'
                        
                    });
                    resolve("No image found");
                    return "No image found";
                    
                }else{
                    body = JSON.parse(body);
                    
                    if(body.status == 'success')
                    {
                        console.log(body.data[0].base_file_name);
                        resolve(body.data[0].base_file_name)
                        return body.data[0].base_file_name;
                    }
                }
            })
        })
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
}
function upload_base64_aws_image(path,base64)
{
    try{
    return new Promise((resolve, reject) => {
    var Request = require("request");
            var form_data = {
                "access_token": "a022dc0e94289b6eb2e9c1880b3ca940",
                "secret_key": "a47283c3ea822661c82f95869973fb20",
                "data" : 
                {
                    "0": 
                    {
                    "folder_path": path,
                    "base_file_name": base64
                    }
                }
            } 
            Request.post({
                "headers": { "content-type": "application/json" },
                "url": "https://alpha2.ithinklogistics.com/itl_app/kyc_doc/upload.json",
                "body": JSON.stringify(form_data)
            }, async(error, response, body) => {
                if(error) {
                    res.status(200).json({
                        status_code : 200,
                        status: 'error',
                        message: 'Something went wrong!!! please try again.'
                        
                    });
                    console.log(error);
                    resolve("");
                    return "";
                    
                }else{
                    body = JSON.parse(body);
                    console.log(body);
                    if(body.status == 'success')
                    {
                        resolve(body.data[0].file_name)
                        return body.data[0].file_name;
                    }
                }
            })
        })
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
}
exports.add_billing_address = async function(form_data, req, res, next) 
{
    try{                  
	var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    var user_id = htmlspecialchars(form_data.id);
    var get_billing_address = await accountSettingsModel.get_user_billing_address_details(form_data);   
    var get_user_billing_address_array = [];
    for (const billing_address of get_billing_address) 
    {    // set any value to Map
        get_user_billing_address_array = billing_address;
    }
    console.log(get_user_billing_address_array)
    var billing_company_name            = htmlspecialchars(form_data.billing_company_name);
    var gstn_no                         = form_data.gstn_no;
    var address_line1                   = htmlspecialchars(form_data.address_line1);
    var address_line2                   = htmlspecialchars(form_data.address_line2);
    var state_id                        = form_data.state_id;
    var pincode                         = form_data.pincode;
    var contact_no                      = form_data.contact_no;
    var city_id                         = form_data.city_id;
    console.log("nothing to update")
    var get_billing_address_array=[];
    for (const billing_address of get_billing_address) 
    {    // set any value to Map
        get_billing_address_array.push({
            id  :billing_address.id,
            user_id: billing_address.user_id,
            billing_company_name: billing_address.billing_company_name,
            gstn_no: billing_address.gstn_no,
            address_line1: billing_address.address_line1,
            address_line2: billing_address.address_line2,
            state_id: billing_address.state_id,
            city_id: billing_address.city_id,
            pincode: billing_address.pincode,
            contact_no: billing_address.contact_no
        });
    }
    console.log(get_billing_address_array.length);
    if(get_billing_address_array.length != 0)
    {console.log(get_billing_address_array[0].billing_company_name);
        console.log(address_line2.toString() != get_billing_address_array[0].address_line2);
        console.log(get_billing_address_array[0].address_line2)
        if(billing_company_name.match(get_billing_address_array[0].billing_company_name) && gstn_no.match(get_billing_address_array[0].gstn_no) && address_line1.match(get_billing_address_array[0].address_line1) && address_line2.toString() == get_billing_address_array[0].address_line2 && state_id.match(get_billing_address_array[0].state_id) && city_id.match(get_billing_address_array[0].city_id) && pincode.match(get_billing_address_array[0].pincode) && contact_no.match(get_billing_address_array[0].contact_no))
        {
            res.status(200).json({
                status_code : 200,
                status: 'success',
                message: 'Nothing to update.',
				req_time: req_time,
				res_time: end_req_time()
            });
            return;
        }
    }
    console.log("nothing to update")
    var insert_user_billing_address_details = await accountSettingsModel.insert_user_billing_address_details(form_data);   
    
    console.log(insert_user_billing_address_details);
    if(insert_user_billing_address_details == 'error'){
        res.status(200).json({
            status_code : 200,
            status: 'error',
            message: 'Some Error Occured! Please try again.',
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    }
    else{
        var update_user_billing_address_details_query = await accountSettingsModel.update_user_billing_address_details_query(form_data,insert_user_billing_address_details);
        if(update_user_billing_address_details_query == 0){
            res.status(200).json({
                status_code : 200,
                status: 'error',
                message: 'Some Error Occured! Please try again.',
				req_time: req_time,
				res_time: end_req_time()
            });
            return;
        }
        else{
            var update_user_billing_address_id = await accountSettingsModel.update_user_billing_address_id(form_data,insert_user_billing_address_details);
            if(update_user_billing_address_id == 0){
                res.status(200).json({
                    status_code : 200,
                    status: 'error',
                    message: 'Some Error Occured! Please try again.',
					req_time: req_time,
				res_time: end_req_time()
                });
                return;
            }
            else
            {
                res.status(200).json({
                    status_code : 200,
                    status: 'success',
                    message: 'Billing Address submitted successfully',
					req_time: req_time,
				res_time: end_req_time()
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
}
exports.view_contract_acceptance = async function(form_data, req, res, next) 
{                  
 try{
	 var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    var user_id = htmlspecialchars(form_data.id);
    var get_view_contract_acceptance = await accountSettingsModel.view_contract_acceptance(form_data);   
    var view_contract_acceptance_array=[];
    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    for (const view_contract_acceptance of get_view_contract_acceptance) 
    {    // set any value to Map
        view_contract_acceptance_array.push({
            id                      :view_contract_acceptance.id,
            user_id                 :view_contract_acceptance.user_id,
            contract_title          :decode(view_contract_acceptance.contract_title),
            contract_version        :view_contract_acceptance.contract_version,
            contract_ammendment_date:date.format(new Date(view_contract_acceptance.contract_ammendment_date), pattern),
            contract_publish_date   :date.format(new Date(view_contract_acceptance.contract_publish_date), pattern),
            change_description      :decode(view_contract_acceptance.change_description),
            contract_type           :view_contract_acceptance.contract_type,
            contract_file_name      :await upload.get_pdf_S3('uploads/nodejs_uploads/company_logo/temp_file/',view_contract_acceptance.contract_file_name),
            is_user_upload_contract :view_contract_acceptance.is_user_upload_contract,
            created_date_time       :date.format(new Date(view_contract_acceptance.created_date_time), pattern),
            updated_date_time       :date.format(new Date(view_contract_acceptance.updated_date_time), pattern),
            user_name               :view_contract_acceptance.user_name,
            status                  :view_contract_acceptance.status,
            is_deleted              :view_contract_acceptance.is_deleted,
        });
        
    } 
    if (view_contract_acceptance_array.length == 0)
    { 
        res.status(200).json({
            status_code : 200,
            status: 'success',
            message: 'No data found',
            contract_acceptance_array: [],
            user_contract_history_array: [],
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    
    }
    else{
        var get_user_contract_history_query = await accountSettingsModel.get_user_contract_history_query(form_data);   
        var user_contract_history_array=[];
        var user_contract_history_array_new={};
        for (const user_contract_history of get_user_contract_history_query) 
        {    // set any value to Map
            var user_contract_id = user_contract_history.user_contract_id;
            user_contract_history_array = [];
            user_contract_history_array.push({
                user_contract_id        :user_contract_history.user_contract_id,
                user_id                 :user_contract_history.user_id,
                user_ip                 :user_contract_history.user_ip,
                user_contract_file_name :await upload.get_pdf_S3('uploads/nodejs_uploads/company_logo/temp_file/',user_contract_history.user_contract_file_name),
                status                  :user_contract_history.status,
            });
            user_contract_history_array_new[user_contract_id]=user_contract_history_array;

            
        } 
        
        res.status(200).json({
            status_code : 200,
            status: 'success',
            contract_acceptance_array: view_contract_acceptance_array,
            user_contract_history_array: user_contract_history_array_new,
			req_time: req_time,
				res_time: end_req_time()
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
}
exports.Accept_contract_acceptance = async function(form_data, req, res, next) 
{
    try{               
	var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    var user_id = htmlspecialchars(form_data.id);
    var file_name                  = '';
    if(form_data.pdf_file != '')
    {
        file_name                  = await upload.awsUploadPDF(form_data.pdf_file,'uploads/nodejs_uploads/company_logo/');
    
    }
    
    var get_contract_acceptance = await accountSettingsModel.Accept_contract_acceptance(form_data,file_name);   
    var update_contract_accept = await accountSettingsModel.Accept_contract_acceptance_update(form_data,file_name);
    if(get_contract_acceptance == 0){
        res.status(200).json({
            status_code : 200,
            status: 'error',
            message: 'Some Error Occured! Please try again.',
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    }
    else
    {
        res.status(200).json({
            status_code : 200,
            status: 'success',
            message: 'Contract Accept Successfully',
			req_time: req_time,
				res_time: end_req_time()
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

}
exports.view_rate_chart = async function(form_data, req, res, next) 
{
    try{                  
	var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    var user_id = htmlspecialchars(form_data.id);
    var get_view_contract_acceptance = await accountSettingsModel.view_rate_chart(form_data);   
    var get_logistics_details = await accountSettingsModel.get_logistics_details(form_data); 
    if (get_view_contract_acceptance.length == 0)
    { 
        res.status(200).json({
            status_code : 200,
            status: 'error',
            message: 'Some Error Occured! Please try again.',
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    
    } 
        
    var zone_details_array = [];
    var object = {}; 
    var i = 0;
    var is_data = 0;
    for (const logistics_details of get_logistics_details) 
    {     
        i++;
        is_data = 0;
        object = {};
        if(i < 8 && i != 2 && i != 5) 
        {
            object["logistics_name"] = logistics_details.logistics_name; 
            object["logistics_id"] = logistics_details.id;
            object["horizontal_header"] = [['ZONE'],['ZONE A'],['ZONE B'],['ZONE C'],['ZONE D'],['ZONE E'],['ZONE F']];
        }
        else if(i == 8)
        {
            object["logistics_name"] = logistics_details.logistics_name; 
            object["logistics_id"] = logistics_details.id;
            object["horizontal_header"] = [[''],['Flat Rate']];
        }
        else if(i == 2)
        {
            object["logistics_name"] = logistics_details.logistics_name; 
            object["logistics_id"] = logistics_details.id;
           // object["horizontal_header"] = ['','0.50 KG Slab','2.00 KG Slab'];
        }
        else if(i == 5)
        {
            object["logistics_name"] = logistics_details.logistics_name; 
            object["logistics_id"] = logistics_details.id;
            object["horizontal_header"] = [['ZONE'],['A'],['B'],['B (UP)'],['B (ROS)'],['B (UP + ROS)'],['C'],['D'],['D (UP)'],['D (ROS)'],['D (UP + ROS)'],['E'],['E (UP)'],['E (ROS)'],['E (UP + ROS)'],['F (UP)'],['F (UP + ROS)']];
        }
        else{
            object["logistics_name"] = logistics_details.logistics_name; 
            object["logistics_id"] = logistics_details.id;
            object["horizontal_header"] = [];
        }
        
        var rate_chart_object = [];
        var j = 0;
        var k = 0;
        var FWD_array = [];
        var FWD_Additional_array = [];
        var FWD_FSC_array = [];
        var COD_array = [];
        var COD_per_array = [];
        var RTO_array = [];
        var RTO_add_array = [];
        var RTO_FSC_array = [];
        var logistic_id_2_header = [];
        for (const rate_chart of get_view_contract_acceptance) 
        {    
            if(rate_chart.logistic_id == i && rate_chart.logistic_id < 8 && rate_chart.logistic_id != 2  && rate_chart.logistic_id != 5)
            {
                is_data = 1;
                rate_chart_object.push([["FWD ("+rate_chart['slab_weight_in_kg']+" KG)",rate_chart['zone_a_fwd'],rate_chart['zone_b_fwd'],rate_chart['zone_c_fwd'],rate_chart['zone_d_fwd'],rate_chart['zone_e_fwd'],rate_chart['zone_f_fwd']],
                ["FWD Additional ("+rate_chart['multiply_factor']+" KG)",rate_chart['zone_a_fwd_additional'],rate_chart['zone_b_fwd_additional'],rate_chart['zone_c_fwd_additional'],rate_chart['zone_d_fwd_additional'],rate_chart['zone_e_fwd_additional'],rate_chart['zone_f_fwd_additional']],
                ["COD",rate_chart['zone_a_cod'],rate_chart['zone_b_cod'],rate_chart['zone_c_cod'],rate_chart['zone_d_cod'],rate_chart['zone_e_cod'],rate_chart['zone_f_cod']],
                ["COD %",rate_chart['zone_a_cod_per'],rate_chart['zone_b_cod_per'],rate_chart['zone_c_cod_per'],rate_chart['zone_d_cod_per'],rate_chart['zone_e_cod_per'],rate_chart['zone_f_cod_per']],
                ["RTO ("+rate_chart['slab_weight_in_kg']+" KG)",rate_chart['zone_a_rto'],rate_chart['zone_b_rto'],rate_chart['zone_c_rto'],rate_chart['zone_d_rto'],rate_chart['zone_e_rto'],rate_chart['zone_f_rto']],
                ["RTO Additional ("+rate_chart['multiply_factor']+" KG)",rate_chart['zone_a_rto_additional'],rate_chart['zone_b_rto_additional'],rate_chart['zone_c_rto_additional'],rate_chart['zone_d_rto_additional'],rate_chart['zone_e_rto_additional'],rate_chart['zone_f_rto_additional']]]);                
            }   
            else if(rate_chart.logistic_id == i && rate_chart.logistic_id == 8)
            {
                is_data = 1;
                rate_chart_object.push([['FWD',rate_chart['flat_rate_value']],
                    ['FWD Additional',rate_chart['flat_rate_add_value']
                ]]);                
            }else if(rate_chart.logistic_id == i && rate_chart.logistic_id == 2)
            {
                is_data = 1;
                
                rate_chart_object = [];
                if(k == 0){
                    logistic_id_2_header.push([""]);
                     FWD_array = ['FWD'];
                     FWD_Additional_array = ['FWD Additional'];
                     FWD_FSC_array = ['FWD FSC (%)'];
                     COD_array = ['COD'];
                     COD_per_array = ['COD %'];
                     RTO_array = ['RTO'];
                     RTO_add_array = ['RTO Additional'];
                     RTO_FSC_array = ['RTO FSC (%)'];
                    k++;
                }
                logistic_id_2_header.push([rate_chart["slab_weight_in_kg"]+" KG Slab"])
                    FWD_array.push(rate_chart['logistics_fwd']),
                    FWD_Additional_array.push(rate_chart['logistics_fwd_additional']),
                    FWD_FSC_array.push(rate_chart['logistics_fsc_per']),
                    COD_array.push(rate_chart['logistics_cod']),
                    COD_per_array.push(rate_chart['logistics_cod_per']),
                    RTO_array.push(rate_chart['logistics_rto']),
                    RTO_add_array.push(rate_chart['logistics_rto_additional']),
                    RTO_FSC_array.push(rate_chart['logistics_rto_fsc_per']),
                 
                rate_chart_object.push([FWD_array, FWD_Additional_array,FWD_FSC_array,COD_array,COD_per_array,RTO_array,RTO_add_array,RTO_FSC_array]);
                object["horizontal_header"] = logistic_id_2_header;     
            }else if(rate_chart.logistic_id == i && rate_chart.logistic_id == 5)
            {
                is_data = 1;
                rate_chart_object.push([['FWD ('+rate_chart["slab_weight_in_kg"]+" KG)",rate_chart['zone_a_fwd'],rate_chart['zone_b_fwd'],rate_chart['zone_b_fwd_up'],rate_chart['zone_b_fwd_ros'],rate_chart['zone_b_fwd_up_ros'],rate_chart['zone_c_fwd'],rate_chart['zone_d_fwd'],rate_chart['zone_d_fwd_up'],rate_chart['zone_d_fwd_ros'],rate_chart['zone_d_fwd_up_ros'],rate_chart['zone_e_fwd'],rate_chart['zone_e_fwd_up'],rate_chart['zone_e_fwd_ros'],rate_chart['zone_e_fwd_up_ros'],rate_chart['zone_f_fwd_up'],rate_chart['zone_f_fwd_up_ros']],
                    ['FWD Additional ('+rate_chart['multiply_factor']+' KG)',rate_chart['zone_a_fwd_additional'],rate_chart['zone_b_fwd_additional'],rate_chart['zone_b_fwd_additional_up'],rate_chart['zone_b_fwd_additional_ros'],rate_chart['zone_b_fwd_additional_up_ros'],rate_chart['zone_c_fwd_additional'],rate_chart['zone_d_fwd_additional'],rate_chart['zone_d_fwd_additional_up'],rate_chart['zone_d_fwd_additional_ros'],rate_chart['zone_d_fwd_additional_up_ros'],rate_chart['zone_e_fwd_additional'],rate_chart['zone_e_fwd_additional_up'],rate_chart['zone_e_fwd_additional_ros'],rate_chart['zone_e_fwd_additional_up_ros'],rate_chart['zone_f_fwd_additional_up'],rate_chart['zone_f_fwd_additional_up_ros']],
                    ['FWD FSC (%)',rate_chart['zone_a_fsc_per'],rate_chart['zone_b_fsc_per'],rate_chart['zone_b_fsc_per_up'],rate_chart['zone_b_fsc_per_ros'],rate_chart['zone_b_fsc_per_up_ros'],rate_chart['zone_c_fsc_per'],rate_chart['zone_d_fsc_per'],rate_chart['zone_d_fsc_per_up'],rate_chart['zone_d_fsc_per_ros'],rate_chart['zone_d_fsc_per_up_ros'],rate_chart['zone_e_fsc_per'],rate_chart['zone_e_fsc_per_up'],rate_chart['zone_e_fsc_per_ros'],rate_chart['zone_e_fsc_per_up_ros'],rate_chart['zone_f_fsc_per_up'],rate_chart['zone_f_fsc_per_up_ros']],
                    ['COD',rate_chart['zone_a_cod'],rate_chart['zone_b_cod'],rate_chart['zone_b_cod_up'],rate_chart['zone_b_cod_ros'],rate_chart['zone_b_cod_up_ros'],rate_chart['zone_c_cod'],rate_chart['zone_d_cod'],rate_chart['zone_d_cod_up'],rate_chart['zone_d_cod_ros'],rate_chart['zone_d_cod_up_ros'],rate_chart['zone_e_cod'],rate_chart['zone_e_cod_up'],rate_chart['zone_e_cod_ros'],rate_chart['zone_e_cod_up_ros'],rate_chart['zone_f_cod_up'],rate_chart['zone_f_cod_up_ros']],
                    ['COD %',rate_chart['zone_a_cod_per'],rate_chart['zone_b_cod_per'],rate_chart['zone_b_cod_per_up'],rate_chart['zone_b_cod_per_ros'],rate_chart['zone_b_cod_per_up_ros'],rate_chart['zone_c_cod_per'],rate_chart['zone_d_cod_per'],rate_chart['zone_d_cod_per_up'],rate_chart['zone_d_cod_per_ros'],rate_chart['zone_d_cod_per_up_ros'],rate_chart['zone_e_cod_per'],rate_chart['zone_e_cod_per_up'],rate_chart['zone_e_cod_per_ros'],rate_chart['zone_e_cod_per_up_ros'],rate_chart['zone_f_cod_per_up'],rate_chart['zone_f_cod_per_up_ros']],
                    ['RTO ('+rate_chart['slab_weight_in_kg']+' KG)',rate_chart['zone_a_rto'],rate_chart['zone_b_rto'],rate_chart['zone_b_rto_up'],rate_chart['zone_b_rto_ros'],rate_chart['zone_b_rto_up_ros'],rate_chart['zone_c_rto'],rate_chart['zone_d_rto'],rate_chart['zone_d_rto_up'],rate_chart['zone_d_rto_ros'],rate_chart['zone_d_rto_up_ros'],rate_chart['zone_e_rto'],rate_chart['zone_e_rto_up'],rate_chart['zone_e_rto_ros'],rate_chart['zone_e_rto_up_ros'],rate_chart['zone_f_rto_up'],rate_chart['zone_f_rto_up_ros']],
                    ['RTO Additional ('+rate_chart['multiply_factor']+' KG)',rate_chart['zone_a_rto_additional'],rate_chart['zone_b_rto_additional'],rate_chart['zone_b_rto_additional_up'],rate_chart['zone_b_rto_additional_ros'],rate_chart['zone_b_rto_additional_up_ros'],rate_chart['zone_c_rto_additional'],rate_chart['zone_d_rto_additional'],rate_chart['zone_d_rto_additional_up'],rate_chart['zone_d_rto_additional_ros'],rate_chart['zone_d_rto_additional_up_ros'],rate_chart['zone_e_rto_additional'],rate_chart['zone_e_rto_additional_up'],rate_chart['zone_e_rto_additional_ros'],rate_chart['zone_e_rto_additional_up_ros'],rate_chart['zone_f_rto_additional_up'],rate_chart['zone_f_rto_additional_up_ros']],
                    ['RTO FSC (%)',rate_chart['zone_a_rto_fsc_per'],rate_chart['zone_b_rto_fsc_per'],rate_chart['zone_b_rto_fsc_per_up'],rate_chart['zone_b_rto_fsc_per_ros'],rate_chart['zone_b_rto_fsc_per_up_ros'],rate_chart['zone_c_rto_fsc_per'],rate_chart['zone_d_rto_fsc_per'],rate_chart['zone_d_rto_fsc_per_up'],rate_chart['zone_d_rto_fsc_per_ros'],rate_chart['zone_d_rto_fsc_per_up_ros'],rate_chart['zone_e_rto_fsc_per'],rate_chart['zone_e_rto_fsc_per_up'],rate_chart['zone_e_rto_fsc_per_ros'],rate_chart['zone_e_rto_fsc_per_up_ros'],rate_chart['zone_f_rto_fsc_per_up'],rate_chart['zone_f_rto_fsc_per_up_ros'],
                ]]);         
            }   


            if(is_data == 0)
            {
                if(j == 0){
                    object["zone_rate_chart_data_array"] = [];
                    object["flat_rate_chart_data_array"] = [];
                    object["no_data"] = 1;
                }
                
            }
            else
            {
                if(rate_chart["rate_slab_type"] == 0)
                {
                    
                    object["no_data"] = 0;
                    object["zone_rate_chart_data_array"] = rate_chart_object;
                }
                else
                {
                    object["no_data"] = 0;
                    object["flat_rate_chart_data_array"] = rate_chart_object;
                }
                
            }  
            j++;
        }
        
        //zone_details_array[0].zone_rate_chart_data_array[0][0]
        zone_details_array.push(object);
    }
    res.status(200).json({
        status_code : 200,
        status: 'success',
        rate_chart_array: zone_details_array,
		req_time: req_time,
				res_time: end_req_time()
    });
    return;
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
}

exports.view_bank_details = async function(form_data, req, res, next) 
{
    try{                  
	var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    var user_id = htmlspecialchars(form_data.id);
    var get_bank_details = await accountSettingsModel.view_bank_details(form_data);   
    var view_contract_acceptance_array=[];
    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    for (const bank_details of get_bank_details) 
    {    // set any value to Map
        view_contract_acceptance_array.push({
            id                      :bank_details.id,
            benf_account_no: bank_details.benf_account_no,
            account_type: bank_details.account_type == 1 ? 'Current' : bank_details.account_type == 2 ? 'Saving' : '',
            ifsc_code: bank_details.ifsc_code,
            benf_name: bank_details.benf_name,
            cancelled_cheque: bank_details.cancelled_cheque== '' ? '' : await get_base64_aws_image('customer_documents/cancelled_cheque/size_large',bank_details.cancelled_cheque),
            is_verified: bank_details.is_verified,
            is_default: bank_details.is_default,
            created_date_time: date.format(new Date(bank_details.created_date_time), pattern),
        });
        
    } 
    if (get_bank_details.length == 0)
    { 
        res.status(200).json({
            status_code : 200,
            status: 'success',
            message: 'No data found',
            bank_details_data: [],
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    
    }
    else{
        res.status(200).json({
            status_code : 200,
            status: 'success',
            bank_details_data: view_contract_acceptance_array,
			req_time: req_time,
				res_time: end_req_time()
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
}

exports.view_api_key_details = async function(form_data, req, res, next) 
{                  
    try{
		var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    var user_id = htmlspecialchars(form_data.id);
    var get_api_key_details = await accountSettingsModel.view_api_key_details(form_data);   
    var get_live_api_key_details = [];
    
    get_live_api_key_details.push({
        store_url: 'https://manage.ithinklogistics.com/api_v2',
        access_token: 'f81a5ef8970307b363d09f6660c9cf02',
        secret_key: '12e965e208ca9755e6c71a7417123419'

    });
    if (get_api_key_details.length == 0)
    { 
        res.status(200).json({
            status_code : 200,
            status: 'success',
            message: 'No data found',
            api_key_details_data: [],
            live_api_key_details_data: [],
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    
    }
    else{
        res.status(200).json({
            status_code : 200,
            status: 'success',
            api_key_details_data: get_api_key_details,
            live_api_key_details_data: get_live_api_key_details,
			req_time: req_time,
				res_time: end_req_time()
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
}

exports.update_account_details = async function(form_data, req, res, next) 
{
    try{                  
	var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    var user_id                 = htmlspecialchars(form_data.id);
    var company_name          = htmlspecialchars(form_data.company_name);
    var user_name               = htmlspecialchars(form_data.user_name);
    var vendor_website          = htmlspecialchars(form_data.vendor_website);
    var vendor_email            = htmlspecialchars(form_data.vendor_email);
    var contact_number          = htmlspecialchars(form_data.contact_number);
    var mobile_verify           = htmlspecialchars(form_data.mobile_verify);
    var alt_mobile              = htmlspecialchars(form_data.alt_mobile);
    var file_name1              = form_data.pdf_logo_img;
    console.log(file_name1);
    var pdf_logo_img="";
    if(file_name1 != "")
    {
        await new Promise(async resolve => {
            pdf_logo_img = await upload.awsUploadImage(file_name1,'uploads/nodejs_uploads/company_logo/');
            resolve(pdf_logo_img);
        });
    }
        console.log("pdf_logo_img");
       console.log(pdf_logo_img);
    if(vendor_email == "")
    {
        res.status(200).json({
            status_code : 200,
            status: 'error',
            message: 'Email id does not blank',
			req_time: req_time,
				res_time: end_req_time()
        });
        return;
    }
    
        var get_user_details = await accountSettingsModel.view_account_settings(form_data);   
        //console.log(get_user_extra_details);
        if (mobile_verify == 1)
        { 
            var view_all_User = await accountSettingsModel.get_all_user(vendor_email,user_id);
            
            if(view_all_User.length != 0)
            {
                res.status(200).json({
                    status_code : 200,
                    status: 'success',
                    message: 'Email Already Exist. Try Another!.',
					req_time: req_time,
				res_time: end_req_time()
                });
                return;
            }
            var view_all_onboard_user = await accountSettingsModel.get_all_onboard_user(vendor_email,user_id);
            if(view_all_onboard_user.length != 0)
            {
                res.status(200).json({
                    status_code : 200,
                    status: 'success',
                    message: 'Email Already Exist. Try Another!.',
					req_time: req_time,
				res_time: end_req_time()
                });
                return;
            }
                var is_mobile_verified = 0;
            
                if(contact_number != get_user_details[0]['mobile'])
                {
                    is_mobile_verified = 1;
                    
                }
            
            const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
            const now = new Date();
            var created_datetime = date.format(now, pattern);
            var status                 = get_user_details[0]['status'];
            var parent_user_id         = get_user_details[0]['parent_user_id'];
            var responsible_user_id    = get_user_details[0]['responsible_user_id'];
            var append                 = ", mobile_verify = '0', status = '"+status+"' , parent_user_id = '"+user_id+"' , responsible_user_id = '"+user_id+"'";           
            
            var update_user_query = "UPDATE user SET company_name = ?, vendor_website = ?, email = ?, mobile = ?, alt_mobile = ? ,pdf_logo_img = ?,modified_on = ? "+append+" WHERE id = ?";
            var update_user_query_key = [company_name,vendor_website, vendor_email,contact_number,alt_mobile,pdf_logo_img,created_datetime, user_id]
            var update_user_billing_address_details_query = await accountSettingsModel.update_user_address(update_user_query,update_user_query_key);
            if(update_user_billing_address_details_query == 1){
                res.status(200).json({
                    status_code : 200,
                    status: 'success',
                    message: "account details updated successfully",
					req_time: req_time,
				res_time: end_req_time()
                });
                return;
            }
        }
        else{
            res.status(200).json({
                status_code : 200,
                status: 'show_modal_box',
                message: 'Please Verify your contact number',
				req_time: req_time,
				res_time: end_req_time()
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
}
exports.update_kyc_details = async function(form_data, req, res, next) 
{
    try{                 
	var start_date_time = new Date();
  var start_date_time_h = addZero(start_date_time.getHours(), 2);
  var start_date_time_m = addZero(start_date_time.getMinutes(), 2);
  var start_date_time_s = addZero(start_date_time.getSeconds(), 2);
  var start_date_time_ms = addZero(start_date_time.getMilliseconds(), 3);
  var req_time = start_date_time_h+" : "+start_date_time_m+" : "+start_date_time_s+" : "+start_date_time_ms;
    console.log("done"); 
    var user_id                 = htmlspecialchars(form_data.id);
    
    var uploadimage="";
        var profile_type = form_data.profile_type;
        var company_type= form_data.company_type;
        var gst_no= form_data.gst_no;
        var company=form_data.company;
        var contact_person= form_data.contact_person;
        var type           = form_data.type;
        var document_1_front           = form_data.document_1_front;
        var document_1_back           = form_data.document_1_back;
        var document_2_front           = form_data.document_2_front;
        var document_2_back           = form_data.document_2_back;
        var cancelled_cheque           = form_data.cancelled_cheque;
        var document_1_number          = form_data.document_1_number;
        var document_1_name_on         = form_data.document_1_name;
        var document_1_is_approved     = 0;
        var document_2_number          = form_data.document_2_number;
        var document_2_name_on         = form_data.document_2_name;
        var document_2_is_approved     = 0;
        var document_2_type            = form_data.document_2_type;
        var cancelled_cheque_is_approved = 0;
        var query = '';
        var document_1_front_name = '';
        var document_2_front_name = '';
        var document_2_back_name = '';
        var cancelled_cheque_name = '';
        console.log(document_2_front);
        if(type == "0" || type == 0)
        {
            query += ' profile_type = "'+profile_type+'"';
        }
        if(type == "0" || type == 0){
            query +=  ', company_type = "'+company_type+'"';
        }
        if(type == "0" || type == 0){
            query +=  ', gstin_no = "'+gst_no+'"';
        }
        if(type == "0" || type == 0)
        {
            query += ', company_name = "'+company+'"';
        }
        if(type == "0" || type == 0){
            var user_name_array = contact_person.split(" ");
            var first_name = user_name_array[0];
            var last_name = user_name_array[1];
            query += ', first_name = "'+first_name+'", last_name = "'+last_name+'", user_name = "'+contact_person+'"';
        }
        if(type == "1" || type == 1)
        {
            document_1_front_name = await upload_base64_aws_image('customer_documents/pan_card',document_1_front);
            document_1_back_name = await upload_base64_aws_image('customer_documents/pan_card',document_1_back);
            query += ' document_1_front = "'+document_1_front_name+'", document_1_back = "'+document_1_back_name+'", document_1_number = "'+document_1_number+'", document_1_name_on = "'+document_1_name_on+'", document_1_is_approved = "'+document_1_is_approved+'" ';
        }
        if(type == "2" || type == 2)
        {
            document_2_front_name = await upload_base64_aws_image('customer_documents/id_proof',document_2_front);
            document_2_back_name = await upload_base64_aws_image('customer_documents/id_proof',document_2_back);
            query += ' document_2_front = "'+document_2_front_name+'", document_2_back = "'+document_2_back_name+'", document_2_number = "'+document_2_number+'", document_2_name_on = "'+document_2_name_on+'", document_2_is_approved = "'+document_2_is_approved+'", document_2_type = "'+document_2_type+'" ';
        }
        if(type == "3" || type == 3)
        {
            cancelled_cheque_name = await upload_base64_aws_image('customer_documents/cancelled_cheque',cancelled_cheque);
            var query_bank_details = "update user_bank_details set cancelled_cheque = ? where user_id = ? and is_default = 1 and is_verified = 1 and is_deleted = 0";
            var update_user_query_key = [cancelled_cheque_name, user_id]
            var update_user_billing_address_details_query = await accountSettingsModel.update_user_address(query_bank_details,update_user_query_key);
            
            query += ' cancelled_cheque = "'+cancelled_cheque_name+'", cancelled_cheque_is_approved = "'+cancelled_cheque_is_approved+'" ';
        }
        console.log("done1");
        var update_user_query = 'UPDATE user SET '+query+' WHERE id = '+user_id;
        console.log(update_user_query);
        console.log("done3");
        var update_user_billing_address_details_query = await accountSettingsModel.update_kyc_details(update_user_query);
        console.log("done4");  
        if(update_user_billing_address_details_query == 1){
                res.status(200).json({
                    status_code : 200,
                    status: 'success',
                    message: "KYC updated successfully",
					req_time: req_time,
				res_time: end_req_time()
                });
                return;
            }else{
                res.status(200).json({
                    status_code : 200,
                    status: 'error',
                    message: "Something went wrong!!! please try again.",
					req_time: req_time,
				res_time: end_req_time()
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
}