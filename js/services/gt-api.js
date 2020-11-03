const router = require('express').Router();
const Geetest = require('gt3-sdk');

// Geetest ID/Key
const captcha = new Geetest({
    geetest_id: '52f812130b665a74d7b61b08a26910d0',
    geetest_key: '8a853c8ed3bf9a2ccbe8c27f3570dc3c'
});

router.get('/register', (req, res) => {
    captcha.register({}, (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        if (!data.success) {
            console.error('无法连接到 api.geetest.com')
            console.log(data)

            // 进入 fallback，如果一直进入此模式，请检查服务器到极验服务器是否可访问
            // 可以通过修改 hosts 把极验服务器 api.geetest.com 指到不可访问的地址

            // 为以防万一，你可以选择以下两种方式之一：

            // 1. 继续使用极验提供的fallback备用方案
            req.session.fallback = true;
            res.json({
                status: 400,
                result: data
            })

            // 2. 使用自己提供的备用方案
            // todo

        } else {
            // 正常模式
            req.session.fallback = false;
            res.json({
                status: 200,
                result: data
            })
        }
    });
});

module.exports = router;