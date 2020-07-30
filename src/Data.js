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
    return new Promise((resolve)=>{
      this.repeatedly_(5).then(res=>{
        if(res){
          let data_ = {};
          if(data.photo){data_['avatarurl'] = data.photo;}
          if(data.name){data_['nickname'] = data.name;}
          if(data.location){data_['location'] = data.location;}
          if(data.age){data_['agelevel'] = data.age;}
          if(data.purpose){data_['purpose'] = data.purpose;}
          if(data.signature){data_['sign'] = data.signature;}
          if(data.interest){data_['ccidList'] = data.interest;}
          data_['sex'] = data.sex;
          data_['isencryp'] = data.isencryp?1:0;
          data_['userid'] = this.user_id;
          this.axios.post('/applogin/refreshinfo.php',data_).then(res=>{
            resolve(res.data);
          });
        }
      });
    });
  }

  /*登录*/
  login()
  {
    return new Promise((resolve)=>{
      this.axios.post('/applogin/loginfo2.php', {},{
        headers:{access_token: this.this__.$An2_Link.get('access_token')}
      }).then(res=>{
        res=res.data;
        res.returncode = parseInt(res.returncode);
        if(res.returncode == 0){
          res.loginUser.sex = parseInt(res.loginUser.sex);
          res.loginUser.iscompleted = parseInt(res.loginUser.iscompleted);
          res.loginUser.ccidlist = res.ccidlist;
          res.loginUser.returncode = res.returncode;
          this.user_id = res.loginUser.userid;
          this.user(this.user_id);
          this.this__.$store.commit('login',res.loginUser);
        }else{
          this.this__.$store.commit('login', {});
          console.error(res);
        }
        resolve(res);
      });
    });
  }

  /*获取所有用户信息*/
  getFriendsAll(data)
  {
    return new Promise((resolve)=>{
      this.repeatedly_(5).then(res=>{
        if(res){
          let res_data = [];
          this.axios.post('/apphome/loadhomerecommed',{
            'userid':this.user_id,
            'pageIndex':data['index'],
            'pageSize':data['size'],
            'language':this.this__.$An2_Language.get()
          }).then(res=>{
            res = res.data.recommonlist;
            if(res){
              for(let k in res){
                res_data[k] = {};
                if(parseInt(res[k]['status'])&&parseInt(res[k]['iscompleted'])){
                  res_data[k]['id'] = res[k]['userid'];
                  res_data[k]['acc_id'] = res[k]['md5accid'];
                  res_data[k]['photo'] = res[k]['headimg']||"../load.png"; //头像
                  res_data[k]['name'] = res[k]['nickname']; //昵称
                  res_data[k]['sex'] = parseInt(res[k]['sex']); //性别
                  res_data[k]['age'] = res[k]['agelevel']; //年龄
                  res_data[k]['location'] = res[k]['currentcity']||'无法获取'; //地址
                  res_data[k]['purpose'] = res[k]['purpose'];//交友目地
                  res_data[k]['interest'] = res[k]['ccidlist'];//用户需求
                  res_data[k]['signature'] = res[k]['sign']||'...'; //个性签名
                }
              }
              resolve(res_data);
            }
          });
        }
      });
    });
  }

  /*获取附近用户信息*/
  getNearbyFriendsAll(data)
  {
    return new Promise((resolve)=>{
      this.repeatedly_(5).then(res=>{
        if(res){
          let res_data = [];
          this.axios.post('apphome/loadnearby.php', {
            'access_token':this.this__.$An2_Link.get('access_token'),
            "longitude" : 120.0008498431098,
            "latitude" : 30.295762629959665,
            'pageIndex':data['index'],
            'pageSize':data['size'],
            'language':this.this__.$An2_Language.get()
          }).then(res=>{
            res = res.data.data;
            if(res){
              for(let k in res){
                res_data[k] = {};
                res_data[k]['id'] = res[k]['userId'];
                res_data[k]['acc_id'] = res[k]['accid'];
                res_data[k]['photo'] = res[k]['avatarUrl']||"../load.png"; //头像
                res_data[k]['name'] = res[k]['nickname']; //昵称
                res_data[k]['sex'] = parseInt(res[k]['sex']); //性别
                res_data[k]['distance'] = res[k]['hidistance']; //距离
                res_data[k]['signature'] = res[k]['description']||'...'; //个性签名
              }
              resolve(res_data);
            }
          });
        }
      });
    });
  }

  /*通过用户id获取用户信息*/
  getUser(user_id)
  {
    return new Promise((resolve)=>{
      this.axios.post('/apphome/selUserById',{
        'userid':user_id,
        'language':this.this__.$An2_Language.get()
      }).then(res=>{
        res = res.data;
        if(res) {
          let res_data ={
            'id':res['user']['userid'],
            'acc_id':res['user']['md5accid'],
            'photo':res['user']['headimg'],
            'name':res['user']['nickname'],
            'sex':res['user']['sex'],
            'age':res['user']['agelevel'],
            'location':res['user']['currentcity'],
            'purpose':res['user']['purpose'],
            'interest':res['ccidlist'],
            'signature':res['user']['sign'],
          }
          resolve(res_data);
        }
      });
    });
  }

  getUserLocal()
  {
    return new Promise((resolve)=>{
      this.repeatedly_(5).then(res=>{
        console.log(this.this__.$store.state);
        if(res){
          let data = this.this__.$store.state.loginUser;
          let res_data ={
            'id':data['userid'],
            'acc_id':data['md5accid'],
            'is_register':data['iscompleted'],
            'photo':data['headimg'],
            'name':data['nickname'],
            'sex':data['sex'],
            'age':data['agelevel'],
            'location':data['currentcity'],
            'purpose':data['purpose'],
            'interest':data['ccidlist'],
            'signature':data['sign'],
          }
          resolve(res_data);
        }
      });
    });
  }

  /*通过类型id获取类型信息*/
  getType(type_id)
  {
    return new Promise((resolve)=>{
      type_id = type_id||0;
      this.axios.post('/apphome/loadhomesamepeople',{
        'pccid':type_id,
        'language':this.this__.$An2_Language.get()
      }).then(res=>{
        res = res.data.recommonlist;
        if(res){
          let typeF = (data)=>{
            let res_data = [];
            for(let i=0;i<data.length;i++){
              res_data[i]={};
              res_data[i]['id']=data[i]['ccid'];
              res_data[i]['pid']=data[i]['pccid'];
              res_data[i]['show']=0;//是否显示
              res_data[i]['state']=0;
              res_data[i]['name']=data[i]['name'];
              res_data[i]['img']=data[i]['img'];
              res_data[i]['img_default']=data[i]['img'];
              res_data[i]['description']=data[i]['description'];
              if(data[i]['children']&&data[i]['children'].length>0){
                res_data[i]['children'] = typeF(data[i]['children']);
              }
            }
            return res_data;
          }
          resolve(typeF(res));
        }
      });
    });
  }

  /*获取指定类型的动态信息*/
  getCommunity(data)
  {
    return new Promise((resolve)=>{
      let res_data = [];
      data['type_id'] = data['type_id']||0;
      this.axios.post('/apphome/selDynamicState',{
        'ccid':data['type_id'],
        'pageIndex':data['index'],
        'pageSize':data['size'],
        'language':this.this__.$An2_Language.get()
      }).then(res=>{
        res = res.data.recommonlist;
        if(res) {
          for (let i = 0; i < res.length; i++) {
            res_data[i] = {};
            res_data[i]['community_id'] = res[i]['cdid'];
            res_data[i]['type_id'] = res[i]['ccid'];
            res_data[i]['title'] = res[i]['title'];
            res_data[i]['content'] = res[i]['content'];
            res_data[i]['is_money'] = res[i]['is_media_free'];
            res_data[i]['media_money'] = res[i]['media_price'];
            res_data[i]['clock_money'] = res[i]['clock_price'];
            res_data[i]['white'] = res[i]['white'];
            res_data[i]['black'] = res[i]['black'];
            res_data[i]['like'] = res[i]['like'];
            res_data[i]['ranking'] = res[i]['ranking'];

            res_data[i]['media'] = {};
            res_data[i]['media_id'] = res[i]['cdmid'];
            res_data[i]['media']['id'] = res[i]['cdmid'];
            res_data[i]['media']['state'] = 0;
            res_data[i]['media']['status'] = res[i]['status'];
            res_data[i]['media']['thumbnail'] = res[i]['one_address'];
            res_data[i]['media']['type'] = res[i]['type'];
            res_data[i]['media']['address'] = res[i]['address'];
            res_data[i]['media']['length'] = res[i]['length'];

            res_data[i]['user'] = {};
            res_data[i]['user_id'] = res[i]['userid'];
            res_data[i]['user']['id'] = res[i]['userid'];
            res_data[i]['user']['photo'] = res[i]['headimg'];
            res_data[i]['user']['name'] = res[i]['nickname'];
          }
          resolve(res_data);
        }
      });
    });
  }

  /*获取指定类型的动态信息*/
  getCityCommunity(data)
  {
    return new Promise((resolve)=> {
      this.repeatedly_(5).then(res=>{
        if(res){
          let res_data = [];
          this.axios.post('/apphome/selCityDynamic', {
            'userid': this.user_id,
            'currentcity': data['type_id']||this.this__.$store.state.loginUser.currentcity,
            'pageIndex':data['index'],
            'pageSize':data['size'],
            'language':this.this__.$An2_Language.get()
          }).then(res => {
            res = res.data.returnmsg;
            if(res) {
              for (let i = 0; i < res.length; i++) {
                res_data[i] = {};
                res_data[i]['media'] = {};
                res_data[i]['user'] = {};
                res_data[i]['user'] = {};
                res_data[i]['community_id'] = res[i]['cdid'];
                res_data[i]['type_id'] = res[i]['ccid'];
                res_data[i]['title'] = res[i]['title'];
                res_data[i]['content'] = res[i]['content'];
                res_data[i]['is_money'] = res[i]['is_media_free'];
                res_data[i]['media_money'] = res[i]['media_price'];
                res_data[i]['clock_money'] = res[i]['clock_price'];
                res_data[i]['white'] = res[i]['white'];
                res_data[i]['black'] = res[i]['black'];
                res_data[i]['like'] = res[i]['like'];
                res_data[i]['ranking'] = res[i]['ranking'];

                res_data[i]['media_id'] = res[i]['cdmid'];
                res_data[i]['media']['id'] = res[i]['cdmid'];
                res_data[i]['media']['status'] = 1;
                res_data[i]['media']['thumbnail'] = res[i]['one_address'];
                res_data[i]['media']['type'] = res[i]['type'];
                res_data[i]['media']['address'] = res[i]['address'];
                res_data[i]['media']['length'] = res[i]['length'];

                res_data[i]['user_id'] = res[i]['userid'];
                res_data[i]['user']['id'] = res[i]['userid'];
                res_data[i]['user']['photo'] = res[i]['headimg'];
                res_data[i]['user']['name'] = res[i]['nickname'];
              }
              resolve(res_data);
            }
          });
        }
      });
    });
  }

  /*获取自己发表的动态信息*/
  getSelfCommunity(data)
  {
    return new Promise((resolve)=> {
      this.repeatedly_(5).then(is=>{
        if(is){
          let res_data = [];
          this.axios.post('applogin/loaddynamiclist', {
            'userid': this.user_id,
            'pageIndex':data['index'],
            'pageSize':data['size'],
            'language':this.this__.$An2_Language.get()
          }).then(res => {
            res = res.data.returnmsg;
            if(res) {
              let time = {};
              let time2 = 0;
              for (let i = 0; i < res.length; i++) {
                time = new Date(res[i]['createtime']);
                time2 = parseInt((Date.now()-time.getTime())/1000/60)||666;
                time2 = time2>1440?time.getMonth()+'月'+time.getDate()+'日':time2+'分钟前';
                res_data[i] = {};
                res_data[i]['media'] = {};
                res_data[i]['community_id'] = res[i]['cdid'];
                res_data[i]['type_id'] = res[i]['ccid'];
                res_data[i]['title'] = res[i]['title'];
                res_data[i]['content'] = res[i]['content'];
                res_data[i]['time'] = time2;
                res_data[i]['is_money'] = res[i]['is_media_free'];
                res_data[i]['media_money'] = res[i]['media_price'];
                res_data[i]['clock_money'] = res[i]['clock_price'];
                res_data[i]['white'] = res[i]['white'];
                res_data[i]['black'] = res[i]['black'];
                res_data[i]['like'] = res[i]['like'];
                res_data[i]['ranking'] = res[i]['ranking'];

                res_data[i]['media_id'] = res[i]['cdmid'];
                res_data[i]['media']['id'] = res[i]['cdmid'];
                res_data[i]['media']['status'] = 1;
                res_data[i]['media']['thumbnail'] = res[i]['one_address'];
                res_data[i]['media']['type'] = res[i]['type'];
                res_data[i]['media']['address'] = res[i]['address'];
                res_data[i]['media']['length'] = res[i]['length'];
              }
              resolve(res_data);
            }
          });
        }
      });
    });
  }

  /*点赞与取消点击state 1/0*/
  addLike(community_id,state)
  {
    return new Promise((resolve)=>{
      community_id = community_id||0;
      this.axios.post('/apphome/selLikeIt',{
        'cdid':community_id,
        'yesno':state,
        'language':this.this__.$An2_Language.get()
      }).then(res=>{
        res = res.data.recommonlist;
        if(res) {
          resolve(res);
        }
      });
    });
  }

  /*添加兴趣爱好*/
  addInterest(community_id_arr)
  {
    return new Promise((resolve)=>{
      this.repeatedly_(5).then(res=>{
        if(res){
          community_id_arr = community_id_arr||0;
          this.axios.post('/apphome/updateUserCatelog',{
            'ccid':community_id_arr,
            'userid':this.user_id,
            'language':this.this__.$An2_Language.get()
          }).then(res=>{
            res = res.data.recommonlist;
            if(res) {
              resolve(res);
            }
          });
        }
      });
    });
  }
}

export default Data;
