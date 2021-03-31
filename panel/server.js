/*
 * @Author: Jerrykuku https://github.com/jerrykuku
 * @Date: 2021-1-8
 * @Version: v0.0.2
 * @thanks: FanchangWang https://github.com/FanchangWang
 */

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var got = require('got');
var path = require('path');
var fs = require('fs');

var rootPath = path.resolve(__dirname, '..')
// config.sh 文件所在目录
var confFile = path.join(rootPath, 'config/config.sh');
// config.sh.sample 文件所在目录
var sampleFile = path.join(rootPath, 'sample/config.sh.sample');
// crontab.list 文件所在目录
var crontabFile = path.join(rootPath, 'config/crontab.list');
var cronjsfile = path.join(rootPath, 'config/cronjsfile.sh');
// config.sh 文件备份目录
var confBakDir = path.join(rootPath, 'config/bak/');
// auth.json 文件目录
var authConfigFile = path.join(rootPath, 'config/auth.json');
// Share Code 文件目录
var shareCodeDir = path.join(rootPath, 'log/jd_get_share_code/');
// diy.sh 文件目录
var diyFile = path.join(rootPath, 'config/diy.sh');
// 日志目录
var logPath = path.join(rootPath, 'log/');
// cookie file
var ckPath = path.join(rootPath, 'config/ck.conf');
var bookFile = path.join(rootPath, 'config/book.conf');


var authError = "错误的用户名密码，请重试";
var loginFaild = "请先登录!";

var configString = "config sample crontab shareCode diy book";

var s_token, cookies, guid, lsid, lstoken, okl_token, token, userCookie = ""

function praseSetCookies(response) {
    s_token = response.body.s_token
    guid = response.headers['set-cookie'][0]
    guid = guid.substring(guid.indexOf("=") + 1, guid.indexOf(";"))
    lsid = response.headers['set-cookie'][2]
    lsid = lsid.substring(lsid.indexOf("=") + 1, lsid.indexOf(";"))
    lstoken = response.headers['set-cookie'][3]
    lstoken = lstoken.substring(lstoken.indexOf("=") + 1, lstoken.indexOf(";"))
    cookies = "guid=" + guid + "; lang=chs; lsid=" + lsid + "; lstoken=" + lstoken + "; "
}

function getCookie(response) {
    var TrackerID = response.headers['set-cookie'][0]
    TrackerID = TrackerID.substring(TrackerID.indexOf("=") + 1, TrackerID.indexOf(";"))
    var pt_key = response.headers['set-cookie'][1]
    pt_key = pt_key.substring(pt_key.indexOf("=") + 1, pt_key.indexOf(";"))
    var pt_pin = response.headers['set-cookie'][2]
    pt_pin = pt_pin.substring(pt_pin.indexOf("=") + 1, pt_pin.indexOf(";"))
    var pt_token = response.headers['set-cookie'][3]
    pt_token = pt_token.substring(pt_token.indexOf("=") + 1, pt_token.indexOf(";"))
    var pwdt_id = response.headers['set-cookie'][4]
    pwdt_id = pwdt_id.substring(pwdt_id.indexOf("=") + 1, pwdt_id.indexOf(";"))
    var s_key = response.headers['set-cookie'][5]
    s_key = s_key.substring(s_key.indexOf("=") + 1, s_key.indexOf(";"))
    var s_pin = response.headers['set-cookie'][6]
    s_pin = s_pin.substring(s_pin.indexOf("=") + 1, s_pin.indexOf(";"))
    cookies = "TrackerID=" + TrackerID + "; pt_key=" + pt_key + "; pt_pin=" + pt_pin + "; pt_token=" + pt_token + "; pwdt_id=" + pwdt_id + "; s_key=" + s_key + "; s_pin=" + s_pin + "; wq_skey="
    var userCookie = "pt_key=" + pt_key + ";pt_pin=" + pt_pin + ";";
    console.log("\n############  登录成功，获取到 Cookie  #############\n\n");
    console.log('Cookie1="' + userCookie + '"\n');
    console.log("\n####################################################\n\n");
    const fs = require('fs')
    let ckarray = [];
    let ckfileString = '';
    try {
        temparray = (fs.readFileSync(ckPath, 'utf8')).trim().split("\n");
        ckarray.push(userCookie);
        ckfileString = userCookie + "\n";
        for (ck in temparray) {
            if (!temparray[ck].toString().includes(pt_pin)) {
                ckarray.push(temparray[ck]);
                ckfileString = ckfileString + temparray[ck] + "\n";
            }
        }
        console.log(temparray)
    } catch (err) {
        console.error(err)
    }

    try {
        const data = fs.writeFileSync(ckPath, ckfileString)
        //文件写入成功。
    } catch (err) {
        console.error(err)
    }
    const shell = require('shelljs');
    console.log("\n############  执行脚本  #############\n\n");
    shell.exec('bash /var/local/jd_panel/config/start.sh');

    return userCookie;
}

