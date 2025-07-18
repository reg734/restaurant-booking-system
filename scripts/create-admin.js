const bcrypt = require('bcryptjs');
const db = require('../database/db');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdmin() {
  console.log('建立管理員帳號');
  
  rl.question('請輸入使用者名稱: ', (username) => {
    rl.question('請輸入密碼: ', async (password) => {
      rl.question('請輸入 Email: ', async (email) => {
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          
          const query = `
            INSERT INTO users (username, password, email)
            VALUES ($1, $2, $3)
            RETURNING id, username, email
          `;
          
          const result = await db.query(query, [username, hashedPassword, email]);
          
          console.log('管理員帳號建立成功！');
          console.log('ID:', result.rows[0].id);
          console.log('使用者名稱:', result.rows[0].username);
          console.log('Email:', result.rows[0].email);
          
        } catch (error) {
          console.error('建立失敗:', error.message);
          if (error.code === '23505') {
            console.error('使用者名稱或 Email 已存在');
          }
        } finally {
          rl.close();
          process.exit();
        }
      });
    });
  });
}

createAdmin();