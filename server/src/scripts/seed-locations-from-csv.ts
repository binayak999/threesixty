/**
 * Seed Country and Location from country.csv and province.csv.
 * - Country: one document per country (no duplicates).
 * - Location: one per province/region, linked via countryRef to Country.
 * Usage: npx ts-node src/scripts/seed-locations-from-csv.ts
 * Run from server directory: npm run seed:locations
 */
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import mongoose from 'mongoose';
import Country from '../models/Country';
import Location from '../models/Location';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/threesixtynepal';

const SERVER_ROOT = path.resolve(__dirname, '../..');
const COUNTRY_CSV = path.join(SERVER_ROOT, 'country.csv');
const PROVINCE_CSV = path.join(SERVER_ROOT, 'province.csv');

function slugify(text: string): string {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(filePath: string): { headers: string[]; rows: string[][] } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) throw new Error(`Empty file: ${filePath}`);
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((l) => parseCSVLine(l));
  return { headers, rows };
}

function rowToObject(headers: string[], row: string[]): Record<string, string> {
  const obj: Record<string, string> = {};
  headers.forEach((h, i) => {
    obj[h] = row[i] ?? '';
  });
  return obj;
}

async function seedLocationsFromCSV(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    // --- 1. Seed Countries (unique, no duplicate country data) ---
    const { headers: countryHeaders, rows: countryRows } = parseCSV(COUNTRY_CSV);
    const countryIdByCode = new Map<string, mongoose.Types.ObjectId>();

    for (const row of countryRows) {
      const r = rowToObject(countryHeaders, row);
      const code = r['Cny_Id']?.trim();
      const name = r['Cny_Name']?.trim();
      const enabled = r['EnabledTF']?.trim() !== '0';
      const iso2 = r['ISO_2']?.trim() || undefined;
      const iso3 = r['ISO_3']?.trim() || undefined;
      if (!code || !name) continue;

      const nameSlug = slugify(name) || code.toLowerCase();
      const slug = `${nameSlug}-${code.toLowerCase()}`.replace(/-+/g, '-');
      const country = await Country.findOneAndUpdate(
        { code },
        {
          $setOnInsert: {
            code,
            name,
            slug,
            iso2: iso2 && iso2 !== 'NULL' ? iso2 : undefined,
            iso3: iso3 && iso3 !== 'NULL' ? iso3 : undefined,
            isActive: enabled,
          },
        },
        { upsert: true, new: true }
      );
      countryIdByCode.set(code, country._id);
    }
    console.log(`Countries: ${countryIdByCode.size} upserted`);

    // --- 2. Seed Locations (provinces only; each linked to Country via countryRef) ---
    const { headers: provinceHeaders, rows: provinceRows } = parseCSV(PROVINCE_CSV);
    let provinceCount = 0;

    for (const row of provinceRows) {
      const r = rowToObject(provinceHeaders, row);
      const cnyId = r['Cny_Id']?.trim();
      const provinceName = r['Province_Name']?.trim();
      const provinceId = r['Province_Id']?.trim();
      const enabled = r['EnabledTF']?.trim() !== '0';
      if (!cnyId || !provinceName) continue;

      const countryId = countryIdByCode.get(cnyId);
      if (!countryId) continue;

      const provinceSlug = slugify(provinceName);
      const slug = `${slugify(cnyId)}-${provinceSlug}-${provinceId || provinceCount}`.replace(/-+/g, '-');

      await Location.findOneAndUpdate(
        { slug },
        {
          $setOnInsert: {
            name: provinceName,
            slug,
            isActive: enabled,
          },
          $set: {
            countryRef: countryId,
            region: provinceName,
          },
        },
        { upsert: true }
      );
      provinceCount++;
    }
    console.log(`Locations (provinces): ${provinceCount} upserted`);

    console.log('Seed from CSV done.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

seedLocationsFromCSV();
