const validator = require('validator');
const bcrypt = require('bcryptjs');
var express = require('express');
var mysqlpool = require('../dbconfig');
const md5 = require('md5');
var htmlspecialchars = require('htmlspecialchars');
var decode = require('decode-html');
const date = require('date-and-time');

exports.getUserDetailsByID = async function(user_id) 
{

    return new Promise(function(resolve, reject) 
    {
        
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT id,password,first_name,last_name,email FROM user WHERE id=?", [user_id], function (error, results, fields) {
                if (error)
                { 
                    console.log("error")
                    connection.release();
                    reject(error);
                }
                else
                {
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};

exports.update_user_password = async function(update_user_query,update_user_key_array) 
{
    var update_query_result = [];
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query(update_user_query,update_user_key_array, function (error, results, fields) {
                if (error)
                { 
                    connection.release();
                    
                    update_query_result.push({
                        result : 0,
                        affectedRows: 0
                    });
                    reject(update_query_result);
                }else
                {
                    connection.release();
                    
                    update_query_result.push({
                        result : 1,
                        affectedRows: results.affectedRows
                    });
                    resolve(update_query_result);
                }
            });
        });
    });
};


exports.checkPincode = async function(pincode) 
{
    return new Promise(function(resolve, reject) 
    {
        
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT mpt.pincode,mpt.itl_city,mpt.itl_state,mpt.latitude,mpt.longitude,s.id as state_id, c.id as city_id FROM pincode_lat_long mpt "+ 
            "left join states s on s.state_name = mpt.itl_state "+ 
            "left join cities c on c.city_name = mpt.itl_city where mpt.pincode=? limit 1", [pincode], function (error, results, fields) {
                if (error)
                { 
                    connection.release();
                    reject(error);
                }
                else
                {
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};

exports.addWareHouseAdderess = async function(form_data) 
{
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
    var country_id = 101;

    return new Promise(function(resolve, reject) 
    {    
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("INSERT INTO user_address (company_name,user_id,country_id,state_id,city_id,address1,address2,pincode,mobile,email,website,is_default,status,contact_person) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'');",[company_name,user_id,country_id,state_id,city_id,address1,address2,pincode,mobile,email,website,is_default, status], async function (error, results, fields) {
                if (error)
                { 
                    connection.release();
                    reject(error);
                    
                }
                else
                {
                    if(is_default == 1)
                    {
                        var update_user_address_query = "UPDATE user_address SET is_default = '0' WHERE user_id = ?";
                        var update_user_address_query_key = [user_id];
                        await update_user_address_new(update_user_address_query,update_user_address_query_key);
                        var update_user_address_query1 = "UPDATE user_address SET is_default = '1' WHERE user_id = ? and id = ?";
                        var update_user_address_query_key1 = [user_id, results.insertId];
                        await update_user_address_new(update_user_address_query1,update_user_address_query_key1);
                    }
                    connection.release();
                    resolve(results);
                    
                }
            });
        });
    });
};
async function update_user_address_new(update_user_address_query,update_user_address_query_key) 
{
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query(update_user_address_query,update_user_address_query_key, function (error, results, fields) {
                if (error)
                { 
                    connection.release();
                    reject(0);
                }else
                {
                    connection.release();
                    resolve(1);
                }
            });
        });
    });
};
exports.update_user_address = async function(update_user_address_query,update_user_address_query_key) 
{
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query(update_user_address_query,update_user_address_query_key, function (error, results, fields) {
                if (error)
                { 
                    connection.release();
                    reject(0);
                }else
                {
                    connection.release();
                    resolve(1);
                }
            });
        });
    });
};
exports.update_kyc_details = async function(update_user_address_query) 
{
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query(update_user_address_query, function (error, results, fields) {
                if (error)
                { 
                    connection.release();
                    reject(0);
                }else
                {
                    connection.release();
                    resolve(1);
                }
            });
        });
    });
};
exports.editWareHouseAdderess = async function(form_data) 
{
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
    var edit_id = htmlspecialchars(form_data.edit_id);
    var country_id = 101;
    console.log("API HIT");
    return new Promise(function(resolve, reject) 
    {  

        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("UPDATE user_address SET company_name = ?, mobile=?,status=?,website=?,email=?,is_default=? WHERE user_id=? and id=?",[company_name, mobile, status, website, email, is_default, user_id, edit_id],async function (error, results, fields) {
                if (error)
                { 
                    connection.release();
                    reject(0);
                }else
                {
                    if(is_default == 1)
                    {
                        var update_user_address_query = "UPDATE user_address SET is_default = '0' WHERE user_id = ?";
                        var update_user_address_query_key = [user_id];
                        await update_user_address_new(update_user_address_query,update_user_address_query_key);

                        var update_user_address_query1 = "UPDATE user_address SET is_default = '1' WHERE user_id = ? and id = ?";
                        var update_user_address_query_key1 = [user_id, edit_id];
                        await update_user_address_new(update_user_address_query1,update_user_address_query_key1);
                    }
                    connection.release();
                    resolve(1);
                }
            });
        });
    });
};

