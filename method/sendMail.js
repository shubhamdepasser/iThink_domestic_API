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

exports.send_mail = async function(mail_from,mail_to, subject, text) 
{ 
    
    var transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: 'cholkeshubham1996@gmail.com',
            pass: 'Shubham$6366'
        }
    }));

    var mailOptions = {
        from: mail_from,
        to: mail_to,
        subject: subject,
        text: text,
    };

    transporter.sendMail(mailOptions, function(error, info)
    {
        if (error) {
            console.log(error);
            return 0;
        } else {
            return 1;
        }
    }); 
    console.log("sent mail");
}

exports.send_mail_awss = async function(mail_1,mail_2, subject, text) 
{ 
    
  AWS.config.update({
      accessKeyId: "AKIAQG3FDVKGACNMHB6X",
      secretAccessKey: "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",
      region: "us-east-1"
    });
    
    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
    const params = {
      Destination: {
        ToAddresses: [mail_1],
        CcAddresses: [mail_2] 
      },
      
      Message: {
        Subject: {
          Charset: "UTF-8",
          Data: subject
        },
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: "HTML_FORMAT_BODY"
           },
          Text: {
            Charset: "UTF-8",
            Data: text
          },
        },
        

      },
    
      Source: "info@ithinklogistics.com"
  };

  const sendEmail = ses.sendEmail(params).promise();

    sendEmail
      .then(data => {
        console.log("email submitted to SES", data);
        return 1;
      })
      .catch(error => {
        console.log(error);
        return 0;
      });
    
}


exports.send_mail_aws_basic_function = async function() 
{ 
  AWS.config.update({
    accessKeyId: "AKIAQG3FDVKGACNMHB6X",
    secretAccessKey: "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",
    region: "us-east-1"
  });
  
  const ses = new AWS.SES({ apiVersion: "2010-12-01" });
  return Promise.resolve().then(() => {
    let sendRawEmailPromise;

    const mail = mailcomposer({
      from: 'info@ithinklogistics.com',
      to: 'cholkeshubham@gmail.com',
      subject: 'Sample SES message with attachment',
      text: 'Hey folks, this is a test message from SES with an attachment.',
      attachments: [
        {
          filename: '12a9146d1dc7f08b93945f0a0151c250.jpeg',
          path: './images/temp/12a9146d1dc7f08b93945f0a0151c250.jpeg',
          content: new Buffer(fs.readFileSync('./images/temp/12a9146d1dc7f08b93945f0a0151c250.jpeg')).toString('base64'),
          contentType: 'application/jpeg',
        },
      ],
    });

    return new Promise((resolve, reject) => {
      mail.build((err, message) => {
        if (err) {
          console.log("reject");
          reject(0);
        }
        sendRawEmailPromise = ses.sendRawEmail({RawMessage: {Data: message}}).promise();
      });
      console.log("done");
      resolve(1);
    });
  });
}

//const svg64 = require('svg64');

// Import `readFileSync` from the file system module
//const { readFileSync } = require('fs');

// Read your SVG file's contents
//const svg = readFileSync('./images/test_email_images/background-bd.svg', 'utf-8');

// This is your SVG in base64 representation
//var base64fromSVG = svg64(svg);
//base64fromSVG=base64fromSVG.replace('data:image/svg+xml;base64,','data:image/png;base64,');


//console.log(base64fromSVG);

var email_images = 'https://new-itl-uploads.s3.ap-south-1.amazonaws.com/images/email_images/';

//console.log(email_images);
var facebook_link = 'https://www.facebook.com/ithinklogistics/';
var gplus_link = 'https://plus.google.com/107408749201396492334';
var twitter_link = 'https://twitter.com/IthinkLogistics';
var linkedin_link = 'https://www.linkedin.com/company/ithinklogistics/';
var insta_link = 'https://www.instagram.com/ithinklogistics/';
var youtube_link = 'https://www.youtube.com/channel/UCjiXa7qJhCqfMSmCRDY6gbw';

