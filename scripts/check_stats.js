// Ingestion script for Balfour Beatty jobs from user input
const fs = require('fs');
const path = require('path');

// Read existing realJobsData.json
const dataPath = path.resolve(__dirname, '../lib/db/realJobsData.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');
const data = JSON.parse(rawData);

console.log(`Current stats: ${data.companies.length} companies, ${data.jobs.length} jobs.`);
