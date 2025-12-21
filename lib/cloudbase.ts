import cloudbase from '@cloudbase/js-sdk';

// CloudBase 配置
const app = cloudbase.init({
  env: 'cloud1-6gfr24p5f5b51c80', // 云开发环境ID
});

// 导出认证实例
export const auth = app.auth({
  persistence: 'local', // 用户登录态保存在本地
});

// 导出数据库实例
export const db = app.database();

// 导出云存储实例
export const storage = app.uploadFile.bind(app);

// 导出云函数调用
export const callFunction = app.callFunction.bind(app);

export default app;
