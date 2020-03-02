class storage {
  constructor(props) {
    this.props = props || {};
    this.source = wx || this.props.source;
  }

  /**
   * 获取缓存
   * @param key
   * @param def 若想要无缓存时，返回默认值则get('key','默认值')（支持字符串、json、数组、boolean等等）
   * @returns {boolean|*}
   */
  get(key, def = '') {
    const data = this.source,
      expire = parseInt(data.getStorageSync(`${key}__expire__`) || 0);
    // 过期失效
    if (expire) {
      if ((new Date()).getTime() > expire) {
        this.remove(key);
        return undefined;
      }
    }
    let value = data.getStorageSync(key);
    return value ? value : def;
  }

  /**
   * 设置缓存
   * @param key
   * @param value
   * @param timeout 过期时间（单位：毫秒）不设置时间即为永久保存
   * @returns {*}
   */
  put(key, value, timeout = 0) {
    let data = this.source;
    let _timeout = parseInt(timeout);
    data.setStorageSync(key, value);
    if (_timeout) {
      data.setStorageSync(`${key}__expire__`, (new Date()).getTime() + _timeout);
    } else {
      data.removeStorageSync(`${key}__expire__`);
    }
    return value;
  }

  remove(key) {
    let data = this.source;
    data.removeStorageSync(key);
    data.removeStorageSync(`${key}__expire__`);
    return true;
  }
}

let storages = new storage();
wx.$storage = storages;
export default storages;