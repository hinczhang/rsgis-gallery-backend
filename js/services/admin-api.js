const router = require('express').Router();
const query = require('./db/query');
const fs = require('fs');

router.get('/all-user', (req, res) => {
    Promise.all([query.selectAllUser(), query.selectUndoRequest()])
    .then(([userList, reqList]) => {
        return res.json({
            status: 200,
            result: userList.map(i => {
                return {
                    id: i.id,
                    name: i.name,
                    password: i.password,
                    reg_time: i.reg_time,
                    register: true
                };
            }).concat(reqList.map(i => {
                return {
                    id: i.req_account,
                    name: i.req_name,
                    password: i.req_password,
                    reg_time: i.req_time,
                    register: false
                };
            }))
        });
    }).catch(err => {
        console.error(err)
        return res.json({
            status: 500,
            message: JSON.stringify(err)
        });
    });
});


// 修改单个用户（包含修改注册状态）
router.post('/alter-user', (req, res) => {
    const body = req.body;
    
    // 针对未注册用户
    if (body.toRegister) {
        if (body.register) {
            const pmList = [
                query.insertUser(
                    body.id,
                    body.name,
                    body.password,
                    new Date().toLocaleString()
                ),
                query.doneRequest(body.id)
            ];
            Promise.all(pmList)
            .then(() => {
                return res.json({
                    status: 200
                });
            }).catch(err => {
                console.error(err);
                return res.json({
                    status: 500,
                    message: JSON.stringify(err)
                });
            });
        } else {
            query.updateRequest(
                body.name,
                body.password,
                body.id
            ).then(() => {
                return res.json({
                    status: 200
                });
            }).catch(err => {
                console.error(err);
                return res.json({
                    status: 500,
                    message: JSON.stringify(err)
                });
            });
        }
    }
    // 针对已注册用户
    else {
        query.updateUser(body.id, body.name, body.password)
        .then(() => {
            return res.json({
                status: 200
            });
        }).catch(err => {
            console.error(err);
            return res.json({
                status: 500,
                message: JSON.stringify(err)
            });
        });
    }
});

// 添加单个用户
router.post('/add-user', (req, res) => {
    const body = req.body;
    let time = new Date().toLocaleString();
    query.insertUser(body.account, body.name, body.password, time)
    .then(() => {
        body.id = body.account;
        body.register = true;
        body.reg_time = time;
        return res.json({
            status: 200,
            form: body
        });
    }).catch(err => {
        console.error(err);
        if (err.errno === 19) {
            return res.json({
                status: 405,
                message: `该用户[id=${body.account}]已存在`
            });
        } else {
            return res.json({
                status: 500,
                message: JSON.stringify(err)
            });
        }
    });
});

// 批量注册用户
router.post('/register-users', async (req, res) => {
    const ids = req.body.ids;

    const reqArr = await Promise.all(
        ids.map(id => {
            return query.findRequestById(id);
        })
    ).catch(err => {
        console.error(err);
        return res.json({
            status: 500,
            message: JSON.stringify(err)
        });
    });
    
    const pmInsertUser = reqArr.map(req => {
        // 标记为完成
        query.doneRequestById(req.req_id)
        .catch(err => console.error(err));

        return query.insertUser(
            req.req_account,
            req.req_name,
            req.req_password,
            new Date().toLocaleString()
        );
    });

    Promise.all(pmInsertUser)
    .then(() => {
        return res.json({
            status: 200
        });
    }).catch(err => {
        console.error(err);
        return res.json({
            status: 500,
            message: JSON.stringify(err)
        });
    });
    
});

// 删除（一个或多个）请求
router.post('/delete-requests', (req, res) => {
    const ids = req.body.ids;

    const pmList = ids.map(id => {
        return query.deleteRequestById(id);
    });

    Promise.all(pmList)
    .then(() => {
        return res.json({
            status: 200
        });
    }).catch(err => {
        console.error(err);
        return res.json({
            status: 500,
            message: JSON.stringify(err)
        });
    });
});

// 删除（一个或多个）用户
router.post('/delete-user', (req, res) => {
    const users = req.body.users;
    
    let pmList = users.map(user => {
        if (user.register) {
            return query.deleteUser(user.account);
        } else {
            return query.doneRequest(user.account);
        }
    });

    Promise.all(pmList)
    .then(() => {
        return res.json({
            status: 200
        });
    }).catch(err => {
        console.error(err);
        return res.json({
            status: 500,
            message: JSON.stringify(err)
        });
    })
});

// 获取所有请求
router.get('/all-request', (req, res) => {
    query.selectAllRequest()
    .then(r => {
        return res.json({
            status: 200,
            result: r.map( i => {
                return {
                    id: i.req_id,
                    account: i.req_account,
                    name: i.req_name,
                    time: i.req_time,
                    register: i.done === 1 ? true : false
                }
            })
        });
    }).catch(err => {
        console.error(err);
        return res.json({
            status: 500,
            message: JSON.stringify(err)
        });
    });
});

// 获取文件夹目录清单
router.post('/dir-list', (req, res) => {
    const prefix = './public/data/';
    const list = req.body.pathList;

    const path = list.reverse().join('/') + '/';

    fs.readdir(prefix + path, (err, files) => {
        if (err) {
            console.error(err)
            return res.json({
                status: 500,
                message: JSON.stringify(err)
            });
        } else {
            // 文件排序
            files.sort((a, b) => {
                return a.split('.').length - b.split('.').length;
            });

            files = files.map(i => {
                return {
                    name: i,
                    isDir: fs.statSync(prefix + path + i).isDirectory()
                }
            });

            return res.json({
                status: 200,
                list: files
            });
        }
    })
});

// 修改管理员账户
router.post('/alter-account', (req, res) => {
    const adm = req.body;
    
    query.updateAdmin(adm.name, adm.newPwd, adm.account)
    .then(r => {
        if (r.changes === 1) {
            return res.json({
                status: 200
            });
        } else {
            return res.json({
                status: 300,
                message: '什么也没有发生'
            });
        }
    }).catch(err => {
        console.error(err)
        return res.json({
            status: 500,
            message: JSON.stringify(err)
        });
    });
});

module.exports = router;