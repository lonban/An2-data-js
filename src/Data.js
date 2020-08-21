import Axios from 'axios'
import Qs from 'qs'

class Data {
    axios;
    api = ''; //api头
    asset = 'http://a1.a/'; //资源路径头
    debug = 0;
    this__ = '';
    price = price; //app交互
    language=''; //语言
    load = {
        model: 1,
        request: 0,
    }

    constructor() {
        if (this.price) {
            this.api = this.price.host;
        }
        this.axios = Axios.create({
            baseURL: this.api, //基础url前缀
            //headers: {'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/x-www-form-urlencoded'}, //请求头信息XMLHttpRequest是Ajax异步请求方式，为null则传统同步请求
            timeout: 30000, //设置超时时间
            responseType: 'json', //返回数据类型,默认也是json
            /*transformRequest: [function (data) {
                return Qs.stringify(data) //对json数据转成&字符拼接的形式
            }],*/
        });
    }

    /*请求拦截器*/
    request(fun) {
        this.axios.interceptors.request.use((config) => {
            this.load.request++;
            fun && fun(this.load.request);
            return config;
        }, function (error) {
            console.error(error);
        });
    }

    /*响应拦截器*/
    response(fun) {
        this.axios.interceptors.response.use((response) => {
            this.load.request--;
            if (!this.load.request) {
                fun && fun();
            }
            return response;
        }, function (error) {
            console.error(error);
        });
    }

    setAuth_(access_token) {
        if (access_token) {
            this.axios.interceptors.request.use(function (config) {
                /*会生成一个Authorization: Bearer token头信息*/
                config.headers['Authorization'] = 'Bearer ' + access_token;
                return config;
            }, function (error) {
                return Promise.reject(error);
            });
        }
    }

    /*地址方法*/
    map() {
        return new Promise((resolve) => {
            this.price.on("GPSLocation", function (data) {
                resolve(data);
            });
        });
    }

    /*登录*/
    login(access_token) {
        access_token = access_token || this.link_get['access_token'];
        return new Promise((resolve) => {
            this.axios.post('/applogin/loginfo2.php', {}, {
                headers: {access_token: access_token}
            }).then(res => {
                res = res.data;
                res.returncode = parseInt(res.returncode);
                if (res.returncode == 0) {
                    res.loginUser.sex = parseInt(res.loginUser.sex)||0;
                    res.loginUser.iscompleted = parseInt(res.loginUser.iscompleted)||0;
                    //res.loginUser.ccidlist = res.ccidlist;
                    //res.loginUser.returncode = res.returncode;
                    let r_data={
                        'id': res.loginUser['userid'],
                        'accid': res.loginUser['accid'],
                        'md5accid': res.loginUser['md5accid'],
                        'sex': res.loginUser['sex'],
                        'email': res.loginUser['email'],
                        'iscompleted': res.loginUser['iscompleted'],
                        'name': res.loginUser['nickname'],
                        'img': res.loginUser['headimg'],
                        'sign': res.loginUser['sign'],
                        'current_city': res.loginUser['currentcity'],
                        'language': this.this__.$An2_Language.get(),//res.loginUser['defaultlanguage'],
                        'language_code': res.loginUser['procode'],
                        'access_token': this.link_get['access_token'],
                    }
                    this.createStorage_('user_', r_data);
                    this.this__.$store.dispatch('userA', r_data).then(()=>{
                        resolve(res);
                    });
                } else {
                    this.deleteStorage_('user_');
                    this.this__.$store.dispatch('userA', {}).then(()=>{
                        resolve(res);
                    });
                    console.error(res);
                }
                resolve(res);
            });
        });
    }

    /*注销登录*/
    logOff()
    {
        this.deleteStorage_('user_');
        this.deleteStorage('user_');
    }

