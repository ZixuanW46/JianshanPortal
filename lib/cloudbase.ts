import cloudbase from '@cloudbase/js-sdk';

// CloudBase 配置
// 确保只在客户端初始化，避免 SSR 报错 "window is not defined"
const app = typeof window === 'undefined' ? null : cloudbase.init({
  env: 'cloud1-6gfr24p5f5b51c80', // 云开发环境ID
});

// 导出认证实例
export const auth = app ? app.auth({
  persistence: 'local', // 用户登录态保存在本地
}) : null;

// 导出数据库实例
export const db = app ? app.database() : null;

// 导出云存储实例
export const storage = app ? app.uploadFile.bind(app) : null;

// 导出云函数调用
export const callFunction = app ? app.callFunction.bind(app) : null;

export default app;