exports.viewWarehouseAddress = async function(userid) 
{
    return new Promise(function(resolve, reject) 
    {
        
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT ua.id,ua.user_id,ua.company_name,ua.website,ua.mobile,ua.contact_person,ua.email,ua.address1,ua.address2,ua.pincode,ua.city_id,ua.state_id,ua.country_id,ua.website,ua.is_default,ua.status,ua.gst_no,ua.invoice_suffix,ua.invoice_prefix,c.city_name,s.state_name,ct.country_name FROM user_address ua LEFT JOIN cities c ON ua.city_id=c.id LEFT JOIN states s ON ua.state_id=s.id LEFT JOIN country ct ON ua.country_id=ct.id where ua.user_id = ? and ua.is_deleted = 0 order by ua.id desc", [userid], function (error, results, fields) {
                if (error)
                { 
                    connection.release();
                    reject(error);
                }
                else
                {
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};

exports.add_poc_contact_details = async function(form_data) 
{
    var user_id = htmlspecialchars(form_data.id);
    var contact_type = htmlspecialchars(form_data.contact_type);
    var contact_name = htmlspecialchars(form_data.contact_name);
    var contact_mobile = htmlspecialchars(form_data.contact_mobile);
    var contact_email = htmlspecialchars(form_data.contact_email);
    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    var created_datetime = date.format(now, pattern);
    var is_whatsapp;
    if(contact_type == 6)
    {
        is_whatsapp = 1;
    }
    else
    {
        is_whatsapp = 0;
    }

    return new Promise(function(resolve, reject) 
    {    
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("INSERT INTO user_contact_details(`user_id`,`modified_user_id`,`contact_type`,`contact_name`, `contact_mobile`,`contact_email`,`created_datetime`, `modified_date`,`is_whatsapp`,`is_deleted`) values(?,?,?,?,?,?,?,?,?,'0')",[user_id,user_id,contact_type,contact_name,contact_mobile,contact_email,created_datetime,created_datetime,is_whatsapp], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error)
                    connection.release();
                    reject(0);
                    
                }
                else
                {
                    //console.log("fdf")
                    connection.release();
                    resolve(1);
                    
                }
            });
        });
    });
};


exports.check_to_delete_poc_contact_details = async function(delete_id) 
{
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("select id from user_contact_details where id=? and is_deleted=0", [delete_id], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};

exports.delete_poc_contact_details = async function(delete_id) 
{
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("update user_contact_details set is_deleted='1' where id=?",[delete_id],async function (error, results, fields) {
                if (error)
                { 
                    //console.log(error);
                    connection.release();
                    reject(0);
                }else
                {
                    //console.log(results);
                    connection.release();
                    resolve(1);
                }
            });
        });
    });
};