    /*获取缓存的用户信息*/
    getUserLocal(key)
    {
        this.language = this.this__.$An2_Language.get();
        if(this.language==='zh'){this.language='ch';} //java后台请求数据时需要的是ch
        let set_user = (F)=>{
            this.user(this.this__.$store.state.user['id']);
            if(key){
                F(this.this__.$store.state.user[key]);
            }else{
                F(this.this__.$store.state.user);
            }
        }
        let is_longin = ()=>{
            if(this.this__.$store.state.user){
                if(this.this__.$store.state.user['access_token']){
                    if(this.this__.$store.state.user['access_token']===this.link_get['access_token']){
                        return 200;
                    }else{
                        return 0;
                    }
                }else{
                    return 100;
                }
            }else{
                return 0;
            }
        }
        return new Promise((resolve)=>{
            if(!is_longin()){
                this.login().then(() => {
                    set_user(resolve);
                }).catch(err => {
                    console.error(err);
                    resolve(0);
                });
            }else if(is_longin()===100){
                let long_in = this.getStorage_('user_');
                if(long_in){
                    if(long_in['access_token']&&long_in['access_token']===this.link_get['access_token']){
                        this.this__.$store.dispatch('userA', long_in).then(()=>{
                            set_user(resolve);
                        });
                    }else{
                        this.login().then(() => {
                            set_user(resolve);
                        }).catch(err => {
                            console.error(err);
                            resolve(0);
                        });
                    }
                }else{
                    this.login().then(() => {
                        set_user(resolve);
                    }).catch(err => {
                        console.error(err);
                        resolve(0);
                    });
                }
            }else if(is_longin()===200){
                set_user(resolve);
            }
        });
    }

    /*加载首页分类配置*/
    getNav()
    {
        return new Promise((resolve)=>{
            this.repeatedly_(20).then(res=> {
                if (res) {
                    this.axios.post('/apphome/loadHomeCatolog.php',{
                        'areacode': this.link_get['areacode'],
                        'ipcode': this.link_get['ipcode'],
                        'language': this.language,
                        'userid':this.user_id,//获取所有分类userid其实并没卵用
                    }).then(res=>{
                        let r_data = [];
                        if(parseInt(res.data.returncode)===0){
                            res = res.data.topButtonList;
                            for(let i=0;i<res.length;i++){
                                r_data[i]={};
                                r_data[i]['link']=null;
                                r_data[i]['name']=this.language==='ch'?res[i]['menuname']:res[i]['menuname_en'];
                                r_data[i]['img']=res[i]['coverimg'];
                                r_data[i]['img2']=res[i]['coverimg_blackmode']||0;
                                r_data[i]['cattypeid']=res[i]['objparams']||0;
                                r_data[i]['type']=res[i]['covertype']||0;
                            }
                        }else{
                            console.error(res);
                        }
                        resolve(r_data);
                    });
                }
            });
        });
    }

    /*加载成为自媒体分类配置*/
    getNav2()
    {
        return new Promise((resolve)=>{
            this.axios.post('/appinformation/loadInfoCatalog.php',{
                'areacode': this.link_get['areacode'],
                'ipcode': this.link_get['ipcode'],
                'language': this.language,
            }).then(res=>{
                let r_data = [];
                if(parseInt(res.data.returncode)===0){
                    res = res.data.infoCatalogList;
                    for(let i=0;i<res.length;i++){
                        r_data[i]={};
                        r_data[i]['link']=null;
                        r_data[i]['name']=this.language==='ch'?res[i]['catname']:res[i]['catname_en'];
                        r_data[i]['img']=res[i]['coverimg'];
                        r_data[i]['catid']=res[i]['catid'];
                        r_data[i]['type']=res[i]['cattype']||0;
                        r_data[i]['cattypeid']=res[i]['cattypeid']||0;
                        r_data[i]['select']=0;
                    }
                }else{
                    console.error(res);
                }
                resolve(r_data);
            });
        });
    }

    /*疫情图*/
    getAd2()
    {
        return new Promise((resolve)=>{
            this.repeatedly_(20).then(res=> {
                if (res) {
                    this.axios.post('/apphome/loadHomeAdvertList.php',{
                        'userid': this.user_id,
                        'areacode': this.link_get['areacode'],
                        'ipcode': this.link_get['ipcode'],
                        'language': this.language,
                    }).then(res=>{
                        let r_data = {};
                        if(parseInt(res.data.returncode)===0){
                            res = res.data.infoList[0];
                            r_data['link'] = null;
                            r_data['img'] = res['contentimgs'][0];
                        }else{
                            console.error(res);
                        }
                        resolve(r_data);
                    });
                }
            });
        });
    }

