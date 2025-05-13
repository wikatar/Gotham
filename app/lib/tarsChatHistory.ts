import { v4 as uuidv4 } from 'uuid';

export interface TARSMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface TARSConversation {
  id: string;
  title: string;
  messages: TARSMessage[];
  createdAt: Date;
  updatedAt: Date;
  context?: string;
}

// Local storage key for conversations
const TARS_CONVERSATIONS_KEY = 'tars-conversations';

// Get all conversations from localStorage
export const getAllConversations = (): TARSConversation[] => {
  try {
    const savedConversations = localStorage.getItem(TARS_CONVERSATIONS_KEY);
    if (!savedConversations) return [];
    
    return JSON.parse(savedConversations, (key, value) => {
      // Convert string dates back to Date objects
      if (key === 'timestamp' || key === 'createdAt' || key === 'updatedAt') {
        return new Date(value);
      }
      return value;
    });
  } catch (error) {
    console.error('Failed to parse conversations:', error);
    return [];
  }
};

// Save all conversations to localStorage
export const saveAllConversations = (conversations: TARSConversation[]) => {
  localStorage.setItem(TARS_CONVERSATIONS_KEY, JSON.stringify(conversations));
};

// Get a specific conversation by ID
export const getConversation = (id: string): TARSConversation | undefined => {
  const conversations = getAllConversations();
  return conversations.find(conv => conv.id === id);
};

// Create a new conversation
export const createConversation = (
  initialMessages: TARSMessage[] = []
): TARSConversation => {
  const now = new Date();
  const newConversation: TARSConversation = {
    id: uuidv4(),
    title: `Conversation ${now.toLocaleString()}`,
    messages: initialMessages,
    createdAt: now,
    updatedAt: now
  };
  
  const conversations = getAllConversations();
  saveAllConversations([...conversations, newConversation]);
  
  return newConversation;
};

// Update an existing conversation
export const updateConversation = (
  id: string,
  updates: Partial<TARSConversation>
): TARSConversation | undefined => {
  const conversations = getAllConversations();
  const index = conversations.findIndex(conv => conv.id === id);
  
  if (index === -1) return undefined;
  
  const updatedConversation = {
    ...conversations[index],
    ...updates,
    updatedAt: new Date()
  };
  
  conversations[index] = updatedConversation;
  saveAllConversations(conversations);
  
  return updatedConversation;
};

// Add a message to a conversation
export const addMessageToConversation = (
  conversationId: string,
  message: Omit<TARSMessage, 'id'>
): TARSConversation | undefined => {
  const conversations = getAllConversations();
  const index = conversations.findIndex(conv => conv.id === conversationId);
  
  if (index === -1) return undefined;
  
  const newMessage: TARSMessage = {
    ...message,
    id: uuidv4()
  };
  
  const updatedConversation = {
    ...conversations[index],
    messages: [...conversations[index].messages, newMessage],
    updatedAt: new Date()
  };
  
  // Generate a title from the first user message if needed
  if (updatedConversation.title.startsWith('Conversation') && 
      message.role === 'user' && 
      updatedConversation.messages.filter(m => m.role === 'user').length === 1) {
    updatedConversation.title = message.content.length > 30 
      ? `${message.content.substring(0, 30)}...` 
      : message.content;
  }
  
  conversations[index] = updatedConversation;
  saveAllConversations(conversations);
  
  return updatedConversation;
};

// Delete a conversation
export const deleteConversation = (id: string): boolean => {
  const conversations = getAllConversations();
  const filteredConversations = conversations.filter(conv => conv.id !== id);
  
  if (filteredConversations.length === conversations.length) {
    return false; // No conversation was deleted
  }
  
  saveAllConversations(filteredConversations);
  return true;
};

// Get the most recent conversation or create one if none exists
export const getOrCreateCurrentConversation = (): TARSConversation => {
  const conversations = getAllConversations();
  
  if (conversations.length === 0) {
    return createConversation([]);
  }
  
  // Find the most recently updated conversation
  return conversations.sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  })[0];
};

// Update the title of a conversation
export const updateConversationTitle = (
  id: string,
  title: string
): TARSConversation | undefined => {
  return updateConversation(id, { title });
}; 