exports.update_poc_contact_details = async function(form_data) 
{
    var user_id = htmlspecialchars(form_data.id);
    var poc_id = htmlspecialchars(form_data.poc_id);
    var contact_type = htmlspecialchars(form_data.contact_type);
    var contact_name = htmlspecialchars(form_data.contact_name);
    var contact_mobile = htmlspecialchars(form_data.contact_mobile);
    var contact_email = htmlspecialchars(form_data.contact_email);
    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    var created_datetime = date.format(now, pattern);
    var is_whatsapp;
    if(contact_type == 6)
    {
        is_whatsapp = 1;
    }
    else
    {
        is_whatsapp = 0;
    }

    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("update user_contact_details set contact_type=?,contact_name=?,contact_mobile=?,contact_email=?,modified_date=?,is_whatsapp=?  where id=?",[contact_type,contact_name,contact_mobile,contact_email,created_datetime,is_whatsapp,poc_id],async function (error, results, fields) {
                if (error)                                         
                { 
                    //console.log(error);
                    connection.release();
                    reject(0);
                }else
                {
                    //console.log(results);
                    connection.release();
                    resolve(1);
                }
            });
        });
    });
};

exports.poc_contact_details = async function(id) 
{
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT id,user_id,contact_type,contact_name,contact_mobile,contact_email FROM user_contact_details WHERE user_id=? and is_deleted = '0' order by id desc", [id], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};

exports.poc_ITL_details = async function(id) 
{
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT upd.id,upd.user_id,upd.poc_user_id,upd.poc_type,u.first_name,u.last_name,u.mobile,u.email FROM user_poc_details upd LEFT JOIN user u ON upd.poc_user_id=u.id WHERE upd.user_id= ? and upd.is_deleted = '0' order by upd.id desc", [id], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};


exports.get_rate_us_data = async function(id) 
{
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT id FROM user_extra WHERE user_id=? AND is_deleted='0'", [id], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};

exports.insert_user_extra_query = async function(form_data) 
{
    var user_id = htmlspecialchars(form_data.id);
    var rate_us_option_1  = htmlspecialchars(form_data.rate_us_option_1);
    var rate_us_option_2  = htmlspecialchars(form_data.rate_us_option_2);
    var rate_us_option_3  = htmlspecialchars(form_data.rate_us_option_3);
    var rate_us_option_4  = htmlspecialchars(form_data.rate_us_option_4);
    var rate_us_option_5  = htmlspecialchars(form_data.rate_us_option_5);
    var rate_us_option_6  = htmlspecialchars(form_data.rate_us_option_6);
    var specify_issue     = htmlspecialchars(form_data.specify_issue);
    var specify_issue2    = htmlspecialchars(form_data.specify_issue2);
    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    var created_datetime = date.format(now, pattern);
   

    return new Promise(function(resolve, reject) 
    {    
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("INSERT IGNORE INTO user_extra (`user_id`,`rate_us_option_1`,`rate_us_option_2`,`rate_us_option_3`, `rate_us_option_4`,`rate_us_option_5`,`rate_us_option_6`,`specify_issue`,`specify_issue2`,`modified_on`,`is_deleted`) values(?,?,?,?,?,?,?,?,?,?,'0')",[user_id,rate_us_option_1,rate_us_option_2,rate_us_option_3, rate_us_option_4,rate_us_option_5,rate_us_option_6,specify_issue,specify_issue2,created_datetime], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error)
                    connection.release();
                    reject(0);
                    
                }
                else
                {
                    //console.log("fdf")
                    connection.release();
                    resolve(1);
                    
                }
            });
        });
    });
};

