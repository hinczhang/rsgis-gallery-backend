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
const upload = multer({
    dest: filePath + 'tmp' // 临时文件路径
});

/***************
*
*
*上传文件模块
*
*
***************/
//解析文件大小
function Sizefunc(size){
    if(size<1024)
        return size+'B';
    else if(size>=1024&&size<1024*1024){
        var temp=size*1.0/1024.0;
        return temp.toFixed(2)+'KB';
    }
    else if(size>=1024*1024&&size<1024*1024*1024){
        var temp=size*1.0/(1024.0*1024.0);
        return temp.toFixed(2)+'MB';
    }
    else {
        var temp=size*1.0/(1024.0*1024.0*1024.0);
        return temp.toFixed(2)+'GB';
    }
}
//数据库插入

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
// 接收文件并保存
router.post('/file_upload',upload.any(), (req, res) => {
    if (!req.files[0]) {
        return console.log('文件为空');
    }
    let itemId=req.body.item;
    let file = req.files[0];
    let size=file.size;
    let des_path = req.body.path;
    let fileName = file.originalname;
    let fullName=des_path+fileName;
    SQLInsert=function(itemId,fileName,fullName,size,callback){
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : mHost,
            user     : mUser,
            password : mPassword,
            database : mDB, 
            timezone: "08:00"
        });
        connection.connect();
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        var day = date.getDate();
        var  sql = 'INSERT INTO file (item_id,file_name,file_url,time,size) VALUES (?,?,?,?,?)';
        var myLock=[itemId,fileName,fullName,year+'-'+month+'-'+day,Sizefunc(size)];
        connection.query(sql,myLock,function (err, result) {
            if(err){
                console.log(err)
                callback(err);
                // 删除缓存文件
                fs.unlink(fullName, (e) => {
                    if (e) {
                        throw e;    
                    } else {
                        console.log('文件已删除 - ' + fileName)
                    }
                })
                    return;
            }
            else{
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
                                         console.log('缓存文件已删除 - ' + fileName);
                                    }
                                })
                                throw e;
                            } else {
                                console.log('文件保存成功 - ' + fileName);
                                res.json({
                                    status: 200,
                                    file: fullName,
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
            }
        });
        connection.end();
    }
    SQLInsert(itemId,file.originalname,fullName,size,file,des_path,function(err){                
            // 删除缓存文件
            fs.unlink(file.path, (e) => {
                if (e) {
                    throw e;
                } else {
                    console.log('缓存文件已删除 - ' + fileName)
                }
            });
            res.json({
                status: 500,
            });
    });
                    
})

/********************

下载单个文件
下载多个文件，压缩为一个压缩包，并且删除缓存


*********************/

 //删除所有缓存的文件(将所有文件夹置空)
function removeFile(rootFile){
    var emptyDir = function(fileUrl){   

        var files = fs.readdirSync(fileUrl);//读取该文件夹
        var length=files.length+1;
        files.forEach(function(file){
            fs.unlinkSync(fileUrl+'/'+file);  
            
            if(length==0){
                fs.rmdir(fileUrl,function(err){
                    if(err){
                        throw err;
                    }
                }
            )}
        });       
    }
    emptyDir(rootFile); 
}

//复制文件，用以进行多文件打包下载
function copyFile(src,dist){
    fs.writeFileSync(dist,fs.readFileSync(src));
}

//每下载一次文件则下载量+1
function addStar(item,user){
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
    host     : mHost,
    user     : mUser,
    password : mPassword,
    database : mDB, 
    timezone: "08:00"
    });
    connection.connect();
    var  sql = 'update item set downloads=downloads+1 where item_id=? and user_id=?';
    var myLock=[item,user];
      connection.query(sql,myLock,function (err, result) {
          if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
          } 
      });
   
  connection.end();
}


