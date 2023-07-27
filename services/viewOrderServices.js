const validator = require('validator');
const bcrypt = require('bcryptjs');
var express = require('express');
var mysqlpool = require('../dbconfig');
const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');
const view_order_model = require('../models/viewOrderModel');
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
const { json } = require('body-parser');

exports.viewOrderViewDetails = async function(form_data, req, res, next) 
{  
    var base_url_images = "https://manage-cdn.ithinklogistics.com/manage/theme2/assets/images/";
    var active_tab_id = form_data.active_tab_id;
    var is_login = 1;
    var loggedin_user_id = form_data.id;
    var loggedin_user_type = 3
    var custom_filter = "om.is_deleted = 0 and om.is_reverse = 0"
    if(active_tab_id != '1')
    {
        custom_filter += " and om.cancel_status = 0";
    }
    var reset_flag        = form_data.reset_flag;   
    var search_status_checkbox_value = '';
    var search_date = '';
    var search_awb_no = '';
    var search_vendor_name_checkbox_value = '';
    var search_order_id = '';
    var search_payment_checkbox_value = '';
    var search_payment_checkbox_value1 = '';
    var search_payment_checkbox_value2 = '';
    var search_sku = '';
    var search_customer_details = '';
    var search_shipping_details_checkbox_value = [];
    var search_delivered_date = '';
    var search_manifest_all_tab_date = '';
    var search_pickup_all_tab_date = '';
    var search_rto_delivered_all_tab_date = '';
    var manifest_pending_complete = '';
    var search_manifest_id_checkbox_value = [];
    var search_pickup_address_checkbox_value = [];
    var rto_tab_id = '';
    var get_platform_date = '';
    if(reset_flag == '0')
    {
        search_status_checkbox_value               = form_data.search_status_checkbox_value;
        search_date                                = form_data.search_date;
        search_awb_no                              = form_data.search_awb_no;
        search_vendor_name_checkbox_value          = form_data.search_vendor_name_checkbox_value;
        search_order_id                            = form_data.search_order_id;
        search_payment_checkbox_value              = form_data.search_payment_checkbox_value;

        search_payment_checkbox_value1             = '';
        search_payment_checkbox_value2             = '';
       
        for (const search_payment_value of search_payment_checkbox_value) 
        {
            if(search_payment_value == 1)
            {
                search_payment_checkbox_value1     = 'prepaid';
            }
            if(search_payment_value == 2)
            {
                search_payment_checkbox_value2     = 'cod';
            }
        }
        search_sku                                 = form_data.search_sku;
        search_customer_details                    = form_data.search_customer_details;
        search_shipping_details_checkbox_value     = form_data.search_shipping_details_checkbox_value;

        if(active_tab_id == '6' || active_tab_id == '7' || active_tab_id == '1')
        {
            search_delivered_date                  = form_data.search_delivered_date;
        }

        if(active_tab_id == '1') // KD
        {
            
            search_manifest_all_tab_date           = form_data.search_manifest_all_date;
            search_pickup_all_tab_date             = form_data.search_pickup_all_date;
            search_rto_delivered_all_tab_date      = form_data.search_rto_delivered_date;
        }

        if(active_tab_id == '4')
        {
            
            manifest_pending_complete              = form_data.manifest_pending_complete;
            search_manifest_id_checkbox_value      = form_data.search_manifest_id_checkbox_value;
        }

        if(active_tab_id == '3' || active_tab_id == '4' || active_tab_id == '1')
        {
            search_pickup_address_checkbox_value   = form_data.search_pickup_address_checkbox_value;
        }
        
        if(active_tab_id == '7') 
        {
            rto_tab_id                             = form_data.search_rto_tab_id;
        }
    }
    else
    {
        search_status_checkbox_value               = form_data.search_status_checkbox_value;
        search_date                                = form_data.search_date;
        search_awb_no                              = '';
        search_vendor_name_checkbox_value          = [];
        search_order_id                            = '';
        search_payment_checkbox_value              = [];
        search_payment_checkbox_value1             = '';
        search_payment_checkbox_value2             = '';
        search_sku                                 = '';
        search_customer_details                    = '';
        search_shipping_details_checkbox_value     = [];

        if(active_tab_id == '6' || active_tab_id == '7')
        {
            search_delivered_date                  = form_data.search_delivered_date;
        }
        
        if(active_tab_id == '1') // KD
        {
            search_manifest_all_tab_date           = form_data.search_manifest_all_date;
            search_pickup_all_tab_date             = form_data.search_pickup_all_date;
            search_rto_delivered_all_tab_date      = form_data.search_rto_delivered_date;
        }

        if(active_tab_id == '4')
        {
            manifest_pending_complete              = '1';
            search_manifest_id_checkbox_value      = form_data.search_manifest_id_checkbox_value;
        }

        if(active_tab_id == '3' || active_tab_id == '4' || active_tab_id == '1')
        {
            search_pickup_address_checkbox_value   = [];
        }
        
        if(active_tab_id == '7') 
        {
            rto_tab_id                             = form_data.search_rto_tab_id;
        }
        
        if(active_tab_id == '5' || active_tab_id == '6' || active_tab_id == '7')
        {
            get_platform_date                                = form_data.get_platform_date;
            
            if(get_platform_date == 't' && active_tab_id == '5')
            {
                temp_current_date = date('YYYY-MM-DD');
                if(search_status_checkbox_value.includes('2') && search_status_checkbox_value.length == 1)
                {
                    custom_filter += "  and (CAST(om.pickup_date as DATE) >= '" + temp_current_date + "' and CAST(om.pickup_date as DATE) <= '" + temp_current_date + "') and (om.new_live_status = '2') ";
                }
                else if(search_status_checkbox_value.includes('5') && search_status_checkbox_value.length == 1)
                {
                    custom_filter += "  and (CAST(om.last_attempt_date as DATE) >= '" + temp_current_date + "' and CAST(om.last_attempt_date as DATE) <= '" + temp_current_date + "') and (om.new_live_status = '5') ";
                }
                else if(search_status_checkbox_value.includes('3') && search_status_checkbox_value.includes('4') && search_status_checkbox_value.length == 2)
                {
                    custom_filter += "  and (CAST(om.last_inscan_datetime as DATE) >= '" + temp_current_date + "' and CAST(om.last_inscan_datetime as DATE) <= '" + temp_current_date + "') and (om.new_live_status IN (3,4)) ";
                }
                else if(search_status_checkbox_value.includes('6') && search_status_checkbox_value.includes('31') && search_status_checkbox_value.includes('32') && search_status_checkbox_value.includes('33') && search_status_checkbox_value.includes('34') && search_status_checkbox_value.length == 5)
                {
                    custom_filter += "  and (CAST(om.last_inscan_datetime as DATE) >= '" + temp_current_date + "' and CAST(om.last_inscan_datetime as DATE) <= '" + temp_current_date + "') and (om.new_live_status IN (6,31,32,33,34)) ";
                }
            }
            
            if(get_platform_date == 't' && active_tab_id == '6')
            {
                const pattern = date.compile('YYYY-MM-DD');
                const now = new Date();
                var temp_current_date = date.format(now, pattern);
                custom_filter += "  and (CAST(om.delivered_date as DATE) >= '" + temp_current_date + "' and CAST(om.delivered_date as DATE) <= '" + temp_current_date + "') and (om.new_live_status = '7') ";
            }
            
            if(get_platform_date == 't' && active_tab_id == '7')
            {
                const pattern = date.compile('YYYY-MM-DD');
                const now = new Date();
                var temp_current_date = date.format(now, pattern);
                custom_filter += "  and (CAST(om.delivered_date as DATE) >= '" + temp_current_date + "' and CAST(om.delivered_date as DATE) <= '" + temp_current_date + "') and (om.new_live_status = '17') ";
            }
        }
    } 
    const pattern = date.compile('YYYY-MM-DD');
    const now = new Date();
    var current_date = date.format(now, pattern);
    
    if(search_status_checkbox_value.length >0)
    {
        if(active_tab_id == '5' || active_tab_id == '7')
        {
            var search_status_checkbox = '';
            var temp_j = 0;
            for (const search_status_value of search_status_checkbox_value) 
            {
                if(temp_j == 0)
                {
                    search_status_checkbox += search_status_value;
                }
                else
                {
                    search_status_checkbox += ','+search_status_value;
                }
                temp_j++;
            };
            //search_status_checkbox = search_status_checkbox.substr(0, -1);
            if(search_status_checkbox != '')
            {
                custom_filter += "  and om.new_live_status IN (" + search_status_checkbox + ")";
            }
        }
        else if(active_tab_id == '3' || active_tab_id == '4')
        {
            var live_status_list                   = '';
            for (const status_checkbox_value of search_status_checkbox_value) 
            {
                live_status_array   = Array.from(new Set(status_checkbox_value.split("_")));
                live_status_list              += decode(live_status_array[1])+',';
            }
            live_status_list = live_status_list.substr(0, -1);
            if(live_status_list != '')
            {
                custom_filter += "   and ( om.live_status IN (" + live_status_list + ") and om.new_live_status = 1 )";
            }
        }
        if (active_tab_id == '1') 
        {
            var custom_filter1 = '';
            var live_status_list = '';
            var search_status_checkbox = '';
            for (const status_checkbox_value of search_status_checkbox_value) 
            {
                if (status_checkbox_value.match('/^([0-9]*_[0-9]*)+/')) 
                {
                    live_status_array  = [];
                    live_status_array   = Array.from(new Set(status_checkbox_value.split("_")));
                    live_status_list              += decode(live_status_array[1])+',';
                }
                else
                {
                    search_status_checkbox += decode(status_checkbox_value)+',';
                }
            }
            live_status_list = live_status_list.substr(0, -1);
            if(live_status_list != '')
            {
                custom_filter1 += " ( om.live_status IN (" + live_status_list + ") and om.new_live_status = 1 ) OR ";
            }
            search_status_checkbox = search_status_checkbox.substr(0,-1);
            if(search_status_checkbox != '')
            {
                custom_filter1 += " om.new_live_status IN (" + search_status_checkbox + ") OR ";
            }
            if(custom_filter1.length > 0)
            {
                custom_filter1 = custom_filter1.substr(0,-3);
                custom_filter += ' and ('+custom_filter1+') ';
            }
        }
    }
    else
    {
        if(active_tab_id == '1') // All  // KD
        {
            //custom_filter += " and om.new_live_status IN ('0','1','2','3','4','5','6','7','11','12','13','14','15','16','17')";
        }
        else if(active_tab_id == '3') // Ready To Dispatch
        {
            custom_filter += " and (om.new_live_status <= '1')";
        }
        else if(active_tab_id == '4') // Manifest
        {
            if(manifest_pending_complete == 1) // Pending
            {
                custom_filter += " and om.new_live_status < '2'";
            }
            else if(manifest_pending_complete == 2) // Complete
            {
                custom_filter += " and om.new_live_status >= '2'";
            }
            else
            {
                custom_filter += " and om.new_live_status < '2'";
            }
        }    
        else if(active_tab_id == '5') // InTransit
        {
            custom_filter += " and om.new_live_status IN ('2','3','4','5','6','31','32','33','34')";
            /*if(new_live_status == 'intransit' then consider 3)
            if(new_live_status == 'reached at destination' then consider 4)
            if(new_live_status == 'OFD' then consider 5)
            if(new_live_status == 'undelivered' then consider 6,31,32,33,34)*/
        }   
        else if(active_tab_id == '6') // Delivered
        {
            custom_filter += " and om.new_live_status = '7'";
        } 
        else if(active_tab_id == '7') // RTO
        {
            custom_filter += " and om.new_live_status IN ('11','12','13','14','15','16','17')";
            /*if(new_live_status == 'return in transit' then consider 11,12,13,14
            if(new_live_status == 'return ofd' then consider 15
            if(new_live_status == 'return undelivered' then consider 16
            if(new_live_status == 'return delivered' then consider 17*/
        }
    }

    var force_index = '';

    if (search_date != '')
    {   var explode_date = Array.from(new Set(search_date.split(/(\s+)/)));
        var start_date   = explode_date[0];
        var end_date     = explode_date[2];
        if(start_date == '2017-01-01' && end_date == current_date)
        {
            
        }
        else
        {
            //force_index = 'force index('+idx_is_deleted_created_date+')';
            custom_filter += "  and CAST(om.created_date as DATE) >= '"+ start_date +"' and CAST(om.created_date as DATE) <= '"+ end_date +"'";
        }
    }

    if (search_awb_no != '')
    {
        awb_numbers = Array.from(new Set(search_awb_no.split(',')));
        var search_value_list    = awb_numbers.join("','");
        custom_filter          += "  and (om.airway_bill_no IN ('"+search_value_list+"') or om.order_sub_order_no IN ('"+search_value_list+"'))";
    }

    var search_vendor_id_checkbox = '';
    if (search_vendor_name_checkbox_value.length>0)
    {
        for (const search_vendor_name_value of search_vendor_name_checkbox_value) 
        {
            search_vendor_id_checkbox += decode(search_vendor_name_value)+',';
        }
        search_vendor_id_checkbox = search_vendor_id_checkbox.substr(0,-1);
    }
    else
    {
        search_vendor_id_checkbox = '';
    }

    if(is_login == 1 && loggedin_user_type == 1) // Admin
    {
        if (search_vendor_id_checkbox != '')
        {
            custom_filter += "  and om.user_id IN ("+ search_vendor_id_checkbox +")";
        }
    }
    else if(is_login == 1 && loggedin_user_type == 2 && loggedin_view_itl_orders == 1) // Sub Admin
    {
        if(loggedin_user_show_all_vendors == 1)
        {
            if (search_vendor_id_checkbox != '')
            {
                custom_filter += "  and om.user_id IN ("+ search_vendor_id_checkbox +")";
            }
        }
        else
        {
            if(loggedin_user_user_id_list.length>0)
            {
                if (search_vendor_id_checkbox != '')
                {
                    custom_filter += "  and om.user_id IN ("+ search_vendor_id_checkbox +")";
                }
                else
                {
                    custom_filter += ' and om.user_id IN ('+loggedin_user_user_id_list+')';
                }
            }
        }
    }
    else if(is_login == 1 && loggedin_user_type == 3) // Vendor
    {
        //custom_filter += ' and om.user_id ='.loggedin_user_id.'';
        if (search_vendor_id_checkbox != '')
        {
            custom_filter += "  and om.user_id IN ("+ search_vendor_id_checkbox +")";
        }
        else
        {
            custom_filter += " and om.user_id ="+loggedin_user_id;
        }
    }

    if (search_order_id != '')
    {
        custom_filter += "  and om.order_sub_order_no LIKE '"+ search_order_id +"'";
    }

    if(search_payment_checkbox_value1 != '' && search_payment_checkbox_value2 != '')
    {
        //custom_filter += " and ( lower(om.order_type) LIKE '%"+ search_payment_checkbox_value1 +"%' or  lower(om.order_type) LIKE '%"+ search_payment_checkbox_value2 +"%')";
    }
    else if(search_payment_checkbox_value1 != '')
    {
        custom_filter += " and lower(om.order_type) LIKE '%"+ search_payment_checkbox_value1 +"%'";
    }
    else if(search_payment_checkbox_value2 != '')
    {
        custom_filter += " and lower(om.order_type) LIKE '%"+ search_payment_checkbox_value2 +"%'";
    }

    if (search_sku != '')
    {
        custom_filter += " and om.order_product_sku LIKE '%"+ search_sku +"%'";
    }

    if(search_customer_details != '')
    {
        var search_query_data_array = Array.from(new Set(search_customer_details.split(/(\s+)/)));
        var search_custom_query = "";
        for (const search_query_data of search_query_data_array) 
        {
            search_custom_query += "%"+ decode(search_query_data)+"%";
        }

        custom_filter += " and (om.customer_name LIKE '"+search_custom_query+"' or om.customer_email LIKE '"+search_custom_query+"' or om.customer_mobile LIKE '"+search_custom_query+"')";
    }

    if (search_shipping_details_checkbox_value.length > 0)
    {
        var search_shipping_details_checkbox = '';
        for (const search_shipping_details_value of search_shipping_details_checkbox_value) 
        {
        
            search_shipping_details_checkbox += decode(search_shipping_details_value)+',';
        }
        search_shipping_details_checkbox = search_shipping_details_checkbox.substr(0,-1);
        custom_filter += "  and om.logistic_id IN ("+ search_shipping_details_checkbox +")";
    }
    console.log(search_delivered_date);
    if(active_tab_id == '6' || active_tab_id == '7' || active_tab_id == '1')
    {
        if (search_delivered_date != '')
        {
            console.log(search_delivered_date);
            var explode_date = Array.from(new Set(search_delivered_date.split(/(\s+)/)));
            console.log(explode_date);
            start_date   = explode_date[0];
            end_date     = explode_date[2];
            if(start_date == '2017-01-01' && end_date == current_date)
            {
                
            }
            else
            {
                if(active_tab_id == '1')
                {
                    custom_filter += "  and ((CAST(om.delivered_date as DATE) >= '"+ start_date +"' and CAST(om.delivered_date as DATE) <= '"+ end_date +"') and (om.new_live_status = '7')) ";
                }
                else
                {
                    custom_filter += "  and (CAST(om.delivered_date as DATE) >= '"+ start_date +"' and CAST(om.delivered_date as DATE) <= '"+ end_date +"') ";
                }
            }
        }
    }

    if(active_tab_id == '1') // KD
    {
        if (search_manifest_all_tab_date != '')
        {
            //console.log(search_manifest_all_tab_date);
            var explode_date = Array.from(new Set(search_manifest_all_tab_date.split(/(\s+)/)));
            
            start_date   = explode_date[0];
            end_date     = explode_date[2];
            if(start_date == '2017-01-01' && end_date == current_date)
            {
                
            }
            else
            {
                custom_filter += "  and CAST(om.created_date as DATE) >= '"+ start_date +"' and CAST(om.created_date as DATE) <= '"+ end_date +"'";
            }
        }

        if (search_pickup_all_tab_date != '')
        {
            //console.log(search_pickup_all_tab_date);
            var explode_date = Array.from(new Set(search_pickup_all_tab_date.split(/(\s+)/)));
            start_date   = explode_date[0];
            end_date     = explode_date[2];
            if(start_date == '2017-01-01' && end_date == current_date)
            {
                
            }
            else
            {
                custom_filter += "  and (CAST(om.pickup_date as DATE) >= '"+ start_date +"' and CAST(om.pickup_date as DATE) <= '"+ end_date +"') ";
            }
        }

        if (search_rto_delivered_all_tab_date != '')
        {
            var explode_date = Array.from(new Set(search_rto_delivered_all_tab_date.split(/(\s+)/)));
            
            start_date   = explode_date[0];
            end_date     = explode_date[2];
            if(start_date == '2017-01-01' && end_date == current_date)
            {
                
            }
            else
            {
                if(active_tab_id == '1')
                {
                    custom_filter += "  and ((CAST(om.delivered_date as DATE) >= '"+ start_date +"' and CAST(om.delivered_date as DATE) <= '"+ end_date +"') and (om.new_live_status = '7')) ";
                }
                else
                {
                    custom_filter += "  and (CAST(om.delivered_date as DATE) >= '"+ start_date +"' and CAST(om.delivered_date as DATE) <= '"+ end_date +"') ";
                }
            }
        }
    }

    if(active_tab_id == '4')
    {
        if (search_manifest_id_checkbox_value.length > 0)
        {
            var search_manifest_id_checkbox = '';
            for (const search_manifest_id_value of search_manifest_id_checkbox_value) 
            {
           
                search_manifest_id_checkbox += decode(search_manifest_id_value)+',';
            }
            search_manifest_id_checkbox = search_manifest_id_checkbox.substr(0,-1);
            custom_filter += "  and om.itl_manifest_id IN ("+ search_manifest_id_checkbox +")";
        }
    }
    
    if(active_tab_id == '3' || active_tab_id == '4' || active_tab_id == '1')
    {
        if (search_pickup_address_checkbox_value.length > 0)
        {
            var search_pickup_address_checkbox = '';
            for (const search_pickup_address_value of search_pickup_address_checkbox_value) 
            {
           
                search_pickup_address_checkbox += decode(search_pickup_address_value)+',';
            }
            search_pickup_address_checkbox = search_pickup_address_checkbox.substr(0,-1);
            custom_filter += "  and om.user_address_id IN ("+ search_pickup_address_checkbox +")";
        }
    }
    
    if(active_tab_id == '3') // Ready To Dispatch
    {
        custom_filter += " and om.itl_manifest_id = 0";
    }
    
     //RTO start
    if(active_tab_id == '7')
    {
        if (rto_tab_id == 0) 
        {
            custom_filter += " and om.rto_status = 0";
        }
        else if (rto_tab_id == 1) 
        {
            custom_filter += " and om.rto_status = 1";
        }
        else if (rto_tab_id == 2) 
        {
            custom_filter += " and om.rto_status = 2";
        }
    }
    //RTO end
    
    if(active_tab_id == '4' && count(search_manifest_id_checkbox_value) == 0)
    {
        data = [];
        res.status(200).json({
            status : "success",
            status_code : 200,
            data: data,
            draw: form_data.draw,
            recordsFiltered: parseInt(0),
            recordsTotal: parseInt(0)
        });
        return;
    }
    
    var limit_start = form_data.start;
    var limit_end   = form_data.length;
    var order_by    = " order by om.id DESC";

    var get_count_query                = "SELECT count(*) as total_data FROM order_management om "+force_index+" LEFT JOIN user u ON om.user_id = u.id LEFT JOIN user_address ua ON om.user_address_id = ua.id LEFT JOIN states s ON ua.state_id = s.id LEFT JOIN pincode_lat_long pl ON pl.pincode = om.pincode Where "+ custom_filter;
    var result_count_get_order_query =JSON.parse( await view_order_model.commonSelectQuery(get_count_query));
    var total_data_array = [];
    
    for (const total_amount of result_count_get_order_query) 
    {
        //console.log(total_amount.total_data)
        total_data_array = total_amount;
    }
    var total_data         = total_data_array.total_data;
    
    var get_order_query = `SELECT 
                            om.id as order_management_id,
                            om.user_id,
                            u.first_name,
                            u.last_name,
                            u.company_name,
                            om.order_sub_order_no,
                            om.order_date_time,
                            om.created_date,
                            om.delivered_date,
                            om.manual_delivered_date,
                            om.pickup_date,
                            om.manual_pickup_date,
                            om.expected_delivery_date,
                            om.manual_expected_delivery_date,
                            om.netpayment,
                            om.product_mrp,
                            om.order_type,
                            om.product_description,
                            om.order_product_sku,
                            om.quantity,
                            om.final_order_total,
                            om.customer_name,
                            om.customer_email,
                            om.customer_mobile,
                            om.logistic_id,
                            om.logistics_service_type,
                            om.airway_bill_no,
                            om.user_address_id,
                            om.ship_length,
                            om.ship_width,
                            om.ship_height,
                            om.vol_weight,
                            om.phy_weight,
                            om.ndr_remark,
                            om.last_inscan_datetime,
                            om.manual_last_inscan_date,
                            om.customer_invoice_id,
                            om.is_customer_invoice_generated,
                            om.new_live_status,
                            om.live_status,
                            om.manual_new_live_status,
                            om.itl_manifest_id,
                            om.cancel_status,
                            om.pod_status,
                            om.rto_status,
                            om.is_manual_rto_delivered,
                            om.manual_rto_date,
                            om.first_attempt_date,
                            om.manual_first_attempt_date,
                            om.last_attempt_date,
                            om.manual_last_attempt_date,
                            om.itl_platform_id,
                            ua.company_name AS warehouse_name,
                            ua.pincode AS warehouse_pincode,
                            ua.id,
                            s.state_name
                        FROM order_management om
                        LEFT JOIN user u ON om.user_id = u.id 
                        LEFT JOIN user_address ua ON om.user_address_id = ua.id 
                        LEFT JOIN states s ON ua.state_id = s.id 
                        LEFT JOIN pincode_lat_long pl ON pl.pincode = om.pincode 
                        Where `+custom_filter+ order_by+` LIMIT `+limit_start+`,`+limit_end;
    
    var result_get_order_query       = JSON.parse( await view_order_model.commonSelectQuery(get_order_query));
    console.log(get_order_query);
    var all_order_data_array = [];
    var all_order_cancel_rto_pod_array = [];
    for (const row_get_query of result_get_order_query) 
    {
        
        //all_order_data_array.push(row_get_query);
    }
    all_order_data_array = result_get_order_query;
    
    if(active_tab_id == 6 || active_tab_id == 7)
    {
        if (all_order_data_array.length > 0)
        {
            var om_id_pod_rto = '';
            var temp_i = 0;
            for (const all_order_data of all_order_data_array) 
            {
                if(temp_i == 0)
                {
                    om_id_pod_rto += all_order_data['order_management_id'];
                }
                else
                {
                    om_id_pod_rto += ','+all_order_data['order_management_id'];
                }
                temp_i++;
            }
            //console.log(om_id_pod_rto);
            //om_id_pod_rto = om_id_pod_rto.substr(0,-1);
            console.log(om_id_pod_rto);
            var get_order_cancel_rto_pod_query = "SELECT om_row_id,pod_reject_remark,pod_file_name,rto_reject_remark FROM order_management_cancel_pod_rto WHERE om_row_id IN ("+om_id_pod_rto+") AND is_deleted = 0";
            var result_get_order_cancel_rto_pod_query       =JSON.parse( await view_order_model.commonSelectQuery(get_order_cancel_rto_pod_query));
            var all_order_cancel_rto_pod_array = {};
            for (const row_get_order_cancel_rto_pod_query of result_get_order_cancel_rto_pod_query) 
            {
            
                var temp_om_row_id = row_get_order_cancel_rto_pod_query['om_row_id'];
                all_order_cancel_rto_pod_array[temp_om_row_id] = row_get_order_cancel_rto_pod_query;
            }
        }
    }
        var data = [];
        const pattern2 = date.compile('DD-MM-YYYY HH:MM:SS');
        
    if (all_order_data_array.length > 0)
    {
        console.log("done");
        for (const all_order_data of all_order_data_array) 
        {
            console.log(all_order_data);
            row_id                             = all_order_data['order_management_id'];
            vendor_first_name                  = all_order_data['first_name'];
            vendor_last_name                   = all_order_data['last_name'];
            vendor_name                        = all_order_data['company_name'];
            order_sub_order_no                 = all_order_data['order_sub_order_no'];
            order_date_time                    = date.format(new Date(all_order_data['order_date_time']), pattern2); 
            created_date                       = date.format(new Date(all_order_data['created_date']), pattern2);
            netpayment                         = all_order_data['netpayment'];
            product_mrp                        = all_order_data['product_mrp'];
            order_type                         = all_order_data['order_type'];
            product_description                = all_order_data['product_description'];
            order_product_sku                  = all_order_data['order_product_sku'];
            quantity                           = all_order_data['quantity'];
            final_order_total                  = all_order_data['final_order_total'];
            customer_name                      = all_order_data['customer_name'];
            customer_email                     = all_order_data['customer_email'];
            customer_mobile                    = all_order_data['customer_mobile'];
            logistics_id                       = all_order_data['logistic_id'];
            logistics_service_type             = all_order_data['logistics_service_type'];
            airway_bill_no                     = all_order_data['airway_bill_no'];
            warehouse_name                     = all_order_data['warehouse_name'];
            warehouse_pincode                  = all_order_data['warehouse_pincode'];
            state_name                         = all_order_data['state_name'];
            ship_length                        = all_order_data['ship_length'];
            ship_width                         = all_order_data['ship_width'];
            ship_height                        = all_order_data['ship_height'];
            vol_weight                         = all_order_data['vol_weight'];
            phy_weight                         = all_order_data['phy_weight'];
            ndr_remark                         = all_order_data['ndr_remark'];
            new_live_status                    = all_order_data['new_live_status'];
            live_status                        = all_order_data['live_status'];
            manual_new_live_status             = all_order_data['manual_new_live_status'];
            itl_manifest_id                    = all_order_data['itl_manifest_id'];
            temp_delivered_date                = all_order_data['delivered_date'];
            manual_temp_delivered_date         = all_order_data['manual_delivered_date'];
            temp_created_date                  = all_order_data['created_date'];
            temp_pickup_date                   = all_order_data['pickup_date'];
            manual_temp_pickup_date            = all_order_data['manual_pickup_date'];
            expected_delivery_date             = all_order_data['expected_delivery_date'];
            manual_expected_delivery_date      = all_order_data['manual_expected_delivery_date'];
            customer_invoice_id                = all_order_data['customer_invoice_id'];
            cancel_status                      = all_order_data['cancel_status'];
            pod_status                         = all_order_data['pod_status'];
            rto_status                         = all_order_data['rto_status'];
            is_manual_rto_delivered            = all_order_data['is_manual_rto_delivered'];
            user_id                            = all_order_data['user_id'];
            itl_platform_id                    = all_order_data['itl_platform_id'];
            itl_zone                           = 1;
            itl_zone_color = zone_label = '';
            if(itl_zone == 1){itl_zone_color = 'green';}
            if(itl_zone == 2){itl_zone_color = 'orange';}
            if(itl_zone == 3){itl_zone_color = 'red';}
            if(itl_zone_color != '')
            {
                zone_label = '<div class="zone-'+itl_zone_color+'-label">'+itl_zone_color+' Zone</div>';
            }    
            
            var manual_temp_rto_date               = all_order_data['manual_rto_date'];
            var manual_rto_date                    = date.format(new Date(all_order_data['manual_rto_date']), pattern2);
            
            var is_customer_invoice_generated      = all_order_data['is_customer_invoice_generated'];

            var logistics_image_filename_array     = get_logistic_name(logistics_id);
            console.log(logistics_image_filename_array[0]);
            var logistics_image_filename           = logistics_image_filename_array[0].imagname;
            var logistic_image                     = logistics_image_filename;

            user_name      = vendor_first_name+' '+vendor_last_name;
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
            vendor_name            = (vendor_name);
            product_description    = (product_description);
            customer_name          = (customer_name);
            customer_email         = (customer_email);
            order_product_sku      = (order_product_sku);
            warehouse_name         = (warehouse_name);
            if(vendor_name.length >= 15)
            {
                vendor_name_old = '<span class="tooltip_class" data-toggle="tooltip" title="'+vendor_name+'" data-html="true" data-placement="right">'+vendor_name.substr(0,15)+' ...</span>';
            }

            if(product_description.length >= 10)
            {
                product_description_old = '<span class="tooltip_class" data-toggle="tooltip" title="'+product_description+'" data-html="true" data-placement="right">'+product_description.substr(0,10)+' ...</span>';
            }

            if(customer_name.length >= 15)
            {
                customer_name_old = '<span class="tooltip_class" data-toggle="tooltip" title="'+customer_name+'" data-html="true" data-placement="right">'+customer_name.substr(0,15)+' ...</span>';
            }

            if(customer_email.length >= 15)
            {
                customer_email_old = '<span class="tooltip_class" data-toggle="tooltip" title="'+customer_email+'" data-html="true" data-placement="right">'+customer_email.substr(0,15)+' ...</span>';
            }

            if(active_tab_id == 1 || active_tab_id == 3 || active_tab_id == 4 || active_tab_id == 5 || active_tab_id == 6 || active_tab_id == 7)
            {
                /*if(strtolower(order_type) == 'cod') 
                {
                    payment_amount     = netpayment;
                } 
                else 
                {
                    payment_amount     = product_mrp;
                }*/
                
                var payment_amount = final_order_total;
                var nestedData = {};
                nestedData["row_id"]=row_id;
                //if(is_login == 1 && ((loggedin_user_type == 1 || (loggedin_user_type == 2 && loggedin_view_itl_orders == 1))))
                
                    if(active_tab_id != '4')
                    {
                        nestedData["vendor_name"]=vendor_name;
                    }
                
                var zone_label = '';
                nestedData["order_sub_order_no"]=order_sub_order_no;
                //nestedData.push( '<div>'+order_sub_order_no+'</div>'+zone_label);
                nestedData["created_date"]=date.format(new Date(created_date), pattern2);
                //nestedData.push( '<div class="m-b-8">'+ date.format(new Date(created_date), pattern2)+'</div>'+
                
                                 //'<div>'+date.format(new Date(created_date), pattern2)+'</div>');

                if(active_tab_id == '6')
                {
                    if(temp_delivered_date == '0000-00-00 00:00:00')
                    {
                        nestedData["temp_delivered_date"]="";
                        //nestedData.push('');
                    }
                    else
                    {
                        nestedData["temp_delivered_date"]=date.format(new Date(temp_delivered_date), pattern2);
                        //nestedData.push(date.format(new Date(temp_delivered_date), pattern2));
                    }
                }

                if(active_tab_id == '7')
                {
                    if(temp_delivered_date == '0000-00-00 00:00:00')
                    {
                        nestedData["temp_delivered_date"]="";
                        //nestedData.push('');
                    }
                    else
                    {
                        nestedData["temp_delivered_date"]=date.format(new Date(temp_delivered_date), pattern2);
                    }
                }
                
                if(active_tab_id == '1')
                {
                    if(temp_created_date == '0000-00-00 00:00:00')
                    {
                        nestedData["temp_created_date"]="";
                        //nestedData.push('');
                    }
                    else
                    {
                        nestedData["temp_created_date"]=date.format(new Date(temp_created_date), pattern2);
                        nestedData["created_date"]=created_date;
                        //nestedData.push(created_date);
                    }
                    
                    
                    if(temp_pickup_date == '0000-00-00 00:00:00')
                    {
                        nestedData["temp_pickup_date"]="";
                        //nestedData.push('');
                    }
                    else
                    {
                        nestedData["temp_pickup_date"]=date.format(new Date(temp_pickup_date), pattern2);
                        //nestedData.push(date.format(new Date(temp_pickup_date), pattern2));
                    }
                    
                    if(new_live_status == '7')
                    {
                        if(temp_delivered_date == '0000-00-00 00:00:00')
                        {
                            nestedData["temp_delivered_date"]="";
                            //nestedData.push('');
                        }
                        else
                        {
                            nestedData["temp_delivered_date"]=date.format(new Date(temp_delivered_date), pattern2);
                            //nestedData.push(date.format(new Date(temp_delivered_date), pattern2));
                        }
                    }
                    else
                    {
                        //nestedData.push('');
                    }
                    
                    if( new_live_status >= '11' && new_live_status <= '17' )
                    {
                        if(temp_delivered_date == '0000-00-00 00:00:00')
                        {
                            nestedData["temp_delivered_date"]="";
                            //nestedData.push('');
                        }
                        else
                        {
                            nestedData["temp_delivered_date"]=date.format(new Date(temp_delivered_date), pattern2);
                            
                            //nestedData.push(date.format(new Date(temp_delivered_date), pattern2));
                        }
                    }
                    else
                    {
                       // nestedData.push('');
                    }
                }
                nestedData["payment_amount"]=payment_amount;
                nestedData["order_type"]=order_type;
                
                //nestedData.push('<div class="text-success m-b-8"><i class="fas fa-rupee-sign"></i>'+payment_amount+'</div>'+
                  //              '<div class="text-uppercase text-success">'+order_type+'</div>');
                  
                if(order_product_sku == '')
                {
                    
                    nestedData["order_product_sku"]='N/A';
                    //order_product_sku = 'N/A';
                }
                else{
                    console.log(order_product_sku);
                    if(order_product_sku.length >= 10)
                    {
                        nestedData["order_product_sku"]=order_product_sku;
                        //order_product_sku = '<span class="tooltip_class" data-toggle="tooltip" title="'+order_product_sku+'" data-html="true" data-placement="right">'+order_product_sku.substr(0,10)+' ...</span>';
                    }
                }
                
                nestedData["product_description"]=product_description;
                nestedData["quantity"]=quantity;
                //nestedData.push('<div class="m-b-8">Name: '+product_description+'</div>'+
                 //               '<div class="m-b-8">SKU: '+order_product_sku+'</div>'+
                 //               '<div>Qty: '+quantity+'</div>');  
                
                var customer_mobile_text='';
                
                if(customer_mobile.length >= 5)
                {
                    nestedData["customer_mobile"]=customer_mobile;
                    //customer_mobile_text = '<div>Mob no: <span class="datatable-blue">'+customer_mobile+'</span></div>';
                }
                else
                {
                    nestedData["customer_mobile"]='N/A';
                    //customer_mobile_text = 'N/A';
                }
                
                nestedData["customer_name"]=customer_name;
                nestedData["customer_email"]=customer_email;
                nestedData["customer_mobile"]=customer_mobile;
                //nestedData.push('<div class="m-b-8">'+customer_name+'</div>'+
                 //               '<div class="m-b-8">'+customer_email+'</div>'+customer_mobile_text);
                nestedData["logistic_image"]=base_url_images+logistic_image;
                nestedData["airway_bill_no"]=airway_bill_no;
                //var logistics_details = '<div class="m-b-8"><img src="'+base_url_images+logistic_image+'" class="logistics-img-dt" alt="'+logistics_image_filename+'"></div>'+
                //                        '<div class="m-b-8">AWB: <span class="f-w-500">'+airway_bill_no+'</span></div>';
                
                var temp_logistics_details = '';
                temp_logistics_tooltip_details = '';
                if(active_tab_id == '5' || active_tab_id == '6' || active_tab_id == '7' || active_tab_id == '1')
                {
                    var temp_warehouse_name='';
                    if(warehouse_name ==null)
                    {

                    }
                    else{
                        if(warehouse_name.length >= 15)
                        {
                            temp_warehouse_name = warehouse_name.substr(0,15);
                        }
                        else
                        {
                            temp_warehouse_name = warehouse_name;
                        }
                    }
                    if(warehouse_pincode != '')
                    {
                        temp_logistics_details = temp_warehouse_name+' - '+warehouse_pincode;
                        temp_logistics_tooltip_details = warehouse_name+' - '+warehouse_pincode;
                    }
                    else
                    {
                        temp_logistics_details = temp_warehouse_name;
                        temp_logistics_tooltip_details = warehouse_name;
                    }
                }
                console.log(warehouse_name)
                if(warehouse_name == null)
                {

                }
                else{
                    if(warehouse_name.length >= 15)
                    {
                        temp_logistics_tooltip_details = temp_logistics_tooltip_details;
                        temp_logistics_details = temp_logistics_details;
                        //temp_logistics_details1 = '<div><span class="tooltip_class" data-toggle="tooltip" title="'+temp_logistics_tooltip_details+'" data-html="true" data-placement="right">'+temp_logistics_details+'</span></div>';
                    }
                }
                
                console.log("aas")
                nestedData["temp_logistics_tooltip_details"]=temp_logistics_tooltip_details;
                nestedData["temp_logistics_details"]=temp_logistics_details;
                //nestedData.push(logistics_details+temp_logistics_details);
                
                if(active_tab_id == '3' || active_tab_id == '4' || active_tab_id == '1')
                {
                    if(warehouse_pincode != '')
                    {
                        warehouse_details = warehouse_name+' - '+warehouse_pincode;
                    }
                    else
                    {
                        warehouse_details = warehouse_name;
                    }
                    
                    /*if(strlen(warehouse_details) >= 15)
                    {
                        warehouse_details = '<div class="datatable-blue"><span class="tooltip_class datatable-blue" data-toggle="tooltip" title="'.warehouse_details.'" data-html="true" data-placement="right">'.substr(warehouse_details,0,15).'</span></div>';
                    }*/
                    nestedData["warehouse_details"]=warehouse_details;
                    //nestedData.push(warehouse_details);
                }
                if(ship_length != '' || ship_width != '' || ship_height != '') 
                {
                    if(ship_length == '')
                    {
                        ship_length = '0';
                    }
                    if(ship_width == '')
                    {
                        ship_width = '0';
                    }
                    if(ship_height == '')
                    {
                        ship_height = '0';
                    }
                    ship_dimension = ship_length+' x '+ship_width+' x '+ship_height+' cm';
                } 
                else 
                {
                    ship_dimension = '';
                }
                nestedData["ship_dimension"]=ship_dimension;
                nestedData["vol_weight"]=vol_weight;
                nestedData["phy_weight"]=phy_weight;
                //nestedData.push('<div class="m-b-8">'+ship_dimension+'</div>'+
                  //              '<div class="m-b-8">Volumetric: '+vol_weight+' Kg</div>'+
                  //              '<div>Entered: '+phy_weight+' Kg</div>');
                                
                if(active_tab_id == '1')
                {
                    //nestedData[] = '';
                }
                var log_cutt_off_time = '';
                if(active_tab_id == '3' || active_tab_id == '1')
                {
                    if(logistics_id == 1 || logistics_id == 2 || logistics_id == 3 || logistics_id == 5 || logistics_id == 6 || logistics_id == 8)
                    {
                        if(logistics_id == 6)
                        {
                            log_cutt_off_time = '10:00:00';
                        }
                        else if(logistics_id == 1 || logistics_id == 5)
                        {
                            log_cutt_off_time = '11:00:00';
                        }
                        else if(logistics_id == 8)
                        {
                            log_cutt_off_time = '12:00:00';
                        }
                        else if(logistics_id == 2)
                        {
                            log_cutt_off_time = '12:30:00';
                        }
                        else if(logistics_id == 3)
                        {
                            log_cutt_off_time = '13:00:00';
                        }
                        const pattern_time = date.compile('H:i:s');
                        var cutoff_time = '';
                        if(date.format(new Date(created_date), pattern2) == date.format(new Date(), pattern2)) 
                        {
                            if(date.format(new Date(created_date), pattern_time) <= date.format(new Date(log_cutt_off_time), pattern_time) ) 
                            {
                                cutoff_time = 'Today';
                            } 
                            else 
                            {
                                cutoff_time = 'Tomorrow';
                            }
                        } 
                        else 
                        {
                            if(date.format(new Date(), pattern_time) <= date.format(new Date(log_cutt_off_time), pattern_time)) 
                            {
                                cutoff_time = 'Today';
                            } 
                            else 
                            {
                                cutoff_time = 'Tomorrow';
                            }
                        }
                    }
                    else
                    {
                        cutoff_time = 'N/A';
                    }
                    nestedData["cutoff_time"]=cutoff_time;
                    //nestedData.push('<div>'+cutoff_time+'</div>');
                }
                
                if(active_tab_id == '3' || active_tab_id == '1' || active_tab_id == '4' || active_tab_id == '5')
                {
                    if(expected_delivery_date == '0000-00-00')
                    {
                        expected_delivery_date = 'N/A';
                        expected_delivery_time = '';
                    }
                    else
                    {
                        expected_delivery_date = date.format(new Date(expected_delivery_date), pattern2);
                        expected_delivery_time = '';
                    }
                    nestedData["expected_delivery_date"]=expected_delivery_date;
                    nestedData["expected_delivery_time"]=expected_delivery_time;
                    //nestedData.push('<div class="m-b-8">'+expected_delivery_date+'</div>'+
                    //                 '<div>'+expected_delivery_time+'</div>');
                }
                if(active_tab_id == '5' || active_tab_id == '1')
                {
                    var ndr_remark                     = (all_order_data['ndr_remark']);
                    
                    var manual_temp_last_inscan_datetime = (all_order_data['manual_last_inscan_date']);
                    var temp_last_inscan_datetime      = (all_order_data['last_inscan_datetime']);
                    console.log(date.format(new Date(temp_last_inscan_datetime), pattern2))
                    var last_inscan_datetime           = (temp_last_inscan_datetime != '0000-00-00 00:00:00' && temp_last_inscan_datetime != '' && temp_last_inscan_datetime != null) ? date.format(new Date(temp_last_inscan_datetime), pattern) : 'N/A';
                    var notify_ndr_visit_count         = all_order_data['notify_ndr_visit_count'];

                    var manual_temp_first_attempt_date = (all_order_data['manual_first_attempt_date']);
                    var temp_first_attempt_date        = (all_order_data['first_attempt_date']);
                    var first_attempt_date             = (temp_first_attempt_date != '0000-00-00' && temp_first_attempt_date != '' && temp_first_attempt_date != null) ? date.format(new Date(temp_first_attempt_date), pattern2) : 'N/A';
                    
                    var manual_temp_last_attempt_date  = (all_order_data['manual_last_attempt_date']);
                    var temp_last_attempt_date         =(all_order_data['last_attempt_date']);
                    var last_attempt_date              = (temp_last_attempt_date != '0000-00-00' && temp_last_attempt_date != '' && temp_last_attempt_date != null) ? date.format(new Date(temp_last_attempt_date), pattern2) : 'N/A';
                    
                    var total_attempts_hover_content   = "<div>"+
                                                            "<div>OFD1: "+first_attempt_date+"</div></div>"+
                                                        "<div>"
                                                            "<div>OFD2: "+last_attempt_date+"</div>"+
                                                        "</div>";
                    var total_attempts = '<i class="tooltip_class icon-exclamation" data-toggle="tooltip" title="'+total_attempts_hover_content+'" data-html="true" data-placement="right"></i>';
                    nestedData["last_inscan_datetime"]=last_inscan_datetime;
                    //nestedData.push('<div>'+last_inscan_datetime+'</div>');
                    nestedData["notify_ndr_visit_count"]=notify_ndr_visit_count;
                    nestedData["first_attempt_date"]=first_attempt_date;
                    nestedData["last_attempt_date"]=last_attempt_date;
                    nestedData["ndr_remark"]=ndr_remark;
                    //nestedData.push('<div class="m-b-8">'+notify_ndr_visit_count+' &nbsp;'+total_attempts+'</div>'+
                    //                 '<div class>'+ndr_remark+'</div>');
                }

                if(active_tab_id == '1')
                {
                    /*if(new_live_status <= 1) // Ready To Dispatch
                    {
                        nestedData[] = '<div class="d-block datatable-blue status-title-text">Ready To Dispatch</div>';
                    }
                    else if(new_live_status < 2 && itl_manifest_id != 0) // Manifest
                    {
                        nestedData[] = '<div class="d-block datatable-blue status-title-text">Manifest</div>';
                    }    
                    else if(new_live_status == '3' || new_live_status == '4' || new_live_status == '5' || new_live_status == '6' || new_live_status == '31' || new_live_status == '32' || new_live_status == '33' || new_live_status == '34') // Intransit
                    {
                        nestedData[] = '<div class="d-block datatable-blue status-title-text">Intransit</div>';
                    }   
                    else if(new_live_status == '7') // Delivered
                    {
                        nestedData[] = '<div class="d-block datatable-blue status-title-text">Delivered</div>';
                    } 
                    else if(new_live_status == '11' || new_live_status == '12' || new_live_status == '13' || new_live_status == '14' || new_live_status == '15' || new_live_status == '16' || new_live_status == '17') // RTO
                    {
                        nestedData[] = '<div class="d-block datatable-blue status-title-text">RTO</div>';
                    }
                    else
                    {
                        nestedData[] = itl_tracking_status(new_live_status)['status_title'];
                    }*/
                    
                    
                    if(new_live_status == '0' || new_live_status == '1')
                    {
                        if(cancel_status == 1 || cancel_status == 4)
                        {
                            nestedData["cancel_status"]='Cancel Request Approved';
                            //nestedData.push('Cancel Request Approved');
                        }
                        else if(cancel_status == 2)
                        {
                            nestedData["cancel_status"]='Cancel Request Rejected';
                            //nestedData.push('Cancel Request Rejected');
                        }
                        else if(cancel_status == 3)
                        {
                            nestedData["cancel_status"]='Cancel Request Pending';
                            //nestedData.push('Cancel Request Pending');
                        }
                        else
                        {
                            if (new_live_status == '1' && live_status == '11') 
                            {
                                nestedData["new_live_status"]='Out For Pickup';
                                //nestedData.push('Out For Pickup');
                            }
                            else if (new_live_status == '1' && live_status == '12') 
                            {
                                nestedData["new_live_status"]='Pickup Rescheduled';
                                //nestedData.push('Pickup Rescheduled');
                            }
                            else if (new_live_status == '1' && live_status == '13') 
                            {
                                nestedData["new_live_status"]='Pickup Schedule';
                                //nestedData.push('Pickup Schedule');
                            }
                            else if (new_live_status == '1' && live_status == '14') 
                            {
                                nestedData["new_live_status"]='Pending Pickup';
                                //nestedData.push('Pending Pickup');
                            }
                            else if (new_live_status == '1' && live_status == '15') 
                            {
                                nestedData["new_live_status"]='Pickup Error';
                                //nestedData.push('Pickup Error');
                            }
                            else if (new_live_status == '1' && live_status == '16') 
                            {
                                nestedData["new_live_status"]='Pickup Cancel';
                                //nestedData.push('Pickup Cancel');
                            }
                            else if (new_live_status == '1' && live_status == '17') 
                            {
                                nestedData["new_live_status"]='Pickup Fail';
                                //nestedData.push('Pickup Fail');
                            }
                            else
                            {
                                nestedData["new_live_status"]=itl_tracking_status(new_live_status)[0].status_title;
                                //nestedData.push( itl_tracking_status(new_live_status)[0].status_title);
                            }
                        }
                    }
                    else
                    {
                        console.log(itl_tracking_status(new_live_status)[0].status_title);
                        nestedData["new_live_status"]=itl_tracking_status(new_live_status)[0].status_title;
                        //nestedData.push(itl_tracking_status(new_live_status)[0].status_title);
                    }
                    
                }
                //RTO start
                if(active_tab_id == '7')
                {
                    var status_data = '';
                    if (rto_status == 1) 
                    {
                        status_data = 'Accepted';
                    }
                    else if(rto_status==2)
                    {
                        status_data = 'Rejected';
                    }
                    else
                    {
                        status_data = 'Pending';
                    }
                    nestedData["status_data"]=status_data;
                    //nestedData.push(status_data);
                }
                //RTO end
                
                var action_data = '';
                if(active_tab_id == '1' || active_tab_id == '3' || active_tab_id == '4' || active_tab_id == '5'|| active_tab_id == '6' || active_tab_id == '7')
                {
                    action_data += '<div class="datatable-action-btn-outer">'+
                                        '<a href="#" class="btn btn-light datatable-action-btn-light dropdown-toggle" data-toggle="dropdown">Action</a>'+
                                        '<div class="dropdown-menu datatable-action">'+
                                            '<a onclick="modal_order_details('+row_id+',1,\'\','+active_tab_id+')" class="dropdown-item">'+
                                                '<img src="'+base_url_images+'view-order-action-view-order.svg">View Order'+
                                            '</a>'+
                                            '<a onclick="modal_order_details('+row_id+',2,\'\','+active_tab_id+')" class="dropdown-item">'+
                                                '<img src="'+base_url_images+'view-order-action-track-order.svg">Track Order'+
                                            '</a>';
                                            //added for order cloning on 29 oct 2020
                                            var disabled = '';
                                            var onclick = '';
                                            if(loggedin_user_type == 1 || loggedin_user_type == 2 || loggedin_user_type == 3)
                                            {
                                                if(itl_platform_id > 0)
                                                {
                                                    disabled = "";
                                                    onclick  = 'onclick="clone_order('+row_id+',1,'+user_id+')"';
                                                }
                                                else
                                                {
                                                    disabled = "style='pointer-events: none;cursor:no-drop;color: lightgrey;'";
                                                     onclick  = "";
                                                }
                                                action_data +=     '<a '+onclick+' class="dropdown-item " '+disabled+'>'+
                                                                        '<img src="'+base_url_images+'view-order-action-track-order.svg">Order Cloning'+
                                                                    '</a>';
                                            }
                                            if((active_tab_id == '3' || active_tab_id == '4'))
                                            {
                                                action_data += '<a onclick="print_barcode('+row_id+')" class="dropdown-item">'+
                                                                    '<img src="'+base_url_images+'view-order-action-print.svg">Print Shipment'+
                                                                '</a>'+
                                                                '<a onclick="print_manifest('+row_id+')" class="dropdown-item">'+
                                                                    '<img src="'+base_url_images+'view-order-action-print.svg">Print Manifest'+
                                                                '</a>';
                                            }
                                            if(is_customer_invoice_generated == 1)
                                            {
                                                action_data +='<a onclick="call_mpdf_invoice('+customer_invoice_id+')" class="dropdown-item">'+
                                                                    '<img src="'+base_url_images+'view-order-action-print.svg">Print Invoice'+
                                                                '</a>';
                                            }
                                            else
                                            {   
                                                
                                            }
                                            if(active_tab_id == '1' || active_tab_id == '3' || (manifest_pending_complete == 1 && active_tab_id == '4'))
                                            {
                                                if(cancel_status == 0 && (new_live_status == '0' || new_live_status == '1'))
                                                {
                                                    action_data += '<a onclick="cancel_awb_modal('+row_id+','+itl_platform_id+')" class="dropdown-item cancle-button cancel_awb_'+row_id+'">'+
                                                                        '<img src="'+base_url_images+'view-order-action-cancel-order.svg">Cancel Order'+
                                                                    '</a>';
                                                }
                                                else if(cancel_status == 1 || cancel_status == 4)
                                                {
                                                    action_data += '<a class="dropdown-item cancle-button cancel_awb_'+row_id+'">'+
                                                                        '<img src="'+base_url_images+'view-order-action-cancel-order.svg">Cancel Request Approved'+
                                                                    '</a>';
                                                }
                                                else if(cancel_status == 2)
                                                {
                                                    action_data += '<a class="dropdown-item cancle-button cancel_awb_'+row_id+'">'
                                                                        '<img src="'+base_url_images+'view-order-action-cancel-order.svg">Cancel Request Rejected'+
                                                                    '</a>';
                                                }
                                                else if(cancel_status == 3)
                                                {
                                                    action_data += '<a class="dropdown-item cancle-button cancel_awb_'+row_id+'">'+
                                                                        '<img src="'+base_url_images+'view-order-action-cancel-order.svg">Cancel Request Pending'+
                                                                    '</a>';
                                                }
                                                else
                                                {
                                                    action_data += '';
                                                }
                                            }
                                            if(active_tab_id == '6')
                                            {
                                                if(loggedin_user_type == 1 || loggedin_user_type == 2 || loggedin_user_type == 3)
                                                {
                                                    if(itl_platform_id > 0)
                                                    {
                                                        disabled = "";
                                                        onclick  = 'onclick="clone_order('+row_id+',2,'+user_id+')"';
                                                    }
                                                    else
                                                    {
                                                        disabled   = "style='pointer-events: none;cursor:no-drop;color: lightgrey;'";
                                                         onclick   = "";
                                                    }
                                                    if(loggedin_user_id == 1445 || loggedin_user_id == 9 || loggedin_user_id == 1623 || loggedin_user_id == 1186 )
                                                    {
                                                        action_data +=     '<a '+onclick+' class="dropdown-item " '+disabled+'>'+
                                                                            '<img src="'+base_url_images+'view-order-action-track-order.svg">Edit Reverse Order Booking'+
                                                                        '</a>';
                                                    }
                                                }
                                                if(pod_status == 1 || pod_status == 4)
                                                {
                                                    pod_file_name = decode(all_order_cancel_rto_pod_array[row_id]['pod_file_name']);
                                                    action_data += '<a href="'+base_url_s3_uploads+'pod/size_large/'+pod_file_name+'" class="dropdown-item pod_awb_'+row_id+'" target="_blank">'+
                                                                        '<img src="'+base_url_images+'proof-of-delivery.svg">Download POD'+
                                                                    '</a>';
                                                }
                                                else if(pod_status == 2)
                                                {
                                                    pod_file_name = decode(all_order_cancel_rto_pod_array[row_id]['pod_reject_remark']);
                                                    action_data += '<a class="dropdown-item tooltip_class pod_awb_'+row_id+'" data-toggle="tooltip" title="Remark: '+pod_reject_remark+'" data-html="true" data-placement="top">'
                                                                        '<img src="'+base_url_images+'request-pod.svg">POD Request Rejected'
                                                                    '</a>';
                                                }
                                                else if(pod_status == 3)
                                                {
                                                    action_data += '<a class="dropdown-item pod_awb_'+row_id+'">'+
                                                                        '<img src="'+base_url_images+'request-pod.svg">POD Requested'+
                                                                    '</a>';
                                                }
                                                
                                            }
                                            
                                            if(active_tab_id == '7')
                                            {
                                                if(manual_rto_date == '' || manual_rto_date == '-0001-11-30 00:00:00' || manual_rto_date == '0000-00-00 00:00:00' || manual_rto_date == '1971-01-01 00:00:00')
                                                {
                                                    
                                                }
                                                else
                                                {   var temp_manual_rto_date_temp = date.format(new Date(manual_rto_date), pattern2);
                                                    new Date(temp_manual_rto_date_temp).setMonth( new Date(temp_manual_rto_date_temp).getMonth() + 1 );
                                                    var temp_manual_rto_date           = temp_manual_rto_date_temp;
                                                    var current_date                   = date.format(new Date(), pattern2);
                                                    if((rto_status == '0' || rto_status == '') && is_manual_rto_delivered == '1' && current_date <= temp_manual_rto_date)
                                                    {
                                                        action_data += '<a onclick="get_rto_modal(2,1,\''+airway_bill_no+'\')" class="dropdown-item accept-button">'+
                                                                            '<img src="'+base_url_images+'view-order-action-accept.svg"> RTO Accept'+
                                                                        '</a>'+
                                                                        '<a onclick="get_rto_modal(2,2,\''+airway_bill_no+'\')" class="dropdown-item reject-button">'+
                                                                            '<img src="'+base_url_images+'view-order-action-reject.svg"> RTO Reject'+
                                                                        '</a>';
                                                    }
                                                    else if(rto_status == '1')
                                                    {
                                                        action_data += '<a class="dropdown-item accept-button">'+
                                                                            '<img src="'+base_url_images+'view-order-action-accept.svg"> RTO Accepted'+
                                                                        '</a>';
                                                    }
                                                    else if(rto_status == '2')
                                                    {
                                                        rto_reject_remark = decode(all_order_cancel_rto_pod_array[row_id]['rto_reject_remark']);
                                                        action_data += '<a class="dropdown-item tooltip_class reject-button" data-toggle="tooltip" title="Remark: '+rto_reject_remark+'" data-html="true" data-placement="top">'+
                                                                            '<img src="'+base_url_images+'view-order-action-reject.svg"> RTO Rejected'+
                                                                        '</a>';
                                                    }
                                                }
                                            }
                                            action_data += '</div></div>';
                                        }

                                        //nestedData.push(action_data);
                                       
                                    }
                                    data.push(nestedData)
                                }
                                
                            }
                            
                            res.status(200).json({
                                status : "success",
                                status_code : 200,
                                data_array: data,
                                draw: parseInt(form_data.draw),
                                recordsFiltered: parseInt(total_data),
                                recordsTotal: parseInt(total_data)
                            });
                            return; 
    
};

