const db = require('./config/db');

(async () => {
  try {
    const [rows] = await db.query('DESCRIBE chuong');
    const fs = require('fs');
    fs.writeFileSync('schema_chuong.json', JSON.stringify(rows, null, 2));
    console.log('Schema written to schema_chuong.json');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();