var mail_template = '<!DOCTYPE html>'+
'	<html lang="en">'+
'		<head>'+
'			<meta http-equiv="Content-Type" content="text/html; charset=utf-8">'+
'		    <meta http-equiv="X-UA-Compatible" content="IE=edge">'+
'		    <meta name="viewport" content="width=device-width, initial-scale=1">'+
'			<title></title>'+
'			<link href="https://fonts.googleapis.com/css?family=Roboto:400,300,100,500,700,900" rel="stylesheet" type="text/css">'+
'			<style type="text/css">'+
'				body'+
'				{'+
'				    background-color: #f5f6fa;'+
'				    font-weight: normal;'+
'				    font-stretch: normal;'+
'				    font-style: normal;'+
'				    letter-spacing: normal;'+
'				    font-family: Inter;'+
'					font-size: 16px;'+
'					margin:0px 0 48px 0;'+
'					background-image:url("'+email_images+'background-bd.svg");'+
'					background-repeat: no-repeat;'+
'					background-position: top;'+
'				}'+
'				.main-body-top-img'+
'				{'+
'					height: 253px;'+
'					margin-left: auto;'+
'					margin-right: auto;'+
'					padding: 0;'+
'				}'+
'				.shadow-1'+
'				{'+
'					width: 576px;'+
'					height: 5px;'+
'					opacity: 0.16;'+
'					border-radius: 8px;'+
'					box-shadow: 0 1px 3px 0 rgba(63, 63, 68, 0.2), 0 0 0 1px rgba(63, 63, 68, 0.05);'+
'					background-color: #ffffff;'+
'					padding: 0;'+
'					margin-left: auto;'+
'					margin-right: auto;'+
'					margin-top: 62px;'+
'				}'+
'				.shadow-2'+
'				{'+
'					width: 608px;'+
'					height: 5px;'+
'					opacity: 0.5;'+
'					border-radius: 8px;'+
'					box-shadow: 0 1px 3px 0 rgba(63, 63, 68, 0.2), 0 0 0 1px rgba(63, 63, 68, 0.05);'+
'					background-color: #ffffff;'+
'					padding: 0;'+
'					margin-left: auto;'+
'					margin-right: auto;'+
'				}'+
'				.main-content'+
'				{'+
'					width: 640px;'+
'					border-collapse: collapse;'+
'					border: 0;'+
'					margin-left: auto;'+
'					margin-right: auto;'+
'					padding: 0;'+
'					border-radius: 8px;'+
'					box-shadow: 0 1px 3px 0 rgba(63, 63, 68, 0.2), 0 0 0 1px rgba(63, 63, 68, 0.05);'+
'					background-color: #ffffff;'+
'				}'+
'				.contenttable'+
'				{'+
'					padding: 56px 40px;'+
'					line-height: 1.75;'+
'					color: #344563;'+
'				}'+
'				.customer-logo'+
'				{'+
'					width: 213px;'+
'					height: 32px;'+
'				}'+
'				.customer-name'+
'				{'+
'					height: 28px;'+
'					margin-top:40px;'+
'				}'+
'				.customer-order-detials'+
'				{'+
'					height: 84px;'+
'					margin-top:12px;'+
'				}'+
'				.customer-order-detials span'+
'				{'+
'					color:#0065ff;'+
'				}'+
'				.out-of-delivery-div'+
'				{'+
'					height: 160px;'+
'					border-radius: 4px;'+
'					border: solid 1px #8777d9;'+
'					background-color: #ffffff;'+
'					margin-top:52px;'+
'				}'+
'				.out-of-delivery-box'+
'				{'+
'					width: 147px;'+
'					height: 32px;'+
'					border-radius: 4px;'+
'					background-color: #8777d9;'+
'					margin-top: -20px;'+
'					margin-left: auto;'+
'					margin-right: auto;'+
'					position:relative;'+
'					z-index:2;'+
'				}'+
'				.out-of-delivery-box-right '+
'				{'+
'					position: absolute;'+
'					border-top: 12px solid #5243aa;'+
'					border-right: 4px solid transparent;'+
'					width: 0;'+
'					right: -3px;'+
'					bottom: 1px;'+
'					z-index: 0;'+
'				}'+
'				.out-of-delivery-box-left'+
'				{'+
'					position: absolute;'+
'					border-top: 12px solid #5243aa;'+
'					border-left: 4px solid transparent;'+
'					width: 0;'+
'					left: -3px;'+
'					bottom: 1px;'+
'					z-index: 0;'+
'				}    '+
'				.out-of-delivery-box .out-of-delivery-box-text'+
'				{'+
'					width: 107px;'+
'					height: 24px;'+
'					font-family: Inter;'+
'					font-size: 14px;'+
'					font-weight: 600;'+
'					font-stretch: normal;'+
'					font-style: normal;'+
'					line-height: 1.71;'+
'					letter-spacing: normal;'+
'					text-align: right;'+
'					color: #ffffff;'+
'					padding:4px 20px;'+
'					z-index: 2;'+
'				}'+
'				.shipment-order-details-div'+
'				{'+
'					height: 172px;'+
'					border-radius: 4px;'+
'					border: solid 1px #2684ff;'+
'					background-color: #f8f9fb;'+
'				}'+
'				.shipment-details'+
'				{'+
'					height: 24px;'+
'					font-weight: 600;'+
'					line-height: 1.5;'+
'					color: #344563;'+
'				}'+
'				.order-title'+
'				{'+
'					height: 16px;'+
'					font-family: Roboto;'+
'					font-size: 14px;'+
'					line-height: normal;'+
'					color: #5e6c84;'+
'				}'+
'				.order-no'+
'				{'+
'					height: 24px;'+
'					line-height: 1.5;'+
'					color: #344563;'+
'					margin-top:8px;'+
'				}'+
'				.m-t-12'+
'				{'+
'					margin-top:12px;'+
'				}'+
'				.m-t-24'+
'				{'+
'					margin-top:24px;'+
'				}'+
'				.m-t-40'+
'				{'+
'					margin-top:40px;'+
'				}'+
'				.m-t-48'+
'				{'+
'					margin-top:48px;'+
'				}'+
'				.m-t-56'+
'				{'+
'					margin-top:56px;'+
'				}'+
'				.d-flex'+
'				{'+
'					display:flex !important;'+
'				}'+
'				.item-details-title'+
'				{'+
'					height: 24px;'+
'					font-weight: 600;'+
'					line-height: 1.5;'+
'					color: #344563;'+
'				}'+
'				.item-details-div'+
'				{'+
'					margin-top:24px;'+
'				}'+
'				.item-img'+
'				{'+
'				    width: 64px;'+
'				    height: 64px;'+
'				    object-fit: contain;'+
'				}'+
'				.item-details-div-1'+
'				{'+
'					width: 100%;'+
'					text-align: left;'+
'				    margin-top: 8px;'+
'					margin-left: 20px;'+
'				}'+
'				.item-name'+
'				{'+
'					font-weight: 500;'+
'					line-height: 1.25;'+
'					color: #344563;'+
'					height: 20px;'+
'				}'+
'				.item-quantity,.item-discount'+
'				{'+
'					height: 16px;'+
'					font-family: Roboto;'+
'					font-size: 14px;'+
'					font-weight: normal;'+
'					font-stretch: normal;'+
'					font-style: normal;'+
'					line-height: normal;'+
'					letter-spacing: normal;'+
'					color: #5e6c84;'+
'				}'+
'				.item-discount'+
'				{'+
'					margin-left: 32px;'+
'				}'+
'				.item-price'+
'				{'+
'				    width: 25%;'+
'				    text-align: right;'+
'				    margin-top: 8px;'+
'					font-weight: 500;'+
'					line-height: 1.25;'+
'					color: #344563;'+
'				}'+
'				.item-total-amount'+
'				{'+
'					text-align: right;'+
'					height: 24px;'+
'					line-height: 1.5;'+
'					color: #5e6c84;'+
'				}'+
'				.item-total-amount span'+
'				{'+
'					height: 24px;'+
'					font-weight: 500;'+
'					color: #344563;'+
'					margin-left: 13px;'+
'				}'+
'				.delivery-address-title'+
'				{'+
'					width: 304px;'+
'					height: 24px;'+
'					font-weight: 600;'+
'					line-height: 1.5;'+
'					color: #344563;'+
'				}'+
'				.delivery-address'+
'				{'+
'					height: 84px;'+
'					color: #344563;'+
'					margin-top:16px;'+
'				}'+
'				.delivery-address-sub-div'+
'				{'+
'					width:100%;'+
'				}'+
'				.regards-div'+
'				{'+
'					height: 20px;'+
'					font-family: Roboto;'+
'					font-size: 14px;'+
'					font-weight: normal;'+
'					font-stretch: normal;'+
'					font-style: normal;'+
'					line-height: 1.43;'+
'					letter-spacing: normal;'+
'					color: #5e6c84;'+
'					text-align: center;'+
'				}'+
'				.regards-customer-name'+
'				{'+
'					height: 24px;'+
'					font-weight: 500;'+
'					line-height: 1.5;'+
'					color: #344563;'+
'					margin-top:8px;'+
'					text-align: center;'+
'				}'+
'				.footer-data'+
'				{	'+
'					height: 40px;'+
'					font-family: Roboto;'+
'					font-size: 14px;'+
'					font-weight: normal;'+
'					font-stretch: normal;'+
'					font-style: normal;'+
'					line-height: 1.43;'+
'					letter-spacing: normal;'+
'					text-align: center;'+
'					color: #5e6c84;'+
'				}'+
'				.footer-data-1'+
'				{'+
'					height: 20px;'+
'					font-family: Roboto;'+
'					font-size: 14px;'+
'					font-weight: normal;'+
'					font-stretch: normal;'+
'					font-style: normal;'+
'					line-height: 1.43;'+
'					letter-spacing: normal;'+
'					text-align: center;'+
'					color: #5e6c84;'+
'					margin-top:12px;'+
'				}'+
'				.footer-data-1 span,.footer-data span'+
'				{'+
'					color:#0065ff;'+
'				}'+
'				.m-l-40'+
'				{'+
'					margin-left:40px;'+
'				}'+
'				.m-t-20'+
'				{'+
'					margin-top:20px;'+
'				}'+
'				.m-t-84'+
'				{'+
'					margin-top:84px;'+
'				}'+
'				.awb-title'+
'				{'+
'					height: 16px;'+
'					font-family: Roboto;'+
'					font-size: 14px;'+
'					line-height: normal;'+
'					color: #5e6c84;'+
'				}'+
'				.awb-no'+
'				{'+
'					height: 24px;'+
'					line-height: 1.5;'+
'					color:#0065ff;'+
'					margin-top:8px;'+
'				}'+
'				.m-t-42'+
'				{'+
'					margin-top:42px;'+
'				}'+
'				.courier-title'+
'				{'+
'					height: 17px;'+
'					font-size: 14px;'+
'					line-height: normal;'+
'					color: #5e6c84;'+
'					margin-top:2px;'+
'				}'+
'				.logistic-img'+
'				{'+
'					margin-left:12px;'+
'					width: 69px;'+
'					height: 21px;'+
'				    object-fit: contain;'+
'				}'+
'				.parcel-img-div'+
'				{'+
'					margin-top:41px;'+
'					margin-left:14px;'+
'				}'+
'       .parcel path {'+
'         fill: #000;'+
'}'+
'				.parcel '+
'				{'+
'				  width: 116px;'+
'				  object-fit: contain;'+
'				  position: absolute;'+
'				  clip: rect(0px, 116px, 68px, 0px);'+
'				}'+
'				.estimate-delivery-img'+
'				{'+
'					width: 84px;'+
'					height: 112px;'+
'					object-fit: contain;'+
'					margin-top:12px;'+
'				}'+
'				.estimate-delivery-title'+
'				{'+
'					width: 82px;'+
'					height: 48px;'+
'					font-weight: 600;'+
'					line-height: 1.5;'+
'					color: #344563;'+
'					margin-left:28px;'+
'					margin-top:44px;'+
'				}'+
'				.estimate-delivery-date-div'+
'				{'+
'					margin-left:24px;'+
'				}'+
'				.estimate-delivery-day'+
'				{'+
'					height: 20px;'+
'					font-family: Roboto;'+
'					font-size: 20px;'+
'					font-weight: normal;'+
'					line-height: 1;'+
'					color: #344563;'+
'				}'+
'				.estimate-delivery-month'+
'				{'+
'					height: 20px;'+
'					font-family: Roboto;'+
'					font-size: 14px;'+
'					font-weight: normal;'+
'					line-height: 1.43;'+
'					color: #5e6c84;'+
'					margin-top:4px;'+
'				}'+
'				.estimate-delivery-date'+
'				{'+
'					height: 40px;'+
'					width: 44px;'+
'					font-size: 40px;'+
'					line-height: 1;'+
'					color: #344563;'+
'					margin-top:4px;'+
'					display: flex;'+
'				}'+
'				.estimate-delivery-date span'+
'				{'+
'					width: 27px;'+
'					height: 20px;'+
'					font-family: Roboto;'+
'					font-size: 12px;'+
'					line-height: 1.67;'+
'					color: #5e6c84;'+
'					margin-left:4px;'+
'					margin-top: 21px;'+
'				}'+
'				.track-order-button-box'+
'				{'+
'					width: 198px;'+
'					height: 136px;'+
'					border-radius: 4px;'+
'					background-color: #f8f9fb;'+
'					margin-left:57px;'+
'				}'+
'				.track-order-button'+
'				{'+
'					width: 142px;'+
'					height: 40px;'+
'					border-radius:4px;'+
'					background-color:#36b37e;'+
'				    margin: 48px 28px;'+
'				}'+
'				.track-order-button div'+
'				{'+
'					width: 82px;'+
'					height: 24px;'+
'					font-size: 14px;'+
'					font-weight: 600;'+
'					line-height: 1.71;'+
'					text-align: center;'+
'					color: #ffffff;'+
'					padding: 8px 30px;'+
'				    vertical-align: bottom;'+
'				}'+
'				.footer-content'+
'				{'+
'					width: 560px;'+
'					margin-left: auto;'+
'					margin-right: auto;'+
'					padding: 0 40px'+
'				}'+
'				.company-name'+
'				{'+
'					height: 20px;'+
'					font-family: Roboto;'+
'					font-size: 14px;'+
'					font-weight: bold;'+
'					line-height: 1.43;'+
'					text-align: center;'+
'					color: #5e6c84;'+
'				}'+
'				.company-address'+
'				{'+
'					height: 48px;'+
'					font-family: Roboto;'+
'					font-size: 14px;'+
'					line-height: 1.71;'+
'					text-align: center;'+
'					color: #5e6c84;'+
'				}'+
'				.company-website'+
'				{'+
'					height: 24px;'+
'					font-family: Roboto;'+
'					font-size: 14px;'+
'					line-height: 1.71;'+
'					text-align: center;'+
'					color:#0065ff;'+
'				}'+
'				.designed-by'+
'				{'+
'					height: 20px;'+
'					font-size: 12px;'+
'					line-height: 1.67;'+
'					color: rgba(52, 69, 99, 0.72);'+
'					margin-top:8px;'+
'					text-align:center;'+
'				}'+
'				.company-social-link'+
'				{'+
'				    text-align: center;'+
'				}'+
'				.m-r-24'+
'				{'+
'					margin-right:24px;'+
'				}'+
'				.m-r-20'+
'				{'+
'					margin-right:20px;'+
'				}'+
'				.company-link'+
'				{'+
'					height: 20px;'+
'					font-family: Inter;'+
'					font-size: 12px;'+
'					line-height: 1.67;'+
'					text-align: center;'+
'					margin-top:32px;'+
'					color:#0065ff;'+
'				}'+
'			</style>'+
'		</head>'+
'		<body>'+
'		    <div class="shadow-1"></div>'+
'			<div class="shadow-2"></div>'+
'			<div class="main-content">'+
'				<div class="contenttable">'+
'					<div class="customer-logo">'+
'						<img src="'+email_images+'" class="logo" width="50" height="50">				'+
'					</div>'+
'					<div class="customer-name">Hi Rahul,</div>'+
'					<div class="customer-order-detials">'+
'						This is to inform you that your order with order id <span>123456789-1_1596</span><br> from <span>Stacy Classy</span> with AWB <span>1234567890123</span> is is out for delivery. Our<br> delivery personal will get in touch with you soon.'+
'					</div>'+
'					<div class="out-of-delivery-div">'+
'						<div class="out-of-delivery-box">'+
'							<div class="out-of-delivery-box-right"></div>'+
'							<div class="out-of-delivery-box-left"></div>'+
'							<div class="out-of-delivery-box-text">Out for Delivery</div>'+
'						</div>'+
'						<div class="d-flex">'+
'							<img src="'+email_images+'estimate-delivery-img.png" class="estimate-delivery-img">'+
'							<div class="estimate-delivery-title">Estimated Delivery</div>'+
'							<div class="estimate-delivery-date-div m-t-24">'+
'								<div class="estimate-delivery-day">Monday</div>'+
'								<div class="estimate-delivery-month">October</div>'+
'								<div class="estimate-delivery-date">'+
'									18 <span>2020</span>'+
'								</div>'+
'							</div>'+
'							<div class="track-order-button-box">'+
'								<div class="track-order-button">'+
'								 <div>Track Order</div>'+
'								</div>'+
'							</div>'+
'						</div>'+
'					</div>'+
'					<div class="shipment-order-details-div m-t-40 d-flex">'+
'						<div class="m-t-40 m-l-40">'+
'							<div class="shipment-details">Shipment Details</div>'+
'							<div class="order-title m-t-20">Order ID</div>'+
'							<div class="order-no">123456789-1_1596</div>'+
'						</div>'+
'						<div class="m-t-84 m-l-40">'+
'							<div class="awb-title">AWB No</div>'+
'							<div class="awb-no">1234567890123</div>'+
'						</div>'+
'						<div class="m-t-42 m-l-40">'+
'							<div class="d-flex">'+
'								<div class="courier-title">Courier</div>'+
'								<img src="https://new-itl-uploads.s3.ap-south-1.amazonaws.com/images/email_images/fedex.svg" width="50" height="50" class="logistic-img">'+
'							</div>'+

   

