const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Create walk-in donation with auto-account
 */
export const createWalkInDonation = async (donationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/walkin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(donationData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create walk-in donation');
    }
    
    return data;
  } catch (error) {
    console.error('Walk-in creation error:', error);
    throw error;
  }
};

/**
 * Get walk-in donations list (for staff)
 */
export const getWalkInDonations = async (params = {}) => {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.search) searchParams.append('search', params.search);
    
    const response = await fetch(`${API_BASE_URL}/walkin/list?${searchParams}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch walk-in donations');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching walk-in donations:', error);
    throw error;
  }
};