import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsAPI } from '../services/api';
import { Users, Plus, Upload, Search, Edit, Trash2, Mail, Phone, X, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Contacts: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingContact, setEditingContact] = useState<any>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });

  const { data: contactsData, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await contactsAPI.getContacts();
      console.log('Full contacts response:', response);
      console.log('Response data field:', response.data);
      return response;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // FIXED: Better extraction of contacts array from response
  // The API returns: { data: { success, data: [...contacts], groups, pagination } }
  // So we need to access response.data.data
  const contacts = React.useMemo(() => {
    console.log('Processing contactsData:', contactsData);
    
    // Try different possible response structures
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

  console.log('Rendered contacts count:', contacts.length);

  const createContactMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await contactsAPI.createContact(data);
      console.log('Contact created:', response);
      return response;
    },
    onSuccess: async () => {
      toast.success('Contact created successfully!');
      
      // Force immediate refetch with await
      await queryClient.invalidateQueries({ queryKey: ['contacts'] });
      await queryClient.refetchQueries({ queryKey: ['contacts'], type: 'active' });
      
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Create contact error:', error);
      toast.error(error.response?.data?.error || 'Failed to create contact');
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await contactsAPI.updateContact(id, data);
      console.log('Contact updated:', response);
      return response;
    },
    onSuccess: async () => {
      toast.success('Contact updated successfully!');
      await queryClient.invalidateQueries({ queryKey: ['contacts'] });
      await queryClient.refetchQueries({ queryKey: ['contacts'], type: 'active' });
      setEditingContact(null);
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Update contact error:', error);
      toast.error(error.response?.data?.error || 'Failed to update contact');
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await contactsAPI.deleteContact(id);
      console.log('Contact deleted:', response);
      return response;
    },
    onSuccess: async () => {
      toast.success('Contact deleted successfully!');
      await queryClient.invalidateQueries({ queryKey: ['contacts'] });
      await queryClient.refetchQueries({ queryKey: ['contacts'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Delete contact error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete contact');
    },
  });

  const bulkImportMutation = useMutation({
    mutationFn: async (contacts: any[]) => {
      const results = await Promise.allSettled(
        contacts.map(contact => contactsAPI.createContact(contact))
      );
      console.log('Bulk import results:', results);
      return results;
    },
    onSuccess: async (results) => {
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (failed === 0) {
        toast.success(`Successfully imported ${successful} contacts!`);
      } else {
        toast.success(`Imported ${successful} contacts. ${failed} failed.`);
      }
      
      await queryClient.invalidateQueries({ queryKey: ['contacts'] });
      await queryClient.refetchQueries({ queryKey: ['contacts'], type: 'active' });
      setShowImportModal(false);
      setCsvFile(null);
      setCsvPreview([]);
    },
    onError: (error) => {
      console.error('Bulk import error:', error);
      toast.error('Failed to import contacts');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
    });
    setEditingContact(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.email && !formData.phoneNumber) {
      toast.error('Please provide at least email or phone number');
      return;
    }

    if (editingContact) {
      updateContactMutation.mutate({ id: editingContact._id, data: formData });
    } else {
      createContactMutation.mutate(formData);
    }
  };

  const handleEdit = (contact: any) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email || '',
      phoneNumber: contact.phoneNumber || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      deleteContactMutation.mutate(id);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const contacts: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const contact: any = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        if (header === 'name' || header === 'full name' || header === 'fullname') {
          contact.name = value;
        } else if (header === 'email' || header === 'email address') {
          contact.email = value;
        } else if (header === 'phone' || header === 'phone number' || header === 'phonenumber' || header === 'mobile') {
          contact.phoneNumber = value;
        }
      });

      if (contact.name && (contact.email || contact.phoneNumber)) {
        contacts.push(contact);
      }
    }

    return contacts;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsedContacts = parseCSV(text);
      
      if (parsedContacts.length === 0) {
        toast.error('No valid contacts found in CSV. Make sure it has columns: name, email, phone');
        setCsvFile(null);
        return;
      }

      setCsvPreview(parsedContacts);
      setShowImportModal(true);
    };

    reader.onerror = () => {
      toast.error('Failed to read CSV file');
      setCsvFile(null);
    };

    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    if (csvPreview.length > 0) {
      bulkImportMutation.mutate(csvPreview);
    }
  };

  const filteredContacts = contacts.filter((contact: any) =>
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumber?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your contact list ({contacts.length} contacts)
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleImportClick}
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Upload size={18} className="mr-2" />
            Import CSV
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus size={20} className="mr-2" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search contacts by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl my-8 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Import Contacts from CSV
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Review the contacts below before importing
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setCsvFile(null);
                    setCsvPreview([]);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <FileText className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      {csvFile?.name}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Found {csvPreview.length} valid contacts to import
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {csvPreview.map((contact, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{contact.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {contact.email || <span className="italic text-gray-400">No email</span>}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {contact.phoneNumber || <span className="italic text-gray-400">No phone</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">CSV Format Requirements:</p>
                    <ul className="text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                      <li>First row should contain headers: name, email, phone</li>
                      <li>Each contact must have a name and at least email or phone</li>
                      <li>Accepted column names: "name"/"full name", "email"/"email address", "phone"/"phone number"</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setCsvFile(null);
                    setCsvPreview([]);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={bulkImportMutation.isPending}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkImportMutation.isPending ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    `Import ${csvPreview.length} Contacts`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingContact ? 'Edit Contact' : 'Add New Contact'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createContactMutation.isPending || updateContactMutation.isPending}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createContactMutation.isPending || updateContactMutation.isPending
                      ? 'Saving...'
                      : editingContact
                      ? 'Update'
                      : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading contacts...</p>
            </div>
          </div>
        ) : filteredContacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredContacts.map((contact: any) => (
                  <tr key={contact._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
                          <span className="text-white font-semibold text-lg">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{contact.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Mail size={16} className="text-gray-400" />
                        {contact.email || <span className="text-gray-400 italic">No email</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone size={16} className="text-gray-400" />
                        {contact.phoneNumber || <span className="text-gray-400 italic">No phone</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(contact)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors group"
                          title="Edit contact"
                        >
                          <Edit size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(contact._id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors group"
                          title="Delete contact"
                        >
                          <Trash2 size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No contacts found' : 'No contacts yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery ? 'Try adjusting your search query' : 'Add your first contact to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                <Plus size={20} className="mr-2" />
                Add First Contact
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;