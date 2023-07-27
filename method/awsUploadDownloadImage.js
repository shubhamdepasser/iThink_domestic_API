var fs = require('fs');  
const Jimp = require('jimp');
var aws = require('aws-sdk')

/**
 * Module exports.
 * @public
 */
module.exports = base64ToImage;

/**
 * Change base64Str to image and write image file with 
   the specified file name to the specified file path.
 * @param {String} base64 string (mandatory)
 * @param {String} file path e.g. /opt/temp/uploads/ (mandatory)
 * @return {Object} optionsObj holds image type, image filename, debug e.g.{'fileName':fileName, 'type':type,'debug':true} (optional)
 * @public
 */
    exports.awsUploadImage = async (image,aws_path) => {
    
        await new Promise(async resolve_main =>{
            console.log("done 1");
            var file_type= image.substring("data:image/".length, image.indexOf(";base64"));
            //console.log(file_type)
            var path = require('path');
            __dirname = path.resolve();
            var path1 =  __dirname + '/images/temp/';
            var unique_key = md5(randomize('*', 30)).substr(0, 32);
            var optionalObj = {'fileName': unique_key+"."+file_type};
            //console.log(optionalObj)
            var imageInfo = await base64ToImage(image, path1, optionalObj,aws_path);
                
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
    async function base64ToImage(base64Str, path, optionalObj,aws_path) {
    await new Promise(async resolve_main =>{
        console.log("done 2");
        if (!base64Str || !path) {
            throw new Error('Missing mandatory arguments base64 string and/or path string');
        }
        
        //var optionalObj = optionalObj || {};
        //var imageBuffer = decodeBase64Image(base64Str);
        //var imageType = optionalObj.type || imageBuffer.type || 'png';
        var imageType = optionalObj.type || 'png';
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
        })
        .catch(err => {
            console.log("Upload failed:", err);
            resolve_main(0);
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
};
