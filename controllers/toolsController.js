const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');
const tools = require('../services/toolsServices');
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

exports.pincode_services = async (req, res, next) => 
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
            tools.pincode_services(form_data, req, res, next);
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