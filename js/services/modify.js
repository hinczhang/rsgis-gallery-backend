const router = require('express').Router();
const fs = require('fs');
const mHost='localhost';
const mUser='root';
const mPassword='zjy123456'
const mDB='test'

/***************************
 * 
 * 
 * 
 * 
 *
 * 获取
 * 
 * 
 * 
 * 
 * 
 * 
 ***************************/


router.post('/getinfo',(req,res)=>{
    let userId=req.body.userId;
    SQLget=function(userId,callback){
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
        host     : mHost,
        user     : mUser,
        password : mPassword,
        database : mDB,
        timezone: "08:00"
        });
        connection.connect();
        var  sql = 'select DISTINCT * from item where members_id LIKE "%'+userId+'%" or user_id='+userId;
        connection.query(sql,function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
            }
            callback(err,result); 
        });
        connection.end();
    }

    SQLget(userId,function(err,result){
        var items=new Array();
        for(var i=result.length-1;i>=0;i--){
            var time=(result[i].time)+"";
            items.push({
                userId:result[i].user_id,
                itemId:result[i].item_id,
                name:result[i].item_name,
                course:result[i].course,
                grade:result[i].grade,
                time:time,
                down_num:result[i].downloads,
                note:result[i].note,
                path:result[i].path,
                img:result[i].img
            })
        }
        res.send({
            status:202,
            content:items
        })
    })



})

function fileWrite(path,content){
    fs.writeFile(path, content, {flag: 'w'}, function (err) {
        if(err) {
         console.error(err);
         } else {
            console.log('写入成功');
         }
     });
}

router.post('/send',(req,res)=>{
    console.log("enter")
    let item=req.body.item;
    let content=req.body.content;
    var file='./public/readme/'+item+'.txt';
    testInsert=function(file,content,item,callback){
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
        host     : mHost,
        user     : mUser,
        password : mPassword,
        database : mDB,
        timezone: "08:00"
        });
        connection.connect();
        var  sql = 'select * from readtext where item_id=?';
        var myLock=[item];
        connection.query(sql,myLock,function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
                throw err;
            }
           
            if(result.length==0){
                console.log("insert");
                callback(file,1,content);
            }
            else{
                console.log("no insert");
                callback(file,2,content);
            }
             
        });
        connection.end();
    }

    testInsert(file,content,item,function(file,flag,connect){
        if(flag==1){
            var mysql      = require('mysql');
            var connection = mysql.createConnection({
            host     : mHost,
            user     : mUser,
            password : mPassword,
            database : mDB,
            timezone: "08:00"
            });
            connection.connect();
            var  sql = 'INSERT INTO readtext (item_id,mytext) VALUES (?,?)';
            var myLock=[item,file];
            connection.query(sql,myLock,function (err, result) {
                if(err){
                    console.log('[SELECT ERROR] - ',err.message);
                    throw err;
                }
                
            });
            fileWrite(file,content);
            res.send({status:200})
            connection.end();
        }
        else{
            fileWrite(file,content);
            res.send({
                status:200
            })
        }
    })
})

router.post('/get',(req,res)=>{
    let item=req.body.item;
    mysearch=function(item,callback){
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : mHost,
            user     : mUser,
            password : mPassword,
            database : mDB,
            timezone: "08:00"
        });
        connection.connect();
        var  sql = 'SELECT * FROM readtext where item_id=?';
        var myLock=[item];
        connection.query(sql,myLock,function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
                throw err;
            }
            callback(result); 
        });
    }

    mysearch(item,function(result){
        if(result.length==0){
            res.send({
                status:202,
                content:''
            })
        }
        else{
            fs.readFile(result[0].mytext,'utf8',function(err,data){
                if(err){
                    console.log(err);
                    res.send({
                        status:500
                        
                    })
                }else{
                    res.send({
                        status:200,
                        content:data
                    })
                }
            })
            
        }
    });
})

router.post('/pickInfo',(req,res)=>{
    let userId=req.body.userId;
    mSQLget=function(userId,callback){
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
            callback(err,result);
        });
        connection.end();
    }

    mSQLget(userId,function(err,result){
        var gender=result[0].gender==true?'男':'女'
        var Info={
            name:result[0].name,
            grade:result[0].grade,
            email:result[0].email,
            gender:gender
        }
        res.send({
            status:202,
            Info:Info
        })
    })
})