async function step1() {
    try {
        s_token, cookies, guid, lsid, lstoken, okl_token, token = ""
        let timeStamp = (new Date()).getTime()
        let url = 'https://plogin.m.jd.com/cgi-bin/mm/new_login_entrance?lang=chs&appid=300&returnurl=https://wq.jd.com/passport/LoginRedirect?state=' + timeStamp + '&returnurl=https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport'
        const response = await got(url, {
            responseType: 'json',
            headers: {
                'Connection': 'Keep-Alive',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-cn',
                'Referer': 'https://plogin.m.jd.com/login/login?appid=300&returnurl=https://wq.jd.com/passport/LoginRedirect?state=' + timeStamp + '&returnurl=https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
                'Host': 'plogin.m.jd.com'
            }
        });

        praseSetCookies(response)
    } catch (error) {
        cookies = "";
        console.log(error.response.body);
    }
};

async function step2() {
    try {
        if (cookies == "") {
            return 0
        }
        let timeStamp = (new Date()).getTime()
        let url = 'https://plogin.m.jd.com/cgi-bin/m/tmauthreflogurl?s_token=' + s_token + '&v=' + timeStamp + '&remember=true'
        const response = await got.post(url, {
            responseType: 'json',
            json: {
                'lang': 'chs',
                'appid': 300,
                'returnurl': 'https://wqlogin2.jd.com/passport/LoginRedirect?state=' + timeStamp + '&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action',
                'source': 'wq_passport'
            },
            headers: {
                'Connection': 'Keep-Alive',
                'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
                'Accept': 'application/json, text/plain, */*',
                'Cookie': cookies,
                'Referer': 'https://plogin.m.jd.com/login/login?appid=300&returnurl=https://wqlogin2.jd.com/passport/LoginRedirect?state=' + timeStamp + '&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
                'Host': 'plogin.m.jd.com',
            }
        });
        token = response.body.token
        okl_token = response.headers['set-cookie'][0]
        okl_token = okl_token.substring(okl_token.indexOf("=") + 1, okl_token.indexOf(";"))
        var qrUrl = 'https://plogin.m.jd.com/cgi-bin/m/tmauth?appid=300&client_type=m&token=' + token;
        return qrUrl;
    } catch (error) {
        console.log(error.response.body);
        return 0
    }
}

var i = 0;

async function checkLogin() {
    try {
        if (cookies == "") {
            return 0
        }
        let timeStamp = (new Date()).getTime()
        let url = 'https://plogin.m.jd.com/cgi-bin/m/tmauthchecktoken?&token=' + token + '&ou_state=0&okl_token=' + okl_token;
        const response = await got.post(url, {
            responseType: 'json',
            form: {
                lang: 'chs',
                appid: 300,
                returnurl: 'https://wqlogin2.jd.com/passport/LoginRedirect?state=1100399130787&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action',
                source: 'wq_passport'
            },
            headers: {
                'Referer': 'https://plogin.m.jd.com/login/login?appid=300&returnurl=https://wqlogin2.jd.com/passport/LoginRedirect?state=' + timeStamp + '&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport',
                'Cookie': cookies,
                'Connection': 'Keep-Alive',
                'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
            }
        });

        return response;
    } catch (error) {
        console.log(error.response.body);
        let res = {}
        res.body = {check_ip: 0, errcode: 222, message: '出错'}
        res.headers = {}
        return res;
    }
}


/**
 * 检查 config.sh 以及 config.sh.sample 文件是否存在
 */
