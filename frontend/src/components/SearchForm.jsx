import { useState, useEffect } from 'react';
import Button from "../components/Button";

// eslint-disable-next-line react/prop-types
const SearchForm = ({ onSearch, initialQuery = '' }) => {
    const [searchTerm, setSearchTerm] = useState(initialQuery);

    useEffect(() => {
        setSearchTerm(initialQuery);
    }, [initialQuery]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm.trim());
    };

    const inputStyles = "block w-full px-3 py-2 bg-white border border-gray-300 rounded-l-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex items-center">
                <label htmlFor="search-listings" className="sr-only">Search listings</label>
                <input
                    id="search-listings"
                    type="text"
                    placeholder="Search listings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputStyles}
                />
                <Button type="submit" variant="primary" className="rounded-l-none px-4">
                    Search
                </Button>
            </div>
        </form>
    );
};

export default SearchForm;