function get_logistic_name(type)
{
   var log_name = type.toString();
   console.log(log_name)
   var data = [];
   switch(log_name) {
       case '1':
       case 'xpressbees':
            data.push({
                id : '1',
                logname : 'Xpressbees',
                imagname : 'xpressbees.png',
            });
           
           break;
       case '2':
       case 'fedex':
            data.push({
                id : '2',
                logname : 'Fedex',
                imagname : 'fedex.png',
            });
           
           break;
        case '2_4':
        case 'fedex-standard':
            data.push({
                id : '2_4',
                logname : 'Fedex Standard',
                imagname : 'fedex-standard.png',
                tracking_url :'https://www.ithinklogistics.com/track-order-status.php?tracking_number=replace_awb_no_here'
            });
           break;
        case '2_5':
        case 'fedex-priority':
            data.push({
                id : '2_5',
                logname : 'Fedex Priority',
                imagname : 'fedex-priority.png',
                tracking_url :'https://www.ithinklogistics.com/track-order-status.php?tracking_number=replace_awb_no_here'
            });
           break;
        case '2_6':
        case 'fedex-gMath.round':
            data.push({
                id : '2_6',
                logname : 'Fedex GMath.round',
                imagname : 'fedex-gMath.round.png',
                tracking_url :'https://www.ithinklogistics.com/track-order-status.php?tracking_number=replace_awb_no_here'
            });
            break;
       case '3':
       case 'delhivery':
            data.push({
                id : '3',
                logname : 'Delhivery',
                imagname : 'delhivery.png',
            });
           
           break;
       case '4':
       case 'aramex':
            data.push({
                id : '4',
                logname : 'Aramex',
                imagname : 'aramex.png',
            });
          
           break;
       case '5':
       case 'ecom express':
            data.push({
                id : '5',
                logname : 'Ecom Express',
                imagname : 'ecomexpress.png',
            });
           
           break;
       case '6':
       case 'ekart':
            data.push({
                id : '6',
                logname : 'Ekart',
                imagname : 'ekart.png',
            });
           break;
       case '7':
       case 'bluedart':
            data.push({
                id : '7',
                logname : 'Bluedart',
                imagname : 'bluedart.png',
            });
           break;
        case '8':
        case 'shadowfax':
            data.push({
                id : '8',
                logname : 'ShadowFax',
                imagname : 'shadowfax.png',
            });
           break;
       default:
            data.push({
                id : '',
                logname : '',
                imagname : '',
            });
           
           break;
   }
   return data;
}

