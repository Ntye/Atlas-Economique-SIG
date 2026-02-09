const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { productionRegions, departementsData } = require('../services/mockData'); // Import mock data

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function createTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create regions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS regions (
        id SERIAL PRIMARY KEY,
        adm1_name VARCHAR(255),
        adm1_name1 VARCHAR(255),
        adm1_pcode VARCHAR(255) UNIQUE,
        adm0_name VARCHAR(255),
        adm0_name1 VARCHAR(255),
        adm0_pcode VARCHAR(255),
        area_sqkm DOUBLE PRECISION,
        center_lat DOUBLE PRECISION,
        center_lon DOUBLE PRECISION,
        geometry JSONB
      );
    `);
    console.log('Table "regions" created or already exists.');

    // Add production_details column to regions if it doesn't exist
    await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='regions' AND column_name='production_details') THEN
              ALTER TABLE regions ADD COLUMN production_details JSONB DEFAULT '{}';
          END IF;
      END
      $$;
    `);
    console.log('Column "production_details" added to "regions" if not exists.');


    // Create departements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS departements (
        id SERIAL PRIMARY KEY,
        adm2_name VARCHAR(255),
        adm2_name1 VARCHAR(255),
        adm2_pcode VARCHAR(255) UNIQUE,
        adm1_name VARCHAR(255),
        adm1_name1 VARCHAR(255),
        adm1_pcode VARCHAR(255) REFERENCES regions(adm1_pcode),
        adm0_name VARCHAR(255),
        adm0_name1 VARCHAR(255),
        adm0_pcode VARCHAR(255),
        area_sqkm DOUBLE PRECISION,
        center_lat DOUBLE PRECISION,
        center_lon DOUBLE PRECISION,
        geometry JSONB
      );
    `);
    console.log('Table "departements" created or already exists.');

    // Add population column to departements if it doesn't exist
    await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departements' AND column_name='population') THEN
              ALTER TABLE departements ADD COLUMN population INTEGER DEFAULT 0;
          END IF;
      END
      $$;
    `);
    console.log('Column "population" added to "departements" if not exists.');

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function uploadData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Load regions data
    const regionsPath = path.join(__dirname, '../cameroun_regions.json');
    const regionsRaw = fs.readFileSync(regionsPath, 'utf8');
    const regionsGeoJSONData = JSON.parse(regionsRaw);

    for (const feature of regionsGeoJSONData.features) {
      const p = feature.properties;
      const regionProduction = productionRegions[p.adm1_name1] || {};

      await client.query(
        `INSERT INTO regions (adm1_name, adm1_name1, adm1_pcode, adm0_name, adm0_name1, adm0_pcode, area_sqkm, center_lat, center_lon, geometry, production_details)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (adm1_pcode) DO UPDATE SET
           adm1_name = EXCLUDED.adm1_name,
           adm1_name1 = EXCLUDED.adm1_name1,
           adm0_name = EXCLUDED.adm0_name,
           adm0_name1 = EXCLUDED.adm0_name1,
           adm0_pcode = EXCLUDED.adm0_pcode,
           area_sqkm = EXCLUDED.area_sqkm,
           center_lat = EXCLUDED.center_lat,
           center_lon = EXCLUDED.center_lon,
           geometry = EXCLUDED.geometry,
           production_details = EXCLUDED.production_details;`,
        [p.adm1_name, p.adm1_name1, p.adm1_pcode, p.adm0_name, p.adm0_name1, p.adm0_pcode, p.area_sqkm, p.center_lat, p.center_lon, feature.geometry, regionProduction]
      );
    }
    console.log('Regions data uploaded with production details.');

    // Load departements data
    const departementsPath = path.join(__dirname, '../cameroun_departements.json');
    const departementsRaw = fs.readFileSync(departementsPath, 'utf8');
    const departementsGeoJSONData = JSON.parse(departementsRaw);

    for (const feature of departementsGeoJSONData.features) {
      const p = feature.properties;
      const nomRegion = p.adm1_name1;
      const nomDept = p.adm2_name1 || p.adm2_name;
      const deptPopulation = departementsData[nomRegion]?.find(d => d.nom === nomDept)?.population || 0;

      await client.query(
        `INSERT INTO departements (adm2_name, adm2_name1, adm2_pcode, adm1_name, adm1_name1, adm1_pcode, adm0_name, adm0_name1, adm0_pcode, area_sqkm, center_lat, center_lon, geometry, population)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (adm2_pcode) DO UPDATE SET
           adm2_name = EXCLUDED.adm2_name,
           adm2_name1 = EXCLUDED.adm2_name1,
           adm1_name = EXCLUDED.adm1_name,
           adm1_name1 = EXCLUDED.adm1_name1,
           adm1_pcode = EXCLUDED.adm1_pcode,
           adm0_name = EXCLUDED.adm0_name,
           adm0_name1 = EXCLUDED.adm0_name1,
           adm0_pcode = EXCLUDED.adm0_pcode,
           area_sqkm = EXCLUDED.area_sqkm,
           center_lat = EXCLUDED.center_lat,
           center_lon = EXCLUDED.center_lon,
           geometry = EXCLUDED.geometry,
           population = EXCLUDED.population;`,
        [p.adm2_name, p.adm2_name1, p.adm2_pcode, p.adm1_name, p.adm1_name1, p.adm1_pcode, p.adm0_name, p.adm0_name1, p.adm0_pcode, p.area_sqkm, p.center_lat, p.center_lon, feature.geometry, deptPopulation]
      );
    }
    console.log('Departements data uploaded with population details.');

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await createTables();
    await uploadData();
    console.log('Database setup and data upload complete.');
  } catch (err) {
    console.error('Error during database setup or data upload:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}
