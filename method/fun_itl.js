var express = require('express');
const {
    promisify
} = require('util');
const nodemailer = require("nodemailer");
const mailcomposer = require("mailcomposer");
var AWS = require('aws-sdk');
var fs = require('fs');
const smtpTransport = require('nodemailer-smtp-transport');
const e = require('cors');

exports.package_data = async function(parameters_array) 
{ 
    var domain_extention   = parameters_array['domain_extention'];
    var base_url           = parameters_array['base_url'];
    var row_id             = parameters_array['row_id'];
    var new_live_status    = parameters_array['new_live_status'];
    var json_encoded_value = parameters_array['json_encoded_value'];
    var action             = parameters_array['action'];
    var is_bulk            = parameters_array['is_bulk'];

}
exports.get_logistic_name = function(type) 
{
   var log_name = type.toLowerCase();
   console.log(log_name)
   var data_array = [];
   var data = {};
   switch(log_name) {
       case '1':
       case 'xpressbees':
           data['id'] = '1';
           data['logname'] = 'Xpressbees';
           data['imagname'] = 'xpressbees.png';
           break;
       case '2':
       case 'fedex':
           data['id'] = '2';
           data['logname'] = 'Fedex';
           data['imagname'] = 'fedex.png';
           break;
        case '2_4':
        case 'fedex-standard':
           data['id'] = '2_4';
           data['logname'] = 'Fedex Standard';
           data['imagname'] = 'fedex-standard.png';
           data['tracking_url'] = 'https://www.ithinklogistics.com/track-order-status.php?tracking_number=replace_awb_no_here';
           break;
        case '2_5':
        case 'fedex-priority':
           data['id'] = '2_5';
           data['logname'] = 'Fedex Priority';
           data['imagname'] = 'fedex-priority.png';
           data['tracking_url'] = 'https://www.ithinklogistics.com/track-order-status.php?tracking_number=replace_awb_no_here';
           break;
        case '2_6':
        case 'fedex-ground':
           data['id'] = '2_6';
           data['logname'] = 'Fedex Ground';
           data['imagname'] = 'fedex-ground.png';
           data['tracking_url'] = 'https://www.ithinklogistics.com/track-order-status.php?tracking_number=replace_awb_no_here';
           break;
       case '3':
       case 'delhivery':
           data['id'] = '3';
           data['logname'] = 'Delhivery';
           data['imagname'] = 'delhivery.png';
           break;
       case '4':
       case 'aramex':
           data['id'] = '4';
           data['logname'] = 'Aramex';
           data['imagname'] = 'aramex.png';
           break;
       case '5':
       case 'ecom express':
           data['id'] = '5';
           data['logname'] = 'Ecom Express';
           data['imagname'] = 'ecomexpress.png';
           break;
       case '6':
       case 'ekart':
           data['id'] = '6';
           data['logname'] = 'Ekart';
           data['imagname'] = 'ekart.png';
           break;
       case '7':
       case 'bluedart':
           data['id'] = '7';
           data['logname'] = 'Bluedart';
           data['imagname'] = 'bluedart.png';
           break;
        case '8':
        case 'shadowfax':
           data['id'] = '8';
           data['logname'] = 'ShadowFax';
           data['imagname'] = 'shadowfax.png';
           break;
       default:
           data['id'] = '';
           data['logname'] = '';
           data['imagname'] = '';
           break;
   }
   data_array.push(data)
   return data_array;
}

