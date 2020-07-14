import Axios from 'axios'
import Qs from 'qs'

class Data{
  axios;
  api=''; //api头
  asset='http://a1.a/'; //资源路径头
  debug=1;
  this__='';
  price=price; //app交互

  constructor()
  {
    if(this.price){
      this.api = this.price.host;
    }
    this.axios = Axios.create({
      baseURL: this.api, //基础url前缀
      headers: {'X-Requested-With': 'XMLHttpRequest','Content-Type': 'application/x-www-form-urlencoded'}, //请求头信息XMLHttpRequest是Ajax异步请求方式，为null则传统同步请求
      timeout: 30000, //设置超时时间
      responseType: 'json', //返回数据类型,默认也是json
      transformRequest: [function (data){
        return Qs.stringify(data) //对json数据转成&字符拼接的形式
      }],
    });
  }

  setAuth_(access_token)
  {
    if(access_token){
      this.axios.interceptors.request.use(function(config){
        /*会生成一个Authorization: Bearer token头信息*/
        config.headers['Authorization'] = 'Bearer '+access_token;
        return config;
      },function(error){
        return Promise.reject(error);
      });
    }
  }

  /*地址方法*/
  map()
  {
    return new Promise((resolve)=>{
      this.price.on("GPSLocation", function(data){
        resolve(data);
      });
    });
  }

  /*注册*/
  createRegister(data)
  {
    data = {
      'avatarurl':data.photo,
      'nickname':data.name,
      'sex':data.sex,
      'location':data.location,
      'isencryp':data.isencryp,
      'agelevel':data.age,
      'purpose':data.purpose,
      'userid':this.this__.$store.state.loginUser.userid
    }
    return new Promise((resolve)=>{
      this.axios.post('/applogin/refreshinfo.php',data).then(res=>{
        resolve(res.data);
      });
    });
  }

  /*登录*/
  login()
  {
    return new Promise((resolve)=>{
      let token  = this.this__.$An2_Link.get('access_token'); //获取token
      this.axios.post('/applogin/loginfo2.php', {},{
        headers:{access_token: token}
      }).then(res => {
        let data = res.data;
        if (data.returncode == 0) {
          data.loginUser.sex = parseInt(data.loginUser.sex);
          this.this__.$store.commit('login',data.loginUser);
        } else {
          this.this__.$store.commit('login', {});
        }
        resolve(data);
      });
    });
  }

  /*获取所有用户信息*/
  getUserAll()
  {
    return new Promise((resolve)=>{
      let res_data = [];
      this.axios.get('/apphome/loadhomerecommed').then(res=>{
        res = res.data.recommonlist;
        for(let k in res){
          res_data[k] = {};
          if(parseInt(res[k]['status'])&&parseInt(res[k]['iscompleted'])){
            res_data[k]['id'] = res[k]['userid'];
            res_data[k]['photo'] = res[k]['headimg']||"../load.png"; //头像
            res_data[k]['name'] = res[k]['nickname']; //昵称
            res_data[k]['sex'] = parseInt(res[k]['sex']); //性别
            res_data[k]['age'] = res[k]['agelevel']; //年龄
            res_data[k]['location'] = res[k]['currentcity']||'无法获取'; //地址
            if(res[k]['purpose']){ //交友目地
              res_data[k]['interest'] = ['恋爱', '旅游', '望海'];//res.data.recommonlist[k]['purpose'].split(',');
            }else{
              res_data[k]['interest'] = [];
            }
            res_data[k]['signature'] = '等一个你陪我度过等一个你陪我度过等一个你陪我度过等一个你陪我度过等一个你陪我度过'||'...'; //个性签名
          }
        }
        resolve(res_data);
      });
    });
  }

  /*通过用户id获取用户信息*/
  getUser(user_id)
  {
    let res_data ={
      'id':10000039,
      'photo':'http://s3.2u.chat.s3-us-west-1.amazonaws.com/data/www/resources/avatar/t/39/10000039.jpg',
      'name':'吴彦祖',
      'sex':1,
      'age':45,
      'location':'无法获取',
      'purpose':'杨茜茜,花木成畦手自栽,模压,啊沙发上',
      'interest':['恋爱', '旅游', '望海'],
      'signature':'等一个你陪我度过等一个你陪我度过等一个你陪我度过等一个你陪我度过等一个你陪我度过',
    };
    return new Promise((resolve)=>{
      return resolve(res_data);
    });
  }

