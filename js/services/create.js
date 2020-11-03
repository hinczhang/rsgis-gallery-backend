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
const myupload = multer({
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

function SQLItemCreate(file,user_id,name,note,course,img,members,path,callback){
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
        host     : mHost,
        user     : mUser,
        password : mPassword,
        database : mDB,
        timezone: "08:00"
    });

    var Mname="";
    var MId="";
    console.log(members.length)
    for(var i=0;i<members.length;i++){
        Mname=Mname+members[i].name+" ";
        MId=MId+members[i].id+" ";
    }
    connection.connect();
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    var  sql = 'INSERT INTO item (user_id,item_name,note,time,course,img,members,members_id,path,grade) VALUES (?,?,?,?,?,?,?,?,?,?)';
    var myLock=[user_id,name,note,year+'-'+month+'-'+day,course,img,Mname,MId,path,0];
      connection.query(sql,myLock,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            // 删除缓存文件
            fs.unlink(path+img, (e) => {
                if (e) {
                    throw e;
                } else {
                    console.log('文件已删除 - ' + img)
                }
            })
            fs.unlink(filePath + 'tmp/'+file.filename, (e) => {
                if (e) {
                    throw e;
                } else {
                    console.log('文件已删除 - ' + img)
                }
            })
            return;
          }
        else{
            callback(result.insertId)
        }
      });
   
  connection.end();
}

router.post('/upload',myupload.any(),(req,res)=>{
    let file = req.files[0];
    let course=req.body.course;
    let userId=req.body.userId;
    let name=req.body.name;
    let note=req.body.illustrator;
    let members=JSON.parse(req.body.sendmembers);
    
    let des_path = filePath + course + '/'+(new Date().getFullYear()).toString()+'/'+(new Date().getMonth()+1).toString()+'/'+userId+"-"+name+'/'
    let fileName = 'showboard'+new Date().format('yyyy-MM-dd_hh.mm.ss') + '-' + file.originalname;
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
                    SQLItemCreate(file,userId,name,note,course,fileName,members,des_path,function(id){
                        
                        res.json({
                            status: 200,
                            itemId:id,
                            file: des_path + fileName,
                            account: req.body.itemId
                        });
    
                        // 删除缓存文件
                        fs.unlink(file.path, (e) => {
                            if (e) {
                                throw e;
                            } else {
                                console.log('缓存文件已删除 - ' + fileName)
                            }
                        })
                    });
                    
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

router.post('/view',(req,res)=>{
    let item=req.body.itemId;
   
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
        host     : mHost,
        user     : mUser,
        password : mPassword,
        database : mDB,
        timezone: "08:00"
    });
    
    var  sql = 'update item set grade=grade+1 where item_id=?';
    var myLock=[item];
      connection.query(sql,myLock,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            
          }
        else{
        
        }
      });
   
    connection.end();
    res.send({
        status:200
    })

})
/*router.post('/editimg',myupload.any(),(req,res)=>{

    insertImg=function(fullName,itemId,callback,callback2){
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
        host     : mHost,
        user     : mUser,
        password : mPassword,
        database : mDB
        });
        connection.connect();
        var  sql = 'INSERT INTO readimg (item_id,img) VALUES (?,?)';
        var myLock=[itemId,fullName];
        connection.query(sql,myLock,function (err, result) {
            if(err){
                callback(err);
            }
            else{
                callback2(itemId);
            }      
        });
        connection.end();
    }

    getImg=function(itemId,callback){
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
        host     : mHost,
        user     : mUser,
        password : mPassword,
        database : mDB
        });
        connection.connect();
        var  sql = 'SELECT * from readimg where item_id=?';
        var myLock=[itemId];
        connection.query(sql,myLock,function (err, result) {
            if(err){
                
            }
            else{
                callback(result);
            }      
        });
        connection.end();
    }

    let file = req.files[0];

    let itemId=req.body.itemId;

    console.log(req.body)
    let des_path = filePath + 'readme' + '/';
    let fileName = itemId+'-'+new Date().format('yyyy-MM-dd_hh.mm.ss') + '-' + file.originalname;
    let fullName=des_path+fileName;


    insertImg(fullName,itemId,function(err){
        // 删除缓存文件
        fs.unlink(file.path, (e) => {
            if (e) {
                throw e;
            } else {
                console.log('缓存文件已删除 - ' + fileName)
            }
        });
        res.json({
            errno:1,
            status: 500
        });
    },function(itemId){
        try {
            // 判断目标路径是否存在
            fs.exists(des_path, (isExist) => {
                if (!isExist) {
                    mkdirsSync(des_path);
                }
            })
    
            fs.readFile(file.path, (err, data) => {
                if (err) throw err;
    
                fs.writeFile(fullName, data, (e) => {
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
                        //SQLItemCreate(userId,name,note,course,des_path+fileName);
                        
                        getImg(itemId,function(result){
                            var mData=new Array();
                            for(var i=0;i<result.length;i++){
                                var mPath=result[i].img.substr(8);
                                mData.push('http://localhost:8080'+mPath);
                            }
                            console.log(mData);
                            res.send({
                                "errno":0,
                                "data":mData
                            });
                        });
                        // 删除缓存文件
                        fs.unlink(file.path, (e) => {
                            if (e) {
                                throw e;
                            } else {
                                console.log('缓存文件已删除 - ' + fileName);
                            }
                        })
                    }
                })
            })
        } catch (e) {
            console.error(e);
            return res.json({
                errno:1,
                status: 500,
                message: JSON.stringify(e)
            });
        }
    });
    
})
*/

module.exports = router;