exports.insert_user_rate_us_history_query = async function(form_data) 
{
    var user_id = htmlspecialchars(form_data.id);
    var rate_us_option_1  = htmlspecialchars(form_data.rate_us_option_1);
    var rate_us_option_2  = htmlspecialchars(form_data.rate_us_option_2);
    var rate_us_option_3  = htmlspecialchars(form_data.rate_us_option_3);
    var rate_us_option_4  = htmlspecialchars(form_data.rate_us_option_4);
    var rate_us_option_5  = htmlspecialchars(form_data.rate_us_option_5);
    var rate_us_option_6  = htmlspecialchars(form_data.rate_us_option_6);
    var specify_issue     = htmlspecialchars(form_data.specify_issue);
    var specify_issue2    = htmlspecialchars(form_data.specify_issue2);
    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    var created_datetime = date.format(now, pattern);
    
    return new Promise(function(resolve, reject) 
    {    
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("INSERT INTO user_rate_us_history (`user_id`,`rate_us_option_1`,`rate_us_option_2`,`rate_us_option_3`, `rate_us_option_4`,`rate_us_option_5`,`rate_us_option_6`,`specify_issue`,`specify_issue2`,`created_at`,`is_deleted`) values(?,?,?,?,?,?,?,?,?,?,'0')",[user_id,rate_us_option_1,rate_us_option_2,rate_us_option_3, rate_us_option_4,rate_us_option_5,rate_us_option_6,specify_issue,specify_issue2,created_datetime], async function (error, results, fields) {
                if (error)
                { 
                    //console.log(error)
                    connection.release();
                    reject(0);
                    
                }
                else
                {
                    //console.log("fdf")
                    connection.release();
                    resolve(1);
                    
                }
            });
        });
    });
};


exports.view_rate_us = async function(user_id) 
{
    
    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    var created_datetime = date.format(now, pattern);
   

    return new Promise(function(resolve, reject) 
    {    
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("Select rate_us_option_1, rate_us_option_2, rate_us_option_3, rate_us_option_4, rate_us_option_5, rate_us_option_6,specify_issue,specify_issue2 from user_extra WHERE user_id = ?",[user_id], async function (error, results, fields) {
                if (error)
                { 
                    //console.log(error)
                    connection.release();
                    reject([]);
                    
                }
                else
                {
                    //console.log("fdf")
                    connection.release();
                    resolve(results);
                    
                }
            });
        });
    });
};

exports.update_user_extra_query = async function(form_data) 
{
    var user_id = htmlspecialchars(form_data.id);
    var rate_us_option_1  = htmlspecialchars(form_data.rate_us_option_1);
    var rate_us_option_2  = htmlspecialchars(form_data.rate_us_option_2);
    var rate_us_option_3  = htmlspecialchars(form_data.rate_us_option_3);
    var rate_us_option_4  = htmlspecialchars(form_data.rate_us_option_4);
    var rate_us_option_5  = htmlspecialchars(form_data.rate_us_option_5);
    var rate_us_option_6  = htmlspecialchars(form_data.rate_us_option_6);
    var specify_issue     = htmlspecialchars(form_data.specify_issue);
    var specify_issue2    = htmlspecialchars(form_data.specify_issue2);
    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    var created_datetime = date.format(now, pattern);
   

    return new Promise(function(resolve, reject) 
    {    
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("UPDATE user_extra SET rate_us_option_1 = ?, rate_us_option_2 = ?, rate_us_option_3 = ?, rate_us_option_4 = ?, rate_us_option_5 = ?, rate_us_option_6 = ?, modified_on = ?,specify_issue = ?,specify_issue2 = ? WHERE user_id = ?",[rate_us_option_1,rate_us_option_2,rate_us_option_3, rate_us_option_4,rate_us_option_5,rate_us_option_6,created_datetime,specify_issue,specify_issue2,user_id], async function (error, results, fields) {
                if (error)
                { 
                    //console.log(error)
                    connection.release();
                    reject(0);
                    
                }
                else
                {
                    //console.log("fdf")
                    connection.release();
                    resolve(1);
                    
                }
            });
        });
    });
};

