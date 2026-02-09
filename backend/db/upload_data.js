const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function createTables(client) {
  console.log('--- Création des tables ---');

  // Table des Régions
  await client.query(`
    CREATE TABLE IF NOT EXISTS regions (
      adm1_pcode VARCHAR(255) PRIMARY KEY,
      adm1_name VARCHAR(255),
      adm1_name1 VARCHAR(255),
      adm0_name VARCHAR(255),
      area_sqkm DOUBLE PRECISION,
      center_lat DOUBLE PRECISION,
      center_lon DOUBLE PRECISION,
      geometry JSONB,
      production_details JSONB DEFAULT '{}'
    );
  `);

  // Table des Départements
  await client.query(`
    CREATE TABLE IF NOT EXISTS departements (
      adm2_pcode VARCHAR(255) PRIMARY KEY,
      adm2_name VARCHAR(255),
      adm2_name1 VARCHAR(255),
      adm1_pcode VARCHAR(255) REFERENCES regions(adm1_pcode),
      adm1_name1 VARCHAR(255),
      population INTEGER DEFAULT 0,
      area_sqkm DOUBLE PRECISION,
      center_lat DOUBLE PRECISION,
      center_lon DOUBLE PRECISION,
      geometry JSONB
    );
  `);

  // Table des Produits
  await client.query(`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(50) PRIMARY KEY,
      nom VARCHAR(100),
      unite VARCHAR(50),
      icone VARCHAR(10),
      couleur VARCHAR(20),
      secteur VARCHAR(50)
    );
  `);

  // Table des Échelles de Couleurs (Légendes)
  await client.query(`
    CREATE TABLE IF NOT EXISTS color_scales (
      id SERIAL PRIMARY KEY,
      theme VARCHAR(50),
      min_val DOUBLE PRECISION,
      max_val DOUBLE PRECISION,
      couleur VARCHAR(20),
      label VARCHAR(100)
    );
  `);

  // Table de Configuration (Header/Footer/KPIs)
  await client.query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key VARCHAR(50) PRIMARY KEY,
      data JSONB
    );
  `);

  console.log('Tables créées ou déjà existantes.');
}

async function uploadMetadata(client) {
  console.log('--- Importation des Métadonnées ---');

  // 1. PRODUCTS
  const prodPath = path.join(__dirname, '../data/products.json');
  if (fs.existsSync(prodPath)) {
    const products = JSON.parse(fs.readFileSync(prodPath, 'utf8'));
    console.log(`Importation de ${products.length} produits...`);

    for (const p of products) {
      await client.query(`
        INSERT INTO products (id, nom, unite, icone, couleur, secteur)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE 
        SET nom = EXCLUDED.nom, unite = EXCLUDED.unite, icone = EXCLUDED.icone, couleur = EXCLUDED.couleur, secteur = EXCLUDED.secteur;
      `, [p.id, p.nom, p.unite, p.icone, p.couleur, p.secteur]);
    }
  } else {
    console.warn("⚠️ products.json manquant !");
  }

  // 2. COLOR SCALES
  const scalePath = path.join(__dirname, '../data/color_scales.json');
  if (fs.existsSync(scalePath)) {
    const scales = JSON.parse(fs.readFileSync(scalePath, 'utf8'));
    console.log(`Importation de ${scales.length} échelles de couleur...`);

    // On vide la table pour éviter les doublons complexes, puis on réinsère
    await client.query('TRUNCATE TABLE color_scales RESTART IDENTITY');

    for (const s of scales) {
      await client.query(`
        INSERT INTO color_scales (theme, min_val, max_val, couleur, label)
        VALUES ($1, $2, $3, $4, $5);
      `, [s.theme, s.min_val, s.max_val, s.couleur, s.label]);
    }
  } else {
    console.warn("⚠️ color_scales.json manquant !");
  }

  // 3. APP SETTINGS
  const settingsPath = path.join(__dirname, '../data/app_settings.json');
  if (fs.existsSync(settingsPath)) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    console.log(`Importation de la configuration...`);

    for (const s of settings) {
      await client.query(`
        INSERT INTO app_settings (key, data)
        VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
      `, [s.key, s.data]);
    }
  } else {
    console.warn("⚠️ app_settings.json manquant !");
  }
}

async function uploadGeographicalData(client) {
  console.log('--- Importation des données Géo et Production ---');

  const prodPath = path.join(__dirname, '../data/production.json');
  const popPath = path.join(__dirname, '../data/population_dept.json');
  const regionsPath = path.join(__dirname, '../data/cameroun_regions.json');
  const deptsPath = path.join(__dirname, '../data/cameroun_departements.json');

  if (!fs.existsSync(regionsPath) || !fs.existsSync(deptsPath)) {
    console.error("❌ Fichiers GeoJSON manquants dans backend/data/");
    return;
  }

  const productionData = fs.existsSync(prodPath) ? JSON.parse(fs.readFileSync(prodPath, 'utf8')) : {};
  const populationData = fs.existsSync(popPath) ? JSON.parse(fs.readFileSync(popPath, 'utf8')) : {};

  // 1. REGIONS
  const regionsRaw = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));
  for (const feature of regionsRaw.features) {
    const p = feature.properties;
    const prodDetails = productionData[p.adm1_name1] || {};

    await client.query(`
      INSERT INTO regions (adm1_pcode, adm1_name, adm1_name1, adm0_name, area_sqkm, center_lat, center_lon, geometry, production_details)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (adm1_pcode) DO UPDATE SET production_details = EXCLUDED.production_details;
    `, [p.adm1_pcode, p.adm1_name, p.adm1_name1, p.adm0_name, p.area_sqkm, p.center_lat, p.center_lon, feature.geometry, prodDetails]);
  }

  // 2. DEPARTEMENTS
  const deptsRaw = JSON.parse(fs.readFileSync(deptsPath, 'utf8'));
  for (const feature of deptsRaw.features) {
    const p = feature.properties;
    const pop = populationData[p.adm2_name1] || populationData[p.adm2_name] || 0;

    await client.query(`
      INSERT INTO departements (adm2_pcode, adm2_name, adm2_name1, adm1_pcode, adm1_name1, population, area_sqkm, center_lat, center_lon, geometry)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (adm2_pcode) DO UPDATE SET population = EXCLUDED.population;
    `, [p.adm2_pcode, p.adm2_name, p.adm2_name1, p.adm1_pcode, p.adm1_name1, pop, p.area_sqkm, p.center_lat, p.center_lon, feature.geometry]);
  }
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await createTables(client);
    await uploadMetadata(client);
    await uploadGeographicalData(client);

    await client.query('COMMIT');
    console.log('✅ Base de données initialisée avec succès !');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur pendant l\'initialisation :', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();