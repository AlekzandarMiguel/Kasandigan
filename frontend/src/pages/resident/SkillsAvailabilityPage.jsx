import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Calendar, Clock, Plus, Trash2, CheckCircle2, ShieldCheck, MapPin, Sparkles, Award, Printer } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const DAYS = [
  { id: 0, label: 'Monday' },
  { id: 1, label: 'Tuesday' },
  { id: 2, label: 'Wednesday' },
  { id: 3, label: 'Thursday' },
  { id: 4, label: 'Friday' },
  { id: 5, label: 'Saturday' },
  { id: 6, label: 'Sunday' },
];

export const SkillsAvailabilityPage = () => {
  const { user, refreshUserProfile } = useAuth();
  const [allSkills, setAllSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [radius, setRadius] = useState(user?.assistance_radius || 'BARANGAY');

  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [proficiency, setProficiency] = useState('INTERMEDIATE');
  const [years, setYears] = useState(1);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const [skillsRes, userSkillsRes, availRes] = await Promise.all([
        api.get('/skills/'),
        api.get('/user-skills/'),
        api.get('/user-availability/'),
      ]);
      setAllSkills(skillsRes.data.results || skillsRes.data || []);
      setUserSkills(userSkillsRes.data.results || userSkillsRes.data || []);

      const avData = availRes.data.results || availRes.data || [];
      // Initialize full 7 days
      const map = {};
      avData.forEach((a) => {
        map[a.day_of_week] = a;
      });

      const fullDays = DAYS.map((d) => ({
        day_of_week: d.id,
        is_available: map[d.id]?.is_available ?? false,
        time_slot: map[d.id]?.time_slot ?? 'ALL_DAY',
      }));
      setAvailabilities(fullDays);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    try {
      await api.post('/user-skills/', {
        skill: Number(selectedSkillId),
        proficiency,
        years_experience: Number(years),
        notes,
      });
      setMessage('Skill added successfully to your helper profile!');
      setSelectedSkillId('');
      setNotes('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add skill.');
    }
  };

  const handleRemoveSkill = async (id) => {
    try {
      await api.delete(`/user-skills/${id}/`);
      fetchData();
    } catch (err) {
      alert('Failed to remove skill.');
    }
  };

  const handleToggleDay = (dayIdx) => {
    setAvailabilities((prev) =>
      prev.map((d, i) => (i === dayIdx ? { ...d, is_available: !d.is_available } : d))
    );
  };

  const handleSlotChange = (dayIdx, slot) => {
    setAvailabilities((prev) =>
      prev.map((d, i) => (i === dayIdx ? { ...d, time_slot: slot } : d))
    );
  };

  const handleSaveSchedule = async () => {
    setSavingSchedule(true);
    try {
      await api.post('/user-availability/bulk_save/', {
        schedule: availabilities,
      });
      setMessage('Weekly availability schedule saved!');
    } catch (err) {
      alert('Failed to save schedule.');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleUpdateRadius = async (newRadius) => {
    setRadius(newRadius);
    try {
      await api.patch('/auth/me/', { assistance_radius: newRadius });
      await refreshUserProfile();
      setMessage('Assistance radius updated!');
    } catch (err) {
      alert('Failed to update radius.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading helper profile & skills..." />;

  // Filter skills not yet added by user
  const addedSkillIds = new Set(userSkills.map((us) => us.skill));
  const availableSkillsToAdd = allSkills.filter((s) => !addedSkillIds.has(s.id));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Wrench className="w-6 h-6 text-emerald-600" />
          Helper Profile & Skills
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure skills you can offer and your available hours to receive matched assistance invitations.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Bayanihan Badges & Volunteer Commendation */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-amber-300 shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Bayanihan Honors & Community Badges</h3>
              <p className="text-xs text-emerald-200">Earned volunteer recognitions for verified assistance</p>
            </div>
          </div>

          <Link
            to="/certificate"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap cursor-pointer"
          >
            <Printer className="w-4 h-4" /> View Official Certificate
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {user?.bayanihan_badges && user.bayanihan_badges.length > 0 ? (
            user.bayanihan_badges.map((b) => (
              <div key={b.id} className="p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-amber-300">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-bold">{b.name}</span>
                </div>
                <p className="text-[10px] text-emerald-200 mt-1 line-clamp-2">{b.description}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-xs text-emerald-300 italic">
              Complete your first community assistance ticket to unlock your first Bayanihan badge and official Certificate of Volunteer Service!
            </div>
          )}
        </div>
      </div>

      {/* Assistance Radius Preference */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          Assistance Distance & Radius
        </h3>
        <p className="text-xs text-slate-500">
          Where are you comfortable extending your assistance within your barangay?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleUpdateRadius('ZONE')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              radius === 'ZONE'
                ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="font-bold text-sm text-slate-900">Within My Zone Only</div>
            <div className="text-xs text-slate-500 mt-1">
              Help neighbors located strictly in {user?.zone || 'your zone'}.
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleUpdateRadius('BARANGAY')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              radius === 'BARANGAY'
                ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="font-bold text-sm text-slate-900">Anywhere in the Barangay</div>
            <div className="text-xs text-slate-500 mt-1">
              Willing to travel anywhere within {user?.barangay_details?.name || 'the barangay'}. (+10 matching score across zones)
            </div>
          </button>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">My Offered Skills</h3>
            <p className="text-xs text-slate-500">Skills you are willing to help community members with.</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            {userSkills.length} Skill{userSkills.length === 1 ? '' : 's'} Active
          </span>
        </div>

        {/* Existing skills list */}
        {userSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userSkills.map((us) => (
              <div
                key={us.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {us.category_name}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{us.skill_name}</h4>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {us.proficiency} • {us.years_experience} yr{us.years_experience > 1 ? 's' : ''} exp
                  </div>
                  {us.notes && <p className="text-[11px] text-slate-400 italic mt-1">"{us.notes}"</p>}
                </div>
                <button
                  onClick={() => handleRemoveSkill(us.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove skill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            You haven't listed any skills yet. Add a skill below to appear in helper recommendations!
          </div>
        )}

        {/* Add Skill Form */}
        <form onSubmit={handleAddSkill} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Add a Skill</h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Skill</label>
              <select
                required
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="">-- Choose a skill --</option>
                {availableSkillsToAdd.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Proficiency</label>
              <select
                value={proficiency}
                onChange={(e) => setProficiency(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Years Experience</label>
              <input
                type="number"
                min="1"
                max="50"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Tools you own (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Have my own screwdrivers and soldering iron..."
              className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          </div>
        </form>
      </div>

      {/* Weekly Availability Schedule */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Weekly Availability Schedule</h3>
            <p className="text-xs text-slate-500">Define which days and times you are generally free to assist.</p>
          </div>
          <button
            onClick={handleSaveSchedule}
            disabled={savingSchedule}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {savingSchedule ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>

        <div className="space-y-3">
          {availabilities.map((day, idx) => {
            const dayMeta = DAYS.find((d) => d.id === day.day_of_week) || DAYS[idx];
            return (
              <div
                key={day.day_of_week}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  day.is_available ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 bg-slate-50/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`day-${day.day_of_week}`}
                    checked={day.is_available}
                    onChange={() => handleToggleDay(idx)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <label htmlFor={`day-${day.day_of_week}`} className="text-sm font-bold text-slate-800 cursor-pointer">
                    {dayMeta.label}
                  </label>
                </div>

                {day.is_available && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={day.time_slot}
                      onChange={(e) => handleSlotChange(idx, e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="ALL_DAY">All Day (Flexible)</option>
                      <option value="MORNING">Morning (8:00 AM - 12:00 PM)</option>
                      <option value="AFTERNOON">Afternoon (1:00 PM - 5:00 PM)</option>
                      <option value="EVENING">Evening (5:00 PM - 8:00 PM)</option>
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SkillsAvailabilityPage;
