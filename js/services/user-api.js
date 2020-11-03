const router = require('express').Router();
const query = require('./db/query');

// 用户登录
router.post('/login', (req, res) =>{
    const account = req.body.account;
    const password = req.body.password;
    Promise.all([query.findAdmin(account), query.findUser(account)])
    .then(([admin, user]) => {
        if (user) {
            // 密码正确
            if (password === user.password) {
                console.log(('登录成功: ').cyan + (user.name).red + '-' + (account).yellow);

                query.insertLogin(account, 'user',
                    new Date().toLocaleString(),
                    new Date().toLocaleDateString()
                ).catch(err => console.error(err));

                return res.json({
                    status: 200,
                    message: '登录成功',
                    permission: 'user',
                    name: user.name
                });
            } else {
                return res.json({
                    status: 405,
                    message: '密码错误'+'用户-'+user.name+'输入密码-'+password+'正确密码-'+user.password
                });
            }
        } else if (admin) {
            // 密码正确
            if (password === admin.password) {
                console.log(('登录成功: ').cyan + (admin.name).red + '-' + (account).yellow);

                query.insertLogin(account, 'admin', new Date().toLocaleDateString())
                .catch(err => console.error(err));

                return res.json({
                    status: 200,
                    message: '登录成功',
                    permission: 'admin',
                    name: admin.name
                });
            } else {
                return res.json({
                    status: 405,
                    message: '密码错误'+'管理员-'+admin.name+'输入密码-'+password+'正确密码-'+admin.password
                });
            }
            
        } 
        // 用户不存在
        else {
            console.error('用户不存在：' + account);
            return res.json({
                status: 406,
                message: '用户不存在：' + account
            })
        }
    }).catch(err => {
        console.error(err);
        return res.json({
            status: 500,
            message: JSON.stringify(err)
        });
    });
});


// 获取所有用户账户/登陆时用
router.get('/all-account', (req, res) =>{
    Promise.all([query.selectAllAdmAccount(), query.selectAllUserAccount()])
    .then(([admList, userList]) => {
        return res.json({
            status: 200,
            result: admList.map(i => {
                return {
                    account: i.id,
                    permission: 'admin'
                }
            }).concat(userList.map(i => {
                return {
                    account: i.id,
                    permission: 'user'
                }
            }))
        });
    }).catch(err => {
        console.error(err);
        return res.json({
            status: 500,
            message: JSON.stringify(err)
        });
    });
});


// 用户注册（提交到请求列表中）
router.post('/register', (req, res) => {
    const body = req.body;

    // 已经是用户
    // 已提交注册
    // 未提交注册
    Promise.all([query.findUser(body.account), query.findRequestByAccount(body.account)])
    .then(([user, request]) => {
        console.log('user-'+user);
        console.log('request-'+request);
        if (user) {
             console.log('该用户已注册')
            return res.json({
                status: 300,
                message: '该用户已注册'
            });
        } else if (request) {
             console.log('正在审核中')
            return res.json({
                status: 300,
                message: '该账户正在审核中'
            })
        } else {
             console.log('未注册')
            query.insertRequest(body.account, body.name, body.password, new Date().toLocaleString())
            .then(r => {
                console.log('未注册-成功插入-r:'+r);
                console.log('未注册-成功插入-JSON.stringify(r):'+JSON.stringify(r));
                query.insertUser(
                    body.account, 
                    body.name, 
                    body.password, 
                    new Date().toLocaleString()
                )
                if (r.serverStatus === 2) {
                    return res.json({
                        status: 200
                    })
                }
            })
            .catch(err => {
                console.error(err);
                return res.json({
                    status: 500,
                    message: JSON.stringify(err)
                });
            })
        }
    }).catch(err => {
        console.error(err);
        return res.json({
            status: 500,
            message: JSON.stringify(err)
        });
    })
});


// 修改密码
router.post('/alter-password', (req, res) => {
    const body = req.body;
    
    query.findUser(body.account)
    .then(user => {
        if (user.password !== body.oldPwd) {
            return res.json({
                status: 300,
                message: '旧密码错误'
            })
        } else {
            query.updateUser(body.account, user.name, body.newPwd)
            .then(r => {
                if (r.changes === 1) {
                    return res.json({
                        status: 200
                    })
                }
            }).catch(err => {
                console.error(err);
                return res.json({
                    status: 500,
                    message: JSON.stringify(err)
                });
            });
        }
    }).catch(err => {
        console.error(err)
        return res.json({
            status: 500,
            message: JSON.stringify(err)
        })
    });
});


// 获取个人得分情况
router.post('/my-score', (req, res) => {
    const account = req.body.account;

    query.findScoreByAccount(account)
    .then(r => {
        return res.json({
            status: 200,
            result: r.map(i => {
                return {
                    score: i.score,
                    time: i.submitTime
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


// 获取所有分数(每个用户的最高分)
router.get('/scores', (req, res) => {

    query.selectMaxScore()
    .then(r => {
        return res.json({
            status: 200,
            result: r
        })
    }).catch(err => {
        console.error(err);
        return res.json({
            status: 500,
            message: JSON.stringify(err)
        });
    });
})

// 获取提交次数
router.get('/submit-times', (req, res) => {
    query.selectScoreTimes()
    .then(r => {
        return res.json({
            status: 200,
            result: r.times
        })
    }).catch(err => {
        console.error(err);
        return res.json({
            status: 500,
            message: JSON.stringify(err)
        });
    })
})

// 获取用户登录次数
router.get('/login-times', (req, res) => {
    query.selectUserLoginTimes()
    .then(r => {
        return res.json({
            status: 200,
            result: r
        });
    }).catch(err => {
        console.error(err);
        return res.json({
            status: 500,
            message: JSON.stringify(err)
        });
    });
});

module.exports = router;