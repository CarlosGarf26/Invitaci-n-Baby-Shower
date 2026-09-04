import { useState, useEffect, useMemo, type FormEvent } from 'react';
import {
  X,
  Lock,
  LogOut,
  Download,
  Trash2,
  Users,
  Baby,
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  User as UserIcon,
  Eye,
  EyeOff,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { motion } from 'motion/react';
import { subscribeToRsvps, deleteRsvp, subscribeToGenderPoll, resetGenderPoll } from '../firebase';
import { RsvpRecord } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Credentials defined by the host
const TARGET_USER_NORMALIZED = 'bebe';
const TARGET_PASS_NORMALIZED = 'saiyajin';

export function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return (
      localStorage.getItem('host_auth_session') === 'true' ||
      sessionStorage.getItem('host_auth_session') === 'true'
    );
  });
  const [userInput, setUserInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [rsvps, setRsvps] = useState<RsvpRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDay, setFilterDay] = useState<'all' | 'viernes' | 'sabado'>('all');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [pollStats, setPollStats] = useState<{ boyVotes: number; girlVotes: number }>({ boyVotes: 0, girlVotes: 0 });
  const [isResettingPoll, setIsResettingPoll] = useState(false);

  // Subscribe to live RSVPs and Poll when authorized
  useEffect(() => {
    if (!isOpen || !isAuthorized) {
      if (!isAuthorized) {
        setRsvps([]);
      }
      return;
    }

    setIsLoading(true);
    setDataError(null);
    const unsubscribeRsvps = subscribeToRsvps(
      records => {
        setRsvps(records);
        setIsLoading(false);
      },
      err => {
        console.error('Error fetching RSVPs:', err);
        setDataError(
          'No se pudieron cargar las confirmaciones en tiempo real. Por favor recarga la página.'
        );
        setIsLoading(false);
      }
    );

    const unsubscribePoll = subscribeToGenderPoll(data => {
      setPollStats({ boyVotes: data.boyVotes, girlVotes: data.girlVotes });
    });

    return () => {
      unsubscribeRsvps();
      unsubscribePoll();
    };
  }, [isOpen, isAuthorized]);

  // Handle Credentials Submit
  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Normalize user string (strip accents and lowercase)
    const normalizedUser = userInput
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const normalizedPass = passwordInput.trim().toLowerCase();

    if (normalizedUser === TARGET_USER_NORMALIZED && normalizedPass === TARGET_PASS_NORMALIZED) {
      setIsAuthorized(true);
      if (rememberMe) {
        localStorage.setItem('host_auth_session', 'true');
      } else {
        sessionStorage.setItem('host_auth_session', 'true');
      }
      setUserInput('');
      setPasswordInput('');
      setLoginError(null);
    } else {
      setLoginError('Usuario o contraseña incorrectos. Por favor verifica tus credenciales.');
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    localStorage.removeItem('host_auth_session');
    sessionStorage.removeItem('host_auth_session');
    setRsvps([]);
  };

  // Confirm and delete an RSVP record
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la confirmación de "${name}"?`)) return;

    try {
      setIsDeletingId(id);
      await deleteRsvp(id);
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Hubo un error al eliminar el registro.');
    } finally {
      setIsDeletingId(null);
    }
  };

  // Reset gender poll count
  const handleResetPoll = async () => {
    if (!window.confirm('¿Deseas reiniciar a cero (0 - 0) el conteo de votos de niño y niña?')) return;
    try {
      setIsResettingPoll(true);
      await resetGenderPoll();
      // Also clear local counts stored for the admin device
      localStorage.removeItem('baby_shower_poll_device_v2');
      localStorage.removeItem('baby_shower_poll_v1');
      alert('¡Conteo de votos reiniciado a 0 exitosamente!');
    } catch (err) {
      console.error('Error resetting poll:', err);
      alert('Hubo un problema al reiniciar el conteo.');
    } finally {
      setIsResettingPoll(false);
    }
  };

  // Metrics calculations
  const stats = useMemo(() => {
    let totalAdults = 0;
    let totalChildren = 0;
    let fridayCount = 0;
    let saturdayCount = 0;

    rsvps.forEach(r => {
      if (r.status !== 'declined') {
        totalAdults += Number(r.adults) || 0;
        totalChildren += Number(r.children) || 0;
        if (r.arrivalDay === 'viernes') fridayCount++;
        else saturdayCount++;
      }
    });

    return {
      totalGuests: totalAdults + totalChildren,
      totalAdults,
      totalChildren,
      totalFamilies: rsvps.length,
      fridayCount,
      saturdayCount,
    };
  }, [rsvps]);

  // Filtered RSVPs
  const filteredRsvps = useMemo(() => {
    return rsvps.filter(r => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDay = filterDay === 'all' || r.arrivalDay === filterDay;
      return matchesSearch && matchesDay;
    });
  }, [rsvps, searchQuery, filterDay]);

  // Export CSV
  const handleExportCSV = () => {
    if (rsvps.length === 0) {
      alert('No hay confirmaciones para exportar todavía.');
      return;
    }

    const headers = [
      'Familia / Invitado',
      'Adultos',
      'Niños',
      'Total Personas',
      'Día de Llegada',
      'Estado',
      'Mensaje / Deseos',
      'Fecha Registro',
    ];

    const rows = rsvps.map(r => [
      `"${(r.name || '').replace(/"/g, '""')}"`,
      r.adults,
      r.children,
      Number(r.adults) + Number(r.children),
      r.arrivalDay === 'viernes' ? 'Viernes 20' : 'Sábado 21',
      r.status === 'declined' ? 'Declinó' : 'Confirmado',
      `"${(r.notes || '').replace(/"/g, '""')}"`,
      r.createdAt ? new Date(r.createdAt).toLocaleString('es-MX') : '',
    ]);

    // Add UTF-8 BOM so Excel opens accents properly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `confirmaciones_baby_shower_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#FAF7F2] w-full max-w-3xl max-h-[90vh] rounded-3xl border border-[#E4D9C8] shadow-2xl flex flex-col overflow-hidden text-[#4A3E30]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8DEC9] bg-[#F4EDE2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8DAC5] flex items-center justify-center text-[#745E43]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-comfortaa text-[#4A3E30]">
                Panel de Confirmaciones
              </h2>
              <p className="text-[11px] text-[#867562]">
                Base de datos de invitados en vivo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthorized && (
              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar sesión"
                className="p-2 rounded-xl text-[#7B6A56] hover:bg-[#EAE0D0] transition-colors flex items-center gap-1 text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#7B6A56] hover:bg-[#EAE0D0] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {!isAuthorized ? (
            /* Login Form */
            <div className="max-w-md mx-auto py-6 space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EFE5D5] flex items-center justify-center text-[#775F44] shadow-xs">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold font-comfortaa text-[#4A3E30]">
                  Acceso de Anfitriones
                </h3>
                <p className="text-xs text-[#82715F] leading-relaxed">
                  Ingresa con tu usuario y contraseña de anfitrión para ver la lista de invitados y descargar el reporte.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 bg-[#FBE9E7] border border-[#FFCCBC] rounded-2xl text-xs text-[#C62828] flex items-start gap-2.5 text-left animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{loginError}</span>
                </div>
              )}

              {/* User & Password form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
                {/* Username Input */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-[#665440]">
                    Usuario
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#988775]" />
                    <input
                      type="text"
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      placeholder="Ej. Bebé"
                      autoFocus
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-[#D9CDBC] text-xs sm:text-sm text-[#4E4133] placeholder:text-[#A89885] focus:outline-none focus:ring-2 focus:ring-[#BAA58A] shadow-xs"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-[#665440]">
                    Contraseña
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#988775]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      required
                      className="w-full pl-10 pr-11 py-3 bg-white rounded-2xl border border-[#D9CDBC] text-xs sm:text-sm text-[#4E4133] placeholder:text-[#A89885] focus:outline-none focus:ring-2 focus:ring-[#BAA58A] shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#988775] hover:text-[#5E4C38] transition-colors p-1"
                      title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me checkbox */}
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D9CDBC] text-[#6B553D] focus:ring-[#BAA58A] cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-xs text-[#7A6956] cursor-pointer select-none">
                    Recordar acceso en este dispositivo
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#6B553D] hover:bg-[#58442F] active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all shadow-md mt-2 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Entrar al Panel de Anfitriones</span>
                </button>
              </form>
            </div>
          ) : (
            /* Dashboard View */
            <div className="space-y-5">
              {dataError && (
                <div className="p-3.5 bg-[#FBE9E7] border border-[#FFCCBC] rounded-2xl text-xs text-[#C62828] flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{dataError}</span>
                </div>
              )}

              {/* Summary Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-white rounded-2xl border border-[#E6DBCA] shadow-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8B7A68] mb-1">
                    <Users className="w-3.5 h-3.5 text-[#A2886C]" />
                    <span>Total Asistentes</span>
                  </div>
                  <div className="text-2xl font-bold font-comfortaa text-[#4A3E30]">
                    {stats.totalGuests}
                  </div>
                  <div className="text-[10px] text-[#968673] mt-0.5">
                    {stats.totalFamilies} familias registradas
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-[#E6DBCA] shadow-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8B7A68] mb-1">
                    <Users className="w-3.5 h-3.5 text-[#5C7D8A]" />
                    <span>Adultos</span>
                  </div>
                  <div className="text-2xl font-bold font-comfortaa text-[#5C7D8A]">
                    {stats.totalAdults}
                  </div>
                  <div className="text-[10px] text-[#968673] mt-0.5">Invitados mayores</div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-[#E6DBCA] shadow-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8B7A68] mb-1">
                    <Baby className="w-3.5 h-3.5 text-[#9E6B80]" />
                    <span>Niños</span>
                  </div>
                  <div className="text-2xl font-bold font-comfortaa text-[#9E6B80]">
                    {stats.totalChildren}
                  </div>
                  <div className="text-[10px] text-[#968673] mt-0.5">Pequeños invitados</div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-[#E6DBCA] shadow-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8B7A68] mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#70845B]" />
                    <span>Llegada</span>
                  </div>
                  <div className="text-xs font-bold text-[#4A3E30] space-y-0.5 mt-1">
                    <div>🌄 Viernes 20: <span className="text-[#70845B]">{stats.fridayCount}</span></div>
                    <div>☀️ Sábado 21: <span className="text-[#967C56]">{stats.saturdayCount}</span></div>
                  </div>
                </div>
              </div>

              {/* Gender Poll Status & Reset Card */}
              <div className="p-3.5 bg-[#FAF3EA] rounded-2xl border border-[#E8DCCB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-lg border border-[#E5DAC8] shrink-0">
                    👶
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#554636]">
                      Votación de Género en vivo
                    </h4>
                    <p className="text-[11px] text-[#7A6A57]">
                      🍼 Team Niño: <span className="font-bold text-[#3B6998]">{pollStats.boyVotes}</span> &nbsp;|&nbsp; 🎀 Team Niña: <span className="font-bold text-[#A84B68]">{pollStats.girlVotes}</span> &nbsp;(Total: {pollStats.boyVotes + pollStats.girlVotes})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isResettingPoll}
                  onClick={handleResetPoll}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#D5C5B1] hover:bg-[#F2E8DC] text-[#63513F] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
                  title="Reiniciar contador de votos a cero"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isResettingPoll ? 'animate-spin' : ''}`} />
                  <span>{isResettingPoll ? 'Reiniciando...' : 'Reiniciar votos a 0'}</span>
                </button>
              </div>

              {/* Filters & Export Bar */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between pt-1">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A8B78]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre de familia o invitado..."
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-[#DCD0BE] text-xs text-[#4E4133] focus:outline-none focus:ring-2 focus:ring-[#BAA58A]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {/* Filter day pill buttons */}
                  <div className="inline-flex p-1 bg-[#ECE3D4] rounded-xl text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setFilterDay('all')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        filterDay === 'all'
                          ? 'bg-white text-[#4A3E30] shadow-xs font-bold'
                          : 'text-[#817260] hover:text-[#4A3E30]'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterDay('viernes')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        filterDay === 'viernes'
                          ? 'bg-white text-[#4A3E30] shadow-xs font-bold'
                          : 'text-[#817260] hover:text-[#4A3E30]'
                      }`}
                    >
                      Viernes
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterDay('sabado')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        filterDay === 'sabado'
                          ? 'bg-white text-[#4A3E30] shadow-xs font-bold'
                          : 'text-[#817260] hover:text-[#4A3E30]'
                      }`}
                    >
                      Sábado
                    </button>
                  </div>

                  {/* Export CSV button */}
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-3 py-2 rounded-xl bg-[#4CAF50] hover:bg-[#43A047] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                    title="Descargar lista completa en Excel / CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Excel</span>
                  </button>
                </div>
              </div>

              {/* Guest list */}
              {isLoading ? (
                <div className="py-12 text-center text-[#8C7B68] space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#A58E74]" />
                  <p className="text-xs">Cargando confirmaciones en tiempo real...</p>
                </div>
              ) : filteredRsvps.length === 0 ? (
                <div className="py-12 text-center bg-white rounded-2xl border border-[#E9DFCF] p-6 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#BAA58A] mx-auto opacity-70" />
                  <h4 className="text-sm font-bold text-[#554635]">No hay confirmaciones aún</h4>
                  <p className="text-xs text-[#8A7966] max-w-xs mx-auto">
                    {searchQuery
                      ? 'No se encontraron resultados con ese criterio de búsqueda.'
                      : 'Las confirmaciones que los invitados envíen a través de la invitación aparecerán aquí inmediatamente.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="text-[11px] font-semibold text-[#877663] px-1">
                    Mostrando {filteredRsvps.length} de {rsvps.length} registro(s)
                  </div>

                  <div className="space-y-2">
                    {filteredRsvps.map(rsvp => {
                      const totalPersons = Number(rsvp.adults) + Number(rsvp.children);
                      const isViernes = rsvp.arrivalDay === 'viernes';

                      return (
                        <div
                          key={rsvp.id}
                          className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E8DEC9] shadow-xs hover:border-[#D5C5AC] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-[#46392B] font-comfortaa">
                                {rsvp.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4EDE2] text-[#715E49] border border-[#E5DAC8]">
                                👥 {totalPersons} persona{totalPersons !== 1 ? 's' : ''} ({rsvp.adults} adultos, {rsvp.children} niños)
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  isViernes
                                    ? 'bg-[#EBF3E8] text-[#3E6B34] border-[#CCE0C7]'
                                    : 'bg-[#FFF8E7] text-[#8C6D23] border-[#F4E3B2]'
                                }`}
                              >
                                {isViernes ? '🌄 Llegada Viernes 20' : '☀️ Llegada Sábado 21'}
                              </span>
                            </div>

                            {rsvp.notes && (
                              <p className="text-xs text-[#6F604F] bg-[#FAF7F2] p-2 rounded-xl border border-[#EDE3D3] italic">
                                "{rsvp.notes}"
                              </p>
                            )}

                            <div className="text-[10px] text-[#9D8E7D] flex items-center gap-2">
                              {rsvp.createdAt && (
                                <span>
                                  Registrado: {new Date(rsvp.createdAt).toLocaleString('es-MX', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleDelete(rsvp.id, rsvp.name)}
                              disabled={isDeletingId === rsvp.id}
                              title="Eliminar confirmación"
                              className="p-2 rounded-xl text-[#A08F7E] hover:text-[#D32F2F] hover:bg-[#FFEBEE] transition-colors disabled:opacity-50"
                            >
                              {isDeletingId === rsvp.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-[#D32F2F]" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 border-t border-[#E8DEC9] bg-[#F7EFE4] text-center text-[11px] text-[#8C7B67] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>🔒 Panel seguro con sincronización en tiempo real de Firebase Firestore</span>
          {isAuthorized ? (
            <span className="font-semibold text-[#66543F]">Anfitrión: Bebé (Sesión activa)</span>
          ) : (
            <span className="font-medium text-[#66543F]">Acceso reservado a los anfitriones</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