function checkConfigFile() {
    if (!fs.existsSync(confFile)) {
        console.error(confFile + '脚本启动失败，config.sh 文件不存在！');
        process.exit(1);
    }
    if (!fs.existsSync(sampleFile)) {
        console.error(confFile + '脚本启动失败，config.sh.sample 文件不存在！');
        process.exit(1);
    }
}

/**
 * 检查 config/bak/ 备份目录是否存在，不存在则创建
 */
function mkdirConfigBakDir() {
    if (!fs.existsSync(confBakDir)) {
        fs.mkdirSync(confBakDir);
    }
}

/**
 * 备份 config.sh 文件
 */
function bakConfFile(file) {
    mkdirConfigBakDir();
    let date = new Date();
    let bakConfFile = confBakDir + file + '_' + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay() + '-' + date.getHours() + '-' + date.getMinutes() + '-' + date.getMilliseconds();
    let oldConfContent = "";
    switch (file) {
        case "config.sh":
            oldConfContent = getFileContentByName(confFile);
            fs.writeFileSync(bakConfFile, oldConfContent);
            break;
        case "crontab.list":
            oldConfContent = getFileContentByName(crontabFile);
            fs.writeFileSync(bakConfFile, oldConfContent);
            break;
        case "diy.sh":
            oldConfContent = getFileContentByName(diyFile);
            fs.writeFileSync(bakConfFile, oldConfContent);
            break;
        default:
            break;
    }

}

// 不再写post 示例
const rp = require('request-promise');

async function useRequestPromise(url) {
    let options = {
        method: 'GET',
        uri: url
    };
    let rpbody = await rp(options);
    console.log("rpnbody", rpbody);

    return rpbody;
}

async function expordbook(bookFile, content) {
    fs.writeFileSync(bookFile, content);
    var http = require('http');
    //做循环处理
    var urlarry = content.toString().trim().split("\n");

    var myMap = new Map();

    var cronSet = new Set((fs.readFileSync(crontabFile, 'utf8')).trim().split("\n"));
    var cronjsgetSet = new Set((fs.readFileSync(cronjsfile, 'utf8')).trim().split("\n"));


    for (urlo in urlarry) {
        // 请求例子
        const rp = require('request-promise');
        let options = {
            method: 'GET',
            uri: urlarry[urlo].replace(/https/g, "http")
        };
        let rpbody = await rp(options);
        //console.log("rpnbody" , rpbody );
        const parsedData = JSON.parse(rpbody);
        console.log("匹配到的 数据xxx：" , parsedData);
        parsedData.task.forEach(function (item, idnex, array) {
            var crontext ="";
                if(Object.prototype.toString.call(item) === '[object Object]'){
                    console.log("匹配到的 数据yyy：" , item.config);
                    console.log("匹配到的 数据：" , item.toString().trim().match("\\d.*\\.js"));
                    crontext = item.config.toString().trim().match("\\d.*\\.js")[0];

                }else {
                    crontext = item.toString().trim().match("\\d.*\\.js")[0];

                }



            myMap.set(crontext.replace(/http.*/g, ""), crontext.match("http.*")[0]);

            //console.log(array);    // [1, 2, 3, 4, 5, 6]
        })
        /*    http.get(urlarry[urlo].replace(/https/g, "http"), function (res) {
               res.setEncoding('utf8');
               var rawData = '';
               res.on('data', function (chunk) {
                   rawData += chunk;
               });
               res.on('end', function () {
                   try {
                       const parsedData = JSON.parse(rawData);
                       parsedData.task.forEach(function (item, idnex, array) {

                           console.log(item.config.toString().match(".*js")[0]);// 1 2 3 4 5 6
                           var crontext = item.config.toString().match(".*js")[0];

                           myMap.set(crontext.replace(/http.*!/g, ""), crontext.match("http.*")[0]);

                           //console.log(array);    // [1, 2, 3, 4, 5, 6]
                       })
                       // console.log(parsedData);
                       // cb(parsedData);
                   } catch (e) {
                       console.error(e.message);
                       //cb('error');
                   }
               });
           });*/
    }

    for (var item of myMap.entries()) {
        console.log(item[0] + " = " + item[1]);
        var cron = item[0] + " " + "node /scripts/" + item[1].toString().match("\\w+\\.js")[0];
        var cronjsget = "wget " + item[1];
        cronSet.add(cron);
        cronjsgetSet.add(cronjsget);
    }
    var cronfile = "";
    for (var item of cronSet.entries()) {
        cronfile = cronfile + item[0] + "\n";
    }
    var cronjsload = "";
    for (var item of cronjsgetSet.entries()) {
        cronjsload = cronjsload + item[0] + "\n";
    }


    //写文件
    fs.writeFileSync(crontabFile, cronfile);
    fs.writeFileSync(cronjsfile, cronjsload);
}

