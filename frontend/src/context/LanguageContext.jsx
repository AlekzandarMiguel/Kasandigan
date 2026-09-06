import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Brand & Jurisdiction
    brand_tagline: 'A community you can rely on',
    maramag_lgu: 'Municipality of Maramag, Bukidnon',
    maramag_command: 'LGU Maramag Municipal Command Center',

    // Section Headers
    sec_saas_admin: 'SaaS Administration',
    sec_bulletins_notices: 'Bulletins & Notices',
    sec_analytics_security: 'Analytics & Security',
    sec_tenant_overview: 'Tenant Overview',
    sec_assistance_taxonomies: 'Assistance & Taxonomies',
    sec_safety_governance: 'Safety & Governance',
    sec_staff_operations: 'Staff Operations',
    sec_community_moderation: 'Community Moderation',
    sec_community_aid: 'Community Aid',
    sec_helper_resources: 'Helper & Resources',

    // Navigation Links
    nav_dashboard: 'Dashboard',
    nav_barangay_tenants: 'Barangay Tenants',
    nav_user_directory: 'User Directory',
    nav_municipal_bulletins: 'Municipal Bulletins',
    nav_notifications: 'Notifications',
    nav_platform_reports: 'Platform Reports',
    nav_system_audit_logs: 'System Audit Logs',
    nav_system_settings: 'System Settings',
    nav_resident_directory: 'Resident Directory',
    nav_staff_management: 'Staff Management',
    nav_barangay_announcements: 'Barangay Announcements',
    nav_assistance_requests: 'Assistance Requests',
    nav_skills_taxonomy: 'Skills Taxonomy',
    nav_assistance_categories: 'Assistance Categories',
    nav_dilg_report: 'DILG Monthly Report',
    nav_resident_reports: 'Resident Reports',
    nav_activity_logs: 'Activity Logs',
    nav_barangay_settings: 'Barangay Settings',
    nav_staff_dashboard: 'Staff Dashboard',
    nav_resident_verifications: 'Resident Verifications',
    nav_barangay_notices: 'Barangay Notices',
    nav_community_requests: 'Community Requests',
    nav_triage_reports: 'Triage Reports',
    nav_request_help: 'Request Help',
    nav_my_assistance: 'My Assistance Activity',
    nav_barangay_bulletins: 'Barangay Bulletins',
    nav_personal_notifications: 'Personal Notifications',
    nav_skills_availability: 'Skills & Availability',
    nav_volunteer_certificate: 'Volunteer Certificate',
    nav_community_resources: 'Community Resources',
    nav_profile_settings: 'Profile & Settings',

    // User Roles
    role_platform_admin: 'Platform Administrator',
    role_barangay_admin: 'Barangay Administrator',
    role_barangay_staff: 'Barangay Staff Officer',
    role_resident: 'Verified Resident',

    // Action Buttons
    btn_sign_out: 'Sign Out',
    btn_sign_in: 'Sign In',
    btn_get_started: 'Get Started',
    btn_request_help: 'Request Assistance',
    btn_offer_skills: 'Offer My Skills',
    btn_broadcast_mdrrmo: 'Broadcast MDRRMO Alert',
    btn_filter: 'Filter',
    btn_search: 'Search',
    btn_submit: 'Submit',
    btn_cancel: 'Cancel',
    btn_save: 'Save Changes',
    btn_view_details: 'View Details',
    btn_approve: 'Approve',
    btn_reject: 'Reject',
    btn_print: 'Print / Save PDF',
    btn_back: 'Back',
    btn_en_route: 'I am En Route',
    btn_in_progress: 'Start Work',
    btn_complete: 'Complete Work',
    btn_chat: 'Ticket Chat',
    btn_reschedule: 'Propose Reschedule',
    btn_borrow_tool: 'Borrow Barangay Tool',
    btn_inspect_id: 'Inspect ID Document',

    // Workflow Stepper Steps
    step_filed_title: 'Request Filed',
    step_filed_desc: 'Ticket submitted to community pool',
    step_assigned_title: 'Helper Assigned',
    step_assigned_desc: 'Volunteer helper accepted the request',
    step_en_route_title: 'Helper En Route',
    step_en_route_desc: 'Traveling to citizen location in Maramag',
    step_in_progress_title: 'In Progress',
    step_in_progress_desc: 'Assistance actively underway',
    step_completed_title: 'Work Completed',
    step_completed_desc: 'Task finished with proof of completion',
    step_closed_title: 'Rated & Closed',
    step_closed_desc: 'Citizen feedback and star rating recorded',

    // Emergency & Status
    alert_emergency_title: 'MDRRMO Municipal Emergency Bulletin',
    status_open: 'Open for Helpers',
    status_matched: 'Helper Matched',
    status_accepted: 'Assigned',
    status_en_route: 'En Route',
    status_in_progress: 'In Progress',
    status_completed: 'Completed',
    status_cancelled: 'Cancelled',
    status_verified: 'Verified Resident',
    status_pending: 'Pending Verification',

    // Dashboard Banners
    resident_welcome_title: 'Welcome to Kasandigan',
    resident_welcome_subtitle: 'Your verified barangay mutual aid network in Maramag, Bukidnon',
    stat_active_requests: 'My Active Requests',
    stat_helping_requests: "Requests I'm Helping",
    stat_completed_assistance: 'Completed Assistance',
    stat_community_rating: 'Community Rating',
    stat_community_helpers: 'Community Helpers',
    stat_borrowable_resources: 'Borrowable Tools',
    stat_volunteer_hours: 'Volunteer Hours',

    // Footer & Trust
    footer_data_privacy: 'Data Privacy (RA 10173)',
    footer_hotlines: 'Support & Hotlines',
    footer_all_operational: 'All Systems Operational',
    footer_tagline: 'Deterministic Rule Engine • Multi-Tenant Logic Isolation',
  },

  ceb: {
    // Brand & Jurisdiction
    brand_tagline: 'Usa ka komunidad nga imong masaligan',
    maramag_lgu: 'Lungsod sa Maramag, Bukidnon',
    maramag_command: 'LGU Maramag Municipal Command Center',

    // Section Headers
    sec_saas_admin: 'Pagdumala sa SaaS',
    sec_bulletins_notices: 'Mga Pahibalo ug Pasidaan',
    sec_analytics_security: 'Analytics ug Seguridad',
    sec_tenant_overview: 'Kinatibuk-an sa Barangay',
    sec_assistance_taxonomies: 'Mga Tabang ug Kategorya',
    sec_safety_governance: 'Kaluwasan ug Pamamahala',
    sec_staff_operations: 'Operasyon sa Staff',
    sec_community_moderation: 'Pagdumala sa Komunidad',
    sec_community_aid: 'Tabang sa Komunidad',
    sec_helper_resources: 'Mga Helper ug Kagamitan',

    // Navigation Links
    nav_dashboard: 'Dashboard',
    nav_barangay_tenants: 'Mga Barangay',
    nav_user_directory: 'Listahan sa Gumagamit',
    nav_municipal_bulletins: 'Pahibalo sa Lungsod',
    nav_notifications: 'Mga Pahibalo',
    nav_platform_reports: 'Mga Report sa Plataporma',
    nav_system_audit_logs: 'Audit Logs sa Sistema',
    nav_system_settings: 'Mga Setting sa Sistema',
    nav_resident_directory: 'Listahan sa Residente',
    nav_staff_management: 'Pagdumala sa Staff',
    nav_barangay_announcements: 'Mga Pahibalo sa Barangay',
    nav_assistance_requests: 'Mga Hangyo sa Tabang',
    nav_skills_taxonomy: 'Kategorya sa Kahanas',
    nav_assistance_categories: 'Kategorya sa Tabang',
    nav_dilg_report: 'Bulang Report sa DILG',
    nav_resident_reports: 'Mga Reklamo sa Residente',
    nav_activity_logs: 'Talaan sa Kalihokan',
    nav_barangay_settings: 'Mga Setting sa Barangay',
    nav_staff_dashboard: 'Dashboard sa Staff',
    nav_resident_verifications: 'Beripikasyon sa Residente',
    nav_barangay_notices: 'Pahibalo sa Barangay',
    nav_community_requests: 'Mga Hangyo sa Komunidad',
    nav_triage_reports: 'Mga Report sa Triage',
    nav_request_help: 'Mangayo og Tabang',
    nav_my_assistance: 'Akong mga Kalihokan',
    nav_barangay_bulletins: 'Pahibalo sa Barangay',
    nav_personal_notifications: 'Personal nga Pahibalo',
    nav_skills_availability: 'Kahanas ug Eskedyul',
    nav_volunteer_certificate: 'Opisyal nga Sertipiko',
    nav_community_resources: 'Gipaambit nga Gamit',
    nav_profile_settings: 'Profile ug Setting',

    // User Roles
    role_platform_admin: 'Tigdumala sa Plataporma',
    role_barangay_admin: 'Tigdumala sa Barangay',
    role_barangay_staff: 'Opisyal sa Barangay Staff',
    role_resident: 'Beripikadong Residente',

    // Action Buttons
    btn_sign_out: 'Gawas',
    btn_sign_in: 'Sulod',
    btn_get_started: 'Magsugod',
    btn_request_help: 'Mangayo og Tabang',
    btn_offer_skills: 'Ipaambit ang Kahanas',
    btn_broadcast_mdrrmo: 'Pahibalo sa MDRRMO',
    btn_filter: 'Pili-a',
    btn_search: 'Pangitaa',
    btn_submit: 'Isumiter',
    btn_cancel: 'Kanselahon',
    btn_save: 'I-save ang Kausaban',
    btn_view_details: 'Tan-awa ang Detalye',
    btn_approve: 'Uyonan',
    btn_reject: 'Balibaran',
    btn_print: 'I-print / I-save',
    btn_back: 'Balik',
    btn_en_route: 'Padulong Na Ko',
    btn_in_progress: 'Sugdan ang Trabaho',
    btn_complete: 'Humanon ang Trabaho',
    btn_chat: 'Pakig-chat sa Helper',
    btn_reschedule: 'Hangyo og Usab nga Oras',
    btn_borrow_tool: 'Maghulam og Gamit',
    btn_inspect_id: 'Tan-awa ang Dokumento',

    // Workflow Stepper Steps
    step_filed_title: 'Napadala ang Hangyo',
    step_filed_desc: 'Nasumiter na ang hangyo sa barangay',
    step_assigned_title: 'Naay Gitudlo nga Helper',
    step_assigned_desc: 'Gidawat sa boluntaryo ang imong hangyo',
    step_en_route_title: 'Padulong Na ang Helper',
    step_en_route_desc: 'Nalarga na padulong sa imong purok sa Maramag',
    step_in_progress_title: 'Gihimo Na ang Trabaho',
    step_in_progress_desc: 'Ginatrabaho na sa kasamtangan',
    step_completed_title: 'Nahuman Na ang Tabang',
    step_completed_desc: 'Nahuman na uban ang ebidensya sa trabaho',
    step_closed_title: 'Narate ug Nasirado',
    step_closed_desc: 'Narekord na ang imong pasalamat ug grado',

    // Emergency & Status
    alert_emergency_title: 'MDRRMO Pasidaan sa Emerhensiya',
    status_open: 'Bukas sa mga Helper',
    status_matched: 'Naay Nakit-an nga Helper',
    status_accepted: 'Nakatakda Na',
    status_en_route: 'Padulong Na',
    status_in_progress: 'Ginatrabaho Na',
    status_completed: 'Nahuman Na',
    status_cancelled: 'Gikanselar',
    status_verified: 'Beripikadong Residente',
    status_pending: 'Nagpaabot og Beripikasyon',

    // Dashboard Banners
    resident_welcome_title: 'Maayong Pag-abot sa Kasandigan',
    resident_welcome_subtitle: 'Ang imong kasaligan nga tabang sa barangay sa Maramag, Bukidnon',
    stat_active_requests: 'Akong Aktibong mga Hangyo',
    stat_helping_requests: 'Mga Hangyo nga Akong Gitabangan',
    stat_completed_assistance: 'Nahuman nga Tabang',
    stat_community_rating: 'Grado sa Komunidad',
    stat_community_helpers: 'Mga Boluntaryong Helper',
    stat_borrowable_resources: 'Mahulam nga mga Gamit',
    stat_volunteer_hours: 'Oras sa Boluntaryo',

    // Footer & Trust
    footer_data_privacy: 'Seguridad sa Impormasyon (RA 10173)',
    footer_hotlines: 'Tabang ug mga Hotline',
    footer_all_operational: 'Maayo ang Tanang Sistema',
    footer_tagline: 'Nalain nga Arkitektura sa Matag Barangay',
  },

  fil: {
    // Brand & Jurisdiction
    brand_tagline: 'Isang komunidad na maaasahan mo',
    maramag_lgu: 'Bayan ng Maramag, Bukidnon',
    maramag_command: 'LGU Maramag Municipal Command Center',

    // Section Headers
    sec_saas_admin: 'Pangangasiwa ng SaaS',
    sec_bulletins_notices: 'Mga Anunsyo at Abiso',
    sec_analytics_security: 'Pagsusuri at Seguridad',
    sec_tenant_overview: 'Pangkalahatang Pananaw',
    sec_assistance_taxonomies: 'Mga Tulong at Kategorya',
    sec_safety_governance: 'Kaligtasan at Pamamahala',
    sec_staff_operations: 'Operasyon ng Kawani',
    sec_community_moderation: 'Pamamahala ng Komunidad',
    sec_community_aid: 'Tulong Pangkomunidad',
    sec_helper_resources: 'Mga Helper at Kagamitan',

    // Navigation Links
    nav_dashboard: 'Dashboard',
    nav_barangay_tenants: 'Mga Barangay',
    nav_user_directory: 'Talaan ng Gumagamit',
    nav_municipal_bulletins: 'Anunsyo ng Bayan',
    nav_notifications: 'Mga Abiso',
    nav_platform_reports: 'Mga Ulat ng Plataporma',
    nav_system_audit_logs: 'Mga Tala ng Sistema',
    nav_system_settings: 'Mga Setting ng Sistema',
    nav_resident_directory: 'Talaan ng Residente',
    nav_staff_management: 'Pamamahala ng Kawani',
    nav_barangay_announcements: 'Mga Anunsyo ng Barangay',
    nav_assistance_requests: 'Mga Kahilingan ng Tulong',
    nav_skills_taxonomy: 'Kategorya ng Kasanayan',
    nav_assistance_categories: 'Kategorya ng Tulong',
    nav_dilg_report: 'Buwanang Ulat ng DILG',
    nav_resident_reports: 'Ulat ng mga Residente',
    nav_activity_logs: 'Talaan ng Gawain',
    nav_barangay_settings: 'Mga Setting ng Barangay',
    nav_staff_dashboard: 'Dashboard ng Kawani',
    nav_resident_verifications: 'Beripikasyon ng Residente',
    nav_barangay_notices: 'Patalastas ng Barangay',
    nav_community_requests: 'Kahilingan ng Komunidad',
    nav_triage_reports: 'Ulat sa Triage',
    nav_request_help: 'Humingi ng Tulong',
    nav_my_assistance: 'Aking mga Gawain',
    nav_barangay_bulletins: 'Anunsyo ng Barangay',
    nav_personal_notifications: 'Personal na Abiso',
    nav_skills_availability: 'Kasanayan at Iskedyul',
    nav_volunteer_certificate: 'Opisyal na Sertipiko',
    nav_community_resources: 'Kagamitan ng Barangay',
    nav_profile_settings: 'Profile at Setting',

    // User Roles
    role_platform_admin: 'Tagapangasiwa ng Plataporma',
    role_barangay_admin: 'Tagapangasiwa ng Barangay',
    role_barangay_staff: 'Kawani ng Barangay',
    role_resident: 'Beripikadong Residente',

    // Action Buttons
    btn_sign_out: 'Mag-logout',
    btn_sign_in: 'Mag-login',
    btn_get_started: 'Magsimula',
    btn_request_help: 'Humingi ng Tulong',
    btn_offer_skills: 'Ibahagi ang Kasanayan',
    btn_broadcast_mdrrmo: 'I-broadcast ang MDRRMO Alert',
    btn_filter: 'Salain',
    btn_search: 'Maghanap',
    btn_submit: 'Isumite',
    btn_cancel: 'Kanselahin',
    btn_save: 'I-save ang Pagbabago',
    btn_view_details: 'Tingnan ang Detalye',
    btn_approve: 'Aprubahan',
    btn_reject: 'Tanggihan',
    btn_print: 'I-print / I-save',
    btn_back: 'Bumalik',
    btn_en_route: 'Papunta Na Ako',
    btn_in_progress: 'Simulan ang Trabaho',
    btn_complete: 'Tapusin ang Trabaho',
    btn_chat: 'Kausapin ang Helper',
    btn_reschedule: 'I-reschedule ang Oras',
    btn_borrow_tool: 'Humiram ng Gamit',
    btn_inspect_id: 'Suriin ang Dokumento',

    // Workflow Stepper Steps
    step_filed_title: 'Naisumite ang Kahilingan',
    step_filed_desc: 'Naisumite na sa listahan ng barangay',
    step_assigned_title: 'May Nakatalagang Helper',
    step_assigned_desc: 'Tinanggap ng boluntaryo ang kahilingan',
    step_en_route_title: 'Papunta Na ang Helper',
    step_en_route_desc: 'Bumibiyahe na patungo sa iyong purok sa Maramag',
    step_in_progress_title: 'Kasalukuyang Ginagawa',
    step_in_progress_desc: 'Kasalukuyang isinasagawa ang tulong',
    step_completed_title: 'Tapos Na ang Tulong',
    step_completed_desc: 'Natapos kalakip ang patunay ng gawa',
    step_closed_title: 'Na-rate at Sarado',
    step_closed_desc: 'Naitarak na ang iyong pagsusuri at pasasalamat',

    // Emergency & Status
    alert_emergency_title: 'MDRRMO Babala sa Emerhensya',
    status_open: 'Bukas sa mga Helper',
    status_matched: 'May Nahanap na Helper',
    status_accepted: 'Nakatalaga Na',
    status_en_route: 'Papunta Na',
    status_in_progress: 'Ginagawa Na',
    status_completed: 'Tapos Na',
    status_cancelled: 'Kinansela',
    status_verified: 'Beripikadong Residente',
    status_pending: 'Naghihintay ng Beripikasyon',

    // Dashboard Banners
    resident_welcome_title: 'Maligayang Pagdating sa Kasandigan',
    resident_welcome_subtitle: 'Ang iyong maaasahang tulong sa barangay sa Maramag, Bukidnon',
    stat_active_requests: 'Aking Aktibong mga Kahilingan',
    stat_helping_requests: 'Mga Kahilingang Aking Tinutulungan',
    stat_completed_assistance: 'Natapos na Tulong',
    stat_community_rating: 'Marka sa Komunidad',
    stat_community_helpers: 'Mga Boluntaryong Helper',
    stat_borrowable_resources: 'Mahihiram na Gamit',
    stat_volunteer_hours: 'Oras ng Pagboboluntaryo',

    // Footer & Trust
    footer_data_privacy: 'Seguridad ng Impormasyon (RA 10173)',
    footer_hotlines: 'Suporta at mga Hotline',
    footer_all_operational: 'Maayos ang Lahat ng Sistema',
    footer_tagline: 'Nahihiwalay na Arkitektura ng Bawat Barangay',
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('kasandigan_lang') || 'en';
  });

  const changeLanguage = (newLang) => {
    if (['en', 'ceb', 'fil'].includes(newLang)) {
      setLang(newLang);
      localStorage.setItem('kasandigan_lang', newLang);
    }
  };

  const t = (key, defaultText = '') => {
    return translations[lang]?.[key] || translations['en']?.[key] || defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
