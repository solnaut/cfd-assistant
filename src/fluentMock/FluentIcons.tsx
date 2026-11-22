import type { ReactNode } from 'react'

type IconRenderer = () => ReactNode

const iconRenderers = {
  mesh: () => (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" fill="#d8f0ef" stroke="#0d7a72" strokeWidth="1.5" />
      <path d="M3 12h18M9 5v14M15 5v14" stroke="#189a90" strokeWidth="1.2" />
      <path d="M3 5l6 7 6-7 6 7M3 19l6-7 6 7 6-7" stroke="#0b5c56" strokeWidth="1.2" fill="none" />
    </>
  ),
  read: () => (
    <>
      <path d="M3 7h6.5l2 2H21v11H3z" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 3v9m-3-3 3 3 3-3" stroke="#0078d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  save: () => (
    <>
      <path d="M4 3h13l3 3v15H4z" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="8" y="3" width="8" height="6" fill="#ffffff" stroke="#1d4ed8" strokeWidth="1.2" />
      <rect x="7" y="13" width="10" height="8" fill="#93c5fd" stroke="#1e40af" strokeWidth="1.2" />
    </>
  ),
  export: () => (
    <>
      <path d="M11 7H4v13h13v-7" fill="#e0f2fe" stroke="#0369a1" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 12l8-8m-5 0h5v5" stroke="#ea580c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  info: () => (
    <>
      <circle cx="12" cy="12" r="9" fill="#dbeafe" stroke="#0078d4" strokeWidth="1.6" />
      <path d="M12 10.5v5.5" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1" fill="#1e3a8a" />
    </>
  ),
  scale: () => (
    <>
      <rect x="3" y="11" width="9" height="9" fill="#e2e8f0" stroke="#475569" strokeWidth="1.4" />
      <rect x="10" y="4" width="11" height="11" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
      <path d="M20 4 4 20" stroke="#ea580c" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  check: () => (
    <>
      <path d="M12 3l8 3.5v5.8c0 4.2-3.4 7.7-8 8.7-4.6-1-8-4.5-8-8.7V6.5z" fill="#dcfce7" stroke="#15803d" strokeWidth="1.5" />
      <path d="m8.2 12.2 2.7 2.8 5.2-5.7" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  quality: () => (
    <>
      <rect x="3" y="14" width="3.5" height="6" rx="0.5" fill="#ef4444" />
      <rect x="8" y="10" width="3.5" height="10" rx="0.5" fill="#f59e0b" />
      <rect x="13" y="7" width="3.5" height="13" rx="0.5" fill="#0ea5e9" />
      <rect x="18" y="4" width="3.5" height="16" rx="0.5" fill="#16a34a" />
      <path d="M2 21h20" stroke="#334155" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  merge: () => (
    <>
      <path d="M4 5v4q0 3 4 3h11M4 19v-4q0-3 4-3" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="m16 9 4 3-4 3" stroke="#ea580c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  separate: () => (
    <>
      <path d="M4 12h7q4 0 4-5V5M11 12q4 0 4 5v2" stroke="#0284c7" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      <path d="m12.5 7 2.5-3 2.5 3M12.5 17l2.5 3 2.5-3" stroke="#ea580c" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  adjacent: () => (
    <>
      <rect x="3" y="5" width="9" height="14" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="1.4" />
      <rect x="12" y="5" width="9" height="14" fill="#d1fae5" stroke="#047857" strokeWidth="1.4" />
      <path d="M9 12h6" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  remove: () => (
    <>
      <path d="M6 7h12l-1 14H7z" fill="#fee2e2" stroke="#b91c1c" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 7h16M9 7V4h6v3M10 10.5v6.5m4-6.5v6.5" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  replace: () => (
    <>
      <rect x="3" y="5" width="8" height="8" rx="1" fill="#e2e8f0" stroke="#475569" strokeWidth="1.4" />
      <rect x="13" y="11" width="8" height="8" rx="1" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.4" />
      <path d="M12 6h5l-1.5-2M12 18H7l1.5 2" stroke="#ea580c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  interface: () => (
    <>
      <rect x="3" y="5" width="6.5" height="14" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="1.4" />
      <rect x="14.5" y="5" width="6.5" height="14" fill="#fef3c7" stroke="#b45309" strokeWidth="1.4" />
      <path d="M12 4v3m0 3v4m0 3v3" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  direction: () => (
    <>
      <path d="M4 17l6-6 4 4 6-8" stroke="#0284c7" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M15 6h5v5" stroke="#ea580c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  dynamic: () => (
    <>
      <rect x="4" y="6" width="11" height="12" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.4" />
      <rect x="9" y="3" width="11" height="12" fill="#fef3c7" fillOpacity="0.65" stroke="#d97706" strokeWidth="1.4" />
      <path d="M4 6l11 12m0-12L4 18" stroke="#0369a1" strokeWidth="1.1" />
    </>
  ),
  gap: () => (
    <>
      <path d="M5 4v16M19 4v16" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 12h6m-4-2.5L8.5 12l2.5 2.5m2-5 2.5 2.5-2.5 2.5" stroke="#0078d4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  mark: () => (
    <>
      <path d="M5 21V4h14l-2 5 2 5H5" fill="#fee2e2" stroke="#dc2626" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M5 4v17" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  refine: () => (
    <>
      <rect x="3" y="3" width="18" height="18" fill="#ecfeff" stroke="#0e7490" strokeWidth="1.5" />
      <path d="M12 3v18M3 12h18" stroke="#0e7490" strokeWidth="1.4" />
      <path d="M7.5 3v9M3 7.5h9M16.5 12v9M12 16.5h9" stroke="#f59e0b" strokeWidth="1.3" />
    </>
  ),
  surface: () => (
    <>
      <path d="M3 15 15 5l6 4-12 10z" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m9 10 6 4" stroke="#0369a1" strokeWidth="1.2" />
    </>
  ),
  layers: () => (
    <>
      <path d="m12 4 9 4.5-9 4.5-9-4.5z" fill="#bbf7d0" stroke="#15803d" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="m3 12.5 9 4.5 9-4.5M3 16.5l9 4.5 9-4.5" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  energy: () => (
    <>
      <path d="M13.5 2.5 5 14h6l-1 7.5L19 10h-6z" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" strokeLinejoin="round" />
    </>
  ),
  viscous: () => (
    <>
      <path d="M3 7c3-3.5 5.5 3.5 9 0s6 3.5 9 0" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M3 12c3-3.5 5.5 3.5 9 0s6 3.5 9 0" stroke="#0ea5e9" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M3 17c3-3.5 5.5 3.5 9 0s6 3.5 9 0" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </>
  ),
  material: () => (
    <>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9Z" fill="#e0e7ff" stroke="#3730a3" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" stroke="#4f46e5" strokeWidth="1.4" fill="none" />
    </>
  ),
  methods: () => (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="7" y="4" width="3" height="4" rx="0.8" fill="#0078d4" />
      <rect x="14" y="10" width="3" height="4" rx="0.8" fill="#16a34a" />
      <rect x="9" y="16" width="3" height="4" rx="0.8" fill="#ea580c" />
    </>
  ),
  control: () => (
    <>
      <path d="M7 3v18M17 3v18" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="4" y="6" width="6" height="4" rx="1" fill="#0078d4" stroke="#0c4a6e" strokeWidth="1.1" />
      <rect x="14" y="14" width="6" height="4" rx="1" fill="#f59e0b" stroke="#92400e" strokeWidth="1.1" />
    </>
  ),
  init: () => (
    <>
      <path d="M19 8a8 8 0 1 0 1 8" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M19 3v5.5h-5.5" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M12 8v5l3 2" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </>
  ),
  run: () => (
    <>
      <circle cx="12" cy="12" r="9.5" fill="#dcfce7" stroke="#15803d" strokeWidth="1.4" />
      <path d="M9.5 7.5 17 12l-7.5 4.5z" fill="#16a34a" stroke="#14532d" strokeWidth="1.2" strokeLinejoin="round" />
    </>
  ),
  residual: () => (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1" fill="#ffffff" stroke="#64748b" strokeWidth="1.4" />
      <path d="M5 7l4 6 3-2 4 5 3 2" stroke="#dc2626" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M5 10l4 5 3-1 4 4 3 1" stroke="#0078d4" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </>
  ),
  contour: () => (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1.5" fill="#bae6fd" stroke="#0369a1" strokeWidth="1.4" />
      <path d="M4 13q7 0 7-5t9-3v15H4z" fill="#fde68a" />
      <path d="M7 20q8-3 8-8t5-2v10z" fill="#fca5a5" />
      <rect x="4" y="4" width="16" height="16" rx="1.5" fill="none" stroke="#1e3a8a" strokeWidth="1.3" />
    </>
  ),
  vectors: () => (
    <>
      <path d="M4 19 18 5m-5 0h5v5" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M3 12l6.5-6.5M12 21l6.5-6.5" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </>
  ),
  report: () => (
    <>
      <path d="M5 3h10l4 4v14H5z" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 3v5h5" stroke="#334155" strokeWidth="1.3" fill="#e2e8f0" />
      <path d="M8 12h8M8 16h6" stroke="#0078d4" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  search: () => (
    <>
      <circle cx="10.5" cy="10.5" r="6" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.7" />
      <path d="M15 15l6 6" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  pointer: () => (
    <>
      <path d="M5 3l13.5 9.5-6.5 1.2-3 6z" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  rotate: () => (
    <>
      <path d="M19 9a7.8 7.8 0 1 0 1 6" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M19 4v5h-5" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  pan: () => (
    <>
      <path d="M12 3v18M3 12h18" stroke="#0284c7" strokeWidth="1.7" strokeLinecap="round" />
      <path d="m9.5 6 2.5-3 2.5 3m-5 12 2.5 3 2.5-3M6 9.5 3 12l3 2.5m12-5 3 2.5-3 2.5" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  zoom: () => (
    <>
      <circle cx="10.5" cy="10.5" r="6" fill="#fef3c7" stroke="#b45309" strokeWidth="1.6" />
      <path d="M10.5 7.5v6m-3-3h6M15 15l5.5 5.5" stroke="#1e293b" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  fit: () => (
    <>
      <path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="8.5" y="8.5" width="7" height="7" fill="#bae6fd" stroke="#0369a1" strokeWidth="1.3" />
    </>
  ),
  chevron: () => (
    <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  guide: () => (
    <>
      <path d="M3 5h6l3 2 3-2h6v14h-6l-3 2-3-2H3z" fill="#fef3c7" stroke="#92400e" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 7v14" stroke="#92400e" strokeWidth="1.4" />
    </>
  ),
  expand: () => (
    <path d="m8 9 4-4 4 4m-8 6 4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  collapse: () => (
    <path d="m8 5 4 4 4-4m-8 14 4-4 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  multiphase: () => (
    <>
      <circle cx="7.5" cy="10" r="4" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.4" />
      <circle cx="15.5" cy="14.5" r="3.5" fill="#fde68a" stroke="#d97706" strokeWidth="1.4" />
      <circle cx="16.5" cy="6.5" r="2.5" fill="#bbf7d0" stroke="#15803d" strokeWidth="1.4" />
    </>
  ),
  radiation: () => (
    <>
      <circle cx="12" cy="12" r="3.2" fill="#fbbf24" stroke="#b45309" strokeWidth="1.4" />
      <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.2 2.2m8.4 8.4 2.2 2.2m0-12.8-2.2 2.2m-8.4 8.4-2.2 2.2" stroke="#ea580c" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  species: () => (
    <>
      <path d="M9 4h6M10 4v5l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V4" fill="#d1fae5" stroke="#047857" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 16h10" stroke="#059669" strokeWidth="1.4" />
    </>
  ),
  dpm: () => (
    <>
      <path d="M4 17c4-2 6-6 9-10m3-2-2 5-3-3z" stroke="#0284c7" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="7" cy="9" r="1.6" fill="#ea580c" />
      <circle cx="15" cy="16" r="1.6" fill="#16a34a" />
      <circle cx="18" cy="11" r="1.5" fill="#d97706" />
    </>
  ),
  acoustics: () => (
    <>
      <path d="M4 10v4h4l5 4V6l-5 4H4z" fill="#e0e7ff" stroke="#3730a3" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M16 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12" stroke="#0078d4" strokeWidth="1.7" strokeLinecap="round" fill="none" />
    </>
  ),
  battery: () => (
    <>
      <rect x="4" y="8" width="14" height="8" rx="1" fill="#dcfce7" stroke="#15803d" strokeWidth="1.5" />
      <rect x="18" y="10" width="2" height="4" fill="#334155" />
      <path d="m11 9.5-2 2.5h3l-2 2.5" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  solidification: () => (
    <>
      <path d="M12 3v18M5 8l14 8M19 8L5 16" stroke="#0284c7" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m9 5 3 2 3-2M9 19l3-2 3 2" stroke="#0369a1" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </>
  ),
  wallFilm: () => (
    <>
      <path d="M3 18h18" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 15c4-3 8 2 12-1s3-2 4-1" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </>
  ),
  udf: () => (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" fill="#f1f5f9" stroke="#475569" strokeWidth="1.4" />
      <path d="m8.5 9-3 3 3 3m7-6 3 3-3 3m-2.5-7-2 8" stroke="#7c3aed" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  expression: () => (
    <>
      <path d="M4.5 18c2 0 3-12 5-12s3 12 5 12" stroke="#0284c7" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      <path d="M14 11h6m-4 4 4-4-2 6" stroke="#ea580c" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </>
  ),
  parallel: () => (
    <>
      <rect x="4" y="5" width="6" height="5" rx="0.8" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="1.4" />
      <rect x="14" y="5" width="6" height="5" rx="0.8" fill="#bbf7d0" stroke="#15803d" strokeWidth="1.4" />
      <rect x="4" y="14" width="6" height="5" rx="0.8" fill="#fde68a" stroke="#b45309" strokeWidth="1.4" />
      <rect x="14" y="14" width="6" height="5" rx="0.8" fill="#ddd6fe" stroke="#6d28d9" strokeWidth="1.4" />
      <path d="M10 7.5h4M10 16.5h4" stroke="#475569" strokeWidth="1.4" />
    </>
  ),
  partition: () => (
    <>
      <rect x="4" y="4" width="8" height="7" fill="#bae6fd" stroke="#0369a1" strokeWidth="1.3" />
      <rect x="12" y="4" width="8" height="10" fill="#fde68a" stroke="#b45309" strokeWidth="1.3" />
      <rect x="4" y="11" width="8" height="9" fill="#bbf7d0" stroke="#15803d" strokeWidth="1.3" />
      <rect x="12" y="14" width="8" height="6" fill="#fecaca" stroke="#b91c1c" strokeWidth="1.3" />
    </>
  ),
  adjoint: () => (
    <>
      <path d="M4 16c4-9 12-9 16 0" stroke="#7c3aed" strokeWidth="1.8" fill="#ede9fe" />
      <path d="M12 4v4m-2.5-2L12 8.5 14.5 6" stroke="#ea580c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  parameter: () => (
    <>
      <path d="M4 7h10m4 0h2M4 12h4m4 0h8M4 17h12m4 0h0" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="13" y="5" width="3.5" height="4" rx="0.6" fill="#0078d4" />
      <rect x="7.5" y="10" width="3.5" height="4" rx="0.6" fill="#16a34a" />
      <rect x="15" y="15" width="3.5" height="4" rx="0.6" fill="#d97706" />
    </>
  ),
  workflow: () => (
    <>
      <rect x="4" y="4" width="7" height="4" rx="1" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.3" />
      <rect x="13" y="10" width="7" height="4" rx="1" fill="#bbf7d0" stroke="#15803d" strokeWidth="1.3" />
      <rect x="4" y="16" width="7" height="4" rx="1" fill="#fde68a" stroke="#b45309" strokeWidth="1.3" />
      <path d="M11 6h5v4M16 14v4h-5" stroke="#475569" strokeWidth="1.3" fill="none" />
    </>
  ),
  geometry: () => (
    <>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9Z" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 3v9l8-4.5M12 12L4 7.5" stroke="#475569" strokeWidth="1.3" fill="none" />
    </>
  ),
  boi: () => (
    <>
      <rect x="4" y="6" width="16" height="12" fill="#e2e8f0" stroke="#475569" strokeWidth="1.4" />
      <rect x="8.5" y="9" width="7" height="6" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" strokeDasharray="2 1" />
    </>
  ),
  boundaryLayer: () => (
    <>
      <path d="M4 18h16" stroke="#1e293b" strokeWidth="2" />
      <path d="M4 15h16M4 11.5h16M4 7.5h16" stroke="#0284c7" strokeWidth="1.4" />
    </>
  ),
  volumeMesh: () => (
    <>
      <rect x="4" y="5" width="16" height="14" fill="#d8f0ef" stroke="#0f766e" strokeWidth="1.5" />
      <path d="M10 5v14M15 5v14M4 11h16M4 15h16" stroke="#0d9488" strokeWidth="1.2" />
    </>
  ),
  improve: () => (
    <>
      <path d="M4 16l5-5 4 4 7-8" stroke="#16a34a" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M15 7h5v5" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  cutPlane: () => (
    <>
      <path d="M4 16l7-9 9 4-7 9z" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 12h18" stroke="#dc2626" strokeWidth="1.6" strokeDasharray="3 2" />
    </>
  ),
  switchMode: () => (
    <>
      <path d="M4 8h13l-3-3M20 16H7l3 3" stroke="#0078d4" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  camera: () => (
    <>
      <path d="M4 7h4l2-2h4l2 2h4v12H4z" fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
    </>
  ),
  checkCase: () => (
    <>
      <path d="M9 5H5v14h14V5h-4M9 3h6v4H9z" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
      <path d="m8.5 13 2.5 2.5L16 10" stroke="#16a34a" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  fluxes: () => (
    <>
      <path d="M4 8h12m-3-3 3 3-3 3" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M20 16H8m3-3-3 3 3 3" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  forces: () => (
    <>
      <path d="M12 4v11m-4-3.5L12 15.5l4-4" stroke="#dc2626" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M4 20h16" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  pathlines: () => (
    <>
      <path d="M4 17c4-8 6-2 10-8s4-2 6-4" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M4 12c4-5 6 0 10-5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M17 5h3v3" stroke="#0284c7" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </>
  ),
  limits: () => (
    <>
      <path d="M4 5h16M4 19h16" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 8v8m-3-5 3-3 3 3m-6 2 3 3 3-3" stroke="#0284c7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  help: () => (
    <>
      <circle cx="12" cy="12" r="9" fill="#dbeafe" stroke="#0078d4" strokeWidth="1.6" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.8 2.1c-.9.5-1.3 1-1.3 2" stroke="#1e3a8a" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="17" r="1" fill="#1e3a8a" />
    </>
  ),
} satisfies Record<string, IconRenderer>

export type IconName = keyof typeof iconRenderers

const toolIcons: Record<string, IconName> = {
  'read-case': 'read',
  'write-case': 'save',
  'file-read-menu': 'read',
  'file-write-menu': 'save',
  'file-data-quantities': 'report',
  export: 'export',
  import: 'read',
  preferences: 'control',
  'switch-to-meshing': 'switchMode',
  'switch-to-solution': 'switchMode',
  'file-case': 'read',
  'file-session': 'save',
  mesh: 'mesh',
  zone: 'layers',
  interface: 'interface',
  'mesh-model': 'dynamic',
  adapt: 'refine',
  surface: 'surface',
  'physics-solver': 'control',
  'physics-models': 'multiphase',
  'physics-materials': 'material',
  'physics-zones': 'volumeMesh',
  'ud-udf': 'udf',
  'ud-fields': 'expression',
  'solution-runtype': 'dynamic',
  'solution-reports': 'report',
  'solution-monitor': 'residual',
  'solution-setup': 'methods',
  'solution-init': 'init',
  'solution-activities': 'save',
  'solution-run': 'run',
  'results-graphics': 'contour',
  'results-plots': 'residual',
  'results-surfaces': 'surface',
  'results-reports': 'fluxes',
  'view-camera': 'camera',
  'view-appearance': 'layers',
  'parallel-partition': 'partition',
  'design-adjoint': 'adjoint',
  'design-opt': 'dynamic',
  'parameters-manage': 'parameter',
  'help-learn': 'guide',
  'mesh-display': 'mesh',
  'mesh-info': 'info',
  'mesh-scale': 'scale',
  'mesh-check': 'check',
  'mesh-quality': 'quality',
  'mesh-reorder': 'improve',
  'mesh-smooth': 'improve',
  'mesh-polyhedra': 'volumeMesh',
  'zone-merge': 'merge',
  'zone-separate': 'separate',
  'zone-adjacency': 'adjacent',
  'zone-delete': 'remove',
  'zone-replace': 'replace',
  'zone-append': 'merge',
  'zone-transform': 'scale',
  'interface-mesh': 'interface',
  'interface-orient': 'direction',
  'interface-overset': 'interface',
  'dynamic-mesh': 'dynamic',
  'gap-model': 'gap',
  'adapt-mark': 'mark',
  'adapt-refine': 'refine',
  'adapt-controls': 'control',
  'domain-registers': 'mark',
  'surface-create': 'surface',
  'surface-manage': 'layers',
  'physics-general': 'control',
  'physics-units': 'scale',
  'physics-operating': 'control',
  'physics-gravity': 'direction',
  'physics-reference': 'parameter',
  'model-multiphase': 'multiphase',
  'model-energy': 'energy',
  'model-viscous': 'viscous',
  'model-radiation': 'radiation',
  'model-species': 'species',
  'model-dpm': 'dpm',
  'model-solidification': 'solidification',
  'model-acoustics': 'acoustics',
  'model-wall-film': 'wallFilm',
  'model-battery': 'battery',
  'model-heat-exchanger': 'energy',
  materials: 'material',
  'materials-database': 'material',
  'materials-fluent-db': 'material',
  'zones-cell': 'volumeMesh',
  'zones-boundary': 'interface',
  'udf-interpreted': 'udf',
  'udf-compiled': 'udf',
  'udf-hooks': 'udf',
  'udf-udm': 'parameter',
  'udf-cff': 'expression',
  'udf-expressions': 'expression',
  'udf-demand': 'run',
  'run-steady': 'run',
  'run-transient': 'dynamic',
  'report-defs': 'report',
  'report-new-menu': 'report',
  'report-plots': 'residual',
  'report-files': 'save',
  'convergence-conditions': 'check',
  methods: 'methods',
  controls: 'control',
  equations: 'expression',
  limits: 'limits',
  'cell-registers': 'mark',
  initialize: 'init',
  'initialize-std': 'init',
  patch: 'refine',
  'initialize-fmg': 'init',
  autosave: 'save',
  'execute-commands': 'udf',
  'data-sampling': 'quality',
  'check-case': 'checkCase',
  run: 'run',
  residuals: 'residual',
  'results-mesh': 'mesh',
  contours: 'contour',
  vectors: 'vectors',
  pathlines: 'pathlines',
  'particle-tracks': 'dpm',
  scene: 'geometry',
  'xy-plot': 'residual',
  histogram: 'quality',
  fft: 'viscous',
  'plane-surface': 'surface',
  'iso-surface': 'layers',
  'results-surface-create': 'surface',
  'results-surface-manage': 'layers',
  'fluxes-report': 'fluxes',
  'forces-report': 'forces',
  'surface-integrals': 'report',
  'volume-integrals': 'volumeMesh',
  'sim-report': 'report',
  'view-iso': 'camera',
  'view-front': 'camera',
  'view-back': 'camera',
  'view-top': 'camera',
  'view-bottom': 'camera',
  'view-left': 'camera',
  'view-right': 'camera',
  'view-fit': 'fit',
  'view-display': 'layers',
  'view-lights': 'radiation',
  'view-colormap': 'contour',
  'view-reset': 'fit',
  'parallel-processes': 'parallel',
  'parallel-network': 'parallel',
  'parallel-timer': 'info',
  'parallel-auto-partition': 'partition',
  'parallel-manual-partition': 'partition',
  'parallel-check-partition': 'check',
  'parallel-gpu': 'parallel',
  'design-adjoint-obs': 'adjoint',
  'design-adjoint-methods': 'methods',
  'design-adjoint-run': 'run',
  'design-morphing': 'dynamic',
  'design-points': 'parameter',
  'param-input': 'parameter',
  'param-output': 'parameter',
  'param-table': 'report',
  'param-expressions': 'expression',
  'help-walkthrough': 'guide',
  'help-troubleshoot': 'help',
  'help-calculators': 'expression',
  'help-formulas': 'guide',
  'help-tui': 'info',
  'help-meshing': 'switchMode',
  reports: 'report',
  select: 'pointer',
  rotate: 'rotate',
  pan: 'pan',
  zoom: 'zoom',
  style: 'layers',
  fit: 'fit',
  'cut-plane': 'cutPlane',
  // Outline tree nodes
  'tree-general': 'control',
  'tree-models': 'multiphase',
  'tree-materials': 'material',
  'tree-motion-definitions': 'rotate',
  'tree-cell-zone-conditions': 'volumeMesh',
  'tree-boundary-conditions': 'interface',
  'tree-mesh-interfaces': 'adjacent',
  'tree-auxiliary-geometry': 'geometry',
  'tree-dynamic-mesh': 'dynamic',
  'tree-reference-values': 'parameter',
  'tree-reference-frames': 'direction',
  'tree-named-expressions': 'expression',
  'tree-curvilinear-coordinates': 'pathlines',
  'tree-methods': 'methods',
  'tree-controls': 'control',
  'tree-report-definitions': 'report',
  'tree-monitors': 'residual',
  'tree-cell-registers': 'mark',
  'tree-mesh-adaptation': 'refine',
  'tree-initialization': 'init',
  'tree-calculation-activities': 'save',
  'tree-run-calculation': 'run',
  'tree-surfaces': 'surface',
  'tree-graphics': 'contour',
  'tree-plots': 'residual',
  'tree-dashboard': 'quality',
  'tree-animations': 'camera',
  'tree-reports': 'fluxes',
  'tree-parameters-controls': 'parameter',
  'tree-simulation-report': 'report',
}

export function FluentIcon({ name, controlId }: { name?: IconName; controlId?: string }) {
  const icon =
    name ??
    toolIcons[controlId ?? ''] ??
    toolIcons[(controlId ?? '').replace(/^(ribbon|graphics|meshing-ribbon)-/, '')] ??
    'guide'

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconRenderers[icon]()}
    </svg>
  )
}
