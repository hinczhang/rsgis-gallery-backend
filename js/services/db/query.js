// const sqlite = require('sqlite');
// const dbPromise = sqlite.open('./services/db/sqlite.db');

const mHost='localhost';
const mUser='root';
const mPassword='zjy123456'
const mDB='test'
/**
 * sqlite相较sqlite3的特点
 * 1. 用Promise代替callback，更好控制进程
 * 2. 使用run运行插入/更新等操作的sql语句时，返回statement，可以查看执行情况
 * 3. 使用all运行select语句时，返回数组（或空数组）
 * 4. 使用get运行select语句时，返回对象（或undefined)
 */
var mysql      = require('mysql');
var pool  = mysql.createPool({
connectionLimit : 10,
host     : mHost,
user     : mUser,
password : mPassword,
database : mDB
});
module.exports = {
//#region 操作用户
    selectAllUser: async () => {
        // const db = await dbPromise;
        // return db.all('select * from user');

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'select * from user';
                pool.query(sql,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    selectAllUserAccount: async () => {
        // const db = await dbPromise;
        // return db.all('select id from user');

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'select id from user';
                pool.query(sql,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    insertUser: async (id, name, pwd, reg_time) => {
        // const db = await dbPromise;
        // return db.run('insert into user(id, name, password, reg_time) values(?, ?, ?, ?)',
        // [id, name, pwd, reg_time]);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'insert into user(id, name, password, reg_time) values(?, ?, ?, ?)';
                var myLock=[id, name, pwd, reg_time];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    updateUser: async (id, name, pwd) => {
        // const db = await dbPromise;
        // return db.run('update user set name=?, password=? where id=?',
        // [name, pwd, id]);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'update user set name=?, password=? where id=?';
                var myLock=[name, pwd, id];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    deleteUser: async (id) => {
        // const db = await dbPromise;
        // return db.run('delete from `user` where id=?', id);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'delete from `user` where id=?';
                var myLock=[id];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    findUser: async (id) => {
        // const db = await dbPromise;
        // return db.get('select * from user where id=?', id);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                console.log('id-'+id);
                var  sql = 'select * from user where id=?';
                var myLock=[id];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        console.log('FindUser-Err:'+err);
                        reject(err);
                    }
                    else
                    {
                        console.log('FindUser-Result:'+result);
                        console.log('FindUser-Result[0]:'+result[0]);
                       resolve(result[0]);
                    }
                });
            })
        }
        return await query();
    },

//#endregion

//#region 操作管理员
    selectAllAdmin: async () => {
        // const db = await dbPromise;
        // return db.all('select * from admin');

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'select * from admin';
                pool.query(sql,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    selectAllAdmAccount: async () => {
        // const db = await dbPromise;
        // return db.all('select id from admin');

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'select id from admin';
                pool.query(sql,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    updateAdmin: async (name, password, account) => {
        // const db = await dbPromise;
        // return db.run('update admin set name=?, password=? where id=?',
        // [name, password, account]);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'update admin set name=?, password=? where id=?';
                var myLock=[name, password, account];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    insertAdmin: async (id, name, pwd) => {
        // const db = await dbPromise;
        // return db.run('insert into admin(id, name, password) values(?,?,?)',
        // [id, name, pwd]);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'insert into admin(id, name, password) values(?,?,?)';
                var myLock=[id, name, pwd];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    deleteAdmin: async (id) => {
        // const db = await dbPromise;
        // return db.run('delete from admin where id=?', id);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'delete from admin where id=?';
                var myLock=[id];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result[0]);
                    }
                });
            })
        }
        return await query();
    },
    findAdmin: async (id) => {
        // const db = await dbPromise;
        // return db.get('select * from admin where id=?', id);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                console.log('id-'+id)
                var  sql = 'select * from admin where id=?';
                var myLock=[id];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result[0]);
                    }
                });
            })
        }
        return await query();
    },

//#endregion

