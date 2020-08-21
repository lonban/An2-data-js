import Local from './Local'
import Data from './Data'

function mix(...mixins) {
    class Mix {
        constructor() {
            for (let mixin of mixins) {
                copyProperties(this, new mixin()); // 拷贝实例属性
            }
        }
    }

    for (let mixin of mixins) {
        copyProperties(Mix, mixin); // 拷贝静态属性
        copyProperties(Mix.prototype, mixin.prototype); // 拷贝原型属性
    }

    return Mix;
}

function copyProperties(target, source) {
    for (let key of Reflect.ownKeys(source)) {
        if (key !== 'constructor'
            && key !== 'prototype'
            && key !== 'name'
        ) {
            let desc = Object.getOwnPropertyDescriptor(source, key);
            Object.defineProperty(target, key, desc);
        }
    }
}

class Index extends mix(Local, Data) {
    user_id = 0; //在调用了login登录之后才会有
    link_get=[]; //链接里的参数
    is_repeatedly_ = 0; //开始请求时为真，避免多个重复请求

    constructor() {
        super();
    }

    this_(this_) {
        this.this__ = this_;
        this.link_get = this.this__.$An2_Link.get();
        this.getUserLocal();//这里就会执行登录
        return this;
    }

    /*反复获取user_id获取不到超出number次后重新登录*/
    repeatedly_(number) {
        number = number || 10;
        return new Promise((resolve) => {
            let interval_i = 0;
            let interval = setInterval(() => {
                if (this.user_id) {
                    clearInterval(interval);
                    resolve(1);
                } else {
                    if (interval_i++ > number) {//实在没有就调登录来获取
                        if (!this.is_repeatedly_) {//避免多个地方同时调用而产生多个循环
                            this.is_repeatedly_ = 1;
                            this.getUserLocal().then(() => {
                                clearInterval(interval);
                            });
                        }
                    }
                }
            }, 200);
        });
    }
}

export default Index;
