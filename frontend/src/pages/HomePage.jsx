import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import SearchForm from "../components/SearchForm";
import config from "../config";
import authService from "../services/authService.js";
import favoriteService from "../services/favoriteService.js";
import ListingCard from "../components/ListingCard.jsx";

const HomePage = () => {
    const [listings, setListings] = useState([]);
    const [error, setError] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const [zipCode, setZipCode] = useState("");
    const [userZipCode, setUserZipCode] = useState("");
    const [geolocationStatus, setGeolocationStatus] = useState("idle");
    const [currentSearchQuery, setCurrentSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCondition, setSelectedCondition] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('createdAt_desc');
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [savedListings, setSavedListings] = useState([]);

    const categories = [
        "All", "Electronics", "Clothing", "Home & Garden", "Sports", "Toys",
        "Books", "Vehicles", "Furniture", "Other"
    ];

    const sortOptions = [
        { value: 'createdAt_desc', label: 'Newest First' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        ...(zipCode ? [{ value: 'distance_asc', label: 'Distance: Nearest First' }] : [])
    ];

    const conditions = [
        "", "New", "Like New", "Good", "Fair", "Poor"
    ];

    const getCurrentUrlParams = () => {
        const searchParams = new URLSearchParams(location.search);
        return {
            query: searchParams.get('query') || '',
            category: searchParams.get('category') || 'All',
            zip: searchParams.get('zipCode') || '',
            condition: searchParams.get('condition') || '',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            sortBy: searchParams.get('sortBy') || 'createdAt_desc'
        };
    };

    useEffect(() => {
        const paramsToUse = {
            query: currentSearchQuery,
            category: selectedCategory,
            zip: zipCode,
            condition: selectedCondition,
            minP: minPrice,
            maxP: maxPrice,
            sort: sortBy
        };
        fetchListings(paramsToUse);
        updateUrl(paramsToUse);
    }, [currentSearchQuery, selectedCategory, zipCode, selectedCondition, minPrice, maxPrice, sortBy]);

    useEffect(() => {
        const initialParams = getCurrentUrlParams();
        setCurrentSearchQuery(initialParams.query);
        setZipCode(initialParams.zip);
        setUserZipCode(initialParams.zip);
        setSelectedCategory(initialParams.category);
        setSelectedCondition(initialParams.condition);
        setMinPrice(initialParams.minPrice);
        setMaxPrice(initialParams.maxPrice);
        setSortBy(initialParams.sortBy);

        const token = authService.getCurrentUser();
        const loggedInStatus = !!token;
        setIsLoggedIn(loggedInStatus);

        if (loggedInStatus) {
            fetchFavoriteIds();
            fetchSavedListingsDetails();
        } else {
            setFavoriteIds(new Set());
            setSavedListings([]);
        }

        if (!initialParams.zip && loggedInStatus) {
            fetchUserLocation();
        }
    }, [location.search]);

    useEffect(() => {
        if (isLoggedIn) {
            fetchFavoriteIds();
            fetchSavedListingsDetails();
        } else {
            setFavoriteIds(new Set());
            setSavedListings([]);
        }
    }, [isLoggedIn]);


    const fetchUserLocation = () => {
        setGeolocationStatus("loading");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                handleGeolocationSuccess,
                handleGeolocationError
            );
        } else {
            setGeolocationStatus("error");
        }
    };

    const handleGeolocationSuccess = async (position) => {
        const { latitude, longitude } = position.coords;
        await getZipCodeFromCoordinates(latitude, longitude);
    };

    const handleGeolocationError = (error) => {
        setGeolocationStatus("denied");
    };

    const getZipCodeFromCoordinates = async (latitude, longitude) => {
        try {
            const response = await axios.get(`${config.apiUrl}/location/zip-from-coords`, {
                params: { latitude, longitude }
            });

            if (response.data.zipCode) {
                const fetchedZipCode = response.data.zipCode;
                setZipCode(fetchedZipCode);
                setUserZipCode(fetchedZipCode);
                setGeolocationStatus("success");
            } else {
                setGeolocationStatus("partial");
                setError(`We found: ${response.data.formattedAddress}. Enter Zip for precise results.`);
            }
        } catch (error) {
            setError("There was a problem getting your zip code. Please enter it manually.");
            setGeolocationStatus("error");
        }
    };

    const fetchListings = async (params = {}) => {
        const {
            query = '',
            category = 'All',
            zip = '',
            condition = '',
            minP = '',
            maxP = '',
            sort = 'createdAt_desc'
        } = params;

        try {
            const searchParams = new URLSearchParams();
            if (query) searchParams.set('query', query);
            if (category && category !== 'All') searchParams.set('category', category);
            if (zip) searchParams.set('zipCode', zip);
            if (condition) searchParams.set('condition', condition);
            if (minP) searchParams.set('minPrice', minP);
            if (maxP) searchParams.set('maxPrice', maxP);
            if (sort) searchParams.set('sortBy', sort);


            const endpoint = `${config.apiUrl}/listings/search?${searchParams.toString()}`;

            const response = await axios.get(endpoint);
            setListings(response.data);
            setError("");
        } catch (err) {
            setError("Oops! Couldn't load listings. Please try again later.");
            setListings([]);
        }
    };

    const handleSearch = (query) => {
        setCurrentSearchQuery(query);
    };

    const handleZipCodeSubmit = (e) => {
        e.preventDefault();
        setZipCode(userZipCode);
        setGeolocationStatus(userZipCode ? "success" : "idle");
    };

    const updateUrl = (params = {}) => {
        const {
            query = '',
            category = 'All',
            zip = '',
            condition = '',
            minP = '',
            maxP = '',
            sort = 'createdAt_desc'
        } = params;

        const searchParams = new URLSearchParams();
        if (query) searchParams.set('query', query);
        if (category && category !== 'All') searchParams.set('category', category);
        if (zip) searchParams.set('zipCode', zip);
        if (condition) searchParams.set('condition', condition);
        if (minP) searchParams.set('minPrice', minP);
        if (maxP) searchParams.set('maxPrice', maxP);
        if (sort) searchParams.set('sortBy', sort);
        navigate(`/?${searchParams.toString()}`, { replace: true });
    };
    const fetchSavedListingsDetails = async () => {
        if (!isLoggedIn) {
            setSavedListings([]);
            return;
        }
        try {
            const listingsData = await favoriteService.getFavorites();
            setSavedListings(Array.isArray(listingsData) ? listingsData : []);
        } catch (error) {
            setError("Could not load your saved items.");
            setSavedListings([]);
        }
    };

    const fetchFavoriteIds = async () => {
        if (!isLoggedIn) {
            setFavoriteIds(new Set());
            return;
        }
        try {
            const ids = await favoriteService.getFavoriteIds();
            setFavoriteIds(new Set(ids));
        } catch (error) {
            setFavoriteIds(new Set());

        }
    };

    const handleFavoriteToggle = async (listingId, isCurrentlyFavorite) => {
        if (!isLoggedIn) {
            navigate('/signin');
            return;
        }

        try {
            if (isCurrentlyFavorite) {
                await favoriteService.removeFavorite(listingId);
                setFavoriteIds(prevIds => {
                    const newIds = new Set(prevIds);
                    newIds.delete(listingId);
                    return newIds;
                });
                setSavedListings(prev => prev.filter(listing => listing._id !== listingId));
            } else {
                await favoriteService.addFavorite(listingId);
                setFavoriteIds(prevIds => {
                    const newIds = new Set(prevIds);
                    newIds.add(listingId);
                    return newIds;
                });
                fetchSavedListingsDetails();
            }
        } catch (err) {
            setError("Could not update favorite status. Please try again.");
        }
    };

    let zipCodeDisplayMessage = "";
    if (geolocationStatus === "success" && zipCode) {
        zipCodeDisplayMessage = `Showing listings near: ${zipCode}`;
    } else if (geolocationStatus === "denied" && zipCode) {
        zipCodeDisplayMessage = `Showing listings near: ${zipCode} (Location access denied)`;
    } else if (userZipCode && geolocationStatus !== "loading") {
        zipCodeDisplayMessage = `Showing listings near: ${userZipCode}`;
    }

    let placeholderZip = "Enter Zip Code";
    if (geolocationStatus === "loading") placeholderZip = "Detecting Location...";
    if (geolocationStatus === "success" && zipCode) placeholderZip = `Current: ${zipCode}`;
    if (geolocationStatus === "denied" || geolocationStatus === "error") placeholderZip = "Enter Zip Code to Search Nearby";

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-xl mx-auto mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SearchForm onSearch={handleSearch} initialQuery={currentSearchQuery} />
                <form onSubmit={handleZipCodeSubmit}>
                    <label htmlFor="zip-input" className="sr-only">Zip Code</label>
                    <input
                        id="zip-input"
                        type="text"
                        pattern="\d{5}"
                        title="Enter a 5-digit zip code"
                        placeholder={placeholderZip}
                        value={userZipCode}
                        onChange={(e) => setUserZipCode(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        disabled={geolocationStatus === "loading"}
                    />
                    <button type="submit" className="hidden">Update Location</button>
                    {zipCodeDisplayMessage && (
                        <p className="text-xs text-gray-500 mt-1">{zipCodeDisplayMessage}</p>
                    )}
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 border rounded-md bg-gray-50">
                <div>
                    <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                        id="category-filter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="condition-filter" className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <select
                        id="condition-filter"
                        value={selectedCondition}
                        onChange={(e) => setSelectedCondition(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                        {conditions.map(cond => <option key={cond} value={cond}>{cond || 'Any'}</option>)}
                    </select>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-2">
                    <div>
                        <label htmlFor="min-price" className="block text-sm font-medium text-gray-700 mb-1">Min Price ($)</label>
                        <input
                            type="number"
                            id="min-price"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            min="0" step="any"
                        />
                    </div>
                    <div>
                        <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-1">Max Price ($)</label>
                        <input
                            type="number"
                            id="max-price"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            min="0" step="any"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                        id="sort-by"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                        {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {isLoggedIn && savedListings.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Your Saved Items</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {savedListings.map((listing) => {
                            return (
                                <ListingCard key={`saved-${listing._id}`}
                            listing={listing}
                            isLoggedIn={isLoggedIn}
                            isFavorited={true}
                            onFavoriteToggle={handleFavoriteToggle}
                                />);
                        })}
                    </div>
                </div>
            )}

            <div>
                {listings.length === 0 && !error ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600 mb-3">No listings found matching your criteria.</p>
                    </div>
                ) : (
                    listings.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {listings.map((listing) => {
                                const displayDistanceText = listing.distance !== undefined && zipCode
                                ? `${(listing.distance / 1609.34).toFixed(1)} mi`
                                    : undefined;
                                    return (
                                    <ListingCard key={listing._id}
                                listing={listing}
                                isLoggedIn={isLoggedIn}
                                isFavorited={favoriteIds.has(listing._id)}
                                onFavoriteToggle={handleFavoriteToggle}
                                displayDistance={displayDistanceText}
                                    />
                                    );
                            })}
                        </div>
                    )
                )}
            </div>
        </div>
    );}

export default HomePage;