exports.get_add_training_session = async function(form_data) 
{
    var user_id                         = htmlspecialchars(form_data.id);
    var training_date                   = htmlspecialchars(form_data.training_date);
    var training_topic                  = htmlspecialchars(form_data.training_topic);
    var training_session_time           = htmlspecialchars(form_data.training_session_time);
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT id FROM user_training WHERE training_date = ? and training_slot = ? and is_deleted='0'", [training_date,training_session_time], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};


exports.add_training_session = async function(form_data) 
{
    var user_id                         = htmlspecialchars(form_data.id);
    var training_date                   = htmlspecialchars(form_data.training_date);
    var training_topic                  = htmlspecialchars(form_data.training_topic);
    var training_session_time           = htmlspecialchars(form_data.training_session_time);
    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    var created_datetime = date.format(now, pattern);
    
    return new Promise(function(resolve, reject) 
    {    
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("INSERT IGNORE INTO user_training (user_id,training_conducted_by,training_date,training_slot,user_training_topics_id,created_date_time,status,is_deleted) VALUES (?,0,?,?,?,?,0,0)",[user_id,training_date,training_session_time,training_topic, created_datetime], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error)
                    connection.release();
                    reject(0);
                    
                }
                else
                {
                    console.log(results);
                    connection.release();
                    resolve(1);
                    
                }
            });
        });
    });
};

exports.view_training_session = async function(form_data) 
{
    var user_id                         = htmlspecialchars(form_data.id);
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT ut.id,DATE_FORMAT(ut.training_date, '%M %d %Y') as training_date,ut.training_slot,ut.user_training_topics_id,ut.status,utt.topic_title FROM user_training ut LEFT JOIN user_training_topics utt ON ut.user_training_topics_id = utt.id  WHERE ut.is_deleted='0' and ut.user_id=? order by ut.id desc", [user_id], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};

exports.get_training_session_topics = async function() 
{
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT * FROM depasser_itl.user_training_topics", async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};
exports.get_user_extra_details = async function(form_data) 
{
    var user_id                         = htmlspecialchars(form_data.id);
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT id,company_name,cin,gst_no,invoice_prefix,invoice_suffix,company_logo,company_signature FROM user_extra WHERE user_id=? AND is_deleted='0'", [user_id], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};
exports.get_user_training_topics = async function(training_topic) 
{
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT id,topic_title FROM user_training_topics WHERE id=? and is_deleted='0'", [training_topic], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};

exports.update_user_invoice_setting = async function(form_data, invoiceLogoupload,invoiceSignatureupload) 
{
    var user_id             = htmlspecialchars(form_data.id);
    var company_name        = htmlspecialchars(form_data.company_name);
    var cin                 = htmlspecialchars(form_data.cin);
    var gst_no              = htmlspecialchars(form_data.gst_no);
    var invoice_prefix      = htmlspecialchars(form_data.invoice_prefix);
    var invoice_suffix      = htmlspecialchars(form_data.invoice_suffix);
    var invoiceLogo         = htmlspecialchars(form_data.invoiceLogo);
    var invoiceSignature    = htmlspecialchars(form_data.invoiceSignature);
    var invoice_edit_id     = htmlspecialchars(form_data.invoice_edit_id);
    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    var created_datetime = date.format(now, pattern);
   

    return new Promise(function(resolve, reject) 
    {    
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("UPDATE user_extra SET company_name = ?, cin = ?, gst_no = ?, invoice_prefix = ?, invoice_suffix = ?, company_logo = ?, company_signature = ?,  modified_on = ? WHERE id = ? and user_id = ?",[company_name,cin,gst_no, invoice_prefix,invoice_suffix,invoiceLogoupload,invoiceSignatureupload,created_datetime,invoice_edit_id,user_id], async function (error, results, fields) {
                if (error)
                { 
                    //console.log(error)
                    connection.release();
                    reject(0);
                    
                }
                else
                {
                    //console.log("fdf")
                    connection.release();
                    resolve(1);
                    
                }
            });
        });
    });
};

exports.get_update_label_setting_details = async function(user_id) 
{
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT id,user_id,shipping_label_size,display_cod_prepaid,display_shipper_mobile,display_shipper_address,display_short_address,modified_on FROM user_extra WHERE user_id=? AND is_deleted='0'", [user_id], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};

exports.update_update_label_setting = async function(form_data) 
{
    var user_id                     = htmlspecialchars(form_data.id);
    var label_edit_id               = htmlspecialchars(form_data.label_edit_id);
    var shipping_label_size         = htmlspecialchars(form_data.shipping_label_size);
    var display_cod_prepaid         = htmlspecialchars(form_data.display_cod_prepaid);
    var display_shipper_mobile      = htmlspecialchars(form_data.display_shipper_mobile);
    var display_shipper_address     = htmlspecialchars(form_data.display_shipper_address);
    var display_short_address       = htmlspecialchars(form_data.display_short_address);
    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    var created_datetime = date.format(now, pattern);
   

    return new Promise(function(resolve, reject) 
    {    
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("UPDATE user_extra SET shipping_label_size = ?, display_cod_prepaid = ?, display_shipper_mobile = ?, display_shipper_address = ?, display_short_address = ?, modified_on = ? WHERE id = ? and user_id = ?",[shipping_label_size,display_cod_prepaid,display_shipper_mobile, display_shipper_address,0,created_datetime,label_edit_id,user_id], async function (error, results, fields) {
                if (error)
                { 
                    //console.log(error)
                    connection.release();
                    reject(0);
                    
                }
                else
                {
                    //console.log("fdf")
                    connection.release();
                    resolve(1);
                    
                }
            });
        });
    });
};

exports.insert_label_setting = async function(form_data) 
{
    var user_id                 = htmlspecialchars(form_data.id);
    var label_edit_id           = htmlspecialchars(form_data.label_edit_id);
    var shipping_label_size     = htmlspecialchars(form_data.shipping_label_size);
    var display_cod_prepaid     = htmlspecialchars(form_data.display_cod_prepaid);
    var display_shipper_mobile  = htmlspecialchars(form_data.display_shipper_mobile);
    var display_shipper_address = htmlspecialchars(form_data.display_shipper_address);
    var display_short_address   = htmlspecialchars(form_data.display_short_address);
    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    var created_datetime = date.format(now, pattern);
    
    return new Promise(function(resolve, reject) 
    {    
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("INSERT IGNORE INTO user_extra (`user_id`,`shipping_label_size`,`display_cod_prepaid`,`display_shipper_mobile`, `display_shipper_address`,`display_short_address`,`modified_on`,`is_deleted`) values(?,?,?,?,?,?,?,'0')",[user_id,shipping_label_size,display_cod_prepaid,display_shipper_mobile,display_shipper_address,display_short_address,created_datetime], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error)
                    connection.release();
                    reject(0);
                }
                else
                {
                    console.log(results);
                    connection.release();
                    resolve(1);
                }
            });
        });
    });
};

