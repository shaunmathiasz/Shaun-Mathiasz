import fs from 'node:fs/promises';
import {Pool} from 'pg';
const url=process.env.CV_MIGRATION_DATABASE_URL||process.env.DATABASE_URL;
if(!url)throw new Error('Set CV_MIGRATION_DATABASE_URL before running migrations.');
const u=new URL(url),local=['localhost','127.0.0.1','[::1]'].includes(u.hostname);for(const k of ['sslmode','sslcert','sslkey','sslrootcert'])u.searchParams.delete(k);
const pool=new Pool({connectionString:u.toString(),ssl:local?false:{rejectUnauthorized:true},max:1});
try{await pool.query(await fs.readFile(new URL('../migrations/001_cv_portal.sql',import.meta.url),'utf8'));console.log('CV portal migration applied.');}catch{console.error('Migration failed. Inspect database permissions and connectivity without printing credentials.');process.exitCode=1;}finally{await pool.end();}
