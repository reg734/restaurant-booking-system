// 手動執行資料庫初始化腳本
const initializeDatabase = require('./database/init');

async function setup() {
  console.log('Setting up database...');
  await initializeDatabase();
  process.exit(0);
}

setup().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});