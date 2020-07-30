class Local {

  name_='an_';
  max_length_=1500;
  separator_='_;_';

  user(user_id)
  {
    if(user_id){
      this.name_+=user_id;
      this.user_id=user_id;
    }
  }

  /*创建本地缓存*/
  createStorage_(name, data, time) {
    switch (Object.prototype.toString.call(data)) {
      case '[object Object]':
        data = JSON.stringify(data);//对象
        break;
      case '[object Array]':
        data = JSON.stringify(data);//数组
        break;
    }
    if (time) {
      localStorage.setItem(this.name_ + 'time' + name, parseInt(Date.now()/1000)+time);
    }
    return localStorage.setItem(this.name_ + name, data);
  }

  createStorage(name, data, time)
  {
    return new Promise((resolve)=>{
      this.repeatedly_(5).then(res=>{
        if(res){
          resolve(this.createStorage_(name, data, time));
        }
      });
    });
  }

  /*在原数据基础上从后面追加,time为秒*/
  addStorage_(name, data, time) {
    switch (Object.prototype.toString.call(data)) {
      case '[object Object]':
        data = JSON.stringify(data);
        break;
      case '[object Array]':
        data = JSON.stringify(data);
        break;
    }
    let data2 = localStorage.getItem(this.name_ + name);
    if(time){localStorage.setItem(this.name_ + 'time' + name, parseInt(Date.now()/1000)+time);}
    if (data2) {
      if(data2.length>this.max_length_){
        data2 = data2.substr(parseInt(this.max_length_/2)).replace(/^_;_|^;_|^_/g,'');
      }
      return localStorage.setItem(this.name_ + name, data2 + this.separator_ + data);
    } else {
      return localStorage.setItem(this.name_ + name, data);
    }
  }

  addStorage(name, data, time){
    return new Promise((resolve)=>{
      this.repeatedly_(5).then(res=>{
        if(res){
          resolve(this.addStorage_(name, data, time));
        }
      });
    });
  }

  getStorage_(name, id) {
    let time = localStorage.getItem(this.name_ + 'time' + name);
    if(time&&parseInt(time)<parseInt(Date.now()/1000)){
      this.deleteStorage(name);
      return '';
    }else{
      let data = localStorage.getItem(this.name_ + name);
      if (data) {
        if (data.indexOf(this.separator_) != -1) {
          data = data.split(this.separator_);
          for (let i = 0; i < data.length; i++) {
            if (data[i].indexOf('{') != -1) {
              data[i] = JSON.parse(data[i]);
              if(Object.prototype.toString.call(id) == '[object Object]') {
                let key = Object.keys(id)[0];
                if (data[i][key] == id[key]) {
                  return data[i];
                }
              }else if(Object.prototype.toString.call(id) == '[object Number]'){
                if (i == id) {
                  return data[i];
                }
              }
            }
          }
        } else if (data.indexOf('{') != -1) {
          data = JSON.parse(data);
          if(Object.prototype.toString.call(id) == '[object Number]'){
            return data[id];
          }
        }
      }
      return data;
    }
  }

  getStorage(name, id)
  {
    return new Promise((resolve)=>{
      this.repeatedly_(5).then(res=>{
        if(res){
          resolve(this.getStorage_(name, id));
        }
      });
    });
  }

  deleteStorage_(name,id) {
    let data = localStorage.getItem(this.name_ + name);
    if (data) {
      if(Object.prototype.toString.call(id) == '[object Number]'){
        let str_i = data.indexOf(this.separator_);
        if (str_i != -1) {
          data = data.split(this.separator_);
          data.splice(id,1);
          return localStorage.setItem(this.name_ + name, data.join(this.separator_));
        }else{
          data = JSON.parse(data);
          data.splice(id,1);
          return localStorage.setItem(this.name_ + name, JSON.stringify(data));
        }
      }else{
        return localStorage.removeItem(this.name_ + name);
      }
    }
  }

  deleteStorage(name,id)
  {
    return new Promise((resolve)=>{
      this.repeatedly_(5).then(res=>{
        if(res){
          resolve(this.deleteStorage_(name,id));
        }
      });
    });
  }
}

export default Local;
