import { useState } from 'react';
import './App.css';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!repoUrl) {
      alert('Please enter a GitHub URL');
      return;
    }

    console.log('Generating diagram for:', repoUrl);
    // We'll add the logic for fetching data here later
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

        {/* Diagram will go here */}
        <div className="bg-gray-800 rounded-lg p-6 min-h-[500px] flex items-center justify-center">
          <p className="text-gray-500">
            The diagram will be displayed here after you enter a URL.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;