import { useState, useEffect } from 'react';
import {Link, useParams} from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import StarRating from '../components/StarRating';
import ListingCard from '../components/ListingCard';

const PublicProfilePage = () => {
    const { userId } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            setError('');
            try {
                const response = await axios.get(`${config.apiUrl}/users/profile/${userId}`);
                setProfileData(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load user profile. The user may not exist or there was a server error.');
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    if (isLoading) {
        return <div className="text-center py-10">Loading profile...</div>;
    }

    if (error) {
        return <div className="container mx-auto px-4 py-10 text-center text-red-600 bg-red-50 rounded-md shadow">Error: {error}</div>;
    }

    if (!profileData) {
        return <div className="text-center py-10">No profile data found.</div>;
    }

    const { user, listings, reviews, averageRating, totalReviews } = profileData;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.username}</h1>
                {user.location?.city && user.location?.state && (
                    <p className="text-gray-600 mb-1">
                        <svg className="inline-block h-4 w-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                        {user.location.city}, {user.location.state}
                    </p>
                )}
                <p className="text-sm text-gray-500 mb-3">
                    Member since: {new Date(user.createdAt).toLocaleDateString()}
                </p>
                {totalReviews > 0 && (
                    <div className="mb-4">
                        <StarRating rating={averageRating} totalReviews={totalReviews} />
                    </div>
                )}
            </div>
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Active Listings ({listings.length})</h2>
                {listings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {listings.map((listing) => (
                            <ListingCard key={listing._id}
                                         listing={listing}
                                         isLoggedIn={false}
                                         isFavorited={false}
                                         showFavoriteButton={false}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">This user has no active listings.</p>
                )}
            </div>
            <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Reviews Received ({totalReviews})</h2>
                {reviews.length > 0 ? (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-white p-4 rounded-md shadow border border-gray-100">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-semibold text-gray-800">
                                        {review.reviewer?.username || 'Anonymous'}
                                        <Link to={`/users/${review.reviewer._id}`} className="text-indigo-600 hover:text-indigo-800 hover:underline">
                                            {review.reviewer.username}
                                        </Link>
                                    </p>
                                    <StarRating rating={review.rating} />
                                </div>
                                {review.comment && <p className="text-gray-600 text-sm italic">&#34;{review.comment}&#34;</p>}
                                <p className="text-xs text-gray-400 mt-2 text-right">Reviewed on: {new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">This user has not received any reviews yet.</p>
                )}
            </div>
        </div>
    );
};

export default PublicProfilePage;