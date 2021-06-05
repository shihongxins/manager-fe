/**
 * @file /src/utils/utils.js
 * @description 封装通用工具函数
 */

export default {
  /**
   * @description 日期格式化工具函数
   */
  formatterDateTime (datetime, formatter) {
    let timeScamp = 0;
    if (typeof datetime == "number") {
      timeScamp = datetime
    } else if (typeof datetime == 'string') {
      timeScamp = (new Date(datetime)).getTime()
      // ISO 时间转为 UTC 得加上时区偏移量（分钟 => 毫秒）
      if (/T|Z/i.test(datetime)) {
        timeScamp += (new Date()).getTimezoneOffset() * 60 *1000
      }
    } else if (Object.prototype.toString.call(datetime) == '[object Date]') {
      timeScamp = datetime.getTime()
    } else {
      console.error('Invalid datetime')
    }
    const _datetime = new Date()
    _datetime.setTime(timeScamp)
    let _formatter = formatter || 'yyyy-MM-dd HH:mm:ss'
    const rules = {
      'y{4}': _datetime.getFullYear().toString(),
      'y{2}': _datetime.getFullYear().toString().slice(2),
      'M{2}': ('00'+(_datetime.getMonth() + 1)).slice(-2),
      'M{1}': (_datetime.getMonth() + 1).toString(),
      'd{2}': ('00'+_datetime.getDate()).slice(-2),
      'H{2}': _datetime.getHours().toString(),
      'm{2}': _datetime.getMinutes().toString(),
      'm{1}': _datetime.getMinutes().valueOf().toString(),
      's{2}': ('00'+_datetime.getSeconds()).slice(-2),
      '\.(s|S)+': '.'+('000'+_datetime.getMilliseconds()).slice(-3)
    }
    for (let r in rules) {
      const reg = new RegExp(`(${r})`)
      if (reg.test(_formatter)) {
        _formatter = _formatter.replace(reg, rules[r])
      }
    }
    return _formatter
  }
}