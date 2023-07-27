const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');
const viewOrder = require('../services/viewOrderServices');
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


exports.viewOrderViewDetails = async (req, res, next) => 
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
            viewOrder.viewOrderViewDetails(form_data, req, res, next);
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

exports.viewOrderMyStoreOrderDetails = async (req, res, next) => 
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
            viewOrder.viewOrderMyStoreOrderDetails(form_data, req, res, next);
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

exports.cancelOrder = async (req, res, next) => 
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
            viewOrder.cancelOrder(form_data, req, res, next);
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


exports.createOrder = async (req, res, next) => 
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
            viewOrder.createOrder(form_data, req, res, next);
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
exports.get_pickup_address = async (req, res, next) => 
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
            viewOrder.get_pickup_address(form_data, req, res, next);
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


exports.get_logistics_list = async (req, res, next) => 
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
            //viewOrder.get_logistics_list(form_data, req, res, next);
            res.status(200).json({
                status : "success",
                status_code : 200,
                data_array: [{"pincode_service_response_data":{"state_name":"maharashtra","city_name":"SHIRDI",
                        "xpressbees":{"prepaid":"N","cod":"N","pickup":"N","district":"","state_code":"","sort_code":""},
                        "fedex":{"prepaid":"N","cod":"N","pickup":"N","district":"","state_code":"","sort_code":""},
                        "delhivery":{"prepaid":"Y","cod":"Y","pickup":"Y","district":"Ahmed Nagar","state_code":"MH","sort_code":"ISK\/GRN"},
                        "ecom":{"prepaid":"Y","cod":"Y","pickup":"Y","district":"Maharashtra","state_code":"Maharashtra","sort_code":""},
                        "ekart":{"prepaid":"Y","cod":"Y","pickup":"Y","district":"MAHARASHTRA","state_code":"MAHARASHTRA","sort_code":"West"},
                        "shadowfax":{"prepaid":"N","cod":"N","pickup":"N","district":"","state_code":"","sort_code":""}
                    },
                    "billing":[{
                        "xpressbees":{"itl_half_kg":"45.00","itl_additional_half_kg":0,"itl_fsc_per":0,"itl_dto_charges":0,"itl_cod_charge":0,"itl_rto_half_kg":0,"itl_rto_additional_half_kg":0,"itl_rto_fsc_per":0,"itl_bill_without_gst":45,"itl_bill_cgst":0,"itl_bill_sgst":0,"itl_bill_igst":8.0999999999999996447286321199499070644378662109375,"itl_bill_with_gst":53.10000000000000142108547152020037174224853515625,
                        "logistic_data":{"id":"1","logistics_name":"Xpressbees","logistics_id":"1","logistics_id_service_type":"1","is_global":"0","priority":"1","pickup_performance_rating":"4.70","delivery_performance_rating":"4.20","ndr_remark_rating":"4.00","weight_cases_rating":"3.50","ontime_rating":"3.45","logistics_rating":"4.10","is_same_day_pickup":"1","delivery_type":"0","fastest_priority":"5","zone_a_priority":"2","zone_b_priority":"3","zone_c_priority":"2","zone_d_priority":"4","zone_e_priority":"2","zone_f_priority":"3","logistics_logo":"","logistics_svg_logo":"xpressbees","check_pull":"1","status":"1","is_deleted":"0"}},
                        },
                        {
                        "fedex":{"itl_half_kg":"65.00","itl_additional_half_kg":0,"itl_fsc_per":0,"itl_dto_charges":0,"itl_cod_charge":0,"itl_rto_half_kg":0,"itl_rto_additional_half_kg":0,"itl_rto_fsc_per":0,"itl_bill_without_gst":65,"itl_bill_cgst":0,"itl_bill_sgst":0,"itl_bill_igst":11.699999999999999289457264239899814128875732421875,"itl_bill_with_gst":76.7000000000000028421709430404007434844970703125,
                        "logistic_data":{"id":"3","logistics_name":"Fedex Priority","logistics_id":"2","logistics_id_service_type":"2_5","is_global":"0","priority":"2","pickup_performance_rating":"4.50","delivery_performance_rating":"4.50","ndr_remark_rating":"4.50","weight_cases_rating":"4.00","ontime_rating":"4.00","logistics_rating":"4.40","is_same_day_pickup":"0","delivery_type":"0","fastest_priority":"4","zone_a_priority":"1","zone_b_priority":"1","zone_c_priority":"1","zone_d_priority":"3","zone_e_priority":"4","zone_f_priority":"5","logistics_logo":"","logistics_svg_logo":"fedex-priority","check_pull":"1","status":"1","is_deleted":"0"}},
                        },
                        {
                        "fedex_ground":{"itl_half_kg":"100","itl_additional_half_kg":0,"itl_fsc_per":0,"itl_dto_charges":0,"itl_cod_charge":0,"itl_rto_half_kg":0,"itl_rto_additional_half_kg":0,"itl_rto_fsc_per":0,"itl_bill_without_gst":100,"itl_bill_cgst":0,"itl_bill_sgst":0,"itl_bill_igst":18,"itl_bill_with_gst":118,
                        "logistic_data":{"id":"4","logistics_name":"Fedex Ground","logistics_id":"2","logistics_id_service_type":"2_6","is_global":"0","priority":"2","pickup_performance_rating":"4.50","delivery_performance_rating":"4.50","ndr_remark_rating":"4.50","weight_cases_rating":"4.00","ontime_rating":"4.00","logistics_rating":"4.40","is_same_day_pickup":"0","delivery_type":"0","fastest_priority":"4","zone_a_priority":"8","zone_b_priority":"8","zone_c_priority":"8","zone_d_priority":"8","zone_e_priority":"8","zone_f_priority":"8","logistics_logo":"","logistics_svg_logo":"fedex-ground","check_pull":"1","status":"1","is_deleted":"0"}},
                        },
                        {
                        "delhivery":{"itl_half_kg":"45.00","itl_additional_half_kg":0,"itl_fsc_per":0,"itl_dto_charges":0,"itl_cod_charge":0,"itl_rto_half_kg":0,"itl_rto_additional_half_kg":0,"itl_rto_fsc_per":0,"itl_bill_without_gst":45,"itl_bill_cgst":0,"itl_bill_sgst":0,"itl_bill_igst":8.0999999999999996447286321199499070644378662109375,"itl_bill_with_gst":53.10000000000000142108547152020037174224853515625,
                        "logistic_data":{"id":"5","logistics_name":"Delhivery","logistics_id":"3","logistics_id_service_type":"3","is_global":"0","priority":"3","pickup_performance_rating":"3.30","delivery_performance_rating":"3.80","ndr_remark_rating":"3.80","weight_cases_rating":"4.50","ontime_rating":"4.70","logistics_rating":"3.90","is_same_day_pickup":"0","delivery_type":"0","fastest_priority":"3","zone_a_priority":"3","zone_b_priority":"2","zone_c_priority":"3","zone_d_priority":"1","zone_e_priority":"3","zone_f_priority":"2","logistics_logo":"","logistics_svg_logo":"delhivery","check_pull":"1","status":"1","is_deleted":"0"}},
                        },
                        {
                        "bluedart":{"itl_half_kg":"45.00","itl_additional_half_kg":0,"itl_fsc_per":0,"itl_dto_charges":0,"itl_cod_charge":0,"itl_rto_half_kg":0,"itl_rto_additional_half_kg":0,"itl_rto_fsc_per":0,"itl_bill_without_gst":45,"itl_bill_cgst":0,"itl_bill_sgst":0,"itl_bill_igst":8.0999999999999996447286321199499070644378662109375,"itl_bill_with_gst":53.10000000000000142108547152020037174224853515625,
                        "logistic_data":{"id":"9","logistics_name":"BlueDart","logistics_id":"7","logistics_id_service_type":"7","is_global":"0","priority":"7","pickup_performance_rating":"4.00","delivery_performance_rating":"4.50","ndr_remark_rating":"4.00","weight_cases_rating":"3.50","ontime_rating":"3.90","logistics_rating":"4.00","is_same_day_pickup":"0","delivery_type":"0","fastest_priority":"6","zone_a_priority":"7","zone_b_priority":"7","zone_c_priority":"6","zone_d_priority":"6","zone_e_priority":"6","zone_f_priority":"6","logistics_logo":"","logistics_svg_logo":"bluedart","check_pull":"1","status":"1","is_deleted":"0"}},
                        },
                        {
                        "shadowfax":{"itl_half_kg":"45.00","itl_additional_half_kg":0,"itl_fsc_per":0,"itl_dto_charges":0,"itl_cod_charge":0,"itl_rto_half_kg":0,"itl_rto_additional_half_kg":0,"itl_rto_fsc_per":0,"itl_bill_without_gst":45,"itl_bill_cgst":0,"itl_bill_sgst":0,"itl_bill_igst":8.0999999999999996447286321199499070644378662109375,"itl_bill_with_gst":53.10000000000000142108547152020037174224853515625,
                        "logistic_data":{"id":"10","logistics_name":"Shadowfax","logistics_id":"8","logistics_id_service_type":"8","is_global":"0","priority":"8","pickup_performance_rating":"3.80","delivery_performance_rating":"4.00","ndr_remark_rating":"4.50","weight_cases_rating":"3.80","ontime_rating":"4.10","logistics_rating":"4.00","is_same_day_pickup":"0","delivery_type":"0","fastest_priority":"7","zone_a_priority":"5","zone_b_priority":"6","zone_c_priority":"7","zone_d_priority":"7","zone_e_priority":"7","zone_f_priority":"7","logistics_logo":"","logistics_svg_logo":"shadowfax","check_pull":"1","status":"1","is_deleted":"0"}},
                        },
                        {
                        "ekart":{"itl_half_kg":"55.00","itl_additional_half_kg":0,"itl_fsc_per":0,"itl_dto_charges":0,"itl_cod_charge":0,"itl_rto_half_kg":0,"itl_rto_additional_half_kg":0,"itl_rto_fsc_per":0,"itl_bill_without_gst":55,"itl_bill_cgst":0,"itl_bill_sgst":0,"itl_bill_igst":9.9000000000000003552713678800500929355621337890625,"itl_bill_with_gst":64.900000000000005684341886080801486968994140625,
                        "logistic_data":{"id":"8","logistics_name":"Ekart","logistics_id":"6","logistics_id_service_type":"6","is_global":"0","priority":"6","pickup_performance_rating":"3.90","delivery_performance_rating":"4.00","ndr_remark_rating":"4.00","weight_cases_rating":"4.50","ontime_rating":"4.35","logistics_rating":"4.10","is_same_day_pickup":"1","delivery_type":"0","fastest_priority":"1","zone_a_priority":"4","zone_b_priority":"5","zone_c_priority":"4","zone_d_priority":"5","zone_e_priority":"5","zone_f_priority":"4","logistics_logo":"","logistics_svg_logo":"ekart","check_pull":"1","status":"1","is_deleted":"0"}},
                        },
                        {
                        "ecom":{"itl_half_kg":"50.00","itl_additional_half_kg":0,"itl_fsc_per":15,"itl_dto_charges":0,"itl_cod_charge":0,"itl_rto_half_kg":0,"itl_rto_additional_half_kg":0,"itl_rto_fsc_per":0,"itl_bill_without_gst":65,"itl_bill_cgst":0,"itl_bill_sgst":0,"itl_bill_igst":11.699999999999999289457264239899814128875732421875,"itl_bill_with_gst":76.7000000000000028421709430404007434844970703125,
                        "logistic_data":{"id":"7","logistics_name":"Ecom Express","logistics_id":"5","logistics_id_service_type":"5","is_global":"0","priority":"5","pickup_performance_rating":"4.30","delivery_performance_rating":"3.50","ndr_remark_rating":"3.50","weight_cases_rating":"4.00","ontime_rating":"3.50","logistics_rating":"3.80","is_same_day_pickup":"0","delivery_type":"0","fastest_priority":"2","zone_a_priority":"6","zone_b_priority":"4","zone_c_priority":"5","zone_d_priority":"2","zone_e_priority":"1","zone_f_priority":"1","logistics_logo":"","logistics_svg_logo":"ecomexpress","check_pull":"1","status":"1","is_deleted":"0"}}
                        }
                    ],
                    "zone":{"all_zone":"B","ecom_zone":"B-ROS"},"status":"success"
                }]
                        
                
            });
            return; 
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
exports.add_edit_pickup_address = async (req, res, next) => 
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
            viewOrder.add_edit_pickup_address(form_data, req, res, next);
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
exports.delete_pickup_address = async (req, res, next) => 
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
            viewOrder.delete_pickup_address(form_data, req, res, next);
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
            viewOrder.get_current_balance(form_data, req, res, next);
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