/**
 * 将 post 提交内容写入 config.sh 文件（同时备份旧的 config.sh 文件到 bak 目录）
 * @param content
 */
function saveNewConf(file, content) {
    bakConfFile(file);
    switch (file) {
        case "config.sh":
            fs.writeFileSync(confFile, content);
            break;
        case "crontab.list":
            fs.writeFileSync(crontabFile, content);
            break;
        case "diy.sh":
            fs.writeFileSync(diyFile, content);
            break;
        case "book":
            expordbook(bookFile, content);
            break;
        default:
            break;
    }
}

/**
 * 获取文件内容
 * @param fileName 文件路径
 * @returns {string}
 */
function getFileContentByName(fileName) {
    if (fs.existsSync(fileName)) {
        return fs.readFileSync(fileName, 'utf8');
    }
    return '';
}

/**
 * 获取目录中最后修改的文件的路径
 * @param dir 目录路径
 * @returns {string} 最新文件路径
 */
function getLastModifyFilePath(dir) {
    var filePath = '';

    if (fs.existsSync(dir)) {
        var lastmtime = 0;

        var arr = fs.readdirSync(dir);

        arr.forEach(function (item) {
            var fullpath = path.join(dir, item);
            var stats = fs.statSync(fullpath);
            if (stats.isFile()) {
                if (stats.mtimeMs >= lastmtime) {
                    filePath = fullpath;
                }
            }
        });
    }
    return filePath;
}


var app = express();
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * 登录页面
 */
app.get('/', function (request, response) {
    if (request.session.loggedin) {
        response.redirect('./home');
    } else {
        response.sendFile(path.join(__dirname + '/public/auth.html'));
    }
});

/**
 * 用户名密码
 */
app.get('/changepwd', function (request, response) {
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/public/pwd.html'));
    } else {
        response.redirect('./');
    }
});

/**
 * 获取二维码链接
 */

app.get('/qrcode', function (request, response) {
    if (request.session.loggedin) {
        (async () => {
            try {
                await step1();
                const qrurl = await step2();
                if (qrurl != 0) {
                    response.send({err: 0, qrcode: qrurl});
                } else {
                    response.send({err: 1, msg: "错误"});
                }
            } catch (err) {
                response.send({err: 1, msg: err});
            }
        })();
    } else {
        response.send({err: 1, msg: loginFaild});
    }
})

/**
 * 获取返回的cookie信息
 */

app.get('/cookie', function (request, response) {
    if (request.session.loggedin && cookies != "") {
        (async () => {
            try {
                const cookie = await checkLogin();
                if (cookie.body.errcode == 0) {
                    let ucookie = getCookie(cookie);
                    response.send({err: 0, cookie: ucookie});
                } else {
                    response.send({err: cookie.body.errcode, msg: cookie.body.message});
                }
            } catch (err) {
                response.send({err: 1, msg: err});
            }
        })();
    } else {
        response.send({err: 1, msg: loginFaild});
    }
})

/**
 * 获取各种配置文件api
 */

app.get('/api/config/:key', function (request, response) {
    if (request.session.loggedin) {
        if (configString.indexOf(request.params.key) > -1) {
            switch (request.params.key) {
                case 'config':
                    content = getFileContentByName(confFile);
                    break;
                case 'sample':
                    content = getFileContentByName(sampleFile);
                    break;
                case 'crontab':
                    content = getFileContentByName(crontabFile);
                    break;
                case 'shareCode':
                    let shareCodeFile = getLastModifyFilePath(shareCodeDir);
                    content = getFileContentByName(shareCodeFile);
                    break;
                case 'diy':
                    content = getFileContentByName(diyFile);
                    break;
                case 'book':
                    content = getFileContentByName(bookFile);
                    break;
                default:
                    break;
            }
            response.setHeader("Content-Type", "text/plain");
            response.send(content);
        } else {
            response.send("no config");
        }
    } else {
        response.send(loginFaild);
    }
})