    /*随机广告*/
    getAd()
    {
        return new Promise((resolve)=>{
            this.axios.post('/appadvert/loadAdvertList.php',{
                'frequency': 15,
                'language': this.language,
            }).then(res=>{
                let r_data = [];
                if(parseInt(res.data.returncode)===0){
                    res = res.data.randomAdvertMap;
                    let i=0;
                    for(let k in res){
                        r_data[i]={};
                        r_data[i]['link']='';
                        r_data[i]['to']=res[k]['objparams']||0;
                        r_data[i]['to_url']=res[k]['objurl'];
                        r_data[i]['to_type']=res[k]['objcodno'];
                        r_data[i]['img']=res[k]['coverimg'];
                        r_data[i]['content']=res[k]['content']||0;
                        i++;
                    }
                }else{
                    console.error(res);
                }
                resolve(r_data);
            });
        });
    }

    /*获取轮播新闻*/
    getHostNews()
    {
        return new Promise((resolve)=>{
            this.axios.post('/appinformation/getPushNews.php',{
                'areacode': this.link_get['areacode'],
                'ipcode': this.link_get['ipcode'],
                'language': this.language,
            }).then(res=>{
                let r_data = [];
                if(parseInt(res.data.returncode)===0){
                    res = res.data.pushNewsList;
                    for(let i=0;i<res.length;i++){
                        r_data[i]={};
                        r_data[i]['link']=null;
                        r_data[i]['infoid']=res[i]['infoid'];
                        r_data[i]['img']=res[i]['contentimgs'][0];
                        r_data[i]['content']=res[i]['content']||0;
                    }
                }else{
                    console.error(res);
                }
                resolve(r_data);
            });
        });
    }

    /*获取头条新闻*/
    getNews(data)
    {
        return new Promise((resolve)=>{
            this.repeatedly_(20).then(res=> {
                if (res) {
                    this.axios.post('/apphome/loadhomenews.php',{
                        'userid': this.user_id,
                        'cattypeid': '',
                        'istop': data['istop'],
                        'start': data['start'],//从第几个开始
                        'limit': data['limit'],//获取一次取多少条数据
                        'randomDateTime': data['randomDateTime'],//随机时间由后台返回，作用不明
                        'userSortFlag': data['userSortFlag'],
                        'areacode': this.link_get['areacode'],
                        'ipcode': this.link_get['ipcode'],
                        'language': this.language,
                    }).then(res=>{
                        let r_data = [];
                        let ran_i = this.this__.$An1.ranInt(3,9);
                        let ran_i2 = this.this__.$An1.ranInt(3,30);
                        if(parseInt(res.data.returncode)===0){
                            let ranDate = res.data.randomDateTime;
                            res = res.data.infoList;
                            for(let i=0;i<res.length;i++){
                                r_data['ranDate']=ranDate;
                                r_data[i]={};
                                r_data[i]['user']={
                                    'id':res[i]['authorid'],
                                    'name':res[i]['authorname'],
                                    'img':res[i]['authorhead']||'../load.png',
                                };
                                r_data[i]['link']=null;
                                r_data[i]['is_ad'] = i===ran_i||i===ran_i2?1:0;
                                r_data[i]['to']=res[i]['objparams']||0;
                                r_data[i]['img']=res[i]['contentimgs'];
                                r_data[i]['content']=res[i]['content']||0;
                                r_data[i]['views']=res[i]['readcount']||0;
                                r_data[i]['likes']=parseInt(res[i]['likecount'])||0;
                                r_data[i]['islike']=parseInt(res[i]['islike'])||0;
                                r_data[i]['infoid']=res[i]['infoid'];
                                r_data[i]['cattype']=res[i]['cattype'];
                                r_data[i]['date']=data['userSortFlag']?res[i]['createtime']:res[i]['createtime'].replace(/.....(.*).../,'$1');
                            }
                        }else{
                            console.error(res);
                        }
                        resolve(r_data);
                    });
                }
            });
        });
    }

