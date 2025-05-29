import axios from 'axios';

// Use CORS proxy
const API_URL = 'https://cors-anywhere.herokuapp.com/http://164.68.99.129/api/v3/users?pageSize=50';

// Basic Auth credentials
const API_KEY = 'apikey';
const PASSWORD = '0b78127b3361cb3c7186fdc1b23bc152f905108d70a6c3e65761a86117557a5a';

// Base64 encode "username:password"
const authHeader = 'Basic ' + btoa(`${API_KEY}:${PASSWORD}`);

export const getUsersList = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: authHeader,
      },
    });

    // Extract names from the response
    const users = response.data?._embedded?.elements || [];
    const userNames = users.map(user => user.name);

    console.log('✅ User names:', userNames);
    return userNames; 

  } catch (error) {
    console.error('❌ Error fetching users:', error.message || error);
    throw error;
  }
}; 


export const getUsersTask = async (userId) => {
    const url = `http://164.68.99.129/api/v3/work_packages?filters=[{"assignee":{"operator":"=","values":["${userId}"]}}]`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: authHeader,
      },
    });

    // Extract names from the response
    const data = await response.json();
    return data._embedded?.elements || [];
  } catch (error) {
    console.error('❌ Error fetching users:', error.message || error);
    throw error;
  }
};
