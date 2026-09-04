import { useState, useEffect, useMemo } from 'react';
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
  ExternalLink,
} from 'lucide-react';
import { motion } from 'motion/react';
import { auth, loginWithGoogle, logoutAdmin, subscribeToRsvps, deleteRsvp } from '../firebase';
import { RsvpRecord } from '../types';
import type { User } from 'firebase/auth';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AUTHORIZED_EMAIL = 'garfias.jc.260694@gmail.com';

export function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [rsvps, setRsvps] = useState<RsvpRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDay, setFilterDay] = useState<'all' | 'viernes' | 'sabado'>('all');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const isAuthorized = Boolean(
    currentUser && currentUser.email?.toLowerCase() === AUTHORIZED_EMAIL.toLowerCase()
  );

  // Subscribe to live RSVPs ONLY when modal is open AND user is authorized
  useEffect(() => {
    if (!isOpen || !isAuthorized) {
      if (!isAuthorized) {
        setRsvps([]);
      }
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    const unsubscribe = subscribeToRsvps(
      records => {
        setRsvps(records);
        setIsLoading(false);
      },
      err => {
        console.error('Error fetching RSVPs:', err);
        setAuthError(
          'No se pudieron cargar las confirmaciones en tiempo real. Verifica que tu cuenta tenga permisos de anfitrión.'
        );
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, isAuthorized]);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      // Gracefully ignore normal popup cancels or user closing the popup
      if (
        errorObj.code === 'auth/cancelled-popup-request' ||
        errorObj.code === 'auth/popup-closed-by-user'
      ) {
        return;
      }
      if (errorObj.code === 'auth/popup-blocked') {
        setAuthError(
          'La ventana emergente de Google fue bloqueada por el navegador. Prueba abriendo la aplicación en una pestaña nueva.'
        );
        return;
      }
      console.warn('Google login failed:', err);
      setAuthError(
        'No se pudo completar el inicio de sesión con Google. Si estás en la vista previa de la app, intenta abrirla en una pestaña nueva.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
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
            <div className="max-w-md mx-auto py-6 text-center space-y-5">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EFE5D5] flex items-center justify-center text-[#775F44] shadow-xs">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-bold font-comfortaa text-[#4A3E30]">
                  Acceso de Anfitriones
                </h3>
                <p className="text-xs text-[#82715F] mt-1.5 leading-relaxed">
                  Para proteger la privacidad de los invitados, el acceso a la base de datos oficial está reservado a la cuenta anfitriona autorizada.
                </p>
              </div>

              {/* Unauthorized user banner if logged in with wrong email */}
              {currentUser && currentUser.email?.toLowerCase() !== AUTHORIZED_EMAIL.toLowerCase() && (
                <div className="p-3.5 bg-[#FFF3E0] border border-[#FFE082] rounded-2xl text-xs text-[#E65100] text-left space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Cuenta no autorizada: {currentUser.email}</p>
                      <p className="mt-0.5 text-[11px] text-[#BF360C]">
                        Solo la cuenta organizadora <strong>{AUTHORIZED_EMAIL}</strong> tiene permisos en Firebase Firestore.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2 px-3 bg-white border border-[#FFD54F] rounded-xl font-bold text-xs text-[#E65100] hover:bg-[#FFF8E1] transition-colors"
                  >
                    Cerrar sesión e ingresar con {AUTHORIZED_EMAIL}
                  </button>
                </div>
              )}

              {authError && (
                <div className="p-3.5 bg-[#FBE9E7] border border-[#FFCCBC] rounded-2xl text-xs text-[#C62828] flex items-start gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Google Sign In Button */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  disabled={isLoggingIn}
                  onClick={handleGoogleLogin}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white border-2 border-[#DCD0BE] hover:border-[#BAA58A] hover:bg-[#FDFBF7] disabled:opacity-70 text-xs sm:text-sm font-bold text-[#4E4133] shadow-xs flex items-center justify-center gap-3 transition-all"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-[#7D6B58]" />
                      <span>Conectando con Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Iniciar sesión con Google</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-[#8C7B68]">
                  Cuenta autorizada: <span className="font-semibold text-[#5A4B3A]">{AUTHORIZED_EMAIL}</span>
                </p>
              </div>

              {/* Fallback to open in standalone tab in case preview iframe blocks popups */}
              <div className="pt-3 border-t border-[#EAE0D0]">
                <button
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank', 'noopener,noreferrer')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#7B6955] hover:text-[#4A3D2E] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>¿Tienes problemas con la ventana emergente? Abrir en pestaña nueva</span>
                </button>
              </div>
            </div>
          ) : (
            /* Dashboard View */
            <div className="space-y-5">
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
          {currentUser?.email ? (
            <span className="font-medium text-[#66543F]">Sesión: {currentUser.email}</span>
          ) : (
            <span className="font-medium text-[#66543F]">Anfitrión: {AUTHORIZED_EMAIL}</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
