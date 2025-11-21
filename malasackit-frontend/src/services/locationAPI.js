const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

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
  },

  // Fetch all vicariates
  async getVicariates() {
    try {
      const response = await fetch(`${API_BASE_URL}/vicariates`);
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error || 'Failed to fetch vicariates');
    } catch (error) {
      console.error('Error fetching vicariates:', error);
      throw error;
    }
  },

  // Fetch parishes by vicariate ID
  async getParishesByVicariate(vicariateId) {
    try {
      const response = await fetch(`${API_BASE_URL}/vicariates/${vicariateId}/parishes`);
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error || 'Failed to fetch parishes');
    } catch (error) {
      console.error('Error fetching parishes:', error);
      throw error;
    }
  },

  // Fetch all parishes
  async getAllParishes() {
    try {
      const response = await fetch(`${API_BASE_URL}/parishes`);
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error || 'Failed to fetch parishes');
    } catch (error) {
      console.error('Error fetching parishes:', error);
      throw error;
    }
  }
};