const router = require('express').Router();
const fs = require('fs');
const mHost='localhost';
const mUser='root';
const mPassword='zjy123456'
const mDB='test'

// 文件解析器
// 相对路径相对于`app.js`
var path = require("path");  
const filePath = './public/data/';
const multer = require('multer');
const xupload = multer({
    dest: filePath + 'tmp' // 临时文件路径
});

// 递归创建目录 同步方法
function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
      return true;
    } else {
      if (mkdirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname);
        return true;
      }
    }
}
/**************************************************
 * 
 * 
 * 
 * 
 * 更换头像，若无头像，则在用户表插入头像路径
 * 若有头像，则update用户表，然后删除原头像，上传新头像
 * 
 * 
 * 
 * 
 **************************************************/
router.post('/change',xupload.any(),(req,res)=>{
    let file = req.files[0];
    let des_path = './public/avatar/'+req.body.userId+'/'
    let fileName = 'avatar'+new Date().format('yyyy-MM-dd_hh.mm.ss') + '-' + file.originalname;
    DeleteFile=function(userId,callback){
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : mHost,
            user     : mUser,
            password : mPassword,
            database : mDB, 
            timezone: "08:00"
        });
        connection.connect();
        var  sql = 'SELECT * from user WHERE id=?';
        var myLock=[userId];
        connection.query(sql,myLock,function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
                return;
            } 
            else{
                console.log(result[0].image!=null)
                if(result[0].image!=null){
                    fs.unlink(result[0].image, (e) => {
                        if (e) {
                            throw e;    
                        } else {
                            console.log('文件已删除 - ' + fileName)
                            callback(userId);
                        }
                    })
                }
                else{
                    callback(userId);
                }
                
            }
        });
        connection.end();
    }

    DeleteFile(req.body.userId,function(userId){
        try {
            // 判断目标路径是否存在
            fs.exists(des_path, (isExist) => {
                if (!isExist) {
                    mkdirsSync(des_path);
                }
            })
    
            fs.readFile(file.path, (err, data) => {
                if (err) throw err;
    
                fs.writeFile(des_path + fileName, data, (e) => {
                    if (e) {
                        // 删除缓存文件
                        fs.unlink(file.path, (e) => {
                            if (e) {
                                throw e;
                            } else {
                                console.log('缓存文件已删除 - ' + fileName)
                            }
                        })
                        throw e;
                    } else {
                        console.log('文件保存成功 - ' + fileName); 
                        var mysql      = require('mysql');
                        var connection = mysql.createConnection({
                            host     : mHost,
                            user     : mUser,
                            password : mPassword,
                            database : mDB, 
                            timezone: "08:00"
                        });
                        connection.connect();
                        var  sql = 'update user set image=? where id=?';
                        var myLock=[des_path+fileName,userId];
                        connection.query(sql,myLock,function (err, result) {
                            if(err){
                                console.log('[SELECT ERROR] - ',err.message);
                                fs.unlink(des_path+fileName, (e) => {
                                    if (e) {
                                        throw e;    
                                    } else {
                                        console.log('文件已删除 - ' + fileName)
                                    }
                                })
                                return;
                            } 
                            else{
                                
                            }
                        });
                        connection.end();
                        res.json({
                            src:des_path+fileName,
                            status: 200,
                        });
        
                        // 删除缓存文件
                        fs.unlink(file.path, (e) => {
                            if (e) {
                                throw e;
                            } else {
                                console.log('缓存文件已删除 - ' + fileName)
                            }
                        }) 
                    }
                })
            })
        } catch (e) {
            console.error(e);
            return res.json({
                status: 500,
                message: JSON.stringify(e)
            });
        }
    })
})

/******************************************
 * 
 * 
 * 
 * 
 * 删除头像，将用户表的头像项update为null
 * 删除头像源文件
 * 
 * 
 * 
 * 
 *****************************************/

router.post('/delete',(req,res)=>{
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
        host     : mHost,
        user     : mUser,
        password : mPassword,
        database : mDB, 
        timezone: "08:00"
    });
    connection.connect();
    var  sql = 'SELECT * from user where id=?';
    var myLock=[req.body.userId];
    connection.query(sql,myLock,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        } 
        else{
            fs.unlink(result[0].image, (e) => {
                if (e) {
                    throw e;    
                } else {
                    console.log('文件已删除 - ' + result[0].image);
                    var mysql2      = require('mysql');
                    var connection2 = mysql2.createConnection({
                        host     : mHost,
                        user     : mUser,
                        password : mPassword,
                        database : mDB, 
                        timezone: "08:00"
                    });
                    connection2.connect();
                    var  sql2 = 'UPDATE user SET image=? where id=?';
                    var myLock2=[null,req.body.userId];
                    connection2.query(sql2,myLock2,function (err, result) {
                        res.send({
                            status:200
                        })
                    });
                    connection2.end();
                }
            })
        }
    });
    connection.end();
})
/******************************************
 * 
 * 
 * 
 * 
 * 读取头像的时候，注意初始目录是public
 * 
 * 
 * 
 * 
 * 
 *****************************************/

router.post('/get',(req,res)=>{
    getAvatar=function(userId,callback){
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : mHost,
            user     : mUser,
            password : mPassword,
            database : mDB, 
            timezone: "08:00"
        });
        connection.connect();
        var  sql = 'SELECT * from user where id=?';
        var myLock=[userId];
        connection.query(sql,myLock,function (err, result) {
            if(err){
                console.log(err)
                return;
            }
            else{
                callback(result);
            }
        })
    }

    getAvatar(req.body.userId,function(result){
        if(result.length==0)return;
        if(result[0].image==null){
            res.send({
                status:200,
                code:0,
                name:result[0].name
            })
        }
        else{
            var src='.'+result[0].image.substring(8,result[0].image.length);
            res.send({
                status:200,
                code:1,
                src:src,
                name:result[0].name
            })
        }
    })
    
    
})
module.exports = router;