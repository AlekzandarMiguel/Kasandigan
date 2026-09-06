import PageHeader from '../../components/PageHeader';
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  HeartHandshake, PlusCircle, Search, Filter, Calendar,
  Clock, MapPin, User, ChevronRight, Tag
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export const AssistanceRequestsList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('scope') || 'open_community';

  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories/');
        setCategories(res.data.results || res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = `/requests/?scope=${activeTab}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      const res = await api.get(url);
      setRequests(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab, selectedCategory]);

  const handleTabChange = (tab) => {
    setSearchParams({ scope: tab });
  };

  const filtered = requests.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.zone?.toLowerCase().includes(q) ||
      r.category_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={HeartHandshake}
        badge={`Community Mutual Aid • ${user?.barangay_details?.name || 'Maramag'}`}
        badgeIcon={HeartHandshake}
        title="Assistance Requests"
        description={`Browse requests in ${user?.barangay_details?.name || 'your barangay'} or request help from neighbors.`}
        actions={
          <Link
            to="/requests/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            <span>New Request</span>
          </Link>
        }
      />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => handleTabChange('open_community')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'open_community'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Community Requests (Looking for Helpers)
        </button>
        <button
          onClick={() => handleTabChange('my_requests')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'my_requests'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Requests
        </button>
        <button
          onClick={() => handleTabChange('my_helping')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'my_helping'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Requests I'm Helping With
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, skill, or zone..."
            className="w-full text-sm pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-sm px-3 py-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <LoadingSpinner text="Loading assistance requests..." />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((req) => (
            <Link
              key={req.id}
              to={`/requests/${req.id}`}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                      {req.category_name}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {req.title}
                    </h3>
                  </div>
                  <StatusBadge status={req.status} />
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {req.description}
                </p>

                {req.required_skill_name && (
                  <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span>Skill: {req.required_skill_name}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {req.zone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {req.preferred_date}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No requests found"
          description={
            activeTab === 'my_requests'
              ? "You haven't submitted any assistance requests yet."
              : activeTab === 'my_helping'
              ? "You are not currently assisting with any active requests."
              : "No community members are currently looking for help in this category."
          }
          actionLabel={activeTab === 'my_requests' ? 'Create a Request' : null}
          onAction={activeTab === 'my_requests' ? () => (window.location.href = '/requests/create') : null}
        />
      )}
    </div>
  );
};

export default AssistanceRequestsList;
