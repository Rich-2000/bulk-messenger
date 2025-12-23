import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesAPI, contactsAPI } from '../services/api';
import { Send, Mail, MessageSquare, X, Users, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Messages: React.FC = () => {
  const queryClient = useQueryClient();
  const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');
  const [showCompose, setShowCompose] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [directRecipients, setDirectRecipients] = useState<Array<{phoneNumber?: string; email?: string; name?: string}>>([]);
  const [newDirectRecipient, setNewDirectRecipient] = useState({ phoneNumber: '', email: '', name: '' });
  const [messageContent, setMessageContent] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [searchContact, setSearchContact] = useState('');

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const response = await messagesAPI.getMessages();
      console.log('Full messages response:', response);
      console.log('Messages response data field:', response.data);
      return response;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await contactsAPI.getContacts();
      console.log('Full contacts response for messages:', response);
      console.log('Contacts response data field:', response.data);
      return response;
    },
  });

  // FIXED: Better extraction of messages array from response
  const messages = React.useMemo(() => {
    console.log('Processing messagesData:', messagesData);
    
    if (Array.isArray(messagesData?.data?.data)) {
      console.log('Found messages in data.data:', messagesData.data.data.length);
      return messagesData.data.data;
    }
    if (Array.isArray(messagesData?.data)) {
      console.log('Found messages in data:', messagesData.data.length);
      return messagesData.data;
    }
    
    console.log('No messages found, returning empty array');
    return [];
  }, [messagesData]);

  // FIXED: Better extraction of contacts array from response
  const contacts = React.useMemo(() => {
    console.log('Processing contactsData for messages:', contactsData);
    
    if (Array.isArray(contactsData?.data?.data)) {
      console.log('Found contacts in data.data:', contactsData.data.data.length);
      return contactsData.data.data;
    }
    if (Array.isArray(contactsData?.data)) {
      console.log('Found contacts in data:', contactsData.data.length);
      return contactsData.data;
    }
    
    console.log('No contacts found, returning empty array');
    return [];
  }, [contactsData]);

  console.log('Rendered messages count:', messages.length);
  console.log('Rendered contacts count:', contacts.length);

  const sendMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Sending message with data:', data);
      const response = await messagesAPI.sendMessage(data);
      console.log('Message sent response:', response);
      return response;
    },
    onSuccess: async (response) => {
      toast.success('Message sent successfully!');
      await queryClient.invalidateQueries({ queryKey: ['messages'] });
      await queryClient.refetchQueries({ queryKey: ['messages'], type: 'active' });
      await queryClient.invalidateQueries({ queryKey: ['messageStats'] });
      resetComposeForm();
    },
    onError: (error: any) => {
      console.error('Send message error:', error);
      toast.error(error.response?.data?.error || 'Failed to send message');
    },
  });

  const resetComposeForm = () => {
    setShowCompose(false);
    setSelectedContacts([]);
    setDirectRecipients([]);
    setMessageContent('');
    setMessageSubject('');
    setNewDirectRecipient({ phoneNumber: '', email: '', name: '' });
  };

  const handleSendMessage = () => {
    if (!messageContent.trim()) {
      toast.error('Please enter message content');
      return;
    }

    const totalRecipients = selectedContacts.length + directRecipients.length;
    if (totalRecipients === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    if (messageType === 'email' && !messageSubject.trim()) {
      toast.error('Please enter email subject');
      return;
    }

    const messageData = {
      type: messageType,
      content: messageContent,
      subject: messageType === 'email' ? messageSubject : undefined,
      recipientIds: selectedContacts.map(c => c._id),
      directRecipients: directRecipients,
    };

    console.log('Submitting message:', messageData);
    sendMessageMutation.mutate(messageData);
  };

  const handleAddDirectRecipient = () => {
    if (messageType === 'sms' && !newDirectRecipient.phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }
    if (messageType === 'email' && !newDirectRecipient.email) {
      toast.error('Please enter an email address');
      return;
    }

    setDirectRecipients([...directRecipients, { ...newDirectRecipient }]);
    setNewDirectRecipient({ phoneNumber: '', email: '', name: '' });
  };

  const filteredContacts = contacts.filter((contact: any) =>
    contact.name?.toLowerCase().includes(searchContact.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchContact.toLowerCase()) ||
    contact.phoneNumber?.includes(searchContact)
  );

  const characterCount = messageContent.length;
  const smsCount = Math.ceil(characterCount / 160) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Send and manage your SMS and email campaigns ({messages.length} messages)
          </p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Send size={20} className="mr-2" />
          Compose Message
        </button>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Compose Message
                </h3>
                <button
                  onClick={resetComposeForm}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Message Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setMessageType('sms')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        messageType === 'sms'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                      }`}
                    >
                      <MessageSquare className={`mx-auto mb-1 ${
                        messageType === 'sms' ? 'text-blue-600' : 'text-gray-400'
                      }`} size={24} />
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">SMS</p>
                    </button>
                    <button
                      onClick={() => setMessageType('email')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        messageType === 'email'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                      }`}
                    >
                      <Mail className={`mx-auto mb-1 ${
                        messageType === 'email' ? 'text-blue-600' : 'text-gray-400'
                      }`} size={24} />
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">Email</p>
                    </button>
                  </div>
                </div>

                {/* Recipients Section */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                    Recipients ({selectedContacts.length + directRecipients.length})
                  </h4>
                  
                  {/* Contact Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select from Contacts
                    </label>
                    
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchContact}
                        onChange={(e) => setSearchContact(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                      {contactsLoading ? (
                        <div className="col-span-2 text-center py-3 text-sm text-gray-500">Loading...</div>
                      ) : filteredContacts.length > 0 ? (
                        filteredContacts.map((contact: any) => {
                          const hasValidContact = messageType === 'sms' ? contact.phoneNumber : contact.email;
                          const isSelected = selectedContacts.some(c => c._id === contact._id);
                          
                          return (
                            <button
                              key={contact._id}
                              onClick={() => {
                                if (!hasValidContact) {
                                  toast.error(`No ${messageType === 'sms' ? 'phone' : 'email'}`);
                                  return;
                                }
                                if (isSelected) {
                                  setSelectedContacts(selectedContacts.filter(c => c._id !== contact._id));
                                } else {
                                  setSelectedContacts([...selectedContacts, contact]);
                                }
                              }}
                              disabled={!hasValidContact}
                              className={`p-2 rounded-lg text-left transition-all ${
                                isSelected
                                  ? 'bg-blue-100 dark:bg-blue-900/40 border border-blue-500'
                                  : hasValidContact
                                  ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                                  : 'bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed border border-transparent'
                              }`}
                            >
                              <p className="font-medium text-xs text-gray-900 dark:text-white truncate">{contact.name}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {messageType === 'sms' ? (contact.phoneNumber || 'No phone') : (contact.email || 'No email')}
                              </p>
                            </button>
                          );
                        })
                      ) : (
                        <div className="col-span-2 text-center py-3 text-sm text-gray-500">No contacts</div>
                      )}
                    </div>
                  </div>

                  {/* Direct Recipients */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Add Direct Recipients
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Name"
                          value={newDirectRecipient.name}
                          onChange={(e) => setNewDirectRecipient({...newDirectRecipient, name: e.target.value})}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type={messageType === 'sms' ? 'tel' : 'email'}
                          placeholder={messageType === 'sms' ? 'Phone' : 'Email'}
                          value={messageType === 'sms' ? newDirectRecipient.phoneNumber : newDirectRecipient.email}
                          onChange={(e) => messageType === 'sms'
                            ? setNewDirectRecipient({...newDirectRecipient, phoneNumber: e.target.value})
                            : setNewDirectRecipient({...newDirectRecipient, email: e.target.value})
                          }
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleAddDirectRecipient}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus size={18} />
                        </button>
                      </div>

                      {directRecipients.length > 0 && (
                        <div className="space-y-2 max-h-24 overflow-y-auto">
                          {directRecipients.map((recipient, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-xs text-gray-900 dark:text-white truncate">
                                  {recipient.name || 'No Name'}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  {messageType === 'sms' ? recipient.phoneNumber : recipient.email}
                                </p>
                              </div>
                              <button
                                onClick={() => setDirectRecipients(directRecipients.filter((_, i) => i !== index))}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                              >
                                <X size={14} className="text-red-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  {messageType === 'email' && (
                    <input
                      type="text"
                      placeholder="Subject"
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      className="w-full px-3 py-2 mb-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  <textarea
                    rows={4}
                    placeholder={`Type your ${messageType} message...`}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500"
                  />
                  {messageType === 'sms' && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {characterCount}/160 ({smsCount} SMS)
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending}
                    className="flex-1 flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendMessageMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} className="mr-2" />
                        Send Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {messagesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
            </div>
          </div>
        ) : messages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Content</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Recipients</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {messages.map((message: any) => (
                  <tr key={message._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium ${
                        message.type === 'sms'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {message.type === 'sms' ? <MessageSquare size={14} /> : <Mail size={14} />}
                        {message.type.toUpperCase()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900 dark:text-white max-w-xs truncate">
                        {message.content.substring(0, 60)}...
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Users size={16} className="text-gray-400" />
                        <span className="font-medium">{message.totalRecipients}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                        message.status === 'sent'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : message.status === 'failed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {message.status}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                      {format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <MessageSquare className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No messages yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Send your first message to get started
            </p>
            <button
              onClick={() => setShowCompose(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
            >
              <Send size={20} className="mr-2" />
              Send First Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;