  /*通过类型id获取类型信息*/
  getType(type_id)
  {
    let res_data = [
      {
        'id':1,
        'status':1,
        'name':'文艺青年',
        'description':'',
      },
      {
        'id':2,
        'status':1,
        'name':'娱乐人生',
        'description':'',
      },
      {
        'id':3,
        'status':1,
        'name':'品质生活',
        'description':'',
      },
    ];
    let data = {};
    for(let i in res_data){
      if(res_data[i]['id'] == type_id){
        data = res_data[i];
        break;
      }
    }
    return new Promise((resolve)=>{
      return resolve(data);
    });
  }

  /*通过多媒体id获取多媒体信息*/
  getMedia(media_id)
  {
    let res_data = [
      {
        'id':1,
        'status':1,
        'type':'img',
        'address':'http://s3.2u.chat.s3-us-west-1.amazonaws.com/data/www/resources/avatar/t/23/10000023.jpg',
        'length':20,
      },
      {
        'id':2,
        'status':1,
        'type':'music',
        'address':'http://music.163.com/song/media/outer/url?id=447925558.mp3',
        'length':30,
      },
      {
        'id':3,
        'status':1,
        'type':'music',
        'address':'http://up_mp4.t57.cn/2018/1/03m/13/396131227319.m4a',
        'length':30,
      },
      {
        'id':4,
        'status':1,
        'type':'video',
        'address':'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
        'length':40,
      },
      {
        'id':5,
        'status':1,
        'type':'video',
        'address':'http://vjs.zencdn.net/v/oceans.mp4',
        'length':40,
      },
      {
        'id':6,
        'status':1,
        'type':'video',
        'address':'http://mirror.aarnet.edu.au/pub/TED-talks/911Mothers_2010W-480p.mp4',
        'length':40,
      },
    ];
    let data = {};
    for(let i in res_data){
      if(res_data[i]['id'] == media_id){
        data = res_data[i];
        break;
      }
    }
    return new Promise((resolve)=>{
      return resolve(data);
    });
  }

  /*获取指定类型的动态信息*/
  getCommunity(type_id)
  {
    let res_data = [
      {
        'userid':'10000040',
        'type_id':4,
        'media_id':1,
        'title':'',
        'content':'鸡蛋酱拌米粉，简单的美味，不失营养',
        'is_money':0,
        'media_money':10,
        'clock_money':40,
        'white':'',
        'black':'10000039,10000040',
        'like':'666',
        'ranking':'100'
      },
      {
        'userid':'10000040',
        'type_id':5,
        'media_id':2,
        'title':'',
        'content':'鸡蛋酱拌米粉，鸡蛋酱拌米粉，鸡蛋酱拌米粉，鸡蛋酱拌米粉，简单的美味，不失营养',
        'is_money':0,
        'media_money':10,
        'clock_money':40,
        'white':'',
        'black':'10000039,10000040',
        'like':'666',
        'ranking':'100'
      },
      {
        'userid':'10000040',
        'type_id':5,
        'media_id':3,
        'title':'',
        'content':'鸡蛋酱拌米粉，简单的美味，不失营养',
        'is_money':0,
        'media_money':10,
        'clock_money':40,
        'white':'',
        'black':'10000039,10000040',
        'like':'666',
        'ranking':'100'
      },
      {
        'userid':'10000040',
        'type_id':1,
        'media_id':4,
        'title':'',
        'content':'鸡蛋酱拌米粉，简单的美味，不失营养',
        'is_money':0,
        'media_money':10,
        'clock_money':40,
        'white':'',
        'black':'10000039,10000040',
        'like':'666',
        'ranking':'100'
      },
      {
        'userid':'10000040',
        'type_id':1,
        'media_id':5,
        'title':'',
        'content':'鸡蛋酱拌米粉，简单的美味，不失营养',
        'is_money':0,
        'media_money':10,
        'clock_money':40,
        'white':'',
        'black':'10000039,10000040',
        'like':'666',
        'ranking':'100'
      },
      {
        'userid':'10000040',
        'type_id':1,
        'media_id':6,
        'title':'',
        'content':'鸡蛋酱拌米粉，简单的美味，不失营养',
        'is_money':0,
        'media_money':10,
        'clock_money':40,
        'white':'',
        'black':'10000039,10000040',
        'like':'666',
        'ranking':'100'
      },
    ];
    return new Promise((resolve)=>{
      for(let i in res_data){
        this.getMedia(res_data[i]['media_id']).then(res=>{
          delete res_data[i]['media_id'];
          res_data[i]['media'] = res;
        });
        /*this.getType(res_data[i]['type_id']).then(res=>{
          delete res_data[i]['type_id'];
          res_data[i]['type'] = res;
        });*/
        this.getUser(res_data[i]['userid']).then(res=>{
          delete res_data[i]['userid'];
          res_data[i]['user'] = res;
        });
      }
      return resolve(res_data);
    });
  }
}

export default Data;