function itl_tracking_status(type)
{
    data = type.toString();
    switch(data) {
        case '0':
        case 'manifested':
            itl_status_id      = 0;
            status_title       = 'Manifested';
            itl_status_code    = 'UD';
            break;
        case '1':
        case 'not picked':
            itl_status_id      = 1;
            status_title       = 'Not Picked';
            itl_status_code    = 'UD';
            break;
        case '2':
        case 'picked up':
            itl_status_id      = 2;
            status_title       = 'Picked Up';
            itl_status_code    = 'UD';
            break;
        case '3':
        case 'in transit':
            itl_status_id      = 3;
            status_title       = 'In Transit';
            itl_status_code    = 'UD';
            break;
        case '4':
        case 'reached at destination':
            itl_status_id      = 4;
            status_title       = 'Reached At Destination';
            itl_status_code    = 'UD';
            break;
        case '5':
        case 'out for delivery':
            itl_status_id      = 5;
            status_title       = 'Out For Delivery';
            itl_status_code    = 'UD';
            break;
        case '6':
        case 'undelivered':
            itl_status_id      = 6;
            status_title       = 'Undelivered';
            itl_status_code    = 'UD';
            break;
        case '7':
        case 'delivered':
            itl_status_id      = 7;
            status_title       = 'Delivered';
            itl_status_code    = 'DL';
            break;
        case '8':
        case 'cancelled':
            itl_status_id      = 8;
            status_title       = 'Cancelled';
            itl_status_code    = 'CN';
            break;
        case '9':
            itl_status_id      = 9;
            status_title       = '';
            itl_status_code    = '';
            break;
        case '10':
            itl_status_id      = 10;
            status_title       = '';
            itl_status_code    = '';
            break;
        case '11':
        case 'rto pending':
            itl_status_id      = 11;
            status_title       = 'RTO Pending';
            itl_status_code    = 'RT';
            break;
        case '12':
        case 'rto processing':
            itl_status_id      = 12;
            status_title       = 'RTO Processing';
            itl_status_code    = 'RT';
            break;
        case '13':
        case 'rto in transit':
            itl_status_id      = 13;
            status_title       = 'RTO In Transit';
            itl_status_code    = 'RT';
            break;
        case '14':
        case 'reached at origin':
            itl_status_id      = 14;
            status_title       = 'Reached At Origin';
            itl_status_code    = 'RT';
            break;
        case '15':
        case 'rto out for delivery':
            itl_status_id      = 15;
            status_title       = 'RTO Out For Delivery';
            itl_status_code    = 'RT';
            break;
        case '16':
        case 'return undelivered':
            itl_status_id      = 16;
            status_title       = 'Return Undelivered';
            itl_status_code    = 'RT';
            break;
        case '17':
        case 'rto delivered':
            itl_status_id      = 17;
            status_title       = 'RTO Delivered';
            itl_status_code    = 'DL';
            break;
        case '18':
            itl_status_id      = 18;
            status_title       = '';
            itl_status_code    = '';
            break;
        case '19':
            itl_status_id      = 19;
            status_title       = '';
            itl_status_code    = '';
            break;
        case '20':
            itl_status_id      = 20;
            status_title       = '';
            itl_status_code    = '';
            break;
        case '21':
        case 'lost':
            itl_status_id      = 21;
            status_title       = 'Lost';
            itl_status_code    = 'LOST';
            break;
        case '22':
        case 'shortage':
            itl_status_id      = 22;
            status_title       = 'Shortage';
            itl_status_code    = 'Shortage';
            break;
        case '23':
        case 'rto shortage':
            itl_status_id      = 23;
            status_title       = 'RTO Shortage';
            itl_status_code    = 'RTO Shortage';
            break;
        case '24':
        case 'rev manifest':
            itl_status_id      = 24;
            status_title       = 'REV Manifest';
            itl_status_code    = '';
            break;
        case '25':
        case 'rev in-transit':
            itl_status_id      = 25;
            status_title       = 'REV In-Transit';
            itl_status_code    = '';
            break;
        case '26':
        case 'rev cancelled':
            itl_status_id      = 26;
            status_title       = 'REV Cancelled';
            itl_status_code    = '';
            break;
        case '27':
        case 'rev delivered':
            itl_status_id      = 27;
            status_title       = 'REV Delivered';
            itl_status_code    = '';
            break;
        case '31':
        case 'out of delivery area':
            itl_status_id      = 31;
            status_title       = 'Out of Delivery Area';
            itl_status_code    = '';
            break;
        case '32':
        case 'delayed':
            itl_status_id      = 32;
            status_title       = 'Delayed';
            itl_status_code    = '';
            break;
        case '33':
        case 'damaged':
            itl_status_id      = 33;
            status_title       = 'Damaged';
            itl_status_code    = '';
            break;
        case '34':
        case 'misrouted':
            itl_status_id      = 34;
            status_title       = 'Misrouted';
            itl_status_code    = '';
            break;
        case '41':
        case 'rev out for pickup':
            itl_status_id      = 41;
            status_title       = 'Rev Out for Pickup';
            itl_status_code    = '';
            break;
        case '42':
        case 'rev picked up':
            itl_status_id      = 42;
            status_title       = 'Rev Picked up';
            itl_status_code    = '';
            break; 
        case '44':
        case 'rev reached at destination':
            itl_status_id      = 44;
            status_title       = 'Rev Reached at Destination';
            itl_status_code    = '';
            break;
        case '48':
        case 'rev Closed':
            itl_status_id      = 48;
            status_title       = 'Rev Closed';
            itl_status_code    = '';
            break;
         case '45':
        case 'rev out for delivery':
            itl_status_id      = 45;
            status_title       = 'Rev Out for delivery';
            itl_status_code    = '';
            break;
        default:
            itl_status_id      = '';
            status_title       = '';
            itl_status_code    = '';
            break;
    }
    var tracking_status_array = [];
    tracking_status_array.push({
        status_id : itl_status_id,
        status_title : status_title,
        status_code : itl_status_code,
    });
    
    return tracking_status_array;
}

