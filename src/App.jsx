import { useState } from 'react';
import { parseGitHubUrl, getRepoTree } from './services/githubService';
import './App.css';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [repoData, setRepoData] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRepoData(null);
    setError(null);

    const { owner, repo } = parseGitHubUrl(repoUrl);

    if (!owner || !repo) {
      setError(
        `Invalid GitHub URL. Make sure it follows the format:\nhttps://github.com/owner/repo`
      );
      setLoading(false);
      return;
    }

    try {
      const tree = await getRepoTree(owner, repo);
      setRepoData(tree);
      console.log('Fetched Repository Tree:', tree);
    } catch (err) {
      setError('Failed to fetch repository data. Please check the URL or try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">GitHub Visualizer</h1>
        <p className="text-gray-400">
          Enter a public GitHub repository URL to generate a diagrammatic flow.
        </p>
      </header>

      <main className="w-full max-w-2xl">
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., https://github.com/facebook/react"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Diagram'}
          </button>
        </form>

        {/* Conditional content section */}
        {!repoData && !loading && !error && (
          <div className="bg-gray-800 rounded-lg p-6 min-h-[500px] flex items-center justify-center">
            <p className="text-gray-500">
              The diagram will be displayed here after you enter a URL.
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-gray-800 rounded-lg p-6 min-h-[500px] flex items-center justify-center">
            <p className="text-blue-400 animate-pulse">Fetching repository data...</p>
          </div>
        )}

        {error && (
          <>
            <div className="bg-red-900 rounded-lg p-6 min-h-[500px] flex items-center justify-center">
              <p className="text-red-300 whitespace-pre-line text-center">{error}</p>
            </div>
            <div className="text-center mt-4">
              <button
                onClick={() => {
                  setRepoUrl('');
                  setError(null);
                }}
                className="text-blue-400 underline text-sm"
              >
                Reset and try again
              </button>
            </div>
          </>
        )}

        {repoData && !loading && (
          <div className="bg-gray-800 rounded-lg p-6 min-h-[500px] flex items-center justify-center">
            <p className="text-gray-400 text-center">
              Data fetched successfully! Check the browser console to see the tree.
              <br />
              Next step: visualize this using a diagramming library.
            </p>
            {/* Placeholder for future diagram component */}
            {/* <DiagramComponent treeData={repoData} /> */}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
