var aws = require('aws-sdk')
var express = require('express')
var multer = require('multer')
var multerS3 = require('multer-s3')
const imageToBase64 = require('image-to-base64');
const md5 = require('md5');
const date = require('date-and-time');
var randomize = require('randomatic');
var fs = require('fs');
var base64ToImage = require('../method/base64ToImage');
const pdf2base64 = require('pdf-to-base64');
const uploadFiles3 = require('./../method/upoadFile');
const uploadFileNew = require('./../method/awsUploadDownloadImage');
var app = express();
const Jimp = require('jimp');
const { resize } = require('jimp');
var base64image;

 
    aws.config.update({
        accessKeyId: "AKIAQG3FDVKGNBZU2WPD",
        secretAccessKey: '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',
        region: 'ap-south-1'
    });
    var s3 = new aws.S3();
    var file_type= '';

    var upload_file_name = '';   
    var fileContent;
    var storage = multer.diskStorage({ 
        destination: function (req, file, cb) { 
        //console.log('upload12')
            // Uploads is the Upload_folder_name 
            cb(null, "./images/size_large") 
        }, 
        filename: function (req, file, cb) { 
            fileContent = file;
            let extArray = file.mimetype.split("/");
            let extension = extArray[extArray.length - 1];
            upload_file_name = md5(randomize('*', 30)).substr(0, 30)+'.'+extension;
        cb(null, upload_file_name) 
        } 
    }) 

    const maxSize = 4 * 1000 * 1000; //2 mb
    

    var upload = multer({  
        storage: storage, 
        limits: { fileSize: maxSize }, 
        fileFilter: function (req, file, cb){ 
            //console.log('upload1')
            // Set the filetypes, it is optional 
            var filetypes = /jpeg|jpg|png/; 
            var mimetype = filetypes.test(file.mimetype); 
            console.log("mimetype = " + mimetype);
    
            var extname = filetypes.test(path.extname( 
                        file.originalname).toLowerCase()); 
            //console.log(extname)
            if (mimetype && extname) { 
               // fileContent = fs.readFileSync(fileName);
                return cb(upload_s3, true); 
            } 
        
            cb("Error: File upload only supports the "
                    + "following filetypes - " + filetypes); 
        }  
  
    // mypic is the name of file attribute 
    })
    
    const fileFilter = (req, file, cb) =>
    {
        if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
            file_type = file.mimetype;
            console.log('upload1')
            cb(null, true);
        }
        else
        {
            console.log('upload1')
            cb(new console.error('Invalid file type, Only Jpeg and PNG'),false)
        }
    }


    const uploads3 = multer({
        fileFilter: fileFilter,
        storage: multerS3({
            
            s3: s3,
            bucket: 'new-itl-uploads',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            acl: 'public-read',
            metadata: function (req, file, cb) {
            cb(null, {fieldName: 'Testing_meta_data!'});
            },
            key: function (req, file, cb) {
                console.log('upload1');
                let extArray = file.mimetype.split("/");
                let extension = extArray[extArray.length - 1];
                upload_file_name = md5(randomize('*', 30)).substr(0, 30)+'.'+extension;
                cb(null, "uploads/nodejs_uploads/company_logo/temp_file/"+upload_file_name)
            }
        })
    });

    exports.upload_S3 = async (file,extension,base64image,path) => {
        return new Promise(async function(resolve, reject) 
        {
        //const { stream, filename} = file;
        console.log("done 3");
        //console.log(file);
        console.log(extension);
        //console.log(base64image);
        console.log(path);
        
        aws.config.update({
            accessKeyId: "AKIAQG3FDVKGNBZU2WPD",
            secretAccessKey: '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',
            region: 'ap-south-1'
        });
        var upload_file_name = '';
        var data;
        
        console.log("file");
        //console.log(upload_file_name);
        let params = {
            Bucket: 'new-itl-uploads',
            Key: path+base64image,
            Body: file,
            ACL: 'public-read',

            ContentType: "image/png",
            ContentEncoding: "base64"
        };
        await new aws.S3().putObject(params).promise().then(() => {
            console.log("uploaded")
            resolve(1);
            return 1;
            
        }).catch((err) => { 
            console.log(`Error: `+err);
            resolve(0);
            return 0;
        });
     });
    }
    exports.awsUploadImage = async (image,aws_path) => {
    
        return await new Promise(async resolve_main =>{
            console.log("done 1");
            var file_type= 'png';
            //console.log(file_type)
            var path = require('path');
            __dirname = path.resolve();
            var path1 =  __dirname + '/images/temp/';
            var unique_key = md5(randomize('*', 30)).substr(0, 32);
            var optionalObj = {'fileName': unique_key+"."+file_type};
            //console.log(optionalObj)
            var imageInfo = await base64ToImages(image, path1, optionalObj,aws_path);
                
            if(imageInfo !== 0)
            {
                console.log(path1+unique_key+"."+file_type);
                resolve_main(unique_key+"."+file_type);
                return unique_key+"."+file_type;
            }
            else
            {
                console.log("fails");
                resolve_main("error");
                return "error";
            }
        });
    }
    async function base64ToImages(base64Str, path, optionalObj,aws_path) {
        return await new Promise(async resolve_main =>{
            console.log("done 2");
            if (!base64Str || !path) {
                throw new Error('Missing mandatory arguments base64 string and/or path string');
            }
            
            //var optionalObj = optionalObj || {};
            //var imageBuffer = decodeBase64Image(base64Str);
            //var imageType = optionalObj.type || imageBuffer.type || 'png';
            var imageType = 'png';
            var fileName = optionalObj.fileName || 'img-' + Date.now();
            var abs;
            var fileName = '' + fileName;
    
            if (fileName.indexOf('.') === -1) {
                imageType = imageType.replace('image/', '');
                fileName = fileName + '.' + imageType;
            }
            
            abs = path + fileName;
            let base64Image = base64Str.split(';base64,').pop();
            await new Promise(resolve =>{ 
                fs.writeFile(abs, base64Image, {encoding: 'base64'}, function() {
                    console.log('File created');
                    resolve(1);
    
                });
            });
            var paths = require('path');
            __dirname = paths.resolve();
            var path1 =  __dirname + '/images/size_small/';
        
            var abs2 = path1 + fileName;
                const image = await Jimp.read(abs);
                await image.resize(150, 150);
                await image.quality(100);
                await image.writeAsync(abs2);
    
            var path2 =  __dirname + '/images/size_medium/';
            var abs3 = path2 + fileName;
                const image1 = await Jimp.read(abs);
                await image1.resize(296, 296);
                await image1.quality(100);
                await image1.writeAsync(abs3);  
                
            var path3 =  __dirname + '/images/size_large/';
            var abs4 = path3 + fileName;
                const image2 = await Jimp.read(abs);
                await image2.resize(450, 450);
                await image2.quality(100);
                await image2.writeAsync(abs4);      
            var data;
            console.log("done 3");
            aws.config.update({
                accessKeyId: "AKIAQG3FDVKGNBZU2WPD",
                secretAccessKey: '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',
                region: 'ap-south-1'
            });
            const s3 = new aws.S3();
            s3.putObject({
                Bucket: 'new-itl-uploads',
                Key: aws_path+'temp_file/'+fileName,
                ACL: 'public-read',
                Body: fs.readFileSync(abs),
            })
            .promise()
            .then(res => {
                console.log(`Upload succeeded - temp_file`, res);
            })
            .catch(err => {
                console.log("Upload failed:", err);
            });
    
            s3.putObject({
                Bucket: 'new-itl-uploads',
                Key: aws_path+'size_small/'+fileName,
                ACL: 'public-read',
                Body: fs.readFileSync(abs2),
            })
            .promise()
            .then(res => {
                console.log(`Upload succeeded - size_small`, res);
            })
            .catch(err => {
                console.log("Upload failed:", err);
            });
    
            s3.putObject({
                Bucket: 'new-itl-uploads',
                Key: aws_path+'size_medium/'+fileName,
                ACL: 'public-read',
                Body: fs.readFileSync(abs3),
            })
            .promise()
            .then(res => {
                console.log(`Upload succeeded - size_medium`, res);
            })
            .catch(err => {
                console.log("Upload failed:", err);
            });
    
            s3.putObject({
                Bucket: 'new-itl-uploads',
                Key: aws_path+'size_large/'+fileName,
                ACL: 'public-read',
                Body: fs.readFileSync(abs4),
            })
            .promise()
            .then(res => {
                console.log(`Upload succeeded - size_large`, res);
                resolve_main(1);
                return 1;
            })
            .catch(err => {
                console.log("Upload failed:", err);
                resolve_main(0);
                return 0;
            });
            //setTimeout(async function(){ 
        
            //var buf = Buffer.from(data, 'UTF-8');
            //var buf = new Buffer(base64Str.replace(/^data:image\/\w+;base64,/, ""),'base64');
            
            //let buf2 = JSON.stringify(buf);
            //fs.writeFileSync('./images/temp/test4.jpeg', buf);
            
            
            //console.log(single_upload);
               //return fileName;
            //}, 2000);
        });
    }    

    exports.awsUploadPDF = async (image,aws_path) => {
    
        return await new Promise(async resolve_main =>{
            console.log("done 1");
            var file_type= 'pdf';
            //console.log(file_type)
            var path = require('path');
            __dirname = path.resolve();
            var path1 =  __dirname + '/images/temp/';
            var unique_key = md5(randomize('*', 30)).substr(0, 32);
            var optionalObj = {'fileName': unique_key+".pdf"};
            //console.log(optionalObj)
            var imageInfo = await base64ToPDF(image, path1, optionalObj,aws_path);
                
            if(imageInfo !== 0)
            {
                console.log(path1+unique_key+"."+file_type);
                resolve_main(unique_key+"."+file_type);
                return unique_key+"."+file_type;
            }
            else
            {
                console.log("fails");
                resolve_main("error");
                return "error";
            }
        });
    }
    async function base64ToPDF(base64Str, path, optionalObj,aws_path) {
        return await new Promise(async resolve_main =>{
            console.log("done 2");
            if (!base64Str || !path) {
                throw new Error('Missing mandatory arguments base64 string and/or path string');
            }
            
            //var optionalObj = optionalObj || {};
            //var imageBuffer = decodeBase64Image(base64Str);
            //var imageType = optionalObj.type || imageBuffer.type || 'png';
            var imageType = 'pdf';
            var fileName = optionalObj.fileName || 'img-' + Date.now();
            var abs;
            var fileName = '' + fileName;
    
            if (fileName.indexOf('.') === -1) {
                imageType = imageType.replace('image/', '');
                fileName = fileName + '.' + imageType;
            }
            
            abs = path + fileName;
            let base64Image = base64Str.split(';base64,').pop();
            await new Promise(resolve =>{ 
                fs.writeFile(abs, base64Image, {encoding: 'base64'}, function() {
                    console.log('File created');
                    resolve(1);
    
                });
            });
              
            var data;
            console.log("done 3");
            aws.config.update({
                accessKeyId: "AKIAQG3FDVKGNBZU2WPD",
                secretAccessKey: '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',
                region: 'ap-south-1'
            });
            const s3 = new aws.S3();
            s3.putObject({
                Bucket: 'new-itl-uploads',
                Key: aws_path+'temp_file/'+fileName,
                ACL: 'public-read',
                Body: fs.readFileSync(abs),
            })
            .promise()
            .then(res => {
                console.log(`Upload succeeded - temp_file`, res);
                resolve_main(1);
                return 1;
            })
            .catch(err => {
                console.log("Upload failed:", err);
                resolve_main(0);
                return 0;
            });
    
           
            //setTimeout(async function(){ 
        
            //var buf = Buffer.from(data, 'UTF-8');
            //var buf = new Buffer(base64Str.replace(/^data:image\/\w+;base64,/, ""),'base64');
            
            //let buf2 = JSON.stringify(buf);
            //fs.writeFileSync('./images/temp/test4.jpeg', buf);
            
            
            //console.log(single_upload);
               //return fileName;
            //}, 2000);
            
        });
    }    
    exports.get_images_S3 = async (path,file_name) => {
        return new Promise(async function(resolve, reject) 
        {
        try 
        {
            console.log("enter");
            aws.config.update({
                accessKeyId: "AKIAQG3FDVKGNBZU2WPD",
                secretAccessKey: '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',
                region: 'ap-south-1'
            });
                let s3 = new aws.S3();
                    const data = await s3.getObject(
                    {
                        Bucket: 'new-itl-uploads',
                        Key: path+file_name
                    }
                    
                    ).promise();
                    console.log("data");
                    console.log(data);
                    var response;
                    fs.writeFileSync('./images/temp/'+file_name, data.Body);
                    imageToBase64("./images/temp/"+file_name)
                    .then(
                        (response) => {
                            console.log(response); // "cGF0aC90by9maWxlLmpwZw=="
                            response = "data:image/jpeg;base64,"+response;
                            fs.unlinkSync('./images/temp/'+file_name);
                            resolve(response);
                            return response;
                            
                        }
                    )
                    .catch(
                        (error) => {
                            console.log(error); // Logs an error if there was one
                        }
                    )
                    
                    //console.log(response);
                    //resolve(response);
                    //return response;
        } 
        catch(e)
        {
            //return 'error';
            resolve("");
            return "";
        }
        });
        
    }
    exports.get_pdf_S3 = async (path,file_name) => {
        return new Promise(async function(resolve, reject) 
        {
        try 
        {
            console.log("enter");
            aws.config.update({
                accessKeyId: "AKIAQG3FDVKGNBZU2WPD",
                secretAccessKey: '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',
                region: 'ap-south-1'
            });
                let s3 = new aws.S3();
                    const data = await s3.getObject(
                    {
                        Bucket: 'new-itl-uploads',
                        Key: path+file_name
                    }
                    
                    ).promise();
                    console.log("data");
                    console.log(data);
                    var response;
                    fs.writeFileSync('./images/temp/'+file_name, data.Body);
                    pdf2base64("./images/temp/"+file_name)
                    .then(
                        (response) => {
                            console.log(response); // "cGF0aC90by9maWxlLmpwZw=="
                            response = "data:application/pdf;base64,"+response;
                            fs.unlinkSync('./images/temp/'+file_name);
                            resolve(response);
                            return response;
                        }
                    )
                    .catch(
                        (error) => {
                            console.log(error); //Exepection error....
                        }
                    ) 
                    //console.log(response);
                    //resolve(response);
                    //return response;
        } 
        catch(e)
        {
            console.log(e);
            //return 'error';
            resolve("");
            return "";
        }
        });
        
    }
    
      
