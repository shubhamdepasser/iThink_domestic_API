const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const accountSettingController = require('./../controllers/accountSettingsController');
const billingController = require('./../controllers/billingController');
const viewOrderController = require('./../controllers/viewOrderController');
const toolController = require('./../controllers/toolsController');
const { request } = require('../app');



router.post('/login', authController.login);
router.post('/forgot_password', authController.forgot_password);
router.post('/reset_password', authController.reset_password);
router.post('/get_otp', authController.get_otp);
router.post('/verify_otp', authController.verify_opt);
router.post('/get_pincode_state_city', authController.get_pincode_state_city);
router.post('/get_current_balance', authController.get_current_balance);
router.post('/change_password', accountSettingController.change_password);
router.post('/warehouseAddressAddEdit', accountSettingController.warehouseAddressAddEdit);
router.post('/viewWarehouseAddress', accountSettingController.viewWarehouseAddress);
router.post('/add_edit_poc_contact_details', accountSettingController.add_edit_poc_contact_details);
router.post('/delete_poc_contact_details', accountSettingController.delete_poc_contact_details);
router.post('/poc_contact_details', accountSettingController.poc_contact_details);
router.post('/view_rate_us', accountSettingController.view_rate_us);
router.post('/update_rate_us', accountSettingController.update_rate_us);
router.post('/add_training_session', accountSettingController.add_training_session);
router.post('/view_training_session', accountSettingController.view_training_session);
router.post('/update_invoice_setting', accountSettingController.update_invoice_setting);
router.post('/Accept_contract_acceptance', accountSettingController.Accept_contract_acceptance);
router.post('/view_invoice_setting_details', accountSettingController.view_invoice_setting_details);
router.post('/update_label_setting', accountSettingController.update_label_setting);
router.post('/view_label_setting', accountSettingController.view_label_setting);
router.post('/view_billing_address', accountSettingController.view_billing_address);
router.post('/view_account_settings', accountSettingController.view_account_settings);
router.post('/update_account_details', accountSettingController.update_account_details);
router.post('/update_kyc_details', accountSettingController.update_kyc_details);
router.post('/add_billing_address', accountSettingController.add_billing_address);
router.post('/view_contract_acceptance', accountSettingController.view_contract_acceptance);
router.post('/view_rate_chart', accountSettingController.view_rate_chart);
router.post('/view_bank_details', accountSettingController.view_bank_details);
router.post('/view_api_key_details', accountSettingController.view_api_key_details);
router.post('/get_widget_remittance', billingController.get_widget_remittance);
router.post('/get_widget_shipping_charge', billingController.get_widget_shipping_charge);
router.post('/get_widget_wallet_transactions', billingController.get_widget_wallet_transactions);
router.post('/get_widget_bill_summary', billingController.get_widget_bill_summary);
router.post('/get_widget_credit_receipt', billingController.get_widget_credit_receipt);
router.post('/all_credit_receipt_table_data', billingController.all_credit_receipt_table_data);
router.post('/all_bill_summary_table_data', billingController.all_bill_summary_table_data);
router.post('/all_remittance_table_data', billingController.all_remittance_table_data); 
router.post('/all_shipping_charge_table_data', billingController.all_shipping_charge_table_data); 
router.post('/all_wallet_transactions_table_data', billingController.all_wallet_transactions_table_data);
router.post('/view_invoice_details_data', billingController.view_invoice_details_data);
router.post('/filter_data', billingController.filter_data);
router.post('/export_data', billingController.export_data);

router.post('/viewOrderViewDetails', viewOrderController.viewOrderViewDetails);
router.post('/viewOrderMyStoreOrderDetails', viewOrderController.viewOrderMyStoreOrderDetails);
router.post('/createOrder', viewOrderController.createOrder);
router.post('/get_pickup_address', viewOrderController.get_pickup_address);
router.post('/get_logistics_list', viewOrderController.get_logistics_list);
router.post('/add_edit_pickup_address', viewOrderController.add_edit_pickup_address);
router.post('/delete_pickup_address', function(req, res){viewOrderController.delete_pickup_address});
//router.use(authController.protect);\

router.post('/pincode_services',  toolController.pincode_services);

module.exports = router;