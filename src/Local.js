class Local
{
    /*创建本地缓存*/
    createStorage(name,data)
    {
      switch(Object.prototype.toString.call(data)){
        case '[object Object]':data = JSON.stringify(data);//对象
          break;
        case '[object Array]':data = JSON.stringify(data);//数组
          break;
      }
      return localStorage.setItem('an_cc'+name,data);
    }

    addStorage(name,data)
    {
      switch(Object.prototype.toString.call(data)){
        case '[object Object]':
          data = JSON.stringify(data);
          break;
        case '[object Array]':
          data = JSON.stringify(data);
          break;
      }
      let data2 = localStorage.getItem('an_cc'+name);
      if(data2){
        return localStorage.setItem('an_cc'+name,data2+'_;_'+data);
      }else{
        return localStorage.setItem('an_cc'+name,data);
      }
    }

    getStorage(name,id)
    {
      let data = localStorage.getItem('an_cc'+name);
      if(data) {
        if (data.indexOf('_;_') != -1) {
          data = data.split('_;_');
          for (let i = 0; i < data.length; i++) {
            if (data[i].indexOf('{') != -1) {
              data[i] = JSON.parse(data[i]);
              if (id) {
                if (data[i]['id'] == id) {
                  return data[i];
                }
              }
            }
          }
        } else if (data.indexOf('{') != -1) {
          data = JSON.parse(data);
        }
      }
      return data;
    }

    deleteStorage(name)
    {
      return localStorage.removeItem('an_cc'+name);
    }
}

export default Local;
