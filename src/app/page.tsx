'use client'; // This directive is necessary as we are using React hooks (useState, useEffect)

import { useState, useEffect } from 'react';
import type { NextPage } from 'next';

// Define a type for our records for better type-safety
interface WhatsAppRecord {
  id: number; // Use a unique ID for stable rendering
  original: string;
  link: string;
  timestamp: number;
}

const LOCAL_STORAGE_KEY = 'whatsAppLinkHistory';
const EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const HomePage: NextPage = () => {
  const [inputNumbers, setInputNumbers] = useState<string>('');
  const [records, setRecords] = useState<WhatsAppRecord[]>([]);

  // Effect to load and validate data from localStorage on initial component mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedRecords: WhatsAppRecord[] = JSON.parse(storedData);
        const currentTime = Date.now();

        // Filter out records older than 24 hours
        const validRecords = parsedRecords.filter(
          (record) => currentTime - record.timestamp < EXPIRATION_TIME_MS
        );
        
        setRecords(validRecords);
        // Update localStorage with only the valid records
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(validRecords));
      }
    } catch (error) {
      console.error("Failed to parse records from localStorage:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Main function to handle the conversion logic
  const handleConvert = () => {
    if (!inputNumbers.trim()) return; // Do nothing if input is empty

    const lines = inputNumbers.split('\n');
    const currentTime = Date.now();

    const newRecords = lines
      .map(line => line.trim())
      .filter(line => line.length > 0) // Ignore empty lines
      .map(originalNumber => {
        // Sanitize the number: remove non-digit characters, except a leading '+'
        const sanitizedNumber = originalNumber.replace(/[^\d+]/g, '');
        return {
          id: currentTime + Math.random(), // Simple unique ID
          original: originalNumber,
          link: `https://wa.me/${sanitizedNumber}`,
          timestamp: currentTime,
        };
      });

    // Combine new records with existing ones and update state
    const updatedRecords = [...newRecords, ...records];
    setRecords(updatedRecords);

    // Persist the updated records to localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedRecords));

    // Clear the input field for better user experience
    setInputNumbers('');
  };

  // Function to copy a link to the clipboard
  const handleCopy = (linkToCopy: string) => {
    navigator.clipboard.writeText(linkToCopy).then(() => {
      alert('Link copied to clipboard!'); // Simple feedback
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl text-center">
        {/* Header */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-2">
          WhatsApp Link Generator 📲
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Enter phone numbers (one per line) to create instant `wa.me` links.
        </p>
        
        {/* Input Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <textarea
            value={inputNumbers}
            onChange={(e) => setInputNumbers(e.target.value)}
            placeholder="e.g., +14155552671&#10;6281234567890&#10;089876543210"
            rows={5}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
          <button
            onClick={handleConvert}
            className="w-full mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-300"
          >
            Convert
          </button>
        </div>

        {/* Results Table */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
             <h2 className="text-xl font-semibold text-gray-700 dark:text-white">Generated Links</h2>
             <p className="text-sm text-gray-500 dark:text-gray-400">History is saved for 24 hours.</p>
          </div>
          {records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Original Input</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Generated Link</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-4 text-gray-800 dark:text-gray-200">{record.original}</td>
                      <td className="p-4">
                        <a 
                          href={record.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline break-all"
                        >
                          {record.link}
                        </a>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleCopy(record.link)}
                          className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full hover:bg-green-600 transition-colors"
                        >
                          Copy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-8 text-center text-gray-500 dark:text-gray-400">
              No links have been generated yet. Your results will appear here.
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default HomePage;