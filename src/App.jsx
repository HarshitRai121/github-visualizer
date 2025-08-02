import { useState } from 'react';
import { parseGitHubUrl, getRepoTree, getFileContent, getCodeDescription } from './services/githubService';
import FileDiagram from './components/FileDiagram';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import './App.css';

const ANALYZABLE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.html', '.css', '.json', '.md', '.txt'];

function isAnalyzable(path) {
  const fileExtension = path.split('.').pop().toLowerCase();
  return ANALYZABLE_EXTENSIONS.includes(`.${fileExtension}`);
}

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [repoData, setRepoData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); 
  const [isDescriptionLoading, setIsDescriptionLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRepoData(null);
    setError(null);
    setSelectedFile(null);

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
      const fileData = tree.map(item => ({
        ...item,
        description: null,
        content: null,
      }));

      setRepoData(fileData);
      console.log('Fetched Repository Data:', fileData);

    } catch (err) {
      setError('Failed to fetch repository data. Please check the URL or try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRepoUrl('');
    setRepoData(null);
    setError(null);
    setSelectedFile(null);
  };
  
  const handleNodeClick = async (event, node) => {
    const clickedFile = repoData.find(file => file.path === node.id);

    if (clickedFile.type !== 'blob') {
      setSelectedFile(null);
      return;
    }

    setSelectedFile({ ...clickedFile, description: 'Loading...' });
    setIsDescriptionLoading(true);

    const { owner, repo } = parseGitHubUrl(repoUrl);

    try {
      const fileContent = await getFileContent(owner, repo, clickedFile.path);

      if (!isAnalyzable(clickedFile.path)) {
        setSelectedFile({
          ...clickedFile,
          description: 'This is a binary or non-code file (e.g., image, font, etc.).'
        });
      } else {
        const description = await getCodeDescription(fileContent);
        setSelectedFile({ ...clickedFile, description: description });
      }

    } catch (descErr) {
      console.error(`Error fetching description for file: ${clickedFile.path}`, descErr);
      setSelectedFile({
        ...clickedFile,
        description: `Could not generate description: ${descErr.message}.`
      });
    } finally {
      setIsDescriptionLoading(false);
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

      <main className="w-full max-w-6xl flex flex-col items-center">
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4 mb-8 w-full max-w-2xl">
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

        {!repoData && !loading && !error && (
          <div className="bg-gray-800 rounded-lg p-6 min-h-[600px] flex items-center justify-center w-full">
            <p className="text-gray-500">
              The diagram will be displayed here after you enter a URL.
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-gray-800 rounded-lg p-6 min-h-[600px] flex items-center justify-center w-full">
            <p className="text-blue-400 animate-pulse">Fetching repository tree...</p>
          </div>
        )}

        {error && (
          <>
            <div className="bg-red-900 rounded-lg p-6 min-h-[600px] flex items-center justify-center w-full">
              <p className="text-red-300 whitespace-pre-line text-center">{error}</p>
            </div>
            <div className="text-center mt-4">
              <button onClick={handleReset} className="text-blue-400 underline text-sm">
                Reset and try again
              </button>
            </div>
          </>
        )}

        {repoData && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <div className="bg-gray-800 rounded-lg p-4 col-span-2 min-h-[600px] flex items-center justify-center">
              <FileDiagram repoData={repoData} onNodeClick={handleNodeClick} />
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 min-h-[600px] flex flex-col justify-start col-span-1">
              <h2 className="text-xl font-bold mb-4">File Description</h2>
              {selectedFile ? (
                <>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">{selectedFile.path}</h3>
                  {isDescriptionLoading ? (
                    <p className="text-blue-400 animate-pulse">Generating description...</p>
                  ) : (
                    // Use ReactMarkdown to render the formatted text
                    <div className="prose prose-invert max-w-none text-gray-300">
                      <ReactMarkdown>
                        {selectedFile.description}
                      </ReactMarkdown>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-center mt-20">
                  Click on a file in the diagram to see its description.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;