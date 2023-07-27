const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');
const billing = require('../services/billingServices');
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


exports.get_widget_remittance = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        console.log(req.body)
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            billing.get_widget_remittance(form_data, req, res, next);
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
exports.get_widget_shipping_charge = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        console.log(req.body)
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            billing.get_widget_shipping_charge(form_data, req, res, next);
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
  
exports.get_widget_wallet_transactions = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        console.log(req.body)
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            billing.get_widget_wallet_transactions(form_data, req, res, next);
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

exports.get_widget_bill_summary = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        console.log(req.body)
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            billing.get_widget_bill_summary(form_data, req, res, next);
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

exports.get_widget_credit_receipt = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        console.log(req.body)
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            billing.get_widget_credit_receipt(form_data, req, res, next);
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

exports.all_credit_receipt_table_data = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        console.log(req.body)
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            billing.all_credit_receipt_table_data(form_data, req, res, next);
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

exports.all_bill_summary_table_data = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        console.log(req.body)
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            billing.all_bill_summary_table_data(form_data, req, res, next);
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

exports.all_remittance_table_data = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        console.log(req.body)
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            billing.all_remittance_table_data(form_data, req, res, next);
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

exports.all_remittance_table_data = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        console.log(req.body)
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            billing.all_remittance_table_data(form_data, req, res, next);
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

exports.all_shipping_charge_table_data = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        console.log(req.body)
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            billing.all_shipping_charge_table_data(form_data, req, res, next);
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


exports.all_wallet_transactions_table_data = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        console.log(req.body)
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            billing.all_wallet_transactions_table_data(form_data, req, res, next);
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



exports.view_invoice_details_data = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        console.log(req.body)
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            billing.view_invoice_details_data(form_data, req, res, next);
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

exports.filter_data = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        console.log(req.body)
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            billing.filter_data(form_data, req, res, next);
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
exports.export_data = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        console.log(req.body)
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            billing.export_data(form_data, req, res, next);
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