exports.itl_tracking_status = function(type) 
{
    var data = type.toLowerCase();
    var data_array = [];
    var tracking_status_array = {};
    var itl_status_id = '';
    var status_title = "";
    var itl_status_code = "";
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

    tracking_status_array['status_id']         = itl_status_id;
    tracking_status_array['status_title']      = status_title;
    tracking_status_array['status_code']       = itl_status_code;
    return tracking_status_array;
}
exports.send_whatsapp_notification = function(notification_data_array) 
{
    var data = type.toLowerCase();
    var result_array = [];
    var tracking_status_array = {};
    var itl_status_id = '';
    var status_title = "";
    var itl_status_code = "";
    //error_reporting(-1);

    //$customer_mobile    = $notification_data_array['customer_mobile'];
    var customer_mobile    = '+919833733393';
    var customer_name      = notification_data_array['customer_name'];
    var order_no           = notification_data_array['order_no'];
    var airway_bill_no     = notification_data_array['airway_bill_no'];
    var vendor_name        = notification_data_array['vendor_name'];
    var delivered_date_only= notification_data_array['delivered_date_only'];
    var ndr_remark         = notification_data_array['ndr_remark'];
   
    //customer_mobile.replace()
    //var customer_mobile        = trim(str_replace(array('\n\r','\r\n', '\n', '\r','\\r\\n','\\n\\r', ' ','+','-'), '', str_replace(PHP_EOL, '',$customer_mobile)));

    //  if(strlen($customer_mobile) > 10)
    //  {
    //  $customer_mobile = substr($customer_mobile, 2);
    //  }
    var current_status    = notification_data_array['current_status'];
    var message_body = '';
    switch (current_status) 
    {
        case "2"://Picked Up
            message_body = 'Hello '+customer_name+', Your Order '+order_no+' is picked up by Delhivery Courier';
          
        break;

        case "3"://In Transit
            message_body = 'Hello '+customer_name+', Your Order '+order_no+' is In Transit by Delhivery Courier';
        break;

        case "4"://Reached At Destination
            message_body = 'Hello '+customer_name+', Your Order '+order_no+' have Reached At Destination. Track On https://www.ithinklogistics.com/track-order-status?tracking_number='+airway_bill_no;
        break;

        case "5"://Out For Delivery
            message_body = 'Hello '+customer_name+', Delivery of your '+vendor_name+' shipment for Order '+order_no+' will be attempted by Delhivery Courier today. Track On https://www.ithinklogistics.com/track-order-status?tracking_number='+airway_bill_no;
        break;

        case "6"://Out For Delivery
            message_body = 'Hello '+customer_name+', Delivery of your '+vendor_name+' shipment for Order '+order_no+' will be attempted by Delhivery Courier today. Track On https://www.ithinklogistics.com/track-order-status?tracking_number='+airway_bill_no;
        break;

        case "7"://Delivered=
            message_body = 'Hello '+customer_name+', Delivery of your '+vendor_name+' shipment for Order '+order_no+' is delivered sucessfully by Delhivery Courier on '+delivered_date_only+'';
        break;
        case "5_1"://NDR
        message_body = 'Hello '+customer_name+', Delhivery Courier failed to deliver shipment '+order_no+' due to '+ndr_remark;
        break;
        case "4_1"://NDR
        message_body = 'Hello '+customer_name+', Delhivery Courier failed to deliver shipment '+order_no+' due to '+ndr_remark;
        break;
        case "6_1"://NDR
        message_body = 'Hello '+customer_name+', Delhivery Courier failed to deliver shipment '+order_no+' due to '+ndr_remark;
        break;
    }


   
    /*
    $curl = curl_init();

      curl_setopt_array($curl, array(
      CURLOPT_URL => "https://eu7.chat-api.com/instance6484/message?token=46q9p9uisyvews1c",
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => "",
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 30,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "POST",
      CURLOPT_POSTFIELDS => "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"phone\"\r\n\r\n91".$customer_mobile."\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"body\"\r\n\r\n".$message_body."\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--",
      CURLOPT_HTTPHEADER => array(
        "cache-control: no-cache",
        "content-type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
        "postman-token: 631c6264-0e60-7f82-ee81-37b569811125"
      ),
    ));

    
    $response = curl_exec($curl);
    $err = curl_error($curl);

    curl_close($curl);

    if ($err) {
      echo "cURL Error #:" . $err;
    } 
    else 
    {

        $response;
        $result_array = json_decode($response, TRUE);
        
    }
    */
    return $result_array;
}
