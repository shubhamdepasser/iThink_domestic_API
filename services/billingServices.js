const validator = require('validator');
const bcrypt = require('bcryptjs');
var express = require('express');
var mysqlpool = require('../dbconfig');
const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');
const billing = require('../models/billingModel');
var session = require('express-session');
const app = express();
const md5 = require('md5');
const date = require('date-and-time');
var randomize = require('randomatic');
var decode = require('decode-html');
const nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var sendMail = require('../method/sendMail');
var function_itl = require('../method/fun_itl');
var htmlspecialchars = require('htmlspecialchars');
var currencyFormatter = require('currency-formatter');
var empty = require('is-empty');
const { ToWords } = require('to-words');
const { json } = require('body-parser');
const toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
      currency: false,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
    }
  });

exports.get_widget_remittance = async function(form_data, req, res, next) 
{  
    var userdata = [];
    var base_url_images = "https://manage-cdn.ithinklogistics.com/manage/theme2/assets/images/";
    var reset_flag                         = htmlspecialchars(form_data.reset_flag);
    var search_remittance_id               = htmlspecialchars(form_data.search_remittance_id);
    var search_awb_no                      = htmlspecialchars(form_data.search_awb_no);
    var search_from_remittance_amount      = htmlspecialchars(form_data.search_from_remittance_amount);
    var search_to_remittance_amount        = htmlspecialchars(form_data.search_to_remittance_amount);
    var search_from_bill_deduct_amount     = htmlspecialchars(form_data.search_from_bill_deduct_amount);
    var search_to_bill_deduct_amount       = htmlspecialchars(form_data.search_to_bill_deduct_amount);
    var search_from_refund_amount          = htmlspecialchars(form_data.search_from_refund_amount);
    var search_to_refund_amount            = htmlspecialchars(form_data.search_to_refund_amount);
    var search_from_early_cod_amount       = htmlspecialchars(form_data.search_from_early_cod_amount);
    var search_to_early_cod_amount         = htmlspecialchars(form_data.search_to_early_cod_amount);
    var search_from_wallet_transfer_amount = htmlspecialchars(form_data.search_from_wallet_transfer_amount);
    var search_to_wallet_transfer_amount   = htmlspecialchars(form_data.search_to_wallet_transfer_amount);
    
    var search_from_advance_hold_amount    = htmlspecialchars(form_data.search_from_advance_hold_amount);
    var search_to_advance_hold_amount      = htmlspecialchars(form_data.search_to_advance_hold_amount);
    var search_from_rem_amount_processed   = htmlspecialchars(form_data.search_from_rem_amount_processed);
    var search_to_rem_amount_processed     = htmlspecialchars(form_data.search_to_rem_amount_processed);
    var search_vendor_name_checkbox_value  = form_data.search_vendor_name_checkbox_value;
    var search_status_checkbox_value       = form_data.search_status_checkbox_value;
    var search_date                        = htmlspecialchars(form_data.search_date);
    var user_id = form_data.id;
    if(reset_flag == '1')
    {
        search_remittance_id               = '';
        search_awb_no                      = '';
        search_from_remittance_amount      = '';
        search_to_remittance_amount        = '';
        search_from_bill_deduct_amount     = '';
        search_to_bill_deduct_amount       = '';
        search_from_refund_amount          = '';
        search_to_refund_amount            = '';
        search_from_early_cod_amount       = '';
        search_to_early_cod_amount         = '';
        search_from_wallet_transfer_amount = '';
        search_to_wallet_transfer_amount   = '';
        
        search_from_advance_hold_amount    = '';
        search_to_advance_hold_amount      = '';
        search_from_rem_amount_processed   = '';
        search_to_rem_amount_processed     = '';
        search_vendor_name_checkbox_value  = [];
        search_status_checkbox_value       = [];
        search_date                        = htmlspecialchars(form_data.search_date);
    }
    var remittance_id_list = '';
    var awb_numbers= '';
    if (search_awb_no != '')
    {
        var custom_remittance_id_filter = '';
        awb_numbers = Array.from(new Set(search_awb_no.split(/(\s+)/)));//re idndex keys
        var search_value_list    = awb_numbers.join("','");
        custom_remittance_id_filter += " status='1' and is_deleted='0' and (airway_bill_no IN ('"+search_value_list+"') or order_no IN ('"+search_value_list+"'))";

        var get_remittance_id_query   = "select itl_remittance_id from order_management where "+custom_remittance_id_filter;
        
        var get_remittance_id_array = JSON.parse(await billing.commonSelectQuery(get_remittance_id_query));
        //console.log(get_remittance_id_array);
        if(get_remittance_id_array.length > 0)
        {
            remittance_id_list = get_remittance_id_array.join("','");

        }
        
    }
    var custom_filter = '';
    if(remittance_id_list != '')
    {
        custom_filter = `r1.is_deleted = 0 and r1.id IN (` +remittance_id_list +`) `;
    }
    else
    {
        custom_filter = `r1.is_deleted = 0`;
    }
    var custom_search_filter = '';
    var custom_search_filter1 = '';

    
    var search_vendor_id_checkbox = '';
    if (search_vendor_name_checkbox_value.length > 0)
    {
        //search_vendor_id_checkbox = implode(',',search_vendor_name_checkbox_value);
        search_vendor_name_checkbox_value.forEach(search_vendor_name_value => search_vendor_id_checkbox += search_vendor_name_value);
        
        if(search_vendor_id_checkbox.length > 1)
        {
            search_vendor_id_checkbox = search_vendor_id_checkbox.substr(0, -1);
        }
    }
    else
    {
        search_vendor_id_checkbox = ``;
    }
    var custom_awb_no_filter = ``;
    custom_search_filter += ` and (r1.rem_in_amount > 0 or r1.rem_out_amount > 0 or r1.rem_amount_processed > 0)`;
         
    if (search_vendor_id_checkbox != '')
    {
        custom_search_filter += ` and r1.user_id IN (` +search_vendor_id_checkbox + `) and r1.rem_out_amount > 0`;
        custom_search_filter1 += ` and r1.user_id IN (` + search_vendor_id_checkbox + `)`;
    }
    else 
    {
        custom_search_filter += ` and r1.user_id IN (` + user_id + `) and r1.rem_out_amount > 0`;
        custom_search_filter1 += ` and r1.user_id IN (` + user_id + `)`;
    }
    var is_show_other_cards = 1;
    
    var last_monday_date = new Date();
    last_monday_date.setDate(last_monday_date.getDate() - (last_monday_date.getDay() + 6) % 7);
    
    var last_7_days_date = new Date();
    last_7_days_date.setDate(last_7_days_date.getDate() - 7);
    var custom_filter1     = " ";
    var custom_filter2     = " ";
    if (search_remittance_id != '')
    {
        custom_filter2 += "  and r1.remittance_id = '" +search_remittance_id + "'";
    }
    var get_total_amount_query = `SELECT 
            (SELECT sum(r1.rem_out_amount) from remittance r1 WHERE `+custom_filter + custom_search_filter + custom_filter1+custom_filter2+`) as total_cod_remitted1,
            (SELECT sum(r1.rem_out_amount) from remittance r1 WHERE `+custom_filter + custom_search_filter + custom_filter2+`) as total_cod_remitted2,
            (SELECT sum(r1.rem_out_amount) from remittance r1 WHERE `+custom_filter + custom_search_filter+custom_filter2+`) as total_cod_remitted,
            (SELECT sum(r1.rem_amount_processed) from remittance r1 WHERE `+ custom_filter + custom_search_filter + custom_filter1+custom_filter2+`) as total_last_cod_remitted1,
            (SELECT sum(r1.rem_amount_processed) from remittance r1 WHERE `+custom_filter + custom_search_filter + custom_filter2+`) as total_last_cod_remitted2,
            (SELECT sum(r1.rem_amount_processed) from remittance r1 WHERE `+custom_filter + custom_search_filter+custom_filter2+`) as total_last_cod_remitted,
            (SELECT sum(r1.bill_deduct_amount) from remittance r1 WHERE `+custom_filter + custom_search_filter + custom_filter1+custom_filter2+`) as total_cod_adjusted1,
            (SELECT sum(r1.bill_deduct_amount) from remittance r1 WHERE `+custom_filter + custom_search_filter + custom_filter2+`) as total_cod_adjusted2,
            (SELECT sum(r1.bill_deduct_amount) from remittance r1 WHERE `+custom_filter + custom_search_filter+custom_filter2+`) as total_cod_adjusted,
            (SELECT sum(r1.rem_amount_processed) from remittance r1 WHERE `+custom_filter + custom_search_filter+custom_filter2+`) as total_remitted,
            (SELECT sum(r1.rem_amount_processed) from remittance r1 WHERE `+custom_filter + custom_search_filter + custom_filter1+custom_filter2+`) as total_remitted1,
            (SELECT sum(r1.rem_amount_processed) from remittance r1 WHERE `+ custom_filter + custom_search_filter + custom_filter2+`) as total_remitted2,
            (SELECT sum((r1.rem_out_amount - (r1.rem_amount_processed + r1.bill_deduct_amount + r1.refund_amount+ r1.early_cod_charges+ r1.transferred_wallet_amount))) from remittance r1 WHERE `+custom_filter+custom_search_filter+custom_filter2+`) as total_advanced_hold_amount,
            (SELECT sum((r1.rem_out_amount - (r1.rem_amount_processed + r1.bill_deduct_amount + r1.refund_amount+ r1.early_cod_charges+ r1.transferred_wallet_amount))) from remittance r1 WHERE `+custom_filter+custom_search_filter + custom_filter1+custom_filter2+`) as total_advanced_hold_amount1,
            (SELECT sum((r1.rem_out_amount - (r1.rem_amount_processed + r1.bill_deduct_amount + r1.refund_amount+ r1.early_cod_charges+ r1.transferred_wallet_amount))) from remittance r1 WHERE `+custom_filter + custom_search_filter + custom_filter2+`) as total_advanced_hold_amount2,
            (SELECT sum(r1.refund_amount) from remittance r1 WHERE `+ custom_filter + custom_search_filter + custom_filter1+custom_filter2+`) as total_refund_amount1,
            (SELECT sum(r1.refund_amount) from remittance r1 WHERE `+custom_filter + custom_search_filter + custom_filter2+`) as total_refund_amount2,
            (SELECT sum(r1.refund_amount) from remittance r1 WHERE `+custom_filter + custom_search_filter+custom_filter2+`) as total_refund_amount,
            (SELECT sum(r1.early_cod_charges) from remittance r1 WHERE `+custom_filter + custom_search_filter+custom_filter2+`) as total_early_cod_charges,
            (SELECT sum(r1.transferred_wallet_amount) from remittance r1 WHERE `+custom_filter + custom_search_filter+custom_filter2+`) as total_transferred_wallet_amount
            FROM remittance r limit 1`;
        //console.log(get_total_amount_query);
        var get_total_amount_array = await billing.commonSelectQuery(get_total_amount_query);
        //console.log(get_total_amount_array);
        var all_total_amount_data_array = []
        for (const total_amount_array of get_total_amount_array) 
        {
            //all_total_amount_data_array = total_amount_array;
        }
        all_total_amount_data_array = JSON.parse(get_total_amount_array);
        var get_query = `select (r1.rem_out_amount-(r1.bill_deduct_amount + r1.rem_amount_processed + r1.refund_amount + r1.early_cod_charges+ r1.transferred_wallet_amount)) as total_advanced_hold_amount from remittance r1 left join user u on r1.user_id=u.id where `+custom_filter + custom_search_filter;
        var result_get_query = await billing.commonSelectQuery(get_query);
        console.log(get_total_amount_array);
        var all_row_data_array = [];
        for (const get_query of result_get_query) 
        {
            //console.log(get_query)
            //all_row_data_array=get_query;
        };
        all_row_data_array = JSON.parse(result_get_query);
        //console.log(all_row_data_array);
        var total_last_week_advanced_hold_amount = 0;
        var total_last_to_last_week_advanced_hold_amount = 0;
        var total_advanced_hold_amount = 0;
        if(all_row_data_array.length > 0)
        {
            for (const all_row_data of all_row_data_array) 
        
            {
                console.log(all_row_data.total_advanced_hold_amount);
                if((all_row_data.total_advanced_hold_amount) == null)
                {
                    total_last_week_advanced_hold_amount += 0;
                }
                else
                {
                    total_last_week_advanced_hold_amount += (all_row_data.total_advanced_hold_amount);
                }
                if((all_row_data.total_advanced_hold_amount) == null)
                {
                    total_last_to_last_week_advanced_hold_amount += 0;
                }
                else
                {
                    total_last_to_last_week_advanced_hold_amount += (all_row_data.total_advanced_hold_amount);
                }
                if((all_row_data.total_advanced_hold_amount) == null)
                {
                    total_advanced_hold_amount += 0;
                }
                else
                {
                    total_advanced_hold_amount += (all_row_data.total_advanced_hold_amount);
                }
            }
        }
        else
        {
            total_last_week_advanced_hold_amount = 0;
            total_last_to_last_week_advanced_hold_amount = 0;
            total_advanced_hold_amount = 0;
        }
        console.log(total_last_week_advanced_hold_amount);
        console.log(total_last_to_last_week_advanced_hold_amount);
        console.log(total_advanced_hold_amount);
        var total_last_week_cod_remitted = 0;
        var total_last_to_last_week_cod_remitted = 0;
        var total_cod_remitted = 0;
        var total_last_week_cod_remitted1 = 0;
        var total_last_to_last_week_cod_remitted1= 0;
        var total_last_cod_remitted = 0;
        var total_last_week_cod_adjusted = 0;
        var total_last_to_last_week_cod_adjusted = 0;
        var total_cod_adjusted = 0;
        var total_last_week_remitted = 0;
        var total_last_to_last_week_remitted = 0;
        var total_remitted = 0;
        var total_last_week_refund_amount = 0;
        var total_last_to_last_week_refund_amount = 0;
        var total_refund_amount = 0;
        var total_early_cod_charges = 0;
        var total_transferred_wallet_amount = 0;
        if(all_total_amount_data_array.length > 0)
        {
            total_last_week_cod_remitted = (all_total_amount_data_array[0]['total_cod_remitted1']);
            if(total_last_week_cod_remitted == null)
            {
                total_last_week_cod_remitted = 0;
            }
            total_last_to_last_week_cod_remitted = (all_total_amount_data_array[0]['total_cod_remitted2']);
            if(total_last_to_last_week_cod_remitted == null)
            {
                total_last_to_last_week_cod_remitted = 0;
            }
            total_cod_remitted = (all_total_amount_data_array[0]['total_cod_remitted']);
            if(total_cod_remitted == null)
            {
                total_cod_remitted = 0;
            }
            total_last_week_cod_remitted1 = (all_total_amount_data_array[0]['total_last_cod_remitted1']);
            if(total_last_week_cod_remitted1 == null)
            {
                total_last_week_cod_remitted1 = 0;
            }
            total_last_to_last_week_cod_remitted1 = (all_total_amount_data_array[0]['total_last_cod_remitted2']);
            if(total_last_to_last_week_cod_remitted1 == null)
            {
                total_last_to_last_week_cod_remitted1 = 0;
            }
            total_last_cod_remitted = (all_total_amount_data_array[0]['total_last_cod_remitted']);
            if(total_last_cod_remitted == null)
            {
                total_last_cod_remitted = 0;
            }
            total_last_week_cod_adjusted = (all_total_amount_data_array[0]['total_cod_adjusted1']);
            if(total_last_week_cod_adjusted == null)
            {
                total_last_week_cod_adjusted = 0;
            }
            total_last_to_last_week_cod_adjusted = (all_total_amount_data_array[0]['total_cod_adjusted2']);
            if(total_last_to_last_week_cod_adjusted == null)
            {
                total_last_to_last_week_cod_adjusted = 0;
            }
            total_cod_adjusted = (all_total_amount_data_array[0]['total_cod_adjusted']);
            if(total_cod_adjusted == null)
            {
                total_cod_adjusted = 0;
            }
            total_last_week_remitted = (all_total_amount_data_array[0]['total_remitted1']);
            if(total_last_week_remitted == null)
            {
                total_last_week_remitted = 0;
            }
            total_last_to_last_week_remitted = (all_total_amount_data_array[0]['total_remitted2']);
            if(total_last_to_last_week_remitted == null)
            {
                total_last_to_last_week_remitted = 0;
            }
            total_remitted = (all_total_amount_data_array[0]['total_remitted']);
            if(total_remitted == null)
            {
                total_remitted = 0;
            }
            total_last_week_refund_amount = (all_total_amount_data_array[0]['total_refund_amount1']);
            if(total_last_week_refund_amount == null)
            {
                total_last_week_refund_amount = 0;
            }
            total_last_to_last_week_refund_amount = (all_total_amount_data_array[0]['total_refund_amount2']);
            if(total_last_to_last_week_refund_amount == null)
            {
                total_last_to_last_week_refund_amount = 0;
            }
            total_refund_amount = (all_total_amount_data_array[0]['total_refund_amount']);
            if(total_refund_amount == null)
            {
                total_refund_amount = 0;
            }
            
            total_early_cod_charges = (all_total_amount_data_array[0]['total_early_cod_charges']);
            if(total_early_cod_charges == null)
            {
                total_early_cod_charges = 0;
            }
            
            total_transferred_wallet_amount = (all_total_amount_data_array[0]['total_transferred_wallet_amount']);
            if(total_transferred_wallet_amount == null)
            {
                total_transferred_wallet_amount = 0;
            }
            
        }
        else
        {
            total_last_week_cod_remitted = 0;
            total_last_to_last_week_cod_remitted = 0;
            total_cod_remitted = 0;
            total_last_week_cod_remitted1 = 0;
            total_last_to_last_week_cod_remitted1= 0;
            total_last_cod_remitted = 0;
            total_last_week_cod_adjusted = 0;
            total_last_to_last_week_cod_adjusted = 0;
            total_cod_adjusted = 0;
            total_last_week_remitted = 0;
            total_last_to_last_week_remitted = 0;
            total_remitted = 0;
            total_last_week_refund_amount = 0;
            total_last_to_last_week_refund_amount = 0;
            total_refund_amount = 0;
            total_early_cod_charges = 0;
            total_transferred_wallet_amount = 0;
        }

        var difference_cod_remitted = total_last_week_cod_remitted - total_last_to_last_week_cod_remitted;
        var rate_of_change_cod_remitted_text = '';

        var return_array = {};
        if(difference_cod_remitted > 0)
        {
            rate_of_change_cod_remitted_text = 'INCREASE';
            return_array["card1_rate_change"] = '<img src="'+ base_url_images+ 'angle-double-up.svg">';
        }
        else if(difference_cod_remitted < 0)
        {
            rate_of_change_cod_remitted_text = 'DECREASE';
            return_array["card1_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
        }
        else
        {
            rate_of_change_cod_remitted_text = 'DECREASE';
            return_array["card1_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
        }

        if(difference_cod_remitted == 0)
        {
            rate_of_change_cod_remitted = 0;
        }
        else if(total_last_to_last_week_cod_remitted == 0)
        {
            rate_of_change_cod_remitted = 0;
        }
        else
        {
            rate_of_change_cod_remitted = ((difference_cod_remitted * 100) / total_last_to_last_week_cod_remitted);
        }
        var total_cod_remitted1 = currencyFormatter.format(Math.round(total_cod_remitted,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' }, });
        total_cod_remitted1 = total_cod_remitted1.substr(0, total_cod_remitted1.indexOf("."));
        return_array["card1_Title"] = 'Total COD Generated'; 
        return_array["card1_amount"] = total_cod_remitted1;
        return_array["card1_subTitle"] = "";
        return_array["card1_percentage"] = rate_of_change_cod_remitted+'% '+ rate_of_change_cod_remitted_text;
    // End Total COD Remitted
    
    // Start Total COD UnRemitted
        //console.log("sencond");
        var get_total_amount_query2 = `SELECT 
            (SELECT sum(r1.netpayment) from order_management r1 WHERE `+custom_filter +custom_search_filter1 +custom_filter1+` and CAST(created_date as DATE)  >= '2020-06-01' and r1.remittance_out = 0 and r1.is_manual_delivered = '1' and lower(r1.order_type)='cod') as total_cod_unremitted1,
            (SELECT sum(r1.netpayment) from order_management r1 WHERE `+custom_filter +custom_search_filter1 +` and CAST(created_date as DATE)  >= '2020-06-01' and r1.remittance_out = 0 and r1.is_manual_delivered = '1' and lower(r1.order_type)='cod') as total_cod_unremitte2,
            (SELECT sum(r1.netpayment) from order_management r1 WHERE `+custom_filter +custom_search_filter1+` and CAST(created_date as DATE)  >= '2020-06-01' and r1.remittance_out = 0 and r1.is_manual_delivered = '1' and lower(r1.order_type)='cod') as total_cod_unremitted
            FROM order_management r limit 1`;

        var result_get_total_amount_query = await billing.commonSelectQuery(get_total_amount_query2);
       // console.log(get_total_amount_query2);
        var all_total_amount_data_array2 = []
        for (const total_amount_array of result_get_total_amount_query) 
        {
            //all_total_amount_data_array2 = total_amount_array;
        }
        all_total_amount_data_array2 = JSON.parse(result_get_total_amount_query);
        var total_last_week_cod_unremitted = '';
        var total_last_to_last_week_cod_unremitted = '';
        var total_cod_unremitted = '';
        if(all_total_amount_data_array2.length>0)
        {
            total_last_week_cod_unremitted = (all_total_amount_data_array2[0]['total_cod_unremitted1']);
            if(total_last_week_cod_unremitted == null)
            {
                total_last_week_cod_unremitted = 0;
            }
            total_last_to_last_week_cod_unremitted = (all_total_amount_data_array2[0]['total_cod_unremitted2']);
            if(total_last_to_last_week_cod_unremitted == null)
            {
                total_last_to_last_week_cod_unremitted = 0;
            }
            total_cod_unremitted = (all_total_amount_data_array2[0]['total_cod_unremitted']);
            if(total_cod_unremitted == null)
            {
                total_cod_unremitted = 0;
            }
        }
        else
        {
            total_last_week_cod_unremitted = 0;
            total_last_to_last_week_cod_unremitted = 0;
            total_cod_unremitted = 0;
        }

        var difference_cod_unremitted = total_last_week_cod_unremitted - total_last_to_last_week_cod_unremitted;
        var rate_of_change_cod_remitted_text = '';
        if(difference_cod_unremitted > 0)
        {
            rate_of_change_cod_unremitted_text = 'INCREASE';
            return_array["card2_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
        }
        else if(difference_cod_unremitted < 0)
        {
            rate_of_change_cod_remitted_text = 'DECREASE';
            return_array["card2_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
        }
        else
        {
            rate_of_change_cod_unremitted_text = 'DECREASE';
            return_array["card2_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
        }
        var rate_of_change_cod_unremitted = 0;
        if(difference_cod_unremitted == 0)
        {
            rate_of_change_cod_unremitted = 0;
        }
        else if(total_last_to_last_week_cod_unremitted == 0)
        {
            rate_of_change_cod_unremitted = 0;
        }
        else
        {
            rate_of_change_cod_unremitted = ((difference_cod_unremitted * 100) / total_last_to_last_week_cod_unremitted);
        }
        
        
        var total_cod_unremitted1 = currencyFormatter.format(Math.round(total_cod_unremitted,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
        
        total_cod_unremitted1 = total_cod_unremitted1.substr(0, total_cod_unremitted1.indexOf("."));
        
        return_array["card8_Title"] = 'Unremitted COD'; 
        return_array["card8_amount"] = total_cod_unremitted1;
        return_array["card8_percentage"] = rate_of_change_cod_unremitted+'% '+rate_of_change_cod_unremitted_text;
        return_array["card8_subTitle"] = "(Updated in 24 hrs)";

        return_array["card9_Title"] = 'Next Remittance';
        return_array["card9_amount"] = "Coming Soon";
        return_array["card9_subTitle"] = "";

        


        // Start Total COD Adjusted

        var difference_cod_adjusted = total_last_week_cod_adjusted - total_last_to_last_week_cod_adjusted;

        if(difference_cod_adjusted > 0)
        {
            rate_of_change_cod_adjusted_text = 'INCREASE';
            return_array["card4_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
        }
        else if(difference_cod_adjusted < 0)
        {
            rate_of_change_cod_adjusted_text = 'DECREASE';
            return_array["card4_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
        }
        else
        {
            rate_of_change_cod_adjusted_text = 'DECREASE';
            return_array["card4_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
        }

        if(difference_cod_adjusted == 0)
        {
            rate_of_change_cod_adjusted = 0;
        }
        else if(total_last_to_last_week_cod_adjusted == 0)
        {
            rate_of_change_cod_adjusted = 0;
        }
        else
        {
            rate_of_change_cod_adjusted = ((difference_cod_adjusted * 100) / total_last_to_last_week_cod_adjusted);
        }
        var total_cod_adjusted1 = currencyFormatter.format(Math.round(total_cod_adjusted,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
        total_cod_adjusted1 = total_cod_adjusted1.substr(0, total_cod_adjusted1.indexOf("."));
        return_array["card2_amount"] = total_cod_adjusted1;
        return_array["card2_percentage"] = rate_of_change_cod_adjusted+'% '+rate_of_change_cod_adjusted_text;
        return_array["card2_Title"] = 'Total Bill Adjusted';
        return_array["card2_subTitle"] = "";
    // End Total COD Adjusted

    // Start Total Remitted
        var difference_remitted = total_last_week_remitted - total_last_to_last_week_remitted;
        var rate_of_change_remitted_text = '';
        if(difference_remitted > 0)
        {
            rate_of_change_remitted_text = 'INCREASE';
            return_array["card5_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
        }
        else if(difference_remitted < 0)
        {
            rate_of_change_remitted_text = 'DECREASE';
            return_array["card5_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
        }
        else
        {
            rate_of_change_remitted_text = 'DECREASE';
            return_array["card5_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
        }
        var rate_of_change_remitted = 0;
        if(difference_remitted == 0)
        {
            rate_of_change_remitted = 0;
        }
        else if(total_last_to_last_week_remitted == 0)
        {
            rate_of_change_remitted = 0;
        }
        else
        {
            rate_of_change_remitted = ((difference_remitted * 100) / total_last_to_last_week_remitted);
        }
        var total_remitted1 = currencyFormatter.format(Math.round(total_remitted,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
        total_remitted1 = total_remitted1.substr(0, total_remitted1.indexOf("."));

        return_array["card5_amount"] = total_remitted1;
        return_array["card5_percentage"] = rate_of_change_remitted+'% '+rate_of_change_remitted_text;
        return_array["card5_Title"] = 'Total COD Remitted'; 
        return_array["card5_subTitle"] = "";
    // End Total Remitted
    // Start Total Refund Remitted

        var difference_refund_amount = total_last_week_refund_amount - total_last_to_last_week_refund_amount;
        var rate_of_change_refund_amount_text = '';
        if(difference_refund_amount > 0)
        {
            rate_of_change_refund_amount_text = 'INCREASE';
            if(is_show_other_cards == 1)
            {
                return_array["card6_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
            }
        }
        else if(difference_refund_amount < 0)
        {
            rate_of_change_refund_amount_text = 'DECREASE';
            if(is_show_other_cards == 1)
            {
                return_array["card6_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
            }
        }
        else
        {
            rate_of_change_refund_amount_text = 'DECREASE';
            if(is_show_other_cards == 1)
            {
                return_array["card6_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
            }
        }
        var rate_of_change_refund_amount = 0;
        if(difference_refund_amount == 0)
        {
            rate_of_change_refund_amount = 0;
        }
        else if(total_last_to_last_week_refund_amount == 0)
        {
            rate_of_change_refund_amount = 0;
        }
        else
        {
            rate_of_change_refund_amount = ((difference_refund_amount * 100) / total_last_to_last_week_refund_amount);
        }
        if(is_show_other_cards == 1)
        {
            var total_refund_amount1 = currencyFormatter.format(Math.round(total_refund_amount,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            total_refund_amount1 = total_refund_amount1.substr(0, total_refund_amount1.indexOf("."));
            return_array["card3_amount"] = total_refund_amount1;
            return_array["card3_percentage"] = rate_of_change_refund_amount+'% '+ rate_of_change_refund_amount_text;
            return_array["card3_Title"] = 'Total Refund Adjusted'; 
            return_array["card3_subTitle"] = "";
        }
        if(is_show_other_cards == 1)
        {
            var total_advanced_hold1 = currencyFormatter.format(Math.round(total_advanced_hold_amount,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            total_advanced_hold1 = total_advanced_hold1.substr(0, total_advanced_hold1.indexOf("."));
             
            return_array["card4_amount"] = total_advanced_hold1;
            return_array["card4_percentage"] = '0% DECREASE';
            return_array["card4_Title"] = 'Total Advanced Hold';
            return_array["card4_subTitle"] = "";
            var total_early_cod_charges1 = currencyFormatter.format(Math.round(total_early_cod_charges,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            total_early_cod_charges1 = total_early_cod_charges1.substr(0, total_early_cod_charges1.indexOf("."));
            
            return_array["card6_amount"] = total_early_cod_charges1;
            return_array["card6_percentage"] = '0% DECREASE';
            return_array["card6_Title"] = 'Early COD'; 
            return_array["card6_subTitle"] = "";
            var total_transferred_wallet_amount1 = currencyFormatter.format(Math.round(total_transferred_wallet_amount,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            total_transferred_wallet_amount1 = total_transferred_wallet_amount1.substr(0, total_transferred_wallet_amount1.indexOf("."));
            
            return_array["card7_amount"] = total_transferred_wallet_amount1;
            return_array["card7_percentage"] = '0% DECREASE';
            return_array["card7_Title"] = 'Wallet Transferred';
            return_array["card7_subTitle"] = ""; 
        }

        
        if(is_show_other_cards == 0)
        {
            var total_cod_adjusted_refund_amount_advanced_hold1 = currencyFormatter.format(Math.round(total_cod_adjusted + total_refund_amount + total_advanced_hold,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            total_cod_adjusted_refund_amount_advanced_hold1 = total_cod_adjusted_refund_amount_advanced_hold1.substr(0, total_cod_adjusted_refund_amount_advanced_hold1.indexOf("."));
            return_array["card2_amount"] = total_cod_adjusted_refund_amount_advanced_hold1;
            return_array["card2_percentage"] = '';
            return_array["card2_Title"] = 'Total Bill Adjusted'; 
            return_array["card2_subTitle"] = "";
        }
        console.log(return_array);
        res.status(200).json({
            status : "success",
            status_code : 200,
            data_array: return_array
        });
        return;
};
   
exports.get_widget_shipping_charge = async function(form_data, req, res, next) 
{  
    var userdata = [];
    var base_url_images = "https://manage-cdn.ithinklogistics.com/manage/theme2/assets/images/";
    var reset_flag                          = htmlspecialchars(form_data.reset_flag);
    var search_invoice_no                   = htmlspecialchars(form_data.search_invoice_no);
    var search_order_no                     = htmlspecialchars(form_data.search_order_no);
    var search_awb_no                       = htmlspecialchars(form_data.search_awb_no);
    var search_from_actual_weight           = htmlspecialchars(form_data.search_from_actual_weight);
    var search_to_actual_weight             = htmlspecialchars(form_data.search_to_actual_weight);
    var search_from_weight_charges          = htmlspecialchars(form_data.search_from_weight_charges);
    var search_to_weight_charges            = htmlspecialchars(form_data.search_to_weight_charges);
    var search_logistics_checkbox_value     = form_data.search_logistics_checkbox_value;
    var search_status_checkbox_value        = form_data.search_status_checkbox_value;
    var search_vendor_name_checkbox_value   = form_data.search_vendor_name_checkbox_value;
    var search_zone_checkbox_value          = form_data.search_zone_checkbox_value;
    var search_date                         = htmlspecialchars(form_data.search_date);
    var search_order_date                   = htmlspecialchars(form_data.search_order_date);
    var user_id                             = form_data.id;
    if(reset_flag == '1')
    {
        search_invoice_no                   = '';
        search_order_no                     = '';
        search_awb_no                       = '';
        search_from_actual_weight           = '';
        search_to_actual_weight             = '';
        search_from_weight_charges          = '';
        search_to_weight_charges            = '';
        search_logistics_checkbox_value     = [];
        search_status_checkbox_value        = [];
        search_vendor_name_checkbox_value   = [];
        search_zone_checkbox_value          = [];
        search_order_date                   = '';
        search_date                         = htmlspecialchars(form_data.search_date);
    }
    var search_vendor_id_checkbox = '';
    
    if (search_vendor_name_checkbox_value.length>0)
    {
        //search_vendor_id_checkbox = implode(',',search_vendor_name_checkbox_value);
        search_vendor_name_checkbox_value.forEach(search_vendor_name_value => search_vendor_id_checkbox += search_vendor_name_value);
        
        if(search_vendor_id_checkbox.length > 1)
        {
            search_vendor_id_checkbox = search_vendor_id_checkbox.substr(0, -1);
        }
        
        if(search_vendor_id_checkbox.length>1)
        {
            search_vendor_id_checkbox = search_vendor_id_checkbox.substr(0, -1);
        }
    }
    else
    {
        search_vendor_id_checkbox = '';
    }
    var custom_filter = "om.is_deleted = 0 and om.invoice_id > 0 ";
    var custom_search_filter = '';
    if (search_vendor_id_checkbox != '')
    {
        custom_search_filter += "  and om.user_id IN (" +search_vendor_id_checkbox + ")";
    }
    else
    {
        custom_search_filter += " and om.user_id ="+user_id;
    }
    
    var get_total_query = `SELECT sum(om.billed_itl_bill_with_gst)  as total_billed,count(om.id) as total_shipments,sum(om.billable_weight_in_kg) as total_weight FROM  order_management_billing om left join order_management temp_om on om.om_row_id=temp_om.id left join user u on om.user_id = u.id left join billing bi on om.invoice_id = bi.id WHERE `+custom_filter +custom_search_filter+` limit 1`;
    var result_get_total_query = JSON.parse(await billing.commonSelectQuery(get_total_query));
    console.log(result_get_total_query);
    var all_total_amount_data_array = [];
    var total_billed 		= 0;
    var total_shipments 	= 0;
    var total_weight 		= 0;
    for (const total_amount of result_get_total_query) 
    {
        //all_total_amount_data_array = total_amount;
        total_billed 		+= total_amount['total_billed'];
        total_shipments 	+= total_amount['total_shipments'];
        total_weight 		+= total_amount['total_weight'];
    }
   	
   	if(total_billed == null)
	{
		total_billed = 0;
	}

	if(total_shipments == null)
	{
		total_shipments = 0;
	}

	if(total_weight == null)
	{
		total_weight = 0;
    }
    
    var return_array = {};
    var total_billed1 = currencyFormatter.format(Math.round(total_billed,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
    total_billed1 = total_billed1.substr(0, total_billed1.indexOf("."));
    return_array["card1_amount"] = total_billed1;
    return_array["card1_Title"] = "Total Freight Charge"; 
    return_array["card1_subTitle"] = "";

    res.status(200).json({
        status : "success",
        status_code : 200,
        data_array: return_array
    });
    return;
};

exports.get_widget_wallet_transactions = async function(form_data, req, res, next) 
{  
    var userdata = [];
    var base_url_images = "https://manage-cdn.ithinklogistics.com/manage/theme2/assets/images/";
    var reset_flag                          = htmlspecialchars(form_data.reset_flag);
    var entry_type_input                    = htmlspecialchars(form_data.entry_type_input);
    var search_transaction_id               = htmlspecialchars(form_data.search_transaction_id);
    var search_from_debit_amount            = htmlspecialchars(form_data.search_from_debit_amount);
    var search_to_debit_amount              = htmlspecialchars(form_data.search_to_debit_amount);
    var search_from_credit_amount           = htmlspecialchars(form_data.search_from_credit_amount);
    var search_to_credit_amount             = htmlspecialchars(form_data.search_to_credit_amount);
    var search_from_balance_amount          = htmlspecialchars(form_data.search_from_balance_amount);
    var search_to_balance_amount            = htmlspecialchars(form_data.search_to_balance_amount);
    var search_vendor_name_checkbox_value   = form_data.search_vendor_name_checkbox_value;
    var search_date                         = htmlspecialchars(form_data.search_date);
    var user_id                             = form_data.id;
    if(reset_flag == '1')
    {
        entry_type_input                    = '';
        search_transaction_id               = '';
        search_from_debit_amount            = '';
        search_to_debit_amount              = '';
        search_from_credit_amount           = '';
        search_to_credit_amount             = '';
        search_from_balance_amount          = '';
        search_to_balance_amount            = '';
        search_vendor_name_checkbox_value   = [];
        search_date                         = htmlspecialchars(form_data.search_date);
    }
    var search_vendor_id_checkbox = '';
    
    if (search_vendor_name_checkbox_value.length>0)
    {
        //search_vendor_id_checkbox = implode(',',search_vendor_name_checkbox_value);
        search_vendor_name_checkbox_value.forEach(search_vendor_name_value => search_vendor_id_checkbox += search_vendor_name_value);
        
        if(search_vendor_id_checkbox.length > 1)
        {
            search_vendor_id_checkbox = search_vendor_id_checkbox.substr(0, -1);
        }
        
        if(search_vendor_id_checkbox.length>1)
        {
            search_vendor_id_checkbox = search_vendor_id_checkbox.substr(0, -1);
        }
    }
    else
    {
        search_vendor_id_checkbox = '';
    }
    var custom_filter = "wt1.is_deleted = 0";
    var custom_search_filter = '';
    if (search_vendor_id_checkbox != '')
    {
        custom_search_filter += "  and wt1.user_id IN (" +search_vendor_id_checkbox + ")";
    }
    else
    {
        custom_search_filter += " and wt1.user_id ="+user_id;
    }
    
    var get_total_query = `SELECT 
    (SELECT sum(wt1.amount) from wallet_transaction_history wt1 WHERE `+custom_filter +custom_search_filter+` and wt1.type='1') as total_credit_amount1,
    (SELECT sum(wt1.amount) from wallet_transaction_history wt1 WHERE `+custom_filter +custom_search_filter+` and wt1.type='1') as total_credit_amount2,
    (SELECT sum(wt1.amount) from wallet_transaction_history wt1 WHERE `+custom_filter +custom_search_filter+` and wt1.type='1') as total_credit_amount,
    (SELECT sum(wt1.amount) from wallet_transaction_history wt1 WHERE `+custom_filter +custom_search_filter+` and wt1.type='2') as total_debit_amount1,
    (SELECT sum(wt1.amount) from wallet_transaction_history wt1 WHERE `+custom_filter +custom_search_filter+` and wt1.type='2') as total_debit_amount2,
    (SELECT sum(wt1.amount) from wallet_transaction_history wt1 WHERE `+custom_filter +custom_search_filter+` and wt1.type='2') as total_debit_amount
    FROM wallet_transaction_history wt limit 1`;
    var result_get_total_query = JSON.parse(await billing.commonSelectQuery(get_total_query));
    console.log(result_get_total_query);
    var all_total_amount_data_array = [];
    
    for (const total_amount of result_get_total_query) 
    {
        all_total_amount_data_array.push(total_amount);
    }
    var total_last_week_credit_amount = 0;
    var total_last_to_last_week_credit_amount = 0;
    var total_credit_amount = 0;
    var total_last_week_debit_amount = 0;
    var total_last_to_last_week_debit_amount = 0;
    var total_debit_amount = 0;
    if(all_total_amount_data_array.length>0)
    {
    	total_last_week_credit_amount = all_total_amount_data_array[0]['total_credit_amount1'];
    	if(total_last_week_credit_amount == null)
    	{
    		total_last_week_credit_amount = 0;
    	}
    	total_last_to_last_week_credit_amount = all_total_amount_data_array[0]['total_credit_amount'];
    	if(total_last_to_last_week_credit_amount == null)
    	{
    		total_last_to_last_week_credit_amount = 0;
    	}
    	total_credit_amount = all_total_amount_data_array[0]['total_credit_amount'];
    	if(total_credit_amount == null)
    	{
    		total_credit_amount = 0;
    	}
    	total_last_week_debit_amount = all_total_amount_data_array[0]['total_debit_amount1'];
    	if(total_last_week_debit_amount == null)
    	{
    		total_last_week_debit_amount = 0;
    	}
    	total_last_to_last_week_debit_amount = all_total_amount_data_array[0]['total_debit_amount2'];
    	if(total_last_to_last_week_debit_amount == null)
    	{
    		total_last_to_last_week_debit_amount = 0;
    	}
    	total_debit_amount = all_total_amount_data_array[0]['total_debit_amount'];
    	if(total_debit_amount == null)
    	{
    		total_debit_amount = 0;
    	}
    }
    else
    {
    	total_last_week_credit_amount = 0;
    	total_last_to_last_week_credit_amount = 0;
    	total_credit_amount = 0;
    	total_last_week_debit_amount = 0;
    	total_last_to_last_week_debit_amount = 0;
    	total_debit_amount = 0;
    }

    var return_array = {};

    if(entry_type_input == 'credit')
    {
        total_last_week_debit_amount = 0;
        total_last_to_last_week_debit_amount = 0;
        total_debit_amount = 0;
    }
    if(entry_type_input == 'debit')
    {
        total_last_week_credit_amount = 0;
        total_last_to_last_week_credit_amount = 0;
        total_credit_amount = 0;
    }

    var difference_credit_amount = total_last_week_credit_amount - total_last_to_last_week_credit_amount;
    var difference_debit_amount = 0;
    if(entry_type_input == 'credit')
    {
        difference_debit_amount = 0;
    }
    if(entry_type_input == 'debit')
    {
        difference_credit_amount = 0;
    }
    var rate_of_change_credit_amount_text = "";
    if(difference_credit_amount > 0)
    {
    	rate_of_change_credit_amount_text = 'INCREASE';
    	return_array["card1_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
    }
    else if(difference_credit_amount < 0)
    {
    	rate_of_change_credit_amount_text = 'DECREASE';
    	return_array["card1_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    else
    {
    	rate_of_change_credit_amount_text = 'DECREASE';
    	return_array["card1_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    var rate_of_change_credit_amount = 0;
    if(difference_credit_amount == 0)
    {
    	rate_of_change_credit_amount = 0;
    }
    else if(total_last_to_last_week_credit_amount == 0)
    {
    	rate_of_change_credit_amount = 0;
    }
    else
    {
    	rate_of_change_credit_amount = ((difference_credit_amount * 100) / total_last_to_last_week_credit_amount);
    }
    var rate_of_change_credit_amount = 0;
    var rate_of_change_debit_amount = 0;
    if(entry_type_input == 'credit')
    {
        rate_of_change_debit_amount = 0;
        total_debit_amount = 0;
    }
    if(entry_type_input == 'debit')
    {
        rate_of_change_credit_amount = 0;
        total_credit_amount = 0;
    }

    var card1_amount = currencyFormatter.format(Math.round(total_credit_amount,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
    return_array["card1_amount"] = card1_amount.substr(0, card1_amount.indexOf("."));
    return_array["card1_percentage"] = rate_of_change_credit_amount+'% '+rate_of_change_credit_amount_text;
    return_array["card1_Title"] = 'Wallet Recharge'; 
    return_array["card1_subTitle"] = "";
    difference_debit_amount = total_last_week_debit_amount - total_last_to_last_week_debit_amount;

    if(difference_debit_amount > 0)
    {
    	rate_of_change_debit_amount_text = 'INCREASE';
    	return_array["card2_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
    }
    else if(difference_debit_amount < 0)
    {
    	rate_of_change_debit_amount_text = 'DECREASE';
    	return_array["card2_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    else
    {
    	rate_of_change_debit_amount_text = 'DECREASE';
    	return_array["card2_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }

    if(difference_debit_amount == 0)
    {
    	rate_of_change_debit_amount = 0;
    }
    else if(total_last_to_last_week_debit_amount == 0)
    {
    	rate_of_change_debit_amount = 0;
    }
    else
    {
    	rate_of_change_debit_amount = ((difference_debit_amount * 100) / total_last_to_last_week_debit_amount);
    }

    var card2_amount = currencyFormatter.format(Math.round(total_debit_amount,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
    return_array["card2_amount"] = card2_amount.substr(0, card2_amount.indexOf("."));
    return_array["card2_percentage"] = rate_of_change_debit_amount+'% '+rate_of_change_debit_amount_text;
    return_array["card2_Title"] = 'Wallet Deducted'; 
    return_array["card2_subTitle"] = "";
    res.status(200).json({
        status : "success",
        status_code : 200,
        data_array: return_array
    });
    return;
};

exports.get_widget_bill_summary = async function(form_data, req, res, next) 
{  
    var userdata = [];
    var base_url_images = "https://manage-cdn.ithinklogistics.com/manage/theme2/assets/images/";
    var reset_flag                          = htmlspecialchars(form_data.reset_flag);
    var search_invoice_code                 = htmlspecialchars(form_data.search_invoice_code);
    var search_airway_bill_no                       = htmlspecialchars(form_data.search_awb_no);
    var search_from_payable_invoice_amount  = htmlspecialchars(form_data.search_from_payable_invoice_amount);
    var search_to_payable_invoice_amount    = htmlspecialchars(form_data.search_to_payable_invoice_amount);
    var search_from_remittance_amount       = htmlspecialchars(form_data.search_from_remittance_amount);
    var search_to_remittance_amount         = htmlspecialchars(form_data.search_to_remittance_amount);
    var search_from_credit_amount           = htmlspecialchars(form_data.search_from_credit_amount);
    var search_to_credit_amount             = htmlspecialchars(form_data.search_to_credit_amount);
    var search_from_tds_amount              = htmlspecialchars(form_data.search_from_tds_amount);
    var search_to_tds_amount                = htmlspecialchars(form_data.search_to_tds_amount);
    var search_from_wallet_amount           = htmlspecialchars(form_data.search_from_wallet_amount);
    var search_to_wallet_amount             = htmlspecialchars(form_data.search_to_wallet_amount);
    var search_from_paid_amount             = htmlspecialchars(form_data.search_from_paid_amount);
    var search_to_paid_amount               = htmlspecialchars(form_data.search_to_paid_amount);
    var search_from_amount_received         = htmlspecialchars(form_data.search_from_amount_received);
    var search_to_amount_received           = htmlspecialchars(form_data.search_to_amount_received);
    var search_from_outstanding_amount      = htmlspecialchars(form_data.search_from_outstanding_amount);
    var search_to_outstanding_amount        = htmlspecialchars(form_data.search_to_outstanding_amount);  
    var search_status_checkbox_value        = form_data.search_status_checkbox_value;
    var search_vendor_name_checkbox_value   = form_data.search_vendor_name_checkbox_value;
    var search_date                         = htmlspecialchars(form_data.search_date);
    var user_id                             = form_data.id;
    if(reset_flag == '1')
    {
        search_invoice_code                        = '';
        search_airway_bill_no                      = '';
        search_from_payable_invoice_amount         = '';
        search_to_payable_invoice_amount           = '';
        search_from_remittance_amount              = '';
        search_to_remittance_amount                = '';
        search_from_credit_amount                  = '';
        search_to_credit_amount                    = '';
        search_from_tds_amount                     = '';
        search_to_tds_amount                       = '';
        search_from_wallet_amount                  = '';
        search_to_wallet_amount                    = '';
        search_from_paid_amount                    = '';
        search_to_paid_amount                      = '';
        search_from_amount_received                = '';
        search_to_amount_received                  = '';
        search_from_outstanding_amount             = '';
        search_to_outstanding_amount               = '';
        search_vendor_name_checkbox_value          = [];
        search_status_checkbox_value               = [];
        search_date                                = htmlspecialchars(form_data.search_date);
    }
    
    var invoice_id_list = '';
    var custom_invoice_id_filter = '';
    if (search_airway_bill_no != '')
    {
        custom_invoice_id_filter = '';
        awb_numbers = Array.from(new Set(search_airway_bill_no.split(/(\s+)/)));
        var search_value_list    = awb_numbers.join("','");
        custom_invoice_id_filter += " is_deleted='0' and (airway_bill_no IN ('"+search_value_list+"') or order_no IN ('"+search_value_list+"'))";

        var get_invoice_id_query              = `select invoice_id from order_management_billing where `+custom_invoice_id_filter;
        
        var result_get_total_query = JSON.parse( await billing.commonSelectQuery(get_invoice_id_query));
        console.log(result_get_total_query);
        var all_invoice_id_data_array = [];
        
        for (const total_amount of result_get_total_query) 
        {
            all_invoice_id_data_array.push(total_amount);
        }
        if(all_invoice_id_data_array.length>0)
        {
            invoice_id_list = all_invoice_id_data_array.join("','");
        }
    }

    var custom_having_filter = '';
    var custom_filter = " bi1.is_deleted = 0 ";

    var search_vendor_id_checkbox = '';
    if (search_vendor_name_checkbox_value.length>0)
    {
        //search_vendor_id_checkbox = implode(',',search_vendor_name_checkbox_value);
        search_vendor_name_checkbox_value.forEach(search_vendor_name_value => search_vendor_id_checkbox += search_vendor_name_value);
        if(search_vendor_id_checkbox.length > 1)
        {
            search_vendor_id_checkbox = search_vendor_id_checkbox.substr(0, -1);
        }
    }
    else
    {
        search_vendor_id_checkbox = '';
    }
    var custom_search_filter = '';
    if (search_vendor_id_checkbox != '')
    {
        custom_search_filter += "  and bi1.user_id IN (" +search_vendor_id_checkbox + ")";
    }
    else
    {
        custom_search_filter += " and bi1.user_id ="+user_id;
    }

    var last_monday_date = new Date();
    last_monday_date.setDate(last_monday_date.getDate() - (last_monday_date.getDay() + 6) % 7);
    
    var last_7_days_date = new Date();
    last_7_days_date.setDate(last_7_days_date.getDate() - 7);

    var custom_filter1     = " ";
    var custom_filter2     = " ";

	var get_total_paid_amount_query = `SELECT 
        (SELECT sum(bi1.invoice_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter1+`) as total_invoice_amount1,
        (SELECT sum(bi1.invoice_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter2+`) as total_invoice_amount2,
        (SELECT sum(bi1.invoice_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter+`) as total_invoice_amount,
        (SELECT sum(bi1.sgst_total + bi1.cgst_total + bi1.igst_total) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter1+`) as total_gst_amount1,
        (SELECT sum(bi1.sgst_total + bi1.cgst_total + bi1.igst_total) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter2+`) as total_gst_amount2,
        (SELECT sum(bi1.sgst_total + bi1.cgst_total + bi1.igst_total) from billing bi1  WHERE `+custom_filter +custom_search_filter+`) as total_gst_amount,
        (SELECT sum(bi1.remittance_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter1+`) as total_remittance_amount1,
        (SELECT sum(bi1.remittance_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter2+`) as total_remittance_amount2,
        (SELECT sum(bi1.remittance_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter+`) as total_remittance_amount,
        (SELECT sum(bi1.credit_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter1+`) as total_credit_amount1,
        (SELECT sum(bi1.credit_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter2+`) as total_credit_amount2,
        (SELECT sum(bi1.credit_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter+`) as total_credit_amount,
        (SELECT sum(bi1.tds_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter1+`) as total_tds_amount1,
        (SELECT sum(bi1.tds_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter2+`) as total_tds_amount2,
        (SELECT sum(bi1.tds_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter+`) as total_tds_amount,
        (SELECT sum(bi1.wallet_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter1+`) as total_wallet_amount1,
        (SELECT sum(bi1.wallet_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter2+`) as total_wallet_amount2,
        (SELECT sum(bi1.wallet_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter+`) as total_wallet_amount,
        (SELECT sum(bi1.paid_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter1+`) as total_paid_amount1,
        (SELECT sum(bi1.paid_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter2+`) as total_paid_amount2,
        (SELECT sum(bi1.paid_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter+`) as total_paid_amount,
        (SELECT sum(bi1.invoice_amount-(bi1.paid_amount + bi1.remittance_amount + bi1.credit_amount + bi1.wallet_amount+ bi1.tds_amount)) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter2+`) as total_outstanding_amount1,
        (SELECT sum(bi1.invoice_amount-(bi1.paid_amount + bi1.remittance_amount + bi1.credit_amount + bi1.wallet_amount+ bi1.tds_amount)) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter2+`) as total_outstanding_amoun2,
        (SELECT sum(bi1.invoice_amount-(bi1.paid_amount + bi1.remittance_amount + bi1.credit_amount + bi1.wallet_amount+ bi1.tds_amount)) from billing bi1  WHERE `+custom_filter +custom_search_filter+`) as total_outstanding_amount,
        (SELECT sum(bi1.paid_amount + bi1.remittance_amount + bi1.credit_amount + bi1.wallet_amount+ bi1.tds_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter2+`) as total_paid_amount_calculated1,
        (SELECT sum(bi1.remittance_amount + bi1.credit_amount + bi1.tds_amount + bi1.wallet_amount + bi1.paid_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter2+`) as total_paid_amount_calculated2,
        (SELECT sum(bi1.remittance_amount + bi1.credit_amount + bi1.tds_amount + bi1.wallet_amount + bi1.paid_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter+`) as total_paid_amount_calculated,
        (SELECT sum(bi1.remittance_amount + bi1.credit_amount + bi1.tds_amount + bi1.wallet_amount + bi1.paid_amount) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter2+` and bi1.status != '2' and bi1.invoice_date <= (DATE(NOW()) - INTERVAL 7 DAY)) as total_due_amount1,
        (SELECT sum(bi1.invoice_amount-(bi1.paid_amount + bi1.remittance_amount + bi1.credit_amount + bi1.wallet_amount+ bi1.tds_amount)) from billing bi1  WHERE `+custom_filter +custom_search_filter +custom_filter2+` and bi1.status != '2' and bi1.invoice_date <= (DATE(NOW()) - INTERVAL 7 DAY)) as total_due_amount2,
        (SELECT sum(bi1.invoice_amount-(bi1.paid_amount + bi1.remittance_amount + bi1.credit_amount + bi1.wallet_amount+ bi1.tds_amount)) from billing bi1  WHERE `+custom_filter +custom_search_filter+` and bi1.status != '2' and bi1.invoice_date <= (DATE(NOW()) - INTERVAL 7 DAY)) as total_due_amount
        FROM billing bi limit 1`;

    var result_get_total_paid_amount_query =JSON.parse( await billing.commonSelectQuery(get_total_paid_amount_query));
        //console.log(get_total_amount_array);
    var all_total_paid_amount_data_array = []
    for (const total_amount_array of result_get_total_paid_amount_query) 
    {
        //all_total_paid_amount_data_array = total_amount_array;
    } 
    all_total_paid_amount_data_array = result_get_total_paid_amount_query;
    var get_query = `select (bi1.invoice_amount-(bi1.paid_amount + bi1.remittance_amount + bi1.credit_amount + bi1.wallet_amount+ bi1.tds_amount)) as temp_outstanding_amount,(bi1.remittance_amount + bi1.credit_amount + bi1.tds_amount + bi1.wallet_amount + bi1.paid_amount) as paid_amount_calculated from billing bi1 left join user u on bi1.user_id=u.id where `+custom_filter + custom_search_filter +custom_having_filter;
    var result_get_query = JSON.parse(await billing.commonSelectQuery(get_query));
        //console.log(get_total_amount_array);
    var all_row_data_array = []
    for (const total_amount_array of result_get_query) 
    {
        all_row_data_array.push(total_amount_array);
    } 

    var total_last_week_outstanding_amount = 0;
    var total_last_to_last_week_outstanding_amount = 0;
    var total_outstanding_amount = 0;
    var total_last_week_paid_amount = 0;
    var total_last_to_last_week_paid_amount = 0;
    var total_paid_amount = 0;

    
    if(all_row_data_array.length>0)
    {
        for (const all_row_data of all_row_data_array) 
        {
            if(all_row_data['temp_outstanding_amount'] == null)
            {
                total_last_week_outstanding_amount += 0;
            }
            else
            {
                total_last_week_outstanding_amount += all_row_data['temp_outstanding_amount'];
            }
            if(all_row_data['temp_outstanding_amount'] == null)
            {
                total_last_to_last_week_outstanding_amount += 0;
            }
            else
            {
                total_last_to_last_week_outstanding_amount += all_row_data['temp_outstanding_amount'];
            }
            if(all_row_data['temp_outstanding_amount'] == null)
            {
                total_outstanding_amount += 0;
            }
            else
            {
                total_outstanding_amount += all_row_data['temp_outstanding_amount'];
            }

            if(all_row_data['paid_amount_calculated'] == null)
            {
                total_last_week_paid_amount += 0;
            }
            else
            {
                total_last_week_paid_amount += all_row_data['paid_amount_calculated'];
            }
            if(all_row_data['paid_amount_calculated'] == null)
            {
                total_last_to_last_week_paid_amount += 0;
            }
            else
            {
                total_last_to_last_week_paid_amount += all_row_data['paid_amount_calculated'];
            }
            if(all_row_data['paid_amount_calculated'] == null)
            {
                total_paid_amount += 0;
            }
            else
            {
                total_paid_amount += all_row_data['paid_amount_calculated'];
            }
        }
    }
    else
    {
        total_last_week_outstanding_amount = 0;
        total_last_to_last_week_outstanding_amount = 0;
        total_outstanding_amount = 0;
        total_last_week_paid_amount = 0;
        total_last_to_last_week_paid_amount = 0;
        total_paid_amount = 0;
    }

    if(all_total_paid_amount_data_array.length>0)
    {
    	total_last_week_invoice_amount = all_total_paid_amount_data_array[0]['total_invoice_amount1'];
    	if(total_last_week_invoice_amount == null)
    	{
    		total_last_week_invoice_amount = 0;
    	}
    	total_last_to_last_week_invoice_amount = all_total_paid_amount_data_array[0]['total_invoice_amount2'];
    	if(total_last_to_last_week_invoice_amount == null)
    	{
    		total_last_to_last_week_invoice_amount = 0;
    	}
    	total_invoice_amount = all_total_paid_amount_data_array[0]['total_invoice_amount'];
    	if(total_invoice_amount == null)
    	{
    		total_invoice_amount = 0;
    	}

        total_last_week_gst_amount = all_total_paid_amount_data_array[0]['total_gst_amount1'];
        if(total_last_week_gst_amount == null)
        {
            total_last_week_gst_amount = 0;
        }
        total_last_to_last_week_gst_amount = all_total_paid_amount_data_array[0]['total_gst_amount2'];
        if(total_last_to_last_week_gst_amount == null)
        {
            total_last_to_last_week_gst_amount = 0;
        }
        total_gst_amount = all_total_paid_amount_data_array[0]['total_gst_amount'];
        if(total_gst_amount == null)
        {
            total_gst_amount = 0;
        }

        total_last_week_net_amount = total_last_week_invoice_amount - total_last_week_gst_amount;
        if(total_last_week_net_amount == null)
        {
            total_last_week_net_amount = 0;
        }
        total_last_to_last_week_net_amount = total_last_to_last_week_invoice_amount - total_last_to_last_week_gst_amount;
        if(total_last_to_last_week_net_amount == null)
        {
            total_last_to_last_week_net_amount = 0;
        }
        total_net_amount = total_invoice_amount - total_gst_amount;
        if(total_net_amount == null)
        {
            total_net_amount = 0;
        }

        total_last_week_due_amount = all_total_paid_amount_data_array[0]['total_due_amount1'];
        if(total_last_week_due_amount == null)
        {
            total_last_week_due_amount = 0;
        }
        total_last_to_last_week_due_amount = all_total_paid_amount_data_array[0]['total_due_amount2'];
        if(total_last_to_last_week_due_amount == null)
        {
            total_last_to_last_week_due_amount = 0;
        }
        total_due_amount = all_total_paid_amount_data_array[0]['total_due_amount'];
        if(total_due_amount == null)
        {
            total_due_amount = 0;
        }

        total_last_week_remittance_amount = all_total_paid_amount_data_array[0]['total_remittance_amount1'];
        if(total_last_week_remittance_amount == null)
        {
            total_last_week_remittance_amount = 0;
        }
        total_last_to_last_week_remittance_amount = all_total_paid_amount_data_array[0]['total_remittance_amount2'];
        if(total_last_to_last_week_remittance_amount == null)
        {
            total_last_to_last_week_remittance_amount = 0;
        }
        total_remittance_amount = all_total_paid_amount_data_array[0]['total_remittance_amount'];
        if(total_remittance_amount == null)
        {
            total_remittance_amount = 0;
        }

        total_last_week_credit_amount = all_total_paid_amount_data_array[0]['total_credit_amount1'];
        if(total_last_week_credit_amount == null)
        {
            total_last_week_credit_amount = 0;
        }
        total_last_to_last_week_credit_amount = all_total_paid_amount_data_array[0]['total_credit_amount2'];
        if(total_last_to_last_week_credit_amount == null)
        {
            total_last_to_last_week_credit_amount = 0;
        }
        total_credit_amount = all_total_paid_amount_data_array[0]['total_credit_amount'];
        if(total_credit_amount == null)
        {
            total_credit_amount = 0;
        }

        total_last_week_tds_amount = all_total_paid_amount_data_array[0]['total_tds_amount1'];
        if(total_last_week_tds_amount == null)
        {
            total_last_week_tds_amount = 0;
        }
        total_last_to_last_week_tds_amount = all_total_paid_amount_data_array[0]['total_tds_amount2'];
        if(total_last_to_last_week_tds_amount == null)
        {
            total_last_to_last_week_tds_amount = 0;
        }
        total_tds_amount = all_total_paid_amount_data_array[0]['total_tds_amount'];
        if(total_tds_amount == null)
        {
            total_tds_amount = 0;
        }

        total_last_week_wallet_amount = all_total_paid_amount_data_array[0]['total_wallet_amount1'];
        if(total_last_week_wallet_amount == null)
        {
            total_last_week_wallet_amount = 0;
        }
        total_last_to_last_week_wallet_amount = all_total_paid_amount_data_array[0]['total_wallet_amount2'];
        if(total_last_to_last_week_wallet_amount == null)
        {
            total_last_to_last_week_wallet_amount = 0;
        }
        total_wallet_amount = all_total_paid_amount_data_array[0]['total_wallet_amount'];
        if(total_wallet_amount == null)
        {
            total_wallet_amount = 0;
        }

        total_last_week_amount_received = all_total_paid_amount_data_array[0]['total_paid_amount1'];
        if(total_last_week_amount_received == null)
        {
            total_last_week_amount_received = 0;
        }
        total_last_to_last_week_amount_received = all_total_paid_amount_data_array[0]['total_paid_amount2'];
        if(total_last_to_last_week_amount_received == null)
        {
            total_last_to_last_week_amount_received = 0;
        }
        total_amount_received = all_total_paid_amount_data_array[0]['total_paid_amount'];
        if(total_amount_received == null)
        {
            total_amount_received = 0;
        }
    }
    else
    {
    	total_last_week_invoice_amount = 0;
    	total_last_to_last_week_invoice_amount = 0;
    	total_invoice_amount = 0;
        total_last_week_gst_amount = 0;
        total_last_to_last_week_gst_amount = 0;
        total_gst_amount = 0;
        total_last_week_net_amount = 0;
        total_last_to_last_week_net_amount = 0;
        total_net_amount = 0;
    	total_last_week_outstanding_amount = 0;
    	total_last_to_last_week_outstanding_amount = 0;
        total_outstanding_amount = 0;
        total_last_week_due_amount = 0;
        total_last_to_last_week_due_amount = 0;
        total_due_amount = 0;
        total_last_week_paid_amount = 0;
        total_last_to_last_week_paid_amount = 0;
    	total_paid_amount = 0;
        total_last_week_remittance_amount = 0;
        total_last_to_last_week_remittance_amount = 0;
        total_remittance_amount = 0;
        total_last_week_credit_amount = 0;
        total_last_to_last_week_credit_amount = 0;
        total_credit_amount = 0;
        total_last_week_tds_amount = 0;
        total_last_to_last_week_tds_amount = 0;
        total_tds_amount = 0;
        total_last_week_wallet_amount = 0;
        total_last_to_last_week_wallet_amount = 0;
        total_wallet_amount = 0;
        total_last_week_amount_received = 0;
        total_last_to_last_week_amount_received = 0;
        total_amount_received = 0;
    }

    var difference_invoice_amount = total_last_week_invoice_amount - total_last_to_last_week_invoice_amount;
    var rate_of_change_invoice_amount_text = '';
    var return_array = {};
    if(difference_invoice_amount > 0)
    {
    	rate_of_change_invoice_amount_text = 'INCREASE';
    	return_array["card1_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
    }
    else if(difference_invoice_amount < 0)
    {
    	rate_of_change_invoice_amount_text = 'DECREASE';
    	return_array["card1_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    else
    {
    	rate_of_change_invoice_amount_text = 'DECREASE';
    	return_array["card1_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    var rate_of_change_invoice_amount = 0;
    if(difference_invoice_amount == 0)
    {
    	rate_of_change_invoice_amount = 0;
    }
    else if(total_last_to_last_week_invoice_amount == 0)
    {
    	rate_of_change_invoice_amount = 0;
    }
    else
    {
    	rate_of_change_invoice_amount = ((difference_invoice_amount * 100) / total_last_to_last_week_invoice_amount);
    }


    var total_invoice_amount1 = currencyFormatter.format(Math.round(total_invoice_amount,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
    return_array["card1_amount"] = total_invoice_amount1.substr(0, total_invoice_amount1.indexOf("."));
    return_array["card1_percentage"] = rate_of_change_invoice_amount+'% '+rate_of_change_invoice_amount_text;
    return_array["card1_Title"] = 'Total Amount'; 
    return_array["card1_subTitle"] = "";
    var difference_outstanding_amount = total_last_week_outstanding_amount - total_last_to_last_week_outstanding_amount;
    var rate_of_change_outstanding_amount_text = '';
    if(difference_outstanding_amount > 0)
    {
    	rate_of_change_outstanding_amount_text = 'INCREASE';
    	return_array["card3_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
    }
    else if(difference_outstanding_amount < 0)
    {
    	rate_of_change_outstanding_amount_text = 'DECREASE';
    	return_array["card3_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    else
    {
    	rate_of_change_outstanding_amount_text = 'DECREASE';
    	return_array["card3_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    var rate_of_change_outstanding_amount = 0;
    if(difference_outstanding_amount == 0)
    {
    	rate_of_change_outstanding_amount = 0;
    }
    else if(total_last_to_last_week_outstanding_amount == 0)
    {
    	rate_of_change_outstanding_amount = 0;
    }
    else
    {
    	rate_of_change_outstanding_amount = ((difference_outstanding_amount * 100) / total_last_to_last_week_outstanding_amount);
    }
    var total_outstanding_amount1 = currencyFormatter.format(Math.round(total_outstanding_amount,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
    return_array["card3_amount"] = total_outstanding_amount1.substr(0, total_outstanding_amount1.indexOf("."));
    return_array["card3_percentage"] = rate_of_change_outstanding_amount+'% '+rate_of_change_outstanding_amount_text;
    return_array["card3_Title"] = 'Total Outstanding'; 
    return_array["card3_subTitle"] = "";
    var difference_due_amount = total_last_week_due_amount - total_last_to_last_week_due_amount;
    var rate_of_change_due_amount_text = '';
    if(difference_due_amount > 0)
    {
        rate_of_change_due_amount_text = 'INCREASE';
        return_array["card4_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
    }
    else if(+difference_due_amount < 0)
    {
        rate_of_change_due_amount_text = 'DECREASE';
        return_array["card4_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    else
    {
        rate_of_change_due_amount_text = 'DECREASE';
        return_array["card4_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    var rate_of_change_due_amount = 0;
    if(difference_due_amount == 0)
    {
        rate_of_change_due_amount = 0;
    }
    else if(total_last_to_last_week_due_amount == 0)
    {
        rate_of_change_due_amount = 0;
    }
    else
    {
        rate_of_change_due_amount = ((difference_due_amount * 100) / total_last_to_last_week_due_amount);
    }

    var total_due_amount1 = currencyFormatter.format(Math.round(total_due_amount,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
    return_array["card4_amount"] = total_due_amount1.substr(0, total_due_amount1.indexOf("."));
    return_array["card4_percentage"] = rate_of_change_due_amount+'% '+rate_of_change_due_amount_text;
    return_array["card4_Title"] = 'Total Due'; 
    return_array["card4_subTitle"] = "";
    var difference_paid_amount = total_last_week_paid_amount - total_last_to_last_week_paid_amount;
    var rate_of_change_paid_amount_text = '';
    if(difference_paid_amount > 0)
    {
        rate_of_change_paid_amount_text = 'INCREASE';
        return_array["card2_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
    }
    else if(difference_paid_amount < 0)
    {
        rate_of_change_paid_amount_text = 'DECREASE';
        return_array["card2_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    else
    {
        rate_of_change_paid_amount_text = 'DECREASE';
        return_array["card2_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }

    if(difference_paid_amount == 0)
    {
        rate_of_change_paid_amount = 0;
    }
    else if(total_last_to_last_week_paid_amount == 0)
    {
        rate_of_change_paid_amount = 0;
    }
    else
    {
        rate_of_change_paid_amount = ((difference_paid_amount * 100) / total_last_to_last_week_paid_amount);
    }
    var total_paid_amount1 = currencyFormatter.format(Math.round(total_paid_amount,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
    return_array["card2_amount"] = total_paid_amount1.substr(0, total_paid_amount1.indexOf("."));
    return_array["card4_percentage"] = rate_of_change_paid_amount+'% '+rate_of_change_paid_amount_text;
    return_array["card2_Title"] = 'Total Paid';
    return_array["card2_subTitle"] = "";
    var difference_remittance_amount = total_last_week_remittance_amount - total_last_to_last_week_remittance_amount;

    if(difference_remittance_amount > 0)
    {
        rate_of_change_remittance_amount_text = 'INCREASE';
        return_array["card5_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
    }
    else if(difference_remittance_amount < 0)
    {
        rate_of_change_remittance_amount_text = 'DECREASE';
        return_array["card5_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    else
    {
        rate_of_change_remittance_amount_text = 'DECREASE';
        return_array["card5_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    var rate_of_change_remittance_amount = 0;
    if(difference_remittance_amount == 0)
    {
        rate_of_change_remittance_amount = 0;
    }
    else if(total_last_to_last_week_remittance_amount == 0)
    {
        rate_of_change_remittance_amount = 0;
    }
    else
    {
        rate_of_change_remittance_amount = ((difference_remittance_amount * 100) / total_last_to_last_week_remittance_amount);
    }

    var total_remittance_amount1 = currencyFormatter.format(Math.round(total_remittance_amount,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
    return_array["card5_amount"] = total_remittance_amount1.substr(0, total_remittance_amount1.indexOf("."));
    return_array["card5_percentage"] = rate_of_change_remittance_amount+'% '+rate_of_change_remittance_amount_text;
    return_array["card5_Title"] = '';
    return_array["card5_subTitle"] = "";
    var difference_credit_amount = total_last_week_credit_amount - total_last_to_last_week_credit_amount;
    var rate_of_change_credit_amount_text = "";
    if(difference_credit_amount > 0)
    {
        rate_of_change_credit_amount_text = 'INCREASE';
        return_array["card6_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
    }
    else if(difference_credit_amount < 0)
    {
        rate_of_change_credit_amount_text = 'DECREASE';
        return_array["card6_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    else
    {
        rate_of_change_credit_amount_text = 'DECREASE';
        return_array["card6_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    var rate_of_change_credit_amount= 0;
    if(difference_credit_amount == 0)
    {
        rate_of_change_credit_amount = 0;
    }
    else if(total_last_to_last_week_credit_amount == 0)
    {
        rate_of_change_credit_amount = 0;
    }
    else
    {
        rate_of_change_credit_amount = ((difference_credit_amount * 100) / total_last_to_last_week_credit_amount);
    }

    var total_credit_amount1 = currencyFormatter.format(Math.round(total_credit_amount,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
    return_array["card6_amount"] = total_credit_amount1.substr(0, total_credit_amount1.indexOf("."));
    return_array["card6_percentage"] = rate_of_change_credit_amount+'% '+rate_of_change_credit_amount_text;
    return_array["card6_Title"] = '';
    return_array["card6_subTitle"] = "";
    var difference_tds_amount = total_last_week_tds_amount - total_last_to_last_week_tds_amount;
    var rate_of_change_tds_amount_text = '';
    if(difference_tds_amount > 0)
    {
        rate_of_change_tds_amount_text = 'INCREASE';
        return_array["card7_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
    }
    else if(difference_tds_amount < 0)
    {
        rate_of_change_tds_amount_text = 'DECREASE';
        return_array["card7_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    else
    {
        rate_of_change_tds_amount_text = 'DECREASE';
        return_array["card7_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    var rate_of_change_tds_amount = 0;
    if(difference_tds_amount == 0)
    {
        rate_of_change_tds_amount = 0;
    }
    else if(total_last_to_last_week_tds_amount == 0)
    {
        rate_of_change_tds_amount = 0;
    }
    else
    {
        rate_of_change_tds_amount = ((difference_tds_amount * 100) / total_last_to_last_week_tds_amount);
    }

    var total_tds_amount1 = currencyFormatter.format(Math.round(total_tds_amount,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
    return_array["card7_amount"] = total_tds_amount1.substr(0, total_tds_amount1.indexOf("."));
    return_array["card7_percentage"] = rate_of_change_tds_amount+'% '+rate_of_change_tds_amount_text;
    return_array["card7_Title"] = '';
    return_array["card7_subTitle"] = "";

    var difference_wallet_amount = total_last_week_wallet_amount - total_last_to_last_week_wallet_amount;
    var rate_of_change_wallet_amount_text = '';
    if(difference_wallet_amount > 0)
    {
        rate_of_change_wallet_amount_text = 'INCREASE';
        return_array["card8_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
    }
    else if(difference_wallet_amount < 0)
    {
        rate_of_change_wallet_amount_text = 'DECREASE';
        return_array["card8_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    else
    {
        rate_of_change_wallet_amount_text = 'DECREASE';
        return_array["card8_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    var rate_of_change_wallet_amount=0;
    if(difference_wallet_amount == 0)
    {
        rate_of_change_wallet_amount = 0;
    }
    else if(total_last_to_last_week_wallet_amount == 0)
    {
        rate_of_change_wallet_amount = 0;
    }
    else
    {
        rate_of_change_wallet_amount = ((difference_wallet_amount * 100) / total_last_to_last_week_wallet_amount);
    }

    var total_wallet_amount1 = currencyFormatter.format(Math.round(total_wallet_amount,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
    return_array["card8_amount"] = total_wallet_amount1.substr(0, total_wallet_amount1.indexOf("."));
    return_array["card8_percentage"] = rate_of_change_wallet_amount+'% '+rate_of_change_wallet_amount_text;
    return_array["card8_Title"] = '';
    return_array["card8_subTitle"] = "";

    var difference_amount_received = total_last_week_amount_received - total_last_to_last_week_amount_received;
    var rate_of_change_amount_received_text = "";
    if(difference_amount_received > 0)
    {
        rate_of_change_amount_received_text = 'INCREASE';
        return_array["card9_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
    }
    else if(difference_amount_received < 0)
    {
        rate_of_change_amount_received_text = 'DECREASE';
        return_array["card9_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    else
    {
        rate_of_change_amount_received_text = 'DECREASE';
        return_array["card9_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    var rate_of_change_amount_received = 0;
    if(difference_amount_received == 0)
    {
        rate_of_change_amount_received = 0;
    }
    else if(total_last_to_last_week_amount_received == 0)
    {
        rate_of_change_amount_received = 0;
    }
    else
    {
        rate_of_change_amount_received = ((difference_amount_received * 100) / total_last_to_last_week_amount_received);
    }

    var total_amount_received1 = currencyFormatter.format(Math.round(total_amount_received,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
    return_array["card9_amount"] = total_amount_received1.substr(0, total_amount_received1.indexOf("."));
    return_array["card9_percentage"] = rate_of_change_amount_received+'% '+rate_of_change_amount_received_text;
    return_array["card9_Title"] = '';
    return_array["card9_subTitle"] = "";
    return_array["total_gst_amount"] = total_gst_amount;
    return_array["total_net_amount"] = total_net_amount;

    res.status(200).json({
        status : "success",
        status_code : 200,
        data_array: return_array
    });
    return;
};

exports.get_widget_credit_receipt = async function(form_data, req, res, next) 
{  
    var userdata = [];
    var base_url_images = "https://manage-cdn.ithinklogistics.com/manage/theme2/assets/images/";
    var reset_flag                          = htmlspecialchars(form_data.reset_flag);
    var search_credit_no                    = htmlspecialchars(form_data.search_credit_no);
    var search_airway_bill_no               = htmlspecialchars(form_data.search_awb_no);
    var search_awb_no                       = htmlspecialchars(form_data.search_awb_no);
    var search_from_cn_amount               = htmlspecialchars(form_data.search_from_cn_amount);
    var search_to_cn_amount                 = htmlspecialchars(form_data.search_to_cn_amount);
    var search_from_available_credit        = htmlspecialchars(form_data.search_from_available_credit);
    var search_to_available_credit          = htmlspecialchars(form_data.search_to_available_credit);
    var search_cn_type_checkbox_value       = form_data.search_cn_type_checkbox_value;
    var search_status_checkbox_value        = form_data.search_status_checkbox_value;
    var search_vendor_name_checkbox_value   = form_data.search_vendor_name_checkbox_value;
    var search_date                         = htmlspecialchars(form_data.search_date);
    var user_id                             = form_data.id;
    if(reset_flag == '1')
    {
        search_credit_no                    = '';
        search_airway_bill_no                  = '';
        search_awb_no                       = '';
        search_from_cn_amount               = '';
        search_to_cn_amount                 = '';
        search_from_available_credit        = '';
        search_to_available_credit          = '';
        search_cn_type_checkbox_value       = [];
        search_vendor_name_checkbox_value   = [];
        search_status_checkbox_value        = [];
        search_date                         = htmlspecialchars(form_data.search_date);
    }
    
    var search_vendor_id_checkbox = '';
    if (search_vendor_name_checkbox_value.length>0)
    {
        //search_vendor_id_checkbox = implode(',',search_vendor_name_checkbox_value);
        search_vendor_name_checkbox_value.forEach(search_vendor_name_value => search_vendor_id_checkbox += search_vendor_name_value);
        if(search_vendor_id_checkbox.length > 1)
        {
            search_vendor_id_checkbox = search_vendor_id_checkbox.substr(0, -1);
        }
    }
    else
    {
        search_vendor_id_checkbox = '';
    }
    var cn_id_list = '';
    
    if (search_airway_bill_no != '')
    {
        custom_cn_id_filter = '';
        awb_numbers = Array.from(new Set(search_airway_bill_no.split(/(\s+)/)));
        var search_value_list    = awb_numbers.join("','");
        custom_cn_id_filter += " is_deleted='0' and (airway_bill_no IN ('"+search_value_list+"') or order_no IN ('"+search_value_list+"'))";

        var get_cn_id_query              = `select invoice_id from order_management_billing where `+custom_cn_id_filter;
        
        var result_get_cn_id_query = JSON.parse(await billing.commonSelectQuery(get_cn_id_query));
        console.log(result_get_cn_id_query);
        var all_cn_id_data_array = [];
        
        for (const total_amount of result_get_cn_id_query) 
        {
            all_cn_id_data_array.push(total_amount);
        }
        if(all_cn_id_data_array.length>0)
        {
            cn_id_list = all_cn_id_data_array.join("','");
        }
    }
    var custom_filter = ` cr1.is_deleted = 0 `;
    var custom_search_filter = '';

    if (search_vendor_id_checkbox != '')
    {
        custom_search_filter += `  and cr1.user_id IN (` +search_vendor_id_checkbox + `)`;
    }
    else
    {
        custom_search_filter += ` and cr1.user_id =`+user_id;
    }
    var last_monday_date = new Date();
    last_monday_date.setDate(last_monday_date.getDate() - (last_monday_date.getDay() + 6) % 7);
    
    var last_7_days_date = new Date();
    last_7_days_date.setDate(last_7_days_date.getDate() - 7);

    var custom_filter1     = " ";
    var custom_filter2     = " ";

    var get_total_amount_query = `SELECT 
        (SELECT sum(cr1.cn_amount) from credit_note cr1 WHERE `+custom_filter + custom_search_filter + custom_filter1+ ` and cr1.cn_type='1') as total_freight_amount1,
        (SELECT sum(cr1.cn_amount) from credit_note cr1 WHERE `+custom_filter + custom_search_filter + custom_filter2+ ` and cr1.cn_type='1') as total_freight_amount2,
        (SELECT sum(cr1.cn_amount) from credit_note cr1 WHERE `+custom_filter + custom_search_filter + ` and cr1.cn_type='1') as total_freight_amount,
        (SELECT sum(cr1.cn_amount) from credit_note cr1 WHERE `+custom_filter + custom_search_filter + custom_filter1+ ` and cr1.cn_type='2') as total_lost_amount1,
        (SELECT sum(cr1.cn_amount) from credit_note cr1 WHERE `+custom_filter + custom_search_filter +custom_filter2+ ` and cr1.cn_type='2') as total_lost_amount2,
        (SELECT sum(cr1.cn_amount) from credit_note cr1 WHERE `+custom_filter + custom_search_filter+ ` and cr1.cn_type='2') as total_lost_amount,
        (SELECT sum(cr1.available_credit) from credit_note cr1 WHERE `+custom_filter + custom_search_filter + custom_filter1+`) as total_available_credit1,
        (SELECT sum(cr1.available_credit) from credit_note cr1 WHERE `+custom_filter + custom_search_filter + custom_filter2+`) as total_available_credit2,
        (SELECT sum(cr1.available_credit) from credit_note cr1 WHERE `+custom_filter + custom_search_filter+ `) as total_available_credit
        FROM credit_note cr limit 1`;
    
    var result_get_cn_id_query = JSON.parse(await billing.commonSelectQuery(get_total_amount_query));
    console.log(result_get_cn_id_query);
    var all_total_amount_data_array = [];
    
    for (const total_amount of result_get_cn_id_query) 
    {
        //all_total_amount_data_array = total_amount;
    }
    all_total_amount_data_array = result_get_cn_id_query;
    var total_last_week_freight_amount = 0;
    var total_last_to_last_week_freight_amount = 0;
    var total_freight_amount = 0;
    var total_last_week_lost_amount = 0;
    var total_last_to_last_week_lost_amount = 0;
    var total_lost_amount = 0;
    var total_last_week_available_credit = 0;
    var total_last_to_last_week_available_credit = 0;
    var total_available_credit = 0;
    if(all_total_amount_data_array.length>0)
    {
    	total_last_week_freight_amount = all_total_amount_data_array[0]['total_freight_amount1'];
    	if(total_last_week_freight_amount == null)
    	{
    		total_last_week_freight_amount = 0;
    	}
    	total_last_to_last_week_freight_amount = all_total_amount_data_array[0]['total_freight_amount'];
    	if(total_last_to_last_week_freight_amount == null)
    	{
    		total_last_to_last_week_freight_amount = 0;
    	}
    	total_freight_amount = all_total_amount_data_array[0]['total_freight_amount'];
    	if(total_freight_amount == null)
    	{
    		total_freight_amount = 0;
    	}
    	total_last_week_lost_amount = all_total_amount_data_array[0]['total_lost_amount1'];
    	if(total_last_week_lost_amount == null)
    	{
    		total_last_week_lost_amount = 0;
    	}
    	total_last_to_last_week_lost_amount = all_total_amount_data_array[0]['total_lost_amount2'];
    	if(total_last_to_last_week_lost_amount == null)
    	{
    		total_last_to_last_week_lost_amount = 0;
    	}
    	total_lost_amount = all_total_amount_data_array[0]['total_lost_amount'];
    	if(total_lost_amount == null)
    	{
    		total_lost_amount = 0;
    	}
        total_last_week_available_credit = all_total_amount_data_array[0]['total_available_credit1'];
        if(total_last_week_available_credit == null)
        {
            total_last_week_available_credit = 0;
        }
        total_last_to_last_week_available_credit = all_total_amount_data_array[0]['total_available_credit2'];
        if(total_last_to_last_week_available_credit == null)
        {
            total_last_to_last_week_available_credit = 0;
        }
        total_available_credit = all_total_amount_data_array[0]['total_available_credit'];
        if(total_available_credit == null)
        {
            total_available_credit = 0;
        }
    }
    else
    {
    	total_last_week_freight_amount = 0;
    	total_last_to_last_week_freight_amount = 0;
    	total_freight_amount = 0;
    	total_last_week_lost_amount = 0;
    	total_last_to_last_week_lost_amount = 0;
    	total_lost_amount = 0;
        total_last_week_available_credit = 0;
        total_last_to_last_week_available_credit = 0;
        total_available_credit = 0;
    }
    var difference_freight_amount = total_last_week_freight_amount - total_last_to_last_week_freight_amount;
    var rate_of_change_freight_amount_text = "";
    var return_array = {};
    if(difference_freight_amount > 0)
    {
    	rate_of_change_freight_amount_text = 'INCREASE';
    	return_array["card1_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
    }
    else if(difference_freight_amount < 0)
    {
    	rate_of_change_freight_amount_text = 'DECREASE';
    	return_array["card1_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    else
    {
    	rate_of_change_freight_amount_text = 'DECREASE';
    	return_array["card1_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    var rate_of_change_freight_amount = 0;
    if(difference_freight_amount == 0)
    {
    	rate_of_change_freight_amount = 0;
    }
    else if(total_last_to_last_week_freight_amount == 0)
    {
    	rate_of_change_freight_amount = 0;
    }
    else
    {
    	rate_of_change_freight_amount = ((difference_freight_amount * 100) / total_last_to_last_week_freight_amount);
    }

    var total_invoice_amount1 = currencyFormatter.format(Math.round(total_freight_amount,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
    return_array["card1_amount"] = total_invoice_amount1.substr(0, total_invoice_amount1.indexOf("."));
    return_array["card1_percentage"] = total_last_week_lost_amount+'% '+rate_of_change_freight_amount_text;
    return_array["card1_Title"] = "Freight Credit Note"; 
    return_array["card1_subTitle"] = "";
    var difference_lost_amount = total_last_week_lost_amount - total_last_to_last_week_lost_amount;
    var rate_of_change_lost_amount_text = "";
    if(difference_lost_amount > 0)
    {
    	rate_of_change_lost_amount_text = 'INCREASE';
    	return_array["card2_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
    }
    else if(difference_lost_amount < 0)
    {
    	rate_of_change_lost_amount_text = 'DECREASE';
    	return_array["card2_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    else
    {
    	rate_of_change_lost_amount_text = 'DECREASE';
    	return_array["card2_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    var rate_of_change_lost_amount = 0;
    if(difference_lost_amount == 0)
    {
    	rate_of_change_lost_amount = 0;
    }
    else if(total_last_to_last_week_lost_amount == 0)
    {
    	rate_of_change_lost_amount = 0;
    }
    else
    {
    	rate_of_change_lost_amount = ((difference_lost_amount * 100) / total_last_to_last_week_lost_amount);
    }

    var total_lost_amount2 = currencyFormatter.format(Math.round(total_lost_amount,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
    return_array["card2_amount"] = total_lost_amount2.substr(0, total_lost_amount2.indexOf("."));
    return_array["card2_percentage"] = rate_of_change_lost_amount+'% '+rate_of_change_lost_amount_text;
    return_array["card2_Title"] = "Lost Credit Note"; 
    return_array["card2_subTitle"] = "";
    var total_last_week_cn_amount = total_last_week_freight_amount + total_last_week_lost_amount;
    var total_last_to_last_week_cn_amount = total_last_to_last_week_freight_amount + total_last_to_last_week_lost_amount;
    var difference_cn_amount = (total_last_week_cn_amount - total_last_to_last_week_cn_amount);
    var rate_of_change_cn_amount_text = "";
    if(difference_cn_amount > 0)
    {
        rate_of_change_cn_amount_text = 'INCREASE';
        return_array["card3_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
    }
    else if(difference_cn_amount < 0)
    {
        rate_of_change_cn_amount_text = 'DECREASE';
        return_array["card3_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    else
    {
        rate_of_change_cn_amount_text = 'DECREASE';
        return_array["card3_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    var rate_of_change_cn_amount = 0;
    if(difference_cn_amount == 0)
    {
        rate_of_change_cn_amount = 0;
    }
    else if(total_last_to_last_week_cn_amount == 0)
    {
        rate_of_change_cn_amount = 0;
    }
    else
    {
        rate_of_change_cn_amount = ((difference_cn_amount * 100) / total_last_to_last_week_cn_amount);
    }

    var total_cn_amount = total_freight_amount + total_lost_amount;

    var total_last_week_cn_utilized = total_last_week_cn_amount - total_last_week_available_credit;
    var total_last_to_last_week_cn_utilized = total_last_to_last_week_cn_amount - total_last_to_last_week_available_credit;
    var total_cn_utilized = total_cn_amount - total_available_credit;

    var total_cn_amount2 = currencyFormatter.format(Math.round(total_cn_amount,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
    return_array["card3_amount"] = total_cn_amount2.substr(0, total_cn_amount2.indexOf("."));
    return_array["card3_percentage"] = rate_of_change_cn_amount+'% '+rate_of_change_cn_amount_text;
    return_array["card3_Title"] = "Total Credit Note Amount"; 
    return_array["card3_subTitle"] = "";
    var difference_available_credit = total_last_week_available_credit - total_last_to_last_week_available_credit;
    var rate_of_change_available_credit_text = 0;
    if(difference_available_credit > 0)
    {
        rate_of_change_available_credit_text = 'INCREASE';
        return_array["card4_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
    }
    else if(difference_available_credit < 0)
    {
        rate_of_change_available_credit_text = 'DECREASE';
        return_array["card4_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    else
    {
        rate_of_change_available_credit_text = 'DECREASE';
        return_array["card4_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    var rate_of_change_available_credit = 0;
    if(difference_available_credit == 0)
    {
        rate_of_change_available_credit = 0;
    }
    else if(total_last_to_last_week_available_credit == 0)
    {
        rate_of_change_available_credit = 0;
    }
    else
    {
        rate_of_change_available_credit = ((difference_available_credit * 100) / total_last_to_last_week_available_credit);
    }

    var total_available_credit2 = currencyFormatter.format(Math.round(total_available_credit,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
    return_array["card4_amount"] = total_available_credit2.substr(0, total_available_credit2.indexOf("."));
    return_array["card4_percentage"] = rate_of_change_available_credit+'% '+rate_of_change_available_credit_text;
    return_array["card4_Title"] = "";
    return_array["card4_subTitle"] = "";
    var difference_cn_utilized = total_last_week_cn_utilized - total_last_to_last_week_cn_utilized;
    var rate_of_change_cn_utilized_text = 0;
    if(difference_cn_utilized > 0)
    {
        rate_of_change_cn_utilized_text = 'INCREASE';
        return_array["card5_rate_change"] = '<img src="'+base_url_images+'angle-double-up.svg">';
    }
    else if(difference_cn_utilized < 0)
    {
        rate_of_change_cn_utilized_text = 'DECREASE';
        return_array["card5_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    else
    {
        rate_of_change_cn_utilized_text = 'DECREASE';
        return_array["card5_rate_change"] = '<img src="'+base_url_images+'angle-double-down.svg">';
    }
    var rate_of_change_cn_utilized = 0;
    if(difference_cn_utilized == 0)
    {
        rate_of_change_cn_utilized = 0;
    }
    else if(total_last_to_last_week_cn_utilized == 0)
    {
        rate_of_change_cn_utilized = 0;
    }
    else
    {
        rate_of_change_cn_utilized = ((difference_cn_utilized * 100) / total_last_to_last_week_cn_utilized);
    }

    var total_available_credit2 = currencyFormatter.format(Math.round(total_cn_utilized,0), { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
    return_array["card5_amount"] = total_available_credit2.substr(0, total_available_credit2.indexOf("."));
    return_array["card5_percentage"] = rate_of_change_cn_utilized+'% '+rate_of_change_cn_utilized_text;
    return_array["card5_Title"] = "";
    return_array["card5_subTitle"] = "";
    res.status(200).json({
        status : "success",
        status_code : 200,
        data_array: return_array
    });
    return;

}

exports.all_credit_receipt_table_data = async function(form_data, req, res, next) 
{  
    var userdata = [];
    var base_url_images = "https://manage-cdn.ithinklogistics.com/manage/theme2/assets/images/";
    var base_url = "";
    var draw                                = htmlspecialchars(form_data.draw);
    var limit_start                         = htmlspecialchars(form_data.start);
    var limit_end                           = htmlspecialchars(form_data.length);
    var reset_flag                          = htmlspecialchars(form_data.reset_flag);
    var search_credit_no                    = htmlspecialchars(form_data.search_credit_no);
    var search_from_cn_amount               = htmlspecialchars(form_data.search_from_cn_amount);
    var search_airway_bill_no               = htmlspecialchars(form_data.search_awb_no);
    var search_to_cn_amount                 = htmlspecialchars(form_data.search_to_cn_amount);
    var search_from_available_credit        = htmlspecialchars(form_data.search_from_available_credit);
    var search_to_available_credit          = htmlspecialchars(form_data.search_to_available_credit);
    var search_cn_type_checkbox_value       = form_data.search_cn_type_checkbox_value;
    var search_status_checkbox_value        = form_data.search_status_checkbox_value;
    var search_vendor_name_checkbox_value   = form_data.search_vendor_name_checkbox_value;
    var search_date                         = htmlspecialchars(form_data.search_date);
    var user_id                             = form_data.id;
    if(reset_flag == '1')
    {
        search_credit_no                    = '';
        search_airway_bill_no               = '';
        search_awb_no                       = '';
        search_from_cn_amount               = '';
        search_to_cn_amount                 = '';
        search_from_available_credit        = '';
        search_to_available_credit          = '';
        search_cn_type_checkbox_value       = [];
        search_vendor_name_checkbox_value   = [];
        search_status_checkbox_value        = [];
        search_date                         = htmlspecialchars(form_data.search_date);
    }
    var search_vendor_id_checkbox = '';
    
    if (search_vendor_name_checkbox_value.length>0)
    {
        //search_vendor_id_checkbox = implode(',',search_vendor_name_checkbox_value);
        search_vendor_name_checkbox_value.forEach(search_vendor_name_value => search_vendor_id_checkbox += search_vendor_name_value);
        if(search_vendor_id_checkbox.length > 1)
        {
            search_vendor_id_checkbox = search_vendor_id_checkbox.substr(0, -1);
        }
    }
    else
    {
        search_vendor_id_checkbox = '';
    }
    var cn_id_list = '';
    if (search_airway_bill_no != '')
    {
        custom_cn_id_filter = '';
        awb_numbers = Array.from(new Set(search_airway_bill_no.split(/(\s+)/)));
        var search_value_list    = awb_numbers.join("','");
        custom_cn_id_filter += " is_deleted='0' and (airway_bill_no IN ('"+search_value_list+"') or order_no IN ('"+search_value_list+"'))";

        var get_cn_id_query              = `select invoice_id from order_management_billing where `+custom_cn_id_filter;
        
        var result_get_cn_id_query = JSON.parse(await billing.commonSelectQuery(get_cn_id_query));
        console.log(result_get_cn_id_query);
        var all_cn_id_data_array = [];
        if(result_get_cn_id_query.length==0)
        {
            res.status(200).json({
                status : "success",
                status_code : 200,
                data_array: [],
                draw: parseInt(draw),
                recordsFiltered: parseInt(0),
                recordsTotal: parseInt(0)
            });
            return;
        }
        for (const total_amount of result_get_cn_id_query) 
        {
            all_cn_id_data_array.push(total_amount['invoice_id']);
        }
        //all_cn_id_data_array= result_get_cn_id_query;
        console.log(all_cn_id_data_array);
        if(all_cn_id_data_array.length>0)
        {
            console.log("cn_id_list");
            cn_id_list = all_cn_id_data_array.join("','");
        }
        
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    var custom_filter = "";
    console.log(cn_id_list);
    if(cn_id_list != '')
    {
        custom_filter = " cr.is_deleted = 0 and cr.id IN (" +cn_id_list+ ") ";
    }
    else
    {
        custom_filter = " cr.is_deleted = 0 ";
    }
    if (search_vendor_id_checkbox != '')
    {
        custom_filter += "  and cr.user_id IN (" +search_vendor_id_checkbox + ")";
    }
    else
    {
        custom_filter += " and cr.user_id ="+user_id;
    }

    if (search_credit_no != '')
    {
        custom_filter += "  and cr.credit_no = '" +search_credit_no + "'";
    }
    console.log("print");
    //search_transaction_id = search_transaction_id.replace(["#","T","R","t","r"], "");
    if(search_from_cn_amount != '' && search_to_cn_amount != '')
    {
        //search_from_cn_amount_data = explode('.',search_from_cn_amount);
        //search_from_cn_amount = search_from_cn_amount_data[0];
        if(search_from_cn_amount <= search_to_cn_amount)
        {
            custom_filter += " and cr.cn_amount >= "+search_from_cn_amount+" and cr.cn_amount <= "+search_to_cn_amount;
        }
    }
    else
    {
        if(search_from_cn_amount != '')
        {
            custom_filter += " and cr.cn_amount >= "+search_from_cn_amount;
        }
        else
        {
            if(search_to_cn_amount != '')
            {
                custom_filter += " and cr.cn_amount <= "+search_to_cn_amount;
            }
        }
    }

    if(search_from_available_credit != '' && search_to_available_credit != '')
    {
        if(search_from_available_credit <= search_to_available_credit)
        {
            custom_filter += " and cr.available_credit >= "+search_from_available_credit+" and cr.available_credit <= "+search_to_available_credit;
        }
    }
    else
    {
        if(search_from_available_credit != '')
        {
            custom_filter += " and cr.available_credit >= "+search_from_available_credit;
        }
        else
        {
            if(search_to_available_credit != '')
            {
                custom_filter += " and cr.available_credit <= "+search_to_available_credit;
            }
        }
    }
    var search_cn_type_checkbox = '';
    if (search_cn_type_checkbox_value.length>0)
    {
        var i = 0;
        search_cn_type_checkbox_value.forEach(search_cn_type_value => {if(i==0){search_cn_type_checkbox += search_cn_type_value; i++;}
        else{
            search_cn_type_checkbox += ","+search_cn_type_value
        }});
        if(search_cn_type_checkbox != "")
        {
            //search_cn_type_checkbox = search_cn_type_checkbox.substr(0, -1);
            custom_filter += "  and cr.cn_type IN (" +search_cn_type_checkbox + ")";
        }
       
        
    }
    var search_status_checkbox = "";
    if (search_status_checkbox_value.length>0)
    {
        var i = 0;
        search_status_checkbox_value.forEach(search_status_value => {if(i==0){search_status_checkbox += search_status_value; i++;}
        else{
            search_status_checkbox += ','+search_status_value
        }
        });
        if(search_status_checkbox != "")
        {
           // search_status_checkbox = search_status_checkbox.substr(0, -1);
           custom_filter += "  and cr.status IN (" + search_status_checkbox + ")";
        }
       
        
    }
    
    if (search_date != '')
    {
        var explode_date = Array.from(new Set(search_date.split(" ")));
        console.log(explode_date);
        var start_date   = explode_date[0];
        var end_date     = explode_date[1];
        if (typeof end_date === 'undefined') {
            end_date = start_date;
          }
        custom_filter += "  and CAST(cr.cn_date as DATE) >= '" + start_date + "' and CAST(cr.cn_date as DATE) <= '" + end_date + "'";
    }

    var get_count_query    = "select count(cr.id) as total_data from credit_note cr left join user u on cr.user_id=u.id where "+custom_filter;
    console.log(get_count_query);
    var result_count_query = JSON.parse(await billing.commonSelectQuery(get_count_query));
    
    var total_data_array = [];
    
    for (const total_amount of result_count_query) 
    {
        //console.log(total_amount.total_data)
        total_data_array = total_amount;
    }
    var total_data         = total_data_array.total_data; 
    
   //---END get count of rows

    //---START get row data
    var get_query              = "select cr.*,u.first_name,u.last_name,u.company_name from credit_note cr left join user u on cr.user_id=u.id where "+custom_filter+" LIMIT "+limit_start+","+limit_end;
   
    //console.log(get_query);
    var result_get_query =JSON.parse(await billing.commonSelectQuery(get_query));
    //console.log(result_get_query)
    var all_row_data_array = [];
    
    for (const total_amount of result_get_query) 
    {
        //;
        all_row_data_array.push(total_amount);
    }
    
    var data = [];
    if (all_row_data_array.length > 0)
    {
        all_row_data_array.forEach(all_data =>
        {
            var return_array = {};
            var row_id                         = all_data['id'];
            var vendor_name                    = all_data['company_name'];
            var credit_no                      = all_data['credit_no'];
            var cn_date                        = all_data['cn_date'];
            const pattern = date.compile('YYYY-MMM-DD');
            cn_date = cn_date;
            console.log(cn_date);
            var cn_amount                      = all_data['cn_amount'];
            var available_credit               = all_data['available_credit'];
            var cn_type                        = all_data['cn_type'];
            var status                         = all_data['status'];
            var cn_utilized                    = cn_amount - available_credit;
            
            if(cn_type == 1)
            {
                return_array["cn_type"] = 'Freight';
                cn_type = 'Freight';
            }
            else
            {
                return_array["cn_type"] = 'Lost';
                cn_type = 'Lost <a onclick="view_cn_lost_awb('+row_id+')" class="datatable-blue" target="_blank" style="margin-left: 5px;"><img src="'+base_url_images+'info.svg" class="tooltip_class_action" data-toggle="tooltip" title="CN Type" data-html="true"></a>';
            }
            if(status == 0)
            {
                return_array["status"] = 'Unclaim';
                status = '<div class="datatable-color-box-outer"><div class="red-box">Unclaim</div></div>';
            }
            else if(status == 1)
            {
                return_array["status"] = 'Partial Claim';
                status = '<div class="datatable-color-box-outer"><div class="blue-box">Partial Claim</div></div>';
            }
            else if(status == 2)
            {
                return_array["status"] = 'Claim';
                status = '<div class="datatable-color-box-outer"><div class="green-box">Claim</div></div>';
            }
            else
            {
                return_array["status"] = '';
                status = '';
            }
            
            var nestedData   = [];
            var user_name      = all_data['first_name']+' '+all_data['last_name'];
            if(user_name != '')
            {
                if(vendor_name == '')
                {
                    vendor_name   = user_name;
                }
                else
                {
                    vendor_name   = vendor_name+' - '+user_name;
                }
            }
            return_array["vendor_name"] = vendor_name;
            if(vendor_name.length >= 15)
            {
                vendor_name = '<div class="tooltip_class" data-toggle="tooltip" title="'+vendor_name+'" data-html="true" data-placement="right">'+ vendor_name.substr(0,15)+' ...</div>';
            }
           
            nestedData.push(vendor_name);
            return_array["credit_no"] = credit_no;
            nestedData.push(credit_no);
            return_array["cn_date"] = cn_date;
            nestedData.push(cn_date);
            return_array["cn_amount"] = currencyFormatter.format(cn_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            return_array["available_credit"] = currencyFormatter.format(available_credit, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            return_array["cn_utilized"] = currencyFormatter.format(cn_utilized, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});

            nestedData.push('<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(cn_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
            
            nestedData.push('<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(available_credit, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
            
            nestedData.push('<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(cn_utilized, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },})+'<a onclick="view_cn_utilized('+row_id+')" class="datatable-blue" target="_blank" style="margin-left: 5px;"><img src="'+base_url_images+'info.svg" class="tooltip_class_action" data-toggle="tooltip" title="CN Utilized" data-html="true"></a>');
            
            nestedData.push(cn_type);
            nestedData.push(status);
            return_array["row_id"] = row_id;
            nestedData.push(`<a onclick="view_credit_note_details(`+row_id+`)" class="action-icon" style="display:none;"><img src="'+base_url_images+'eye.svg"></a>
                            <a target="_blank" href=" `+base_url+`vendor_plugins/mpdf/print-credit-note/`+ row_id+`" class="action-icon"><img src="`+base_url_images+`print.svg" class="tooltip_class_action" data-toggle="tooltip" title="Print" data-html="true"></a>`);
            
            data.push(return_array);
        });
    }
    res.status(200).json({
        status : "success",
        status_code : 200,
        data_array: data,
        draw: parseInt(draw),
        recordsFiltered: parseInt(total_data),
        recordsTotal: parseInt(total_data)
    });
    return;
}

exports.all_bill_summary_table_data = async function(form_data, req, res, next) 
{  
    var userdata = [];
    var base_url_images = "https://manage-cdn.ithinklogistics.com/manage/theme2/assets/images/";
    var base_url = "";
    var draw                                = htmlspecialchars(form_data.draw);
    var limit_start                         = htmlspecialchars(form_data.start);
    var limit_end                           = htmlspecialchars(form_data.length);
    var reset_flag                          = htmlspecialchars(form_data.reset_flag);
    var search_invoice_code                    = htmlspecialchars(form_data.search_invoice_code);
    var search_from_payable_invoice_amount               = htmlspecialchars(form_data.search_from_payable_invoice_amount);
    var search_airway_bill_no               = htmlspecialchars(form_data.search_awb_no);
    var search_to_payable_invoice_amount                 = htmlspecialchars(form_data.search_to_payable_invoice_amount);
    var search_from_remittance_amount        = htmlspecialchars(form_data.search_from_remittance_amount);
    var search_to_remittance_amount          = htmlspecialchars(form_data.search_to_remittance_amount);
    var search_from_credit_amount       = htmlspecialchars(form_data.search_from_credit_amount);
    var search_to_credit_amount        = htmlspecialchars(form_data.search_to_credit_amount);
    var search_from_tds_amount   = htmlspecialchars(form_data.search_from_tds_amount);
    var search_to_tds_amount   = htmlspecialchars(form_data.search_to_tds_amount);
    var search_from_wallet_amount   = htmlspecialchars(form_data.search_from_wallet_amount);
    var search_to_wallet_amount   = htmlspecialchars(form_data.search_to_wallet_amount);
    var search_from_amount_received   = htmlspecialchars(form_data.search_from_amount_received);
    var search_to_amount_received   = htmlspecialchars(form_data.search_to_amount_received);
    var search_from_outstanding_amount   = htmlspecialchars(form_data.search_from_outstanding_amount);
    var search_to_outstanding_amount   = htmlspecialchars(form_data.search_to_outstanding_amount);
    var search_from_paid_amount   = htmlspecialchars(form_data.search_from_paid_amount);
    var search_to_paid_amount   = htmlspecialchars(form_data.search_to_paid_amount);
    var search_status_checkbox_value        = form_data.search_status_checkbox_value;
    var search_vendor_name_checkbox_value   = form_data.search_vendor_name_checkbox_value;
    var search_date                         = htmlspecialchars(form_data.search_date);

    var user_id                             = form_data.id;
    if(reset_flag == '1')
    {
        search_from_payable_invoice_amount     = '';
        search_airway_bill_no                  = '';
        search_to_payable_invoice_amount       = '';
        search_from_remittance_amount          = '';
        search_to_remittance_amount            = '';
        search_from_credit_amount              = '';
        search_to_credit_amount                = '';
        search_from_tds_amount                 = '';
        search_to_tds_amount                   = '';
        search_from_wallet_amount              = '';
        search_to_wallet_amount                = '';
        search_from_amount_received            = '';
        search_to_amount_received              = '';
        search_from_outstanding_amount         = '';
        search_to_outstanding_amount           = '';
        search_to_paid_amount                  = '';
        search_to_paid_amount                  = '';
        search_vendor_name_checkbox_value      = [];
        search_status_checkbox_value           = [];
        search_date                            = htmlspecialchars(form_data.search_date);
    }
    
    var invoice_id_list = '';
    if (search_airway_bill_no != '')
    {
        custom_invoice_id_filter = '';
        var awb_numbers = Array.from(new Set(search_airway_bill_no.split(/(\s+)/)));
        var search_value_list    = awb_numbers.join("','");
        custom_invoice_id_filter += " is_deleted='0' and (airway_bill_no IN ('"+search_value_list+"') or order_no IN ('"+search_value_list+"'))";

        var get_invoice_id_query              = `select invoice_id from order_management_billing where `+custom_invoice_id_filter;
        
        var result_get_invoice_id_query =JSON.parse(await billing.commonSelectQuery(get_invoice_id_query));
        console.log(get_invoice_id_query);
        var all_invoice_id_data_array = [];
        if(result_get_invoice_id_query.length==0)
        {
            res.status(200).json({
                status : "success",
                status_code : 200,
                data_array: [],
                draw: parseInt(draw),
                recordsFiltered: parseInt(0),
                recordsTotal: parseInt(0)
            });
            return;
        }
        for (const total_amount of result_get_invoice_id_query) 
        {
            all_invoice_id_data_array.push(total_amount['invoice_id']);
        }
        if(all_invoice_id_data_array.length>0)
        {
            invoice_id_list = all_invoice_id_data_array.join("','");
        }
    }
    var custom_filter = "";
    await new Promise(resolve => setTimeout(resolve, 500));
    if(invoice_id_list != '')
    {
        custom_filter = " bi.is_deleted = 0 and bi.id IN (" +invoice_id_list+ ") ";
    }
    else
    {
        custom_filter = " bi.is_deleted = 0 ";
    }
    console.log(custom_filter);
    var search_vendor_id_checkbox = '';
    if (search_vendor_name_checkbox_value.length>0)
    {
        search_vendor_name_checkbox_value.forEach(search_vendor_name_value => search_vendor_id_checkbox += search_vendor_name_value);
        if(search_vendor_id_checkbox.length > 1)
        {
            search_vendor_id_checkbox = search_vendor_id_checkbox.substr(0, -1);
        }
    }
    else
    {
        search_vendor_id_checkbox = '';
    }
    if (search_vendor_id_checkbox != '')
    {
        custom_filter += "  and bi.user_id IN (" +search_vendor_id_checkbox + ")";
    }
    else
    {
        custom_filter += " and bi.user_id ="+user_id;
    }

    if (search_invoice_code > 0)
    {
        custom_filter += "  and bi.invoice_no = '" +search_invoice_code + "'";
    }

    var search_status_checkbox = "";
    if (search_status_checkbox_value.length>0)
    {
        var i = 0;
        search_status_checkbox_value.forEach(search_status_value => {if(i==0){search_status_checkbox += search_status_value; i++;}
        else{
            search_status_checkbox += ','+search_status_value
        }
        });
        if(search_status_checkbox != "")
        {
            custom_filter += "  and bi.status IN (" + search_status_checkbox + ")";
           // search_status_checkbox = search_status_checkbox.substr(0, -1);
        }
       
        
    }
    
    
    if(search_from_payable_invoice_amount != '' && search_to_payable_invoice_amount != '')
    {
        if(search_from_payable_invoice_amount <= search_to_payable_invoice_amount)
        {
            custom_filter += " and bi.invoice_amount >= "+search_from_payable_invoice_amount+" and bi.invoice_amount <= "+search_to_payable_invoice_amount;
        }
    }
    else
    {
        if(search_from_payable_invoice_amount != '')
        {
            custom_filter += " and bi.invoice_amount >= "+search_from_payable_invoice_amount;
        }
        else
        {
            if(search_to_payable_invoice_amount != '')
            {
                custom_filter += " and bi.invoice_amount <= "+search_to_payable_invoice_amount;
            }
        }
    }

    
    if(search_from_remittance_amount != '' && search_to_remittance_amount != '')
    {
        if(search_from_remittance_amount <= search_to_remittance_amount)
        {
            custom_filter += " and bi.remittance_amount >= "+search_from_remittance_amount+" and bi.remittance_amount <= "+search_to_remittance_amount;
        }
    }
    else
    {
        if(search_from_remittance_amount != '')
        {
            custom_filter += " and bi.remittance_amount >= "+search_from_remittance_amount;
        }
        else
        {
            if(search_to_remittance_amount != '')
            {
                custom_filter += " and bi.remittance_amount <= "+search_to_remittance_amount;
            }
        }
    }

    if(search_from_credit_amount != '' && search_to_credit_amount != '')
    {
        if(search_from_credit_amount <= search_to_credit_amount)
        {
            custom_filter += " and bi.credit_amount >= "+search_from_credit_amount+" and bi.credit_amount <= "+search_to_credit_amount;
        }
    }
    else
    {
        if(search_from_credit_amount != '')
        {
            custom_filter += " and bi.credit_amount >= "+search_from_credit_amount;
        }
        else
        {
            if(search_to_credit_amount != '')
            {
                custom_filter += " and bi.credit_amount <= "+search_to_credit_amount;
            }
        }
    }

    
    if(search_from_tds_amount != '' && search_to_tds_amount != '')
    {
        if(search_from_tds_amount <= search_to_tds_amount)
        {
            custom_filter += " and bi.tds_amount >= "+search_from_tds_amount+" and bi.tds_amount <= "+search_to_tds_amount;
        }
    }
    else
    {
        if(search_from_tds_amount != '')
        {
            custom_filter += " and bi.tds_amount >= "+search_from_tds_amount;
        }
        else
        {
            if(search_to_tds_amount != '')
            {
                custom_filter += " and bi.tds_amount <= "+search_to_tds_amount;
            }
        }
    }

    
    if(search_from_wallet_amount != '' && search_to_wallet_amount != '')
    {
        if(search_from_wallet_amount <= search_to_wallet_amount)
        {
            custom_filter += " and bi.wallet_amount >= "+search_from_wallet_amount+" and bi.wallet_amount <= "+search_to_wallet_amount;
        }
    }
    else
    {
        if(search_from_wallet_amount != '')
        {
            custom_filter += " and bi.wallet_amount >= "+search_from_wallet_amount;
        }
        else
        {
            if(search_to_wallet_amount != '')
            {
                custom_filter += " and bi.wallet_amount <= "+search_to_wallet_amount;
            }
        }
    }
    
    if(search_from_amount_received != '' && search_to_amount_received != '')
    {
        if(search_from_amount_received <= search_to_amount_received)
        {
            custom_filter += " and bi.paid_amount >= "+search_from_amount_received+" and bi.paid_amount <= "+search_to_amount_received;
        }
    }
    else
    {
        if(search_from_amount_received != '')
        {
            custom_filter += " and bi.paid_amount >= "+search_from_amount_received;
        }
        else
        {
            if(search_to_amount_received != '')
            {
                custom_filter += " and bi.paid_amount <= "+search_to_amount_received;
            }
        }
    }

    
    var custom_having_filter = '';
    if(search_from_paid_amount != '' && search_to_paid_amount != '')
    {
        if(search_from_paid_amount <= search_to_paid_amount)
        {
            custom_having_filter += " (paid_amount_calculated >= "+search_from_paid_amount+" and paid_amount_calculated <= "+search_to_paid_amount+") ";
        }
    }
    else
    {
        if(search_from_paid_amount != '')
        {
            custom_having_filter += " (paid_amount_calculated >= "+search_from_paid_amount+") ";
        }
        else
        {
            if(search_to_paid_amount != '')
            {
                custom_having_filter += " (paid_amount_calculated <= "+search_to_paid_amount+") ";
            }
        }
    }

    
    if(search_from_outstanding_amount != '' && search_to_outstanding_amount != '')
    {
        if(search_from_outstanding_amount <= search_to_outstanding_amount)
        {
            if(custom_having_filter == '')
            {
                custom_having_filter = '';
            }
            else
            {
                custom_having_filter += ' and ';
            }
            custom_having_filter += " (temp_outstanding_amount >= "+search_from_outstanding_amount+" and temp_outstanding_amount <= "+search_to_outstanding_amount+") ";
        }
    }
    else
    {
        if(search_from_outstanding_amount != '')
        {
            if(custom_having_filter == '')
            {
                custom_having_filter = '';
            }
            else
            {
                custom_having_filter += ' and ';
            }
            custom_having_filter += " (temp_outstanding_amount >= "+search_from_outstanding_amount+") ";
        }
        else
        {
            if(search_to_outstanding_amount != '')
            {
                if(custom_having_filter == '')
                {
                    custom_having_filter = '';
                }
                else
                {
                    custom_having_filter += ' and ';
                }
                custom_having_filter += " (temp_outstanding_amount <= "+search_to_outstanding_amount+") ";
            }
        }
    }

    if(custom_having_filter != '')
    {
        custom_having_filter = " having "+custom_having_filter;
    }

    var custom_having_filter1 = '';
    if(search_from_paid_amount != '' && search_to_paid_amount != '')
    {
        if(search_from_paid_amount <= search_to_paid_amount)
        {
            custom_having_filter1 += " having paid_amount_calculated >= "+search_from_paid_amount+" and paid_amount_calculated <= "+search_to_paid_amount+" ";
        }
    }
    else
    {
        if(search_from_paid_amount != '')
        {
            custom_having_filter1 += " having paid_amount_calculated >= "+search_from_paid_amount+" ";
        }
        else
        {
            if(search_to_paid_amount != '')
            {
                custom_having_filter1 += " having paid_amount_calculated <= "+search_to_paid_amount+" ";
            }
        }
    }

    var custom_having_filter2 = '';
    if(search_from_outstanding_amount != '' && search_to_outstanding_amount != '')
    {
        if(search_from_outstanding_amount <= search_to_outstanding_amount)
        {
            custom_having_filter2 += " having temp_outstanding_amount >= "+search_from_outstanding_amount+" and temp_outstanding_amount <= "+search_to_outstanding_amount+" ";
        }
    }
    else
    {
        if(search_from_outstanding_amount != '')
        {
            custom_having_filter2 += " having temp_outstanding_amount >= "+search_from_outstanding_amount+" ";
        }
        else
        {
            if(search_to_outstanding_amount != '')
            {
                custom_having_filter2 += " having temp_outstanding_amount <= "+search_to_outstanding_amount+" ";
            }
        }
    }
    if (search_date != '')
    {
        var explode_date = Array.from(new Set(search_date.split(" ")));
        //console.log(explode_date);
        var start_date   = explode_date[0];
        var end_date     = explode_date[1];
        if (typeof end_date === 'undefined') {
            end_date = start_date;
          }
        //console.log(start_date+"  "+end_date);
        custom_filter += "  and CAST(bi.invoice_date as DATE) >= '" + start_date + "' and CAST(bi.invoice_date as DATE) <= '" + end_date + "'";
    }
    var get_query = `select bi.*,u.first_name,u.last_name,u.company_name,(bi.invoice_amount-(bi.paid_amount + bi.remittance_amount + bi.credit_amount + bi.wallet_amount+ bi.tds_amount)) as temp_outstanding_amount,(bi.remittance_amount + bi.credit_amount + bi.tds_amount + bi.wallet_amount + bi.paid_amount) as paid_amount_calculated from billing bi left join user u on bi.user_id=u.id where `+custom_filter +custom_having_filter ;

    var result_get_query = JSON.parse( await billing.commonSelectQuery(get_query));
    
    var all_row_data_array = [];
    
    for (const total_amount of result_get_query) 
    {
        all_row_data_array.push(total_amount);
    }
    //console.log(all_row_data_array);
    var total_data = 0;
    if(all_row_data_array.length>0)
    {
        total_data = all_row_data_array.length;
    }
    else
    {
        total_data = 0;
    }
    

    var get_query_2    = `select bi.*,u.first_name,u.last_name,u.company_name,(bi.invoice_amount-(bi.paid_amount + bi.remittance_amount + bi.credit_amount + bi.wallet_amount+ bi.tds_amount)) as temp_outstanding_amount,(bi.remittance_amount + bi.credit_amount + bi.tds_amount + bi.wallet_amount + bi.paid_amount) as paid_amount_calculated from billing bi left join user u on bi.user_id=u.id where `+custom_filter + custom_having_filter+` LIMIT `+limit_start+`,`+limit_end;
    
    var result_get_query2 =JSON.parse(await billing.commonSelectQuery(get_query_2));
    
    var all_row_data_array2 = [];
    
    for (const total_amount of result_get_query2) 
    {
        all_row_data_array2.push(total_amount);
        
    }
    
    var data = [];
    if (all_row_data_array2.length > 0)
    {
        all_row_data_array2.forEach(all_data =>
        {
           // console.log("all_row_data_array2");
            var return_array = {};
            const pattern = date.compile('YYYY-MMM-DD');
            var row_id                         = all_data['id'];
            var vendor_name                    = all_data['company_name'];
            var invoice_date                   = all_data['invoice_date'];
            invoice_date = invoice_date;
            var invoice_due_date=new Date(invoice_date);
            invoice_due_date.setDate(invoice_due_date.getDate()+ 7);
            invoice_due_date= invoice_due_date;

            //var invoice_due_date               = new Date(invoice_date).setDate(invoice_date + 7);
            var invoice_amount                 = all_data['invoice_amount'];
            var billing_amount                 = all_data['remittance_amount'];
            var credit_amount                  = all_data['credit_amount'];
            var tds_amount                     = all_data['tds_amount'];
            var wallet_amount                  = all_data['wallet_amount'];
            var paid_amount                    = all_data['paid_amount'];
            var paid_amount_calculated         = all_data['paid_amount_calculated'];
            var temp_outstanding_amount        = all_data['temp_outstanding_amount'];
            var status                         = all_data['status'];
            if(status == 0)
            {
                return_array["status"]="Unpaid";
                status = '<div class="datatable-color-box-outer"><div class="red-box">Unpaid</div></div>';
            }
            else if(status == 1)
            {
                return_array["status"]="Partial Paid";
                status = '<div class="datatable-color-box-outer"><div class="blue-box">Partial Paid</div></div>';
            }
            else if(status == 2)
            {
                return_array["status"]="Paid";
                status = '<div class="datatable-color-box-outer"><div class="green-box">Paid</div></div>';
            }
            else
            {
                return_array["status"]="";
                status = '';
            }
            var invoice_code                   = all_data['invoice_code'];
            var invoice_year                   = all_data['invoice_year'];
            var invoice_no                     = all_data['invoice_no'];
            var invoice_format = "";
            if(row_id >= 4263)
            {
                invoice_format = invoice_code+''+invoice_year+'/'+invoice_no;
            }
            else
            {
                invoice_format = invoice_code+'/'+invoice_year+'/'+invoice_no;
            }

            invoice_no                     = invoice_format;
            return_array["invoice_no"]=invoice_no;
            var invoice_type                   = all_data['invoice_type'];
            return_array["invoice_type"]=invoice_type;
            var mpdf_link = 'print-billing-invoice';
            return_array["mpdf_link"]="print-billing-invoice";
            if(invoice_type == 1)//early cod
            {
                mpdf_link = 'print-early-cod-invoice';
                return_array["mpdf_link"]=mpdf_link;
            }

            var nestedData   = [];
            /*nestedData[] = row_id;*/
            var user_name      = all_data['first_name']+' '+all_data['last_name'];
            if(user_name != '')
            {
                if(vendor_name == '')
                {
                    vendor_name   = user_name;
                }
                else
                {
                    vendor_name   = vendor_name+' - '+user_name;
                }
            }
            return_array["vendor_name"]=vendor_name;
            if(vendor_name.length >= 15)
            {
                vendor_name = '<div class="tooltip_class" data-toggle="tooltip" title="'+vendor_name+'" data-html="true" data-placement="right">'+vendor_name.substr(0, 15)+' ...</div>';
            }

            nestedData.push(vendor_name);
            return_array["row_id"]=row_id;
            return_array["invoice_no"]=invoice_no;
            
            nestedData.push('<a href="'+base_url+'view-invoice-detail/'+row_id+'" class="datatable-blue" target="_blank">'+invoice_no+'</a>');
            nestedData.push(invoice_date);
            nestedData.push(invoice_due_date);
            return_array["invoice_date"]=invoice_date;
            return_array["invoice_due_date"]=invoice_due_date;
            return_array["invoice_amount"]=currencyFormatter.format(invoice_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            return_array["cod_adjusted"]=currencyFormatter.format(billing_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            return_array["credit_amount"]=currencyFormatter.format(credit_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            return_array["tds_amount"]=currencyFormatter.format(tds_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            return_array["wallet_amount"]=currencyFormatter.format(wallet_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            return_array["amount_received"]=currencyFormatter.format(paid_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            return_array["paid_amount_calculated"]=currencyFormatter.format(paid_amount_calculated, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            return_array["temp_outstanding_amount"]=currencyFormatter.format(temp_outstanding_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            nestedData.push('<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(invoice_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
            nestedData.push( '<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(billing_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
            nestedData.push( '<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(credit_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
            nestedData.push('<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(tds_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
            nestedData.push( '<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(wallet_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
            nestedData.push( '<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(paid_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
            nestedData.push( '<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(paid_amount_calculated, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
            nestedData.push( '<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(temp_outstanding_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
            nestedData.push(status);

            if(invoice_type == 1)
            {
                
                nestedData.push( `<a target="_blank" href="` +base_url+`vendor_plugins/mpdf/`+mpdf_link+`/`+row_id+`" class="action-icon"><img src="`+base_url_images+`print.svg" class="tooltip_class_action" data-toggle="tooltip" title="Print" data-html="true"></a>
                        <a onclick="download_bill_summary_invoice(`+row_id+`)" class="action-icon"><img src="`+base_url_images+`download.svg" class="tooltip_class_action" data-toggle="tooltip" title="Download" data-html="true"></a>`);
            }
            
            else
            {
                nestedData.push(`<a onclick="view_bill_summary_details(`+row_id+`)" class="action-icon" style="display:none;"><img src="`+base_url_images+`eye.svg"></a>
                        <a target="_blank" href="` +base_url+`vendor_plugins/mpdf/`+mpdf_link+`/` +row_id+`" class="action-icon"><img src="`+base_url_images+`print.svg" class="tooltip_class_action" data-toggle="tooltip" title="Print" data-html="true"></a>
                        <a href="`+base_url+`view-invoice-detail/  `+row_id+`" class="datatable-blue" target="_blank"><img src="`+base_url_images+`info.svg" class="tooltip_class_action" data-toggle="tooltip" title="Invoice Details" data-html="true"></a>
                        <a onclick="download_bill_summary_invoice(`+row_id+`)" class="action-icon"><img src="`+base_url_images+`download.svg" class="tooltip_class_action" data-toggle="tooltip" title="Download" data-html="true"></a>`);
            }
            data.push(return_array);
            //data.push(nestedData);
        });
    }

    res.status(200).json({
        status : "success",
        status_code : 200,
        data_array: data,
        draw: parseInt(draw),
        recordsFiltered: parseInt(total_data),
        recordsTotal: parseInt(total_data)
    });
    return;
}

exports.all_remittance_table_data = async function(form_data, req, res, next) 
{  
    var userdata = [];
    var base_url_images = "https://manage-cdn.ithinklogistics.com/manage/theme2/assets/images/";
    var base_url = "";
    var draw                                = htmlspecialchars(form_data.draw);
    var limit_start                         = htmlspecialchars(form_data.start);
    var limit_end                           = htmlspecialchars(form_data.length);
    var reset_flag                          = htmlspecialchars(form_data.reset_flag);
    var search_remittance_id                    = htmlspecialchars(form_data.search_remittance_id);
    var search_awb_no                    = htmlspecialchars(form_data.search_awb_no);
    var search_from_remittance_amount        = htmlspecialchars(form_data.search_from_remittance_amount);
    var search_to_remittance_amount          = htmlspecialchars(form_data.search_to_remittance_amount);
    var search_from_bill_deduct_amount               = htmlspecialchars(form_data.search_from_bill_deduct_amount);
    var search_to_bill_deduct_amount                 = htmlspecialchars(form_data.search_to_bill_deduct_amount);
    
    var search_from_refund_amount       = htmlspecialchars(form_data.search_from_refund_amount);
    var search_to_refund_amount        = htmlspecialchars(form_data.search_to_refund_amount);
    var search_from_early_cod_amount   = htmlspecialchars(form_data.search_from_early_cod_amount);
    var search_to_early_cod_amount   = htmlspecialchars(form_data.search_to_early_cod_amount);
    var search_from_wallet_transfer_amount   = htmlspecialchars(form_data.search_from_wallet_transfer_amount);
    var search_to_wallet_transfer_amount   = htmlspecialchars(form_data.search_to_wallet_transfer_amount);
    var search_from_advance_hold_amount   = htmlspecialchars(form_data.search_from_advance_hold_amount);
    var search_to_advance_hold_amount   = htmlspecialchars(form_data.search_to_advance_hold_amount);
    var search_from_rem_amount_processed   = htmlspecialchars(form_data.search_from_rem_amount_processed);
    var search_to_rem_amount_processed   = htmlspecialchars(form_data.search_to_rem_amount_processed);
    var search_status_checkbox_value        = form_data.search_status_checkbox_value;
    var search_vendor_name_checkbox_value   = form_data.search_vendor_name_checkbox_value;
    var search_date                         = htmlspecialchars(form_data.search_date);

    var user_id                             = form_data.id;
    if(reset_flag == '1')
    {
        search_remittance_id               = '';
        search_awb_no                      = '';
        search_from_remittance_amount      = '';
        search_to_remittance_amount        = '';
        search_from_bill_deduct_amount     = '';
        search_to_bill_deduct_amount       = '';
        search_from_refund_amount          = '';
        search_to_refund_amount            = '';
        search_from_early_cod_amount       = '';
        search_to_early_cod_amount         = '';
        search_from_wallet_transfer_amount = '';
        search_to_wallet_transfer_amount   = '';
        search_from_advance_hold_amount    = '';
        search_to_advance_hold_amount      = '';
        search_from_rem_amount_processed   = '';
        search_to_rem_amount_processed     = '';
        search_vendor_name_checkbox_value      = [];
        search_status_checkbox_value           = [];
        search_date                            = htmlspecialchars(form_data.search_date);
    }
    var all_remittance_id_data_array = [];
    var remittance_id_list = '';
    if (search_awb_no != '')
    {
        custom_remittance_id_filter = '';
        awb_numbers = Array.from(new Set(search_awb_no.split(/(\s+)/)));
        var search_value_list    = awb_numbers.join("','");
        custom_remittance_id_filter += " is_deleted='0' and (airway_bill_no IN ('"+search_value_list+"') or order_no IN ('"+search_value_list+"'))";
        var result_get_remittance_id_query = '';
        
        var results = new Promise(async(resolve, reject) => {
        var get_remittance_id_query              = `select itl_remittance_id from order_management where `+custom_remittance_id_filter;
        
        result_get_remittance_id_query = JSON.parse(await billing.commonSelectQuery(get_remittance_id_query));
        console.log("awbno");
        console.log(result_get_remittance_id_query.length);
        resolve();
        });
      
        results.then(() => {
        console.log("awbno1");
        console.log(result_get_remittance_id_query);
        if(result_get_remittance_id_query.length==0)
        {
            res.status(200).json({
                status : "success",
                status_code : 200,
                data_array: [],
                draw: parseInt(draw),
                recordsFiltered: parseInt(0),
                recordsTotal: parseInt(0)
            });
            return;
        }
        
        //all_remittance_id_data_array = result_get_remittance_id_query;
        for (const total_amount of result_get_remittance_id_query) 
        {
            all_remittance_id_data_array.push(total_amount['itl_remittance_id']);
            //all_remittance_id_data_array.push(total_amount['invoice_id']);
        }
        
        if(all_remittance_id_data_array.length>0)
        {
            remittance_id_list = all_remittance_id_data_array.join("','");
        }
        console.log(remittance_id_list);
        });
    }
    
    //console.log("all_remittance_id_data_array");
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(remittance_id_list);
    var custom_filter = "";
    if(remittance_id_list.length == 0)
    {
        custom_filter = "r.is_deleted = 0";
        
    }
    else
    {
        custom_filter = "r.is_deleted = 0 and r.id IN (" +remittance_id_list+ ") ";
    }
    console.log(custom_filter);
    var custom_awb_no_filter = '';
    custom_filter += " and (r.rem_in_amount > 0 or r.rem_out_amount > 0 or r.rem_amount_processed > 0)";
    var search_vendor_id_checkbox = '';
    if (search_vendor_id_checkbox != '')
    {
        custom_filter += " and r.user_id IN (" + search_vendor_id_checkbox + ") and r.rem_out_amount > 0";
        custom_awb_no_filter += " and user_id IN (" + search_vendor_id_checkbox + ")";
    }
    else
    {
        custom_filter += " and r.user_id IN (" +user_id + ") and r.rem_out_amount > 0";
        custom_awb_no_filter += " and user_id IN (" +user_id + ")";
    }

    
    if (search_remittance_id != '')
    {
        custom_filter += "  and r.remittance_id = '" +search_remittance_id + "'";
    }

    if(search_from_remittance_amount != '' && search_to_remittance_amount != '')
    {
        if(search_from_remittance_amount <= search_to_remittance_amount)
        {
            custom_filter += " and r.rem_out_amount >= "+search_from_remittance_amount+" and r.rem_out_amount <= "+search_to_remittance_amount;
        }
    }
    else
    {
        if(search_from_remittance_amount != '')
        {
            custom_filter += " and r.rem_out_amount >= "+search_from_remittance_amount;
        }
        else
        {
            if(search_to_remittance_amount != '')
            {
                custom_filter += " and r.rem_out_amount <= "+search_to_remittance_amount;
            }
        }
    }

    if(search_from_bill_deduct_amount != '' && search_to_bill_deduct_amount != '')
    {
        if(search_from_bill_deduct_amount <= search_to_bill_deduct_amount)
        {
            custom_filter += " and r.bill_deduct_amount >= "+search_from_bill_deduct_amount+" and r.bill_deduct_amount <= "+search_to_bill_deduct_amount;
        }
    }
    else
    {
        if(search_from_bill_deduct_amount != '')
        {
            custom_filter += " and r.bill_deduct_amount >= "+search_from_bill_deduct_amount;
        }
        else
        {
            if(search_to_bill_deduct_amount != '')
            {
                custom_filter += " and r.bill_deduct_amount <= "+search_to_bill_deduct_amount;
            }
        }
    }

    if(search_from_refund_amount != '' && search_to_refund_amount != '')
    {
        if(search_from_refund_amount <= search_to_refund_amount)
        {
            custom_filter += " and r.refund_amount >= "+search_from_refund_amount+" and r.refund_amount <= "+search_to_refund_amount;
        }
    }
    else
    {
        if(search_from_refund_amount != '')
        {
            custom_filter += " and r.refund_amount >= "+search_from_refund_amount;
        }
        else
        {
            if(+search_to_refund_amount != '')
            {
                custom_filter += " and r.refund_amount <= "+search_to_refund_amount;
            }
        }
    }

    
    var custom_having_filter = '';
    if(search_from_advance_hold_amount != '' && search_to_advance_hold_amount != '')
    {
        if(search_from_advance_hold_amount <= search_to_advance_hold_amount)
        {
            custom_having_filter += " having total_advance_hold_amount >= "+search_from_advance_hold_amount+" and total_advance_hold_amount <= "+search_to_advance_hold_amount;
        }
    }
    else
    {
        if(search_from_advance_hold_amount != '')
        {
            custom_having_filter = " having total_advance_hold_amount >= "+search_from_advance_hold_amount;
        }
        else
        {
            if(search_to_advance_hold_amount != '')
            {
                custom_having_filter = " having total_advance_hold_amount <= "+search_to_advance_hold_amount;
            }
        }
    }
    
    if(search_from_wallet_transfer_amount != '' && search_to_wallet_transfer_amount != '')
    {
        if(search_from_wallet_transfer_amount <= search_to_wallet_transfer_amount)
        {
            custom_filter += " and r.transferred_wallet_amount >= "+search_from_wallet_transfer_amount+" and r.transferred_wallet_amount <= "+search_to_wallet_transfer_amount;
        }
    }
    else
    {
        if(search_from_wallet_transfer_amount != '')
        {
            custom_filter += " and r.transferred_wallet_amount >= "+search_from_wallet_transfer_amount;
        }
        else
        {
            if(search_to_wallet_transfer_amount != '')
            {
                custom_filter += " and r.transferred_wallet_amount <= "+search_to_wallet_transfer_amount;
            }
        }
    }
    
    
    if(search_from_early_cod_amount != '' && search_to_early_cod_amount != '')
    {
        if(search_from_early_cod_amount <= search_to_early_cod_amount)
        {
            if(custom_having_filter != '')
            {
                custom_having_filter += " and early_cod_charges >= "+search_from_early_cod_amount+" and early_cod_charges <= "+search_to_early_cod_amount;
            }
            else
            {
                custom_having_filter += " having early_cod_charges >= "+search_from_early_cod_amount+" and early_cod_charges <= "+search_to_early_cod_amount;
            }
            
        }
    }
    else
    {
        if(search_from_early_cod_amount != '')
        {
            if(custom_having_filter != '')
            {
                custom_having_filter = " and early_cod_charges >= "+search_from_early_cod_amount;
            }
            else
            {
                custom_having_filter = " having early_cod_charges >= "+search_from_early_cod_amount;
            }
            
        }
        else
        {
            if(search_to_early_cod_amount != '')
            {
                if(custom_having_filter != '')
                {
                    custom_having_filter = " and early_cod_charges <= "+search_to_early_cod_amount;
                }
                else
                {
                    custom_having_filter = " having early_cod_charges <= "+search_to_early_cod_amount;
                }
                
            }
        }
    }
    if(search_from_rem_amount_processed != '' && search_to_rem_amount_processed != '')
    {
        if(search_from_rem_amount_processed <= search_to_rem_amount_processed)
        {
            custom_filter += " and r.rem_amount_processed >= "+search_from_rem_amount_processed+" and r.rem_amount_processed <= "+search_to_rem_amount_processed;
        }
    }
    else
    {
        if(search_from_rem_amount_processed != '')
        {
            custom_filter += " and r.rem_amount_processed >= "+search_from_rem_amount_processed;
        }
        else
        {
            if(search_to_rem_amount_processed != '')
            {
                custom_filter += " and r.rem_amount_processed <= "+search_to_rem_amount_processed;
            }
        }
    }

    var search_status_checkbox = 0;
    if (search_status_checkbox_value.length>0)
    {
        var i = 0;
        search_status_checkbox_value.forEach(search_status_value => {if(i==0){search_status_checkbox += search_status_value; i++;}
        else{
            search_status_checkbox += ','+search_status_value
        }
        });
        if(search_status_checkbox != '')
        {
            custom_filter += "  and r.status IN (" + search_status_checkbox + ")";
           // search_status_checkbox = search_status_checkbox.substr(0, -1);
        }
       
        
    }
    if (search_date != '')
    {
        var explode_date = Array.from(new Set(search_date.split(" ")));
        //console.log(explode_date);
        var start_date   = explode_date[0];
        var end_date     = explode_date[1];
        if (typeof end_date === 'undefined') {
            end_date = start_date;
          }
        custom_filter += "  and CAST(r.remittance_date as DATE) >= '" + start_date + "' and CAST(r.remittance_date as DATE) <= '" + end_date + "'";
    }
    var total_data = 0;
    if(custom_having_filter == '')
    {
        var get_count_query    = "select count(*) as total_data from remittance r left join user u on r.user_id=u.id where "+custom_filter;
        //console.log(get_count_query)
        var result_get_query = JSON.parse(await billing.commonSelectQuery(get_count_query));
        console.log(result_get_query);
        //var all_row_data_array2 = [];

        var total_data_array = [];
    
        for (const total_amount of result_get_query) 
        {
            console.log(total_amount.total_data);
            total_data = total_amount.total_data;
            total_data_array = total_amount;
        }
        //total_data         = result_get_query[0].total_data;
        
    }
    else
    {
        get_count_query    = "select count(*) from (select (r.rem_out_amount-(r.bill_deduct_amount + r.rem_amount_processed + r.refund_amount + r.rem_transaction_charges + r.rem_transaction_gst+ r.transferred_wallet_amount)) as total_advance_hold_amount,(r.rem_transaction_charges + rem_transaction_gst) as early_cod_charges from remittance r left join user u on r.user_id=u.id where "+custom_filter +custom_having_filter+" )  as total_count";
     
        var result_get_query = JSON.parse(await billing.commonSelectQuery(get_count_query));
        console.log(result_get_query);
        //var all_row_data_array2 = [];JSON.parse(result_get_query)

        var total_data_array = [];
    
        for (const total_amount of result_get_query) 
        {
            console.log(total_amount.total_data);
            total_data = total_amount.total_data;
            total_data_array = total_amount.total_data;
        }
        //total_data         = result_get_query[0].total_data;
    }

    var get_query              = "select (r.rem_out_amount-(r.bill_deduct_amount + r.rem_amount_processed + r.refund_amount + r.rem_transaction_charges + r.rem_transaction_gst + r.transferred_wallet_amount)) as total_advance_hold_amount,(r.rem_transaction_charges + rem_transaction_gst) as early_cod_charges,r.*,u.first_name,u.last_name,u.company_name from remittance r left join user u on r.user_id=u.id where "+custom_filter +custom_having_filter+" LIMIT "+limit_start+","+limit_end;
    var result_get_query       = await billing.commonSelectQuery(get_query);
    var all_row_data_array = [];
    console.log(get_query);
    
    for (const row_get_query of result_get_query) 
    {
        //console.log(total_amount.total_data)
        //all_row_data_array.push(row_get_query);
    }
    all_row_data_array = JSON.parse(result_get_query);
    console.log(all_row_data_array);
    var data_value = [];
    
    if (all_row_data_array.length > 0)
    {
        var bar = new Promise((resolve, reject) => {
        all_row_data_array.forEach(async (all_data, index, array) =>
        {
            console.log(all_data);
            if (1)
            {
                
                const pattern = date.compile('YYYY-MM-DD');
                var row_id                         = all_data['id'];
                var remittance_id                  = all_data['remittance_id'];
                var remittance_date1                = all_data['remittance_date'];
                var remittance_date                    = remittance_date1;
                var vendor_name                    = all_data['company_name'];
                var rem_out_amount                 = all_data['rem_out_amount'];
                var bill_deduct_amount             = all_data['bill_deduct_amount'];
                var refund_amount                  = all_data['refund_amount'];
                var advance_hold_amount            = all_data['total_advance_hold_amount'];
                var early_cod_charges              = all_data['early_cod_charges'];
                var transferred_wallet_amount      = all_data['transferred_wallet_amount'];
                var rem_amount_processed           = all_data['rem_amount_processed'];
                var remarks                        = all_data['remarks'];
                var status                         = all_data['status'];
                console.log(row_id);
                var return_array = {};
                if(status == 1)
                {
                    status1 = "Not Processed";
                    status = '<div class="datatable-color-box-outer"><div class="red-box">Not Processed</div></div>';
                }
                else if(status == 2)
                {
                    status1 = "Processed";
                    status = '<div class="datatable-color-box-outer"><div class="green-box">Processed</div></div>';
                }
                else
                {
                    status1 = "";
                    status = '';
                }
                
            
                var total_refund_count = 0;
                var result_get_refund_awb_query           = '';
                new Promise(async(resolve, reject) => {
                var get_refund_awb_query = "SELECT count(*) as total_refund_count FROM remittance_refund_awb where remittance_id = "+row_id+" and is_deleted = 0";

                result_get_refund_awb_query           = await billing.commonSelectQuery(get_refund_awb_query);
                resolve(); 
                });
                var all_remittance_id_data_array = [];
                
                for (const row_get_remittance_refund_query of result_get_refund_awb_query) 
                {
                    total_refund_count = row_get_remittance_refund_query['total_refund_count'];
                }
                var nestedData = [];

                var user_name      = all_data['first_name']+' '+all_data['last_name'];
                if(user_name != '')
                {
                    if(vendor_name == '')
                    {
                        vendor_name   = user_name;
                    }
                    else
                    {
                        vendor_name   = vendor_name+' - '+user_name;
                    }
                }
                return_array["vendor_name"]=vendor_name;
                if(vendor_name.length >= 15)
                {
                    vendor_name = '<div class="tooltip_class" data-toggle="tooltip" title="'+vendor_name+'" data-html="true" data-placement="right">'+vendor_name.substr(0,15)+' ...</div>';
                }
                
                nestedData.push(vendor_name);
                
                nestedData.push(remittance_id);
                return_array["remittance_id"]=remittance_id;
                return_array["remittance_date"]=remittance_date;
                nestedData.push(remittance_date);
                if(remarks.length >= 11)
                {
                    remarks = '<div class="tooltip_class_action" data-toggle="tooltip" title="'+remarks+'" data-html="true" data-placement="right">'+remarks.substr(0,11)+' ...</div>';
                }
                nestedData.push('<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(rem_out_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
                return_array["remarks"] = remarks;
                return_array["cod_generated"]=currencyFormatter.format(rem_out_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
                if(bill_deduct_amount > 0)
                {
                    nestedData.push('<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(bill_deduct_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },})+'<a style="padding-left:5px;" onclick="view_bill_deduct_list('+row_id+')"><img src="'+base_url_images+'info.svg" class="tooltip_class_action" data-toggle="tooltip" title="Bill Deduct List" data-html="true"></a>');
                    return_array["bill_adjusted"]=currencyFormatter.format(bill_deduct_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
                }
                else
                {
                    nestedData.push('<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(bill_deduct_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
                    return_array["bill_adjusted"]=currencyFormatter.format(bill_deduct_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
                }
                var list_of_awb_no = '';
                if(total_refund_count > 0)
                {
                    list_of_awb_no += '<a onclick="view_refund_awb('+row_id+')" style="padding-left:5px;"><img src="'+base_url_images+'info.svg" class="tooltip_class_action" data-toggle="tooltip" title="Refund Adjusted" data-html="true"></a>'+list_of_awb_no;
                
                }
                return_array["refund_adjusted"] = currencyFormatter.format(refund_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },})+list_of_awb_no;
                return_array["early_cod_charges"] = currencyFormatter.format(early_cod_charges, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
                return_array["transferred_wallet_amount"] = currencyFormatter.format(transferred_wallet_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
                return_array["advance_hold_amount"] = currencyFormatter.format(advance_hold_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
                nestedData.push('<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(refund_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },})+list_of_awb_no);
                nestedData.push('<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(early_cod_charges, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
                nestedData.push('<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(transferred_wallet_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
                nestedData.push('<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(advance_hold_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
                if(rem_amount_processed > 0)
                {
                    return_array["cod_remitted"] = currencyFormatter.format(rem_amount_processed, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
                    return_array["row_id"] = row_id;
                    nestedData.push('<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(rem_amount_processed, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },})+'<a style="padding-left:5px;" onclick="view_amount_processed_list('+row_id+')"><img src="'+base_url_images+'info.svg" class="tooltip_class_action" data-toggle="tooltip" title="COD Remitted" data-html="true"></a>');
                }
                else 
                {
                    return_array["cod_remitted"] = currencyFormatter.format(rem_amount_processed, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
                    return_array["row_id"] = row_id;
                    nestedData.push('<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(rem_amount_processed, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
                }
                return_array["remarks"] = remarks;
                return_array["status"] = status1;
                nestedData.push(remarks);
                nestedData.push(status);
                nestedData.push(`<a onclick="view_remittance_details(`+row_id+`)" class="action-icon" style="display:none;"><img src="`+base_url_images+`eye.svg"></a>
                                <a onclick="export_remittance_details(`+row_id+`)" class="action-icon"><img src="`+base_url_images+`download.svg" class="tooltip_class_action" data-toggle="tooltip" title="Download" data-html="true"></a>`);
                
                data_value.push(return_array);
                //console.log(data_value);
                console.log("data_value");
            }
            else
            {
                total_data--;
            }
            if (index === array.length -1) resolve();
        });

        });
        bar.then(() => {
        console.log("datadsdsddsd_value");
        res.status(200).json({
            status : "success",
            status_code : 200,
            data_array: data_value,
            draw: parseInt(draw),
            recordsFiltered: parseInt(total_data),
            recordsTotal: parseInt(total_data)
        });
        return;  
        }); 
    }
    else{
        res.status(200).json({
            status : "success",
            status_code : 200,
            data_array: data_value,
            draw: parseInt(draw),
            recordsFiltered: parseInt(total_data),
            recordsTotal: parseInt(total_data)
        });
        return;   
    }

}

exports.all_shipping_charge_table_data = async function(form_data, req, res, next) 
{  
    var userdata = [];
    var base_url_images = "https://manage-cdn.ithinklogistics.com/manage/theme2/assets/images/";
    var base_url = "";
    var draw                                = htmlspecialchars(form_data.draw);
    var limit_start                         = htmlspecialchars(form_data.start);
    var limit_end                           = htmlspecialchars(form_data.length);
    var reset_flag                          = htmlspecialchars(form_data.reset_flag);
    var search_invoice_no                    = form_data.search_transaction_id;
    var search_order_no                    = htmlspecialchars(form_data.search_order_no);
    var search_airway_bill_no        = htmlspecialchars(form_data.search_awb_no);
    //var search_invoice_no          = htmlspecialchars(form_data.search_invoice_no);
    var search_logistics_checkbox_value     = form_data.search_logistics_checkbox_value == [''] ? []: form_data.search_logistics_checkbox_value;
    var search_status_checkbox_value        = form_data.search_status_checkbox_value == [""] ? [] : form_data.search_status_checkbox_value;
    var search_vendor_name_checkbox_value   = form_data.search_vendor_name_checkbox_value == [""] ? [] : form_data.search_vendor_name_checkbox_value;
    var search_zone_checkbox_value          = form_data.search_zone_checkbox_value == [""] ? [] : form_data.search_zone_checkbox_value;
    var search_date                         = htmlspecialchars(form_data.search_date);
    var search_order_date                   = htmlspecialchars(form_data.search_order_date);
    var user_id                             = form_data.id;
    if(reset_flag == '1')
    {
        search_invoice_no               = '';
        search_order_no                      = '';
        search_airway_bill_no      = '';
        search_invoice_no        = '';
        search_logistics_checkbox_value      = [];
        search_vendor_name_checkbox_value      = [];
        search_status_checkbox_value           = [];
        search_zone_checkbox_value             = [];
        search_date                            = htmlspecialchars(form_data.search_date);
    }
    var search_vendor_id_checkbox = '';
    if (search_vendor_name_checkbox_value.length > 0)
    {
        //search_vendor_id_checkbox = implode(',',search_vendor_name_checkbox_value);
        search_vendor_name_checkbox_value.forEach(search_vendor_name_value => search_vendor_id_checkbox += search_vendor_name_value);
        
        if(search_vendor_id_checkbox.length > 1)
        {
            search_vendor_id_checkbox = search_vendor_id_checkbox.substr(0, -1);
        }
    }
    else
    {
        search_vendor_id_checkbox = ``;
    }
    var custom_filter = "om.is_deleted = 0 and om.invoice_id > 0 ";
    if (search_vendor_id_checkbox != '')
    {
        custom_filter += "  and om.user_id IN (" +search_vendor_id_checkbox + ")";
    }
    else
    {
        custom_filter += " and om.user_id ="+user_id;
    }
    if (search_invoice_no != '')
    {
        custom_filter += "  and bi.invoice_no = '" +search_invoice_no + "'";
    }

    if (search_order_no != '')
    {
        custom_filter += "  and om.order_sub_order_no = '" +search_order_no + "'";
    }

    if (search_airway_bill_no != '')
    {
        awb_numbers = Array.from(new Set(search_airway_bill_no.split(/(\s+)/)));
        var search_value_list    = awb_numbers.join("','");
        custom_filter += "  and (om.airway_bill_no IN ('"+search_value_list+"') or om.order_no IN ('"+search_value_list+"'))";
    }
    
    
    var search_logistics_checkbox = "";
    if (search_logistics_checkbox_value.length>0)
    {
        
        search_logistics_checkbox_value.forEach(search_logistics_value => search_logistics_checkbox += search_logistics_value);
        
        if(search_logistics_checkbox.length > 1)
        {
            search_logistics_checkbox = search_logistics_checkbox.substr(0, -1);
        }
        //custom_filter += "  and om.logistic_id IN (" +search_logistics_checkbox + ")";
    }
    if(search_logistics_checkbox != '')
    {
        custom_filter += "  and om.logistic_id IN (" +search_logistics_checkbox + ")";
    }
    var search_status_checkbox = ""
    if (search_status_checkbox_value.length>0)
    {
        var i = 0;
        search_status_checkbox_value.forEach(search_status_value => {if(i==0){search_status_checkbox += search_status_value; i++;}
        else{
            search_status_checkbox += ','+search_status_value
        }
        });
        if(search_status_checkbox != "")
        {
            custom_filter += "  and temp_om.new_live_status IN (" +search_status_checkbox + ")";
           // search_status_checkbox = search_status_checkbox.substr(0, -1);
        }
       
        
    }
    var search_zone_checkbox = "";
    
    console.log(search_zone_checkbox_value)
    if(search_zone_checkbox_value.indexOf(0) >= 0)
        {
            //$search_zone_checkbox = implode(',',$search_zone_checkbox_value);
            //$search_zone_checkbox = '';
           
            search_zone_checkbox_value.forEach(search_zone_value => search_zone_checkbox += search_zone_value)+',';
            
            if(search_zone_checkbox.length > 1)
            {
                search_zone_checkbox = search_zone_checkbox.substr(0, -1);
            }
           
            search_zone_checkbox = search_zone_checkbox.replace("17","''");
            search_zone_checkbox = search_zone_checkbox.replace("16","'F-UP_ROS'"); 
            search_zone_checkbox = search_zone_checkbox.replace("15","'E-UP_ROS'"); 
            search_zone_checkbox = search_zone_checkbox.replace("14","'D-UP_ROS'"); 
            search_zone_checkbox = search_zone_checkbox.replace("13","'B-UP_ROS'"); 
            search_zone_checkbox = search_zone_checkbox.replace("12","'E-ROS'");
            search_zone_checkbox = search_zone_checkbox.replace("11","'D-ROS'"); 
            search_zone_checkbox = search_zone_checkbox.replace("10","'B-ROS'");
            search_zone_checkbox = search_zone_checkbox.replace("9","'E-UP'"); 
            search_zone_checkbox = search_zone_checkbox.replace("8","'D-UP'"); 
            search_zone_checkbox = search_zone_checkbox.replace("7","'B-UP'");  
            search_zone_checkbox = search_zone_checkbox.replace("6","'F'");  
            search_zone_checkbox = search_zone_checkbox.replace("5","'E'");
            search_zone_checkbox = search_zone_checkbox.replace("4","'D'");
            search_zone_checkbox = search_zone_checkbox.replace("3","'C'"); 
            search_zone_checkbox = search_zone_checkbox.replace("2","'B'"); 
            search_zone_checkbox = search_zone_checkbox.replace("1","'A'"); 
            custom_filter += "  and om.billed_zone_name IN (" +search_zone_checkbox + ")";
    }
    
    if (search_date != '')
    {
        var explode_date = Array.from(new Set(search_date.split(" ")));
        //console.log(explode_date);
        var start_date   = explode_date[0];
        var end_date     = explode_date[1];
        if (typeof end_date === 'undefined') {
            end_date = start_date;
          }
        custom_filter += "  and CAST(om.invoice_date as DATE) >= '" + start_date + "' and CAST(om.invoice_date as DATE) <= '" + end_date + "'";
    }
    if (search_order_date != '')
    {
        var explode_date = Array.from(new Set(search_order_date.split(" ")));
        //console.log(explode_date);
        var start_order_date   = explode_date[0];
        var end_order_date     = explode_date[1];
        if (typeof end_order_date === 'undefined') {
            end_order_date = start_order_date;
          }
        console.log(end_order_date)
        custom_filter += "  and CAST(om.order_date_time as DATE) >= '" + start_order_date + "' and CAST(om.order_date_time as DATE) <= '" + end_order_date + "'";
    }

    var get_count_query    = "select count(*) as total_data from order_management_billing om left join order_management temp_om on om.om_row_id=temp_om.id left join user u on om.user_id = u.id left join billing bi on om.invoice_id = bi.id where "+custom_filter;
    console.log(get_count_query);
    var result_count_query = JSON.parse(await billing.commonSelectQuery(get_count_query));
   
    var total_data_array = [];

    for (const total_amount of result_count_query) 
    {
        //console.log(total_amount.total_data)
        total_data_array = total_amount;
    }
    var total_data         = total_data_array.total_data;
    
    var get_query              = "select temp_om.new_live_status,om.id,om.invoice_id,om.airway_bill_no,om.order_no,om.suborder_no,om.logistic_id,om.invoice_date as invoice_date,om.order_date_time as order_date_time,om.billed_itl_bill_with_gst as itl_bill_with_gst,om.billed_itl_half_kg as itl_half_kg,om.billed_itl_additional_half_kg as itl_additional_half_kg,om.billed_itl_fsc_per as itl_fsc_per,om.billed_itl_cod_charge as itl_cod_charge,om.billed_itl_rto_half_kg as itl_rto_half_kg,om.billed_itl_rto_additional_half_kg as itl_rto_additional_half_kg,om.billed_itl_rto_fsc_per as itl_rto_fsc_per,om.billed_itl_bill_cgst as itl_bill_cgst,om.billed_itl_bill_sgst as itl_bill_sgst,om.billed_itl_bill_igst as itl_bill_igst,om.billable_weight_in_kg as billable_weight,om.billed_zone_name as zone_name,u.first_name,u.last_name,u.company_name,bi.invoice_code,bi.invoice_year,bi.invoice_no,bi.id as billing_invoice_id from order_management_billing om left join order_management temp_om on om.om_row_id=temp_om.id left join user u on om.user_id = u.id left join billing bi on om.invoice_id = bi.id where "+custom_filter+" LIMIT "+limit_start+","+limit_end;
    console.log(get_query)
    var result_get_query       = JSON.parse(await billing.commonSelectQuery(get_query));
    var all_row_data_array = [];
    if(result_get_query.length==0)
        {
            res.status(200).json({
                status : "success",
                status_code : 200,
                data_array: [],
                draw: parseInt(draw),
                recordsFiltered: parseInt(0),
                recordsTotal: parseInt(0)
            });
            return;
        }
    for (const row_get_query of result_get_query) 
    {
        //console.log(total_amount.total_data)
        all_row_data_array.push(row_get_query);
    }
    
    var data = [];
    if (all_row_data_array.length > 0)
    {
        all_row_data_array.forEach(async all_data =>
        {    
            var row_id                         = all_data['id'];
            var invoice_id                     = all_data['invoice_id'];
            var vendor_name                    = all_data['company_name'];

            var billing_invoice_id             = all_data['billing_invoice_id'];
            var invoice_code                   = all_data['invoice_code'];
            var invoice_year                   = all_data['invoice_year'];
            var invoice_no                     = all_data['invoice_no'];
            var invoice_format = "";
            if(billing_invoice_id >= 4263)
            {
                invoice_format = invoice_code+''+invoice_year+'/'+invoice_no;
            }
            else
            {
                invoice_format = invoice_code+'/'+invoice_year+'/'+invoice_no;
            }

            const pattern = date.compile('YYYY-MMM-DD');
            invoice_no                     = invoice_format;
            var order_no                   = all_data['order_no'];
            var suborder_no                    = all_data['suborder_no'];
            var airway_bill_no                 = all_data['airway_bill_no'];
            var logistic_id                    = all_data['logistic_id'];
            var new_live_status                = all_data['new_live_status'];
            var invoice_date                   = all_data['invoice_date'];
            invoice_date                        = invoice_date;
            var order_date_time                = all_data['order_date_time'];
            order_date_time                    = order_date_time;
            var zone_name                      = all_data['zone_name'];
            if(zone_name == '')
            {
                zone_name = 'NA';
            }
            var billable_weight                = all_data['billable_weight'];
            var itl_bill_with_gst              = all_data['itl_bill_with_gst'];
            var itl_half_kg                    = all_data['itl_half_kg'];
            var itl_additional_half_kg         = all_data['itl_additional_half_kg'];
            var itl_fsc_per                    = all_data['itl_fsc_per'];
            var itl_rto_half_kg                = all_data['itl_rto_half_kg'];
            var itl_rto_additional_half_kg     = all_data['itl_rto_additional_half_kg'];
            var itl_rto_fsc_per                = all_data['itl_rto_fsc_per'];
            var itl_cod_charge                 = all_data['itl_cod_charge'];
            var itl_bill_cgst                  = all_data['itl_bill_cgst'];
            var itl_bill_sgst                  = all_data['itl_bill_sgst'];
            var itl_bill_igst                  = all_data['itl_bill_igst'];

            var nestedData   = [];
            var return_array = {};
            var user_name      = all_data['first_name']+' '+all_data['last_name'];
            if(user_name != '')
            {
                if(vendor_name == '')
                {
                    vendor_name   = user_name;
                }
                else
                {
                    vendor_name   = vendor_name+' - '+user_name;
                }
            }
            return_array["vendor_name"]= vendor_name;
            if(vendor_name.length >= 15)
            {
                vendor_name = '<div class="tooltip_class" data-toggle="tooltip" title="'+vendor_name+'" data-html="true" data-placement="right">'+vendor_name.substr(0,15)+' ...</div>';
            }
            nestedData.push(vendor_name);
            
            nestedData.push( '<a href="'+base_url+'view-invoice-detail/'+invoice_id+'" class="datatable-blue" target="_blank">'+invoice_no+'</a>');
            nestedData.push(invoice_date);
            
            return_array["invoice_no"]=invoice_no;
            return_array["invoice_date"]=invoice_date;
            if(suborder_no != '' && order_no != suborder_no)
            {
                order_no += '-'+ suborder_no;
            }
            return_array["order_no"]=order_no;
            nestedData.push(order_no);
            return_array["airway_bill_no"]=airway_bill_no;
            nestedData.push(airway_bill_no);
            var logistic_id_id = function_itl.get_logistic_name(logistic_id.toString())
            return_array["logistic_id"]=logistic_id_id[0].logname
            nestedData.push(logistic_id_id[0].logname);
            return_array["status_title"]=function_itl.itl_tracking_status(new_live_status.toString())['status_title'];
            nestedData.push(function_itl.itl_tracking_status(new_live_status.toString())['status_title']);
            nestedData.push(order_date_time);
            return_array["order_date_time"]=order_date_time;
            return_array["zone_name"]=zone_name;
            nestedData.push(zone_name);
            return_array["billable_weight"]='Kg '+billable_weight;
            nestedData.push('Kg '+billable_weight);

            var forward_charges                = itl_half_kg + itl_additional_half_kg + itl_fsc_per;
            var rto_charges                    = itl_rto_half_kg + itl_rto_additional_half_kg + itl_rto_fsc_per;
            var cod_charges                    = itl_cod_charge;
            var gst_charges                    = itl_bill_cgst + itl_bill_sgst + itl_bill_igst;
            return_array["forward_charges"]=currencyFormatter.format(forward_charges, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            return_array["total_freight_charge"]=currencyFormatter.format(itl_bill_with_gst, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            return_array["rto_charges"]=currencyFormatter.format(rto_charges, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            return_array["cod_charges"]=currencyFormatter.format(cod_charges, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            return_array["gst_charges"]=currencyFormatter.format(gst_charges, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            nestedData.push(`<i class="fas fa-rupee-sign fa-2x"></i> `+currencyFormatter.format(itl_bill_with_gst, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },})+` <img src="`+base_url_images+`info.svg" class="tooltip_class icon-exclamation" data-toggle="tooltip" title="<div class=\'tool-tip-outer\'>
                            <div class=\'tool-tip-row\'>
                                <div class=\'tool-tip-title\'>Fwd. Amount:</div>
                                <div class=\'tool-tip-amount\'><i class=\'fas fa-rupee-sign fa-2x\'></i> `+currencyFormatter.format(forward_charges, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },})+`</div>
                            </div>
                            <div class=\'tool-tip-row\'>
                                <div class=\'tool-tip-title\'>RTO Amount:</div> 
                                <div class=\'tool-tip-amount\'><i class=\'fas fa-rupee-sign fa-2x\'></i> `+currencyFormatter.format(rto_charges, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },})+`</div>
                            </div>
                            <div class=\'tool-tip-row\'>
                                <div class=\'tool-tip-title\'>COD Charges:</div> 
                                <div class=\'tool-tip-amount\'><i class=\'fas fa-rupee-sign fa-2x\'></i> `+currencyFormatter.format(cod_charges, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },})+`</div>
                            </div>
                            <div class=\'tool-tip-row\'>
                                <div class=\'tool-tip-title\'>GST Charges:</div> 
                                <div class=\'tool-tip-amount\'><i class=\'fas fa-rupee-sign fa-2x\'></i> `+currencyFormatter.format(gst_charges, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },})+`</div>
                            </div>
                            <div class=\'tool-tip-row\'>
                                <div class=\'tool-tip-title\'>Total:</div>  
                                <div class=\'tool-tip-amount\'><i class=\'fas fa-rupee-sign fa-2x\'></i>`+currencyFormatter.format(itl_bill_with_gst, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },})+ `</div>
                            </div>
                        </div>" data-html="true" data-placement="right">`);
            //data.push(nestedData);
            data.push(return_array);
        });
        res.status(200).json({
            status : "success",
            status_code : 200,
            data_array: data,
            draw: parseInt(draw),
            recordsFiltered: parseInt(total_data),
            recordsTotal: parseInt(total_data)
        });
        return;   
    }
    else{
        res.status(200).json({
            status : "success",
            status_code : 200,
            data_array: data,
            draw: parseInt(draw),
            recordsFiltered: parseInt(total_data),
            recordsTotal: parseInt(total_data)
        });
        return;   
    }
}


exports.all_wallet_transactions_table_data = async function(form_data, req, res, next) 
{  
    var userdata = [];
    var base_url_images = "https://manage-cdn.ithinklogistics.com/manage/theme2/assets/images/";
    var base_url = "";
    var draw                                = htmlspecialchars(form_data.draw);
    var limit_start                         = htmlspecialchars(form_data.start);
    var limit_end                           = htmlspecialchars(form_data.length);
    var reset_flag                          = htmlspecialchars(form_data.reset_flag);
    var search_invoice_no                    = htmlspecialchars(form_data.search_invoice_no);
    var search_vendor_name_checkbox_value      = htmlspecialchars(form_data.search_vendor_name_checkbox_value);
    
    var search_date                         = htmlspecialchars(form_data.search_date);
    var user_id                             = form_data.id;
    if(reset_flag == '1')
    {
        search_invoice_no        = '';
        search_vendor_name_checkbox_value      = [];
        search_date                            = htmlspecialchars(form_data.search_date);
    }
    var search_vendor_id_checkbox = '';
    if (search_vendor_name_checkbox_value.length > 0)
    {
        //search_vendor_id_checkbox = implode(',',search_vendor_name_checkbox_value);
        search_vendor_name_checkbox_value.forEach(search_vendor_name_value => search_vendor_id_checkbox += search_vendor_name_value);
        
        if(search_vendor_id_checkbox.length > 1)
        {
            search_vendor_id_checkbox = search_vendor_id_checkbox.substr(0, -1);
        }
    }
    else
    {
        search_vendor_id_checkbox = ``;
    }
    var custom_filter = "wt.is_deleted = 0";
    if (search_vendor_id_checkbox != '')
    {
        custom_filter += "  and wt.user_id IN (" +search_vendBor_id_checkbox + ")";
    }
    else
    {
        custom_filter += " and wt.user_id ="+user_id;
    }
    if (search_date != '')
    {
        var explode_date = Array.from(new Set(search_date.split(" ")));
        //console.log(explode_date);
        var start_date   = explode_date[0];
        var end_date     = explode_date[1];
        if (typeof end_date === 'undefined') {
            end_date = start_date;
          }
        custom_filter += "  and CAST(wt.created_date as DATE) >= '" + start_date + "' and CAST(wt.created_date as DATE) <= '" + end_date + "'";
    }
    //---END crete custom filters

    var get_count_query    = "select count(*) as total_data from wallet_transaction_history wt left join user u on wt.user_id=u.id where "+custom_filter;
    
    var result_count_query = JSON.parse(await billing.commonSelectQuery(get_count_query));
   
    var total_data_array = [];

    for (const total_amount of result_count_query) 
    {
        //console.log(total_amount.total_data)
        total_data_array = total_amount;
        
    }
    var total_data         = total_data_array.total_data;
    var get_query              = "select wt.*,u.first_name,u.last_name,u.company_name from wallet_transaction_history wt left join user u on wt.user_id=u.id where "+custom_filter+" LIMIT "+limit_start+","+limit_end;
    console.log(get_query);
    var result_get_query       = JSON.parse(await billing.commonSelectQuery(get_query));
    var all_row_data_array      = [];
   
    for (const row_get_query of result_get_query) 
    {
        //console.log(total_amount.total_data)
        all_row_data_array.push(row_get_query);
        
    }
    
    var data = [];
    console.log(all_row_data_array)
    if (all_row_data_array.length > 0)
    {
        console.log(all_row_data_array)
    
        all_row_data_array.forEach(async all_data =>
        {  
            var row_id                         = all_data['id'];
            var type                           = all_data['type'];
            var vendor_name                    = all_data['company_name'];
            var amount                         = all_data['amount'];
            var balance                        = all_data['balance'];
            var created_date                   = all_data['created_date'];
            const pattern = date.compile('YYYY-MMM-DD');
            created_date = created_date;
            var remarks                        = all_data['remarks'];
            var credit_amount                  = 0;
            var debit_amount                   = 0;
            var return_array = {};
            if(type == 1)
            {
                return_array["type"] =  'Credit';
                return_array["amount"] =  credit_amount;
                type = 'Credit';
                credit_amount = amount;
            }
            else
            {
                return_array["type"] =  'Debit';
                return_array["amount"] =  debit_amount;
                type = 'Debit';
                debit_amount = amount;
            }
            var nestedData   = [];
            /*$nestedData[] = $row_id;*/
            var user_name      = all_data['first_name']+' '+all_data['last_name'];
            if(user_name != '')
            {
                if(vendor_name == '')
                {
                    vendor_name   = user_name;
                }
                else
                {
                    vendor_name   = vendor_name+' - '+user_name;
                }
            }
            return_array["vendor_name"] =  vendor_name;
            if(vendor_name.length >= 15)
            {
                vendor_name = '<div class="tooltip_class" data-toggle="tooltip" title="'+vendor_name+'" data-html="true" data-placement="right">'+vendor_name.substr(0,15)+' ...</div>';
            }
            nestedData.push(vendor_name);
            return_array["created_date"] =  created_date;
            return_array["transaction_id"] =  '#TR'+row_id;
            return_array["debit_amount"] =  currencyFormatter.format(debit_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            return_array["credit_amount"] =  currencyFormatter.format(credit_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            return_array["balance"] = currencyFormatter.format(balance, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },});
            nestedData.push(created_date);
            nestedData.push('#TR'+row_id); 
            nestedData.push('<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(debit_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
            nestedData.push('<i class="fas fa-rupee-sign fa-2x"></i> '+currencyFormatter.format(credit_amount, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
            nestedData.push('<i class="fas fa-rupee-sign fa-2x"></i> ' +currencyFormatter.format(balance, { code: 'INR' ,format: {pos: '%s %v', neg: '%s %v', zero: '%s %v' },}));
            return_array["remarks"] = remarks;
            if(remarks.length >= 15)
            {
                remarks = '<div class="tooltip_class_action" data-toggle="tooltip" title="'+remarks+'" data-html="true" data-placement="right">'+remarks.substr(0,15)+' ...</div>';
            }
            
            //nestedData.push(remarks);
            data.push(return_array);
        });
        res.status(200).json({
            status : "success",
            status_code : 200,
            data_array: data,
            draw: parseInt(draw),
            recordsFiltered: parseInt(total_data),
            recordsTotal: parseInt(total_data)
        });
        return;   
    }
    else{
        res.status(200).json({
            status : "success",
            status_code : 200,
            data_array: data,
            draw: parseInt(draw),
            recordsFiltered: parseInt(total_data),
            recordsTotal: parseInt(total_data)
        });
        return;   
    }
}

exports.view_invoice_details_data = async function(form_data, req, res, next) 
{ 

    var append_query = '';
    var get_id              = htmlspecialchars(form_data.billing_id);
    var user_id              = htmlspecialchars(form_data.id);
    //var invoice_id          = htmlspecialchars(form_data.invoice_id);
    append_query += " and b.user_id = '"+user_id+"'";
    
    var get_remittance_query   = `select b.*,u.total_wallet_amount,u.finance_mobile,u.bill_cycle_day,u.parent_user_id,u.finance_name,u.enable_wallet,u.last_name,u.mobile,u.company_name,u.vendor_website,u.gstin_no,u.biller_name,u.biller_address,u_a.address1,u_a.address2,u_a.pincode,ct.city_name,st.state_name, c.country_name
    from billing b
    LEFT JOIN user u ON b.user_id = u.id   
    LEFT JOIN user_address u_a ON u.id = u_a.user_id   
    LEFT JOIN cities ct ON u_a.city_id = ct.id
    LEFT JOIN states st ON u_a.state_id = st.id
    LEFT JOIN country c ON u_a.country_id = c.id 
    where b.id = '`+get_id+`' and b.is_deleted = 0 and u_a.is_deleted = 0 `+append_query;
    var result_get_remittance_query = JSON.parse(await billing.commonSelectQuery(get_remittance_query));
    console.log(result_get_remittance_query)
    var all_billing_data_array = result_get_remittance_query;
    for (const row_get_query of result_get_remittance_query) 
    {
        //console.log(row_get_query)
        //all_billing_data_array.push(row_get_query);
        
    }
    var data_array = [];
    //console.log(all_billing_data_array);
    if(all_billing_data_array.length > 0)
    {
    
        var final_payable_amount = 0;
        final_payable_amount += (all_billing_data_array[0]['invoice_amount'])-(all_billing_data_array[0]['paid_amount']) + all_billing_data_array[0]['remittance_amount'] + all_billing_data_array[0]['credit_amount'] + all_billing_data_array[0]['wallet_amount'];
        
        var invoice_id = all_billing_data_array[0]['id'];
        var user_id    = all_billing_data_array[0]['user_id'];//239
        var parent_user_id    = all_billing_data_array[0]['parent_user_id'];//393
        var total_wallet_amount    = all_billing_data_array[0]['total_wallet_amount'];//393
        var enable_wallet    = all_billing_data_array[0]['enable_wallet'];//393
        var invoice_amount    = all_billing_data_array[0]['invoice_amount'];//393
        
        //get_parent user group
        console.log(parent_user_id);
        var all_parent_ids_str = '';
        var get_parent_query = '';
        if(parent_user_id > 0)//if parent user_id found
        {
            get_parent_query = "SELECT id,parent_user_id,GROUP_CONCAT(id SEPARATOR ', ') as parent_user_id_str FROM `user` WHERE parent_user_id = "+user_id+" group by id";
        }
        else//if parent user_id found
        {
            get_parent_query = "SELECT id,parent_user_id,GROUP_CONCAT(id SEPARATOR ', ') as parent_user_id_str FROM `user` WHERE parent_user_id = "+user_id+" group by id";
        }
        
        var result_get_parent_query = JSON.parse(await billing.commonSelectQuery(get_parent_query));
        
        var all_parent_ids_str = '';
        for (const row_parent_query of result_get_remittance_query) 
        {
           // console.log(row_parent_query)
            all_parent_ids_str  = row_parent_query['parent_user_id'];
            
        }

        if(all_parent_ids_str.length == 0)
        {
            all_parent_ids_str = user_id;
        }
        
        //if (loggedin_user_type == 3 && loggedin_user_id != user_id)
        //{
        //    echo '<META HTTP-EQUIV="Refresh" Content="0; URL=' . $base_url . 'logout">';
        //}
        var all_payment_data_array = [];
        var get_payment_query              = "select * from billing_payment where invoice_id='"+invoice_id+"' and is_deleted = 0";
        var result_payment_query           = JSON.parse(await billing.commonSelectQuery(get_payment_query))
        //all_payment_data_array = result_payment_query;
        for (const row_get_query of result_payment_query) 
        {
            //console.log(total_amount.total_data)
            //all_payment_data_array.push(row_get_query); 

            
            all_payment_data_array.push({
                payment_transaction_id  :row_get_query.payment_transaction_id, 
                payment_date: row_get_query.payment_date,
                payment_amount: row_get_query.payment_amount,
                payment_remarks: row_get_query.payment_remarks
            });
                


        }
       
        var total_awb_no = 0;
        var get_awb_count_query                = "select id from order_management where invoice_id='"+invoice_id+"' and is_deleted = 0";
        var result_count_query                 = JSON.parse(await billing.commonSelectQuery(get_awb_count_query))
      
        var group_om_rowid = [];
        for (const row_awb_count_query of result_count_query) 
        {
            total_awb_no  += 1;
            //group_om_rowid.push(row_awb_count_query['id']); 
        }
      
        var implode_group_om_rowid = group_om_rowid.join("','");
        //get credit deduction entries
        var credit_amount_deduct = 0;
        if(group_om_rowid.length > 0)
        {
            var get_query = "SELECT sum(amount) as credit_amount_deduct FROM `credit_transaction_history` WHERE om_row_id IN ('"+implode_group_om_rowid+"') AND is_deleted = 0";
            //console.log(get_query)
            var result_query    = JSON.parse(await billing.commonSelectQuery(get_query));
          
            for (const row_query of result_query) 
            {
                credit_amount_deduct = row_query['credit_amount_deduct']; 
            }
        }
        var all_credit_entries_data_array = [];
        var all_remittance_entries_data_array = []; 
        var all_wallet_entries_data_array = [];
        var get_cn_query  = `select ce.*,c.credit_no,r.remittance_id,r.bill_deduct_amount,r.remittance_date,r.rem_out_amount,w.created_date as wallet_date,w.amount as wallet_amount,w.remarks as wallet_remarks from credit_note_entries ce
        left join credit_note c ON ce.credit_or_remittance_id = c.id   
        left join remittance r ON ce.credit_or_remittance_id = r.id   
        left join wallet_transaction_history w ON ce.credit_or_remittance_id = w.id   
        where ce.invoice_id= `+invoice_id+`  and ce.is_deleted = 0`;

        var result_cn_query    = JSON.parse(await billing.commonSelectQuery(get_cn_query));
          
        for (const row_cn_query of result_cn_query) 
        {
            if(row_cn_query['entry_type'] == 1)
            {
                all_credit_entries_data_array.push({
                    credit_no: row_cn_query.credit_no,
                    date_created: row_cn_query.date_created,
                    amount: row_cn_query.amount,
                    remarks: row_cn_query.remarks
                });

                
            }
            else if(row_cn_query['entry_type'] == 2)
            {
               console.log(row_cn_query);
                all_remittance_entries_data_array.push({
                    remittance_id: row_cn_query.remittance_id,
                    amount: row_cn_query.amount,
                    bill_deduct_amount: row_cn_query.bill_deduct_amount,
                    remarks: row_cn_query.remarks
                });


            }else if(row_cn_query['entry_type'] == 3)
            {
                

                all_wallet_entries_data_array.push({
                    wallet_date: row_cn_query.wallet_date,
                    wallet_amount: row_cn_query.wallet_amount,
                    wallet_remarks: row_cn_query.wallet_remarks
                })
            }
            
        }

        var all_remittance_data_array = [];
        get_cn_query = `select r.*,u.company_name from remittance r left join user u on r.user_id = u.id
        where  r.user_id IN (`+all_parent_ids_str+`) and r.is_deleted = 0 and r.rem_out_amount > 0 order by u.company_name asc`;
        //console.log(get_cn_query);
        result_cn_query    = JSON.parse(await billing.commonSelectQuery(get_cn_query));
        all_remittance_data_array = result_cn_query;
        for (const row_cn_query of result_cn_query) 
        {
            //all_remittance_data_array = row_cn_query;
        }
        //print_R($all_remittance_data_array);die;
        var all_credit_data_array = [];
        var all_credit_amount_array = [];
        get_cn_query              = `select * from credit_note c   
        where user_id = `+user_id+` and is_deleted = 0 and status != 2`;
        result_cn_query    = JSON.parse(await billing.commonSelectQuery(get_cn_query));
          
        for (const row_cn_query of result_cn_query) 
        {
            //all_credit_data_array = row_cn_query;
            all_credit_amount_array[row_cn_query['id']]  = row_cn_query['available_credit'];
        }

        if(invoice_id >= 4263){
        invoice_format = all_billing_data_array[0]['invoice_code']+all_billing_data_array[0]['invoice_year']+'/'+all_billing_data_array[0]['invoice_no'];
        }
        else
        {
            invoice_format = all_billing_data_array[0]['invoice_code']+'/'+all_billing_data_array[0]['invoice_year']+'/'+all_billing_data_array[0]['invoice_no'];
        }

        var biller_name = all_billing_data_array[0]['biller_name'];
        var company_name = all_billing_data_array[0]['company_name'];
        var biller_address = all_billing_data_array[0]['biller_address'];
        var address1 = all_billing_data_array[0]['address1'];
        var address2 = all_billing_data_array[0]['address2'];
        var city_name = all_billing_data_array[0]['city_name'];
        var state_name = all_billing_data_array[0]['state_name'];
        var pincode = all_billing_data_array[0]['pincode'];
        var gstin_no = all_billing_data_array[0]['gstin_no'];
        if(biller_name != '')
        {
            company_name = biller_name;
        }
        
        
        if(biller_address != '')
        {
            vendor_address = biller_address;
        }
        else
        {
           // vendor_address = ucfirst($address1).'
            //<br id="BR_16" />
            //'.ucfirst($address2).'
            //<br id="BR_16" />
            //'.ucfirst($city_name).', '.ucfirst($state_name).'-'.$pincode;
        }
    }
    else
    {
        //echo '<META HTTP-EQUIV="Refresh" Content="0; URL=' . $base_url . 'logout">';
    }


        var get_report_query   = "SELECT order_type,is_reverse,new_live_status,billing_rto_status,itl_half_kg,itl_additional_half_kg,itl_fsc_per,itl_cod_charge,itl_rto_half_kg,itl_rto_additional_half_kg,itl_rto_fsc_per,itl_bill_without_gst,itl_bill_cgst,itl_bill_igst,itl_bill_sgst,itl_bill_with_gst,itl_total_bill,itl_docket_chrg FROM order_management where order_management.invoice_id = '"+get_id+"'";
        
        var all_report_data_array                  = [];
        var result_get_report_query = JSON.parse(await billing.commonSelectQuery(get_report_query));
        var forward_freight = 0;
        var cod_collection = 0;
        var rto_freight = 0;
        var dto_amount = 0;
        var subtotal =  0;
        var itl_bill_cgst = 0;
        var itl_bill_igst = 0;
        var itl_bill_sgst =0;
        var itl_bill_with_gst=0;
        var freight_count =0;
        var cod_count =  0;
        var rto_freight_count= 0;
        var dto_count = 0;
        
        var total_data_array = [];
        
        for (const row_get_report_query of result_get_report_query) 
        {
           // console.log(row_get_report_query)
            total_data_array.push(row_get_report_query)
            if(row_get_report_query['billing_rto_status'] == 0)
            {
                freight_count = freight_count + 1;
                forward_freight += row_get_report_query['itl_half_kg'] + row_get_report_query['itl_additional_half_kg'] + row_get_report_query['itl_fsc_per'];
                if(row_get_report_query['order_type'].toLowerCase() == 'cod')
                {
                        cod_count += 1;
                    //$cod_collection += $row_get_report_query['itl_cod_charge'];
                }
            }
            if(row_get_report_query['billing_rto_status'] == 1)
            {
                rto_freight_count += 1;
                rto_freight += row_get_report_query['itl_half_kg'] + row_get_report_query['itl_additional_half_kg'] + row_get_report_query['itl_fsc_per']+ row_get_report_query['itl_rto_half_kg']+ row_get_report_query['itl_rto_additional_half_kg']+ row_get_report_query['itl_rto_fsc_per'];
            }
            if(row_get_report_query['billing_rto_status'] == 2)
            {
                    dto_count += 1;
                dto_amount += row_get_report_query['itl_half_kg'] + row_get_report_query['itl_additional_half_kg'] + row_get_report_query['itl_fsc_per']+ row_get_report_query['itl_rto_half_kg']+ row_get_report_query['itl_rto_additional_half_kg']+ row_get_report_query['itl_rto_fsc_per'];
            }
            
            subtotal +=  row_get_report_query['itl_bill_without_gst'];
            itl_bill_cgst +=  row_get_report_query['itl_bill_cgst'];
            itl_bill_igst +=  row_get_report_query['itl_bill_igst'];
            itl_bill_sgst +=  row_get_report_query['itl_bill_sgst'];
            itl_bill_with_gst +=  row_get_report_query['itl_bill_with_gst'];

        }  
        
        var total_count = freight_count+rto_freight_count+dto_count;
        
        
        var cod_total = 0;
        //$forward_freight += $freight_total;
        cod_collection += cod_total;
        console.log(all_billing_data_array);
        var db_freight_count = all_billing_data_array[0]['freight_count'];
        var db_freight_total = all_billing_data_array[0]['freight_total'];
        var db_cod_total     = all_billing_data_array[0]['cod_total'];
        var db_rto_total     = all_billing_data_array[0]['rto_total'];
        var db_dto_total     = all_billing_data_array[0]['dto_total'];

        if(db_dto_total > 0)
        {
            dto_amount = db_dto_total;
        }
        var db_subtotal      = db_freight_total + db_cod_total + db_rto_total + dto_amount;
        var db_igst          = all_billing_data_array[0]['igst_total'];
        var db_sgst          = all_billing_data_array[0]['sgst_total'];
        var db_cgst          = all_billing_data_array[0]['cgst_total'];
        var db_invoice_amount = all_billing_data_array[0]['invoice_amount'];
        //var itl_bill_with_gst_words = convert_number(db_invoice_amount);
        var itl_bill_with_gst_words = toWords.convert(db_invoice_amount);
        console.log(freight_count);
        //$itl_bill_with_gst_words = ucfirst(strtolower(numberTowords($db_invoice_amount)));
        if(freight_count == 0)
        {
            freight_count += db_freight_count; 
        }
        var vendor_company_details = "";
        if(all_billing_data_array[0]['vendor_website'] != '')
        {
            vendor_company_details = all_billing_data_array[0]['company_name']+' ( '+all_billing_data_array[0]['vendor_website']+' )';
        }
        else
        {
            vendor_company_details = all_billing_data_array[0]['company_name'];
        }
        console.log(freight_count);
        var biling_status = '';
        if(all_billing_data_array[0]['status'] == 1)
        {
            biling_status = "Partial Paid";
        }else if(all_billing_data_array[0]['status'] == 2)
        {
            biling_status= "Paid";
        }else{
            biling_status = "Unpaid";
        }
        data_array.push({
            invoice_amount:final_payable_amount,
            invoice_id: invoice_id,
            total_wallet_amount: total_wallet_amount,
            enable_wallet: enable_wallet,
            invoice_amount_2: invoice_amount,
            biller_name: biller_name,
            company_name: company_name,
            biller_address,biller_address,
            address1:address1,
            address2: address2,
            city_name: city_name,
            state_name: state_name,
            pincode: pincode,
            gstin_no: gstin_no,
            freight_count: freight_count,
            db_freight_total:db_freight_total,
            cod_count: cod_count,
            db_cod_total: db_cod_total,
            rto_freight_count: rto_freight_count,
            db_rto_total: db_rto_total,
            dto_count: dto_count,
            dto_amount: dto_amount,
            total_count: total_count,
            db_subtotal:db_subtotal,
            db_cgst: db_cgst,
            db_sgst:db_sgst,
            db_igst: db_igst,
            db_invoice_amount: db_invoice_amount,
            itl_bill_with_gst_words: itl_bill_with_gst_words,
            invoice_format: invoice_format,
            invoice_date: all_billing_data_array[0]['invoice_date'],
            paid_amount: all_billing_data_array[0]['paid_amount'],
            credit_amount: all_billing_data_array[0]['credit_amount'],
            wallet_amount: all_billing_data_array[0]['wallet_amount'],
            remittance_amount: all_billing_data_array[0]['remittance_amount'],
            final_payable_amount: final_payable_amount,
            company_name: vendor_company_details,
            company_contact : all_billing_data_array[0]['mobile'],
            gstin_no: all_billing_data_array[0]['gstin_no'],
            finance_name: all_billing_data_array[0]['finance_name'],
            finance_mobile: all_billing_data_array[0]['finance_mobile'],
            status: biling_status,
           // freight_count: all_billing_data_array[0]['freight_count'],
         })
        res.status(200).json({
            status : "success",
            status_code : 200,
            data_array: data_array,
            all_payment_data_array: all_payment_data_array,
            all_credit_entries_data_array: all_credit_entries_data_array,
            all_remittance_entries_data_array: all_remittance_entries_data_array,
            all_wallet_entries_data_array: all_wallet_entries_data_array,
            all_billing_data_array: all_billing_data_array[0]
        });
        return;   
}

function convert_number(number)
{
    if ((number < 0) || (number > 999999999))
    {
        throw new Exception("Number is out of range");
    }

    var Gn = Math.floor(number / 100000);  /* Millions (giga) */
    number -= Gn * 100000;
    var kn = Math.floor(number / 1000);     /* Thousands (kilo) */
    number -= kn * 1000;
    var Hn = Math.floor(number / 100);      /* Hundreds (hecto) */
    number -= Hn * 100;
    var Dn = Math.floor(number / 10);       /* Tens (deca) */
    var n = number % 10;               /* Ones */

    var res = "";

    if (Gn)
    {
        console.log("gn")
        res += Gn + " Lacs";
        
    }

    if (kn)
    {
        console.log("kn")
        res += (empty(res) ? "" : " ") .
            kn + " Thousand";
    }

    if (Hn)
    {
        console.log("hn")
        res += (empty(res) ? "" : " ") .
            Hn + " Hundred";
    }

    var ones = ["", "One", "Two", "Three", "Four", "Five", "Six",
        "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen",
        "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eightteen",
        "Nineteen"];
    var tens = ["", "", "Twenty", "Thirty", "Fourty", "Fifty", "Sixty",
        "Seventy", "Eigthy", "Ninety"];

    if (Dn || n)
    {
        if (!empty(res))
        {
            res += " and ";
        }

        if (Dn < 2)
        {
            res += ones[Dn * 10 + n];
        }
        else
        {
            res += tens[Dn];

            if (n)
            {
                res += "-" + ones[n];
            }
        }
    }

    if (empty(res))
    {
        res = "zero";
    }

    return res;
}


exports.filter_data = async function(form_data, req, res, next) 
{  
    try{
        var get_query              = "SELECT id, logistics_name, priority FROM logistics_v2 where is_deleted = 0;";
        console.log(get_query)
        var logistics_filter       = JSON.parse(await billing.commonSelectQuery(get_query));
    
        var status_master_query              = "SELECT id, status_name FROM status_master where is_deleted =0;";
        console.log(get_query)
        var status_master_filter       = JSON.parse(await billing.commonSelectQuery(status_master_query));
    
        res.status(200).json({
            status : "success",
            status_code : 200,
            logistics_filter: logistics_filter,
            status_master_filter: status_master_filter,
        });
    }
    catch(e){
        res.status(200).json({
            status_code : 400,
            status: 'error',
            message : "Some Error Occured! Try again later.",
            err: e,
        });
        return;
    }
    
}


exports.export_data = async function(form_data, req, res, next) 
{  
    var userdata = [];
    var base_url_images = "https://manage-cdn.ithinklogistics.com/manage/theme2/assets/images/";
    var base_url = "";
    var draw                                = htmlspecialchars(form_data.draw);
    var limit_start                         = htmlspecialchars(form_data.start);
    var limit_end                           = htmlspecialchars(form_data.length);
    var reset_flag                          = htmlspecialchars(form_data.reset_flag);
    var search_invoice_no                    = form_data.search_transaction_id;
    var search_order_no                    = htmlspecialchars(form_data.search_order_no);
    var search_airway_bill_no        = htmlspecialchars(form_data.search_awb_no);
    //var search_invoice_no          = htmlspecialchars(form_data.search_invoice_no);
    var search_logistics_checkbox_value     = form_data.search_logistics_checkbox_value == [''] ? []: form_data.search_logistics_checkbox_value;
    var search_status_checkbox_value        = form_data.search_status_checkbox_value == [""] ? [] : form_data.search_status_checkbox_value;
    var search_vendor_name_checkbox_value   = form_data.search_vendor_name_checkbox_value == [""] ? [] : form_data.search_vendor_name_checkbox_value;
    var search_zone_checkbox_value          = form_data.search_zone_checkbox_value == [""] ? [] : form_data.search_zone_checkbox_value;
    var search_date                         = htmlspecialchars(form_data.search_date);
    var search_order_date                   = htmlspecialchars(form_data.search_order_date);
    var user_id                             = form_data.id;
    if(!form_data)
    {
        res.status(200).json({
            status : "error",
            status_code : 200,
            draw: parseInt(draw)
        });
        return;
    }
    if(reset_flag == '1')
    {
        search_invoice_no               = '';
        search_order_no                      = '';
        search_airway_bill_no      = '';
        search_invoice_no        = '';
        search_logistics_checkbox_value      = [];
        search_vendor_name_checkbox_value      = [];
        search_status_checkbox_value           = [];
        search_zone_checkbox_value             = [];
        search_date                            = htmlspecialchars(form_data.search_date);
    }
    var search_vendor_id_checkbox = '';
    if (search_vendor_name_checkbox_value.length > 0)
    {
        //search_vendor_id_checkbox = implode(',',search_vendor_name_checkbox_value);
        search_vendor_name_checkbox_value.forEach(search_vendor_name_value => search_vendor_id_checkbox += search_vendor_name_value);
        
        if(search_vendor_id_checkbox.length > 1)
        {
            search_vendor_id_checkbox = search_vendor_id_checkbox.substr(0, -1);
        }
    }
    else
    {
        search_vendor_id_checkbox = ``;
    }
    if (search_date != '')
    {
        var explode_date = Array.from(new Set(search_date.split(" ")));
        //console.log(explode_date);
        var start_date   = explode_date[0];
        var end_date     = explode_date[1];
        if (typeof end_date === 'undefined') {
            end_date = start_date;
          }
        //custom_filter += "  and CAST(om.invoice_date as DATE) >= '" + start_date + "' and CAST(om.invoice_date as DATE) <= '" + end_date + "'";
    }
    if (search_order_date != '')
    {
        var explode_date = Array.from(new Set(search_order_date.split(" ")));
        //console.log(explode_date);
        var start_order_date   = explode_date[0];
        var end_order_date     = explode_date[1];
        if (typeof end_order_date === 'undefined') {
            end_order_date = start_order_date;
          }
        console.log(end_order_date)
        //custom_filter += "  and CAST(om.order_date_time as DATE) >= '" + start_order_date + "' and CAST(om.order_date_time as DATE) <= '" + end_order_date + "'";
    }
    res.status(200).json({
        status : "success",
        status_code : 200,
        draw: parseInt(draw)
    });
    return;
}