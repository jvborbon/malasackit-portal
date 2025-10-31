﻿import express from "express";
import * as locationControllers from "../controllers/locationControllers.js";

const router = express.Router();

// GET /api/regions
router.get("/regions", locationControllers.getRegions);

// GET /api/regions/:region_id/provinces
router.get(
	"/regions/:region_id/provinces",
	locationControllers.getProvincesByRegion
);

// GET /api/provinces/:province_id/municipalities
router.get(
  "/provinces/:province_id/municipalities",
  locationControllers.getMunicipalitiesByProvince
);

// GET /api/municipalities/:municipality_id/barangays
router.get(
  "/municipalities/:municipality_id/barangays",
  locationControllers.getBarangaysByMunicipality
);

export default router;