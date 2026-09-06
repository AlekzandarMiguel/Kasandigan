import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake, ShieldCheck, Users, Search, CheckCircle2,
  Package, Star, ArrowRight, Sparkles, Building2,
  Shield, Radio, Layers, Wrench, AlertTriangle, Clock,
  MapPin, Activity, Award, Check, FileCheck2, HelpCircle,
  Stethoscope, Zap, Hammer, Laptop, Truck, PhoneCall
} from 'lucide-react';

export const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchBarangay, setSearchBarangay] = useState('');

  const maramagBarangays = [
    { name: 'Anadagao', zones: '5 Puroks', type: 'Agricultural', population: '3,200+' },
    { name: 'Bagontaas', zones: '7 Puroks', type: 'Commercial / Residential', population: '8,900+' },
    { name: 'Base Camp', zones: '6 Puroks', type: 'Residential', population: '5,100+' },
    { name: 'Bayabason', zones: '4 Puroks', type: 'Agricultural', population: '2,400+' },
    { name: 'Camp 1', zones: '6 Puroks', type: 'Residential / Upland', population: '4,800+' },
    { name: 'Colambugon', zones: '5 Puroks', type: 'Agricultural', population: '3,100+' },
    { name: 'Dagumba-an', zones: '6 Puroks', type: 'Rural / Farming', population: '4,600+' },
    { name: 'Danggawan', zones: '5 Puroks', type: 'Agricultural', population: '2,900+' },
    { name: 'Dibulawan', zones: '4 Puroks', type: 'Agricultural', population: '2,700+' },
    { name: 'Kiharong', zones: '5 Puroks', type: 'Agricultural / Valley', population: '3,500+' },
    { name: 'Kisanday', zones: '6 Puroks', type: 'Residential', population: '4,200+' },
    { name: 'Kuya', zones: '7 Puroks', type: 'Agricultural / Commercial', population: '6,400+' },
    { name: 'La Asuncion', zones: '5 Puroks', type: 'Agricultural', population: '3,300+' },
    { name: 'Musuan', zones: '8 Puroks', type: 'University Hub (CMU)', population: '11,200+' },
    { name: 'North Poblacion', zones: '8 Puroks', type: 'Urban Commercial', population: '14,500+' },
    { name: 'Panalsalan', zones: '6 Puroks', type: 'Agricultural', population: '4,100+' },
    { name: 'San Miguel', zones: '5 Puroks', type: 'Agricultural', population: '3,600+' },
    { name: 'San Roque', zones: '5 Puroks', type: 'Rural Community', population: '3,000+' },
    { name: 'South Poblacion', zones: '8 Puroks', type: 'Municipal Government Center', population: '16,800+' },
    { name: 'Tubigon', zones: '5 Puroks', type: 'Agricultural', population: '2,800+' },
  ];

  const filteredBarangays = maramagBarangays.filter(b =>
    b.name.toLowerCase().includes(searchBarangay.toLowerCase()) ||
    b.type.toLowerCase().includes(searchBarangay.toLowerCase())
  );

  // System Offerings by Category
  const systemOfferings = [
    {
      category: 'ASSISTANCE',
      icon: Hammer,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      title: 'Practical Home & Neighborhood Repairs',
      description: 'Request skilled local assistance for emergency plumbing, electrical troubleshooting, roofing repairs, and minor masonry within your purok.',
      benefit: 'Fast local response within 15 minutes'
    },
    {
      category: 'EQUIPMENT',
      icon: Package,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      title: 'Free Community Tool & Equipment Lending',
      description: 'Borrow essential household gear — ladders, heavy-duty drills, welding machines, lawn equipment, folding chairs, and disaster tents for free.',
      benefit: 'Zero equipment rental costs for residents'
    },
    {
      category: 'EMERGENCY',
      icon: Radio,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50',
      title: 'MDRRMO Early Disaster & Weather Broadcasts',
      description: 'Receive verified real-time alerts from the Maramag Municipal Disaster Risk Reduction and Management Office regarding storms, floods, and evacuations.',
      benefit: 'Direct municipal emergency warnings'
    },
    {
      category: 'ASSISTANCE',
      icon: Stethoscope,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      title: 'Elder Care & Medical Apparatus Support',
      description: 'Access communal wheelchairs, walkers, blood pressure monitors, and request neighbor assistance for senior errands and hospital check-ups.',
      benefit: 'Dignified community health support'
    },
    {
      category: 'CIVIC',
      icon: Award,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50',
      title: 'Volunteer Certification & Civic Hours',
      description: 'Earn official barangay-certified volunteer certificates and verifiable civic service hours for school, scholarship, and employment requirements.',
      benefit: 'Official barangay-issued certificates'
    },
    {
      category: 'CIVIC',
      icon: ShieldCheck,
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-50',
      title: 'Verified Resident Trust & Identity Shielding',
      description: 'All members are verified through official barangay hall records. Personal phone numbers and home addresses are cryptographically shielded under RA 10173.',
      benefit: '100% verified, scam-free network'
    },
  ];

  const filteredOfferings = activeTab === 'ALL'
    ? systemOfferings
    : systemOfferings.filter(item => item.category === activeTab);

  return (
    <div className="space-y-24 pb-24 selection:bg-emerald-500 selection:text-white">
      
      {/* 1. HERO SECTION: WHAT KASANDIGAN OFFERS */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-200/20 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Mission & Offerings Overview */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Municipality Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold shadow-2xs border border-emerald-200/80">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Municipality of Maramag, Bukidnon • 20 Connected Barangays</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Free community assistance, shared tools, and emergency alerts you can{' '}
                <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy decoration-2">
                  rely on
                </span>.
              </h1>

              {/* Sub-headline focusing on offerings */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Kasandigan is a public digital platform providing on-demand neighborhood mutual aid, free community equipment lending, real-time disaster alerts, and verified civic volunteer certification across all 20 barangays of Maramag.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-3.5 pt-2">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                >
                  <span>Join Your Barangay Network</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                
                <a
                  href="#system-offerings"
                  className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>Explore What We Offer</span>
                </a>
              </div>

              {/* Key Trust & Safety Badges */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>100% Free Public Platform</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Barangay Residents Only</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>All 20 Barangays Connected</span>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive System Offerings Showcase Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 text-white relative overflow-hidden space-y-6">
                
                {/* Ambient Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Card Header */}
                <div className="pb-4 border-b border-slate-800 flex items-center justify-between relative z-10">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      System Capabilities
                    </span>
                    <h3 className="text-lg font-black text-white mt-0.5">
                      What Kasandigan Delivers
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                    Maramag, Bukidnon
                  </span>
                </div>

                {/* 4 Core Service Deliverables */}
                <div className="space-y-3.5 relative z-10">
                  
                  {/* Service 1 */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Neighborhood Mutual Aid</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        Request and offer practical skills for emergency repairs, elder assistance, transport, and tutoring.
                      </p>
                    </div>
                  </div>

                  {/* Service 2 */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0 mt-0.5">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Communal Tool & Apparatus Lending</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        Borrow community ladders, power tools, folding tables, tents, and medical equipment at zero rental cost.
                      </p>
                    </div>
                  </div>

                  {/* Service 3 */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors">
                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 shrink-0 mt-0.5">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">MDRRMO Real-Time Disaster Alerts</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        Direct municipal broadcasts for storm advisories, flood warnings, and coordinated evacuation alerts.
                      </p>
                    </div>
                  </div>

                  {/* Service 4 */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors">
                    <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 shrink-0 mt-0.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Official Volunteer Certification</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        Accrue documented civic service hours and receive authenticated barangay certificates of appreciation.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Trust Footer */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 relative z-10">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Shield className="w-3.5 h-3.5" />
                    <span>RA 10173 Data Privacy Shield</span>
                  </span>
                  <span className="text-[11px] text-slate-400">20 Barangays Covered</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. CORE SYSTEM OFFERINGS SHOWCASE */}
      <section id="system-offerings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-200/80">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-widest">
              <span>Public Civic Infrastructure</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              What Kasandigan Offers to Every Citizen
            </h2>
            <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
              Designed as a modern community safety net, connecting neighbors who need help with neighbors who can share skills and apparatus.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold shrink-0">
            {[
              { key: 'ALL', label: 'All Services' },
              { key: 'ASSISTANCE', label: 'Mutual Aid' },
              { key: 'EQUIPMENT', label: 'Tool Lending' },
              { key: 'EMERGENCY', label: 'Disaster Alerts' },
              { key: 'CIVIC', label: 'Volunteering' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Offerings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOfferings.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center`}>
                    <IconComp className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{item.benefit}</span>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* 3. DETAILED VALUE COMPARISON: WHY IT MATTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Community Impact
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Solving Everyday Barangay Challenges
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              How Kasandigan modernizes traditional Filipino "Bayanihan" into a safe, organized, and transparent digital system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Rapid Local Matching</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rather than broadcasting desperate messages on social media groups, requests are matched with verified neighbors living in your own zone or purok who have registered specific skills.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Save Money on Equipment</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Families avoid spending thousands on equipment needed only once a year. The communal library tracks equipment condition, due dates, and return accountability automatically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Documented Community Service</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Volunteers and skilled helpers build an official, verified civic portfolio. Barangay halls can export audit summaries directly for DILG performance assessments.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. ALL 20 BARANGAYS OF MARAMAG DIRECTORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Municipal Network Coverage</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              All 20 Barangays of Maramag, Bukidnon
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Every district operates with its own private database, unified under the municipal civic aid network.
            </p>
          </div>

          {/* Search filter for barangays */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchBarangay}
              onChange={(e) => setSearchBarangay(e.target.value)}
              placeholder="Filter barangay or zone..."
              className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden shadow-2xs"
            />
          </div>
        </div>

        {/* Barangay Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredBarangays.map((b, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition-all"
            >
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{b.name}</span>
              </div>
              <div className="text-[11px] text-slate-600 font-semibold">{b.zones}</div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{b.type}</div>
            </div>
          ))}
        </div>

      </section>

      {/* 5. HOW IT WORKS: 4 SIMPLE STEPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Simple, Transparent, and Safe
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How to Access Community Assistance
          </h3>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">
            Getting help or sharing resources takes only a few minutes with verified neighborhood security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Barangay Verification',
              desc: 'Create an account and submit proof of residency (Voter ID, Barangay Clearance, or CMU ID) to your local hall for instant authentication.'
            },
            {
              step: '02',
              title: 'Request Help or Tools',
              desc: 'Post an urgent mutual aid need (repairs, elder aid, tutoring) or request equipment from the community apparatus library.'
            },
            {
              step: '03',
              title: 'Deterministic Match',
              desc: 'Our scoring engine matches you with verified neighbors based on proximity, skills, and schedule availability.'
            },
            {
              step: '04',
              title: 'Review & Recognition',
              desc: 'Once completed, leave a review. Helpers earn verified volunteer hours and official barangay service certificates.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="text-3xl font-black text-emerald-600/30 mb-3">{item.step}</div>
                <h4 className="text-base font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl p-8 sm:p-14 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          
          <div className="space-y-4 max-w-2xl relative z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>Verified Civic Infrastructure</span>
            </div>
            
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to tap into your barangay’s mutual aid network?
            </h3>
            
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Connect with verified neighbors, borrow essential tools for free, and stay informed with municipal emergency updates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 relative z-10 w-full sm:w-auto">
            <Link
              to="/register"
              className="px-8 py-4 bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-sm rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Join Your Barangay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-emerald-800/60 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl border border-emerald-500/40 transition-all text-center cursor-pointer"
            >
              <span>Sign In to Portal</span>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingPage;
