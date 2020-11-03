const router = require('express').Router();
const fs = require('fs');
const mHost='localhost';
const mUser='root';
const mPassword='zjy123456'
const mDB='test'

router.post('/readCourse',(req,res)=>{
    searchCourse=function(callback){
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

    searchCourse(function(err,result){
        var course=new Array();
        for(var i=result.length-1;i>=0;i--){
            course.push({c:result[i].name})
        }
        res.send({
            status:202,
            course:course
        })
    })

})

router.post('/addCourse',(req,res)=>{
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
        host     : mHost,
        user     : mUser,
        password : mPassword,
        database : mDB, 
        timezone: "08:00"
    });
    connection.connect();
    var  sql = 'insert into courses (name) values (?)';
    var myLock=[req.body.course];
    connection.query(sql,myLock,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
        }
    })
    res.send({
        status:200
    })                 
    connection.end();
})

router.post('/deleteCourse',(req,res)=>{
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
        host     : mHost,
        user     : mUser,
        password : mPassword,
        database : mDB, 
        timezone: "08:00"
    });
    connection.connect();
    var  sql = 'delete from courses where name=?';
    var myLock=[req.body.course];
    connection.query(sql,myLock,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
        }
    })
    res.send({
        status:200
    })                 
    connection.end();
})

router.post('/score',(req,res)=>{
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
        host     : mHost,
        user     : mUser,
        password : mPassword,
        database : mDB, 
        timezone: "08:00"
    });
    connection.connect();
    var  sql = 'update item set grade=? where item_id=?';
    var myLock=[req.body.grade,req.body.itemId];
    connection.query(sql,myLock,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
        }
    })
    res.send({
        status:200
    })                 
    connection.end();
})

router.post('/getinfo',(req,res)=>{
    let page=req.body.page-1;
    let isGrade=req.body.isGrade;
    let course=req.body.course;
    let date=req.body.date;
    let size=req.body.size;
    var sql='select * from item'
    if(isGrade=='全部'){
        sql=sql+' where grade>-2.0';
    }else if(isGrade=='已打分'){
        sql=sql+' where grade>-1.0'
    }else{
        sql=sql+' where grade=-1'
    }

    if(course!=''){
        sql=sql+' and course="'+course+'"'
    }else{
        sql=sql
    }
    console.log(date)
    if(date.length!=0){
        sql=sql+' and '+' to_days(time)>=to_days("'+date[0]+'-01") and to_days(time)<=to_days("'+date[1]+'-31")'
    }else{

    }
    console.log(sql)
    getItem=function(sql,callback){
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : mHost,
            user     : mUser,
            password : mPassword,
            database : mDB, 
            timezone: "08:00"
        });
        connection.connect();
        
        connection.query(sql,function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
            }
            else{
                callback(result)
            }
        })           
        connection.end();
    }

    getItem(sql,function(result){
        var pageItem=new Array();
        if(page*size+size<result.length){
            for(var i=page*size;i<page*size+size;i++){
                var members=result[i].members.toString();
                var leader=members.split(' ')[0];
                var mymember="";
                for(var j=1;j<(members.split(' ')).length;j++){
                    mymember=mymember+" "+members.split(' ')[j]
                }
                var obj={
                    leader:leader,
                    course:result[i].course,
                    item:result[i].item_name,
                    itemId:result[i].item_id,
                    userId:result[i].user_id,
                    members:mymember,
                    grade:result[i].grade
                };
                pageItem.push(obj)
            }
            res.send({
                status:200,
                res:0,
                itemnum:result.length,
                table:pageItem
            })
        }
        else{

            for(var i=page*size;i<result.length;i++){
                var members=result[i].members.toString();
                var leader=members.split(' ')[0];
                var mymember="";
                for(var j=1;j<(members.split(' ')).length;j++){
                    mymember=mymember+" "+members.split(' ')[j]
                }
                var obj={
                    leader:leader,
                    course:result[i].course,
                    item:result[i].item_name,
                    itemId:result[i].item_id,
                    members:mymember,
                    grade:result[i].grade
                };
                pageItem.push(obj)
            }
            res.send({
                status:200,
                res:1,
                itemnum:result.length,
                table:pageItem
            })
        }
    })
    
})

router.post('/stats',(req,res)=>{
    var sql;
    var date=req.body.date;
    if(date.length==0){
        sql='select count(*) as num, course from item group by course'
    }
    else{
        sql='select count(*) as num, course from item where to_days(time)>=to_days("'+date[0]+'-01") and to_days(time)<=to_days("'+date[1]+'-31") group by course'
    }
    console.log(sql)
    returnStats=function(sql,callback){
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : mHost,
            user     : mUser,
            password : mPassword,
            database : mDB, 
            timezone: "08:00"
        });
        connection.connect();
        
        connection.query(sql,function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
            }
            else{
                callback(result)
            }
        })           
        connection.end();
    }

    returnStats(sql,function(result){
        var stats=new Array();
        for(var i=0;i<result.length;i++){
            stats.push({
                course:result[i].course,
                num:result[i].num,
            })
        }
        res.send({
            stats:stats,
            status:200
        })
    })
})
module.exports = router;