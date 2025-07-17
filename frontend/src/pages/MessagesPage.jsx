import { Route, Routes } from 'react-router-dom';
import ConversationList from '../components/ConversationList';
import Conversation from '../components/Conversation';
const MessagesPage = () => {
    return (
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 border-b pb-2 border-gray-200">
                Messages
            </h1>
            <Routes>
                <Route path="/" element={<ConversationList />} />
                <Route path="/:conversationId" element={<Conversation />} />
            </Routes>
        </div>
    );
};

export default MessagesPage;