/**
 * 首页 配置页面
 */
app.get('/home', function (request, response) {
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/public/home.html'));
    } else {
        response.redirect('./');
    }

});

/**
 * 对比 配置页面
 */
app.get('/diff', function (request, response) {
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/public/diff.html'));
    } else {
        response.redirect('./');
    }

});
/**
 * 对比 配置页面
 */
app.get('/book', function (request, response) {
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/public/book.html'));
    } else {
        response.redirect('./');
    }

});
/**
 * Share Code 页面
 */
app.get('/shareCode', function (request, response) {
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/public/shareCode.html'));
    } else {
        response.redirect('./');
    }

});

/**
 * crontab 配置页面
 */
app.get('/crontab', function (request, response) {
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/public/crontab.html'));
    } else {
        response.redirect('./');
    }

});

/**
 * 自定义脚本 页面
 */
app.get('/diy', function (request, response) {
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/public/diy.html'));
    } else {
        response.redirect('./');
    }

});


/**
 * auth
 */
app.post('/auth', function (request, response) {
    let username = request.body.username;
    let password = request.body.password;
    fs.readFile(authConfigFile, 'utf8', function (err, data) {
        if (err) console.log(err);
        var con = JSON.parse(data);
        if (username && password) {
            if (username == con.user && password == con.password) {
                request.session.loggedin = true;
                request.session.username = username;
                response.send({err: 0});
            } else {
                response.send({err: 1, msg: authError});
            }
        } else {
            response.send({err: 1, msg: "请输入用户名密码!"});

        }
    });

});

/**
 * change pwd
 */
app.post('/changepass', function (request, response) {
    if (request.session.loggedin) {
        let username = request.body.username;
        let password = request.body.password;
        let config = {
            user: username,
            password: password
        }
        fs.writeFile(authConfigFile, JSON.stringify(config), function (err) {
            if (err) {
                response.send({err: 1, msg: "写入错误请重试!"});
            } else {
                response.send({err: 0, msg: "更新成功!"});
            }
        })

    } else {
        response.send(loginFaild);

    }
});

/**
 * change pwd
 */
app.get('/logout', function (request, response) {
    request.session.destroy()
    response.redirect('./');

});

/**
 * save config
 */

app.post('/api/save', function (request, response) {
    if (request.session.loggedin) {
        let postContent = request.body.content;
        let postfile = request.body.name;
        saveNewConf(postfile, postContent);
        response.send({err: 0, title: "保存成功! ", msg: "将自动刷新页面查看修改后的 " + postfile + " 文件"});
    } else {
        response.send({err: 1, title: "保存失败! ", msg: loginFaild});
    }

});

/**
 * 日志查询 页面
 */
app.get('/log', function (request, response) {
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/public/tasklog.html'));
    } else {
        response.redirect('./');
    }
});

/**
 * 日志列表
 */
app.get('/api/logs', function (request, response) {
    if (request.session.loggedin) {
        var fileList = fs.readdirSync(logPath, 'utf-8');
        var dirs = [];
        for (var i = 0; i < fileList.length; i++) {
            var stat = fs.lstatSync(logPath + fileList[i]);
            // 是目录，需要继续
            if (stat.isDirectory()) {
                var fileListTmp = fs.readdirSync(logPath + '/' + fileList[i], 'utf-8');
                fileListTmp.reverse();
                var dirMap = {
                    "dirName": fileList[i],
                    "files": fileListTmp
                }
                dirs.push(dirMap);
            }
        }
        var result = {
            "dirs": dirs,
        };
        response.send(result);

    } else {
        response.redirect('/');
    }

});

/**
 * 日志文件
 */
app.get('/api/logs/:dir/:file', function (request, response) {
    if (request.session.loggedin) {
        var filePath = logPath + request.params.dir + '/' + request.params.file;
        var content = getFileContentByName(filePath);
        response.setHeader("Content-Type", "text/plain");
        response.send(content);
    } else {
        response.redirect('/');
    }

});

checkConfigFile()

