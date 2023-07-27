const validator = require('validator');
const bcrypt = require('bcryptjs');
var express = require('express');
var mysqlpool = require('../dbconfig');
const md5 = require('md5');
var htmlspecialchars = require('htmlspecialchars');
var decode = require('decode-html');
const { json } = require('body-parser');

exports.commonSelectQuery = async function(get_remittance_id_query) 
{
    return new Promise(function(resolve, reject) 
    {
        mysqlpool.getConnection(async function(err, connection) 
        {
            await connection.query(get_remittance_id_query, function (error, results, fields) {
                if (error)
                { 
                    connection.release();
                    reject(error);
                }
                else
                {
                    connection.release();
                    
                    resolve(JSON.stringify(results));
                }
            });
        });
    });
};