exports.image_upload = async (image,path) => 
{
    return new Promise(async function(resolve, reject) 
    {
    try 
    {
        base64image = await base64ToImage.base64ToImage(image);
          
        console.log("base64image");
        resolve(base64image);
        return base64image;
        
    }
    
    catch(e)
    {
        //return 'error';
        resolve("error");
    }
    //resolve("done");  
    });
};

exports.resize = async (image) => 
{
    
    var data_size_medium;
    var fs_size_medium = require('fs');
    var path = require('path');
    __dirname = path.resolve();
    
    var path2 =  __dirname + '/images/size_medium/';
    var fileStream_size_medium = await fs.createReadStream(path2+'94e690b3dbc65ee8ed84baebb03056bf.jpeg');
    var filestreamdata_size_medium = await new Promise(resolve =>{ 
        fileStream_size_medium.on('error', function(err) {
            console.log('File Error', err);
            resolve(err);
        });
        resolve("");
    });
    var Buffer_size_medium = require('buffer/').Buffer;
    //fileStream.setEncoding('UTF8');
    var i_size_medium = 0;
    filestreamdata_size_medium = await new Promise(resolve =>{
        fileStream_size_medium.on('readable', function(chunk) {
            while ((chunk=fileStream_size_medium.read()) != null) {
                if(i == 0)
                {
                    data_size_medium = chunk;
                }
                else{
                    data_size_medium = Buffer.concat([data_size_medium, chunk]);
                }
                i_size_medium++;
            }
            resolve("");
        });
    });
    setTimeout(async () => {
        const single_upload_size_medium = await uploadFiles3.upload_S3(data_size_medium,ext,"uploads/nodejs_uploads/company_logo/size_medium/"+base64image);
        if(single_upload_size_medium == 0)
        {
            return 'error';
        }
        fs_size_medium.unlinkSync('./images/size_medium/'+base64image);
    }, 300);
    

    var data_size_large;
    var fileStream_size_large = await fs.createReadStream('./images/size_large/'+base64image);
    var filestreamdata_size_large = await new Promise(resolve =>{ 
        fileStream_size_large.on('error', function(err) {
            console.log('File Error', err);
            resolve(err);
        });
        resolve("");
    });
    var Buffer_size_large = require('buffer/').Buffer;
    //fileStream.setEncoding('UTF8');
    var i_size_large = 0;
    filestreamdata_size_large = await new Promise(resolve =>{
        fileStream_size_large.on('readable', function(chunk) {
            while ((chunk=fileStream_size_large.read()) != null) {
                if(i == 0)
                {
                    data_size_large = chunk;
                }
                else{
                    data_size_large = Buffer.concat([data_size_large, chunk]);
                }
                i_size_large++;
            }
            resolve("");
        });
    });
    setTimeout(async () => {
        const single_upload_size_large = await uploadFiles3.upload_S3(data_size_large,ext,"uploads/nodejs_uploads/company_logo/size_large/"+base64image);
        if(single_upload_size_large == 0)
        {
            return 'error';
        }
        fs.unlinkSync('./images/size_large/'+base64image);
    }, 300); 

    
    var data_size_small;
    var fileStream_size_small = await fs.createReadStream('./images/size_small/'+base64image);
    var filestreamdata_size_small = await new Promise(resolve =>{ 
        fileStream_size_small.on('error', function(err) {
            console.log('File Error', err);
            resolve(err);
        });
        resolve("");
    });
    var Buffer_size_small = require('buffer/').Buffer;
    //fileStream.setEncoding('UTF8');
    var i_size_small = 0;
    filestreamdata_size_small = await new Promise(resolve =>{
        fileStream_size_small.on('readable', function(chunk) {
            while ((chunk=fileStream_size_small.read()) != null) {
                if(i == 0)
                {
                    data_size_small = chunk;
                }
                else{
                    data_size_small = Buffer.concat([data_size_small, chunk]);
                }
                i_size_small++;
            }
            resolve("");
        });
    });
    setTimeout(async () => {
        const single_upload_size_small = await uploadFiles3.upload_S3(data_size_small,ext,"uploads/nodejs_uploads/company_logo/size_small/"+base64image);
        if(single_upload_size_small == 0)
        {
            return 'error';
        }
        else{
            fs.unlinkSync('./images/size_small/'+base64image);
            return 'done';
        }
        

    }, 300);
};