exports.view_billing_address = async function(form_data) 
{
    var user_id   = htmlspecialchars(form_data.id);
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT ubad.id,ubad.user_id,ubad.billing_company_name,ubad.gstn_no,ubad.address_line1,ubad.address_line2,ubad.state_id,ubad.city_id,ubad.pincode,ubad.contact_no,ubad.is_default,ubad.created_date_time,c.city_name,s.state_name FROM user_billing_address_details ubad LEFT JOIN cities c ON ubad.city_id=c.id LEFT JOIN states s ON ubad.state_id=s.id  where ubad.user_id = ? and ubad.is_deleted = 0 order by ubad.id desc", [user_id], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};

exports.view_account_settings = async function(form_data) 
{
    var user_id   = htmlspecialchars(form_data.id);
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT user.id,first_name,last_name,user_name,user.company_name,mobile,vendor_code,vendor_website,email,mobile_verify,alt_mobile,pdf_logo_img,profile_type,company_type,gstin_no,document_1_type,document_1_number,document_1_name_on,document_1_front,document_1_back,document_1_disapproved_remark,document_1_is_approved,document_2_type,document_2_number,document_2_name_on,document_2_front,document_2_back,document_2_is_approved,document_2_disapproved_remark,cancelled_cheque,cancelled_cheque_disapproved_remark,cancelled_cheque_is_approved,parent_user_id,responsible_user_id,status,kyc_disapprove_count,user_bank_details_id,api_access_token,api_secret_key, fssai_number FROM user join user_extra on user.id = user_extra.user_id WHERE user.id=?", [user_id], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};


exports.get_user_billing_address_details = async function(form_data) 
{
    var user_id   = htmlspecialchars(form_data.id);
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT id,user_id,billing_company_name,gstn_no,address_line1,address_line2,state_id,city_id,pincode,contact_no,is_default,created_date_time FROM user_billing_address_details WHERE user_id=? AND is_default='1' AND is_deleted='0'", [user_id], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};

exports.insert_user_billing_address_details = async function(form_data) 
{
    var user_id = htmlspecialchars(form_data.id);
    var billing_company_name            = htmlspecialchars(form_data.billing_company_name);
    var gstn_no                         = form_data.gstn_no;
    var address_line1                   = htmlspecialchars(form_data.address_line1);
    var address_line2                   = htmlspecialchars(form_data.address_line2);
    var state_id                        = form_data.state_id;
    var pincode                         = form_data.pincode;
    var contact_no                      = form_data.contact_no;
    var city_id                         = form_data.city_id;
    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    var created_datetime = date.format(now, pattern);
    
    return new Promise(function(resolve, reject) 
    {    
        console.log("error")
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("INSERT INTO user_billing_address_details(`user_id`,`modified_user_id`,`billing_company_name`,`gstn_no`, `address_line1`,`address_line2`,`state_id`,`city_id`,`pincode`,`contact_no`,`is_default`,`is_verified`,`created_date_time` ,`updated_date_time` ,`is_deleted`) values(?,?,?,?,?,?,?,?,?,?,'1','0',?,?,'0')",[user_id,user_id,billing_company_name,gstn_no,address_line1,address_line2,state_id,city_id,pincode,contact_no,created_datetime,created_datetime], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error)
                    connection.release();
                    reject('error');
                    
                }
                else
                {
                    console.log(results)
                    connection.release();
                    
                    resolve(results.insertId);
                    
                }
            });
        });
    });
};


