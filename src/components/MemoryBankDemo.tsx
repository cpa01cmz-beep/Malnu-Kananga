import React, { useState } from 'react';
import { useMemoryBank } from '../hooks/useMemoryBank';

/**
 * Demo component showing how to use the Memory Bank
 * This component demonstrates basic memory bank operations
 */
export function MemoryBankDemo() {
  const {
    memories,
    isLoading,
    addMemory,
    searchMemories,
    deleteMemory,
    clearAllMemories,
    getStats
  } = useMemoryBank();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const handleAddMemory = async () => {
    const content = `Demo memory created at ${new Date().toLocaleString()}`;
    await addMemory(content, 'fact', {
      category: 'demo',
      source: 'MemoryBankDemo'
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const results = await searchMemories({
      keywords: [searchQuery],
      limit: 10
    });
    setSearchResults(results);
  };

  const handleGetStats = async () => {
    const memoryStats = await getStats();
    setStats(memoryStats);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Memory Bank Demo</h2>

      {/* Control Panel */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Controls</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleAddMemory}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Demo Memory
          </button>
          <button
            onClick={handleGetStats}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Get Stats
          </button>
          <button
            onClick={clearAllMemories}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Search
          </button>
        </div>
      </div>

      {/* Stats Display */}
      {stats && (
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Memory Bank Stats</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-purple-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Search Results ({searchResults.length})</h3>
          <div className="space-y-2">
            {searchResults.map((memory) => (
              <div key={memory.id} className="bg-white p-3 rounded border">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {memory.timestamp.toLocaleString()} - {memory.type}
                    </p>
                    <p className="mt-1">{memory.content}</p>
                    {memory.metadata && (
                      <p className="text-xs text-gray-500 mt-1">
                        {JSON.stringify(memory.metadata)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteMemory(memory.id)}
                    className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Memories */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          Recent Memories ({memories.length})
        </h3>
        {isLoading ? (
          <p>Loading...</p>
        ) : memories.length === 0 ? (
          <p className="text-gray-500">No memories yet. Click "Add Demo Memory" to create one.</p>
        ) : (
          <div className="space-y-2">
            {memories.slice(0, 10).map((memory) => (
              <div key={memory.id} className="bg-white p-3 rounded border">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {memory.timestamp.toLocaleString()} - {memory.type} (Importance: {memory.importance})
                    </p>
                    <p className="mt-1">{memory.content}</p>
                    {memory.metadata && (
                      <p className="text-xs text-gray-500 mt-1">
                        {JSON.stringify(memory.metadata)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteMemory(memory.id)}
                    className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}