import initSqlJs from 'sql.js';
import fs from 'fs';

const SQL = await initSqlJs();
const buf = fs.readFileSync('./local.sqlite');
const db = new SQL.Database(buf);

// Fix Arup generic careers URLs -> specific job board search
db.run(`UPDATE jobs 
  SET apply_url = 'https://jobs.arup.com/jobs?keywords=' || REPLACE(title, ' ', '+'),
      job_url = 'https://jobs.arup.com/jobs?keywords=' || REPLACE(title, ' ', '+'),
      source_url = 'https://jobs.arup.com/jobs?keywords=' || REPLACE(title, ' ', '+')
  WHERE apply_url LIKE '%careers.arup.com%'`);

// Fix generic Canva URL
db.run(`UPDATE jobs 
  SET apply_url = 'https://www.canva.com/careers/jobs/?query=' || REPLACE(title, ' ', '+'),
      job_url = 'https://www.canva.com/careers/jobs/?query=' || REPLACE(title, ' ', '+')
  WHERE apply_url = 'https://www.canva.com/careers/'`);

// Fix generic Shopify URL
db.run(`UPDATE jobs 
  SET apply_url = 'https://www.shopify.com/careers/search?keywords=' || REPLACE(title, ' ', '+'),
      job_url = 'https://www.shopify.com/careers/search?keywords=' || REPLACE(title, ' ', '+')
  WHERE apply_url = 'https://www.shopify.com/careers'`);

// Fix generic BHP URL
db.run(`UPDATE jobs 
  SET apply_url = 'https://careers.bhp.com/search-jobs?keywords=' || REPLACE(title, ' ', '+'),
      job_url = 'https://careers.bhp.com/search-jobs?keywords=' || REPLACE(title, ' ', '+')
  WHERE apply_url LIKE '%careers.bhp.com%' AND apply_url NOT LIKE '%keywords%'`);

const result = db.exec("SELECT title, apply_url FROM jobs LIMIT 10");
console.log('Jobs and apply URLs after fix:');
result[0].values.forEach(([title, url]) => console.log(`  ${title} -> ${url}`));

const data = db.export();
fs.writeFileSync('./local.sqlite', Buffer.from(data));
console.log('\n✅ Database updated and saved!');
db.close();
