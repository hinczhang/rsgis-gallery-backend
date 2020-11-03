require('colors');
const express = require('express');
var bodyParser = require('body-parser');
const app = express();
const file = require('./services/upload');
const create=require('./services/create');
const user=require('./services/modify');
const avatar=require('./services/avatar')
const home=require('./services/home')
const newAdmin=require('./services/admin-extend')

const session = require('express-session');

const adminfile = require('./services/file-api');
const admingt = require('./services/gt-api');
const adminuser = require('./services/user-api');
const admin = require('./services/admin-api');
Date.prototype.format = function(fmt) {
    var o = { 
        "M+" : this.getMonth()+1,                 //月份 
        "d+" : this.getDate(),                    //日 
        "h+" : this.getHours(),                   //小时 
        "m+" : this.getMinutes(),                 //分 
        "s+" : this.getSeconds(),                 //秒 
        "q+" : Math.floor((this.getMonth()+3)/3), //季度 
        "S"  : this.getMilliseconds()             //毫秒 
    }; 
    if(/(y+)/.test(fmt)) 
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
    for(var k in o) 
        if(new RegExp("("+ k +")").test(fmt))
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length))); 
    return fmt; 
}

//app.use(express.json());
//app.use(bodyParser.urlencoded({ extended: false }))


//app.use(bodyParser.json())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

// 请求信息 及 安全性控件
app.use( (req, res, next) => {
    console.log(req.method.toString().green + ' - ' +   // GET or POST
        req.originalUrl.toString().yellow + ' - ' +     // URL
        new Date().toLocaleString().blue);              // Date and Time
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

//所有请求过来，都去项目当前的public目录下寻找所请求的文件，找到就返回
app.use(express.static('./public'));

app.use('/file',file);
app.use('/create',create);
app.use('/user',user);
app.use('/avatar',avatar);
app.use('/home',home);
app.use('/newadmin',newAdmin);

// Express session
app.use('/gt', session({
    secret: 'geetest',
    resave: false,
    saveUninitialized: true
}));

// Router
app.use('/api/user', adminuser);
app.use('/api/admin', admin);
app.use('/api', adminfile);
app.use('/gt', admingt);
// Listening
const server = app.listen(8888, '0.0.0.0', () => {
    // Port Number
    let port = server.address().port;
    // IPv4 address
    let IPv4 = new String();
    let netLinks = require('os').networkInterfaces();
    for(let i in netLinks) {
        let netLink = netLinks[i]; // 单个连接，如：本地连接，无线网络连接等，每个连接包含IPv4、IPv6等协议接口
        for(let j in netLink) { // 遍历每个连接的不同协议
        if(netLink[j].address !== '127.0.0.1' && netLink[j].family === 'IPv4') {
            IPv4 = netLink[j].address;
        }
        }
    }
    console.log(' 服务部署成功！'.green);
    console.log(('    本地访问：http://localhost:' + port).cyan);
    console.log(('  互联网访问：' + (IPv4.length === 0 ? '未连接到互联网' : ('http://' + IPv4 + ':' + port))).cyan);
});
