const router = require('express').Router();
const fs = require('fs');
const mHost='localhost';
const mUser='root';
const mPassword='zjy123456'
const mDB='test'

/***********************
 * keyword 关键字查询
 * course 课程查询
 * date 时间查询
 * score 分数查询
 * page 页面数
 *  无查询
 ***********************/
router.post('/item',(req,res)=>{
    let keyword=req.body.keyword;
    let course=req.body.course;
    let date=req.body.date;
    let score=req.body.score;
    let page=req.body.page;

    var dateSelect="";
    var courseSelect="";
    var view_name='view'+(new Date()).getSeconds()+req.body.userId+'view';
    for(var i=0;i<date.length;i++){
        if(i!=date.length-1)
            dateSelect=dateSelect+" time LIKE '"+date[i]+"%' or"
        else
            dateSelect=dateSelect+" time LIKE '"+date[i]+"%' "
    }
    for(var i=0;i<course.length;i++){
        if(i!=course.length-1)
            courseSelect=courseSelect+" course='"+course[i]+"' or"
        else
            courseSelect=courseSelect+" course='"+course[i]+"' "
    }

    readItem=function(callback){
      
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : mHost,
            user     : mUser,
            password : mPassword,
            database : mDB, 
            timezone: "08:00"
        });
        connection.connect();
        var sql;
        var table_name;
        console.log(keyword)
        if(keyword!=''&&keyword!=undefined&&keyword!=null&&keyword!=' '&&keyword!='ée'){

            table_name=view_name
        }else{
            table_name='item'
        }

        if(dateSelect==""&&courseSelect!=""){
                sql = 'SELECT * from '+table_name+' where '+courseSelect;  
        }
        else if(dateSelect!=""&&courseSelect==""){
                sql = 'SELECT * from '+table_name+' where '+dateSelect;
        }
        else if(dateSelect==""&&courseSelect==""){
                sql = 'SELECT * from  '+table_name;
        }
        else{
                sql = 'SELECT * from  '+table_name+' where '+courseSelect+' and '+dateSelect;
        }

        if(score==null||score=='')sql=sql+' order by item_id DESC';
        else sql=sql+' order by grade DESC,item_id DESC';
        if(keyword!=''&&keyword!=undefined&&keyword!=null&&keyword!=' '&&keyword!='ée'){
            console.log(sql)
            connection.query('create view '+view_name+' as select * from item where item_name LIKE "%'+keyword+'%" or note LIKE "%'+keyword+'%" or members LIKE "%'+keyword+'%";',function (err, result) {
                if(err){
                    console.log(err)
                    return;
                }
                else{
                    connection.query(sql,function(err,result){
                        if(err){

                        }
                        else{
                            callback(result);
                            connection.query('drop view '+view_name+';',function(err,result){

                            })
                        }
                    })
                    
                }
            })
        }
        else{
            console.log(sql)
            connection.query(sql,function(err,result){
                if(err){

                }
                else{
                    callback(result);
                }
            })
        }
    };
    

    readItem(function(result){
        var pageItem=new Array();
        console.log(page,result.length,page*30+30<result.length)
        if(page*30+30<result.length){
            for(var i=page*30;i<page*30+30;i++){
                var path=result[i].path.toString();
                path=path.substring(8,path.length-1)
                var obj={
                    img:'.'+path+'/'+result[i].img,
                    course:result[i].course,
                    itemName:result[i].item_name,
                    itemId:result[i].item_id,
                    userId:result[i].user_id,
                    members:result[i].members,
                    view:result[i].grade
                };
                pageItem.push(obj)
            }
            res.send({
                status:200,
                res:0,
                item:pageItem
            })
        }
        else{

            for(var i=page*30;i<result.length;i++){
                var path=result[i].path.toString();
                path=path.substring(8,path.length-1)
                var obj={
                    img:'.'+path+'/'+result[i].img,
                    course:result[i].course,
                    itemName:result[i].item_name,
                    itemId:result[i].item_id,
                    userId:result[i].user_id,
                    members:result[i].members,
                    view:result[i].grade
                };
                pageItem.push(obj)
            }
            res.send({
                status:200,
                res:1,
                item:pageItem
            })
        }
    })
})

router.post('/readCourse',(req,res)=>{
    SQLget=function(callback){
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : mHost,
            user     : mUser,
            password : mPassword,
            database : mDB,
            timezone: "08:00"
        });
        connection.connect();
        var  sql = 'select * from courses';
        connection.query(sql,function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
            }
            callback(err,result); 
        });
        connection.end();
    }

    SQLget(function(err,result){
        var course=new Array();
        for(var i=result.length-1;i>=0;i--){
            course.push(result[i].name)
        }
        res.send({
            status:202,
            course:course
        })
    })



})

router.post('/sendbug',(req,res)=>{
    var mysql      = require('mysql');
    console.log(req.body)
    var connection = mysql.createConnection({
        host     : mHost,
        user     : mUser,
        password : mPassword,
        database : mDB,
        timezone: "08:00"
    });
    connection.connect();
    var  sql = 'INSERT INTO bug (time,connect,detail) VALUES (?,?,?)';
    var myLocks=[req.body.bug.time,req.body.bug.connect,req.body.bug.detail];
    connection.query(sql,myLocks,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
        }
        else{
            console.log(result)
        }

    });
    connection.end();
    res.send({status:200})
})

router.post('/getbug',(req,res)=>{
    getBUG=function(callback){
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : mHost,
            user     : mUser,
            password : mPassword,
            database : mDB,
            timezone: "08:00"
        });
        connection.connect();
        var  sql = 'select * from bug';
        
        connection.query(sql,function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
            }
            else{
                callback(result)
            }
    
        });
        connection.end();
    }
    getBUG(function(result){
        console.log(result)
        res.send({
            table:result,
            status:200
        })
    })
    
})

router.post('/deletebug',(req,res)=>{
    
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : mHost,
            user     : mUser,
            password : mPassword,
            database : mDB,
            timezone: "08:00"
        });
        connection.connect();
        var  sql = 'DELETE FROM bug WHERE id=?';
        var myLocks=[req.body.id];
        connection.query(sql,myLocks,function (err, result) {
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

router.post('/userInfo',(req,res)=>{
    let keyword=req.body.keyword;
    let userId=req.body.userId;
    console.log(keyword,userId)
    offerInfo=function(userId,keyword,callback){
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : mHost,
            user     : mUser,
            password : mPassword,
            database : mDB,
            timezone: "08:00"
        });

        connection.connect();
        var  sql = 'SELECT * from item where user_id='+userId+' and item_name LIKE "%'+keyword+'%" or note LIKE "%'+keyword+'%" or members LIKE "%'+keyword+'%";';
        console.log(sql)
        connection.query(sql,function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
            }
            else{
               callback(result)
               console.log(result)
            }
    
        });
        connection.end();
    }

    offerInfo(userId,keyword,function(result){
        
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

module.exports = router;