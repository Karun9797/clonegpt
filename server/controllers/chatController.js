import Chat from '../models/chat.js';

export const createChat = async (request, response) => {
  try {
    const userId = request.user._id;
    const chatData = {
      userId,
      name: 'New Chat',
      userName: request.user.name,
      messages: [],
    };

    await Chat.create(chatData);
    response.json({ success: true, message: 'Chat created' });
  } catch (error) {
    response.json({ success: false, message: error.message });
  }
};

// api controller for fetching all chats
export const getChats = async (request, response) => {
  try {
    const userId = request.user._id;
    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });

    response.json({ success: true, chats });
  } catch (error) {
    response.json({ success: false, message: error.message });
  }
};

// api controller for deleting chats
export const deleteChat = async (request, response) => {
  try {
    const userId = request.user._id;
    const { chatId } = request.body;

    await Chat.deleteOne({ _id: chatId, userId });
    response.json({ success: true, message: 'Chat Deleted' });
  } catch (error) {
    response.json({ success: false, message: error.message });
  }
};