// prettier-ignore
function Env(t, e) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);

    class s {
        constructor(t) {
            this.env = t
        }

        send(t, e = "GET") {
            t = "string" == typeof t ? {url: t} : t;
            let s = this.get;
            return "POST" === e && (s = this.post), new Promise((e, i) => {
                s.call(this, t, (t, s, r) => {
                    t ? i(t) : e(s)
                })
            })
        }

        get(t) {
            return this.send.call(this.env, t)
        }

        post(t) {
            return this.send.call(this.env, t, "POST")
        }
    }

    return new class {
        constructor(t, e) {
            this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`)
        }

        isNode() {
            return "undefined" != typeof module && !!module.exports
        }

        isQuanX() {
            return "undefined" != typeof $task
        }

        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }

        isLoon() {
            return "undefined" != typeof $loon
        }

        toObj(t, e = null) {
            try {
                return JSON.parse(t)
            } catch {
                return e
            }
        }

        toStr(t, e = null) {
            try {
                return JSON.stringify(t)
            } catch {
                return e
            }
        }

        getjson(t, e) {
            let s = e;
            const i = this.getdata(t);
            if (i) try {
                s = JSON.parse(this.getdata(t))
            } catch {
            }
            return s
        }

        setjson(t, e) {
            try {
                return this.setdata(JSON.stringify(t), e)
            } catch {
                return !1
            }
        }

        getScript(t) {
            return new Promise(e => {
                this.get({url: t}, (t, s, i) => e(i))
            })
        }

        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
                const [o, h] = i.split("@"), n = {
                    url: `http://${h}/v1/scripting/evaluate`,
                    body: {script_text: t, mock_type: "cron", timeout: r},
                    headers: {"X-Key": o, Accept: "*/*"}
                };
                this.post(n, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }

        loaddata() {
            if (!this.isNode()) return {};
            {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e);
                if (!s && !i) return {};
                {
                    const i = s ? t : e;
                    try {
                        return JSON.parse(this.fs.readFileSync(i))
                    } catch (t) {
                        return {}
                    }
                }
            }
        }

        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }

        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i) if (r = Object(r)[t], void 0 === r) return s;
            return r
        }

        lodash_set(t, e, s) {
            return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
        }

        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
                if (r) try {
                    const t = JSON.parse(r);
                    e = t ? this.lodash_get(t, i, "") : e
                } catch (t) {
                    e = ""
                }
            }
            return e
        }

        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i),
                    h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
                }
            } else s = this.setval(t, e);
            return s
        }

        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }

        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }

        initGotEnv(t) {
            this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }

        get(t, e = (() => {
        })) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.get(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                try {
                    if (t.headers["set-cookie"]) {
                        const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                        s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
                    }
                } catch (t) {
                    this.logErr(t)
                }
            }).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => {
                const {message: s, response: i} = t;
                e(s, i, i && i.body)
            }))
        }

        post(t, e = (() => {
        })) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.post(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => e(t)); else if (this.isNode()) {
                this.initGotEnv(t);
                const {url: s, ...i} = t;
                this.got.post(s, i).then(t => {
                    const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                    e(null, {status: s, statusCode: i, headers: r, body: o}, o)
                }, t => {
                    const {message: s, response: i} = t;
                    e(s, i, i && i.body)
                })
            }
        }

        time(t, e = null) {
            const s = e ? new Date(e) : new Date;
            let i = {
                "M+": s.getMonth() + 1,
                "d+": s.getDate(),
                "H+": s.getHours(),
                "m+": s.getMinutes(),
                "s+": s.getSeconds(),
                "q+": Math.floor((s.getMonth() + 3) / 3),
                S: s.getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
            return t
        }

        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t) return t;
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {"open-url": t} : this.isSurge() ? {url: t} : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"];
                        return {openUrl: e, mediaUrl: s}
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl;
                        return {"open-url": e, "media-url": s}
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {url: e}
                    }
                }
            };
            if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
                let t = ["", "==============📣系统通知📣=============="];
                t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t)
            }
        }

        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
        }

        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
        }

        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }

        done(t = {}) {
            const e = (new Date).getTime(), s = (e - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}

app.listen(5678, () => {
    console.log('应用正在监听 5678 端口!');
});

