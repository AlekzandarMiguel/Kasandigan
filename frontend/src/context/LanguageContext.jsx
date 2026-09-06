import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    brand_tagline: 'A community you can rely on',
    maramag_lgu: 'Municipality of Maramag, Bukidnon',
    maramag_command: 'LGU Maramag Municipal Command Center',
    nav_home: 'Dashboard',
    nav_requests: 'Assistance Requests',
    nav_skills: 'My Skills & Badges',
    nav_resources: 'Community Resources',
    nav_announcements: 'Announcements',
    nav_certificate: 'Official Certificate',
    nav_triage: 'Triage Desk',
    nav_reports: 'DILG Report',
    btn_request_help: 'Request Assistance',
    btn_en_route: 'I am En Route',
    btn_in_progress: 'Start Work',
    btn_complete: 'Complete Work',
    btn_chat: 'Ticket Chat',
    btn_reschedule: 'Propose Reschedule',
    btn_borrow_tool: 'Borrow Barangay Tool',
    btn_inspect_id: 'Inspect ID Document',
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
    alert_emergency_title: 'MDRRMO Municipal Emergency Bulletin',
    status_open: 'Open for Helpers',
    status_matched: 'Helper Matched',
    status_accepted: 'Assigned',
    status_en_route: 'En Route',
    status_in_progress: 'In Progress',
    status_completed: 'Completed',
    status_cancelled: 'Cancelled',
  },
  ceb: {
    brand_tagline: 'Usa ka komunidad nga imong masaligan',
    maramag_lgu: 'Lungsod sa Maramag, Bukidnon',
    maramag_command: 'LGU Maramag Municipal Command Center',
    nav_home: 'Dashboard',
    nav_requests: 'Mga Hangyo sa Tabang',
    nav_skills: 'Akong Kahanas ug Badges',
    nav_resources: 'Gipaambit nga mga Gamit',
    nav_announcements: 'Mga Pahibalo',
    nav_certificate: 'Opisyal nga Sertipiko',
    nav_triage: 'Triage Desk sa Barangay',
    nav_reports: 'DILG Report',
    btn_request_help: 'Mangayo og Tabang',
    btn_en_route: 'Padulong Na Ko',
    btn_in_progress: 'Sugdan ang Trabaho',
    btn_complete: 'Humanon ang Trabaho',
    btn_chat: 'Pakig-chat sa Helper',
    btn_reschedule: 'Hangyo og Usab nga Oras',
    btn_borrow_tool: 'Maghulam og Gamit sa Barangay',
    btn_inspect_id: 'Tan-awa ang ID Dokumento',
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
    alert_emergency_title: 'MDRRMO Pasidaan sa Emerhensiya',
    status_open: 'Bukas sa mga Helper',
    status_matched: 'Naay Nakit-an nga Helper',
    status_accepted: 'Nakatakda Na',
    status_en_route: 'Padulong Na',
    status_in_progress: 'Ginatrabaho Na',
    status_completed: 'Nahuman Na',
    status_cancelled: 'Gikanselar',
  },
  fil: {
    brand_tagline: 'Isang komunidad na maaasahan mo',
    maramag_lgu: 'Bayan ng Maramag, Bukidnon',
    maramag_command: 'LGU Maramag Municipal Command Center',
    nav_home: 'Dashboard',
    nav_requests: 'Mga Kahilingan ng Tulong',
    nav_skills: 'Aking Kasanayan at Badges',
    nav_resources: 'Kagamitan ng Barangay',
    nav_announcements: 'Mga Anunsyo',
    nav_certificate: 'Opisyal na Sertipiko',
    nav_triage: 'Triage Desk ng Barangay',
    nav_reports: 'DILG Report',
    btn_request_help: 'Humingi ng Tulong',
    btn_en_route: 'Papunta Na Ako',
    btn_in_progress: 'Simulan ang Trabaho',
    btn_complete: 'Tapusin ang Trabaho',
    btn_chat: 'Kausapin ang Helper',
    btn_reschedule: 'I-reschedule ang Oras',
    btn_borrow_tool: 'Humiram ng Gamit sa Barangay',
    btn_inspect_id: 'Suriin ang ID Dokumento',
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
    alert_emergency_title: 'MDRRMO Babala sa Emerhensya',
    status_open: 'Bukas sa mga Helper',
    status_matched: 'May Nahanap na Helper',
    status_accepted: 'Nakatalaga Na',
    status_en_route: 'Papunta Na',
    status_in_progress: 'Ginagawa Na',
    status_completed: 'Tapos Na',
    status_cancelled: 'Kinansela',
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

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