//下载文件，分为多文件和单文件下载
router.post('/download',(req, res) =>{
    //console.log(req.body.fileList.length)
    //if(req.body.fileList.length==1){
        var name=req.body.name;
        var itemId=req.body.item;
        var user=req.body.user;
        var fullName=req.body.url;
        var size=fs.statSync(fullName).size;
        var stream=fs.createReadStream(fullName);
        addStar(itemId,user);
        /*res.writeHead(200,{
            'Content-Type': 'application/force-download',
            'Content-Disposition': 'attachment; filename=' + name,
            'Content-Length': size,
            'Access-Control-Expose-Headers': 'Content-Disposition'
        })
        f.pipe(res);*/

        var userAgent = (req.headers['user-agent']||'').toLowerCase();
        if(userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
            //如果是msie浏览器，文件名转码方式
            res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(name));
        } else if(userAgent.indexOf('firefox') >= 0) {
            //如果是火狐浏览器，文件名转码方式
            res.setHeader('Content-Disposition', 'attachment; filename*="utf8\'\'' + encodeURIComponent(name)+'"');
        } else {
            /* safari等其他非主流浏览器只能自求多福了 */
            res.setHeader('Content-Disposition', 'attachment; filename=' + new Buffer(name).toString('binary'));
        }
        //设置头信息下载类型为二进制文件，且为utf-8的编码格式
        res.setHeader('Content-Type', 'application/octet-stream;charset=utf8');
        //设置头信息文件大小
        res.setHeader('Content-Length', size);
        stream.pipe(res);
        stream.on('close', function () {
            console.log("下载完成："+name);
        });

    //}
    /*else if(req.body.fileList.length>1){
        var time=new Date().getTime();
        des_path='./public/data/files/tmp/'+time+'/'
        console.log(des_path)
        // 判断目标路径是否存在
        fs.exists(des_path, (isExist) => {
            if (!isExist) {
                fs.mkdir(des_path, (e) => {
                    if (e) throw e;
                });
            }
            for(i=0;i<req.body.fileList.length;i++){
                copyFile(req.body.fileList[i].path+req.body.fileList[i].name,des_path+req.body.fileList[i].name);
            }
            var zipper = require("zip-local");
            zipper.sync.zip(des_path).compress().save(des_path+time+'.zip');
            var name=time+'.zip';
            var fullName=des_path+name;
            var size=fs.statSync(fullName).size;
            var f=fs.createReadStream(fullName);
            res.writeHead(200,{
                'Content-Type': 'application/force-download',
                'Content-Disposition': 'attachment; filename=' + name,
                'Content-Length': size,
                'Access-Control-Expose-Headers': 'Content-Disposition'
            })
            f.pipe(res);
            removeFile(des_path);
        })
        
    }*/

})

/********************

页面获取数据库的信息


*********************/
router.post('/getinfo',(req,res)=>{
    console.log(req.body)
    getInfo=function(item,callback){
        var option;
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
        host     : mHost,
        user     : mUser,
        password : mPassword,
        database : mDB, 
        timezone: "08:00"
        });
        connection.connect();
        var  sql = 'select * from item where item_id=?';
        var myLock=[item];
        connection.query(sql,myLock,function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
            }
            option=result;
            callback(option);
          
        });
    
        connection.end();
    }
    getFile=function(item,callback){
        var option;
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
        host     : mHost,
        user     : mUser,
        password : mPassword,
        database : mDB, 
        timezone: "08:00"
        });
        connection.connect();
        var  sql = 'select * from file where item_id=?';
        var myLock=[item];
        connection.query(sql,myLock,function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
            }
            option=result;
            callback(option);
           
        });
    
        connection.end();
    }
    getName=function(userId,callback){

        var mysql      = require('mysql');
        var connection = mysql.createConnection({
        host     : mHost,
        user     : mUser,
        password : mPassword,
        database : mDB, 
        timezone: "08:00"
        });
        connection.connect();
        var  sql = 'select * from user where id=?';
        var myLock=[userId];
        connection.query(sql,myLock,function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
            }
         
            callback(result[0].name);
           
        });
    
        connection.end();
    }
  
    getInfo(req.body.item,function(option){
        getFile(req.body.item,function(file){
            getName(option[0].user_id,function(name){
                var Table=new Array();
                for(i=0;i<file.length;i++){
                    Table.push({'filename':file[i].file_name,'uptime':file[i].time.split('T')[0],'size':file[i].size,'fileUrl':file[i].file_url});
                }
                res.send({
                    status:202,
                    path:option[0].path,
                    userList:option[0].members,
                    illustrator:option[0].note,
                    course:option[0].course,
                    download_num:option[0].downloads,//option[0].downloads,
                    grade:option[0].grade,
                    userName:name,
                    itemName:option[0].item_name,
                    mainTableData:Table
                })
            })
        })
    })
})

/********************

说明信息的上传


*********************/

router.post('/ill_upload',(req,res)=>{
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
    host     : mHost,
    user     : mUser,
    password : mPassword,
    database : mDB, 
    timezone: "08:00"
    });
    console.log(req.body)
    connection.connect();
    
    var  sql = 'update item set note=? where item_id=? and user_id=?';
    var myLock=[req.body.text,req.body.item,req.body.user];
    connection.query(sql,myLock,function (err, result) {
          if(err){
            console.log('[SELECT ERROR] - ',err.message);
          }
   
        
      });
      
    connection.end();
    return res.json({
        status: 202,
        result:1
    });

})


/********************

文件的删除：实体文件和数据库对应表单的删除


*********************/
router.post('/delete',(req,res)=>{
    
    deleteMain=function(item,url,callback){
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
        host     : mHost,
        user     : mUser,
        password : mPassword,
        database : mDB, timezone: "08:00",
        });
        connection.connect();
        var  sql = 'delete from file where item_id=? and file_url=?';
        var myLock=[item,url];
        connection.query(sql,myLock,function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
            }
            callback(err,result);
       
        });
    }

    deleteMain(req.body.item,req.body.url,function(err,result){
        if(err){
            return res.send({
                status:500
            })
        }
        else{
            var fullName=req.body.url;
            console.log(fullName)
            fs.unlink(fullName,function(error){
                if(error){
                    console.log(error);
                    res.send({
                        status:500
                    });
                    return false;
                }
                console.log('删除文件成功');
                res.send({
                    status:202
                })
            })
            
        }
    })
})

module.exports = router;