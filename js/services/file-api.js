const router = require('express').Router();
const fs = require('fs');
const fse = require('fs-extra');
const EventProxy = require('eventproxy');
const query = require('./db/query');
const child_process = require('child_process');

// 文件解析器
// 相对路径相对于`app.js`
const filePath = './public/data/files/';
const multer = require('multer');
const upload = multer({
    dest: filePath + 'tmp' // 临时文件路径
});


// 接收文件并保存
router.post('/upload-file', upload.any(), (req, res) => {
    if (!req.files[0]) {
        return console.log('文件为空');
    }

    let userId = req.body.userId;
    let file = req.files[0];
    let des_path = filePath + userId + '/';
    let fileName = new Date().format('yyyy-MM-dd_hh.mm.ss') + '-' + file.originalname


    try {
        // 判断目标路径是否存在
        fs.exists(des_path, (isExist) => {
            if (!isExist) {
                fs.mkdir(des_path, (e) => {
                    if (e) throw e;
                });
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
                    res.json({
                        status: 200,
                        file: des_path + fileName,
                        account: req.body.userId
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
});

// 删除文件
router.post('/delete-files', (req, res) => {
    const fileList = req.body.list;
    const prefix = './public/data';

    const ep = new EventProxy().after('delete', fileList.length, (list) => {
        if (list.length === fileList.length) {
            return res.json({
                status: 200
            });
        } else {
            return res.json({
                status: 500,
                message: '删除次数出错'
            });
        }
    });

    fileList.forEach(i => {
        if (i.path !== '/files' && i.path != '/files/tmp') {
            fse.remove(prefix + i.path, (err) => {
                if (err) {
                    return res.json({
                        status: 500,
                        message: JSON.stringify(err)
                    });
                } else {
                    ep.emit('delete');
                }
            })
        } else {
            return res.json({
                status: 404,
                message: '不允许删除系统路径' + i.path
            });
        }
    })
});

// 评分功能
router.post('/file-evaluate', async (req, res) => {
    const filePath = req.body.file;
    const account = req.body.account;
    
    if (await query.findCalcByAccount(account)) {
        return res.json({
            status: 404,
            message: '已有运算结果，请勿重复提交'
        });
    } else {

        // 插入运算记录
        query.insertCalc(new Date().toLocaleString(), 'ing', account)
        .then(stmt => {

            // 执行运算
            evaluate(filePath)
            .then(result => {
                const score = (result.score1 === -1 ? 0 : result.score1) +
                    (result.score2 === -1 ? 0 : result.score2);
                
                const pmList = [
                    query.insertScore(score, account, filePath, new Date().toLocaleString()),
                    query.updateCalcScore(stmt.lastID, result.score1, result.score2)
                ];
        
                Promise.all(pmList)
                .catch((err) => console.error(err));
    
            }).catch(err => console.error(err));

            return res.json({
                status: 200,
                message: '提交运算成功',
                calcId: stmt.lastID
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

router.post('/evaluate-shown', (req, res) => {
    const calcId = req.body.calcId;
    query.updateProcess(calcId, 'done')
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

router.post('/evaluate-result', (req, res) => {
    const account = req.body.account;
    query.findCalcByAccount(account)
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

function evaluate(zipFilePath) {
    return new Promise((resolve, reject) => {

        // ./public/data/files/`User Id`/`***.zip`
        // console.log(zipFilePath.split('/').slice(-2, -1)[0])
        const id = zipFilePath.split('/').slice(-2, -1)[0];

        console.log(`对[${id}]的上传结果进行计算……`);

        setTimeout(() => {
            resolve({
                score1: 10,
                score2: 20
            });
        }, 1000);

        // const ep1 = EventProxy.create('part1', (part1) => {
        //     console.log(`2d:${part1}`);
            
        //     const ep2 = EventProxy.create('part2', (part2) => {
        //         console.log(`3d:${part2}`)

        //         resolve({
        //             score1: part1,
        //             score2: part2
        //         })
        //     })

        //     // 执行第二个命令
        //     child_process.exec('python2 ./py-scripts/part1_3d.py --id=' + id, (error, stdout, stderr) => {
        //         if (error) {
        //             reject(error);
        //         } else if (stderr) {
        //             reject(stderr);
        //         } else {
        //             ep2.emit('part2', stdout);
        //         }
        //     });
        // });

        // // 执行第一个命令
        // child_process.exec('python2 ./py-scripts/part1_2d.py --id=' + id, (error, stdout, stderr) => {
        //     if (error) {
        //         reject(error);
        //     } else if (stderr) {
        //         reject(stderr);
        //     } else {
        //         ep1.emit('part1', stdout);
        //     }
        // });
    })
}


module.exports = router;