    /*获取指定类型新闻*/
    getTypeNews(data)
    {
        return new Promise((resolve)=>{
            this.repeatedly_(20).then(res=> {
                if (res) {
                    this.axios.post('/appinformation/loadFrontierInformation.php',{
                        'userid': this.user_id,
                        'cattypeid': data['cattypeid'],
                        'limit': data['limit'],
                        'start': data['start'],
                    }).then(res=>{
                        let r_data = [];
                        let ran_i = this.this__.$An1.ranInt(3,9);
                        let ran_i2 = this.this__.$An1.ranInt(3,30);
                        if(parseInt(res.data.returncode)===0){
                            res = res.data.infoList;
                            for(let i=0;i<res.length;i++){
                                r_data[i]={};
                                r_data[i]['user']={
                                    'id':res[i]['authorid'],
                                    'name':res[i]['authorname'],
                                    'img':res[i]['authorhead']||'../load.png',
                                };
                                r_data[i]['link']=null;
                                r_data[i]['is_ad'] = i===ran_i||i===ran_i2?1:0;
                                //r_data[i]['to']=res[i]['objparams']||0;
                                r_data[i]['img']=res[i]['contentimgs'];
                                r_data[i]['content']=res[i]['content']||0;
                                r_data[i]['views']=res[i]['reviewflag']||0;
                                r_data[i]['likes']=parseInt(res[i]['likecount'])||0;
                                r_data[i]['islike']=parseInt(res[i]['islike'])||0;
                                r_data[i]['infoid']=res[i]['infoid']||0;
                                r_data[i]['cattype']=res[i]['cattype'];
                                r_data[i]['date']=res[i]['createtime'];
                            }
                        }else{
                            console.error(res);
                        }
                        resolve(r_data);
                    });
                }
            });
        });
    }

    /*获取具体的新闻内容*/
    getNewsInfo(data)
    {
        return new Promise((resolve)=> {
            this.repeatedly_(20).then(res => {
                if (res) {
                    this.axios.post('/appinformation/loadInformationDetail.php',{
                        'userid': this.user_id,
                        'infoid': data['infoid'],
                    }).then(res=>{
                        let r_data = {};
                        if(parseInt(res.data.returncode)===0) {
                            res = res.data.infoDetail;
                            r_data['user']={
                                'id':res['authorid'],
                                'name':res['authorname'],
                                'img':res['authorhead']||'../load.png',
                            };
                            r_data['link']=null;
                            r_data['img']=res['contentimgs'];
                            r_data['content']=res['content']||0;
                            r_data['content2']=res['detailhtml']||0;
                            r_data['views']=res['readcount']||0;
                            r_data['likes']=parseInt(res['likecount'])||0;
                            r_data['islike']=parseInt(res['islike'])||0;
                            r_data['infoid']=res['infoid']||0;
                            r_data['cattype']=res['cattype'];
                            r_data['date']=res['createtime'];
                        }else{
                            console.error(res);
                        }
                        resolve(r_data);
                    });
                }
            });
        });
    }

    /*点赞*/
    setLike(data)
    {
        return new Promise((resolve)=> {
            this.repeatedly_(20).then(res => {
                if (res) {
                    this.axios.post('/appinformation/changeCollectFlag.php',{
                        'userid': this.user_id,
                        'collecttype': data['cattype'],
                        'collecttypeid': data['infoid'],
                        'collectFlag': data['is'], //是否已经点赞
                        'num': data['likes'],
                        'language': this.language,
                    });
                }
            });
        });
    }

    /*获取评论*/
    getDiscuss(data)
    {
        return new Promise((resolve)=> {
            this.axios.post('/appcomment/loadCommentList.php',{
                'infoid': data['infoid'],
                'language': this.language,
            }).then(res=>{
                let r_data = [];
                let two;
                if(parseInt(res.data.returncode)===0) {
                    res = res.data.commentList;
                    for(let i=0;i<res.length;i++){
                        r_data[i]={};
                        two = '';
                        r_data[i]['user']={
                            'id':res[i]['userid'],
                            'name':res[i]['nickname']||'***',
                            'img':res[i]['headimg']||'../load.png',
                        };
                        r_data[i]['comid']=res[i]['comid']||0;
                        r_data[i]['content']=res[i]['content']||0;
                        r_data[i]['infoid']=res[i]['infoid']||0;
                        r_data[i]['date']=res[i]['createtime'];
                        if(res[i]['replyList'].length>0){
                            two = [];
                            for(let ii=0;ii<res[i]['replyList'].length;ii++){
                                two[ii]={};
                                two[ii]['user']={
                                    'id':res[i]['replyList'][ii]['userid'],
                                    'name':res[i]['replyList'][ii]['nickname'],
                                };
                                two[ii]['comid']=res[i]['replyList'][ii]['comid'];
                                two[ii]['content']=res[i]['replyList'][ii]['content'];
                                two[ii]['date']=res[i]['replyList'][ii]['createtime'];
                            }
                        }
                        r_data[i]['two']=two;
                    }
                }else{
                    console.error(res);
                }
                resolve(r_data);
            });
        });
    }