exports.update_user_billing_address_details_query = async function(form_data,last_inserted_id) 
{
    var user_id                     = htmlspecialchars(form_data.id);

    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    var created_datetime = date.format(now, pattern);
   

    return new Promise(function(resolve, reject) 
    {    
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("UPDATE user_billing_address_details SET is_default = '0',created_date_time = ?,updated_date_time = ?,modified_user_id = ? WHERE id !=? and user_id=?",[created_datetime,created_datetime,user_id,last_inserted_id,user_id], async function (error, results, fields) {
                if (error)
                { 
                    //console.log(error)
                    connection.release();
                    reject(0);
                    
                }
                else
                {
                    //console.log("fdf")
                    connection.release();
                    resolve(1);
                    
                }
            });
        });
    });
};

exports.update_user_billing_address_id = async function(form_data,last_inserted_id) 
{
    var user_id  = htmlspecialchars(form_data.id);

    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    var created_datetime = date.format(now, pattern);
   

    return new Promise(function(resolve, reject) 
    {    
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("UPDATE user SET user_billing_address_id = ? WHERE id=?",[last_inserted_id,user_id], async function (error, results, fields) {
                if (error)
                { 
                    //console.log(error)
                    connection.release();
                    reject(0);
                    
                }
                else
                {
                    //console.log("fdf")
                    connection.release();
                    resolve(1);
                    
                }
            });
        });
    });
};


