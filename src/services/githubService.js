import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com/repos';
const BACKEND_API_URL = 'http://localhost:3001'; // Your backend server URL

// Helper function to parse the GitHub URL
export const parseGitHubUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const [owner, repo] = urlObj.pathname.split('/').filter(Boolean);
    if (owner && repo) {
      return { owner, repo };
    }
  } catch (error) {
    console.error('Invalid GitHub URL:', error);
  }
  return null;
};

// Function to fetch the repository file tree
export const getRepoTree = async (owner, repo) => {
  try {
    const treeResponse = await axios.get(
      `${GITHUB_API_URL}/${owner}/${repo}/git/trees/main?recursive=1`
    );
    return treeResponse.data.tree;
  } catch (error) {
    console.error('Error fetching GitHub repository data:', error);
    throw error;
  }
};

// Function to fetch the raw content of a specific file
export const getFileContent = async (owner, repo, path) => {
  try {
    const response = await axios.get(
      `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching file content:', error);
    throw error;
  }
};

// Function to get a code description from your backend
export const getCodeDescription = async (code) => {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/analyze-code`, { code });
    return response.data.description;
  } catch (error) {
    console.error('Error getting code description from backend:', error);
    throw error;
  }
};