'							<div class="parcel-img-div"><svg>'+
'							<image xlink:href="https://cdn.shopify.com/s/files/1/0496/1029/files/Freesample.svg" class="parcel" />'+
'							</svg></div>'+
'						</div>'+
'					</div>'+
'					<div class="m-t-48">'+
'						<div class="item-details-title">Items in the Shipment</div>'+
'						<div class="item-details-div d-flex">'+
'							<img src="'+email_images+'item-img.png" class="item-img">'+
'							<div class="item-details-div-1">'+
'								<div class="item-name">Army iPhone 11 Mobile Phone Cover</div>'+
'								<div class="m-t-12 d-flex">'+
'									<div class="item-quantity">Qty: 1</div>'+
'									<div class="item-discount">Discount: ₹ 0.00</div>'+
'								</div>'+
'							</div>'+
'							<div class="item-price">₹ 899.00</div>'+
'						</div>'+
'						<div style="height: 1px;opacity: 0.84;background-color: #dadfe6;margin-top:24px;"></div>'+
'						<div class="item-total-amount m-t-24">'+
'							Total Amount: <span>₹ 899.00</span>'+
'						</div>'+
'					</div>'+
'					<div class="delivery-address-div d-flex m-t-56">'+
'						<div class="delivery-address-sub-div">'+
'							<div class="delivery-address-title">Delivery Address</div>'+
'							<div class="delivery-address">'+
'								Rahul Sharma<br>'+
'								Kandivali, Mumbai, Maharashtra<br>'+
'								Pincode - 400067'+
'							</div>	'+
'						</div>'+
'						<div class="delivery-address-img-div">'+
'							<img src="'+email_images+'delivery-address-map-img.svg">'+
'						</div>'+
'					</div>'+
'					<div class="m-t-56">'+
'						<img src="'+email_images+'delivery-man-img.svg">'+
'						<div class="regards-div m-t-48">Best Regards!</div>'+
'						<div class="regards-customer-name">Stacy Classy</div>'+
'					</div>'+
'					<div class="m-t-48" style="height: 1px;opacity: 0.84;background-color: #dadfe6;"></div>'+
'					<div class="m-t-40">'+
'						<div class="footer-data">'+
'							In case you are facing any issue, feel free to call me at <span>+91 9512894800</span> <br>'+
'							any time between 10 am to 7 pm (Monday to Friday).'+
'						</div>'+
'						<div class="footer-data-1">'+
'							I will be happy to help you in every possible way to fix your issue at the earliest.'+
'						</div>'+
'					</div>'+
'				</div>					'+
'			</div>'+
'			<div class="footer-content m-t-48">'+
'				<div class="company-name">iThink Logistics</div>'+
'				<div class="company-address m-t-12">'+
'					101, First Floor, Gaurav Palace, Opposite Bal Bharti College, Kandivali West,<br> '+
'					Mumbai, Maharashtra 400067'+
'				</div>'+
'				<div class="company-website m-t-12">ithinklogistics.com</div>'+
'				<div class="company-social-link m-t-20">'+
'					<a href="'+facebook_link+'" target="_blank"><img src="'+email_images+'fb.svg" class="m-r-24"/></a>'+
'					<a href="'+twitter_link+'" target="_blank"><img src="'+email_images+'tw.svg" class="m-r-24"/></a>'+
'					<a href="'+insta_link+'" target="_blank"><img src="'+email_images+'ins.svg" class="m-r-24"/></a>'+
'					<a href="'+youtube_link+'" target="_blank"><img src="'+email_images+'you-t.svg" class="m-r-24"/></a>'+
'					<a href="'+linkedin_link+'" target="_blank"><img src="'+email_images+'link.svg" /></a>'+
'				</div>'+
'				<div class="company-link">'+
'					<a class="m-r-20">Contact Us</a>'+
'					<a class="m-r-20">Terms of Use</a>'+
'					<a >Privacy Policy</a>'+
'				</div>'+
'				<div class="designed-by">© 2020 Depasser Infotech Pvt. Ltd. All Rights Reserved.</div>'+
'			</div>'+
'		</body>'+
'	</html>';


