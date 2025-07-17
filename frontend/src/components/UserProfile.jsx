import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import authService from "../services/authService.js";
import Button from "../components/Button";
import StarRating from "./StarRating.jsx";
import {Link} from "react-router-dom";

// eslint-disable-next-line react/prop-types
const ReviewForm = ({ revieweeId, listingId, onReviewSubmit, onCancel  }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const labelStyles = "block text-sm font-medium text-gray-700";
    const textareaStyles = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";


const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!revieweeId || !listingId) {
            setError('Missing required information (reviewee or listing).');
            setIsSubmitting(false);
            }


            try {
            const response = await axios.post(`${config.apiUrl}/reviews`, {
                revieweeId: revieweeId,
                listingId: listingId,
                rating: rating,
                comment: comment
            });

            onReviewSubmit(response.data);

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div>
                <label className={`${labelStyles} mb-1`}>Rating*</label>
                <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`h-7 w-7 ${star <= rating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 rounded-full`}
                            aria-label={`Rate ${star} stars`}
                        >
                            <svg fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                        </button>
                    ))}
                    <span className="ml-3 text-sm text-gray-600">{rating} Star{rating !== 1 ? 's' : ''}</span>
                </div>
            </div>
            <div>
                <label htmlFor="review-comment" className={labelStyles}>Comment (Optional)</label>
                <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className={textareaStyles}
                    rows="4"
                    placeholder="Tell us about your experience (max 75 characters)"
                    maxLength={75}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1 text-right">{75 - comment.length} characters remaining</p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
            </div>
        </form>
    );
};

