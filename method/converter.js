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
   

async function base64ToImage(base64Str, path, optionalObj) {
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
    var data;
    console.log("done 3");
    var fileStream = await fs.createReadStream(abs);
        var filestreamdata = await new Promise(resolve =>{ 
            fileStream.on('error', function(err) {
                console.log('File Error', err);
                resolve(err);
            });
            resolve("err");
        });
        var Buffer = require('buffer/').Buffer;
        //fileStream.setEncoding('UTF8');
        var i = 0;
        filestreamdata = await new Promise(resolve =>{
            fileStream.on('readable', function(chunk) {
                while ((chunk=fileStream.read()) != null) {
                    if(i == 0)
                    {
                        data = chunk;
                        //console.log(chunk);
                    }
                    else{
                        data = Buffer.concat([data, chunk]);
                        //console.log(chunk);

                    }
                    i++;
                }
                resolve("");
            });
            console.log("done 4");
            fileStream.on('open', function (chunk) {
                
            });
        });
        console.log(fileName);
                var base64data = new Buffer(data, 'binary');
                aws.config.update({
                    accessKeyId: "AKIAQG3FDVKGNBZU2WPD",
                    secretAccessKey: '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',
                    region: 'ap-south-1'
                });
                const s3 = new aws.S3();
                s3.putObject({
                    Bucket: 'new-itl-uploads',
                    Key: 'uploads/nodejs_uploads/company_logo/temp_file/'+fileName,
                    ACL: 'public-read',
                    Body: fs.readFileSync(abs),
                })
                .promise()
                .then(res => {
                 console.log(`Upload succeeded - `, res);
                })
                .catch(err => {
                 console.log("Upload failed:", err);
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
    

/**
 * Decode base64 string to buffer.
 *
 * @param {String} base64Str string
 * @return {Object} Image object with image type and data buffer.
 * @public
 */
function decodeBase64Image(base64Str) {
    var matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    var image = {};
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 string');
    }

    image.type = matches[1];
    //const buffer = Buffer.from(data, "base64");
    image.data = new Buffer.from(matches[2], 'base64');

    return image;
}