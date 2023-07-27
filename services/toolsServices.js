const validator = require('validator');
const bcrypt = require('bcryptjs');
var express = require('express');
var mysqlpool = require('../dbconfig');
const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');
const billing = require('../models/toolsModel');
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
const { setTimeout } = require('timers');
const { DiffieHellman } = require('crypto');

function strtolower(str)
    {
        return str.toLowerCase();
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
function trim(str) {
      
    var trimContent = str.trim();
      
    return(trimContent);
}
function explode(value,zone)
    {
        
            // Function to split string
            var string = zone.split(value);
              
            return string;
       
    }
function str_replace(present_value, replace_value,string)
    {
        return string.replace(present_value, replace_value);
    }
function array_filter(str)
{

}   
function implode(str,arr)
{
    return arr.join(str);
}

async function get_not_serviceable_pincode1(logistic_id,pincode_list)
{
    var fn_pincode_list = trim(str_replace('/\s+/','', pincode_list).toString());
	var logistic_id     = trim(logistic_id.toString());
	
	var fn_pincode_array = explode(',',fn_pincode_list);
	var pincode_table_array = [];
    var pincode_data_q;
    var row_pincode_data_q;
    var pincode_data_count;
	if(fn_pincode_array.length > 0)
	{
	    fn_pincode_list = implode("','",fn_pincode_array);
		pincode_data_q = `SELECT pincode, cod, prepaid,pickup 
    					 FROM not_servicable_pincodes 
    					 WHERE pincode IN ('`+fn_pincode_list+`') 
    					 AND is_deleted = 0 and logistic_id = `+logistic_id;
		row_pincode_data_q 	= JSON.parse(await billing.commonSelectQuery(pincode_data_q));
		pincode_data_count 	= row_pincode_data_q.length;
		
		var db_pincode;
        var db_is_cod_blocked;
        var db_is_prepaid_blocked;
        var db_is_pickup_blocked;
		if(pincode_data_count > 0)
		{
			
            for (const pincode_data_fetch of row_pincode_data_q) 
            {
				db_pincode 		     = pincode_data_fetch['pincode'];
				db_is_cod_blocked       = pincode_data_fetch['cod'];
				db_is_prepaid_blocked 	 = pincode_data_fetch['prepaid'];
				db_is_pickup_blocked 	 = pincode_data_fetch['pickup'];
                if(db_is_cod_blocked == 0 )
				{
					pincode_table_array['cod'] = 'N';
				}
				if(db_is_prepaid_blocked == 0 )
				{
					pincode_table_array['prepaid'] = 'N';
				}
				if(db_is_pickup_blocked == 0 )
				{
					pincode_table_array['pickup'] = 'N';
				}
			}
        }
		
		return pincode_table_array;
    }
}
function array_keys1(array_keys)
{
    console.log(array_keys)
    ;
    return Object.keys(array_keys);
}
function diffArray(arr1, arr2) {
    console.log (arr2);
    return arr1.concat(arr2).filter(item => !arr1.includes(item) || !arr2.includes(item));
    }
async function get_pincode_table_data1(logistic_id,pincode_list)
{
	var fn_pincode_list = trim(str_replace('/\s+/','', pincode_list).toString());
	var logistic_id     = trim(logistic_id.toString());
	
	var fn_pincode_array = explode(',',fn_pincode_list);
	var pincode_table_array = [];
    var db_pincode_exists = [];
    var pincode_data_q;
    var row_pincode_data_q;
    var pincode_data_count;
    var db_pincode_not_exists;
    console.log("done1");
	if(fn_pincode_array.length > 0)
	{
	    fn_pincode_list = implode("','",fn_pincode_array);
		pincode_data_q = `SELECT pincode, pickup_delivery, is_cod_available 
    					 FROM pincode_table 
    					 WHERE pincode IN ('`+fn_pincode_list+`') 
    					 AND is_deleted = 0 and logistics_id = 3`;
                         console.log(pincode_data_q);
		row_pincode_data_q 	= JSON.parse(await billing.commonSelectQuery(pincode_data_q));
        setTimeout(function(){  }, 3000);
		pincode_data_count 	= row_pincode_data_q.length;
		console.log(row_pincode_data_q)
		
		if(pincode_data_count > 0)
		{
            for (const pincode_data_fetch of row_pincode_data_q) 
            {
				var db_pincode 		 = pincode_data_fetch['pincode'];
				var db_is_cod_available = pincode_data_fetch['is_cod_available'];
				var pickup_delivery 	 = pincode_data_fetch['pickup_delivery'];

				pincode_table_array['cod'] 	  = 'N';
				pincode_table_array['prepaid'] = 'N';
				pincode_table_array['pickup']  = 'N';
                console.log(pincode_table_array);
				if(db_is_cod_available == 1 && (strpos(pickup_delivery, 'D') !== false))
				{
					pincode_table_array['cod'] = 'Y';
				}
				if(strpos(pickup_delivery, 'D') !== false)
				{
					pincode_table_array['prepaid'] = 'Y';
				}
				if(strpos(pickup_delivery, 'P') !== false)
				{
					pincode_table_array['pickup'] = 'Y';
				}
			}

			db_pincode_exists = array_keys1(pincode_table_array);
			
		}
		db_pincode_not_exists = diffArray(fn_pincode_array,db_pincode_exists);
        console.log(db_pincode_not_exists)
		if(db_pincode_not_exists.length > 0)
		{
			
            for (const value of db_pincode_not_exists) 
            {
                console.log(value);
			    pincode_table_array['cod'] 	='N';
				pincode_table_array['prepaid'] = 'N';
				pincode_table_array['pickup']  = 'N';
			}
		}
		return pincode_table_array;
    }
}

async function pincode_from_to_serviceability_v2(from_pincode,to_pincode,logistic_id)
    {
        var fn_pincode_array 				= [];
        var pincode_input 					= from_pincode+','+to_pincode;
        var fn_pincode_list 				= trim(str_replace('/\s+/','', pincode_input).toString());
        var fn_pincode_array 				= explode(',',fn_pincode_list);
        // get_not_serviceable_pincode 	= get_not_serviceable_pincode(logistic_id,pincode_input);//commented on 14th july 2021 by shital
        var get_not_serviceable_pincode 	= await get_not_serviceable_pincode1(logistic_id,to_pincode);//added on 14th july 2021 by shital
        var get_pincode_table_data      	= await get_pincode_table_data1(logistic_id,pincode_input);
        yield sleep(300);
        console.log("get_not_serviceable_pincode")
        console.log(get_not_serviceable_pincode)
        console.log(get_pincode_table_data)
        if(get_not_serviceable_pincode.length > 0)
        {   for(value of get_not_serviceable_pincode)
            {   var key = 0;
                var cod = value['cod'];
                if(cod == 'N')
                {
                    get_pincode_table_data[key]['cod'] = 'N';
                }
                var prepaid = value['prepaid'];
                if(prepaid == 'N')
                {
                    get_pincode_table_data[key]['prepaid'] = 'N';
                }
                var pickup = value['pickup'];
                if(pickup == 'N')
                {
                    get_pincode_table_data[key]['pickup'] = 'N';
                }
                key++;
            }
        }
        
        var db_pincode_exists 		= array_keys1(get_pincode_table_data);
        var db_pincode_not_exists 	= array_diff(fn_pincode_array,db_pincode_exists);
        console.log("done 5")
        if(db_pincode_not_exists.length > 0)
        {
            
            for(value of db_pincode_not_exists)
            {
                get_pincode_table_data['cod'] 	='N';
                get_pincode_table_data['prepaid'] = 'N';
                get_pincode_table_data['pickup']  = 'N';
            }
        }
        return get_pincode_table_data;
    }
    function array_diff (a1, a2) {
        var a = [], diff = [];
        for (var i = 0; i < a1.length; i++) {
            a[a1[i]] = true;
        }
        for (var i = 0; i < a2.length; i++) {
            if (a[a2[i]]) {
                delete a[a2[i]];
            } else {
                a[a2[i]] = true;
            }
        }
        for (var k in a) {
            diff.push(k);
        }
        return diff;
    }
exports.pincode_services = async function(form_data, req, res, next) 
{
    try{
        
            var your_pincode 					= form_data.your_pincode;
            var check_pincode 					= form_data.check_pincode;
            
            //check from not_servicable_pincodes table
            // get_ser_pincode_query 				= "SELECT pincode,logistic_id from not_servicable_pincodes WHERE pincode = check_pincode and is_deleted = 0";
            // result_get_ser_pincode_query 		= JSON.parse(await billing.commonSelectQuery(get_ser_pincode_query);
            /*while (row_get_ser_pincode_query 	= mysqli_fetch_assoc(result_get_ser_pincode_query))
            {			
                all_ser_pincode_data_array[row_get_ser_pincode_query['logistic_id']][] 	= row_get_ser_pincode_query['pincode'];
            }*/
    
            var check_pincode_flag 			= 0;
            var your_pincode_flag = 0;
            var get_pincode_query 				= "SELECT l.pincode,l.itl_city,l.itl_state from  pincode_lat_long l  WHERE l.pincode IN  ('"+check_pincode+"','"+your_pincode+"')";		
            var result_get_pincode_query 		= JSON.parse(await billing.commonSelectQuery(get_pincode_query));
            var get_pincode_check_data_count   =result_get_pincode_query.length;
            var all_pincode_data_array 		= [];
            var itl_city  						= 'NA';
            var itl_state 						= 'NA';
          
            for (const row_get_pincode_query of result_get_pincode_query) 
            {
                if(row_get_pincode_query['pincode'] == check_pincode)
                {
                    check_pincode_flag = 1;
                    itl_city 	= row_get_pincode_query['itl_city'];
                    itl_state 	= row_get_pincode_query['itl_state'];
                }
                if(row_get_pincode_query['pincode'] == your_pincode)
                {
                    your_pincode_flag = 1;
                }
            }
    
            if (itl_city == '') 
            {
                itl_city  = 'NA';
            }
    
            if (itl_state == '') 
            {
                itl_state  = 'NA';
            }
    
            //get_master logistics_data
            var get_logistics_query 				= "SELECT id,logistics_name from  logistics where is_deleted = 0 and status = 1";		
            var result_get_logistics_query 		= JSON.parse(await billing.commonSelectQuery(get_logistics_query));
            var all_logistics_data_array 			= [];
            for (const row_get_logistics_query of result_get_logistics_query) 
            {
            
                all_logistics_data_array.push(row_get_logistics_query);
            }
    
            // blue bar section htmlise - START
                // var blue_bar_html_message  ='	<div class="container-body">
                //                                 <div class="row">
                //                                     <div class="serviceable-city">
                //                                         <span class="serviceability-key" >Serviceable City: </span>
                //                                         <span class="serviceability-value" >'.itl_city.'</span>
                //                                     </div>
                //                                     <div class="serviceable-state">
                //                                         <span class="serviceability-key" >Serviceable State: </span>
                //                                         <span class="serviceability-value" >'.itl_state.'</span>
                //                                     </div>
                //                                 </div>
                //                             </div>';
            // blue bar section htmlise - END
            
            // logistic section htmlise - START
            var Serviceable_City = itl_city;
            var Serviceable_State = itl_state;
            // logistic_html_message  = ' <div class="container-body"> 
            //                                 <div class="row">';
            var logistic_icon_width_lg_md_number 	= 8;
            var logistic_icon_width_sm_xs_number 	= 9;
            var logistic_label_width_lg_md_number 	= 4;
            var logistic_label_width_sm_xs_number 	= 3;
            var v_logistics_name;
            var v_logistics_image;
            var v_logistics_id;
            var return_array = {};
            var prepaid_serviceability;
            var cod_serviceability;
            var reverse_pickup_serviceability;
            var pickup_serviceability;
            var rtn_arr = [];
            for (const value of all_logistics_data_array) 
            {
                v_logistics_name   = value['logistics_name'];
                v_logistics_image  = str_replace(' ','',strtolower(value['logistics_name']));
                v_logistics_id     = value['id'];
                //echo your_pincode.' '.check_pincode.' '.v_logistics_id.PHP_EOL;
                return_array 		= pincode_from_to_serviceability_v2(your_pincode,check_pincode,v_logistics_id);
                rtn_arr.push(return_array);
                //print_R(return_array);
                console.log("done2")
                prepaid_serviceability             = return_array['prepaid'];
                cod_serviceability                 = return_array['cod'];
                reverse_pickup_serviceability      = return_array['pickup'];
                pickup_serviceability              = return_array['pickup'];
                console.log("done3")
                var prepaid_svg_img = cod_svg_img = pickup_svg_img = rev_pickup_svg_img = 'cross-point.svg';
                var prepaid_class_lable = cod_class_lable = pickup_class_lable = rev_pickup_class_lable = 'cross-point-lable';
                
                if(prepaid_serviceability == 'Y')
                {
                     prepaid_svg_img 		= 'done-point.svg';
                     prepaid_class_lable 	= '';  
                }
    
                if(cod_serviceability == 'Y')
                {
                    cod_svg_img 		= 'done-point.svg';
                    cod_class_lable 	= '';   
                }
    
                if(pickup_serviceability == 'Y')
                {
                    pickup_svg_img 	= 'done-point.svg';
                    pickup_class_lable = '';  
                }
    
                if(reverse_pickup_serviceability == 'Y')
                {
                     rev_pickup_svg_img 	= 'done-point.svg'; 
                    rev_pickup_class_lable = '';
                }
    
                if(v_logistics_name == 'Ecom Express')
                {
                    logistic_icon_width_lg_md_number 	= 7;
                    logistic_icon_width_sm_xs_number 	= 8;
                    logistic_label_width_lg_md_number 	= 5;
                    logistic_label_width_sm_xs_number 	= 4;
                }
                //var v_logistics_name = v_logistics_name;
                // rtn_arr.push({"prepaid_serviceability":prepaid_serviceability,"cod_serviceability":cod_serviceability,
                // "reverse_pickup_serviceability":reverse_pickup_serviceability,"pickup_serviceability":pickup_serviceability,
                // "v_logistics_name":v_logistics_name })
                // logistic_html_message  .= '<div class="card-parent-body fedex-card-parent-body">
                //                                 <div class="card-body">
                //                                     <div class="row">
                //                                         <div class="col-lg-'.logistic_icon_width_lg_md_number.' col-md-'.logistic_icon_width_lg_md_number.' col-sm-'.logistic_icon_width_sm_xs_number.' col-xs-'.logistic_icon_width_sm_xs_number.' left-section head-section-icon fedex-body">
                //                                             <img src="'.base_url_images.v_logistics_image.'.png" class="delivery-icon"> 
                //                                         </div> 
                //                                         <div class="col-lg-'.logistic_label_width_lg_md_number.' col-md-'.logistic_label_width_lg_md_number.' col-sm-'.logistic_label_width_sm_xs_number.' col-xs-'.logistic_label_width_sm_xs_number.' right-section head-section-icon"> 
                //                                             <p class="head"> '.v_logistics_name.' </p> 
                //                                         </div>
                //                                         <div class="col-lg-8 col-md-8 col-sm-9 col-xs-9 left-section"> <p class="'.prepaid_class_lable.'" >Pre-paid Delivery</p></div><div class="col-lg-4 col-md-4 col-sm-3 col-xs-3 right-section"><p> <img src="'.base_url_images.prepaid_svg_img.'"> </p></div>
                //                                         <div class="col-lg-8 col-md-8 col-sm-9 col-xs-9 left-section"><p class="'.cod_class_lable.'" >Cash on Delivery</p></div><div class="col-lg-4 col-md-4 col-sm-3 col-xs-3 right-section"> <p> <img src="'.base_url_images.cod_svg_img.'"> </p> </div>
                //                                         <div class="col-lg-8 col-md-8 col-sm-9 col-xs-9 left-section"> <p class="'.rev_pickup_class_lable.'" >Reverse Pickup</p> </div> <div class="col-lg-4 col-md-4 col-sm-3 col-xs-3 right-section"> <p> <img src="'.base_url_images.rev_pickup_svg_img.'"> </p> </div>
                //                                         <div class="col-lg-8 col-md-8 col-sm-9 col-xs-9 left-section"> <p class="'.pickup_class_lable.'" >Pickup</p> </div> <div class="col-lg-4 col-md-4 col-sm-3 col-xs-3 right-section"> <p> <img src="'.base_url_images.pickup_svg_img.'"> </p> </div>
                //                                     </div>
                //                                 </div>
                //                             </div>';
            }
            yield sleep(3000);
            // var logistic_html_message  .= '	</div>
            //                             </div>';
            console.log("done7")
            //return_array["blue_bar_html_message"] 	= blue_bar_html_message;
            //return_array["html_message"] 			= logistic_html_message;
            //return_array["your_pincode_flag"]    	= your_pincode_flag;
            //return_array["check_pincode_flag"]   	= check_pincode_flag;
            //return_array["count"] 					= get_pincode_check_data_count;
            //return_array["status"] 					= "success";
            //echo json_encode(return);
            //exit();
            res.status(200).json({
                status_code : 200,
                status: 'success',
                v_logistics_name : v_logistics_name,
                all_logistics_data_array: all_logistics_data_array,
                your_pincode_flag: your_pincode_flag,
                check_pincode_flag: check_pincode_flag,
                count:  get_pincode_check_data_count,
                result_get_pincode_query: result_get_pincode_query,
                get_pincode_check_data_count: get_pincode_check_data_count,
                array:rtn_arr
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
  
};

exports.calculate_rate_chart = async function(form_data, req, res, next) 
{  
    var userdata = [];
        var post_order_type            = form_data.order_type;
        var post_payment_mode          = form_data.payment_mode;
        var post_pickup_pincode        = form_data.pickup_pincode;
        var post_destination_pincode   = form_data.destination_pincode;
        var post_length                = form_data.length;
        var post_width                 = form_data.width;
        var post_height                = form_data.height;
        var post_weight                = form_data.weight;
        var post_user_id               = form_data.user_id;
        var post_product_mrp           = form_data.product_mrp;
        
           
        var post_search_client_name    = form_data.search_client_name;
        var post_search_client_id      = form_data.search_client_id;

        var vendor_id                  = post_search_client_id;
            if (post_search_client_id == '') 
            {
                vendor_id              = post_user_id;
            }
        
        
        var volumentric_weight     = round(((post_length * post_width * post_height)/5000),3);
        var billable_weight = max(post_weight,volumentric_weight);
            
        var zone = define_zone_new(post_pickup_pincode,post_destination_pincode);
        var parameter_array = {};
        parameter_array['user_id']         = vendor_id;
        parameter_array['billable_weight'] = billable_weight;
        parameter_array['zone']            = zone;
        parameter_array['order_type']      = post_order_type;
        parameter_array['payment_type']    = post_payment_mode;
        parameter_array['product_mrp']     = post_product_mrp;

        var vendor_logistics = getVendorLogistics(vendor_id);
        
        if(vendor_logistics != '')
        {   
            vendor_logistics        = str_replace('2_4', '2', vendor_logistics);
            vendor_logistics        = str_replace('2_6', '2', vendor_logistics);
            vendor_logistics        = str_replace('2_5', '2', vendor_logistics);
            
            var vendor_logistics_array = explode(',',vendor_logistics);
            var rate_chart = [];
            
            is_reverse = 1;
            if (post_order_type == 0 || post_order_type == 2 )
            {
                is_reverse = 0;
            }
            if(vendor_logistics == 3)
            {
                
            }
            var return_array = {};
            rate_chart = getRateChart(vendor_id,vendor_logistics,is_reverse,parameter_array);
            
            return_array["pincode_service_response_data"]    = '';
            return_array["billing"]                          = '';
            return_array["billing_html"]                     = buildHtmlSection(rate_chart,base_url_images,parameter_array,is_dark_mode);
            return_array["billing_sorted_cheapest_html"]     = buildHtmlSection(sortedCheapest(rate_chart),base_url_images,parameter_array,is_dark_mode);
            return_array["billing_best_rated_html"]          = buildHtmlSection(sortedBestRated(rate_chart),base_url_images,parameter_array,is_dark_mode);
            return_array["billing_fast_shipping_html"]       = buildHtmlSection(sortedFastShipping(rate_chart),base_url_images,parameter_array,is_dark_mode);
            return_array["sorting_option"]                   = buildSortingHtmlSection();
            return_array["zone"]                             = '';
            return_array["status"]                           = "success";
            //echo json_encode(return);
            //exit();
        }
        else
        {
            return_array["status"] = "error";
            return_array["html_message"] = "No Data Found";
            //echo json_encode(return);
            //exit();
        }



}

function sortedCheapest(billing_rate)
{   
    var sortedDummyArray = [];
    var temp =[];
    var count = 0;
        billing_rate.forEach(function(value, key, billing_rate) {
            // Do something
            temp[key] = value['billing_rate']['itl_bill_with_gst'];
        });
        
    

    temp.sort()
    temp.forEach(function(value, key, billing_rate) {
        sortedDummyArray[key] = billing_rate[key];
    });
    return sortedDummyArray;
}

function sortedBestRated(billing_rate)
{   
    var sortedDummyArray = [];
    var temp =[];
    var count = 0;
    billing_rate.forEach(function(value, key, billing_rate) {
       temp[key] = value['logistic_data']['logistics_rating'];
    });
    temp.sort();
    temp.forEach(function(value, key, billing_rate) {
     
        sortedDummyArray[key] = billing_rate[key];
    });
    return sortedDummyArray;
}

function sortedFastShipping(billing_rate)
{   
    var sortedDummyArray = [];
    var temp =[];
    var count = 0;
    billing_rate.forEach(function(value, key, billing_rate) {
    
        temp[key] = value['logistic_data']['is_same_day_pickup'];
    });
    temp.sort();
    temp.forEach(function(value, key, billing_rate) {
    
        sortedDummyArray[key] = billing_rate[key];
    });
    return sortedDummyArray;
}

function buildSortingHtmlSection()
{
    // html = '<div class="d-inline-block sort-by-div-txt">
    //         Sort by
    //         </div>
    //         <div class="rate-calc-sort-box d-inline-block">
    //             <select class="js-example-basic-single rate-calc-sort-select" id="rateCalculatorSelect" name="" data-placeholder="Best Value">
    //                 <option selected>Best rated</option>
    //                 <option>Fast shipping</option>
    //                 <option>Cheapest</option>
    //             </select>
    //         </div>';
    // return $html;
}

function getLogisticStar(rating)
{   
    var rating_html = '';
    for (var i=1; i <= 5; i++) 
    { 
        if(rating <= i)
        {
            rating_html += '<svg class="start-spacing inactive" xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15"> <path fill="#091E42" fill-opacity=".25" d="M4.054 14.724c-.169 0-.336-.053-.48-.156-.265-.193-.39-.524-.317-.844l.99-4.36L.89 6.418c-.247-.215-.341-.556-.24-.868.101-.312.377-.533.703-.563l4.442-.403L7.551.475c.13-.302.425-.497.752-.497.328 0 .623.195.752.497l1.756 4.11 4.441.403c.328.03.603.251.704.563.102.311.008.653-.239.868L12.36 9.363l.99 4.36c.073.32-.052.652-.318.845-.265.192-.62.207-.899.039l-3.83-2.29-3.83 2.29c-.13.078-.274.117-.42.117z"/> </svg>';
        }
        else
        {
            rating_html += '<svg class="start-spacing" xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15"> <path fill="#FFAB00" d="M3.444 14.724c-.169 0-.336-.053-.479-.156-.266-.193-.39-.524-.318-.844l.99-4.36L.28 6.418c-.247-.215-.341-.556-.24-.868.101-.312.377-.533.703-.563l4.442-.403L6.941.475c.13-.302.425-.497.752-.497.328 0 .623.195.752.497l1.757 4.11 4.44.403c.328.03.603.251.705.563.101.311.007.653-.24.868l-3.356 2.944.99 4.36c.072.32-.052.652-.319.845-.265.192-.619.207-.898.039l-3.83-2.29-3.83 2.29c-.13.078-.275.117-.42.117z"/> </svg>';
        }
    }
    return rating_html;
}

function sameDayPickup(samePickup,base_url_images,is_dark_mode = '')
{
    var temp_val = '';
    if(is_dark_mode == 1)
    {
        temp_val = '-dark-mode';
    }
    if(samePickup == 1)
    {
        return '<img src="'+base_url_images+'rate-calc-acc-bg'+temp_val+'.svg">'+
                                '<div class="rate-calc-acc-bg-trans-txt">Same day pickup</div>';
    }
    else
    {
        return '';
    }
}

function calculateGST(itl_bill_cgst, itl_bill_igst,itl_bill_sgst)
{
    return number_format(itl_bill_cgst + itl_bill_igst + itl_bill_sgst,2, '.', '');
}

function calculateFreight(itl_half_kg, itl_additional_half_kg, itl_fsc_per)
{
    return number_format(itl_half_kg + itl_additional_half_kg + itl_fsc_per, 2, '.', '');
}


function buildHtmlSection(rate_charts,base_url_images,parameter_array = [],is_dark_mode)
{   
    var html = '';
    var count = 1;
    var temp_val = '';
    var buildHtmlSection = {};
    if(is_dark_mode == 1)
    {
        temp_val = '-dark-mode';
    }
    rate_charts.forEach(function(value, key, rate_charts) {
    
       
        var logistic_id        = rate_chart['logistic_id'];
        var logistics_details  = rate_chart['logistic_data'];
        var billing_rate       = rate_chart['billing_rate'];
    // generateLogo($logistics_details,$logistic_id,$logistics_service_type = '' ,$db_mysqli)
        // <div class="d-inline-block card-img-div-w expressbess">
                            //     <img src="'+base_url_images.''. get_logistic_name($logistics_details['logistics_id_service_type'])['imagname'].'" class="card-img-w">
                            //     <div>'.get_logistics_service_type_name($$logistic_id,$rate_chart['logistics_service_type']).'</div>
                            // </div>

        var fedex_other_class = '';
        if(logistic_id == 2)
        {
            if(rate_chart['logistics_service_type'] > 4)
            {
                fedex_other_class = 'fedex-other-img';
            }
        }
        count ++;
        var getLogisticStar= getLogisticStar(logistics_details['logistics_rating']);
        var slab_weight_in_kg = rate_chart['slab_weight_in_kg'];
        var itl_bill_with_gst = billing_rate['itl_bill_with_gst']
        var pickup_performance_rating = calculatePer(logistics_details['pickup_performance_rating'],5)
        var delivery_performance_rating =  calculatePer(logistics_details['ontime_rating'],5)
        var Freight_Charges = calculateFreight(billing_rate['itl_half_kg'] , billing_rate['itl_additional_half_kg'] , billing_rate['itl_fsc_per']);
        var itl_cod_charge = number_format(billing_rate['itl_cod_charge'],2, '.', '');
        var itl_bill_cgst = calculateGST(billing_rate['itl_bill_cgst'], billing_rate['itl_bill_igst'], billing_rate['itl_bill_sgst']);
        var is_same_day_pickup = sameDayPickup(logistics_details['is_same_day_pickup'],base_url_images,is_dark_mode)
        var buildHtmlSection = {};

        buildHtmlSection["getLogisticStar"] = getLogisticStar;
        buildHtmlSection["slab_weight_in_kg"] = slab_weight_in_kg;
        buildHtmlSection["itl_bill_with_gst"] = itl_bill_with_gst;
        buildHtmlSection["pickup_performance_rating"] = pickup_performance_rating;
        buildHtmlSection["delivery_performance_rating"] = delivery_performance_rating;
        buildHtmlSection["Freight_Charges"] = Freight_Charges;
        buildHtmlSection["itl_cod_charge"] = itl_cod_charge;
        buildHtmlSection["itl_bill_cgst"] = itl_bill_cgst;
        buildHtmlSection["is_same_day_pickup"] = is_same_day_pickup;


        //     var html += '
    //         <div class="card">
    //             <div class="card-header" role="tab" id="headingOne1">
    //                 <div class="collapsed"  data-toggle="collapse" data-parent="#accordionEx" href="#collapseOne'+count.'" aria-expanded="false"
    //                 aria-controls="collapseOne'+count.'">
    //                     <div class="mb-0 d-inline-block haeder-w-mob haeder-w-web">
    //                         <div class="d-inline-block card-img-div-w expressbess">
    //                             <img src="'+base_url_images.''. generateLogo($logistics_details,$logistic_id,$rate_chart['logistics_service_type'] ,$$temp_val).'" class="card-img-w '+fedex_other_class.'">
    //                         </div>
    //                         <div class="star-div" >
    //                             '.getLogisticStar($logistics_details['logistics_rating']).'
    //                         </div>
    //                         <div class="d-inline-block vertical-mid del-div">
    //                             <div class="circle-div-1"><span class="sm-circle"></span><div class="acc-inner-header-txt d-inline-block">Delivery in 2-3 days</div></div>
    //                             <div><span class="sm-circle"></span><div class="acc-inner-header-txt d-inline-block">Reverse pickup</div></div>
    //                             <div class="circle-div-2"><span class="sm-circle"></span><div class="acc-inner-header-txt d-inline-block">COD</div></div>
    //                         </div>
    //                         <div class="d-inline-block vertical-mid del-div rate-calculatr-rs-div" >
    //                             <div class="circle-div-1">
    //                                 <div class="acc-inner-header-txt d-inline-block">
    //                                     <img src="'+base_url_images.'rate-calculator-rs-icon'+temp_val.'.svg">
    //                                      Rate card:<span> '+rate_chart['slab_weight_in_kg'].'Kg</span>
    //                                  </div>
    //                             </div>
    //                         </div>
    //                         <div class="d-inline-block acc-inner-header-div">
    //                             <div class="acc-inner-header-rup-txt">
    //                                 Rs '+billing_rate['itl_bill_with_gst'].'
    //                             </div>
    //                         </div>
    //                     </div>
    //                     <img src="'+base_url_images.'rate-calc-down-arrow-acc'+temp_val.'.svg" class="fa-angle-down rotate-icon">
    //                 </div>
    //             </div>
    //             <div id="collapseOne'+count.'" class="collapse " role="tabpanel" aria-labelledby="headingOne'+count.'" data-parent="#accordionEx">
    //                 <div class="card-body">
    //                     <div class="chart-pd-l d-inline-block">
    //                         <div class="d-inline-block pick-up-mr">
    //                             <div class="circular-chart pick-chart">
    //                                <div class="min-chart" id="rate-cal-pick-up" data-percent="'.calculatePer($logistics_details['pickup_performance_rating'],5).'">
    //                                    <div class="chart-content" data-percent="'.calculatePer($logistics_details['pickup_performance_rating'],5).'">
    //                                        <div class="percent"  id="">'.calculatePer($logistics_details['pickup_performance_rating'],5).'%</div>
    //                                    </div>
    //                                </div>
    //                             </div>
    //                             <div class="d-inline-block trans-y-12">
    //                                 <img src="'+base_url_images.'rate-calc-pickup-icon'+temp_val.'.svg" class="">
    //                                 <div class="chart-txt">Pickup</div>
    //                             </div>
    //                         </div>
    //                         <div class="d-inline-block del-mr">
    //                             <div class="circular-chart pick-chart">
    //                                <div class="min-chart" id="rate-cal-del" data-percent="'.calculatePer($logistics_details['delivery_performance_rating'],5).'">
    //                                    <div class="chart-content">
    //                                        <div class="percent"  id="">'.calculatePer($logistics_details['delivery_performance_rating'],5).'%</div>
    //                                    </div>
    //                                </div>
    //                             </div>
    //                             <div class="d-inline-block trans-y-12">
    //                                 <img src="'+base_url_images.'rate-calc-del-trk'+temp_val.'.svg" class="">
    //                                 <div class="chart-txt">Delivery</div>
    //                             </div>
    //                         </div>
    //                         <div class="d-inline-block">
    //                             <div class="circular-chart pick-chart">
    //                                <div class="min-chart" id="rate-cal-on-time" data-percent="'.calculatePer($logistics_details['ontime_rating'],5).'">
    //                                    <div class="chart-content">
    //                                        <div class="percent" id="">'.calculatePer($logistics_details['ontime_rating'],5).'%</div>
    //                                    </div>
    //                                </div>
    //                             </div>
    //                             <div class="d-inline-block trans-y-12">
    //                                 <img src="'+base_url_images.'rate-calc-on-time-icon'+temp_val.'.svg" class="">
    //                                 <div class="chart-txt">On Time</div>
    //                             </div>
    //                         </div>
    //                     </div>
    //                     <div class="rate-brk-dwn rate-brk-div">
    //                         <div class="rate-brk-dwn-txt">Rate Breakdown</div>
    //                         <div class="mb-8">
    //                             <div class="rate-brk-dwn-rup-txt">Freight Charges</div>
    //                             <div class="rate-brk-dwn-rup">Rs '. calculateFreight($billing_rate['itl_half_kg'] , $billing_rate['itl_additional_half_kg'] , $billing_rate['itl_fsc_per']).'</div>
    //                         </div> 
    //                         <div class="mb-8">
    //                             <div class="rate-brk-dwn-rup-txt">COD Charges</div>
    //                             <div class="rate-brk-dwn-rup">Rs '.number_format($billing_rate['itl_cod_charge'],2, '.', '') .'</div>
    //                         </div>
    //                         <div>
    //                             <div class="rate-brk-dwn-rup-txt">GST Charges</div>

    //                             <div class="rate-brk-dwn-rup">Rs '.calculateGST($billing_rate['itl_bill_cgst'], $billing_rate['itl_bill_igst'], $billing_rate['itl_bill_sgst']).'</div>
    //                         </div>
    //                     </div>
    //                     <div class="rate-calc-acc-bg-trans">
    //                         '.sameDayPickup($logistics_details['is_same_day_pickup'],$base_url_images,$is_dark_mode).'
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     ';
     });

    return buildHtmlSection;
}

function generateLogo(logistics_details,logistic_id,logistics_service_type = '' ,temp_val = '')
{

    if (logistic_id == 2) 
    {   
        var get_logistics_service_type_name = get_logistics_service_type_name(logistic_id,logistics_service_type);
        if (get_logistics_service_type_name == 'ground') 
        {
            get_image_details  = get_logistic_name('2_6');
            display_image      = get_image_details['imagename_without_ext'];
            image_ext          = get_image_details['ext_svg_v2'];
            return display_image+temp_val+image_ext;
        }
        else if (get_logistics_service_type_name == 'standard') 
        {   
            get_image_details  = get_logistic_name('2');
            display_image      = get_image_details['imagename_without_ext'];
            image_ext          = get_image_details['ext_svg_v2'];
            // return $display_image+temp_val+image_ext;
            return display_image+temp_val+image_ext;
        }
        else if (get_logistics_service_type_name == 'priority') 
        {
            get_image_details  = get_logistic_name('2_5');
            display_image      = get_image_details['imagename_without_ext'];
            image_ext          = get_image_details['ext_svg_v2'];
            return display_image+temp_val+image_ext;
        }
    }

    get_image_details = get_logistic_name(logistics_details['logistics_id_service_type']);
    display_image  = get_image_details['imagename_without_ext'];
    image_ext = get_image_details['ext_svg_v2'];
    return display_image+temp_val+image_ext;
}

function calculatePer(value,outof)
{
    return round((value/outof)*100,2);
}

function getLogistic(logistic_id)
{
    var get_logistic_query         = "SELECT logistics_name, logistics_id_service_type, pickup_performance_rating, delivery_performance_rating, logistics_rating, is_same_day_pickup,ontime_rating  FROM `logistics_v2` WHERE logistics_id = '"+logistic_id+"' AND is_global = 0 AND is_deleted = 0 limit 1";
    var result_logistic_query      = JSON.parse(await billing.commonSelectQuery(get_logistic_query));
    var logistic                   = [];
   
    for(row_logistic_query of result_logistic_query )
    {   
        if (logistic_id == 2) 
        {
            logistic['logistics_name']                 = 'Fedex';
        }
        else
        {
            logistic['logistics_name']                 = row_logistic_query['logistics_name'];
        }
        
        logistic['logistics_id_service_type']      = row_logistic_query['logistics_id_service_type'];
        logistic['pickup_performance_rating']      = row_logistic_query['pickup_performance_rating'];
        logistic['delivery_performance_rating']    = row_logistic_query['delivery_performance_rating'];
        logistic['logistics_rating']               = row_logistic_query['logistics_rating'];
        logistic['is_same_day_pickup']             = row_logistic_query['is_same_day_pickup'];
        logistic['ontime_rating']                  = row_logistic_query['ontime_rating'];

    }

    return logistic;
}

function getRateChart(vendor_id,logistic_id,is_reverse,parameter_array)
{   
    var zone_array                     = parameter_array['zone'];//added on 10th june 2021 by shital
    var get_rate_chart_query           = "SELECT * FROM `rate_chart` WHERE user_id = "+vendor_id+" AND logistic_id in ("+logistic_id+") AND is_deleted = 0 AND status = 1 and is_reverse = "+is_reverse;
    var result_rate_chart_query        = JSON.parse(await billing.commonSelectQuery(get_rate_chart_query));
    var rate_chart_details             = [];
   
    for(row_rate_chart_query of result_rate_chart_query)  
    {  
        logistic_id                        = row_rate_chart_query['logistic_id'];
        parameter_array['logistic_id']     = logistic_id;
            
        if(logistic_id == 5)
        {
            parameter_array['zone']        = zone_array['ecom_zone'];//updated on 10th june 2021 by shital
        }
        else
        {
            parameter_array['zone']        = zone_array['all_zone'];//updated on 10th june 2021 by shital
        }
        parameter_array['rate_card_array'] = [];
        parameter_array['rate_card_array'][row_rate_chart_query['id']]    = row_rate_chart_query;
        var billing_rate   = [];
        
        var billing_rate   = calculate_billing_rate(parameter_array);
        
        row_rate_chart_query['billing_rate']   = billing_rate;
        row_rate_chart_query['logistic_data']  = getLogistic(logistic_id);
        rate_chart_details.push(row_rate_chart_query);
    }
    return rate_chart_details;
}

function getVendorLogistics(vendor_id)
{
    var get_vendor_query       = "SELECT logistic_id_list_v2 FROM `user` WHERE id = $vendor_id and is_deleted = 0";
    var result_vendor_query    = JSON.parse(await billing.commonSelectQuery(get_vendor_query));
    var vendor_logistics       = '';
  
    for(row_vendor_query of result_vendor_query)
    {
        vendor_logistics     = row_vendor_query['logistic_id_list_v2'];
    }

    return vendor_logistics;
}