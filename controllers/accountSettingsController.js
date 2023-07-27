const {
    promisify
} = require('util');
const AccountSetting = require('../services/accountSettingsServices');
var express = require('express');
var access_token = process.env.access_token;
var secret_key = process.env.secret_key;

exports.change_password = async (req, res, next) => 
{
    //HII
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.change_password(form_data, req, res, next);
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
exports.change_password = async (req, res, next) => 
{
    //HII
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.change_password(form_data, req, res, next);
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

exports.warehouseAddressAddEdit = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.warehouseAddressAddEdit(form_data, req, res, next);
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
exports.viewWarehouseAddress = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.viewWarehouseAddress(form_data, req, res, next);
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
exports.add_edit_poc_contact_details = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            console.log("1");
            AccountSetting.add_edit_poc_contact_details(form_data, req, res, next);
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
exports.delete_poc_contact_details = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.delete_poc_contact_details(form_data, req, res, next);
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

exports.poc_contact_details = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.poc_contact_details(form_data, req, res, next);
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


exports.update_rate_us = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.update_rate_us(form_data, req, res, next);
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

exports.view_rate_us = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.view_rate_us(form_data, req, res, next);
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


exports.add_training_session = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.add_training_session(form_data, req, res, next);
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

exports.view_training_session = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.view_training_session(form_data, req, res, next);
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

exports.update_invoice_setting = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.update_invoice_setting(form_data, req, res, next);
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
exports.view_invoice_setting_details = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.view_invoice_setting(form_data, req, res, next);
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

exports.update_label_setting = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.update_label_setting(form_data, req, res, next);
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

exports.view_label_setting = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.view_label_setting(form_data, req, res, next);
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
exports.view_billing_address = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.view_billing_address(form_data, req, res, next);
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


exports.view_account_settings = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.view_account_settings(form_data, req, res, next);
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

exports.add_billing_address = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.add_billing_address(form_data, req, res, next);
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

exports.view_contract_acceptance = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.view_contract_acceptance(form_data, req, res, next);
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
exports.Accept_contract_acceptance = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.Accept_contract_acceptance(form_data, req, res, next);
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

exports.view_rate_chart = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.view_rate_chart(form_data, req, res, next);
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
exports.view_bank_details = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.view_bank_details(form_data, req, res, next);
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

exports.view_api_key_details = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.view_api_key_details(form_data, req, res, next);
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
exports.update_account_details = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.update_account_details(form_data, req, res, next);
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
exports.update_kyc_details = async (req, res, next) => 
{
    try 
    {
        const {
            form_data
        } = req.body;
        
        if(form_data.access_token == access_token && form_data.secret_key == secret_key)
        {
            AccountSetting.update_kyc_details(form_data, req, res, next);
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