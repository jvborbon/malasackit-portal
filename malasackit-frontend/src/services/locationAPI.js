const API_BASE_URL = 'http://localhost:3000/api';

export const locationAPI = {
  // Fetch all regions
  async getRegions() {
    try {
      const response = await fetch(`${API_BASE_URL}/regions`);
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error || 'Failed to fetch regions');
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }
  },

  // Fetch provinces by region ID
  async getProvincesByRegion(regionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/regions/${regionId}/provinces`);
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error || 'Failed to fetch provinces');
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  },

  // Fetch municipalities by province ID
  async getMunicipalitiesByProvince(provinceId) {
    try {
      const response = await fetch(`${API_BASE_URL}/provinces/${provinceId}/municipalities`);
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error || 'Failed to fetch municipalities');
    } catch (error) {
      console.error('Error fetching municipalities:', error);
      throw error;
    }
  },

  // Fetch barangays by municipality ID
  async getBarangaysByMunicipality(municipalityId) {
    try {
      const response = await fetch(`${API_BASE_URL}/municipalities/${municipalityId}/barangays`);
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error || 'Failed to fetch barangays');
    } catch (error) {
      console.error('Error fetching barangays:', error);
      throw error;
    }
  }
};