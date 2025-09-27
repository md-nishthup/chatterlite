import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './SearchBar.css';

function SearchBar({ onSelectUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    const usersQuery = query(
      collection(db, 'users'),
      where('nickname', '>=', searchTerm),
      where('nickname', '<=', searchTerm + '\uf8ff')
    );

    const querySnapshot = await getDocs(usersQuery);
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSearchResults(results);
  };

  const handleUserClick = (user) => {
    if (onSelectUser) {
      onSelectUser(user);
    }
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          placeholder="Search by nickname..."
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>
      <ul className="search-results">
        {searchResults.map((user) => (
          <li
            key={user.id}
            onClick={() => handleUserClick(user)}
            className="search-result-item"
          >
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="result-avatar"
            />
            <span>{user.displayName || user.email}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchBar;