exports.viewOrderMyStoreOrderDetails = async function(form_data, req, res, next) 
{  
    const pattern2 = date.compile('DD-MM-YYYY HH:MM:SS');
    var base_url_images = "https://manage-cdn.ithinklogistics.com/manage/theme2/assets/images/";
    var active_tab_id = form_data.active_tab_id;
    var is_login = 1;
    var loggedin_user_id = form_data.id;
    var loggedin_user_type = 3
    var custom_filter = " om.is_deleted = 0 and om.status  != 2 ";
    var platform_id = form_data.platform_id;
    var store_id = form_data.store_id;
    var is_bulk_mystore_enable = form_data.is_bulk_mystore_enable;
    var reset_flag        = form_data.reset_flag;   
    var search_state_checkbox_value = '';
    var search_date = '';
    var search_awb_no = '';
    var search_vendor_name_checkbox_value = '';
    var search_order_id = '';
    var search_payment_checkbox_value = '';
    var search_payment_checkbox_value1 = '';
    var search_payment_checkbox_value2 = '';
    var search_sku = '';
    var search_customer_details = '';
    var search_shipping_details_checkbox_value = '';
    var search_delivered_date = '';
    var search_manifest_all_tab_date = '';
    var search_pickup_all_tab_date = '';
    var search_rto_delivered_all_tab_date = '';
    var manifest_pending_complete = '';
    var search_manifest_id_checkbox_value = '';
    var search_pickup_address_checkbox_value = '';
    var rto_tab_id = '';
    var get_platform_date = '';
    var search_sla_time_checkbox_value             = "";
    var is_order_pincode_serviceable_filter        = "";
    var is_enable_my_store_pincode_serviceability  = "";
    var is_itl_warehouse = "";
    if(reset_flag == '0')
    {
        search_state_checkbox_value               = form_data.search_state_checkbox_value;
        search_date                                = form_data.search_date;
        search_awb_no                              = form_data.search_awb_no;
        search_vendor_name_checkbox_value          = form_data.search_vendor_name_checkbox_value;
        search_order_id                            = form_data.search_order_id;
        search_payment_checkbox_value              = form_data.search_payment_checkbox_value;

        search_payment_checkbox_value1             = '';
        search_payment_checkbox_value2             = '';
       
        for (const search_payment_value of search_payment_checkbox_value) 
        {
            if(search_payment_value == 1)
            {
                search_payment_checkbox_value1     = 'prepaid';
            }
            if(search_payment_value == 2)
            {
                search_payment_checkbox_value2     = 'cod';
            }
        }
        search_sku                                 = form_data.search_sku;
        search_customer_details                    = form_data.search_customer_details;
        search_shipping_details_checkbox_value     = form_data.search_shipping_details_checkbox_value;
        search_sla_time_checkbox_value             = form_data.search_sla_time_checkbox_value;
        is_order_pincode_serviceable_filter        = form_data.is_order_pincode_serviceable_filter;
        is_enable_my_store_pincode_serviceability  = form_data.is_enable_my_store_pincode_serviceability;
        is_itl_warehouse                           = form_data.is_itl_warehouse;
       
    }
    else
    {
        search_state_checkbox_value               = [];
        search_date                                = form_data.search_date;
        search_awb_no                              = '';
        search_vendor_name_checkbox_value          = [];
        search_order_id                            = '';
        search_payment_checkbox_value              = [];
        search_payment_checkbox_value1             = '';
        search_payment_checkbox_value2             = '';
        search_sku                                 = '';
        search_customer_details                    = '';
        search_shipping_details_checkbox_value     = [];
        search_sla_time_checkbox_value             = [];
        is_order_pincode_serviceable_filter        = '0';
        is_enable_my_store_pincode_serviceability  = '0';
        is_itl_warehouse                           = '0';
    } 

    if(is_itl_warehouse != '' && is_itl_warehouse != '0') 
    {
        custom_filter += " and om.is_itl_warehouse = "+is_itl_warehouse;
    }
    if(search_state_checkbox_value.length>0)
    {
        var search_state_checkbox = '';
        for (const search_state_value of search_state_checkbox_value) 
        {
            search_state_checkbox += '"'+ search_state_value+'",';
        }
        search_state_checkbox = search_state_checkbox.substr(0,-1);
        custom_filter += "  and om.sa_province IN (" + search_state_checkbox + ")";
    }

    if (search_date != '')
    {
        var explode_date = Array.from(new Set(search_date.split(/(\s+)/)));
        var start_date   = explode_date[0];
        var end_date     = explode_date[2];
        custom_filter += "  and CAST(om.created_at as DATE) >= '" + start_date + "' and CAST(om.created_at as DATE) <= '" + end_date + "'";
    }

    if (search_awb_no != '')
    {
        awb_numbers = Array.from(new Set(search_awb_no.split(',')));
        var search_value_list    = awb_numbers.join("','");
        custom_filter += "  and (om.order_name IN ('"+search_value_list+"') or om.order_name IN ('"+search_value_list+"'))";
    }

    var search_vendor_id_checkbox = '';
    var return_array = [];
    var store_id = '';
    var all_store_data_array       = [];
    if(search_vendor_name_checkbox_value.length == 1 && (loggedin_user_id != 3 || is_master_vendor == 1))
    {
        var multi_user_id              = search_vendor_name_checkbox_value[0];
        var get_store_query            = "SELECT id,store_url,store_name from user_store WHERE user_id = '"+multi_user_id+"' and platform_id = '"+platform_id+"' and is_deleted = 0 and status = 1";
        var result_get_store_query       =JSON.parse( await view_order_model.commonSelectQuery(get_store_query));
        console.log(result_get_store_query);
        var all_store_data_array = [];
        var all_order_cancel_rto_pod_array = [];
        for (const row_get_store_query of result_get_store_query) 
        {
            
            all_store_data_array.push(row_get_store_query);
        }
        
    	if(all_store_data_array.length > 0)
    	{   if(store_id == '' || store_id == 0)
        	{
        	    store_id = all_store_data_array[0]['id'];
        	}
    		return_array["store_data"]                                 = all_store_data_array;
    	}
    }
    else if(loggedin_user_id == 1 || loggedin_user_id == 2  || (loggedin_user_id == 3 && is_master_vendor == 1))
    {
        store_id = '';
    }
    
    if (search_vendor_name_checkbox_value.length >0)
    {
        for (const search_vendor_name_value of search_vendor_name_checkbox_value) 
        {
        
            search_vendor_id_checkbox +=  search_vendor_name_value+',';
        }
        search_vendor_id_checkbox = search_vendor_id_checkbox.substr(0,-1);
    }
    else
    {
        search_vendor_id_checkbox = '';
    }
    if(store_id > 0)
    {
        custom_filter += "  and om.store_id = '"+store_id+"'";
    }
    var is_enable_my_store_pincode_serviceability ='';
    if(is_login == 1 && loggedin_user_type == 1) // Admin
    {
        is_enable_my_store_pincode_serviceability = 1;
        if (search_vendor_id_checkbox != '')
        {
            custom_filter += "  and om.itl_user_id IN (" + search_vendor_id_checkbox + ")";
        }
    }
    else if(is_login == 1 && loggedin_user_type == 2 && loggedin_view_itl_orders == 1) // Sub Admin
    {
        is_enable_my_store_pincode_serviceability = 1;
        if(loggedin_user_show_all_vendors == 1)
        {
            if (search_vendor_id_checkbox != '')
            {
                custom_filter += "  and om.itl_user_id IN (" + search_vendor_id_checkbox + ")";
            }
        }
        else
        {
            if(loggedin_user_user_id_list.length >0)
            {
                if (search_vendor_id_checkbox != '')
                {
                    custom_filter += "  and om.itl_user_id IN (" + search_vendor_id_checkbox + ")";
                }
                else
                {
                    custom_filter += ' and om.itl_user_id IN ('+loggedin_user_user_id_list+')';
                }
            }
        }
    }
    else if(is_login == 1 && loggedin_user_type == 3) // Vendor
    {
        //custom_filter += ' and om.itl_user_id ='.loggedin_user_id.'';
        if (search_vendor_id_checkbox != '')
        {
            custom_filter += "  and om.itl_user_id IN (" + search_vendor_id_checkbox + ")";
        }
        
        else
        {
            custom_filter += " and om.itl_user_id ="+loggedin_user_id;
        }
    }
    if (search_order_id != '')
    {
        custom_filter += "  and om.order_name = '" + search_order_id + "'";
    }
    if(is_enable_my_store_pincode_serviceability == 1)
    {        
        if(is_order_pincode_serviceable_filter != '' && is_order_pincode_serviceable_filter == '2') 
        {
            custom_filter += " and om.is_pincode_serviceable = "+is_order_pincode_serviceable_filter;
        }
    }

    /*if(search_payment_checkbox_value1 != '')
    {
        custom_filter += " and lower(om.financial_status) NOT IN ('cod','pending','cash on delivery')";
    }
    else if(search_payment_checkbox_value2 != '')
    {
        custom_filter += " and lower(om.financial_status) IN ('cod','pending','cash on delivery')";
    }*/

    if (search_sku != '')
    {
        custom_filter += " and om.product_sku LIKE '%" + search_sku + "%'";
    }

    if(search_customer_details != '')
    {
        search_query_data_array = search_customer_details.split(/(\s+)/);
        var search_custom_query = "";
        for (const search_query_data of search_query_data_array) 
        {
        
            search_custom_query += "%"+ search_query_data+"%";
        }

        custom_filter += " and (om.sa_name LIKE '"+search_custom_query+"' or om.sa_first_name LIKE '"+search_custom_query+"' or om.sa_last_name LIKE '"+search_custom_query+"' or om.email LIKE '"+search_custom_query+"' or om.sa_phone LIKE '"+search_custom_query+"')";
    }

    if (search_sla_time_checkbox_value.length>0)
    {
        search_value = Math.max(search_sla_time_checkbox_value);
        
        i = 0;
        total_sla_count = search_sla_time_checkbox_value.length;
        if(total_sla_count != 4)
        {
            for (const search_sla_time_checkbox of search_sla_time_checkbox_value) 
            {
           
                if(i == 0 && (search_sla_time_checkbox == 1 || search_sla_time_checkbox == 2 || search_sla_time_checkbox == 3 || search_sla_time_checkbox == 4))
                {
                    custom_filter += " and ( ";
                }
                else
                {
                    custom_filter += " or ";
                }
                /*if(search_sla_time_checkbox == 1) 
                {
                    sla_time_value = ' <= 24';
                    custom_filter += " TIMESTAMPDIFF(HOUR,DATE_ADD(om.created_at, INTERVAL 48 HOUR), '".current_date."') ".sla_time_value;
                } 
                if(search_sla_time_checkbox == 2) 
                {
                    sla_time_value = ' <= 48';
                    custom_filter += " TIMESTAMPDIFF(HOUR,DATE_ADD(om.created_at, INTERVAL 48 HOUR), '".current_date."') ".sla_time_value;
                } 
                if(search_sla_time_checkbox == 3) 
                {
                    sla_time_value = ' <= 72';
                    custom_filter += " TIMESTAMPDIFF(HOUR,DATE_ADD(om.created_at, INTERVAL 48 HOUR), '".current_date."') ".sla_time_value;
                } 
                if(search_sla_time_checkbox == 4) 
                {
                    sla_time_value = ' > 72';
                    custom_filter += " TIMESTAMPDIFF(HOUR,DATE_ADD(om.created_at, INTERVAL 48 HOUR), '".current_date."') ".sla_time_value;
                }*/
                var one_day_before_date = date.format(new Date(current_date), pattern2);
                new Date(one_day_before_date).setDate( new Date(one_day_before_date).getDay() - 1 );
                var two_day_before_date = date.format(new Date(current_date), pattern2);
                new Date(two_day_before_date).setDate( new Date(two_day_before_date).getDay() - 2 );                                    
                var three_day_before_date = date.format(new Date(current_date), pattern2);
                new Date(three_day_before_date).setDate( new Date(three_day_before_date).getDay() - 3 ); 
                var specific_one_day_before_date   = one_day_before_date.replace(' ','T')+'+05:30';
                var specific_two_day_before_date   = two_day_before_date.replace(' ','T')+'+05:30';
                var specific_three_day_before_date = three_day_before_date.replace(' ','T')+'+05:30';

                if(platform_id == 2)
                {
                    one_day_before_date    = specific_one_day_before_date;
                    two_day_before_date    = specific_two_day_before_date;
                    three_day_before_date  = specific_three_day_before_date;
                    temp_current_date      = current_date.replace(' ','T')+'+05:30';
                }

                if(search_sla_time_checkbox == 1) 
                {
                    //sla_time_value = ' <= 24';
                    //custom_filter += " TIMESTAMPDIFF(HOUR,'".current_date."',DATE_ADD(om.created_at, INTERVAL 48 HOUR)) ".sla_time_value;
                    custom_filter += " (om.created_at >= '" + two_day_before_date + "' and om.created_at <= '" + one_day_before_date + "')";
                } 
                if(search_sla_time_checkbox == 2) 
                {
                    //sla_time_value = ' <= 48';
                    //custom_filter += " TIMESTAMPDIFF(HOUR,'".current_date."',DATE_ADD(om.created_at, INTERVAL 48 HOUR)) ".sla_time_value;
                    custom_filter += " (om.created_at >= '" + two_day_before_date + "' and om.created_at <= '" + temp_current_date + "')";
                } 
                if(search_sla_time_checkbox == 3) 
                {
                    //sla_time_value = ' <= 72';
                    //custom_filter += " TIMESTAMPDIFF(HOUR,'".current_date."',DATE_ADD(om.created_at, INTERVAL 48 HOUR)) ".sla_time_value;
                    custom_filter += " (om.created_at >= '" + three_day_before_date + "' and om.created_at <= '" + temp_current_date + "')";
                } 
                if(search_sla_time_checkbox == 4) 
                {
                    //sla_time_value = ' > 72';
                    //custom_filter += " TIMESTAMPDIFF(HOUR,'".current_date."',DATE_ADD(om.created_at, INTERVAL 48 HOUR)) ".sla_time_value;
                    custom_filter += " (om.created_at <= '" + three_day_before_date + "')";
                }
                if(i == (total_sla_count-1))
                {
                    custom_filter += " ) ";
                }
                i++;
            }
        }
    }
    if( (loggedin_user_type == 3) )
    {
        if(platform_id == 2)       // Shopify
        {
            custom_filter += " and om.fulfillment_status = '' and om.cancelled_at = '' and  om.financial_status != 'voided' and  om.status != '2'";
            if(loggedin_user_id == 2650)
            {
                custom_filter += " and om.tags LIKE '%Cod Order Verified%'";
            }
            
        }
        else if(platform_id == 3)  // Magento
        {
            custom_filter += " and om.fulfillment_status = '0' and om.cancelled_at = '' ";
            if(loggedin_user_id == '316' )
            {
                custom_filter += "and  (om.platform_status = '' or om.platform_status = 'Processing' or om.platform_status = 'Pending') and om.platform_status != 'Canceled'";
            }
            else if(loggedin_user_id == '581')
            {
                custom_filter += "and  (om.platform_status = '' or om.platform_status = 'Processing' or om.platform_status = 'Pending') and om.platform_status != 'Canceled'";
            }
            else if(loggedin_user_id == '677')
            {
                custom_filter += "and  (om.platform_status = '' or om.platform_status = 'Processing') and om.platform_status != 'Canceled'";
            }
            else
            {
                custom_filter += "and  (om.platform_status = '' or om.platform_status = 'Processing' or om.platform_status = 'Pending') and om.platform_status != 'Canceled'";
            }
        }
        else if(platform_id == 4)  // Woocommerce
        {
            if(loggedin_user_id == 1063 )//bikaner fresh
            {
                custom_filter += " and (om.fulfillment_status = 'wc-processing' or om.fulfillment_status = 'wc-completed')"; 
        
            }else if(loggedin_user_id == 2417)//bikaner fresh
            {
                custom_filter += " and (om.fulfillment_status = 'wc-ready-to-ship')"; 
        
            }else if( loggedin_user_id == 1623 || loggedin_user_id == 1472 || loggedin_user_id == 2753)//Vriksham
            {
                custom_filter += " and (om.fulfillment_status = 'wc-processing')"; 
        
            }
            else if(loggedin_user_id == 1488)//Fwoman
            {
                custom_filter += " and (om.fulfillment_status = 'wc-pending' or om.fulfillment_status = 'wc-processing')"; 
        
            }
            else
            {
                custom_filter += " and (om.fulfillment_status = 'wc-pending' or om.fulfillment_status = 'wc-on-hold' || om.fulfillment_status = 'wc-processing')"; 
        
            }
        }
        else if(platform_id == 5)  // Opencart
        {
            if(loggedin_user_id == '205')
            {
                custom_filter += " and (om.fulfillment_status = '1' or om.fulfillment_status = '2') and om.cancelled_at = '' ";    
            }
            else if(loggedin_user_id == '2119')// for Yamdeal
            {
                custom_filter += " and (om.fulfillment_status = '1' or om.fulfillment_status = '2' or om.fulfillment_status = '5') and om.cancelled_at = '' ";    
            }
            else if(loggedin_user_id == '84')// for Processing orders synv only(vipul madhani)
            {
                 custom_filter += " and om.fulfillment_status = '2' and om.cancelled_at = '' ";    
           
            }
            else if( loggedin_user_id == '591' || loggedin_user_id == '1022' || loggedin_user_id == '1717')//for jiya
            {
                custom_filter += " and om.cancelled_at = '' and om.fulfillment_status IN (5,22,23) ";    
            }
            else if( loggedin_user_id == '390')//for vanity gold
            {
                custom_filter += " and om.cancelled_at = ''";
            }
            else
            {
                custom_filter += " and (om.fulfillment_status = '0' or om.fulfillment_status = '1' or om.fulfillment_status = '2') and om.cancelled_at = '' ";
            }
        }
        else if(platform_id == 6)  // prestashop
        {
            custom_filter += " and (om.fulfillment_status != '4' and om.fulfillment_status != '5')";
        }
        else if(platform_id == 10)  // Decommerce
        {
            custom_filter += " and (om.fulfillment_status = '0')";
        }
        else if(platform_id == 11)  // cscart
        {
            custom_filter += " (om.fulfillment_status = 'P' or om.fulfillment_status = 'O')";
        }
        else if(platform_id == 12)  // ecwid
        {
            custom_filter += " and (om.fulfillment_status = 'AWAITING_PROCESSING' or om.fulfillment_status = 'PROCESSING' or om.fulfillment_status = 'READY_FOR_PICKUP')";
        }
        else if(platform_id == 16)  // bulk
        {
            custom_filter += " and (om.fulfillment_status = '')";
        }
    }

    if (search_payment_checkbox_value1 != '' || search_payment_checkbox_value2 != '')
    {
        if(platform_id == 2)       // Shopify
        {
            if(search_payment_checkbox_value2 == 'cod' && search_payment_checkbox_value1 == 'prepaid')
            {
                /*search_value1       = 'pending';
                search_value2       = 'paid';
                custom_filter += " and (om.financial_status LIKE '%" + search_value1 + "%' or om.financial_status LIKE '%" + search_value2 + "%' )";*/
            }
            else if(search_payment_checkbox_value2 == 'cod')
            {
                search_value       = 'pending';
                custom_filter += " and om.financial_status LIKE '%" + search_value + "%'";
            }
            else if(search_payment_checkbox_value1 == 'prepaid')
            {
                search_value       = 'paid';
                custom_filter += " and om.financial_status LIKE '%" + search_value + "%'";
            }
        }
        else if(platform_id == 3)  // Magento
        {
            if(search_payment_checkbox_value2 == 'cod' && search_payment_checkbox_value1 == 'prepaid')
            {
                
            } 
            else if(search_payment_checkbox_value2 == 'cod')
            {
                search_value = 'Cash On Delivery';
                custom_filter += " and om.financial_status LIKE '%" + search_value + "%'";
            }
            else if(search_payment_checkbox_value1 == 'prepaid')
            {
                search_value = 'Cash On Delivery';
                custom_filter += " and om.financial_status  != '" + search_value + "'";
            }
        }
        else if(platform_id == 4)  // Woocommerce
        {
            if(search_payment_checkbox_value2 == 'cod' && search_payment_checkbox_value1 == 'prepaid')
            {
                
            } 
            else if(search_payment_checkbox_value2 == 'cod')
            {
                custom_filter += " and om.financial_status LIKE '%" + search_value + "%'";
            }
            else if(search_payment_checkbox_value1 == 'prepaid')
            {
                search_value = 'cod';
                custom_filter += " and om.financial_status  != '" + search_value + "'";
            }
        }
        else if(platform_id == 5)  // Opencart
        {
            if(search_payment_checkbox_value2 == 'cod' && search_payment_checkbox_value1 == 'prepaid')
            {
                
            } 
            else if(search_payment_checkbox_value2 == 'cod')
            {
                custom_filter += " and om.financial_status LIKE '%" + search_value + "%'";
            }
            else if(search_payment_checkbox_value1 == 'prepaid')
            {
                search_value = 'cod';
                custom_filter += " and om.financial_status  != '" + search_value + "'";
            }
        }
        else if(platform_id == 6)  // prestashop
        {
            if(search_payment_checkbox_value2 == 'cod' && search_payment_checkbox_value1 == 'prepaid')
            {
                
            } 
            else if(search_payment_checkbox_value2 == 'cod')
            {
                search_value = 'Cash on delivery (COD)';
                custom_filter += " and om.financial_status LIKE '%" + search_value + "%'";
            }
            else if(search_payment_checkbox_value1 == 'prepaid')
            {
                search_value = 'Cash on delivery (COD)';
                custom_filter += " and om.financial_status  != '" + search_value + "'";
            }
        }
        else if(platform_id == 10)  // Decommerce
        {
            if(search_payment_checkbox_value2 == 'cod' && search_payment_checkbox_value1 == 'prepaid')
            {
                
            } 
            else if(search_payment_checkbox_value2 == 'cod')
            {
                custom_filter += " and om.financial_status LIKE '%" + search_value + "%'";
            }
            else if(search_payment_checkbox_value1 == 'prepaid')
            {
                search_value = 'cod';
                custom_filter += " and om.financial_status  != '" + search_value + "'";
            }
        }
        else if(platform_id == 11)  // cscart
        {
            if(search_payment_checkbox_value2 == 'cod' && search_payment_checkbox_value1 == 'prepaid')
            {
                
            } 
            else if(search_payment_checkbox_value2 == 'cod')
            {
                search_value = 'C.O.D';
                custom_filter += " and om.financial_status LIKE '%" + search_value + "%'";
            }
            else if(search_payment_checkbox_value1 == 'prepaid')
            {
                search_value = 'C.O.D';
                custom_filter += " and om.financial_status  != '" + search_value + "'";
            }
        }
        else if(platform_id == 12)  // ecwid
        {
            if(search_payment_checkbox_value2 == 'cod' && search_payment_checkbox_value1 == 'prepaid')
            {
                /*search_value1 = 'PAID';
                search_value2 = 'AWAITING_PAYMENT';
                custom_filter += " and (om.financial_status LIKE '%" + search_value2 + "%' or om.financial_status = '" + search_value1 + "')";*/
            } 
            else if(search_payment_checkbox_value2 == 'cod')
            {
                search_value = 'AWAITING_PAYMENT';
                custom_filter += " and om.financial_status LIKE '%" + search_value + "%'";
            }
            else if(search_payment_checkbox_value1 == 'prepaid')
            {
                search_value = 'PAID';
                custom_filter += " and om.financial_status = '" + search_value + "'";
            }
        }
        else if(platform_id == 16)  // bulk
        {
            if(search_payment_checkbox_value2 == 'cod' && search_payment_checkbox_value1 == 'prepaid')
            {
                
            } 
            else if(search_payment_checkbox_value2 == 'cod')
            {
                custom_filter += " and om.financial_status LIKE '%" + search_value + "%'";
            }
            else if(search_payment_checkbox_value1 == 'prepaid')
            {
                search_value = 'cod';
                custom_filter += " and om.financial_status  != '" + search_value + "'";
            }
        }
    }
    var limit_start = form_data.start;
    var limit_end   = form_data.length;
    //order_by    = "order by om.id DESC";
    var order_by    = " order by om.created_at DESC";
    if(loggedin_user_id == '49' || loggedin_user_id == '655' || loggedin_user_id == '1115'  || loggedin_user_id == '995' || loggedin_user_id == '1623' || loggedin_user_id == '1439' || loggedin_user_id == '623' || loggedin_user_id == '807' || loggedin_user_id == '1424')//OSSOM WEAR and awaazi and namastey ayurvadea
    {
         order_by = " order by om.created_at DESC";
    }

    var is_execute = 1;
    if(platform_id == 2)       // Shopify
    {
        if(is_login == 1 && loggedin_user_type == 2)
        {
            if(loggedin_view_shopify_orders != 1)
            {
                is_execute = 0;
            }
        }
    }
    else if(platform_id == 3)  // Magento
    {
        if(is_login == 1 && loggedin_user_type == 2)
        {
            if(loggedin_view_magento_orders != 1)
            {
                is_execute = 0;
            }
        }
    }
    else if(platform_id == 4)  // Woocommerce
    {
        if(is_login == 1 && loggedin_user_type == 2)
        {
            if(loggedin_view_woocommerce_orders != 1)
            {
                is_execute = 0;
            }
        }
    }
    else if(platform_id == 5)  // Opencart
    {
        if(is_login == 1 && loggedin_user_type == 2)
        {
            if(loggedin_view_opencart_orders != 1)
            {
               is_execute = 0;
            }
        }    
    }
    else if(platform_id == 6)  // prestashop
    {
        if(is_login == 1 && loggedin_user_type == 2)
        {
            if(loggedin_view_opencart_orders != 1)
            {
                is_execute = 0;
            }
        }    
    }
    else if(platform_id == 10)  // Decommerce
    {
        if(is_login == 1 && loggedin_user_type == 2)
        {
            if(loggedin_view_decommerce_orders != 1)
            {
                is_execute = 0;
            }
        }    
    }
    else if(platform_id == 11)  // CSCart
    {
        if(is_login == 1 && loggedin_user_type == 2)
        {
            if(loggedin_view_opencart_orders != 1)
            {
                is_execute = 0;
            }
        }    
    }
    else if(platform_id == 12)  // ecwid
    {
        if(is_login == 1 && loggedin_user_type == 2)
        {
            if(loggedin_view_opencart_orders != 1)
            {
                is_execute = 0;
            }
        }    
    }
    else if(platform_id == 16)  // Bulk
    {
        if(is_login == 1 && loggedin_user_type == 2)
        {
            //if(loggedin_view_opencart_orders != 1)
            if(0)
            {
                is_execute = 0;
            }
        }    
    }

    if(is_execute == 0)
    {
        total_data = 0;
        res.status(200).json({
            status : "success",
            status_code : 200,
            data: data,
            draw: form_data.draw,
            recordsFiltered: parseInt(0),
            recordsTotal: parseInt(0)
        });
        return;
    }

    switch (platform_id) 
    {
        case '2':
            platform_table = 'shopify_itl_orders';
            break;
        case '5':
            platform_table = 'opencart_itl_orders';
            break;
        case '4':
            platform_table = 'woocommerce_itl_orders';
            break;
        case '3':
            platform_table = 'magento_itl_orders';
            break;
        case '6':
            platform_table = 'prestashop_itl_orders';
            break;
        case '16':
            platform_table = 'bulk_itl_orders';
            break;
        case '11':
            platform_table = 'cscart_itl_orders';
            break;    
        default:
            platform_table = '';
            break;
    }
    var get_order_query = '';
    const now = new Date();
    var current_date = date.format(now, pattern2);
    if(platform_id == '16')
    {
        get_order_query = `SELECT 
                            om.id as order_management_id,
                            om.customer_invoice_id,
                            om.is_customer_invoice_generated,
                            om.itl_user_id AS user_id,
                            u.first_name,
                            u.last_name,
                            u.company_name,
                            om.order_name AS order_no,
                            om.created_at AS created_date,
                            TIMESTAMPDIFF(HOUR,'`+current_date+`',DATE_ADD(om.created_at, INTERVAL 48 HOUR)) AS sla_time,
                            om.final_total_price AS final_total_price,
                            om.financial_status AS order_type,
                            om.fulfillment_status AS fulfillment_status,
                            om.line_item_title AS product_description,
                            om.product_sku AS order_product_sku,
                            om.total_quantity AS quantity,
                            CONCAT(om.sa_first_name, ' ', om.sa_last_name) AS customer_name,
                            om.email AS customer_email,
                            om.sa_phone AS customer_mobile,
                            om.ship_length,
                            om.ship_width,
                            om.ship_height,
                            om.final_total_weight_in_grams,
                            om.final_total_quantity,
                            om.phy_weight,
                            om.cancelled_at,
                            
                        FROM `+platform_table+` om
                        LEFT JOIN user u ON om.itl_user_id = u.id
                        LEFT JOIN pincode_lat_long pl ON pl.pincode = om.sa_zip 
                        WHERE `+custom_filter +order_by+` LIMIT `+limit_start+`, `+limit_end;
    }
    else
    {
        get_order_query = `SELECT 
                            om.id as order_management_id,
                            om.itl_user_id AS user_id,
                            u.first_name,
                            u.last_name,
                            u.company_name,
                            om.order_name AS order_no,
                            om.created_at AS created_date,
                            TIMESTAMPDIFF(HOUR,'`+current_date+`',DATE_ADD(om.created_at, INTERVAL 48 HOUR)) AS sla_time,
                            om.final_total_price AS final_total_price,
                            om.financial_status AS order_type,
                            om.fulfillment_status AS fulfillment_status,
                            om.line_item_title AS product_description,
                            om.product_sku AS order_product_sku,
                            om.total_quantity AS quantity,
                            CONCAT(om.sa_first_name, ' ', om.sa_last_name) AS customer_name,
                            om.email AS customer_email,
                            om.sa_phone AS customer_mobile,
                            om.ship_length,
                            om.ship_width,
                            om.ship_height,
                            om.final_total_weight_in_grams,
                            om.final_total_quantity,
                            om.phy_weight,
                            om.cancelled_at
                        FROM `+platform_table+` om
                        LEFT JOIN user u ON om.itl_user_id = u.id 
                        LEFT JOIN pincode_lat_long pl ON pl.pincode = om.sa_zip 
                        WHERE `+custom_filter + order_by+` LIMIT `+limit_start+`,`+limit_end;
    }
    var result_get_order_query       = JSON.parse(await view_order_model.commonSelectQuery(get_order_query));
    console.log(get_order_query);
    var all_order_data_array = [];
    var all_order_cancel_rto_pod_array = [];
    for (const row_get_query of result_get_order_query) 
    {
        
        all_order_data_array.push(row_get_query);
    }
    

    var get_count_query1    = `SELECT count(*) as total_data, TIMESTAMPDIFF(HOUR,DATE_ADD(om.created_at, INTERVAL 48 HOUR), '`+current_date+`') AS sla_time
                        FROM `+platform_table+` om
                        LEFT JOIN user u ON om.itl_user_id = u.id 
                        Where `+custom_filter;
    
    var total_data         = 0;
    var result_count_get_order_query       =JSON.parse( await view_order_model.commonSelectQuery(get_count_query1));
    console.log(get_count_query1);
    //var all_order_data_array = [];
    //var all_order_cancel_rto_pod_array = [];
    for (const row_get_query of result_count_get_order_query) 
    {
        console.log(row_get_query.total_data);
        total_data=row_get_query.total_data;
    }
    var data = [];
    if (all_order_data_array.length > 0)
    {
        for (const all_order_data of all_order_data_array) 
        {
            row_id                     = (all_order_data['order_management_id']);
            vendor_first_name          = (all_order_data['first_name']);
            vendor_last_name           = (all_order_data['last_name']);
            vendor_name                = (all_order_data['company_name']);
            vendor_mobile              = (all_order_data['mobile']);
            order_no                   = (all_order_data['order_no']);
            
            created_date               = date.format(new Date(all_order_data['created_date']), pattern2);
            created_date1              = date.format(new Date(all_order_data['created_date']), pattern2);
            /*created_date1              = (all_order_data['created_date']);
            created_da_array           = explode('+',created_date1);
            created_da_array1          = explode('T',created_da_array[0]);

            created_date               = date('Y-m-d', strtotime((all_order_data['created_date'])));*/
            final_total_price          = (all_order_data['final_total_price']);
            order_type                 = (all_order_data['order_type']);
            product_description        = (all_order_data['product_description']);
            order_product_sku          = (all_order_data['order_product_sku']);
            final_total_quantity       = (all_order_data['final_total_quantity']);
            customer_name              = (all_order_data['customer_name']);
            customer_email             = (all_order_data['customer_email']);
            customer_mobile            = (all_order_data['customer_mobile']);
            ship_length                = (all_order_data['ship_length']);
            ship_width                 = (all_order_data['ship_width']);
            ship_height                = (all_order_data['ship_height']);
            final_total_weight_in_grams= (all_order_data['final_total_weight_in_grams']);
            phy_weight                 = (all_order_data['phy_weight']);
            fulfillment_status         = (all_order_data['fulfillment_status']);
            sla_time                   = (all_order_data['sla_time']);
            cancelled_at               = (all_order_data['cancelled_at']);
            customer_invoice_id        = (all_order_data['customer_invoice_id']);
            is_pincode_serviceable     = (all_order_data['is_pincode_serviceable']);
            sa_zip                     = (all_order_data['sa_zip']);
            is_customer_invoice_generated      = (all_order_data['is_customer_invoice_generated']);
            itl_zone                           = (all_order_data['itl_zone']);
            itl_zone_color = zone_label = '';
            if(itl_zone == 1){itl_zone_color = 'green';}
            if(itl_zone == 2){itl_zone_color = 'orange';}
            if(itl_zone == 3){itl_zone_color = 'red';}
            if(itl_zone_color != '')
            {
                zone_label = itl_zone_color.charAt(0).toUpperCase() + itl_zone_color.slice(1);
            }    
            var fulfillment_status_details = '';
            if(platform_id == 2)       // Shopify
            {
                if(fulfillment_status == '')
                {
                    fulfillment_status_details = 'Unfulfilled';        
                }
                else
                {
                    fulfillment_status_details = fulfillment_status.charAt(0).toUpperCase() + fulfillment_status.slice(1);
                }
            }
            else if(platform_id == 3)  // Magento
            {
                if(fulfillment_status == '0')
                {
                    fulfillment_status_details = 'Unfulfilled';        
                }
                else if(fulfillment_status == '1')
                {
                    fulfillment_status_details = 'Fulfilled';        
                }
                else
                {
                    fulfillment_status_details = '';
                }
            }
            else if(platform_id == 4)  // Woocommerce
            {
                fulfillment_status_details = fulfillment_status;
            }
            else if(platform_id == 5)  // Opencart
            {
                if(fulfillment_status == 1)
                {
                    fulfillment_status_details = "Pending";
                }
                else if(fulfillment_status == 2)
                {
                    fulfillment_status_details = "Processing";
                }
                else if(fulfillment_status == 3)
                {
                    fulfillment_status_details = "Shipped";
                }
                else if(fulfillment_status == 4)
                {
                    fulfillment_status_details = "";
                }
                else if(fulfillment_status == 5)
                {
                    fulfillment_status_details = "Complete";
                }
                else if(fulfillment_status == 6)
                {
                    fulfillment_status_details = "";
                }
                else if(fulfillment_status == 7)
                {
                    fulfillment_status_details = "Canceled";
                }
                else if(fulfillment_status == 8)
                {
                    fulfillment_status_details = "Denied";
                }
                else if(fulfillment_status == 9)
                {
                    fulfillment_status_details = "Canceled Reversal";
                }
                else if(fulfillment_status == 10)
                {
                    fulfillment_status_details = "Failed";
                }
                else if(fulfillment_status == 11)
                {
                    fulfillment_status_details = "Refunded";
                }
                else if(fulfillment_status == 12)
                {
                    fulfillment_status_details = "Reversed";
                }
                else if(fulfillment_status == 13)
                {
                    fulfillment_status_details = "Chargeback";
                }
                else if(fulfillment_status == 14)
                {
                    fulfillment_status_details = "Expired";
                }
                else if(fulfillment_status == 15)
                {
                    fulfillment_status_details = "Processed";
                }
                else if(fulfillment_status == 16)
                {
                    fulfillment_status_details = "Voided";
                }
                else
                {
                    fulfillment_status_details = "";
                }
            }
            else if(platform_id == 6)  // prestashop
            {
                if(fulfillment_status == 1)
                {
                    fulfillment_status_details = "Awaiting check payment";
                }
                else if(fulfillment_status == 2)
                {
                    fulfillment_status_details = "Payment accepted";
                }
                else if(fulfillment_status == 3)
                {
                    fulfillment_status_details = "Processing in progress";
                }
                else if(fulfillment_status == 4)
                {
                    fulfillment_status_details = "Shipped";
                }
                else if(fulfillment_status == 5)
                {
                    fulfillment_status_details = "Delivered";
                }
                else if(fulfillment_status == 6)
                {
                    fulfillment_status_details = "Canceled";
                }
                else if(fulfillment_status == 7)
                {
                    fulfillment_status_details = "Refunded";
                }
                else if(fulfillment_status == 8)
                {
                    fulfillment_status_details = "Payment error";
                }
                else if(fulfillment_status == 9)
                {
                    fulfillment_status_details = "On backorder (paid)";
                }
                else if(fulfillment_status == 10)
                {
                    fulfillment_status_details = "Awaiting bank wire payment";
                }
                else if(fulfillment_status == 11)
                {
                    fulfillment_status_details = "Remote payment accepted";
                }
                else if(fulfillment_status == 12)
                {
                    fulfillment_status_details = "On backorder (not paid)";
                }
                else if(fulfillment_status == 13)
                {
                    fulfillment_status_details = "Awaiting Cash On Delivery validation";
                }
                else
                {
                    fulfillment_status_details = "";
                }
            }
            else if(platform_id == 10)  // Decommerce
            {
                fulfillment_status_details = fulfillment_status;
            }
            else if(platform_id == 11)       // cscart
            {
                if(fulfillment_status == '')
                {
                    fulfillment_status_details = 'Unfulfilled';
                }
                else
                {
                    switch (fulfillment_status) 
                    {
                        case 'C':
                            fulfillment_status = 'Complete';
                            break;
                        case 'P':
                            fulfillment_status = 'Processed';
                            break;
                        case 'O':
                            fulfillment_status = 'Open';
                            break;
                        case 'F':
                            fulfillment_status = 'Failed';
                            break;
                        case 'D':
                            fulfillment_status = 'Declined';
                            break;
                        case 'B':
                            fulfillment_status = 'Backordered';
                            break;
                        case 'I':
                            fulfillment_status = 'Cancelled';
                            break;
                        case 'Y':
                            fulfillment_status = 'Awaiting Call';
                            break;
                        default:
                            fulfillment_status = '';
                            break;
                    }
                    fulfillment_status_details = fulfillment_status.charAt(0).toUpperCase() + fulfillment_status.slice(1);
                }
            }
            else if(platform_id == 12)       // ecwid
            {
                fulfillment_status_details = fulfillment_status;
            }
            else if(platform_id == 16)  // Bulk
            {
                if(fulfillment_status == '0')
                {
                    fulfillment_status_details = 'Unfulfilled';        
                }
                else if(fulfillment_status == '1')
                {
                    fulfillment_status_details = 'Fulfilled';        
                }
                else
                {
                    fulfillment_status_details = '';
                }
            }

            user_name      = vendor_first_name+' '+vendor_last_name;
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
            var nestedData         = {};
            vendor_name            = vendor_name;
            product_description    = product_description;
            customer_name          = customer_name;
            customer_email         = customer_email;
            order_product_sku      = order_product_sku;
            nestedData["vendor_name"]     =vendor_name;
            nestedData["customer_email"]     =customer_email;
            nestedData["customer_name"]     =customer_name;
            nestedData["order_product_sku"]     =order_product_sku;
            if(vendor_name.length >= 15)
            {
                //vendor_name = '<span class="tooltip_class" data-toggle="tooltip" title="'.vendor_name.'" data-html="true" data-placement="right">'.substr(vendor_name,0,15).' ...</span>';
            }

            if(product_description.length >= 10)
            {
               // product_description = '<span class="tooltip_class" data-toggle="tooltip" title="'.product_description.'" data-html="true" data-placement="right">'.substr(product_description,0,10).' ...</span>';
            }
            if(customer_name.length >= 15)
            {
                //customer_name = '<span class="tooltip_class" data-toggle="tooltip" title="'.customer_name.'" data-html="true" data-placement="right">'.substr(customer_name,0,15).' ...</span>';
            }
            if(customer_email.length >= 15)
            {
               // customer_email = '<span class="tooltip_class" data-toggle="tooltip" title="'.customer_email.'" data-html="true" data-placement="right">'.substr(customer_email,0,15).' ...</span>';
            }

            
            nestedData["order_id"]       = row_id;
            //if(is_login == 1 && (loggedin_user_type == 1 || (loggedin_user_type == 2 && loggedin_view_itl_orders == 1)))
            if(is_login == 1 && ((loggedin_user_type == 1 || (loggedin_user_type == 2 && loggedin_view_itl_orders == 1))))
            {
                nestedData["vendor_name"]       = vendor_name;
                //nestedData[]   = vendor_name;
            }
            nestedData["vendor_name"]       = vendor_name;
            is_pincode_services_html = '';
            if(is_enable_my_store_pincode_serviceability == 1)
            {
                if (is_pincode_serviceable != '' && is_pincode_serviceable == 2 && is_order_pincode_serviceable_filter == '2')
                {
                    nestedData["is_pincode_services_html"]       = "Non-Serviceable";
                    //is_pincode_services_html = '<div class="pincode-serviceable-label">Non-Serviceable</div>';
                }
            }

            zone_label = '';
            nestedData["order_no"]       =order_no;
            nestedData["zone_label"]     =zone_label;
            //nestedData[]       =   '<div>
                                       // '.order_no. zone_label.'
                                       // '.is_pincode_services_html.'
                                    //</div>';
            nestedData["created_date"]     = date.format(new Date(created_date), pattern2);
            if(order_type.toString().toLowerCase() == 'cod' || order_type.toString().toLowerCase() == 'pending' || order_type.toString().toLowerCase() == 'cash on delivery' || order_type.toString().toLowerCase() == 'cash on delivery (cod)')
            {
                order_type     = '<div class="text-uppercase text-success">COD</div>';
                nestedData["order_type"]     ="COD";
            }
            else
            {
                order_type     = '<div class="text-uppercase text-success">Prepaid</div>';
                nestedData["order_type"]     ="Prepaid";
            }
            nestedData["final_total_price"]     =final_total_price;
            //nestedData[] = '<div class="text-success m-b-8"><i class="fas fa-rupee-sign"></i>'.final_total_price.'</div>
             //               <div class="text-uppercase text-success">'.order_type.'</div>';


            if(order_product_sku == '')
            {
                order_product_sku = 'N/A';
                nestedData["order_product_sku"]     ="N/A";
            }
            if(order_product_sku.length >= 10)
            {
                nestedData["order_product_sku"]     =order_product_sku;
                //order_product_sku = '<span class="tooltip_class" data-toggle="tooltip" title="'.order_product_sku.'" data-html="true" data-placement="right">'.substr(order_product_sku,0,10).' ...</span>';
            }
            nestedData["product_description"]     =product_description;
            nestedData["final_total_quantity"]     =final_total_quantity;
            //nestedData[] = '<div class="m-b-8">Name: '.product_description.'</div>
            //                <div class="m-b-8">SKU: '.order_product_sku.'</div>
            //                <div>Qty: '.final_total_quantity.'</div>';
            
            if(customer_mobile.length >= 5)
            {
                //customer_mobile_text = '<div ';
                    if(sa_zip != '')
                    {
                       // customer_mobile_text += 'class="m-b-8"';
                    }
                    //customer_mobile_text += '>Mob no: <span class="datatable-blue">'+customer_mobile+'</span></div>';
                    nestedData["customer_mobile"]     =customer_mobile;
            }
            else
            {
                customer_mobile_text = 'N/A';
                nestedData["customer_mobile"]     ='N/A';
            }

            sa_zip_code = '';
            if(sa_zip != '')
            {
                nestedData["sa_zip"]     =sa_zip;
                sa_zip_code = '<div>Pincode: '+sa_zip+'</div>';
            }
            else
            {
                nestedData["sa_zip"]     =sa_zip;
            }
            nestedData["customer_email"]     =customer_email;
            //nestedData[] = '<div id="temp_update_customer_details_'.row_id.'"><div class="m-b-8">'.customer_name.'</div>
            //                <div class="m-b-8">'.customer_email.'</div>'.customer_mobile_text.''.sa_zip_code.'</div>';

            if(ship_length != '' || ship_width != '' || ship_height != '') 
            {
                if(ship_length == '')
                {
                    ship_length = '0';
                }
                if(ship_width == '')
                {
                    ship_width = '0';
                }
                if(ship_height == '')
                {
                    ship_height = '0';
                }
                ship_dimension     = ship_length+' x '+ship_width+' x '+ship_height+' cm';
                nestedData["ship_dimension"]     =ship_dimension;
                temp_volumetric_weight     = (ship_length * ship_width * ship_height)/5000;
                if(temp_volumetric_weight == 0)
                {
                    volumetric_weight = 0;
                    nestedData["volumetric_weight"]     =volumetric_weight;
                }
                else
                {
                    volumetric_weight = temp_volumetric_weight.toFixed(2);
                    nestedData["volumetric_weight"]     =volumetric_weight;
                }
            } 
            else 
            {
                ship_dimension     = '';
                nestedData["ship_dimension"]     =ship_dimension;
                volumetric_weight  = 0;
                nestedData["volumetric_weight"]     =volumetric_weight;
            }
            select_box_size = [];
            if(loggedin_user_id == 1186 || loggedin_user_id == 9)
            {
                select_box_size = [['12-12-10', 'XXS Box'],
                ['18-12-7','XS Box'],
                ['19-15-11','S Box'],
                ['20-20-12','M Box'],
                ['20-28-12','L Box'],
                ['32-20-20','XL Box'],
                ['40-36-48','FBA Box'],
                ['19-15-20','MX Box'],
                ['20-20-24','MX1 Box'],
                ['32-20-31','MX2 Box']];
                            
            }
            nestedData["select_box_size"]     =select_box_size;
            const now = new Date();
            //var current_date = date.format(now, pattern2);
            sla_time = "-"+sla_time+" hours";
            
            var d2 = date.format(new Date(sla_time), pattern2);
            
            total_diff_seconds = date.format(new Date(current_date), pattern2) - date.format(new Date(created_date1), pattern2);
            total_diff_hours = total_diff_seconds / 60 /  60;

            hour_suffix1 = 'h';
            hour_suffix2 = 'Hours';
            days_suffix1 = 'd';
            days_suffix2 = 'Days';
            var total_diff_days = '';
            var total_hours = '';
            if(total_diff_hours < 48)
            {
                total_diff_days = floor((48 - total_diff_hours )/24);
                total_hours = ((48 - total_diff_hours )%24);
            }
            else if(total_diff_hours >= 48)
            {
                total_diff_days = floor((total_diff_hours - 48 )/24);
                total_hours = ((total_diff_hours - 48 )%24);
            }

            if(total_diff_hours <= 24)
            {
                span_style = 'color: #00875a;';
            }
            else if(total_diff_hours > 24 && total_diff_hours <= 48)
            {
                span_style = 'color: #ffa500;';
            }
            else if(total_diff_hours > 48)
            {
                span_style = 'color: #ff0000;';
            }
            else
            {
                span_style = 'color: #ff0000;';
            }

            if(total_diff_days == 0)
            {
                if(total_hours == 0 || total_hours == 1)
                {
                    hour_suffix1   = ' h';
                    hour_suffix2   = ' Hour';
                }
                else
                {
                    hour_suffix1   = ' h';
                    hour_suffix2   = ' Hours';
                }
                
                sla_time_datatable = total_hours.hour_suffix1;
                sla_time_tooltip   = total_hours.hour_suffix2;
            }
            else if(total_diff_days == 1)
            {
                if(total_hours == 0 || total_hours == 1)
                {
                    hour_suffix1   = ' h';
                    hour_suffix2   = ' Hour';
                }
                else
                {
                    hour_suffix1   = ' h';
                    hour_suffix2   = ' Hours';
                }
                days_suffix1       = ' d';
                days_suffix2       = ' Day';

                sla_time_datatable = total_diff_days.days_suffix1+' '+total_hours.hour_suffix1;
                sla_time_tooltip   = total_diff_days.days_suffix2+' '+total_hours.hour_suffix2;
            }
            else
            {
                if(total_hours == 0 || total_hours == 1)
                {
                    hour_suffix1 = ' h';
                    hour_suffix2 = ' Hour';
                }
                else
                {
                    hour_suffix1 = ' h';
                    hour_suffix2 = ' Hours';
                }
                days_suffix1       = ' d';
                days_suffix2       = ' Days';

                sla_time_datatable = total_diff_days.days_suffix1+' '+total_hours.hour_suffix1;
                sla_time_tooltip   = total_diff_days.days_suffix2+' '+total_hours.hour_suffix2;
            }
            
            nestedData["sla_time_tooltip"] = sla_time_tooltip;
            nestedData["sla_time_datatable"] = sla_time_datatable;
            nestedData["span_style"] = span_style;
            var custom_text = '';
            if ( (is_login == 1 && loggedin_user_type == 1 && platform_id == '16') || (is_login == 1 && loggedin_user_type == 3 && is_bulk_mystore_enable == '1') || (is_login == 1 && loggedin_user_type == 2 && platform_id == '16' && (loggedin_view_shopify_orders == 1 || loggedin_view_magento_orders == 1 || loggedin_view_woocommerce_orders == 1 || loggedin_view_opencart_orders == 1 || loggedin_view_amazon_orders == 1 || loggedin_view_ebay_orders == 1 || loggedin_view_prestashop_orders == 1 || loggedin_view_bigcommerce_orders == 1 || loggedin_view_3dcart_orders == 1) ))
            //if(1)
            {
                if(is_customer_invoice_generated == 1)
                {
                    //custom_text .= '<div class="d-block status-icon datatable-blue">
                    //                <a onclick="call_mpdf_invoice('.customer_invoice_id.')">Print Invoice</a>
                    //            </div>';
                    nestedData["customer_invoice_id"] = customer_invoice_id;
                    
                }
                else
                {   
                    nestedData["customer_invoice_id"] = "Generate Invoice";
                        //custom_text .= '<div class="d-block status-icon datatable-blue">
                        //                    <a onclick="generate_invoice_order('.row_id.')">Generate Invoice</a>
                        //                </div>'; 

                    
                }
            }
                     
             //action_div = '<div class="mb-2 d-block text-success status-title-text">
             //                   '.ucwords(fulfillment_status_details).'
             //               </div>
             //               <div class="d-block status-icon datatable-blue">
             //                   <a onclick="modal_order_details('.row_id.',1,\'\','.active_tab_id.','.platform_id.')" class="tooltip_class" data-toggle="tooltip" title="View orders" data-html="true" data-placement="top">View Details</a>
             //               </div>'.custom_text;
             nestedData["fulfillment_status_details"] = fulfillment_status_details; 
             nestedData["fulfillment_status"] = fulfillment_status;
            // if(platform_id == 2 and fulfillment_status == '')//only for shopify
            if(platform_id == 4 && fulfillment_status.toString().toLowerCase() != 'wc-cancelled')//only for wocommerce                
            {
                if(cancelled_at == '')
                {
                    // action_div .= '<div class="d-block status-icon datatable-red" style="margin-top: 8px;">
                    //             <a onclick="cancel_awb_modal('.row_id.','.platform_id.')" class="tooltip_class" data-toggle="tooltip" title="Cancel Order" data-html="true" data-placement="top">Cancel Order</a>
                    //         </div>';
                    //action_div .= '<div class="d-block status-icon datatable-red" style="margin-top: 8px;color: #ff5230 !important;font-weight: 500;">
                    //            <a onclick="cancel_awb_modal('.row_id.','.platform_id.')" class="tooltip_class" data-toggle="tooltip" title="Cancel Order" data-html="true" data-placement="top">Cancel Order</a>
                    //        </div>';
                }
                else
                {
                    //action_div .='<div class="d-block status-icon datatable-red" style="margin-top: 8px;">Cancelled</div>';
                }
                
            }
            data.push(nestedData);
        }
    }
    res.status(200).json({
        status : "success",
        status_code : 200,
        data_array: data,
        draw: parseInt(form_data.draw),
        recordsFiltered: parseInt(total_data),
        recordsTotal: parseInt(total_data)
    });
    return;
}
function commonOrderMethod(query,form_data)
{
    console.log("dpnbe");
    try{
        
    return new Promise((resolve, reject) => {
    var Request = require("request");
            
            Request.post({
                "headers": { "content-type": "application/json" },
                "url": query,
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
                    
                        resolve(body)
                        return body;
                    
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
exports.cancelOrder = async function(form_data, req, res, next) 
{
    try{                 
        console.log("done"); 
        var user_id                 = htmlspecialchars(form_data.id);
        var awb_numbers                 = htmlspecialchars(form_data.awb_numbers);
        get_order_query = `SELECT api_access_token,api_secret_key FROM user where id = `+user_id+`;`;
    
        var result_get_order_query       = JSON.parse(await view_order_model.commonSelectQuery(get_order_query));
        
        for (const result of result_get_order_query) 
        {
            //console.log(total_amount.total_data)
            api_access_token = result.api_access_token;
            api_secret_key = result.api_secret_key;
        }
        var form_data = {
            "data":    {
                                  "access_token" : access_token,
                                  "secret_key" : secret_key,
                                  "awb_numbers" : awb_numbers,
                                  }
               }
        var query = "https://pre-alpha.ithinklogistics.com/api_v3/order/cancel.json";
        var result = await commonOrderMethod(query,access_token,secret_key,awb_numbers,form_data);
        res.status(200).json({
            status : "success",
            status_code : 200,
            result: result
           
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

exports.archiveOrder = async function(form_data, req, res, next) 
{
    var user_id                 = htmlspecialchars(form_data.id);
    var awb_numbers                 = htmlspecialchars(form_data.awb_numbers);
    const pattern2 = date.compile('DD-MM-YYYY HH:MM:SS');
    var active_tab_id                               = form_data.active_tab_id;
    var platform_id                                 = form_data.platform_id;
    var hidden_export_checkbox_input_array          = form_data.hidden_export_checkbox_input_array;
    var platform_table = '';
        switch (platform_id) 
        {
            case '2':
                platform_table = 'shopify_itl_orders';
                break;
            case '5':
                platform_table = 'opencart_itl_orders';
                break;
            case '4':
                platform_table = 'woocommerce_itl_orders';
                break;
            case '3':
                platform_table = 'magento_itl_orders';
                break;
            case '6':
                platform_table = 'prestashop_itl_orders';
                break;
            case '16':
                platform_table = 'bulk_itl_orders';
                break;
            default:
                platform_table = '';
                break;
        }
        current_date = date.format(new Date(), pattern2);

        var archive_id = '';
        if (hidden_export_checkbox_input_array.length>0)
        {
            for (const checkbox_archive_input of hidden_export_checkbox_input_array) 
            {
                
                archive_id.push(checkbox_archive_input+',');
            }
           // archive_id               = substr(archive_id,0,-1);
        }
        else
        {
            archive_id = '';
        }

        if (hidden_export_checkbox_input_array.length>0)
        {
            var get_archive_query                    = `SELECT id, status AS archive_type FROM `+platform_table+` WHERE id IN (`+archive_id+`) and is_deleted = 0`;
            
            var result_get_archive_query       = JSON.parse(await view_order_model.commonSelectQuery(get_archive_query));
            //console.log(get_order_query);
            //var result_get_archive_query             = JSON.parse( await view_order_model.commonSelectQuery( get_archive_query);
            
            var all_archive_data_array               = [];
            for (const row_get_archive_query of result_get_archive_query) 
            {
                all_archive_data_array         = row_get_archive_query;
            }

            if (all_archive_data_array.length > 0) 
            {
                for (const archive_data of all_archive_data_array) 
                {
                    if(archive_data['archive_type'] != 2)
                    {
                        var update_archive_id                = archive_data['id'];
                        var update_archive_query             = `UPDATE `+platform_table+` SET updated_at = `+current_date+`,status = 2 WHERE id = `+update_archive_id+` and is_deleted = 0`;
                    
                        var result_update_archive_query       = JSON.parse(await view_order_model.commonSelectQuery(update_archive_query));
                    }
                }
                res.status(200).json({
                    status : "success",
                    status_code : 200,
                    html_message: "Data Archived Successfully"
                   
                });
                return;
            }
            else
            {
                res.status(200).json({
                    status : "success",
                    status_code : 200,
                    html_message: "Data Not Found"
                   
                });
                return;
            }
        }
        else
        {
            res.status(200).json({
                status : "success",
                status_code : 200,
                html_message: "Please select atleast one order"
               
            });
        }
    }

    exports.trackOrder = async function(form_data, req, res, next) 
    {
        try{                 
            console.log("done"); 
            var user_id                 = htmlspecialchars(form_data.id);
            var awb_numbers                 = htmlspecialchars(form_data.awb_numbers);
            get_order_query = `SELECT api_access_token,api_secret_key FROM user where id = `+user_id+`;`;
        
            var result_get_order_query       = JSON.parse(await view_order_model.commonSelectQuery(get_order_query));
            var api_access_token = '';
            var api_secret_key = '';
            for (const result of result_get_order_query) 
            {
                //console.log(total_amount.total_data)
                api_access_token = result.api_access_token;
                api_secret_key = result.api_secret_key;
            }
            var form_data = {
                "data":    {
                                      "access_token" : access_token,
                                      "secret_key" : secret_key,
                                      "awb_numbers" : awb_numbers,
                                      }
                   }
            var query ="https://pre-alpha.ithinklogistics.com/api_v3/order/track.json";
            var result = await commonOrderMethod(query,access_token,secret_key,awb_numbers,form_data);
            res.status(200).json({
                status : "success",
                status_code : 200,
                result: result
               
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
    exports.shippingOrderLabel = async function(form_data, req, res, next) 
    {
        try{                 
            console.log("done"); 
            var user_id                 = htmlspecialchars(form_data.id);
            var awb_numbers                 = htmlspecialchars(form_data.awb_numbers);
            get_order_query = `SELECT api_access_token,api_secret_key FROM user where id = `+user_id+`;`;
        
            var result_get_order_query       = JSON.parse(await view_order_model.commonSelectQuery(get_order_query));
            var api_access_token = '';
            var api_secret_key = '';
            for (const result of result_get_order_query) 
            {
                //console.log(total_amount.total_data)
                api_access_token = result.api_access_token;
                api_secret_key = result.api_secret_key;
            }
            var form_data = {
                "data":    {
                                "access_token" : access_token,
                                "secret_key" : secret_key,
                                "awb_numbers" : awb_numbers,
                                "page_size" : "A4",   
                                "display_cod_prepaid" : "",      
                                "display_shipper_mobile" : "",        
                                "display_shipper_address" : "",   
                            }
                   }
            var query ="https://pre-alpha.ithinklogistics.com/api_v3/shipping/label.json";
            var result = await commonOrderMethod(query,access_token,secret_key,awb_numbers,form_data);
            res.status(200).json({
                status : "success",
                status_code : 200,
                result: result
               
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

    exports.manifestOrderLabel = async function(form_data, req, res, next) 
    {
        try{                 
            console.log("done"); 
            var user_id                 = htmlspecialchars(form_data.id);
            var awb_numbers                 = htmlspecialchars(form_data.awb_numbers);
            get_order_query = `SELECT api_access_token,api_secret_key FROM user where id = `+user_id+`;`;
        
            var result_get_order_query       = JSON.parse(await view_order_model.commonSelectQuery(get_order_query));
            var api_access_token = '';
            var api_secret_key = '';
            for (const result of result_get_order_query) 
            {
                //console.log(total_amount.total_data)
                api_access_token = result.api_access_token;
                api_secret_key = result.api_secret_key;
            }
            var form_data = {
                "data":    {
                                "access_token" : access_token,
                                "secret_key" : secret_key,
                                "awb_numbers" : awb_numbers
                            }
                   }
            var query ="https://pre-alpha.ithinklogistics.com/api_v3/shipping/manifest.json";
            var result = await commonOrderMethod(query,access_token,secret_key,awb_numbers,form_data);
            res.status(200).json({
                status : "success",
                status_code : 200,
                result: result
               
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

    exports.createOrder = async function(form_data, req, res, next) 
    {
        try{                 
            console.log("done"); 
            var awb_numbers = '';
            var user_id                 = htmlspecialchars(form_data.id);
            var waybill                 = form_data.waybill;
            var order                   = form_data.order;
            var sub_order               = form_data.sub_order;
            var order_date              = form_data.order_date;
            var total_amount            = form_data.total_amount;
            var name                    = form_data.name;
            var company_name            = form_data.company_name;     
            var add                     = form_data.add;
            var add2                    = form_data.add2;
            var add3                    = form_data.add3;
            var pin                     = form_data.pin;
            var city                    = form_data.city;
            var state                   = form_data.state;
            var country                 = form_data.country;
            var phone                   = form_data.phone;
            var alt_phone               = form_data.alt_phone;   
            var email                   = form_data.email;
            var is_billing_same_as_shipping = form_data.is_billing_same_as_shipping;   
            var billing_name            = form_data.billing_name;
            var billing_company_name    = form_data.billing_company_name; 
            var billing_add             = form_data.billing_add;   
            var billing_add2            = form_data.billing_add2;
            var billing_add3            = form_data.billing_add3;  
            var billing_pin             = form_data.billing_pin;     
            var billing_city            = form_data.billing_city;     
            var billing_state           = form_data.billing_state;
            var billing_country         = form_data.billing_country;
            var billing_phone           = form_data.billing_phone;
            var billing_alt_phone       = form_data.billing_alt_phone;
            var billing_email           = form_data.billing_email;
            var products                = form_data.products;
            var shipment_length         = form_data.shipment_length;
            var shipment_width          = form_data.shipment_width;  
            var shipment_height         = form_data.shipment_height;
            var weight                  = form_data.weight;  
            var shipping_charges        = form_data.shipping_charges;   
            var giftwrap_charges        = form_data.giftwrap_charges; 
            var transaction_charges     = form_data.transaction_charges;   
            var total_discount          = form_data.total_discount;   
            var first_attemp_discount   = form_data.first_attemp_discount; 
            var cod_charges             = form_data.cod_charges;   
            var advance_amount          = form_data.advance_amount;   
            var cod_amount              = form_data.cod_amount;
            var payment_mode            = form_data.payment_mode;  
            var reseller_name           = form_data.reseller_name;   
            var eway_bill_number        = form_data.eway_bill_number;    
            var gst_number              = form_data.gst_number;
            var return_address_id       = form_data.return_address_id;
            var pickup_address_id       = form_data.pickup_address_id;
            var logistics               = form_data.logistics;
            var s_type                  = form_data.s_type;
            var order_type              = form_data.order_type;

            get_order_query = `SELECT api_access_token,api_secret_key FROM user where id = `+user_id+`;`;
        
            var result_get_order_query       = JSON.parse(await view_order_model.commonSelectQuery(get_order_query));
            var api_access_token = '';
            var api_secret_key = '';
            for (const result of result_get_order_query) 
            {
                //console.log(total_amount.total_data)
                api_access_token = result.api_access_token;
                api_secret_key = result.api_secret_key;
            }
            //console.log(form_data )
            var data1 = {
                
                "data":    {
                    "shipments" : [
                                {
                                    "waybill" : waybill,
                                    "order" : order,
                                    "sub_order" : sub_order,
                                    "order_date" : order_date,
                                    "total_amount" : total_amount,
                                    "name" : name,
                                    "company_name" : company_name,     
                                    "add" : add,
                                    "add2" : add2,
                                    "add3" : add3,
                                    "pin" : pin,
                                    "city" : city,
                                    "state" : state,
                                    "country" : country,
                                    "phone" :phone,
                                    "alt_phone" : alt_phone,     
                                    "email" : email,
                                    "is_billing_same_as_shipping" : is_billing_same_as_shipping,     
                                    "billing_name" : billing_name,     
                                    "billing_company_name" : billing_company_name,     
                                    "billing_add" : billing_add,     
                                    "billing_add2" : billing_add2,     
                                    "billing_add3" : billing_add3,     
                                    "billing_pin" : billing_pin,     
                                    "billing_city" : billing_city,     
                                    "billing_state" : billing_state,     
                                    "billing_country" : billing_country,     
                                    "billing_phone" : billing_phone,    
                                    "billing_alt_phone" : billing_alt_phone,    
                                    "billing_email" : billing_email,    
                                    "products" :products,
                                    "shipment_length" : shipment_length,   
                                    "shipment_width" : shipment_width,  
                                    "shipment_height" : shipment_height,   
                                    "weight" : weight,  
                                    "shipping_charges" : shipping_charges,     
                                    "giftwrap_charges" : giftwrap_charges,    
                                    "transaction_charges" : transaction_charges,    
                                    "total_discount" : total_discount,    
                                    "first_attemp_discount" :first_attemp_discount,   
                                    "cod_charges" : cod_charges,    
                                    "advance_amount" : advance_amount,   
                                    "cod_amount" : cod_amount,
                                    "payment_mode" : payment_mode,   
                                    "reseller_name" : reseller_name,     
                                    "eway_bill_number" : eway_bill_number,    
                                    "gst_number" : gst_number,    
                                    "return_address_id" : return_address_id
                                }
                            ],
                        "pickup_address_id" : pickup_address_id,
                        "access_token" : api_access_token, 
                        "secret_key" : api_secret_key,
                        "logistics" : logistics, 
                        "s_type" : s_type, 
                        "order_type" : order_type 
                    }
    
                };
                console.log(data1.data)
            var query ="https://manage.ithinklogistics.com/api_v3/order/add.json";
                
           var result = await commonOrderMethod(query,data1);
            res.status(200).json({
                status : "success",
                status_code : 200,
                result: result
               
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


    exports.rto_accept_reject = async function(form_data, req, res, next) 
    {
        try{                 
            console.log("done"); 
            var user_id                 = htmlspecialchars(form_data.id);
            var awb_numbers                 = htmlspecialchars(form_data.awb_numbers);
            var om_row_id               = form_data.om_row_id;

            var get_om_query             = "SELECT * FROM order_management WHERE user_id='"+user_id+"' AND id = '"+om_row_id+"' AND is_deleted='0'";
            var result_get_om_query       = JSON.parse(await view_order_model.commonSelectQuery(get_om_query));
            var modified_on = date.format(new Date(), pattern2);
            
            var all_om_data_array               = [];
            for (const row_get_om_query of result_get_om_query) 
            {
                all_om_data_array         = row_get_om_query;
            }
            var all_omc_data_array = [];
            var get_omc_query             = "SELECT * FROM order_management_cancel_pod_rto WHERE is_deleted='0' AND om_row_id = '"+om_row_id+"'";
            var result_get_omc_query       = JSON.parse(await view_order_model.commonSelectQuery(get_omc_query));
            for (const row_get_omc_query of result_get_omc_query) 
            {
                all_omc_data_array.row_get_omc_query['om_row_id']      = row_get_omc_query;
            }
            if (all_om_data_array.length > 0 )
            {
                for (const user_data of all_om_data_array) 
                {
                    var om_row_id              = user_data['id'];
                    var awb_number             = user_data['airway_bill_no'];
                    var awb_no_value           = user_data['airway_bill_no'];
                    var order_sub_order_no     = user_data['order_sub_order_no'];
                    var return_tracking_no     = user_data['return_tracking_no'];
                    var pod_status             = user_data['pod_status'];
                    var logistic_id            = user_data['logistic_id'];
                    var logistics_service_type = user_data['logistics_service_type'];
                    var vendor_id              = user_data['user_id'];
                    var new_live_status        = user_data['new_live_status'];

                    
                        var pod_status = 3;
                        var result_insert_query       = "";
                        if (all_omc_data_array.length > 0 )
                        {
                            var update_query = "UPDATE order_management_cancel_pod_rto SET pod_requested_user_id='"+user_id+"',pod_status = '"+pod_status+"',pod_request_date_time='"+modified_on+"',pod_update_date_time='"+modified_on+"',updated_date_time='"+modified_on+"' WHERE id = '"+om_row_id+"'";
                             result_insert_query       = JSON.parse(await view_order_model.commonSelectQuery(update_query));
                        }
                        else
                        {
                            var insert_data_query = "INSERT INTO `order_management_cancel_pod_rto`"+
                            "(`user_id`, `om_row_id`, `logistic_id`,`awb_no`, `pod_requested_user_id`, `pod_status`,`pod_request_date_time`,`pod_update_date_time`,`created_date_time`,`updated_date_time`)"+ 
                            "VALUES ('"+vendor_id+"','"+om_row_id+"','"+logistic_id+"','"+awb_number+"','"+user_id+"','"+pod_status+"','"+modified_on+"','"+modified_on+"','"+modified_on+"','"+modified_on+"')";
                             result_insert_query       = JSON.parse(await view_order_model.commonSelectQuery(insert_data_query));
                        }
                        
                        if(result_insert_query)
                        {
                            res.status(200).json({
                                status_code : 200,
                                status: 'success',
                                message : "POD Requested",
                            });
                            return;
                        }
                        else
                        {
                            res.status(200).json({
                                status_code : 400,
                                status: 'error',
                                message : "Some Error Occured! Please try again.",
                            });
                            return;
                        }
                    
                }
            }
            else
            {
                res.status(200).json({
                    status_code : 400,
                    status: 'error',
                    message : "Some Error Occured! Please try again.",
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

    exports.get_pickup_address = async function(form_data, req, res, next) 
    {
        try{                  
            var user_id                 = htmlspecialchars(form_data.id);
            var awb_numbers                 = htmlspecialchars(form_data.awb_numbers);
            get_pickup_address_query = `SELECT ua.id,ua.user_id,ua.company_name,ua.mobile,ua.contact_person,ua.email,ua.address1,ua.address2,ua.pincode,
            ua.city_id, c.city_name,ua.state_id,s.state_name, ua.country_id, cn.country_name,ua.website,ua.is_default,ua.status 
            FROM user_address ua join cities c on ua.city_id = c.id
            join states s on ua.state_id = s.id
            join country cn on ua.country_id = cn.id
            where user_id = `+user_id+`;`;
        
            var result_get_pickup_address_query       = JSON.parse(await view_order_model.commonSelectQuery(get_pickup_address_query));
            
            res.status(200).json({
                status : "success",
                status_code : 200,
                pickup_address: result_get_pickup_address_query
               
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

    
    exports.add_edit_pickup_address = async function(form_data, req, res, next) 
    {
        try{                  
            var user_id                 = htmlspecialchars(form_data.id);
            var company_name                 = htmlspecialchars(form_data.company_name);
            var mobile                 = htmlspecialchars(form_data.mobile);
            var contact_person                 = htmlspecialchars(form_data.contact_person);
            var email                 = htmlspecialchars(form_data.email);
            var address1                 = htmlspecialchars(form_data.address1);
            var address2                 = htmlspecialchars(form_data.address2);
            var pincode                 = htmlspecialchars(form_data.pincode);
            var city_id                 = htmlspecialchars(form_data.city_id);
            var state_id                 = htmlspecialchars(form_data.state_id);
            var country_id                 = htmlspecialchars(form_data.country_id);
            var website                 = htmlspecialchars(form_data.website);
            var user_address_id         = form_data.user_address_id;
            var is_edit                 = form_data.is_edit;
            
            if(is_edit == 0)
            {
                var get_pickup_address_query = `INSERT INTO user_address (user_id,company_name,mobile,contact_person,email,address1,address2,pincode,city_id,state_id,country_id,website,is_default,status,is_deleted)
                VALUES (`+user_id+`, '`+company_name+`', '`+mobile+`', '`+contact_person+`','`+email+`','`+address1+`','`+address2+`','`+pincode+`','`+city_id+`','`+state_id+`','`+country_id+`','`+website+`',1,1,0);`;
            
                var result_get_pickup_address_query       = JSON.parse(await view_order_model.commonSelectQuery(get_pickup_address_query));
                
                res.status(200).json({
                    status : "success",
                    status_code : 200,
                    msg: result_get_pickup_address_query
                
                });
                return;
            }
            if(is_edit == 1)
            {   
                var get_pickup_address_query = `UPDATE user_address SET user_id = '`+user_id+`', company_name = '`+company_name+`',  mobile = '`+mobile+`', contact_person = '`+contact_person+`',  email = '`+email+`', address1 = '`+address1+`', address2 = '`+address2+`', pincode = '`+pincode+`',
                city_id = '`+city_id+`', state_id = '`+state_id+`', country_id = '`+country_id+`', website = '`+website+`' WHERE id= `+user_address_id;
            
                var result_get_pickup_address_query       = JSON.parse(await view_order_model.commonSelectQuery(get_pickup_address_query));
                
                res.status(200).json({
                    status : "success",
                    status_code : 200,
                    msg: result_get_pickup_address_query
                
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
    exports.delete_pickup_address = async function(form_data, req, res, next) 
    {
        try{                  
            var user_id                 = htmlspecialchars(form_data.id);
            
            var user_address_id         = form_data.user_address_id;
                var delete_pickup_address_query = `UPDATE user_address SET is_deleted = 1 where id = `+user_address_id;
                var result_delete_pickup_address_query_pickup_address_query       = JSON.parse(await view_order_model.commonSelectQuery(delete_pickup_address_query));
                
                res.status(200).json({
                    status : "success",
                    status_code : 200,
                    msg: result_delete_pickup_address_query
                
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
    exports.get_logistics_list = async function(form_data, req, res, next) 
    {
        try{                  
            var user_id                 = htmlspecialchars(form_data.id);
            var awb_numbers                 = htmlspecialchars(form_data.awb_numbers);
            get_logistics_list_query = `SELECT id, logistics_name, logistics_rating,priority,pickup_performance_rating,delivery_performance_rating,weight_cases_rating,fastest_priority, logistics_id FROM logistics_v2;`;
            var result_get_logistics_list_query       = JSON.parse(await view_order_model.commonSelectQuery(get_logistics_list_query));
            get_logistics_list_array = [];
            for (const get_logistics_list of result_get_logistics_list_query) 
            {  
                get_logistics_list_array.push({
                    id                              :get_logistics_list.user_contract_id,
                    logistics_name                  :get_logistics_list.logistics_name,
                    logistics_rating                :get_logistics_list.logistics_rating,
                    priority                        :get_logistics_list.priority,
                    pickup_performance_rating       :get_logistics_list.pickup_performance_rating,
                    delivery_performance_rating     :get_logistics_list.delivery_performance_rating,
                    weight_cases_rating             :get_logistics_list.weight_cases_rating,
                    fastest_priority                :get_logistics_list.fastest_priority,
                    logistics_id                :get_logistics_list.logistics_id,
                    logistics_id                :get_logistics_list.logistics_id,
                    price                       : 0
                });
            }
            
            
            res.status(200).json({
                status : "success",
                status_code : 200,
                logistics_list: get_logistics_list_array
               
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
    exports.calculate_rate_chart = async function(form_data, req, res, next) 
    {
        var zone = "";
        var pincode_service_response_data = [];
        var user_id = '';
        var page_type = form_data.page_type;
        var volumentric_weight;
        if(page_type == 'add_single_order')
        {
            var post_phy_weight = '';
            var post_ship_width = ''; 
            var post_ship_height = '';
            var post_ship_length = '';
            if(form_data.physical_weight == 0 || form_data.physical_weight == '' || form_data.physical_weight == null)
            {
                post_phy_weight = '0';
            }
            else
            {
                post_phy_weight = form_data.physical_weight;
            }
            if(form_data.ship_width == 0 || form_data.ship_width == '' || form_data.ship_width == null)
            {
                post_ship_width = '0';
            }
            else
            {
                post_ship_width = form_data.ship_width;
            }
            if(form_data.ship_height == 0 || form_data.ship_height == '' || form_data.ship_height == null)
            {
                post_ship_height = '0';
            }
            else
            {
                post_ship_height = form_data.ship_height;
            }
            if(form_data.ship_length == 0 || form_data.ship_length == '' || form_data.ship_length == null)
            {
                post_ship_length = '0';
            }
            else
            {
                post_ship_length = form_data.ship_length;
            }
            var order_type             = form_data.is_reverse;//0->forward,1->reverse
            var customer_address_id    = form_data.customer_address_i;//0->forward,1->reverse
            //get customer pincode
            var source_pincode;
            var get_source_pin         = "select pincode from user_address where id = '"+customer_address_id+"' and is_deleted = 0";
            var result_get_query       = JSON.parse(await view_order_model.commonSelectQuery(get_source_pin));
            for (const row_get_query of result_get_query) 
            {
                source_pincode     =row_get_query['pincode'];
            }
            
            var destination_pincode    = form_data.customer_pincode;
            var phy_weight             = Math.round(( post_phy_weight)/1000,3);//in kg
            var width                  =  post_ship_width;//in cm
            var height                 =  post_ship_height;//in cm
            var length                 =  post_ship_length;//in cm
            var payment_mode           = form_data.order_type.toLowerCase();//cod or prepaid
            var product_mrp            = form_data.product_mrp;
            var logistics_id           = form_data.logistics_id;
            var client_id;
            if(loggedin_user_type == 3)
            {
                client_id = loggedin_user_id;
            }
            else
            {
                client_id           = form_data.client_id;
            }
             
            volumentric_weight     = Math.round(((length * width * height)/5000),3);


        
    }
    else if(page_type == 'onboard_order')
    {
        if(loggedin_user_type == 3)
        {
            user_id = loggedin_user_id;
        }
        else
        {
            user_id           = 'user_id';
        }
        
        post_phy_weight = post_ship_width = post_ship_height = post_ship_length = '';
        if(phy_weight == 0 || phy_weight == '' || phy_weight == null)
        {
            post_phy_weight = '0';
        }
        else
        {
            post_phy_weight = 'phy_weight';
        }
        if(ship_widt == 0 || ship_width == '' || ship_width == null)
        {
            post_ship_width = '0';
        }
        else
        {
            post_ship_width = 'ship_width';
        }
        if(ship_height == 0 || ship_height == '' || ship_height == null)
        {
            post_ship_height = '0';
        }
        else
        {
            post_ship_height = 'ship_height';
        }
        if(ship_length == 0 || ship_length == '' || ship_length == null)
        {
            post_ship_length = '0';
        }
        else
        {
            post_ship_length = 'ship_length';
        }
        // order_type             = 0;
        source_pincode         = '400092';// get from db
        source_pincode         = 'src_pincode';
        destination_pincode    = 'pincode';
        order_type             = 'order_type';
        phy_weight             =  post_phy_weight;//in kg
        width                  =  post_ship_width;//in cm
        height                 =  post_ship_height;//in cm
        length                 =  post_ship_length;//in cm
        payment_mode           = 'payment_mode';//cod or prepaid
        product_mrp            = 'product_mrp';
        volumentric_weight     = Math.round(((length * width * height)/5000),3);
        data = '{"data":{"pincode":"'+destination_pincode+'","access_token":"f81a5ef8970307b363d09f6660c9cf02","secret_key":"12e965e208ca9755e6c71a7417123419"}}';
        
        pincode_service_response_data = check_pincode_serviceability(destination_pincode,source_pincode,payment_mode,order_type,loggedin_user_id);
    
    }

    else
    {
        post_phy_weight = post_ship_width = post_ship_height = post_ship_length = '';
        if(weight == 0 || weight == '' || weight == null)
        {
            post_phy_weight = '0';
        }
        else
        {
            post_phy_weight = weight;
        }
        if(width == 0 || width == '' || width == null)
        {
            post_ship_width = '0';
        }
        else
        {
            post_ship_width = width;
        }
        if(height == 0 || height == '' || height == null)
        {
            post_ship_height = '0';
        }
        else
        {
            post_ship_height = height;
        }
        if(length == 0 || length == '' || length == null)
        {
            post_ship_length = '0';
        }
        else
        {
            post_ship_length = length;
        }
        if(loggedin_user_type == 3)
        {
            user_id            = loggedin_user_id;
        }
        else
        {
            user_id            = user_id;
        }
        order_type             = order_type;//0->forward,1->reverse
        source_pincode         = pickup_pincode;
        destination_pincode    = destination_pincode;
        phy_weight             =  post_phy_weight;//in kg
        width                  =  post_ship_width;//in cm
        height                 =  post_ship_height;//in cm
        length                 =  post_ship_length;//in cm
        payment_mode           = strtolower(payment_mode);//cod or prepaid
        product_mrp            = product_mrp;
        volumentric_weight     = Math.round(((length * width * height)/5000),3);
    }
    billable_weight = Math.max(phy_weight,volumentric_weight);
        
        zone       = define_zone(source_pincode,destination_pincode);
        all_zone   =zone['all_zone'];
        ecom_zone  = zone['ecom_zone'];
       
        billing_rate = {};
        if(all_zone != '' || ecom_zone != '')
        {
            if(page_type == 'add_single_order')
            {
                logistic_id = logistics_id;
                user_id = client_id;
               
                if(logistic_id == 5)
                {
                    if(ecom_zone != '')
                    {
                        
                        logistic_id = 5;
                        logistic_service_type= '';
                        billing_rate['rate']  =  calculate_billing_rate(user_id,billable_weight,ecom_zone,logistic_id,logistic_service_type,order_type,payment_mode,product_mrp);
                    }
                }
                else
                {
                    logistic_service_type= '';
                    billing_rate['rate']  =  calculate_billing_rate(user_id,billable_weight,all_zone,logistic_id,logistic_service_type,order_type,payment_mode,product_mrp);
                }
            }
            else
            {
                parameter_array = {};
                logistic_id = '1';
                logistic_service_type= '';
                parameter_array['rate_card_array'] = [];
                parameter_array['user_id'] = user_id;
                parameter_array['billable_weight'] = billable_weight;
                parameter_array['zone'] = all_zone;
                parameter_array['logistic_id'] = logistic_id;
                parameter_array['logistic_service_type'] = logistic_service_type;
                parameter_array['order_type'] = order_type;
                parameter_array['payment_type'] = payment_mode;
                parameter_array['product_mrp'] = product_mrp;
                
                //billing_rate['xpressbees'] = calculate_billing_rate_onboard(parameter_array); 
                bill_data = calculate_billing_rate_onboard(parameter_array);
                if(bill_data.length > 0)
                {
                    billing_rate['xpressbees'] = calculate_billing_rate_onboard(parameter_array);
                }
                else{
                   
                    billing_rate['xpressbees']['itl_bill_with_gst'] = 'NA';
                }
                // logistic_id = '1';
                // logistic_service_type= '';
                // billing_rate['xpressbees']  =  calculate_billing_rate(user_id,billable_weight,all_zone,logistic_id,logistic_service_type,order_type,payment_mode,product_mrp);
                
                logistic_id = 2;
                logistic_service_type = 4;
                parameter_array['logistic_id'] = logistic_id;
                parameter_array['logistic_service_type'] = logistic_service_type;
                //billing_rate['fedex_standard'] = calculate_billing_rate_onboard(parameter_array); 
                bill_data = calculate_billing_rate_onboard(parameter_array);
                if(bill_data.length > 0)
                {
                    billing_rate['fedex_standard'] = calculate_billing_rate_onboard(parameter_array);
                }
                else{
                   
                    billing_rate['fedex_standard']['itl_bill_with_gst'] = 'NA';
                }
                // logistic_id = '2';
                // logistic_service_type = 4;
                // billing_rate['fedex_standard']  =  calculate_billing_rate(user_id,billable_weight,all_zone,logistic_id,logistic_service_type,order_type,payment_mode,product_mrp);
                
                logistic_id = 2;
                logistic_service_type = 5;
                parameter_array['logistic_id'] = logistic_id;
                //billing_rate['fedex_priority'] = calculate_billing_rate_onboard(parameter_array);
                parameter_array['logistic_service_type'] = logistic_service_type;
                bill_data = calculate_billing_rate_onboard(parameter_array);
                if(bill_data.length > 0)
                {
                    billing_rate['fedex_priority'] = calculate_billing_rate_onboard(parameter_array);
                }
                else{
                   
                    billing_rate['fedex_priority']['itl_bill_with_gst'] = 'NA';
                }
                // logistic_id = '2';
                // logistic_service_type = 5;
                // billing_rate['fedex_priority']  =  calculate_billing_rate(user_id,billable_weight,all_zone,logistic_id,logistic_service_type,order_type,payment_mode,product_mrp);
                
                // logistic_id = '2';
                // logistic_service_type = 6;
                // billing_rate['fedex_gMath.round']  =  calculate_billing_rate(user_id,billable_weight,all_zone,logistic_id,logistic_service_type,order_type,payment_mode,product_mrp);
                
                logistic_id = 2;
                logistic_service_type = 6;
                parameter_array['logistic_id'] = logistic_id;
                parameter_array['logistic_service_type'] = logistic_service_type;
                //billing_rate['fedex_gMath.round'] = calculate_billing_rate_onboard(parameter_array);
                bill_data = calculate_billing_rate_onboard(parameter_array);
                if(bill_data.length > 0)
                {
                    billing_rate['fedex_gMath.round'] = calculate_billing_rate_onboard(parameter_array);
                }
                else{
                   
                    billing_rate['fedex_gMath.round']['itl_bill_with_gst'] = 'NA';
                }
                //billing_rate['fedex_gMath.round'] = calculate_billing_rate_onboard(parameter_array);
                
                logistic_id = '3';
                logistic_service_type= '';
                parameter_array['logistic_id'] = logistic_id;
                parameter_array['logistic_service_type'] = logistic_service_type;
                //billing_rate['delhivery']  =  calculate_billing_rate_onboard(parameter_array); 
                bill_data = calculate_billing_rate_onboard(parameter_array);
                if(bill_data.length > 0)
                {
                    billing_rate['delhivery'] = calculate_billing_rate_onboard(parameter_array);
                }
                else{
                   
                    billing_rate['delhivery']['itl_bill_with_gst'] = 'NA';
                }
                logistic_id = '7';
                logistic_service_type= '';
                parameter_array['logistic_id'] = logistic_id;
                parameter_array['logistic_service_type'] = logistic_service_type;
                //billing_rate['bluedart']  =  calculate_billing_rate_onboard(parameter_array);
                bill_data = calculate_billing_rate_onboard(parameter_array);
                if(bill_data.length > 0)
                {
                    billing_rate['bluedart'] = calculate_billing_rate_onboard(parameter_array);
                }
                else{
                   
                    billing_rate['bluedart']['itl_bill_with_gst'] = 'NA';
                }
                // logistic_id = '7';
                // logistic_service_type= '';
                // billing_rate['bluedart']  =  calculate_billing_rate(user_id,billable_weight,all_zone,logistic_id,logistic_service_type,order_type,payment_mode,product_mrp);
                
                logistic_id = '8';
                logistic_service_type= '';
                parameter_array['logistic_id'] = logistic_id;
                parameter_array['logistic_service_type'] = logistic_service_type;
                //billing_rate['shadowfax']  =  calculate_billing_rate_onboard(parameter_array); 
                bill_data = calculate_billing_rate_onboard(parameter_array);
                if(bill_data.length > 0)
                {
                    billing_rate['shadowfax'] = calculate_billing_rate_onboard(parameter_array);
                }
                else{
                   
                    billing_rate['shadowfax']['itl_bill_with_gst'] = 'NA';
                }
                // logistic_id = '8';
                // logistic_service_type= '';
                // billing_rate['shadowfax']  =  calculate_billing_rate(user_id,billable_weight,all_zone,logistic_id,logistic_service_type,order_type,payment_mode,product_mrp);
                
                logistic_id = '6';
                logistic_service_type= '';
                parameter_array['logistic_id'] = logistic_id;
                parameter_array['logistic_service_type'] = logistic_service_type;
                //billing_rate['ekart']  =  calculate_billing_rate_onboard(parameter_array); 
                bill_data = calculate_billing_rate_onboard(parameter_array);
                if(bill_data.length > 0)
                {
                    billing_rate['ekart'] = calculate_billing_rate_onboard(parameter_array);
                }
                else{
                   
                    billing_rate['ekart']['itl_bill_with_gst'] = 'NA';
                }
                
                if(ecom_zone != '')
                {
                    logistic_id = 5;
                    logistic_service_type= '';
                    parameter_array['logistic_id'] = logistic_id;
                    parameter_array['logistic_service_type'] = logistic_service_type;
                    parameter_array['zone'] = ecom_zone;
                    //billing_rate['ecom']  =  calculate_billing_rate_onboard(parameter_array); 
                    bill_data = calculate_billing_rate_onboard(parameter_array);
                    if(bill_data.length > 0)
                    {
                        billing_rate['ecom'] = calculate_billing_rate_onboard(parameter_array);
                    }
                    else{
                       
                        billing_rate['ecom']['itl_bill_with_gst'] = 'NA';
                    }
                }

                logistic_id = '14';
                logistic_service_type = '';
                parameter_array['logistic_id'] = logistic_id;
                parameter_array['logistic_service_type'] = logistic_service_type;
                //billing_rate['ekart']  =  calculate_billing_rate_onboard(parameter_array); 
                bill_data = calculate_billing_rate_onboard(parameter_array);
                if(bill_data.length > 0)
                {
                    billing_rate['dtdc'] = calculate_billing_rate_onboard(parameter_array);
                }
                else{
                   
                    billing_rate['dtdc']['itl_bill_with_gst'] = 'NA';
                }
                
                // logistic_id = '1';
                // logistic_service_type= '';
                // billing_rate['xpressbees']  =  calculate_billing_rate(user_id,billable_weight,all_zone,logistic_id,logistic_service_type,order_type,payment_mode,product_mrp);
                
                // logistic_id = '2';
                // logistic_service_type = 4;
                // billing_rate['fedex_standard']  =  calculate_billing_rate(user_id,billable_weight,all_zone,logistic_id,logistic_service_type,order_type,payment_mode,product_mrp);
                
                // logistic_id = '2';
                // logistic_service_type = 5;
                // billing_rate['fedex_priority']  =  calculate_billing_rate(user_id,billable_weight,all_zone,logistic_id,logistic_service_type,order_type,payment_mode,product_mrp);
                
                // logistic_id = '2';
                // logistic_service_type = 6;
                // billing_rate['fedex_gMath.round']  =  calculate_billing_rate(user_id,billable_weight,all_zone,logistic_id,logistic_service_type,order_type,payment_mode,product_mrp);
                
                // logistic_id = '3';
                // logistic_service_type= '';
                // billing_rate['delhivery']  =  calculate_billing_rate(user_id,billable_weight,all_zone,logistic_id,logistic_service_type,order_type,payment_mode,product_mrp);
                // logistic_id = '7';
                // logistic_service_type= '';
                // billing_rate['bluedart']  =  calculate_billing_rate(user_id,billable_weight,all_zone,logistic_id,logistic_service_type,order_type,payment_mode,product_mrp);
                // logistic_id = '8';
                // logistic_service_type= '';
                // billing_rate['shadowfax']  =  calculate_billing_rate(user_id,billable_weight,all_zone,logistic_id,logistic_service_type,order_type,payment_mode,product_mrp);
                
                // logistic_id = '6';
                // logistic_service_type= '';
                // billing_rate['ekart']  =  calculate_billing_rate(user_id,billable_weight,all_zone,logistic_id,logistic_service_type,order_type,payment_mode,product_mrp);
                // if(ecom_zone != '')
                // {
                //     logistic_id = 5;
                //     logistic_service_type= '';
                //     billing_rate['ecom']  =  calculate_billing_rate(user_id,billable_weight,ecom_zone,logistic_id,logistic_service_type,order_type,payment_mode,product_mrp);
                // }
            }
        }
        if(loggedin_user_id == 3543)
        {
            pincode_service_response_data = "bluedart";
        }
        rreturn["pincode_service_response_data"]   = pincode_service_response_data;
        rreturn["billing"]   = billing_rate;
        rreturn["zone"]   = zone;
        rreturn["status"] = "success";
}

function calculate_billing_rate_onboard(parameter_array)
    {
        rate_card_array        = parameter_array['rate_card_array'];
        user_id                = parameter_array['user_id'];
        billable_weight_in_kg  = parameter_array['billable_weight'];
        zone                   = parameter_array['zone'];
        logistic_id            = parameter_array['logistic_id'];
        logistic_service_type  = parameter_array['logistic_service_type'];
        order_type             = parameter_array['order_type'];
        payment_type           = parameter_array['payment_type'];
        product_mrp            = parameter_array['product_mrp'];
        
        check_weight =  (billable_weight_in_kg /0.5);
        if(containsDecimal(check_weight))
        {
            billable_weight_in_kg = Math.round(billable_weight_in_kg,0.5);
        }
       
        if(user_id == '')
        {
            user_id = 0;//default rate_chart
        }
        if(count(rate_card_array) == 0)
        {
            get_rate_query         = "SELECT * from  rate_chart where user_id = 'user_id' and logistic_id = 'logistic_id' and is_deleted = 0 and status = 1";
            result_rate_query      = JSON.parse( await view_order_model.commonSelectQuery( get_rate_query));
            all_rate_array         = [];
            for (const row_rate_query of result_rate_query)
           
            {
                rate_card_array[row_rate_query['id']]     = row_rate_query;
            }
        }
        
        if(logistic_id > 0)
        {
            logistic_name              = get_logistic_name(logistic_id)['logname'].toLowerCase();
            sub_zone_name = ''; 
            zone_value                 = explode('-',zone);
            zone_name                  = trim((zone_value[0]).toLowerCase());
            sub_zone                   = trim((zone_value[1]).toLowerCase());
            if(sub_zone != '')
            {
                sub_zone_name = '_'.sub_zone;
            }
            for (const rate_data_value of rate_card_array) 
            {   lo
                rate_slab_type  = rate_data_value['slab_weight_in_kg'];
                logistics_fwd = logistics_fwd_additional = logistics_fsc_per = logistics_cod = logistics_cod_per = logistics_rto = logistics_rto_additional = logistics_rto_fsc_per =0;
                if(rate_data_value['rate_slab_type'] == 0)//zone wise rate card
                {
                    logistics_fwd              = rate_data_value['zone_'+zone_name+'_fwd'+sub_zone_name];
                    logistics_fwd_additional   = rate_data_value['zone_'+zone_name+'_fwd_additional'+sub_zone_name];
                    logistics_fsc_per          = rate_data_value['zone_'+zone_name+'_fsc_per'+sub_zone_name];
                    logistics_cod              = rate_data_value['zone_'+zone_name+'_cod'+sub_zone_name];
                    logistics_cod_per          = rate_data_value['zone_'+zone_name+'_cod_per'+sub_zone_name];
                    logistics_rto              = rate_data_value['zone_'+zone_name+'_rto'+sub_zone_name];
                    logistics_rto_additional   = rate_data_value['zone_'+zone_name+'_rto_additional'+sub_zone_name];
                    logistics_rto_fsc_per      = rate_data_value['zone_'+zone_name+'_rto_fsc_per'+sub_zone_name];
                    
                    if(logistic_id == 2 && rate_slab_type == '2.00' && logistic_service_type == '6')
                    {
                        
                        logistics_fwd              = rate_data_value['logistics_fwd'];
                        logistics_fwd_additional   = rate_data_value['logistics_fwd_additional'];
                        logistics_fsc_per          = rate_data_value['logistics_fsc_per'];
                        logistics_cod              = rate_data_value['logistics_cod'];
                        logistics_cod_per          = rate_data_value['logistics_cod_per'];
                        logistics_rto              = rate_data_value['logistics_rto'];
                        logistics_rto_additional   = rate_data_value['logistics_rto_additional'];
                        logistics_rto_fsc_per      = rate_data_value['logistics_rto_fsc_per'];
                        
                    }
                    else if(logistic_id == 2 && rate_slab_type != '2.00' && logistic_service_type != '6')
                    {
                        logistics_fwd              = rate_data_value['logistics_fwd'];
                        logistics_fwd_additional   = rate_data_value['logistics_fwd_additional'];
                        logistics_fsc_per          = rate_data_value['logistics_fsc_per'];
                        logistics_cod              = rate_data_value['logistics_cod'];
                        logistics_cod_per          = rate_data_value['logistics_cod_per'];
                        logistics_rto              = rate_data_value['logistics_rto'];
                        logistics_rto_additional   = rate_data_value['logistics_rto_additional'];
                        logistics_rto_fsc_per      = rate_data_value['logistics_rto_fsc_per'];
                    }
                   
                }
                else if(rate_data_value['rate_slab_type'] == 1)//flat rate card
                {
                    logistics_fwd              = rate_data_value['flat_rate_value'];
                    logistics_fwd_additional   = rate_data_value['flat_rate_add_value'];
                    logistics_fsc_per          = 0;
                    logistics_cod              = 0;
                    logistics_cod_per          = 0;
                    logistics_rto              = 0;
                    logistics_rto_additional   = 0;
                    logistics_rto_fsc_per      = 0;
                    
                }
                if(logistics_fwd > 0)
                {
                    
                
                    multiply_factor = rate_data_value['multiply_factor'];
                    //---FWD CHARGES
                    
                   
                    calc_fwd_charges = calc_fwd_add_charges = final_fwd_charges =  final_fwd_per_charges = 0;
                    temp_billable_weight = Math.round(billable_weight_in_kg);
                    return_array[rate_column_key]['id'] = rate_column_key;
                    return_array[rate_column_key]['multiply_factor'] = multiply_factor;
                    calc_fwd_charges = logistics_fwd;
                    
                    // if(logistic_id == 2 and logistic_service_type == 6)//for fedex gMath.round
                    // {
                    //     if(temp_billable_weight % 2)
                    //     {
                    //         temp_billable_weight = temp_billable_weight + 1;
                    //     }
                    //     if(billable_weight_in_kg > 2)
                    //     {
                    //         calc_fwd_add_charges += ((temp_billable_weight * multiply_factor)-1)*logistics_fwd_additional;
                    //         //calc_fwd_add_charges += ((temp_billable_weight * 0.5)-1)*logistics_fwd_additional;
                    //     }
                    // }
                    
                    // else
                    // {
                    // }
                        if(billable_weight_in_kg > rate_slab_type)
                        {
                            //=CEILING((billable_weight-first_weight_slab)/multiply_factor,multiply_factor)
                            //new_form = Ceil(((billable_weight_in_kg - rate_slab_type)/multiply_factor)/multiply_factor) * multiply_factor; 
                            new_form = Math.ceil(((billable_weight_in_kg - rate_slab_type)/multiply_factor)/1);
                           
                            // echo billable_weight_in_kg.' - '.rate_slab_type. ' / '.multiply_factor;
                            // echo new_form;die;
                            calc_fwd_add_charges += new_form*logistics_fwd_additional;
                            //calc_fwd_add_charges += ((billable_weight_in_kg * multiply_factor)-1)*logistics_fwd_additional;
                            
                            //calc_fwd_add_charges += ((billable_weight_in_kg * 2)-1)*logistics_fwd_additional;
                        }
                    
                    
                    final_fwd_charges      += calc_fwd_charges + calc_fwd_add_charges;    //---FWD CHARGES
                    
                    
                    
                    final_fwd_per_charges  += (final_fwd_charges*logistics_fsc_per) / 100;     //---FWD FSC PERCENTAGE CHARGES
                    return_array[rate_column_key]['itl_half_kg']            = calc_fwd_charges;
                    return_array[rate_column_key]['itl_additional_half_kg'] = calc_fwd_add_charges;
                    return_array[rate_column_key]['itl_fsc_per']            = final_fwd_per_charges;
                    
                    //---FWD CHARGES
                    
                    //---DTO CHARGES
                    dto_charges = 0;
                    if(order_type == 1 && logistic_id == 3)//FOR DTO Order Delhivery
                    {
                        dto_charges += Math.round((((final_fwd_charges + final_fwd_per_charges)*25)/100),2); //fwd charges 25%
                        
                    }
                    if(order_type == 1 && logistic_id == 5)//FOR DTO Order Ecom Express
                    {
                        dto_charges += Math.round(((billable_weight_in_kg * 2) *  100),2); //fwd charges add 100 rs
                    }
                   
                    return_array[rate_column_key]['itl_dto_charges'] = dto_charges;
                    //---DTO CHARGES
                    
                    //---COD CHARGES
                    final_cod_charges = 0;
                    if(payment_type == 'cod' && order_type == 0 )//only if orders are in fwd
                    {
                        final_cod_charges += logistics_cod;
                        calc_cod_per = (product_mrp * logistics_cod_per) / 100;         
                        if(calc_cod_per > logistics_cod)//get maximum between cod and cod%
                        {
                            final_cod_charges = calc_cod_per;                         //---COD CHARGES
                        }
                    }
                    return_array[rate_column_key]['itl_cod_charge'] = final_cod_charges;
                    //---COD CHARGES
                    
                    //---RTO CHARGES
                
                    calc_rto_add_charges = final_rto_charges =  final_rto_per_charges = calc_rto_half_kg =  0;
                    return_array[rate_column_key]['itl_rto_half_kg'] = 0;
                    if(order_type == 2)//for RTO Delivered
                    {
                        
                        if(logistic_id == 6 || logistic_id == 5)//for ecom->rto same as fwd
                        {
                            
                            calc_rto_half_kg       += logistics_fwd;
                            calc_rto_add_charges   += calc_fwd_add_charges;
                            final_rto_charges      += calc_rto_half_kg + calc_rto_add_charges;   //---RTO CHARGES
                            final_rto_per_charges  += (final_rto_charges*logistics_fsc_per) / 100;     //---RTO FSC PERCENTAGE CHARGES
                        }
                        else
                        {
                            if(logistics_rto > 0)//if rto half kg slab is present
                            {
                                
                                calc_rto_half_kg += logistics_rto;
                            }
                            
                            
                            new_form = Math.ceil(((billable_weight_in_kg - rate_slab_type)/multiply_factor)/multiply_factor) * multiply_factor; 
                            new_form = Math.ceil(((billable_weight_in_kg - rate_slab_type)/multiply_factor)/1); 
                           
                            // echo billable_weight_in_kg.' - '.rate_slab_type. ' / '.multiply_factor;
                            // echo new_form;die;
                            calc_rto_add_charges += new_form*logistics_rto_additional;
                            
                           
                            // if(logistic_id == 2 && logistics_rto_additional > 0)//if rto add half kg slab is present
                            // {
                            //     if(logistic_id == '2' and logistics_service_type == 6 and temp_billable_weight > 2)//two kg
                            //     {
                                   
                            //         //calc_rto_add_charges += ((temp_billable_weight * 0.5)-1)*logistics_rto_additional;
                            //         calc_rto_add_charges += ((temp_billable_weight * multiply_factor)-1)*logistics_rto_additional;
                            //     }
                            //     if(logistic_id == '2' and (logistics_service_type == 5 || logistics_service_type == 4) and billable_weight_in_kg > 0.5)//half kg
                            //     {
                            //       //calc_rto_add_charges += ((billable_weight * 2)-1)*logistics_rto_additional;
                            //       calc_rto_add_charges += ((billable_weight_in_kg * multiply_factor)-1)*logistics_rto_additional;
                            //     }
                            // }
                            // elseif((logistic_id == 3 || logistic_id == 1))
                            // {
                            //     if(billable_weight_in_kg > 0.5)
                            //     {
                            //         calc_rto_add_charges += ((billable_weight * 2)-1)*logistics_rto;
                            //     }
                            // }
                            
                            
                            final_rto_charges      += calc_rto_half_kg + calc_rto_add_charges;   //---RTO CHARGES
                            final_rto_per_charges  += (final_rto_charges*logistics_rto_fsc_per) / 100;     //---RTO FSC PERCENTAGE CHARGES
                        }
                        
                        
                        return_array[rate_column_key]['itl_rto_half_kg'] = calc_rto_half_kg;
                        total_rto_amount_val       = final_fwd_charges + final_fwd_per_charges +final_rto_charges + final_rto_per_charges;
                        
                        
                    }
                    
                    return_array[rate_column_key]['itl_rto_additional_half_kg'] = calc_rto_add_charges;
                    return_array[rate_column_key]['itl_rto_fsc_per'] = final_rto_per_charges;
                    
                    final_invoice_amount_without_gst = final_fwd_charges + final_fwd_per_charges + final_cod_charges + final_rto_charges + final_rto_per_charges + dto_charges;
                    
                    return_array[rate_column_key]['itl_bill_without_gst'] = final_invoice_amount_without_gst;
                
                    //---RTO CHARGES
                    //---GST
                    final_invoice_amount_with_cgst = final_invoice_amount_with_sgst = final_invoice_amount_with_igst = 0;
                    cgst =rate_data_value['cgst'];
                    sgst =rate_data_value['sgst'];
                    igst =rate_data_value['igst'];
                    
                    if(cgst == 1)
                    {
                        final_invoice_amount_with_cgst       += (final_invoice_amount_without_gst * 9)/100;
                    }
                    if(sgst == 1)
                    {
                        final_invoice_amount_with_sgst       += (final_invoice_amount_without_gst * 9)/100;
                    }
                    if(igst == 1)
                    {
                        final_invoice_amount_with_igst       += (final_invoice_amount_without_gst * 18)/100;
                    }
                    return_array[rate_column_key]['itl_bill_cgst'] = final_invoice_amount_with_cgst;
                    return_array[rate_column_key]['itl_bill_sgst'] = final_invoice_amount_with_sgst;
                    return_array[rate_column_key]['itl_bill_igst'] = final_invoice_amount_with_igst;
                    
                    final_invoice_amount_with_gst = final_invoice_amount_without_gst + final_invoice_amount_with_cgst + final_invoice_amount_with_sgst + final_invoice_amount_with_igst;
                    return_array[rate_column_key]['itl_bill_with_gst'] = Math.round(final_invoice_amount_with_gst,2);
                    //---GST
                    if(return_array[rate_column_key]['itl_bill_with_gst'] == 0 || (logistic_id != '3' && logistic_id != '5' && billing_rto_status == 1))
                    {
                        return_array[rate_column_key]['itl_bill_with_gst'] = 'NA';
                    }
                }
            }
        }
        else
        {
            //check if zone f
        }
        for (const value of return_array) 
        {
        
            minimum_slab_rate[rate_slab_type] = value['itl_bill_with_gst'];
            minimum_slab_rate_val = value['itl_bill_with_gst'];
        }
        minimum_slab_rate_val = Math.min(minimum_slab_rate_val);
        
        minimum_slab_rate_key = array_keys(minimum_slab_rate,minimum_slab_rate_val)[0];
       
        return return_array[minimum_slab_rate_key];
        //return return_array;
    }

    function calculate_billing_rate(user_id =  0,billable_weight,zone,logistic_id,logistics_service_type='',billing_rto_status,order_type,product_mrp)
    {
        
        check_weight =  (billable_weight /0.5);
        if(containsDecimal(check_weight))
        {
            billable_weight = Math.round(billable_weight,0.5);
        }
        
        return_array = [];
        //get rat chart
        get_rate_query         = "SELECT * from  rate_card where user_id = 'user_id' and is_deleted = 0";
        result_rate_query      = JSON.parse( await view_order_model.commonSelectQuery( get_rate_query));
        all_rate_array         = [];
        for (const row_rate_query of result_rate_query)
        {
            all_rate_array     = row_rate_query;
        }
       
        
       
        if(logistic_id > 0)
        {
            logistic_name_array            = //array(1=>'xpressbees',2=>'fedex',3=>'delhivery',4=>'aramex',5=>'ecom',6=>'ekart',7=>'bluedart',8=>'shadowfax');
            logistic_name              = logistic_name_array[logistic_id];

            //check if zone f client
      
            if(logistic_id == 3 && all_rate_array[logistic_name+'_zone_f_fwd_half_kg'+sub_zone_column] > 0)
            {
                zone = 'f';
            }
            if(logistic_id == 6 && all_rate_array[logistic_name+'_zone_f_fwd'] > 0)
            {
                zone = 'f';
            }
            sub_zone_column = ''; 
            zone_value                 = explode('-',zone);
            zone_name                  = trim(strtolower(zone_value[0]));
            sub_zone                   = trim(strtolower(zone_value[1]));
            if(sub_zone != '')
            {
                sub_zone_column = '_'.sub_zone;
            }
            fwd_half_kg                = all_rate_array[logistic_name+'_zone_'+zone_name+'_fwd_half_kg'+sub_zone_column];
            fwd_additional_half_kg     = all_rate_array[logistic_name+'_zone_'+zone_name+'_fwd_additional_half_kg'+sub_zone_column];
            fsc_per                    = all_rate_array[logistic_name+'_zone_'+zone_name+'_fsc_per'+sub_zone_column];
            cod                        = all_rate_array[logistic_name+'_zone_'+zone_name+'_cod'+sub_zone_column];
            cod_per                    = all_rate_array[logistic_name+'_zone_'+zone_name+'_cod_per'+sub_zone_column];
            rto_half_kg                = all_rate_array[logistic_name+'_zone_'+zone_name+'_rto_half_kg'+sub_zone_column];
            rto_additional_half_kg     = all_rate_array[logistic_name+'_zone_'+zone_name+'_rto_additional_half_kg'+sub_zone_column];
            rto_fsc_per                = all_rate_array[logistic_name+'_zone_'+zone_name+'_rto_fsc_per'+sub_zone_column];
            
            if(logistic_id == '6')
            {
                ekart_servicetype          = all_rate_array['ekart_servicetype'];
                fwd_half_kg                = all_rate_array[logistic_name+'_zone_'+zone_name+'_fwd'];
                fwd_additional_half_kg     = all_rate_array[logistic_name+'_zone_'+zone_name+'_fwd_additional'];
                cod                        = all_rate_array[logistic_name+'_zone_'+zone_name+'_cod'];
                cod_per                    = all_rate_array[logistic_name+'_zone_'+zone_name+'_cod_per'];
                rto_half_kg                = all_rate_array[logistic_name+'_zone_'+zone_name+'_rto'];
                rto_additional_half_kg     = all_rate_array[logistic_name+'_zone_'+zone_name+'_rto_additional'];
                fsc_per     = 0;
                rto_fsc_per = 0;
            }
            else if(logistic_id == '2' && (logistics_service_type == 4 || logistics_service_type == 5))//for fedex standarrd and priortiy
            {
                //fedex_ecom_two_fwd_half_kg
                //fedex_ecom_fwd_half_kg
                
                fwd_half_kg                = all_rate_array[logistic_name+'_ecom_fwd_half_kg'];
                fwd_additional_half_kg     = all_rate_array[logistic_name+'_ecom_fwd_additional_half_kg'];
                fsc_per                    = all_rate_array[logistic_name+'_ecom_fsc_per'];
                cod                        = all_rate_array[logistic_name+'_ecom_cod'];
                cod_per                    = all_rate_array[logistic_name+'_ecom_cod_per'];
                rto_half_kg                = all_rate_array[logistic_name+'_ecom_rto_half_kg'];
                rto_additional_half_kg     = all_rate_array[logistic_name+'_ecom_rto_additional_half_kg'];
                rto_fsc_per                = all_rate_array[logistic_name+'_ecom_rto_fsc_per'];
                
            }
            else if(logistic_id == '2' && logistics_service_type == 6)//for fedex gMath.round
            {
                //fedex_ecom_two_fwd_half_kg
                //fedex_ecom_fwd_half_kg
                 
                fwd_half_kg                = all_rate_array[logistic_name+'_ecom_two_fwd_half_kg'];
                fwd_additional_half_kg     = all_rate_array[logistic_name+'_ecom_two_fwd_additional_half_kg'];
                fsc_per                    = all_rate_array[logistic_name+'_ecom_two_fsc_per'];
                cod                        = all_rate_array[logistic_name+'_ecom_two_cod'];
                cod_per                    = all_rate_array[logistic_name+'_ecom_two_cod_per'];
                rto_half_kg                = all_rate_array[logistic_name+'_ecom_two_rto_half_kg'];
                rto_additional_half_kg     = all_rate_array[logistic_name+'_ecom_two_rto_additional_half_kg'];
                rto_fsc_per                = all_rate_array[logistic_name+'_ecom_two_rto_fsc_per'];
                
            }
            cgst                       = all_rate_array['cgst'];
            sgst                       = all_rate_array['sgst'];
            igst                       = all_rate_array['igst'];
            //---FWD CHARGES
            calc_fwd_add_charges = final_fwd_charges =  final_fwd_per_charges = 0;
            temp_billable_weight = Math.round(billable_weight);
            if(logistic_id == '2' && logistics_service_type == 6)//for fedex gMath.round
            {
                if(temp_billable_weight % 2)
                {
                    temp_billable_weight = temp_billable_weight + 1;
                }
                if(billable_weight > 2)
                {
                    calc_fwd_add_charges += ((temp_billable_weight * 0.5)-1)*fwd_additional_half_kg;
                }
            }
            else if(logistic_id == '6' && ekart_servicetype == 1)
            {
                if(billable_weight > 1)//1.5
                {
                   calc_fwd_add_charges += ((temp_billable_weight * 1)-1)*fwd_additional_half_kg;
                }
            }
            else
            {
                if(billable_weight > 0.5)
                {
                    calc_fwd_add_charges += ((billable_weight * 2)-1)*fwd_additional_half_kg;
                }
            }
            
            final_fwd_charges      += fwd_half_kg + calc_fwd_add_charges;    //---FWD CHARGES
            
            if(strtolower(zone_name) == 'f')
            {
                final_fwd_charges = temp_billable_weight*fwd_half_kg;
            }
            
            final_fwd_per_charges  += (final_fwd_charges*fsc_per) / 100;     //---FWD FSC PERCENTAGE CHARGES

          
            
            return_array['itl_half_kg']            = fwd_half_kg;
            return_array['itl_additional_half_kg'] = calc_fwd_add_charges;
            return_array['itl_fsc_per']            = final_fwd_per_charges;
            if(billing_rto_status == 0)
            {
                total_freight_amount_val  = final_fwd_charges+final_fwd_per_charges;     
                total_freight_amount[user_id]   = total_freight_amount_val;    
            }
            
            //---FWD CHARGES
            
            //---COD CHARGES
            final_cod_charges = 0;
            if(order_type == 'cod' && billing_rto_status == 0 && strtolower(zone_name) != 'f')//only if orders are in fwd
            {
                final_cod_charges += cod;
                calc_cod_per = (product_mrp * cod_per) / 100;         
                if(calc_cod_per > cod)//get maximum between cod and cod%
                {
                    final_cod_charges = calc_cod_per;                         //---COD CHARGES
                }
            }
            return_array['itl_cod_charge'] = final_cod_charges;
            //---COD CHARGES
            
            //---RTO CHARGES
            
            calc_rto_add_charges = final_rto_charges =  final_rto_per_charges = calc_rto_half_kg =  0;
            return_array['itl_rto_half_kg'] = 0;
            if(billing_rto_status == 1)//for RTO Delivered
            {
                
                if( (logistic_id == 6 || logistic_id == 5) && ( user_id != '55') && strtolower(zone_name) != 'f')//for ecom->rto same as fwd
                {
                    
                    calc_rto_half_kg     += fwd_half_kg;
                    calc_rto_add_charges += calc_fwd_add_charges;
                    final_rto_charges      += calc_rto_half_kg + calc_rto_add_charges;   //---RTO CHARGES
                    final_rto_per_charges  += (final_rto_charges*fsc_per) / 100;     //---RTO FSC PERCENTAGE CHARGES
                }
                else
                {
                    if(rto_half_kg > 0 && strtolower(zone_name) != 'f')//if rto half kg slab is present
                    {
                        
                        if(logistic_id == '2' && logistics_service_type == 6)
                        {
                            calc_rto_half_kg += rto_half_kg;
                        }
                        else if(logistic_id == '2' && (logistics_service_type == 5 || logistics_service_type == 4))
                        {  
                            calc_rto_half_kg += rto_half_kg;
                        }
                        else
                        {
                            calc_rto_half_kg += rto_half_kg;
                            //calc_rto_half_kg += (billable_weight /0.5)*rto_half_kg;
                        }
                        
                    }
                    
                   
                    if(logistic_id == 2 && rto_additional_half_kg > 0 && strtolower(zone_name) != 'f')//if rto add half kg slab is present
                    {
                        if(logistic_id == '2' && logistics_service_type == 6 && temp_billable_weight > 2)//two kg
                        {
                           
                            calc_rto_add_charges += ((temp_billable_weight * 0.5)-1)*rto_additional_half_kg;
                        }
                        if(logistic_id == '2' && (logistics_service_type == 5 || logistics_service_type == 4) && billable_weight > 0.5)//half kg
                        {
                           calc_rto_add_charges += ((billable_weight * 2)-1)*rto_additional_half_kg;
                        }
                    }
                    else if(logistic_id == 5 && billable_weight > 0.5 && rto_additional_half_kg > 0)
                    {
                        if(user_id == 55)//gymx
                        {
                            calc_rto_add_charges += ((billable_weight * 2)-1)*rto_additional_half_kg;
                        }
                    }
                    else if((logistic_id == 3 || logistic_id == 1) && strtolower(zone_name) != 'f')
                    {
                        if(billable_weight > 0.5)
                        {
                            calc_rto_add_charges += ((billable_weight * 2)-1)*rto_half_kg;
                        }
                    }
                    
                    
                    final_rto_charges      += calc_rto_half_kg + calc_rto_add_charges;   //---RTO CHARGES
                    final_rto_per_charges  += (final_rto_charges*rto_fsc_per) / 100;     //---RTO FSC PERCENTAGE CHARGES
                }
                
                
                return_array['itl_rto_half_kg'] = calc_rto_half_kg;
                total_rto_amount_val       = final_fwd_charges + final_fwd_per_charges +final_rto_charges + final_rto_per_charges;
                
                
            }
            
                return_array['itl_rto_additional_half_kg'] = calc_rto_add_charges;
                return_array['itl_rto_fsc_per'] = final_rto_per_charges;
            

            final_invoice_amount_without_gst = final_fwd_charges + final_fwd_per_charges + final_cod_charges + final_rto_charges + final_rto_per_charges + docket_chrg;
            
            return_array['itl_bill_without_gst'] = final_invoice_amount_without_gst;
        
            //---RTO CHARGES
            //---GST
            final_invoice_amount_with_cgst = final_invoice_amount_with_sgst = final_invoice_amount_with_igst = 0;

            
            if(cgst == 1)
            {
                final_invoice_amount_with_cgst       += (final_invoice_amount_without_gst * 9)/100;
            }
            if(sgst == 1)
            {
                final_invoice_amount_with_sgst       += (final_invoice_amount_without_gst * 9)/100;
            }
            if(igst == 1)
            {
                final_invoice_amount_with_igst       += (final_invoice_amount_without_gst * 18)/100;
            }
            return_array['itl_bill_cgst'] = final_invoice_amount_with_cgst;
            return_array['itl_bill_sgst'] = final_invoice_amount_with_sgst;
            return_array['itl_bill_igst'] = final_invoice_amount_with_igst;


            final_invoice_amount_with_gst = final_invoice_amount_without_gst + final_invoice_amount_with_cgst + final_invoice_amount_with_sgst + final_invoice_amount_with_igst;
            return_array['itl_bill_with_gst'] = Math.round(final_invoice_amount_with_gst,2);
            //---GST
        }
        if(return_array['itl_bill_with_gst'] == 0 || (logistic_id != '3' && logistic_id != '5' && billing_rto_status == 1))
        {
            return_array['itl_bill_with_gst'] = 'NA';
        }
        return return_array;
    }
    function explode(value,zone)
    {
        
            // Function to split string
            var string = zone.split(value);
              
            return string;
       
    }
    function trim(str) {
      
        var trimContent = str.trim();
          
        return(trimContent);
    }
    function strtolower(str)
    {
        return str.toLowerCase();
    }
    function round(number, nearest){
        return number + (nearest - fmod(number, nearest));
        }
    function round(number, nearest){
        return number + (nearest - fmod(number, nearest));
        }
    function containsDecimal( value )
    {
        if ( strpos( value, "." ) !== false )
        {
            return true;
        }
        return false;
    }
    function define_zone(source_pincode,destination_pincode)
    {
        all_zone = ecom_zone = '';
        if(strlen(source_pincode) == 6 && strlen(destination_pincode) == 6 )
        {
            //get city and state name of pincodes
            
            get_query = "SELECT * FROM `zone_pincode` WHERE pincode IN('source_pincode','destination_pincode')";
            result_get_query      = JSON.parse( await view_order_model.commonSelectQuery( get_query));
           
            for (const row_get_query of result_get_query)
            {
                if(row_get_query['pincode'] == source_pincode)
                {
                    source_state            = row_get_query['itl_state'];
                    source_ecom_state       = row_get_query['itl_state'];
                    source_ecom_city        = row_get_query['ecom_city'];
                    source_city             = row_get_query['rest_city'];
                }
                if(row_get_query['pincode'] == destination_pincode)
                {
                    destination_state            = row_get_query['itl_state'];
                    destination_ecom_state       = row_get_query['itl_state'];
                    destination_ecom_city        = row_get_query['ecom_city'];
                    destination_city             = row_get_query['rest_city'];
                }
            }
            //get zone defination

            if(source_ecom_city != '' && source_city != '' && destination_ecom_city != '' && destination_city != '')
            {
                zone_defination = [];
                get_query = "SELECT * FROM `zone_defination` WHERE city IN('source_ecom_city','source_city','destination_ecom_city','destination_city')";
                result_get_query      = JSON.parse( await view_order_model.commonSelectQuery( get_query));
              
                for (const row_get_query of result_get_query)
                {
                    zone_defination[row_get_query['city']]['metro'] = row_get_query['metro'];
                    zone_defination[row_get_query['city']]['ne']    = row_get_query['ne'];
                }

                all_zone = ecom_zone = 'D';//DEFAULT ZONE D
                
                //FOR NON-ECOM ZONES
                if(source_city == destination_city)
                {
                    all_zone = 'A';
                }
                else if(source_state == destination_state)
                {
                    all_zone = 'B';
                }else if(zone_defination[source_city]['metro'] == 1 && zone_defination[destination_city]['metro'] == 1)
                {
                    all_zone = 'C';
                }
                else if(zone_defination[destination_city]['ne'] == 1 || zone_defination[source_city]['ne'] == 1)
                {
                    all_zone = 'E';
                }

                //FOR ECOM ZONES
                
                if(source_ecom_city == destination_ecom_city)
                {
                    ecom_zone = 'A';
                }else if(source_ecom_state == destination_ecom_state)
				
                {
                    ecom_zone = 'B';
                }else if(zone_defination[source_ecom_city]['metro'] == 1 && zone_defination[destination_ecom_city]['metro'] == 1)
                {
                    ecom_zone = 'C';
                }
                else if(zone_defination[destination_ecom_city]['ne'] == 1 || zone_defination[source_ecom_city]['ne'] == 1)
                {
                    ecom_zone = 'E';
                }
                if(ecom_zone == 'B' || ecom_zone == 'D' || ecom_zone == 'E')
                if(strpos(destination_ecom_city,'_ros') > 0)
                {
                    ecom_zone = ecom_zone+'-ROS';
                }
            }
        }
        rreturn = {};
        rreturn['all_zone'] = all_zone;
        rreturn['ecom_zone'] = ecom_zone;
        return rreturn;
    }

function check_pincode_serviceability_onboard(destination_pincode,source_pincode,payment_mode,is_reverse)
{
    var system_data = [];
    
    
    //check pincode service for delhivery
    var non_service_pincode_array = [];
    
    
    if(destination_pincode != '')
    {
        all_pincode_list = destination_pincode;
        
        
        if(is_reverse == 0  )//check blocking of pincodes
        {
            get_nonservice_pincode_query              = "select * from not_servicable_pincodes where  pincode = 'destination_pincode' and is_deleted = '0'";
            result_get_nonservice_pincode_query       = JSON.parse( await view_order_model.commonSelectQuery(  get_nonservice_pincode_query));
            for (const row_get_nonservice_pincode_query of result_get_nonservice_pincode_query) 
            {
                non_service_pincode = row_get_nonservice_pincode_query['pincode'];
                logistic_id         = row_get_nonservice_pincode_query['logistic_id'];
                non_service_pincode_array[logistic_id] = non_service_pincode;
            }
        }

        /*get_area_code = "select area_code from pincode_table where logistics_id = '7' and pincode = 'source_pincode'";
        result_query = JSON.parse( await view_order_model.commonSelectQuery(  get_area_code);
	    row_get_areacode_query = mysqli_fetch_assoc(result_query);
	    bluedart_not_serviceable = 0;
	    vendor_area_code = row_get_areacode_query['area_code'];
	    if(!in_array(strtoupper(vendor_area_code),array('BOM','BLR','BDI','SUR','DEL','BKN','SWD','SLP','BLR','MAA','HOG','LNV','AGR','NBM','TRP','AHD','BCT','CJB','JAI','GGN','ULU','PWL','VAP','RJK','BHO','NVS','HYD','CAR','JRD','PNQ')))
	    {
	        bluedart_not_serviceable = 1;
		}*/

        //start get areacode added by sudarshan 26-7-2021    
            get_area_code  = "select area_code from pincode_table where pincode = 'source_pincode' and logistics_id = '7' and pickup_delivery IN ('P','P_D') and is_deleted = 0 ";
            result_query   = JSON.parse( await view_order_model.commonSelectQuery(  get_area_code));
            total_num_rows = result_query.length;
            bluedart_not_serviceable = 0;
            if(total_num_rows == 0)
            {
                bluedart_not_serviceable   = 1;   
            }
        //end get areacode added by sudarshan 26-7-2021


        if(is_reverse == 1)
        {
             get_pincode_query              = "select * from pincode_table where pincode = 'destination_pincode' and is_deleted = 0 and logistics_id IN (3,5)";
        }
        else
        {
             get_pincode_query              = "select * from pincode_table where pincode = 'destination_pincode' and is_deleted = 0";
        }
        
        result_get_pincode_query       = JSON.parse( await view_order_model.commonSelectQuery(  get_pincode_query));
        for (const row_get_pincode_query of result_get_pincode_query) 
        
        {
            logistics_id = row_get_pincode_query['logistics_id'];
            pincode = row_get_pincode_query['pincode'];
            if(!non_service_pincode_array[logistics_id].includes(pincode))
            {
                if(is_reverse == 0 && strtolower(payment_mode) == 'cod' && row_get_pincode_query['is_cod_available'] == 1 && strpos(row_get_pincode_query['pickup_delivery'] , 'D') !== false)//for fwd order-> check if delivered
                {
                    system_data[row_get_pincode_query['pincode']] = logistics_id;
                }
                else if(is_reverse == 0 && strtolower(payment_mode) == 'prepaid' &&  strpos(row_get_pincode_query['pickup_delivery'] , 'D') !== false)//for fwd order-> check if delivered
                {
                    system_data[row_get_pincode_query['pincode']] = logistics_id;
                }
                else if(is_reverse == 1 && row_get_pincode_query['is_cod_available'] == 1 && strpos(row_get_pincode_query['pickup_delivery'] , 'P') !== false)//for rev order-> check if pickup
                {
                    system_data[row_get_pincode_query['pincode']] = logistics_id;
                }
            }
            
        }
        
        if(bluedart_not_serviceable == 1)
        {
            forEach((values, pincode_key, system_data) =>
            {
                let difference = arr1.filter(x => !arr2.includes(x));
                system_data[pincode_key] =  array_values(array_diff(values, array(7)));
            });
            
        }
        //delhivery reverse order
       
        
        // shadowfax_service_array = [];
        
        // pincode_response_array = shadowfax_pincode_api(source_pincode,destination_pincode,token,type = 0); 
        // if(count(pincode_reponse_data)>0 && strtolower(pincode_reponse_data['message']) == 'success')
        // {
            
        //     if(pincode_reponse_data['data']['serviceability'] == 'true')
        //     {
        //         shadowfax_service_array[]  = destination_pincode;
        //     }
            
        // }
        
        
        delhivery_service_array = [];
       
        pincode_response_array = delhivery_pincode_api(destination_pincode, delhivery_token_live);
        
        if (count(pincode_response_array['delivery_codes']) > 0)
        {
            for(pincode_response_data of pincode_response_array['delivery_codes'])
            {
                logistics_id = 3;
                pincode     = pincode_response_data['postal_code']['pin'];
                cod         = pincode_response_data['postal_code']['cod'];
                pickup      = pincode_response_data['postal_code']['repl'];
                prepaid     = pincode_response_data['postal_code']['prepaid'];
                if(! non_service_pincode_array[logistics_id].includes(pincode))
                {
                    delhivery_service_array[pincode]['cod'] = cod;
                    delhivery_service_array[pincode]['prepaid'] = cod;
                    delhivery_service_array[pincode]['rev_pickup'] = pickup;
                    
                }
            }
        } 
    }
   
    return_data = [];
    
    order_type = strtolower(payment_mode);
    pincode    = destination_pincode;
    serviceability_list =  [];
   
    if(array_key_exists(pincode,system_data))
    {
        serviceability_list = array_values(system_data[pincode]);
    }
    
    // if(array_key_exists(pincode,shadowfax_service_array))
    // {
    //      serviceability_list[] = 8;
    // }
    if(array_key_exists(pincode,delhivery_service_array))
    {
        
        if(is_reverse == 0)
        {
            if(order_type == 'cod' && delhivery_service_array[pincode]['cod'] == 'Y')
            {
                serviceability_list = 3;
            }
            if(order_type == 'prepaid' && delhivery_service_array[pincode]['prepaid'] == 'Y')
            {
                serviceability_lis = 3;
            }
        }
        else if(is_reverse == 1 && delhivery_service_array[pincode]['rev_pickup'] == 'Y')
        {
            
            serviceability_list = 3;
        }
        
    }
   
    foreach(serviceability_list as value)
    {
        
        if(value == 2)
        {
            serviceability_listnew = 'fedex_ground';
            serviceability_listnew = 'fedex_standard';
            serviceability_listnew = 'fedex_priority';
        }
        else
        {
            serviceability_listnew = strtolower(str_replace(' ','',get_logistic_name(value)['logname']));
        }
        
    }
    return_data = serviceability_listnew;
    return return_data;
}

function strpos(arr,value){
    if(arr.indexOf(value))
    {
        return true;
    }
    else
    {
        return false;
    }
}

function str_replace(present_value, replace_value,string)
{
    string.replace(present_value, replace_value);
}