exports.send_mail_aws = async function(sendto,cc, subject, text) 
{ 
  AWS.config.update({
    accessKeyId: "AKIAQG3FDVKGACNMHB6X",
    secretAccessKey: "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",
    region: "us-east-1"
  });
  
  const ses = new AWS.SES({ apiVersion: "2010-12-01" });
  return Promise.resolve().then(() => {
    let sendRawEmailPromise;

    const mail = mailcomposer({
      from: 'info@ithinklogistics.com',
      to: sendto,
      cc: cc,
      subject: subject,
      html : text,
      
    });

    return new Promise((resolve, reject) => {
      mail.build((err, message) => {
        if (err) {
          console.log("reject");
          reject(0);
        }
        sendRawEmailPromise = ses.sendRawEmail({RawMessage: {Data: message}}).promise();
      });
      console.log("done");
      resolve(1);
    });
  });
}


exports.send_mail_aws_by_array = async function(email_array) 
{ 
  AWS.config.update({
    accessKeyId: "AKIAQG3FDVKGACNMHB6X",
    secretAccessKey: "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",
    region: "us-east-1"
  });
  const ses = new AWS.SES({ apiVersion: "2010-12-01" });
  var email_images = 'https://new-itl-uploads.s3.ap-south-1.amazonaws.com/images/email_images/';

  //console.log(email_images);
  var facebook_link = 'https://www.facebook.com/ithinklogistics/';
  var gplus_link = 'https://plus.google.com/107408749201396492334';
  var twitter_link = 'https://twitter.com/IthinkLogistics';
  var linkedin_link = 'https://www.linkedin.com/company/ithinklogistics/';
  var insta_link = 'https://www.instagram.com/ithinklogistics/';
  var youtube_link = 'https://www.youtube.com/channel/UCjiXa7qJhCqfMSmCRDY6gbw';
  
  
    var send_email = 1;
    var html_content	 = '';
    var base_url 		 = email_array['base_url'];
    var Subject 	 = email_array['subject'];
    var booked_slot     = email_array['booked_slot'];
    var topic_title     = email_array['topic_title'];
    var email_sub_type  = email_array['email_sub_type'];
    var user_name = email_array['user_name'];
    var cc_mail_list = [];
    var email_header = '';
    var email_body = '';
    var email_footer = '';
    if (email_array['email_type'] == 26) //Training session Admin + seller subject,to and body
    {
       	switch (email_sub_type) 
       	{
        	case 1:
        		// registration for the Training session to seller
        		html_content	 = `<div style="border-collapse: collapse;border: 0;margin: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 19px;line-height: 26px;padding-bottom: 20px;">This is to let you know that your registration for training session for ('`+booked_slot+`') with the `+topic_title+` topic selected has been approved. Our Executive will call you on your register number to help you  with the entire process.</div>
                <div style="border-collapse: collapse;border: 0;margin: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 19px;line-height: 26px;padding-top: 20px;">
                	Request you to please be available on the requested timeslot.
                </div>
                <div style="border-collapse: collapse;border: 0;margin: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 19px;line-height: 26px;padding-top: 20px;"> In case you are facing any sort of issue, Feel free to get back to us anytime  +91 9987935514 between 10 am - 7 pm (Monday - Friday). To know more about our services, visit <a href="ithinklogistics.com" target="_blank">ithinklogistics.com</a>.</div>`;
        		break; ;
        	case 2:
        		// registration for the Training session to Admin
        		html_content	 = `<div style="border-collapse: collapse;border: 0;margin: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 19px;line-height: 26px;padding-bottom: 20px;">This is to let you know that a new registration for training session for ('`+booked_slot+`') with '`+topic_title+`  topic selected has been booked for the '`+email_array['vendor_name']+`' and '`+email_array['company_name']+`'. </div>
                <div style="border-collapse: collapse;border: 0;margin: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 19px;line-height: 26px;padding-top: 20px;">
                	Request you to please be available on the requested timeslot.
                </div>`;
        		break;
        	case 3:
        		// Update in scheduled training session to seller
        		html_content	 = `<div style="border-collapse: collapse;border: 0;margin: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 19px;line-height: 26px;padding-bottom: 20px;">This is to let you know that your registration for training session for ('`+booked_slot+`') with the '`+topic_title+`' topic selected has been updated.</div>
                <div style="">
	                <a class="cta-btn" style="color:#ffffff; background-image: linear-gradient(to bottom, #1ea2fa, #168afc 97%, #0e6fff);border-radius: 20px; text-decoration:none;font-weight: bold;padding: 3%;" href="https:'`+base_url+`'account-setting/9" target="_blank">Go to Training Session</a>
	            </div>
                <div style="border-collapse: collapse;border: 0;margin: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 19px;line-height: 26px;padding-top: 20px;"> In case you are facing any sort of issue, Feel free to get back to us anytime  +91 9987935514 between 10 am - 7 pm (Monday - Friday). To know more about our services, visit <a href="ithinklogistics.com" target="_blank">ithinklogistics.com</a>.</div>`;
        		break;
        	case 4:
        		// Thank you for attending tranining session to seller
        		html_content	 = `<div style="border-collapse: collapse;border: 0;margin: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 19px;line-height: 26px;padding-bottom: 20px;">Thank you for attending traning session sucessfully. Hope all the queries has been resolved for the selected topic</div>
                <div style="border-collapse: collapse;border: 0;margin: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 19px;line-height: 26px;padding-top: 20px;"> In case you are facing any sort of issue, Feel free to get back to us anytime  +91 9987935514 between 10 am - 7 pm (Monday - Friday). To know more about our services, visit <a href="ithinklogistics.com" target="_blank">ithinklogistics.com</a>.</div>`;
        		break;
        	case 5:
        		// Training session cancelled to seller
        		html_content	 = `<div style="border-collapse: collapse;border: 0;margin: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 19px;line-height: 26px;padding-bottom: 20px;">This is to let you know that your registration for training session for ('`+booked_slot+`') with the '`+topic_title`+' topic selected has been cancelled.</div>
                <div style="">
	                <a class="cta-btn" style="color:#ffffff; background-image: linear-gradient(to bottom, #1ea2fa, #168afc 97%, #0e6fff);border-radius: 20px; text-decoration:none;font-weight: bold;padding: 3%;" href="https:'`+base_url+`'account-setting/9" target="_blank">Go to Training Session</a>
	            </div>
                <div style="border-collapse: collapse;border: 0;margin: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 19px;line-height: 26px;padding-top: 20px;"> In case you are facing any sort of issue, Feel free to get back to us anytime  +91 9987935514 between 10 am - 7 pm (Monday - Friday). To know more about our services, visit <a href="ithinklogistics.com" target="_blank">ithinklogistics.com</a>.</div>`;
        		break;				
        	default:
        		html_content	 = '';
        		break;
        }
        email_body = `<tr>
          <td valign="top" class="side title" style="border-collapse: collapse;border: 0;margin: 0;padding: 20px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;line-height: 26px;vertical-align: top;background-color: white;border-top: none;">
            <table style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
              <tr>
                <td class="text">
                  <div class="email-title" style="border-collapse: collapse;border: 0;margin: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 26px;line-height: 26px;font-weight: bold;display:block;text-align:center;padding-bottom:20px;">' . `+email_array['subject'] +` '</div>
                  <div class="email-name" style="border-collapse: collapse;border: 0;margin: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;line-height: 26px;padding-bottom:20px;">Hi ' . `+user_name +`',</div>
                  '`+html_content+`'
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    }

    if(email_array['email_type'] == 26)
    {
      cc_mail_list = email_array['cc_email_list'];
    }
    if(email_array['email_type'] == 26)
    {
      email_header = `<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
				    <meta http-equiv="X-UA-Compatible" content="IE=edge">
				    <meta name="viewport" content="width=device-width, initial-scale=1">
					<title></title>
					<style type="text/css">
						.cta-btn {
				        	padding: 2% !important;
				        }
				        .footer-data {
							width: 75%;
				        }
				        .email-title {
				        	font-size: 28px;
				        }
				        .email-name {
				            font-size: 26px;
				        }
						@media (max-width: 1024px){
							
						}
						@media (max-width: 768px){
							.main {
								width: 320px !important;
							}
							.top-image {
								width: 50% !important;
							}
							.inside-footer {
								width: 320px !important;
							}
							table[class="contenttable"] { 
					            width: 320px !important;
					            text-align: left !important;
					        }
					        td[class="force-col"] {
						        display: block !important;
						    }
						     td[class="rm-col"] {
						        display: none !important;
						    }
							.mt {
								margin-top: 15px !important;
							}
							*[class].width300 {width: 255px !important;}
							*[class].block {display:block !important;}
							*[class].blockcol {display:none !important;}
							.emailButton{
					            width: 100% !important;
					        }

					        .emailButton a {
					            display:block !important;
					            font-size:18px !important;
					        }

					        .cta-btn {
					        	padding: 4%;
					        }

					        .footer-data {
							    width: 95%;
							}

							.email-title {
					        	font-size: 20px;
					        }
						}
						@media (max-width: 375px){
							
						}
						@media (max-width: 320px){
							
						}
						@media (min-width: 769px){
							.main.contenttable {
								width:600px;
							}
						}
						@media (min-width: 1026px) {
							
						}
						@media screen and (max-width: 575px) {
							.email-name {
    				            font-size: 22px;
    				        }
						}
					</style>
				</head>
				<body link="#00a5b5" vlink="#00a5b5" alink="#00a5b5">
					<table class=" main contenttable" align="center" style="font-weight: normal;border-collapse: collapse;border: 0;margin-left: auto;margin-right: auto;padding: 0;font-family: Arial, sans-serif;color: #555559;background-color: white;font-size: 16px;line-height: 26px;">
						<tr>
							<td class="border" style="border-collapse: collapse;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;">
								<table style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
									<tr>
										<td colspan="4" valign="top" class="image-section" style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;background-color: #fff;">
											<a href="http://ithinklogistics.com" target="_blank"><img class="top-image" src="`+email_images+`itl-horizontal.png" style="line-height: 1;width: 40%;" alt="iThink Logistics"></a>
										</td>
									</tr>`;
    }
    
    if(email_array['email_type'] == 26)
    {
      email_footer = `<tr bgcolor="#fff" style="border-top: 2px solid #4FACFE;">
									<td valign="top" class="footer" style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;line-height: 26px;background: #fff;text-align: center;">
										<table style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
											<tr>
												<td class="inside-footer" align="center" valign="middle" style="border-collapse: collapse;border: 0;margin: 0;padding: 20px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 16px;vertical-align: middle;">
													<div class="footer-data">
														<b>&copy; iThink Logistics '.date('Y').'</b><br><br>
			                            				101, First Floor, Gaurav Palace, opposite Bal Bharti college, Kandivali West, Mumbai, Maharashtra 400067<br><br>
			                   
			                            				<a href="https://www.ithinklogistics.com" style="text-decoration:none;">www.ithinklogistics.com</a><br><br>
			                            				<a href="`+facebook_link+`" target="_blank"><img src="`+email_images+`facebook-new.png" /></a>
														<a href="`+twitter_link+`" target="_blank"><img src="`+email_images+`twitter-new.png" /></a>
														<a href="`+insta_link+`" target="_blank"><img src="`+email_images+`instagram-new.png" /></a>
														<a href="`+youtube_link+`" target="_blank"><img src="`+email_images+`youtube-new.png" /></a>
														<a href="`+linkedin_link+`" target="_blank"><img src="`+email_images+`linkedin-new.png" /></a>
													</div>
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</body>
		</html>`;
    }


  return Promise.resolve().then(() => {
    let sendRawEmailPromise;

    const mail = mailcomposer({
      from: 'info@ithinklogistics.com',
      to: email_array['email'],
      cc: cc_mail_list,
      subject: Subject,
      html : email_header+email_body+email_footer,
      
    });

    return new Promise((resolve, reject) => {
      mail.build((err, message) => {
        if (err) {
          console.log("reject");
          reject(0);
        }
        sendRawEmailPromise = ses.sendRawEmail({RawMessage: {Data: message}}).promise();
      });
      console.log("done");
      resolve(1);
    });
  });
}