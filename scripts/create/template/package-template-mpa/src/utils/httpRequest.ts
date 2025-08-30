import axios from 'axios';
import { message } from 'antd';

const getSsoLoginUrl = () => {
  // 线下 SSO 登录页的 baseUrl, 线上 SSO 环境替换为 https://sso.production.com/login
  const ssoLoginBaseUrl = 'https://sso.test.com/login';
    
  // ⚠️请替换为项目自身使用的 clientId
  const clientId = 'client_id';
  const timestamp = Date.now();
  const originalUrl = window.location.href;
  const callbackUrl = `https://xxx.yyy.com/api/carrier/sso/callback4550?original-url=${encodeURIComponent(originalUrl)}`;
  // eslint-disable-next-line @stylistic/max-len
  const ssoLoginUrl = `${ssoLoginBaseUrl}?client_id=${clientId}&t=${timestamp}&redirect_uri=${encodeURIComponent(callbackUrl)}`;
  return ssoLoginUrl;
};

function isProductionEnvironment() {
  // @ts-expect-error
  return window.__ENV === 'production';
}

// 获取 swimlaneKey 泳道名
const getSwimlaneKey = () => {
  if (isProductionEnvironment()) {
    return {};
  }

  const { host } = window.location;
  if (host.includes('-sl-')) {
    const [swimlaneKey] = host.split('-sl-');
    return {
      'Swimlane': swimlaneKey,
    };
  }
  
  return {};
};

// 接口超时设置，5000ms
axios.defaults.timeout = 5000;

// 每个请求默认发送的请求头
// @ts-ignore
axios.defaults.headers = {
  // 添加 swimlaneKey
  ...getSwimlaneKey(),
  'X-Requested-with': 'XMLHttpRequest',
  'X-Custom-Header': '1010',
  post: {'Content-Type': 'application/x-www-form-urlencoded' },
  // 可加入其余默认请求头
};

// 合法的http响应校验
axios.defaults.validateStatus = (status: number) => status >= 200 && status < 500;

function isDevOrDefaultEnvironment() {
  // @ts-expect-error
  return window.__ENV === 'dev' || window.__ENV === '';
}

function isLogout(data: any) {
  // 业务code 和 业务 status
  const { code, status } = data || {};
  return status === 401 || code === 30002;
}

function domainIsLocalhost() {
  return location.host.toLocaleLowerCase().
    indexOf('localhost') > -1;
}

axios.interceptors.response.use(
  (response: any) => {
    // 响应体的内容
    const { data } = response;

    if (isDevOrDefaultEnvironment() && isLogout(data)) {
      console.log('未登录');

      if (domainIsLocalhost()) {
        message.error('sso无效，请通过本地host域名访问!');
        return response;
      }
      
      // 未登录
      window.location.href = getSsoLoginUrl();
    }

    return response;
  }, 
  (error: any) => Promise.reject(error)
);

// raw 开头的方法，返回http响应头和响应体
// 非 raw 开头的方法，返回http响应体，也就是业务数据

const rawRequestGet = <Data = any>(url: string, params: any) => axios<Data>({
  url,
  method: "get",
  params
});

const rawRequestPostAsQuery = <Data = any>(url: string, params: any) => axios<Data>({
  url,
  method: "post",
  params
});

const rawRequestPostAsJson = <Data = any>(url: string, data: any) => axios<Data>({
  url,
  method: "post",
  headers: {
    'Content-Type': 'application/json'
  },
  data
});

const rawRequestPostAsForm = <Data = any>(url: string, data: any) => axios<Data>({
  url,
  method: "post",
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  data: new URLSearchParams(data).
    toString()
});

const requestGet = <Data = any>(url: string, params: any) => axios<Data>({
  url,
  method: "get",
  params
}).then(res => res.data);

const requestPostAsQuery = <Data = any>(url: string, params: any) => axios<Data>({
  url,
  method: "post",
  params
}).then(res => res.data);

const requestPostAsJson = <Data = any>(url: string, data: any) => axios<Data>({
  url,
  method: "post",
  headers: {
    'Content-Type': 'application/json'
  },
  data
}).then(res => res.data);

const requestPostAsForm = <Data = any>(url: string, data: any) => axios<Data>({
  url,
  method: "post",
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  data: new URLSearchParams(data).
    toString()
}).then(res => res.data);


const http = {
  rawRequestGet,
  rawRequestPostAsQuery,
  rawRequestPostAsJson,
  rawRequestPostAsForm,

  requestGet,
  requestPostAsQuery,
  requestPostAsJson,
  requestPostAsForm
};

export default http;

export type Common<T = any> = {
  code: number;
  msg?: string;
  message?: string;
  status?: number;
  data: T;
}