exports.view_contract_acceptance = async function(form_data) 
{
    var user_id   = htmlspecialchars(form_data.id);
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT uc.*, u.user_name FROM user_contract uc LEFT JOIN user u ON uc.user_id = u.id WHERE uc.is_deleted='0' and (user_id=? or user_id = '') order by uc.id desc", [user_id], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};
exports.Accept_contract_acceptance = async function(form_data,file_name) 
{
    var user_id                         = htmlspecialchars(form_data.id);
    var contract_id                   = htmlspecialchars(form_data.contract_id);
    var user_ip                         = form_data.user_ip;
    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    var created_datetime = date.format(now, pattern);
    
    return new Promise(function(resolve, reject) 
    {    
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("INSERT INTO user_contract_history(`user_contract_id`,`user_id`,`user_ip`,`user_contract_file_name`, `created_date_time`,`updated_date_time`,`status`,`is_deleted`) VALUES (?,?,?,?,now(),now(),?,?)",[contract_id,user_id,user_ip,file_name,'1','0'], async function (error, results, fields) {
                if (error) 
                { 
                    console.log(error)
                    connection.release();
                    reject(0);
                    
                }
                else
                {
                    console.log(results);
                    connection.release();
                    resolve(1);
                    
                }
            });
        });
    });
};
exports.Accept_contract_acceptance_update = async function(form_data,file_name) 
{
    var user_id                         = htmlspecialchars(form_data.id);
    var contract_id                   = htmlspecialchars(form_data.contract_id);
    var user_ip                         = form_data.user_ip;
    const pattern = date.compile('YYYY-MM-DD HH:mm:ss');
    const now = new Date();
    var created_datetime = date.format(now, pattern);
    var file_query = '';
    if(file_name != '')
    {
        file_query = " contract_file_name = '"+file_name+"', ";
    }
    
    return new Promise(function(resolve, reject) 
    {    
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("update user_contract set "+file_query+" status = 0, updated_date_time = now() where id = ?",[contract_id], async function (error, results, fields) {
                if (error) 
                { 
                    console.log(error)
                    connection.release();
                    reject(0);
                    
                }
                else
                {
                    console.log(results);
                    connection.release();
                    resolve(1);
                    
                }
            });
        });
    });
};
exports.get_user_contract_history_query = async function(form_data) 
{
    var user_id   = htmlspecialchars(form_data.id);
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT user_contract_id,user_id,user_ip,user_contract_file_name,status FROM user_contract_history WHERE is_deleted='0' and status='1' and user_id=? order by id desc", [user_id], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};
exports.view_rate_chart = async function(form_data) 
{
    var user_id   = htmlspecialchars(form_data.id);
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT * FROM rate_chart where user_id =? and status='1' and is_deleted='0' order by slab_weight_in_kg", [user_id], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};


exports.get_logistics_details = async function(form_data) 
{
    var user_id   = htmlspecialchars(form_data.id);
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT * FROM logistics",  async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};

exports.view_bank_details = async function(form_data) 
{
    var user_id   = htmlspecialchars(form_data.id);
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT id,benf_account_no,account_type, ifsc_code,benf_name,cancelled_cheque,is_verified,is_default,DATE_FORMAT(created_date_time,'%d-%m-%Y') as created_date_time FROM user_bank_details where user_id = ? and is_default = 1 order by id desc", [user_id], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};

exports.view_api_key_details = async function(form_data) 
{
    var user_id   = htmlspecialchars(form_data.id);
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT id,user_id,platform_id,store_url,store_name,store_website_name,access_token,secret_key,status,created_date_time FROM user_store where user_id =? and is_deleted='0' order by platform_id", [user_id], async function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    reject([]);
                }
                else
                {
                    console.log(results)
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};

exports.get_all_user = async function(Email,user_id) 
{
    //var HTML_secial_char = htmlspecialchars("</script>'foo! @ & % < > /");
    //console.log(HTML_secial_char);
    //console.log(decode(HTML_secial_char));
    
    return new Promise(function(resolve, reject) 
    {
        
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("select * from user where user_type='3' and lower(email)=? and id != ? and is_deleted = '0' limit 1 ", [Email,user_id], function (error, results, fields) {
                if (error)
                { 
                    connection.release();
                    reject(error);
                }
                else
                {
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};

exports.get_all_onboard_user = async function(Email,user_id) 
{
    //var HTML_secial_char = htmlspecialchars("</script>'foo! @ & % < > /");
    //console.log(HTML_secial_char);
    //console.log(decode(HTML_secial_char));
    
    return new Promise(function(resolve, reject) 
    {
        
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("select * from onboard_user where lower(email)=? and id != ? and is_deleted = '0' limit 1 ", [Email,user_id], function (error, results, fields) {
                if (error)
                { 
                    connection.release();
                    reject(error);
                }
                else
                {
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};