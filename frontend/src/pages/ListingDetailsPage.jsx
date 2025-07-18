import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../services/authService.js";
import config from "../config";
import Button from "../components/Button.jsx";

const ListingDetailsPage = () => {
    const [error, setError] = useState(null);
    const [listing, setListing] = useState(null);
    const { id } = useParams();
    const [isOwner, setIsOwner] = useState(false);
    const [message, setMessage] = useState("");
    const isLoggedIn = !!authService.getCurrentUser();
    const navigate = useNavigate();
    const [offerPrice, setOfferPrice] = useState("");
    const [showSoldConfirmation, setShowSoldConfirmation] = useState(false);
    const [selectedBuyerId, setSelectedBuyerId] = useState("");
    const [buyers, setBuyers] = useState([]);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const API_URL = config.apiUrl || 'http://localhost:3546/api';
                const response = await axios.get(`${API_URL}/listings/${id}`);
                setListing(response.data);

                const currentUser = await getCurrentUser();
                setIsOwner(currentUser === response.data?.createdBy?._id);
            } catch (err) {
                setError("Failed to load listings");
            }
        };
        fetchListing();
    }, [id]);

    const getCurrentUser = async () => {
        try {
            const token = authService.getCurrentUser();
            if (!token) {
                return null;
            }

            const API_URL = config.apiUrl || 'http://localhost:3546/api';
            const response = await axios.get(`${API_URL}/auth/current-user`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.userId;
        } catch (err) {
            return null;
        }
    };

    const handleContactSeller = async (e) => {
        e.preventDefault();

        if (!message.trim()) return;

        try {
            const response = await axios.post(`${config.apiUrl}/messages/from-listing`, {
                listingId: id,
                message: message
            });

            navigate(`/messages/${response.data.conversation}`);
        } catch (err) {
            alert("Failed to send message. Please try again.");
        }
    };

    const handleSendOffer = async (e) => {
        e.preventDefault();

        if (!offerPrice || parseFloat(offerPrice) <= 0) {
            alert("Please enter a valid offer price.");
            return;
        }

        try {
            const response = await axios.post(`${config.apiUrl}/messages/offer`, {
                listingId: id,
                offeredPrice: parseFloat(offerPrice),
                message: `I'd like to offer $${offerPrice} for this item.`
            });

            navigate(`/messages/${response.data.conversation}`);
        } catch (err) {
            alert("Failed to send offer. Please try again.");
        }
    };

    const handleMarkAsSold = async () => {
        setError(null);
        setShowSoldConfirmation(true);
        setSelectedBuyerId("");

        try {
            const API_URL = config.apiUrl || 'http://localhost:3546/api';
            const response = await axios.get(`${API_URL}/listings/${id}/potential-buyers`);

            if (Array.isArray(response.data)) {
                setBuyers(response.data);
            } else {
                setBuyers([]);
            }

        } catch (err) {
            setError("Could not load list of buyers. Please try again.");
            setBuyers([]);
        }
    };

    const confirmMarkAsSold = async () => {
        try {
            const API_URL = config.apiUrl || 'http://localhost:3546/api';
            await axios.put(`${API_URL}/listings/${id}/sold`, { buyerId: selectedBuyerId });
            setListing({ ...listing, sold: true, buyerId: selectedBuyerId });
            setShowSoldConfirmation(false);
        } catch (err) {
            setError("Failed to mark listing as sold");
        }
    };

    const inputClass = "block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";


    if (error)
        return <div className="max-w-4xl mx-auto p-6 mt-10 bg-red-100 text-red-700 rounded-md shadow-md">{error}</div>;
    if (!listing)
        return <div className="text-center py-10 text-gray-600">Loading...</div>;

    return (
        <div className="container mx-auto max-w-4xl p-4 md:p-6 bg-white rounded-lg shadow-md mt-6 mb-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{listing.title}</h1>
            <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
                {isOwner && !listing.sold && (
                    <div className="flex gap-2">
                        <Link to={`/listings/${id}/edit`}>
                            <Button variant="secondary" className="text-xs sm:text-sm">Edit Listing</Button>
                        </Link>
                        <Button variant="success" onClick={handleMarkAsSold} className="text-xs sm:text-sm">
                            Mark as Sold
                        </Button>
                    </div>
                )}
                {listing?.sold && (
                    <div className="bg-red-100 text-red-700 font-bold py-1 px-3 rounded-full text-sm">
                        Sold!
                        {listing.buyerId && listing.buyerId !== 'EXTERNAL' && <span className="ml-2 font-normal text-xs"> (Buyer ID: {listing.buyerId})</span>}
                        {listing.buyerId === 'EXTERNAL' && <span className="ml-2 font-normal text-xs"> (Sold externally)</span>}
                    </div>
                )}
                {!(isOwner && !listing?.sold) && !listing?.sold && <div />}
            </div>

            {error && !showSoldConfirmation && listing && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
            )}
            <div className="mb-6 border border-gray-200 rounded-md overflow-hidden bg-gray-100 flex justify-center items-center h-64 md:h-96">
                {listing.images?.length > 0 ? (
                    <img
                        src={listing.images[0]?.url}
                        alt={listing.title}
                        className="object-contain h-full w-auto"
                    />
                ) : (
                    <span className="text-gray-500">No Image Available</span>
                )}
            </div>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Description</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{listing.description || 'No description provided.'}</p>
            </div>

            <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-gray-200 py-1">
                        <strong className="text-gray-600">Price:</strong>
                        <span className="text-gray-800 font-semibold">${listing.price ? parseFloat(listing.price).toFixed(2) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 py-1">
                        <strong className="text-gray-600">Category:</strong>
                        <span className="text-gray-800">{listing.category || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 py-1">
                        <strong className="text-gray-600">Condition:</strong>
                        <span className="text-gray-800">{listing.condition || 'N/A'}</span>
                    </div>
                    {(listing.location?.city || listing.location?.state) && (
                        <div className="flex justify-between border-b border-gray-200 py-1">
                            <strong className="text-gray-600">Location:</strong>
                            <span className="text-gray-800">{`${listing.location.city || ''}${listing.location.city && listing.location.state ? ', ' : ''}${listing.location.state || ''}`}</span>
                        </div>
                    )}
                    {listing.createdBy?.username && (
                        <div className="flex justify-between border-b border-gray-200 py-1">
                            <strong className="text-gray-600">Listed by:</strong>
                            <Link to={`/users/${listing.createdBy._id}`} className="text-indigo-600 hover:text-indigo-800 hover:underline">
                                {listing.createdBy.username}
                            </Link>
                        </div>
                    )}
                </div>
            </div>



            {isLoggedIn && !isOwner && !listing.sold && (
                <div className="mt-8 p-4 border border-gray-200 rounded-md bg-gray-50">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Contact Seller or Make Offer</h3>

                    <form onSubmit={handleSendOffer} className="mb-6">
                        <label htmlFor="offerPrice" className={labelClass}>Send an Offer ($)</label>
                        <div className="flex items-center gap-2">
                            <input type="number" id="offerPrice" value={offerPrice}
                                onChange={(e) => setOfferPrice(e.target.value)}
                                placeholder="Your offer price"
                                min="1"
                                step="1"
                                className={`${inputClass} flex-grow`}
                                required
                            />
                            <Button type="submit" variant="success">
                                Send Offer
                            </Button>
                        </div>
                    </form>

                    <form onSubmit={handleContactSeller}>
                        <label htmlFor="message" className={labelClass}>Ask a Question</label>
                        <textarea
                            id="message"
                            rows="4"
                            className={`${inputClass} mb-2`}
                            placeholder="Ask the seller a question about this listing..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        ></textarea>
                        <Button type="submit" variant="success">
                            Send Message
                        </Button>
                    </form>
                </div>
            )}

            {showSoldConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Mark Listing as Sold</h3>
                        <div className="mb-4">
                            <label htmlFor="buyerSelect" className={labelClass}>Select Buyer:</label>
                            <select
                                id="buyerSelect"
                                value={selectedBuyerId}
                                onChange={(e) => {
                                    setSelectedBuyerId(e.target.value);
                                    setError(null);
                                }}
                                className={`${inputClass}`}
                                required
                            >
                                <option value="" disabled>-- Select Buyer --</option>
                                {buyers.map(user => (
                                    user?._id && (
                                        <option key={user._id} value={user._id}>
                                            {user.username || `User ID: ${user._id}`}
                                        </option>
                                    )
                                ))}
                            </select>
                            {buyers.length === 0 && (
                                <p className="text-xs text-gray-500 mt-1">No users have messaged you about this listing
                                    yet, or failed to load.</p>
                            )}
                        </div>


                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="secondary" onClick={() => { setShowSoldConfirmation(false); }}>
                                Cancel
                            </Button>
                            <Button variant="success" onClick={confirmMarkAsSold} disabled={!selectedBuyerId}>
                                Confirm Sale
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListingDetailsPage;