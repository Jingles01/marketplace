import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import authService from "../services/authService.js";

const ConversationList = () => {
    const [conversations, setConversations] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/messages/conversations`);
                const fetchedConversations = Array.isArray(response.data) ? response.data : [];

                const formattedConversations = fetchedConversations.map(conv => {
                    let listingData = null;
                    if (conv.listing && typeof conv.listing === 'object') {
                        listingData = conv.listing;
                    } else if (conv.listingId && typeof conv.listingId === 'object') {
                        listingData = conv.listingId;
                    }
                    return { ...conv, listing: listingData };
                });
                setConversations(formattedConversations);
            } catch (err) {
                setError('Failed to load conversations');
            }
        };

        fetchConversations();
    }, []);

    if (error) return <div>{error}</div>;

    if (conversations.length === 0) {
        return <div className="p-4 text-center text-gray-500">No conversations yet.</div>;
    }


    return (
        <div className="bg-white shadow sm:rounded-md overflow-hidden border border-gray-200">
            <ul className="divide-y divide-gray-200">
                {conversations.map((conversation) => {
                    const currentUserId = authService.getUserId();
                    const otherUser = conversation.participants?.find(
                        participant => participant?._id !== currentUserId
                    );

                    const lastMessageContent = conversation.lastMessage?.content || '...';
                    const displayMessage = lastMessageContent.length > 40
                        ? `${lastMessageContent.substring(0, 40)}...`
                        : lastMessageContent;

                    const listing = conversation.listing;

                    return (
                        <li key={conversation._id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                            <Link
                                to={`/messages/${conversation._id}`}
                                className="flex items-center justify-between px-4 py-3 sm:px-6 gap-4"
                            >
                                <div className="flex items-center gap-3 flex-shrink-0 w-1/3 sm:w-1/4">
                                    {listing?.images?.[0]?.url ? (
                                        <img
                                            src={listing.images[0].url}
                                            alt={listing.title || 'Listing'}
                                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded border border-gray-200 flex-shrink-0" // Responsive size
                                        />
                                    ) : null
                                    }
                                    {listing && (
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs sm:text-sm font-medium text-gray-800 truncate" title={listing.title}>
                                                {listing.title || 'Untitled Listing'}
                                            </p>
                                            {listing.price != null && (
                                                <p className="text-xs text-gray-600 font-semibold">
                                                    ${parseFloat(listing.price).toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-700 truncate">
                                        {otherUser?.username || 'Unknown User'}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate" title={lastMessageContent}>
                                        {displayMessage}
                                    </p>
                                    {conversation.updatedAt && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(conversation.updatedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </p>
                                    )}
                                </div>
                                {conversation.unreadCount > 0 && (
                                    <div className="ml-2 flex-shrink-0">
                                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
                                             {conversation.unreadCount}
                                         </span>
                                    </div>
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ConversationList;