const UserProfilePage = () => {
    const [profile, setProfile] = useState({
        username: '',
        firstName: '',
        lastName: '',
        location: {
            zipCode: '',
            city: '',
            state: ''
        }
    });

    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('Profile');
    const [purchases, setPurchases] = useState([]);
    const [soldItems, setSoldItems] = useState([]);
    const [reviewingTransaction, setReviewingTransaction] = useState(null);


    useEffect(() => {
        fetchUserProfile();
        fetchUserReviews();
    }, []);

    useEffect(() => {
        if (activeTab === 'Purchases' && purchases.length === 0) {
            fetchPurchases();
        } else if (activeTab === 'Sold' && soldItems.length === 0) {
            fetchSoldItems();
        }
        setError('');
        setSuccess('');
    }, [activeTab]);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/users/profile`);
            setProfile(response.data);
        } catch (err) {
            setError('Failed to fetch profile. Please try again.');
            console.error('Profile fetch error:', err);
        }
    };

    const fetchUserReviews = async () => {
        try {
            const userId = authService.getUserId();
            console.log("Fetching reviews for user ID:", userId);
            const response = await axios.get(`${config.apiUrl}/reviews/user/${userId}`);
            setReviews(response.data.reviews);
            setAverageRating(response.data.averageRating);
        } catch (err) {
            console.error('Reviews fetch error:', err);
        }
    };

    const fetchPurchases = async () => {
        setError('');
        try{
            const response = await axios.get(`${config.apiUrl}/users/purchases`);
            setPurchases(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Purchases fetch error:', err);
            setError('Failed to fetch purchases.');
        }
    };

    const fetchSoldItems = async () => {
        setError('');
        try{
            const response = await axios.get(`${config.apiUrl}/users/sold-items`);
            setSoldItems(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Sold items fetch error:', err);
            setError('Failed to fetch sold items.');
        }
    }

    const handleReviewSubmit = () => {
        fetchUserReviews();
        setReviewingTransaction(null);
        setSuccess('Review submitted successfully!');
    };

    const handleCloseReviewModal = () => {
        setReviewingTransaction(null);
        setError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('location.')) {
            const locationKey = name.split('.')[1];
            setProfile(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    [locationKey]: value
                }
            }));
        } else {
            setProfile(prev => ({...prev, [name]: value}));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const payload = {
                username: profile.username,
                firstName: profile.firstName,
                lastName: profile.lastName,
                location: {
                    zipCode: profile.location.zipCode
                }
            };

            const updatedProfile = await authService.updateProfile(payload);
            setProfile(updatedProfile);
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to update profile';
            setError(errorMsg);
            console.error('Profile update error:', err);
        }
    };

    const getTabClassName = (tabName) => {
        return `${
            activeTab === tabName
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`;
    };

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">User Profile</h1>

            {error && !reviewingTransaction && (
                <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-4">
                    {success}
                </div>
            )}

            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 md:space-x-8 overflow-x-auto" aria-label="Tabs">
                    <button onClick={() => setActiveTab('Profile')} className={getTabClassName('Profile')}>Profile
                    </button>
                    <button onClick={() => setActiveTab('Purchases')} className={getTabClassName('Purchases')}>Purchases
                        ({purchases.length})
                    </button>
                    <button onClick={() => setActiveTab('Sold')} className={getTabClassName('Sold')}>Sold Items
                        ({soldItems.length})
                    </button>
                    <button onClick={() => setActiveTab('Reviews')} className={getTabClassName('Reviews')}>Reviews
                        Received ({reviews.length})
                    </button>
                </nav>
            </div>

            <div>
                {activeTab === 'Profile' && (
                    <div>
                        {!isEditing ? (
                            <div>
                                <div className="mb-4">
                                    <strong className="block font-medium text-gray-700 mb-1">Username:</strong>
                                    <span className="text-gray-900">{profile.username}</span>
                                </div>
                                {profile.firstName && (
                                    <div className="mb-4">
                                        <strong className="block font-medium text-gray-700 mb-1">First Name:</strong>
                                        <span className="text-gray-900">{profile.firstName}</span>
                                    </div>
                                )}
                                {profile.lastName && (
                                    <div className="mb-4">
                                        <strong className="block font-medium text-gray-700 mb-1">Last Name:</strong>
                                        <span className="text-gray-900">{profile.lastName}</span>
                                    </div>
                                )}
                                {profile.location && (profile.location.city || profile.location.state) && (
                                    <div className="mb-4">
                                        <strong className="block font-medium text-gray-700 mb-1">Location:</strong>
                                        <span className="text-gray-900">
                                        {profile.location.city}, {profile.location.state} {profile.location.zipCode && `(${profile.location.zipCode})`}
                                    </span>
                                    </div>
                                )}
                                <Button variant="primary" onClick={() => setIsEditing(true)}>
                                    Edit Profile
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={profile.username}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                        minLength={4}
                                        maxLength={20}
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={profile.firstName || ''}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        maxLength={50}
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={profile.lastName || ''}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        maxLength={50}
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">Zip Code</label>
                                    <input
                                        type="text"
                                        name="location.zipCode"
                                        value={profile.location?.zipCode || ''}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        pattern="\d{5}"
                                        title="Please enter a 5-digit zip code"
                                    />
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <Button type="submit" variant="primary">
                                        Save Profile
                                    </Button>
                                    <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {activeTab === 'Purchases' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Purchases</h2>
                        {purchases.length === 0 && <p className="text-gray-500">No Purchases</p>}
                        {purchases.length > 0 && (
                            <ul className="space-y-4">
                                {purchases.map(item => (
                                    <li key={item._id}
                                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition duration-150">
                                        <div className="flex items-center gap-4 flex-grow min-w-0">
                                            <img
                                                src={item.images?.[0]?.url}
                                                alt={item.title}
                                                className="w-16 h-16 object-cover rounded border border-gray-200 flex-shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate"
                                                   title={item.title}>
                                                    {item.title || 'Untitled Listing'}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Sold by: <span
                                                    className="font-medium">{item.createdBy?.username || 'Unknown Seller'}</span>
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Price: <span
                                                    className="font-semibold">${item.price ? parseFloat(item.price).toFixed(2) : 'N/A'}</span>
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Purchased: {new Date(item.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 sm:mt-0 flex-shrink-0">
                                            <button
                                                onClick={() => setReviewingTransaction({
                                                    type: 'seller',
                                                    revieweeId: item.createdBy?._id,
                                                    listingId: item._id,
                                                    itemName: item.title
                                                })}
                                                disabled={!item.createdBy?._id}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <svg className="-ml-0.5 mr-1.5 h-4 w-4"
                                                     xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                     fill="currentColor">
                                                    <path
                                                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                                </svg>
                                                Review Seller
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {activeTab === 'Sold' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Items You Sold</h2>
                        {soldItems.length === 0 && <p className="text-gray-500">You haven&#39;t sold any items yet.</p>}
                        {soldItems.length > 0 && (
                            <ul className="space-y-4">
                                {soldItems.map(item => (
                                    <li key={item._id}
                                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition duration-150">
                                        <div className="flex items-center gap-4 flex-grow min-w-0">
                                            <img
                                                src={item.images?.[0]?.url || '/placeholder.png'}
                                                alt={item.title || 'Listing Item'}
                                                className="w-16 h-16 object-cover rounded border border-gray-200 flex-shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate"
                                                   title={item.title}>
                                                    {item.title || 'Untitled Listing'}
                                                </p>
                                                {item.soldExternally ? (
                                                    <p className="text-xs text-gray-600 mt-1 italic">Sold externally</p>
                                                ) : (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Sold to: <span
                                                        className="font-medium">{item.buyerId?.username || 'Unknown Buyer'}</span>
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    Price: <span
                                                    className="font-semibold">${item.price ? parseFloat(item.price).toFixed(2) : 'N/A'}</span>
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Sold: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 sm:mt-0 flex-shrink-0">
                                            {!item.soldExternally && item.buyerId?._id && (
                                                <button
                                                    onClick={() => setReviewingTransaction({
                                                        type: 'buyer',
                                                        revieweeId: item.buyerId?._id,
                                                        listingId: item._id,
                                                        itemName: item.title
                                                    })}
                                                    disabled={!item.buyerId?._id}
                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <svg className="-ml-0.5 mr-1.5 h-4 w-4"
                                                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                         fill="currentColor">
                                                        <path
                                                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                                    </svg>
                                                    Review Buyer
                                                </button>
                                            )}
                                            {item.soldExternally && <span className="text-xs italic text-gray-400">(No review possible)</span>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {activeTab === 'Reviews' && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews Received</h2>
                        <div className="flex items-center mb-4">
                            <StarRating rating={averageRating} totalReviews={reviews.length} />
                        </div>

                        <h3 className="text-lg font-medium text-gray-800 mb-3 mt-6">Reviews About You:</h3>
                        {reviews.length === 0 && <p className="text-gray-500">No reviews received yet.</p>}
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-gray-50 rounded-md border border-gray-200 p-4 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="font-semibold text-gray-800">
                                        <Link to={`/users/${review.reviewer._id}`} className="text-indigo-600 hover:text-indigo-800 hover:underline">
                                            {review.reviewer.username}
                                        </Link>                                    </div>
                                    <StarRating rating={review.rating} />
                                </div>
                                {review.comment ? (
                                    <p className="text-gray-700 italic">&#34;{review.comment}&#34;</p>
                                ) : (
                                    <p className="text-gray-500 italic">No comment left.</p>
                                )}
                                <div className="text-xs text-gray-400 mt-2 text-right">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {reviewingTransaction && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out animate-fade-in">
                    <div
                        className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full scale-100 transition-transform duration-300 ease-in-out animate-scale-up">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-lg font-medium text-gray-800">
                                Review {reviewingTransaction.type === 'seller' ? 'Seller' : 'Buyer'} for
                                &#34;{reviewingTransaction.itemName || 'Item'}&#34;
                            </h3>
                            <button onClick={handleCloseReviewModal}
                                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1">&times;</button>
                        </div>
                        <ReviewForm
                            revieweeId={reviewingTransaction.revieweeId}
                            listingId={reviewingTransaction.listingId}
                            onReviewSubmit={handleReviewSubmit}
                            onCancel={handleCloseReviewModal}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

    export default UserProfilePage;