//#region 操作请求
    selectAllRequest: async () => {
        // const db = await dbPromise;
        // return db.all('select * from request');

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'select * from request';
                pool.query(sql,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    selectUndoRequest: async () => {
        // const db = await dbPromise;
        // return db.all('select * from request where done<>1');

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'select * from request where done<>1';
                pool.query(sql,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    insertRequest: async (account, name, password, time) => {
        // const db = await dbPromise;
        // // TODO
        // return db.run('insert into request(req_account, req_name, req_password, req_time)' + 
        // ' values(?,?,?,?)', [account, name, password, time]);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'insert into request(req_account, req_name, req_password, req_time,done)' + 
                ' values(?,?,?,?,?)';
                var myLock=[account, name, password, time,1];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        console.log('insertRequest-Err:'+err);
                        reject(err);
                    }
                    else
                    {
                        console.log('insertRequest-Resut:'+result);
                        console.log('insertRequest-JSON.stringify(result):'+JSON.stringify(result));
                        console.log('insertRequest-Resut[0]:'+result[0]);
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    updateRequest: async (name, password, account) => {
        // const db = await dbPromise;
        // return db.run('update request set req_name=?, req_password=? where req_account=? and done=0',
        // [name, password, account]);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'update request set req_name=?, req_password=? where req_account=? and done=0';
                var myLock=[name, password, account];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    deleteRequestById: async (id) => {
        // const db = await dbPromise;
        // return db.run('delete from request where req_id=?', id);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'delete from request where req_id=?';
                console.log('deleteRequestById-id:'+id);
                var myLock=[id];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        console.log('deleteRequestById-Err:'+err);
                        reject(err);
                    }
                    else
                    {
                        console.log('deleteRequestById-result:'+result);
                        console.log('deleteRequestById-JSON.stringify(result):'+JSON.stringify(result));
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    deleteRequestByAccount: async (account) => {
        // const db = await dbPromise;
        // return db.run('delete from request where req_account=?', account);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'delete from request where req_account=?';
                var myLock=[account];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    findRequestById: async (id) => {
        // const db = await dbPromise;
        // return db.get('select * from request where req_id=?', id);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'select * from request where req_id=?';
                var myLock=[id];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result[0]);
                    }
                });
            })
        }
        return await query();
    },
    findRequestByAccount: async (account) => {
        // const db = await dbPromise;
        // return db.get('select * from request where req_account=? AND done<>1', account)

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'select * from request where req_account=? AND done<>1';
                var myLock=[account];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        console.log('findRequestByAccount-Err:'+err);
                        reject(err);
                    }
                    else
                    {
                        console.log('findRequestByAccount-result:'+result);
                        console.log('findRequestByAccount-result[0]:'+result[0]);
                       resolve(result[0]);
                    }
                });
            })
        }
        return await query();
    },
    doneRequest: async (account) => {
        // const db = await dbPromise;
        // return db.run('update request set done=? where req_account=? AND done=0', [true, account]);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'update request set done=? where req_account=? AND done=0';
                var myLock=[true, account];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    doneRequestById: async (id) => {
        // const db = await dbPromise;
        // return db.run('update request set done=? where req_id=?',
        // [true, id]);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'update request set done=? where req_id=?';
                var myLock=[true, id];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
//#endregion

//#region 分数操作
    selectAllScore: async () => {
        // const db = await dbPromise;
        // return db.all('select score.id, score.score, user.name as user,' + 
        // ' user.id as account from score inner join user where user.id = ' + 
        // 'score.userId order by score.score desc');

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'select score.id, score.score, user.name as user,' + 
                ' user.id as account from score inner join user where user.id = ' + 
                'score.userId order by score.score desc';
                pool.query(sql,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    selectScoreTimes: async () => {
        // const db = await dbPromise;
        // return db.get('select count(*) as times from score');

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'select count(*) as times from score';
                pool.query(sql,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result[0]);
                    }
                });
            })
        }
        return await query();
    },
    selectMaxScore: async () => {
        // const db = await dbPromise;
        // return db.all('select score.id, max(score.score) as score, user.name as user, user.id as account'+
        // ' from score inner join user'+
        // ' where user.id = score.userId'+
        // ' group by user.id'+
        // ' order by score desc');

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'select score.id, max(score.score) as score, user.name as user, user.id as account'+
                ' from score inner join user'+
                ' where user.id = score.userId'+
                ' group by user.id'+
                ' order by score desc';
                pool.query(sql,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    insertScore: async (score, userId, filePath, time) => {
        // const db = await dbPromise;
        // return db.run('insert into score(score, userId, filePath, submitTime) values(?,?,?,?)',
        // [score, userId, filePath,time]);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'insert into score(score, userId, filePath, submitTime) values(?,?,?,?)';
                var myLock=[score, userId, filePath,time];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    findScore: async (id) => {
        // const db = await dbPromise;
        // return db.get('select * from score where id=?', id);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'select * from score where id=?';
                var myLock=[id];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result[0]);
                    }
                });
            })
        }
        return await query();
    },
    findScoreByAccount: async (account) => {
        // const db = await dbPromise;
        // return db.all('select * from score where userId=?', account);

        
        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'select * from score where userId=?';
                var myLock=[account];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
//#endregion

//#region 登录次数操作
    insertLogin: async (account, user_type, time, date) => {
        // const db = await dbPromise;
        // return db.run('insert into login(account, user_type, time, date) values(?,?,?,?)',
        // [account, user_type, time, date]);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'insert into login(account, user_type, time, date) values(?,?,?,?)';
                var myLock=[account, user_type, time, date];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    selectLogin: async () => {
        // const db = await dbPromise;
        // return db.all('select * from login');

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'select * from login';
                pool.query(sql,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    selectLoginByUser: async (account) => {
        // const db = await dbPromise;
        // return db.all('select * from login where account=?', account);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'select * from login where account=?';
                var myLock=[account];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    selectUserLoginTimes: async () => {
        // const db = await dbPromise;
        // return db.all('select count(*) as times, date' + 
        // ' from login where user_type="user"' + 
        // ' group by date order by date desc');

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'select count(*) as times, date' + 
                ' from login where user_type="user"' + 
                ' group by date order by date desc';
                pool.query(sql,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
//#endregion

//#region 计算操作
    insertCalc: async (create_time, process, account) => {
        // const db = await dbPromise;
        // return db.run('insert into calculation(create_time, process, create_user) values (?,?,?)',
        // [create_time, process, account]);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'insert into calculation(create_time, process, create_user) values (?,?,?)';
                var myLock=[create_time, process, account];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    updateCalcScore: async (calcId, score1, score2) => {
        const db = await dbPromise;
        // return db.run('update calculation set score1=?, score2=?, process=\'show\' where id=?',
        // [score1, score2, calcId]);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'update calculation set score1=?, score2=?, process=\'show\' where id=?';
                var myLock=[score1, score2, calcId];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    updateProcess: async (calcId, process) => {
        // const db = await dbPromise;
        // return db.run('update calculation set process=? where id=?',
        // [process, calcId]);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'update calculation set process=? where id=?';
                var myLock=[process, calcId];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        reject(err);
                    }
                    else
                    {
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    },
    findCalcByAccount: async (account) => {
        // const db = await dbPromise;
        // return db.get('select * from calculation where create_user=? and process<>\'done\'', account);

        let query=()=>{
            return new Promise((resolve,reject)=>{
                var  sql = 'select * from calculation where create_user=? and process<>\'done\'';
                console.log('findCalcByAccount-account:'+account);
                var myLock=[account];
                pool.query(sql,myLock,async(err, result)=> {
                    if(err){
                        console.log('findCalcByAccount-Err:'+err);
                        reject(err);
                    }
                    else
                    {
                        console.log('findCalcByAccount-result:'+result);
                        console.log('findCalcByAccount-JSON.stringify(result):'+JSON.stringify(result));
                        console.log('findCalcByAccount-result[0]:'+result[0]);
                       resolve(result);
                    }
                });
            })
        }
        return await query();
    }
//#endregion
}
