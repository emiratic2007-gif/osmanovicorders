import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Appointment } from '../types';
import { Search, Filter, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('appointments')
      .select('*');

    if (error) {
      console.error('Error fetching appointments:', error);
      setError(error.message);
    } else {
      // Sort in memory to avoid column name issues with Supabase
      const sortedData = (data || []).sort((a, b) => {
        const dateA = new Date(a.preferred_date || a.created_at || 0).getTime();
        const dateB = new Date(b.preferred_date || b.created_at || 0).getTime();
        return dateB - dateA;
      });
      setAppointments(sortedData);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
    } else {
      setAppointments(appointments.map(app => 
        app.id === id ? { ...app, status: newStatus as Appointment['status'] } : app
      ));
    }
    setUpdatingId(null);
  };

  // Stats
  const totalOrders = appointments.length;
  const pendingOrders = appointments.filter(a => a.status === 'pending').length;
  const completedOrders = appointments.filter(a => a.status === 'completed').length;
  const cancelledOrders = appointments.filter(a => a.status === 'cancelled').length;

  // Filter & Search
  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = 
      app.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone?.includes(searchQuery) ||
      app.vehicle_make_model?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30"><CheckCircle2 size={12} /> Završeno</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30"><Clock size={12} /> Na čekanju</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30"><XCircle size={12} /> Otkazano</span>;
      case 'confirmed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30"><CheckCircle2 size={12} /> Potvrđeno</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300 border border-white/20">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd.MM.yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-10 relative z-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Pregled</h1>
        <p className="text-sm text-gray-400 mt-1">Upravljajte svojim narudžbama i terminima.</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/20 text-red-200 rounded-xl border border-red-500/30 flex items-start gap-3 backdrop-blur-md">
          <XCircle className="shrink-0 mt-0.5 text-red-400" size={18} />
          <div>
            <h3 className="font-medium text-red-300">Greška pri učitavanju narudžbi</h3>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-sm mt-2 text-red-300/80">
              Ovo je vjerovatno zbog Supabase Row Level Security (RLS) pravila. Molimo osigurajte da vaša Supabase tabela dozvoljava čitanje za prijavljene korisnike.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Ukupno narudžbi', value: totalOrders, color: 'text-white' },
          { label: 'Na čekanju', value: pendingOrders, color: 'text-amber-400' },
          { label: 'Završeno', value: completedOrders, color: 'text-green-400' },
          { label: 'Otkazano', value: cancelledOrders, color: 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-4 md:p-5 rounded-2xl">
            <p className="text-xs md:text-sm font-medium text-gray-400">{stat.label}</p>
            <p className={`text-2xl md:text-3xl font-bold mt-1 md:mt-2 ${stat.color}`}>{loading ? '-' : stat.value}</p>
          </div>
        ))}
      </div>

      {/* Orders List */}
      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3 justify-between items-center bg-black/20">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Pretraži kupce, vozila..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder-gray-500"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-gray-400 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-black/40 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all appearance-none pr-8 relative"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
            >
              <option value="all">Svi statusi</option>
              <option value="pending">Na čekanju</option>
              <option value="confirmed">Potvrđeno</option>
              <option value="completed">Završeno</option>
              <option value="cancelled">Otkazano</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-black/40 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Kupac</th>
                <th className="px-6 py-4 font-medium tracking-wider">Vozilo i usluga</th>
                <th className="px-6 py-4 font-medium tracking-wider">Datum</th>
                <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                <th className="px-6 py-4 font-medium tracking-wider text-right">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mb-2"></div>
                    <p>Učitavanje narudžbi...</p>
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <Search className="text-gray-400" size={24} />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-1">Nisu pronađene narudžbe</h3>
                      {searchQuery || statusFilter !== 'all' ? (
                        <p className="text-gray-400 text-sm">
                          Nismo mogli pronaći narudžbe koje odgovaraju vašim filterima.
                        </p>
                      ) : (
                        <div className="text-gray-400 text-sm space-y-2">
                          <p>Vaša tabela termina je trenutno prazna ili skrivena.</p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{app.customer_name || 'Nepoznato'}</div>
                      <div className="text-gray-400 mt-0.5">{app.email}</div>
                      <div className="text-gray-400">{app.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{app.vehicle_make_model}</div>
                      <div className="text-gray-400 mt-0.5">{app.service_requested}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {formatDate(app.preferred_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="relative inline-block text-left">
                        {updatingId === app.id ? (
                          <div className="flex items-center justify-end gap-2 text-sm text-gray-400">
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            Ažuriranje...
                          </div>
                        ) : (
                          <select
                            value={app.status || 'pending'}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="bg-black/50 border border-white/10 text-white text-xs rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2 appearance-none pr-8 cursor-pointer hover:bg-white/10 transition-colors"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                          >
                            <option value="pending">Na čekanju</option>
                            <option value="confirmed">Potvrđeno</option>
                            <option value="completed">Završeno</option>
                            <option value="cancelled">Otkazano</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-white/10">
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mb-2"></div>
              <p>Učitavanje narudžbi...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Search className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">Nisu pronađene narudžbe</h3>
              <p className="text-gray-400 text-sm">Prilagodite filtere ili provjerite bazu.</p>
            </div>
          ) : (
            filteredAppointments.map((app) => (
              <div key={app.id} className="p-4 space-y-3 hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-medium text-white">{app.customer_name || 'Nepoznato'}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{app.phone}</div>
                  </div>
                  <div className="shrink-0">{getStatusBadge(app.status)}</div>
                </div>
                <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                  <div className="text-sm font-medium text-white">{app.vehicle_make_model}</div>
                  <div className="text-gray-400 text-xs mt-1">{app.service_requested}</div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div className="text-xs text-gray-400 font-medium">{formatDate(app.preferred_date)}</div>
                  {updatingId === app.id ? (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Ažuriranje
                    </div>
                  ) : (
                    <select
                      value={app.status || 'pending'}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="bg-black/50 border border-white/10 text-white text-xs rounded-lg py-1.5 pl-2 pr-6 appearance-none focus:ring-red-500 focus:border-red-500"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                    >
                      <option value="pending">Na čekanju</option>
                      <option value="confirmed">Potvrđeno</option>
                      <option value="completed">Završeno</option>
                      <option value="cancelled">Otkazano</option>
                    </select>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