    /*添加评论*/
    addDiscuss(data)
    {
        return new Promise((resolve)=> {
            this.repeatedly_(20).then(res => {
                if (res) {
                    this.axios.post('/appcomment/submitInfoCommnent.php',{
                        'userid': this.user_id,
                        'comid': data['comid'],
                        'content': data['content'],
                        'infoid': data['infoid'],
                        'touserid': data['touserid'],
                        'language': this.language,
                    }).then(res=>{
                        resolve(res);
                    });
                }
            });
        });
    }

    /*申请成为自媒体人*/
    applyMediaUser()
    {
        return new Promise((resolve)=> {
            this.repeatedly_(20).then(res => {
                if (res) {
                    this.axios.post('/appmycenter/getApplyToReportStatus.php',{
                        'userid': this.user_id,
                        'language': this.language,
                    }).then(res=>{
                        if(parseInt(res.data.returncode)===0) {
                            resolve(parseInt(res.data.reviewStatus));
                        }
                    });
                }
            });
        });
    }

    /*提交成为自媒体人*/
    submitApplyMediaUser(data)
    {
        return new Promise((resolve)=> {
            this.repeatedly_(20).then(res => {
                if (res) {
                    this.axios.post('/appmycenter/submitApplyToReport.php',{
                        'userid': this.user_id,
                        'catalog': data['cattypeid'], //选择的新闻类型
                        'chargetype': data['money_type'], //收费类型
                        'has_advert': data['money_is'], //是否收费
                        'introduction': data['self_review'], //自我简介
                        'language': this.language,
                    }).then(res=>{
                        if(parseInt(res.data.returncode)===0) {
                            resolve(res.data.returnmsg);
                        }else{
                            resolve('失败');
                        }
                    });
                }
            });
        });
    }

    /*新增咨询*/
    addNews(data)
    {
        return new Promise((resolve)=> {
            this.repeatedly_(20).then(res => {
                if (res) {
                    this.axios.post('/appinformation/addInfo.php',{
                        'authorhead': data['user_img'],
                        'authorname': data['user_name'],
                        'catid': data['news_id'],
                        'cattype': data['news_type'],
                        'contentimgs': data['content_img'], //逗号分隔
                        'contentimgsList': [], //作用不明
                        'title': data['content_title'],
                        'content': data['content'],
                        'contenttype': data['content_type'],
                        'detailhtml': "",
                        'fromtype': "",
                        'infoid': "",
                        'isadvert': data['is_ad'],
                        'isdetail': "0",
                        'istop': "0", //是否置顶(前沿和自定义资讯才有)
                        'onlyvip': "0", //秀尔和自定义资讯才有仅vip可见选项
                        'param': "",
                        'reviewflag': "0",
                        'reviewremark': "",
                        'status': "1", //是否可见
                        'styleid': "",
                        'userid': this.user_id,
                        'areacode': this.link_get['areacode'],
                        'ipcode': this.link_get['ipcode'],
                        'language': this.language,
                    },{headers:{
                        "Conten-Type":"multipart/form-data"
                    }}).then(res=>{
                        resolve({
                            state:parseInt(res.data.returncode),
                            msg:res.data.returnmsg
                        });
                    });
                }
            });
        });
    }

    /*获取订单状态*/
    getOrderStatus(data)
    {
        return new Promise((resolve)=> {
            this.axios.post('/apporder/loadorderstatus.php',{
                'ordercode': data['order_number'],
                'language': this.language,
            }).then(res=>{
                resolve({
                    state:parseInt(res.data.returncode),
                    msg:res.data.returnmsg
                });
            });
        });
    }
}

export default Data;
