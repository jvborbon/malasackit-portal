import { query } from "../db.js";

export async function getAllRegions() {
	const sql = `SELECT region_id, region_name FROM table_region ORDER BY region_name`;
	const { rows } = await query(sql);
	return rows;
}

export async function getProvincesByRegion(region_id) {
	const sql = `SELECT province_id, province_name, region_id FROM table_province WHERE region_id = $1 ORDER BY province_name`;
	const { rows } = await query(sql, [region_id]);
	return rows;
}

export async function getMunicipalitiesByProvince(province_id) {
  const sql = `SELECT municipality_id, municipality_name, province_id FROM table_municipality WHERE province_id = $1 ORDER BY municipality_name`;
  const { rows } = await query(sql, [province_id]);
  return rows;
}

export async function getBarangaysByMunicipality(municipality_id) {
  const sql = `SELECT barangay_id, barangay_name, municipality_id FROM table_barangay WHERE municipality_id = $1 ORDER BY barangay_name`;
  const { rows } = await query(sql, [municipality_id]);
  return rows;
}