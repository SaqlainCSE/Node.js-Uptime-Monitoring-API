//dependencies.............................
const fs = require('fs');
const path = require('path');

const lib = {};

//base directiry of data folder.............
lib.basedir = path.join(__dirname, '/../.data/');

//write data to file........................
lib.create = function(dir, file, data, callback){
    //open file for writting................
    fs.open(lib.basedir+dir+'/'+file+'.json','wx',function(err, fileDescriptor){
        if(!err && fileDescriptor){
            //convert data to string........
            const stringData = JSON.stringify(data);

            //write data to file and close it.....
            fs.writeFile(fileDescriptor, stringData, function(err){
                if(!err){
                    fs.close(fileDescriptor, function(err) {
                        if(!err){
                            callback(false);
                        }
                        else{
                            callback('Error closing the new file!!!');
                        }
                    });
                }
                else{
                    callback('Error writting to new file');
                }
            });
        }
        else{
            callback(err);
        }
    });
};

//read data to file........................
lib.read = function(dir,file,callback){
    fs.readFile(lib.basedir+dir+'/'+file+'.json', 'utf-8', function(err, data){
        callback(err, data);
    });
};

//update data to file.......................
lib.update = function(dir,file,data,callback){
    fs.open(lib.basedir+dir+'/'+file+'.json', 'r+', function(err,fileDescriptor){
        if(!err && fileDescriptor){

            const stringData = JSON.stringify(data);

            fs.ftruncate(fileDescriptor, function(err){
                if(!err){
                    fs.writeFile(fileDescriptor, stringData, function(err){
                        if(!err){
                            fs.close(fileDescriptor, function(err){
                                if(!err){
                                    callback(false);
                                }
                                else{
                                    callback("Error closing file");
                                }
                            });
                        }
                        else{
                            callback('Error writting the file');
                        }
                    });
                }
                else{
                    callback('Error trucation file');
                }
            });
        }
        else{
            console.log('Error updating. file not exist');
        }
    });
};

//delete data to file........................
lib.delete = function (dir,file,callback) {
    fs.unlink(lib.basedir+dir+'/'+file+'.json', function(err){
        if(!err){
            callback(false);
        }else{
            callback('Error deleting file!!');
        }
    });
};

//list all the items in a directory..........
lib.list = (dir, callback) => {
    fs.readdir(lib.basedir+dir+'/',(err,fileNames)=> {
        if(!err && fileNames && fileNames.length > 0){
            const trimmedFileNames = [];

            fileNames.forEach((fileName) => {
                trimmedFileNames.push(fileName.replace('.json',''));
            });
            callback(false,trimmedFileNames);
        } else {
            callback("Error Reading Directory!");
        }
    });
};

module.exports = lib;

