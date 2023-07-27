var os = require('os');
if (os.platform() == 'win32') {  
    if (os.arch() == 'ia32') {
        var chilkat = require('@chilkat/ck-node12-win-ia32');
    } else {
        var chilkat = require('@chilkat/ck-node12-win64'); 
    }
} else if (os.platform() == 'linux') {
    if (os.arch() == 'arm') {
        var chilkat = require('@chilkat/ck-node11-arm');
    } else if (os.arch() == 'x86') {
        var chilkat = require('@chilkat/ck-node11-linux32');
    } else {
        var chilkat = require('@chilkat/ck-node11-linux64');
    }
} else if (os.platform() == 'darwin') {
    var chilkat = require('@chilkat/ck-node11-macosx');
}
const FileSystem = require("fs");
const crypto = require("crypto");

exports.chilkatExample = async function(req, res, next) {

    // This example requires the Chilkat API to have been previously unlocked.
    // See Global Unlock Sample for sample code.

    var crypt = new chilkat.Crypt2();

    crypt.CryptAlgorithm = "aes";

    // CipherMode may be "ecb" or "cbc"
    crypt.CipherMode = "cbc";

    // KeyLength may be 128, 192, 256
    crypt.KeyLength = 128;

    // The padding scheme determines the contents of the bytes
    // that are added to pad the result to a multiple of the
    // encryption algorithm's block size.  AES has a block
    // size of 16 bytes, so encrypted output is always
    // a multiple of 16.
    crypt.PaddingScheme = 0;

    // An initialization vector is required if using CBC mode.
    // ECB mode does not use an IV.
    // The length of the IV is equal to the algorithm's block size.
    // It is NOT equal to the length of the key.
    var ivHex = "cbf816359208641a0e83b4ecff76af6b";
    crypt.SetEncodedIV(ivHex,"hex");

    // The secret key must equal the size of the key.  For
    // 256-bit encryption, the binary secret key is 32 bytes.
    // For 128-bit encryption, the binary secret key is 16 bytes.
    var keyHex = "cbf816359208641a0e83b4ecff76af6bcbf816359208641a0e83b4ecff76af6b";
    crypt.SetEncodedKey(keyHex,"hex");

    // Encrypt a file, producing the .aes as output.
    // The input file is unchanged, the output .aes contains the encrypted
    // contents of the input file.

    // Note: The .aes output file has no file format.  It is simply a stream
    // of bytes that resembles random binary data.
    var inFile = "./images/size_medium/d2df16a7c88f3af53420eb4db0f4b0ca.jpeg";
    var outFile = "./images/size_medium/d2df16a7c88f3af53420eb4db0f4b0ca.jpeg.aes";
    var success = crypt.CkEncryptFile(inFile,outFile);
    if (success !== true) {
        console.log(crypt.LastErrorText);
        //return;
    }

    // For demonstration purposes, a different instance of the object will be used
    // for decryption.
    var decrypt = new chilkat.Crypt2();

    // All settings must match to be able to decrypt:
    decrypt.CryptAlgorithm = "aes";
    decrypt.CipherMode = "cbc";
    decrypt.KeyLength = 128;
    decrypt.PaddingScheme = 0;
    decrypt.SetEncodedIV(ivHex,"hex");
    decrypt.SetEncodedKey(keyHex,"hex");

    // Decrypt the .aes
    inFile = "./images/c9a733d4f7f1021b75f3354ace715c90.jpeg.aes";
    outFile = "./images/c9a733d4f7f1021b75f3354ace715c90.jpeg";
    
    
         
    success = decrypt.CkDecryptFile(inFile,outFile);
    if (success == false) {
        console.log(decrypt.LastErrorText);
        res.status(200).json({
            status : "error",
            status_code : 200,
            message : " !done",
        });
        return;
    }

    console.log("Success!");
    
}


























