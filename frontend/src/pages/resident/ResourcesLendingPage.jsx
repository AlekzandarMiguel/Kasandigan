import PageHeader from '../../components/PageHeader';
import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Calendar, MapPin, User, CheckCircle,
  Clock, ArrowRight, ShieldCheck, X
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

const CATEGORIES = [
  { value: 'TOOLS', label: 'Tools & Hardware' },
  { value: 'GARDENING', label: 'Gardening & Outdoor' },
  { value: 'ELECTRONICS', label: 'Electronics & Appliances' },
  { value: 'EVENT_EQUIPMENT', label: 'Event & Party Equipment' },
  { value: 'HOME_CARE', label: 'Home & Cleaning Care' },
  { value: 'OTHER', label: 'Other Resource' },
];

export const ResourcesLendingPage = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listing modal
  const [addOpen, setAddOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    category: 'TOOLS',
    condition: 'GOOD',
    description: '',
    zone: user?.zone || '',
  });

  // Borrow modal
  const [borrowItem, setBorrowItem] = useState(null);
  const [borrowForm, setBorrowForm] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    purpose: '',
  });

  const [message, setMessage] = useState('');

  const fetchResources = async () => {
    setLoading(true);
    try {
      const [resList, reqList] = await Promise.all([
        api.get('/resources/'),
        api.get('/resource-requests/'),
      ]);
      setResources(resList.data.results || resList.data || []);
      setBorrowRequests(reqList.data.results || reqList.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      await api.post('/resources/', newResource);
      setMessage('Resource listed successfully in your barangay!');
      setAddOpen(false);
      setNewResource({
        name: '',
        category: 'TOOLS',
        condition: 'GOOD',
        description: '',
        zone: user?.zone || '',
      });
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to list resource.');
    }
  };

  const handleBorrowRequest = async (e) => {
    e.preventDefault();
    if (!borrowItem) return;

    try {
      await api.post(`/resources/${borrowItem.id}/request_borrow/`, borrowForm);
      setMessage(`Borrow request submitted to ${borrowItem.owner_name}!`);
      setBorrowItem(null);
      setBorrowForm({
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        purpose: '',
      });
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit borrow request.');
    }
  };

  const handleAcceptBorrow = async (reqId) => {
    try {
      await api.post(`/resource-requests/${reqId}/accept/`);
      setMessage('Borrow request accepted.');
      fetchResources();
    } catch (err) {
      alert('Failed to accept request.');
    }
  };

  const handleMarkReturned = async (reqId) => {
    try {
      await api.post(`/resource-requests/${reqId}/mark_returned/`);
      setMessage('Resource marked as returned and available.');
      fetchResources();
    } catch (err) {
      alert('Failed to mark returned.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading community resources..." />;

  const myResources = resources.filter((r) => r.owner === user?.id);
  const communityResources = resources.filter((r) => r.owner !== user?.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            Community Resource Sharing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Lend and borrow ladders, drills, equipment, and folding chairs within {user?.barangay_details?.name || 'your barangay'}.
          </p>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Share a Resource</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'browse' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Browse Available Items ({communityResources.length})
        </button>
        <button
          onClick={() => setActiveTab('my_items')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'my_items' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Shared Items & Requests ({myResources.length})
        </button>
      </div>

      {activeTab === 'browse' ? (
        communityResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communityResources.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.category_display}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description || 'Clean and functional community tool.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-500 space-y-0.5">
                    <div className="flex items-center gap-1 font-medium text-slate-700">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {item.owner_name}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.zone} • Condition: {item.condition_display}
                    </div>
                  </div>

                  {item.status === 'AVAILABLE' && (
                    <button
                      onClick={() => setBorrowItem(item)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                    >
                      Request to Borrow
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No items available right now" description="Check back soon or be the first to list a community tool!" />
        )
      ) : (
        <div className="space-y-6">
          {/* Requests received on my items */}
          {borrowRequests.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Borrow Requests for Your Items</h3>
              <div className="space-y-2">
                {borrowRequests.map((br) => (
                  <div key={br.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{br.borrower_name}</span> wants to borrow <strong className="text-emerald-700">{br.resource_name}</strong>
                      <div className="text-slate-500 mt-0.5">
                        Dates: {br.start_date} to {br.end_date} • Purpose: "{br.purpose}"
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={br.status} />
                      {br.status === 'PENDING' && (
                        <button
                          onClick={() => handleAcceptBorrow(br.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                        >
                          Approve
                        </button>
                      )}
                      {br.status === 'BORROWED' && (
                        <button
                          onClick={() => handleMarkReturned(br.id)}
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg"
                        >
                          Mark Returned
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My items list */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Items You Are Sharing</h3>
            {myResources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myResources.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                    <div className="text-[11px] text-slate-400">
                      {item.zone} • {item.condition_display}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="You haven't listed any items" description="Share tools or items with your neighbors." />
            )}
          </div>
        </div>
      )}

      {/* Share Item Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl relative space-y-4">
            <button onClick={() => setAddOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900">Share a Community Resource</h3>
            <form onSubmit={handleCreateResource} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={newResource.name}
                  onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                  placeholder="e.g. 10ft Aluminum Ladder / Power Drill"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newResource.category}
                    onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={newResource.condition}
                    onChange={(e) => setNewResource({ ...newResource, condition: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="EXCELLENT">Excellent</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Zone Location</label>
                <input
                  type="text"
                  required
                  value={newResource.zone}
                  onChange={(e) => setNewResource({ ...newResource, zone: e.target.value })}
                  placeholder="e.g. Zone 2 - Centro"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  placeholder="Brand, model, accessories included..."
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Publish Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Borrow Request Modal */}
      {borrowItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl relative space-y-4">
            <button onClick={() => setBorrowItem(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900">Request to Borrow</h3>
            <p className="text-xs text-slate-500">
              Item: <strong className="text-slate-800">{borrowItem.name}</strong> from {borrowItem.owner_name}
            </p>

            <form onSubmit={handleBorrowRequest} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={borrowForm.start_date}
                    onChange={(e) => setBorrowForm({ ...borrowForm, start_date: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Return Date</label>
                  <input
                    type="date"
                    required
                    value={borrowForm.end_date}
                    onChange={(e) => setBorrowForm({ ...borrowForm, end_date: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose of Borrowing</label>
                <textarea
                  required
                  rows="3"
                  value={borrowForm.purpose}
                  onChange={(e) => setBorrowForm({ ...borrowForm, purpose: e.target.value })}
                  placeholder="Describe how and when you will use it..."
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBorrowItem(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesLendingPage;
