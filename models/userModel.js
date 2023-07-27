const validator = require('validator');
const bcrypt = require('bcryptjs');
var express = require('express');
var mysqlpool = require('../dbconfig');
const md5 = require('md5');
var htmlspecialchars = require('htmlspecialchars');
var decode = require('decode-html');

exports.login_user = async function(form_data) 
{
    var Email = form_data.email;
    //var HTML_secial_char = htmlspecialchars("</script>'foo! @ & % < > /");
    //console.log(HTML_secial_char);
    //console.log(decode(HTML_secial_char));
    
    return new Promise(function(resolve, reject) 
    {
        
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("select * from user where user_type='3' and lower(email)=? and is_deleted = '0' limit 1 ", [Email], function (error, results, fields) {
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

exports.login_user_solr = async function(form_data) 
{
    var Email = form_data.email;
    //var HTML_secial_char = htmlspecialchars("</script>'foo! @ & % < > /");
    //console.log(HTML_secial_char);
    //console.log(decode(HTML_secial_char));
    
    return new Promise(function(resolve, reject) 
    {
        
        var SolrNode = require('solr-node');
 
        // Create client
        var client = new SolrNode({
            host: '127.0.0.1',
            port: '8983',
            core: 'myCollection',
            protocol: 'http'
        });
        
        var objQuery = client.query().q({email:'iparmar@ithinklogistics.com'},{first_name: '*'});

        
        // Search documents using strQuery
        client.search(objQuery, function (err, result) {
        if (err) {
            console.log(err);
            reject(error);
            return(error);
        }

        console.log('Response:', result.response);
        data = {
            'id': 9,
            'user_name':{'set':'demo'},
        };
        
        
        //client.autoCommit = true;
        client.update(data, function(err, obj) {
            if (err) {
              console.log(err.stack);
            } else {
              client.softCommit();
            }
          });
        resolve(result.response.docs);
        });
    });
};
exports.state_array_solr = async function(form_data) 
{
    var Email = form_data.email;
    //var HTML_secial_char = htmlspecialchars("</script>'foo! @ & % < > /");
    //console.log(HTML_secial_char);
    //console.log(decode(HTML_secial_char));
    
    return new Promise(function(resolve, reject) 
    {
        
        var SolrNode = require('solr-node');
 
        // Create client
        var client = new SolrNode({
            host: '127.0.0.1',
            port: '8983',
            core: 'collection1',
            protocol: 'http'
        });
        
        var objQuery = client.query().q();

        
        // Search documents using strQuery
        client.search(objQuery, function (err, result) {
        if (err) {
            console.log(err);
            reject(error);
            return(error);
        }
        console.log('Response:', result.response);
        resolve(result.response.docs);
        });
    });
};

exports.get_user_mobile_access_token = async function(user_id) 
{
    //var HTML_secial_char = htmlspecialchars("</script>'foo! @ & % < > /");
    //console.log(HTML_secial_char);
    //console.log(decode(HTML_secial_char));
    
    return new Promise(function(resolve, reject) 
    {
        
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("select mobile_access_token from user where user_type='3' and id=? and is_deleted = '0' limit 1 ", [user_id], function (error, results, fields) {
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
exports.update_last_login_and_mobile_access_token = async function(user_id,mobile_access_token,mobile_token_exp_date,current_date) 
{
    var user_id = user_id;
    var mobile_access_token = mobile_access_token;
    var mobile_token_exp_dat = mobile_token_exp_dat;
    var current_date = current_date;
    return new Promise(function(resolve, reject) 
    {
        
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("update user set mobile_access_token=?,mobile_token_exp_date=?,app_last_login=? where id = ?",[htmlspecialchars(mobile_access_token),htmlspecialchars(mobile_token_exp_date),htmlspecialchars(current_date),htmlspecialchars(user_id)], function (error, results, fields) {
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

exports.insert_user_login_details_query = async function(user_id,current_date,type) 
{
    var user_id = user_id;
    var current_date = current_date;
    var type = type;
    return new Promise(function(resolve, reject) 
    {    
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("INSERT INTO user_login_details (user_id, ip_address, user_agent, login_date_time,is_deleted) VALUES (?,?,?,?,?)",[htmlspecialchars(user_id),"''","''",htmlspecialchars(current_date),0], function (error, results, fields) {
                if (error)
                { 
                    connection.release();
                    //console.log("f")
                    reject(error);
                    
                }
                else
                {
                    connection.release();
                    //console.log("t")
                    resolve(results);
                    
                }
            });
        });
    });
};
exports.forgot_password = async function(form_data) 
{
    var email = form_data.email;
    return new Promise(function(resolve, reject) 
    {
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT * from user where lower(email)=? and is_deleted = ?",[email,0], function (error, results, fields) {
                if (error)
                { 
                    connection.release();
                    console.log("f")
                    reject(error);
                }
                else
                {
                    connection.release();
                    console.log("t")
                    resolve(results);
                }
            });
        });
    });
};
exports.onboard_forgot_password = async function(form_data) 
{
    var email = form_data.email;
    return new Promise(function(resolve, reject) 
    {
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT * from onboard_user where lower(email)=? and is_deleted = ?",[email,0], function (error, results, fields) {
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

exports.update_user_forgot_pass_query = async function(update_user_query,update_user_key_array) 
{
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query(update_user_query,update_user_key_array, function (error, results, fields) {
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

exports.reset_password = async function(query,unique_key_forgot_password) 
{
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query(query,unique_key_forgot_password, function (error, results, fields) {
                if (error)
                { 
                    connection.release();
                    reject(error);
                }else
                {
                    connection.release();
                    resolve(results);
                }
            });
        });
    });
};

exports.update_user_password_query = async function(update_user_query,update_user_key_array) 
{
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query(update_user_query,update_user_key_array, function (error, results, fields) {
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

exports.get_pincode_state_city = async function(pincode) 
{
    return new Promise(function(resolve, reject) 
    {
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT distinct pll.city,pll.state, s.id as state_id, c.id as city_id FROM pincode_lat_long pll join states s on s.state_name = pll.state join cities c on c.city_name = pll.city where pincode = ?",[pincode], function (error, results, fields) {
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

exports.get_citys_from_state = async function(state) 
{
    return new Promise(function(resolve, reject) 
    {
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("SELECT distinct c.city_name, c.id as city_id, s.id as state_id FROM cities c join states s on s.id = c.state_id where s.state_name = ?  and c.city_name != ''",[state], function (error, results, fields) {
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

exports.get_state = async function() 
{
    return new Promise(function(resolve, reject) 
    {
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query("select distinct id, state_name from states where country_id = '101' and state_name != ''", function (error, results, fields) {
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


exports.verify_opt = async function(query,array) 
{
    return new Promise(function(resolve, reject) 
    {
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query(query,array, function (error, results, fields) {
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

exports.get_otp = async function(update_user_query,update_user_key_array) 
{
    return new Promise(function(resolve, reject) 
    {  
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query(update_user_query,update_user_key_array, function (error, results, fields) {
                if (error)
                { 
                    console.log(error);
                    connection.release();
                    
                    reject(0);
                }else
                {
                    console.log("success");
                    connection.release();
                    resolve(1);
                }
            });
        });
    });
};