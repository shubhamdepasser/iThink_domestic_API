const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');
const User = require('../services/userservice');
var express = require('express');
const nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var base64ToImage = require('../method/base64ToImage');
var sendMail = require('../method/sendMail');
//var AES_formator = require('../method/AES_formator');
const dotenv = require('dotenv');
dotenv.config({
  path: './../config.env'
});
var access_token = process.env.access_token;
var secret_key = process.env.secret_key;
var fs = require('fs');
const upload = require('./../method/upoadFile');


exports.login = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        console.log(req.body)
        //base64image.base64ToImage(req, res, next);
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            User.login_user(form_data, req, res, next);
        }
        else
        {
            res.status(200).json({
                status : "error",
                status_code : 400,
                message : "Invalid Request",
            });
        }
       
        
    } catch (err) 
    {
        res.status(200).json({
            status : "error",
            status_code : 400,
            message : "Something went wrong!!! please try again.",
            error_message: err,
        });
        //next(err);
    }
};

exports.login_user_solr = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        console.log(req.body)
        //base64image.base64ToImage(req, res, next);
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            User.login_user_solr(form_data, req, res, next);
        }
        else
        {
            res.status(200).json({
                status : "error",
                status_code : 400,
                message : "Invalid Request",
            });
        }
       
        
    } catch (err) 
    {
        res.status(200).json({
            status : "error",
            status_code : 400,
            message : "Something went wrong!!! please try again.",
            error_message: err,
        });
        //next(err);
    }
};

        
exports.forgot_password = async (req, res, next) => 
{
    try 
    {
        const 
        {
            form_data
        } = req.body;
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
           User.forgot_password(form_data, req, res, next);
           //AES_formator.chilkatExample( req, res, next);
           //upoadFile.uploadFile(res);
        }
        else
        {
            res.status(200).json({
                status : "error",
                status_code : 400,
                message : "Invalid Request",
            });
        }
    }
    catch(e)
    {
        res.status(200).json({
            status : "error",
            status_code : 400,
            message : "Something went wrong!!! please try agaisssn.",
            error_message: e,
        });
    }
};

exports.reset_password = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            User.reset_password(form_data, req, res, next);
        }
        else
        {
            res.status(200).json({
                status : "error",
                status_code : 400,
                message : "Invalid Request",
            });
        }
    }
    catch(e)
    {
        res.status(200).json({
            status : "error",
            status_code : 400,
            message : "Something went wrong!!! please try again.",
            error_message: e,
        });
    }
};

exports.image_upload = async (image) => 
{
    try 
    {
        var base64image = await base64ToImage.base64ToImage(image);
        console.log(base64image);
        var data;
        var ext = base64image.substr(base64image.lastIndexOf('.') + 1);
        var fileStream = await fs.createReadStream('./images/temp/'+base64image);
        var filestreamdata = await new Promise(resolve =>{ 
            fileStream.on('error', function(err) {
                console.log('File Error', err);
                resolve(err);
            });
            resolve("");
        });
        var Buffer = require('buffer/').Buffer;
        //fileStream.setEncoding('UTF8');
        var i = 0;
        filestreamdata = await new Promise(resolve =>{
            fileStream.on('readable', function(chunk) {
                while ((chunk=fileStream.read()) != null) {
                    if(i == 0)
                    {
                        data = chunk;
                    }
                    else{
                        data = Buffer.concat([data, chunk]);
                    }
                    i++;
                }
                resolve("");
            });
        });
        
        //var writableStream = fs.createWriteStream('./images/temp/test4.jpeg');
        setTimeout(() => {
            //writableStream.write(data);
            console.log(data);
            const single_upload = upload.upload_S3(data,ext,base64image);
            if(single_upload == 1){
                return base64image;
            }
            else{
                return "error";
            }
        }, 300); 
    }
    catch(e)
    {
        
    }
};


exports.get_pincode_state_city = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            if(form_data.mobile_access_token)
            User.get_pincode_state_city(form_data, req, res, next);
        }
        else
        {
            res.status(200).json({
                status : "error",
                status_code : 400,
                message : "Invalid Request",
            });
        }
    }
    catch(e)
    {
        res.status(200).json({
            status : "error",
            status_code : 400,
            message : "Something went wrong!!! please try again.",
            error_message: e,
        });
    }
};

exports.verify_opt = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            User.verify_opt(form_data, req, res, next);
        }
        else
        {
            res.status(200).json({
                status : "error",
                status_code : 400,
                message : "Invalid Request",
            });
        }
    }
    catch(e)
    {
        res.status(200).json({
            status : "error",
            status_code : 400,
            message : "Something went wrong!!! please try again.",
            error_message: e,
        });
    }
};

exports.get_otp = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            User.get_otp(form_data, req, res, next);
        }
        else
        {
            res.status(200).json({
                status : "error",
                status_code : 400,
                message : "Invalid Request",
            });
        }
    }
    catch(e)
    {
        res.status(200).json({
            status : "error",
            status_code : 400,
            message : "Something went wrong!!! please try again.",
            error_message: e,
        });
    }
};

exports.get_current_balance = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        console.log(req.body)
        //base64image.base64ToImage(req, res, next);
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            User.get_current_balance(form_data, req, res, next);
        }
        else
        {
            res.status(200).json({
                status : "error",
                status_code : 400,
                message : "Invalid Request",
            });
        }
       
        
    } catch (err) 
    {
        res.status(200).json({
            status : "error",
            status_code : 400,
            message : "Something went wrong!!! please try again.",
            error_message: err,
        });
        //next(err);
    }
};