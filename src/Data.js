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
      timeout: 5000, //设置超时时间
      responseType: 'json', //返回数据类型,默认也是json
      transformRequest: [function (data){
        return Qs.stringify(data) //对json数据转成&字符拼接的形式
      }],
    });
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

  /*登录*/
  login()
  {
    let this_ = this.this__;
    return new Promise((resolve)=>{
      let token  = this_.$An2_Link.get('access_token'); //获取token
      this.axios.post('applogin/loginfo2.php', {},{
        headers:{access_token: token}
      }).then(res => {
        let data = res.data;
        if (data.returncode == 0) {
          this_.$store.commit('login',data.loginUser);
        } else {
          this_.$store.commit('login', {});
        }
        resolve(data);
      });
    });
  }

  /*注册*/
  createRegister(data)
  {
    let this_ = this.this__;
    data['userid'] = this_.$store.state.loginUser.userid;
    return new Promise((resolve)=>{
      this.axios.post('/applogin/refreshinfo.php',data).then(res=>{
        resolve(res.data);
      });
    });
  }
}

export default Data;
