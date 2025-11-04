import * as locationServices from "../services/locationServices.js";

export async function getRegions(req, res) {
	try {
		const regions = await locationServices.getAllRegions();
		return res.status(200).json({ success: true, data: regions });
	} catch (err) {
		console.error("getRegions error:", err);
		return res.status(500).json({ success: false, error: "Server error" });
	}
}

export async function getProvincesByRegion(req, res) {
	try {
		const { region_id } = req.params;
		if (!region_id) return res.status(400).json({ success: false, error: "region_id required" });
		const provinces = await locationServices.getProvincesByRegion(region_id);
		return res.status(200).json({ success: true, data: provinces });
	} catch (err) {
		console.error("getProvincesByRegion error:", err);
		return res.status(500).json({ success: false, error: "Server error" });
	}
}

export async function getMunicipalitiesByProvince(req, res) {
  try {
    const { province_id } = req.params;
    if (!province_id) return res.status(400).json({ success: false, error: "province_id required" });
    const municipalities = await locationServices.getMunicipalitiesByProvince(province_id);
    return res.status(200).json({ success: true, data: municipalities });
  } catch (err) {
    console.error("getMunicipalitiesByProvince error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

export async function getBarangaysByMunicipality(req, res) {
  try {
    const { municipality_id } = req.params;
    if (!municipality_id) return res.status(400).json({ success: false, error: "municipality_id required" });
    const barangays = await locationServices.getBarangaysByMunicipality(municipality_id);
    return res.status(200).json({ success: true, data: barangays });
  } catch (err) {
    console.error("getBarangaysByMunicipality error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

export async function getVicariates(req, res) {
  try {
    const vicariates = await locationServices.getAllVicariates();
    return res.status(200).json({ success: true, data: vicariates });
  } catch (err) {
    console.error("getVicariates error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

export async function getParishesByVicariate(req, res) {
  try {
    const { vicariate_id } = req.params;
    if (!vicariate_id) return res.status(400).json({ success: false, error: "vicariate_id required" });
    const parishes = await locationServices.getParishesByVicariate(vicariate_id);
    return res.status(200).json({ success: true, data: parishes });
  } catch (err) {
    console.error("getParishesByVicariate error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

export async function getAllParishes(req, res) {
  try {
    const parishes = await locationServices.getAllParishes();
    return res.status(200).json({ success: true, data: parishes });
  } catch (err) {
    console.error("getAllParishes error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}