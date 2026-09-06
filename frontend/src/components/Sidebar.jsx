import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, HeartHandshake, Wrench, Layers,
  Flag, Megaphone, FileText, Settings, Shield, UserCheck,
  Package, Calendar, Bell, LogOut, CheckCircle, MapPin, X,
  PlusCircle, BarChart3, ShieldCheck, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavSections = () => {
    if (user?.role === 'PLATFORM_ADMIN') {
      return [
        {
          title: t('sec_saas_admin', 'SaaS Administration'),
          links: [
            { to: '/platform/dashboard', label: t('nav_dashboard', 'Dashboard'), icon: LayoutDashboard },
            { to: '/platform/barangays', label: t('nav_barangay_tenants', 'Barangay Tenants'), icon: Shield },
            { to: '/platform/users', label: t('nav_user_directory', 'User Directory'), icon: Users },
          ],
        },
        {
          title: t('sec_bulletins_notices', 'Bulletins & Notices'),
          links: [
            { to: '/platform/announcements', label: t('nav_municipal_bulletins', 'Municipal Bulletins'), icon: Megaphone },
            { to: '/notifications', label: t('nav_notifications', 'Notifications'), icon: Bell },
          ],
        },
        {
          title: t('sec_analytics_security', 'Analytics & Security'),
          links: [
            { to: '/platform/reports', label: t('nav_platform_reports', 'Platform Reports'), icon: BarChart3 },
            { to: '/platform/activity-logs', label: t('nav_system_audit_logs', 'System Audit Logs'), icon: FileText },
            { to: '/platform/settings', label: t('nav_system_settings', 'System Settings'), icon: Settings },
          ],
        },
      ];
    }

    if (user?.role === 'BARANGAY_ADMIN') {
      return [
        {
          title: t('sec_tenant_overview', 'Tenant Overview'),
          links: [
            { to: '/admin/dashboard', label: t('nav_dashboard', 'Dashboard'), icon: LayoutDashboard },
            { to: '/admin/residents', label: t('nav_resident_directory', 'Resident Directory'), icon: Users },
            { to: '/admin/staff', label: t('nav_staff_management', 'Staff Management'), icon: UserCheck },
          ],
        },
        {
          title: t('sec_bulletins_notices', 'Bulletins & Notices'),
          links: [
            { to: '/admin/announcements', label: t('nav_barangay_announcements', 'Barangay Announcements'), icon: Megaphone },
            { to: '/notifications', label: t('nav_notifications', 'Notifications'), icon: Bell },
          ],
        },
        {
          title: t('sec_assistance_taxonomies', 'Assistance & Taxonomies'),
          links: [
            { to: '/admin/requests', label: t('nav_assistance_requests', 'Assistance Requests'), icon: HeartHandshake },
            { to: '/admin/skills', label: t('nav_skills_taxonomy', 'Skills Taxonomy'), icon: Wrench },
            { to: '/admin/categories', label: t('nav_assistance_categories', 'Assistance Categories'), icon: Layers },
          ],
        },
        {
          title: t('sec_safety_governance', 'Safety & Governance'),
          links: [
            { to: '/admin/dilg-report', label: t('nav_dilg_report', 'DILG Monthly Report'), icon: Award },
            { to: '/admin/reports', label: t('nav_resident_reports', 'Resident Reports'), icon: Flag },
            { to: '/admin/activity-logs', label: t('nav_activity_logs', 'Activity Logs'), icon: FileText },
            { to: '/admin/settings', label: t('nav_barangay_settings', 'Barangay Settings'), icon: Settings },
          ],
        },
      ];
    }

    if (user?.role === 'BARANGAY_STAFF') {
      return [
        {
          title: t('sec_staff_operations', 'Staff Operations'),
          links: [
            { to: '/staff/dashboard', label: t('nav_staff_dashboard', 'Staff Dashboard'), icon: LayoutDashboard },
            { to: '/staff/verifications', label: t('nav_resident_verifications', 'Resident Verifications'), icon: UserCheck },
            { to: '/staff/residents', label: t('nav_resident_directory', 'Resident Directory'), icon: Users },
          ],
        },
        {
          title: t('sec_bulletins_notices', 'Bulletins & Notices'),
          links: [
            { to: '/staff/announcements', label: t('nav_barangay_notices', 'Barangay Notices'), icon: Megaphone },
            { to: '/notifications', label: t('nav_notifications', 'Notifications'), icon: Bell },
          ],
        },
        {
          title: t('sec_community_moderation', 'Community Moderation'),
          links: [
            { to: '/staff/requests', label: t('nav_community_requests', 'Community Requests'), icon: HeartHandshake },
            { to: '/staff/reports', label: t('nav_triage_reports', 'Triage Reports'), icon: Flag },
          ],
        },
      ];
    }

    // Resident
    return [
      {
        title: t('sec_community_aid', 'Community Aid'),
        links: [
          { to: '/dashboard', label: t('nav_dashboard', 'Dashboard'), icon: LayoutDashboard },
          { to: '/requests', label: t('nav_assistance_requests', 'Assistance Requests'), icon: HeartHandshake },
          { to: '/requests/create', label: t('nav_request_help', 'Request Help'), icon: PlusCircle },
          { to: '/assistance', label: t('nav_my_assistance', 'My Assistance Activity'), icon: CheckCircle },
        ],
      },
      {
        title: t('sec_bulletins_notices', 'Bulletins & Notices'),
        links: [
          { to: '/announcements', label: t('nav_barangay_bulletins', 'Barangay Bulletins'), icon: Megaphone },
          { to: '/notifications', label: t('nav_personal_notifications', 'Personal Notifications'), icon: Bell },
        ],
      },
      {
        title: t('sec_helper_resources', 'Helper & Resources'),
        links: [
          { to: '/skills', label: t('nav_skills_availability', 'Skills & Availability'), icon: Wrench },
          { to: '/certificate', label: t('nav_volunteer_certificate', 'Volunteer Certificate'), icon: Award },
          { to: '/resources', label: t('nav_community_resources', 'Community Resources'), icon: Package },
          { to: '/settings', label: t('nav_profile_settings', 'Profile & Settings'), icon: Settings },
        ],
      },
    ];
  };

  const sections = getNavSections();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Sidebar Header with Logo */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link
          to={user?.role === 'PLATFORM_ADMIN' ? '/platform/dashboard' : user?.role === 'BARANGAY_ADMIN' ? '/admin/dashboard' : user?.role === 'BARANGAY_STAFF' ? '/staff/dashboard' : '/dashboard'}
          className="flex items-center gap-3 group transition-transform active:scale-95 duration-150"
          onClick={() => setMobileOpen && setMobileOpen(false)}
        >
          <Logo size="md" className="transition-transform duration-300 ease-out group-hover:scale-108 group-hover:-rotate-2" />
          <div>
            <div className="flex items-center gap-1.5 font-extrabold text-lg text-slate-900 leading-none">
              <span className="transition-colors duration-200 group-hover:text-emerald-700">Kasandigan</span>
              <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 transition-colors duration-200 group-hover:bg-emerald-200 group-hover:text-emerald-950">
                SaaS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{t('brand_tagline', 'A community you can rely on')}</p>
          </div>
        </Link>

        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tenant Indicator if assigned */}
      {user?.barangay_details ? (
        <div className="group px-5 py-3 bg-slate-50 hover:bg-slate-100/70 border-b border-slate-100 transition-colors">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 transition-transform duration-200 group-hover:scale-115 group-hover:text-emerald-700" />
            <span className="truncate group-hover:text-slate-900 transition-colors">{user.barangay_details.name}</span>
          </div>
          {user.zone && (
            <div className="text-[11px] text-slate-400 pl-5.5 font-medium">{user.zone}</div>
          )}
        </div>
      ) : (
        <div className="group px-5 py-2.5 bg-indigo-50/50 hover:bg-indigo-50/80 border-b border-indigo-100/60 flex items-center gap-2 text-[11px] font-bold text-indigo-900 transition-colors">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0 transition-transform duration-200 group-hover:scale-115" />
          <span>Multi-Tenant Platform Control</span>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="p-3 flex-1 overflow-y-auto space-y-4">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              {section.title}
            </div>
            {section.links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ease-out active:scale-[0.98] ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:translate-x-1'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-all duration-150 ease-out ${
                          isActive
                            ? 'text-emerald-600'
                            : 'text-slate-400 group-hover:text-slate-700 group-hover:scale-110'
                        }`}
                      />
                      <span className="truncate">{link.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Logout Action aligned with sidebar elements */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:translate-x-1 active:scale-[0.98] transition-all duration-150 ease-out cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-rose-600 group-hover:-translate-x-0.5 transition-all duration-150 ease-out" />
          <span className="truncate">{t('btn_sign_out', 'Sign Out')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar - Docked above the full-width bottom footer */}
      <aside className="fixed top-0 bottom-10 left-0 w-64 z-30 hidden md:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] z-10 h-full shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
