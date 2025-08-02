import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com/repos';

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
    // Step 1: Get the SHA of the latest commit on the default branch (e.g., 'main')
    // Using `branches/main` is a good starting point, but a more robust solution
    // would check for `master` if `main` fails. We'll stick to `main` for now.
    const branchResponse = await axios.get(
      `${GITHUB_API_URL}/${owner}/${repo}/branches/main`
    );
    const latestCommitSha = branchResponse.data.commit.sha;

    if (!latestCommitSha) {
      throw new Error('Could not find latest commit SHA for the main branch.');
    }

    // Step 2: Get the file tree using the latest commit SHA
    const treeResponse = await axios.get(
      `${GITHUB_API_URL}/${owner}/${repo}/git/trees/${latestCommitSha}?recursive=1`
    );

    if (treeResponse.data.truncated) {
      console.warn('The repository is very large. The file tree has been truncated.');
      // For a very large repo, this is where we'd add logic to handle
      // sub-trees, but for now, we'll work with the truncated data.
    }

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
      `https://raw.githubusercontent.com/${owner}/${repo}/${latestCommitSha}/${path}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching file content:', error);
    throw error;
  }
};