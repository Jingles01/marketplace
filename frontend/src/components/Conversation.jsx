import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';
import config from '../config';
import Button from "./Button.jsx";

const Conversation = () => {
    const { conversationId } = useParams();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [recipient, setRecipient] = useState(null);
    const messagesEndRef = useRef(null);
    const currentUserId = authService.getUserId();
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [counterPrice, setCounterPrice] = useState('');
    const [listingDetails, setListingDetails] = useState(null);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/messages/conversations/${conversationId}`);

            const fetchedMessages = Array.isArray(response.data?.messages) ? response.data.messages: [];

            setMessages(fetchedMessages);


            if (!recipient && response.data?.participants) {
                const otherUser = response.data.participants.find(p => p._id !== currentUserId);
                setRecipient(otherUser);
            }

            if (!listingDetails) {
                if (response.data?.listing) {
                    setListingDetails(response.data.listing);
                } else if (response.data?.listingId) {
                    try {
                        const listingResponse = await axios.get(`${config.apiUrl}/listings/${response.data.listingId}`);
                        setListingDetails(listingResponse.data);
                    } catch (listingErr) {
                        setListingDetails(null);
                    }
                }
            }
        } catch (err) {
            setError('Failed to load conversation. Please try again later.');
        }
    };


    useEffect(() => {
        fetchMessages();
        const handleFocus = () => {
            fetchMessages();
        };
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [conversationId, currentUserId]);


    useEffect(() => {
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timer);
    }, [messages]);


    const handleSendMessage = async (e) => {
        e.preventDefault();
        const messageToSend = message;
        if (!messageToSend.trim() || !conversationId) return;
        setError('');

        const optimisticMessage = {
            _id: `conversation-${conversationId}`,
            content: messageToSend,
            sender: { _id: currentUserId },
            createdAt: new Date().toISOString()
        };

        setMessages(prevMessages =>[...prevMessages, optimisticMessage]);
        setMessage('');

        try {
            const response = await axios.post(`${config.apiUrl}/messages/reply/${conversationId}`, {
                content: messageToSend
            });

            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg._id === optimisticMessage._id ? response.data : msg
                )
            );
        } catch (err) {
            setError('Failed to send message');
            setMessages(prevMessages => prevMessages.filter(msg => msg._id !== optimisticMessage._id));
        }
    };


    const handleOfferResponse = async (response) => {
        if (!selectedOffer) return;

        setError('');

        try {
            const payload = {
                response: response,
                message: response === 'counter'
                    ? `I counter with $${counterPrice}`
                    : response === 'accepted'
                        ? 'I accept your offer!'
                        : 'Sorry, I cannot accept this offer.'
            };


            if (response === 'counter') {
                const price = parseFloat(counterPrice);
                if (isNaN(price) || price <= 0) {
                    setError('Please enter a valid counter price.');
                    return;
                }
                payload.counterPrice = price;
            }


            const responseMessage = await axios.post(
                `${config.apiUrl}/messages/respond-offer/${selectedOffer._id}`,
                payload
            );

            setMessages(prevMessages => [...prevMessages, responseMessage.data]);

            setSelectedOffer(null);
            setCounterPrice('');
        } catch (err) {
            setError('Failed to respond to offer');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] border border-gray-200 rounded shadow-md overflow-hidden bg-white">

            <div className="p-3 border-b border-gray-200 bg-gray-50 shrink-0">
                <Link to="/messages" className="text-blue-600 hover:underline text-sm mb-2 block">&larr; Back to Messages</Link>
                <h2 className="font-semibold text-lg text-gray-800">{recipient?.username || 'Conversation'}</h2>
                {listingDetails && (
                    <div className="flex items-center gap-3 p-2 bg-gray-100 rounded border border-gray-200 mt-2">
                        <img
                            src={listingDetails.images?.[0]?.url || '/placeholder-image.png'}
                            alt={listingDetails.title}
                            className="w-12 h-12 object-cover rounded flex-shrink-0"
                        />
                        <div className="min-w-0">
                            <strong className="text-sm font-medium text-gray-900 block truncate">{listingDetails.title}</strong>
                            {listingDetails.price && <span className="text-xs text-gray-600">${listingDetails.price}</span>}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => {
                        if (!msg || !msg.sender) return null;

                        const isCurrentUser = msg.sender._id === currentUserId;
                        const isOffer = msg.offerDetails;
                        const offerType = msg.offerDetails?.type;

                        return (
                            <div key={msg._id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`p-3 rounded-lg max-w-[70%] shadow-sm break-words relative ${
                                        isCurrentUser
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white text-gray-800 border border-gray-200'
                                    }`}
                                >
                                    <p className="text-sm">{msg.content}</p>

                                    {isOffer && offerType === 'initial' && !isCurrentUser && (
                                        <div className="mt-2 pt-2 border-t border-gray-300 border-opacity-50">
                                            <div className="text-xs opacity-90 mb-1">
                                                Original Price: ${msg.offerDetails.originalPrice}
                                            </div>
                                            <div className="text-xs opacity-90 mb-2">
                                                Offered Price: <span className="font-semibold">${msg.offerDetails.offeredPrice}</span>
                                            </div>
                                            {(!selectedOffer || selectedOffer._id !== msg._id) && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <Button variant="success" size="xs"  onClick={() => handleOfferResponse('accepted')} className="text-xs px-2 py-1">Accept</Button>
                                                    <Button variant="warning" size="xs" onClick={() => setSelectedOffer(msg)} className="text-xs px-2 py-1 text-white">Counter</Button>
                                                    <Button variant="danger" size="xs" onClick={() => handleOfferResponse('rejected')} className="text-xs px-2 py-1">Reject</Button>
                                                </div>
                                            )}

                                            {selectedOffer && selectedOffer._id === msg._id && (
                                                <div className="mt-3">
                                                    {error && selectedOffer?._id === msg._id && <p className="text-xs text-red-500 mb-1">{error}</p>}
                                                    <input
                                                        type="number"
                                                        value={counterPrice}
                                                        onChange={(e) => setCounterPrice(e.target.value)}
                                                        placeholder="Enter counter $"
                                                        className="w-full px-2 py-1 text-sm border border-gray-400 rounded text-gray-900 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
                                                        step="0.01" min="0.01" aria-label="Counter offer price"
                                                    />
                                                    <Button variant="warning" onClick={() => handleOfferResponse('counter')} className="mt-2 w-full text-xs px-2 py-1 text-white">Send Counter Offer</Button>
                                                    <Button variant="secondary" onClick={() => {setSelectedOffer(null); setError('');}} className="mt-1 w-full text-xs px-2 py-1">Cancel</Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {isOffer && offerType !== 'initial' && (
                                        <div className={`mt-2 pt-2 border-t border-opacity-50 ${isCurrentUser ? 'border-blue-300' : 'border-gray-300' } font-semibold text-xs`}>
                                            <span className={`p-1 rounded inline-block ${
                                                offerType === 'accepted' ? (isCurrentUser ? 'bg-green-200 text-green-800' : 'bg-green-100 text-green-700') :
                                                    offerType === 'rejected' ? (isCurrentUser ? 'bg-red-200 text-red-800' : 'bg-red-100 text-red-700') :
                                                        (isCurrentUser ? 'bg-yellow-200 text-yellow-800' : 'bg-yellow-100 text-yellow-700')
                                            }`}>
                                                 {offerType === 'accepted' && 'Offer Accepted'}
                                                {offerType === 'rejected' && 'Offer Rejected'}
                                                {offerType === 'counter' && `Counter Offer: $${msg.offerDetails.offeredPrice}`}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-400'} text-right`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0">
                <form onSubmit={handleSendMessage} className="flex p-3 border-t border-gray-200 bg-gray-50 gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Message Input"
                    />
                    <Button type="submit" variant="primary" disabled={!message.trim()}>
                        Send
                    </Button>
                </form>
                {error && <p className="p-2 text-xs text-red-600 bg-red-100 border-t border-red-200">{error}</p>}
            </div>

        </div>
    );
};

export default Conversation;