router.post('/changepw',(req,res)=>{
    let userId=req.body.userId;
    let pwOld=req.body.pwOld;
    let pwNew=req.body.pwNew;
    mSQLget=function(userId,callback){
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
            callback(result)
        });
        connection.end();
    }

    mSQLget(userId,function(result){
        if(result[0].password!=pwOld){
            console.log("fail")
            res.send({
                status:500
            })
        }
        else{
            console.log("OK")
            var mysql      = require('mysql');
            var connection = mysql.createConnection({
                host     : mHost,
                user     : mUser,
                password : mPassword,
                database : mDB,
                timezone: "08:00"
            });
            connection.connect();
            var  sql = 'UPDATE user SET password=? WHERE id=?';
            var myLock=[pwNew,userId];
            connection.query(sql,myLock,function (err, result) {
                if(err){
                    console.log('[SELECT ERROR] - ',err.message);
                }
            });
            connection.end();
            res.send({
                status:200
            })
        }
    })
})

router.post('/changeInfo',(req,res)=>{
    let info=req.body.temp;
    let grade=parseInt(info.grade);
    let userId=req.body.userId;
    var gender=info.gender=='男'?true:false;
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
        host     : mHost,
        user     : mUser,
        password : mPassword,
        database : mDB,
        timezone: "08:00"
    });
    connection.connect();
    var  sql = 'UPDATE user SET name=?,gender=?,email=?,grade=? where id=?';
    var myLock=[info.name,gender,info.email,grade,userId];
    connection.query(sql,myLock,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
        }
    });
    connection.end();
    res.send({
        status:202
    })  
})

router.post('/deleteItem',(req,res)=>{
    let itemId=req.body.item.itemId;
    let userId=req.body.item.userId;
    let path=req.body.item.path;
    let img=path+req.body.item.img;
    console.log(img)
    
    searchMyItem=function(itemId,userId,callback){
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : mHost,
            user     : mUser,
            password : mPassword,
            database : mDB,
            timezone: "08:00"
        });
        connection.connect();
        var  sql = 'SELECT * FROM file WHERE item_id=?';
        var myLock=[itemId];
        connection.query(sql,myLock,function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
            }
            else{
                callback(itemId,userId,result);
            }
        });
        var  sql2 = 'SELECT * FROM readtext WHERE item_id=?';
        var myLock2=[itemId];
        connection.query(sql2,myLock2,function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
            }
            else{
                if(result.length>0){
                    fs.unlink(result[0].mytext, (e) => {
                        if (e) {
                               
                        } else {
                            var mysql2      = require('mysql');
                            var connection2 = mysql2.createConnection({
                                host     : mHost,
                                user     : mUser,
                                password : mPassword,
                                database : mDB,
                                timezone: "08:00"
                            });
                            connection2.connect();
                            var  sql3 = 'DELETE FROM readtext WHERE item_id=?';
                            var myLock3=[itemId];
                            connection2.query(sql3,myLock3,function(err,result){
                                if(err){
                                    console.log(err)
                                }
                            })
                            connection2.end()
                        }
                    })
                }
                
            }
        });
        
        connection.end();
    }

    searchMyItem(itemId,userId,function(itemId,userId,result){
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : mHost,
            user     : mUser,
            password : mPassword,
            database : mDB,
            timezone: "08:00"
        });
        connection.connect();
        fs.unlink(img,(e)=>{
            if(e){
                
            }
            else{
                fs.rmdir(path,(e)=>{

                })
            }
            
        });
        for(var i=0;i<result.length;i++){
            fs.unlink(result[i].file_url, (e) => {
                if (e) {
                       
                } else {
                    fs.rmdir(path,(e)=>{
                           
                    })
                }
            });
        }
        var  sql = 'DELETE FROM file WHERE item_id=?';
        var sql2='DELETE FROM item WHERE item_id=? and user_id=?';
        var myLock=[itemId];
        var myLock2=[itemId,userId]
        connection.query(sql,myLock,function(err,result){

        });
        connection.query(sql2,myLock2,function(err,result){

        })
        connection.end();
    })
    
    res.send({
        status:202
    })  
})

module.exports = router;