import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { getCurrentPayrollPeriod, formatCurrency, formatDate } from '../utils/dateUtils';
import { Page } from '../App';
import { Icon, Icons } from '../components/ui/Icon';
import { Employee, EmployeeStatus } from '../types';

type TimeFilter = 'current' | 'previous' | '3m' | 'year' | 'custom';

const LineChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    if (!data || data.length === 0) return null;

    const width = 550;
    const height = 250;
    const padding = 40;
    const dataMin = Math.min(...data.map(d => d.value));
    const dataMax = Math.max(...data.map(d => d.value));
    const yRange = dataMax - dataMin === 0 ? 1 : dataMax - dataMin;
    
    // Handle case with a single data point to prevent division by zero
    const getX = (index: number) => {
        if (data.length === 1) return padding + (width - padding * 2) / 2;
        return padding + (index / (data.length - 1)) * (width - padding * 2);
    }
    const getY = (value: number) => (height - padding) - ((value - dataMin) / yRange) * (height - padding * 2);

    const linePath = data.map((point, i) => {
        const x = getX(i);
        const y = getY(point.value);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const yAxisLabels = [];
    const numLabels = 5;
    for (let i = 0; i <= numLabels; i++) {
        const value = dataMin + (yRange / numLabels) * i;
        yAxisLabels.push({ value, y: getY(value) });
    }

    return (
        <div className="h-[300px] p-4 border rounded-lg bg-slate-50 flex justify-center items-center">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                {yAxisLabels.map((label, i) => (
                    <g key={i}>
                        <line x1={padding} y1={label.y} x2={width - padding} y2={label.y} stroke="#e2e8f0" strokeWidth="1" />
                        <text x={padding - 10} y={label.y + 3} textAnchor="end" fontSize="10" fill="#64748b">
                            {label.value > 999 ? `${(label.value / 1000).toFixed(0)}k` : label.value.toFixed(0)}
                        </text>
                    </g>
                ))}
                {data.map((point, i) => (
                     <text key={i} x={getX(i)} y={height - padding + 15} textAnchor="middle" fontSize="10" fill="#64748b">{point.label}</text>
                ))}
                {data.length > 1 && <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2" />}
                {data.map((point, i) => (
                    <g key={i} className="group">
                        <circle cx={getX(i)} cy={getY(point.value)} r="10" fill="transparent" />
                        <circle cx={getX(i)} cy={getY(point.value)} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" className="group-hover:r-6 transition-all" />
                         <g className="opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:-translate-y-0">
                            <rect x={getX(i) - 40} y={getY(point.value) - 40} width="80" height="25" rx="4" fill="#1e293b" />
                            <text x={getX(i)} y={getY(point.value) - 25} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                                {formatCurrency(point.value)}
                            </text>
                        </g>
                    </g>
                ))}
            </svg>
        </div>
    );
};

const ChartModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: { label: string; value: number }[];
}> = ({ isOpen, onClose, title, data }) => {
    const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
    if (!isOpen) return null;
    
    const maxValue = Math.max(0, ...data.map(d => d.value));
    const chartHeight = 250; 

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold text-slate-800 flex-1">{title} - Historial</h2>
                     <div className="flex items-center bg-slate-100 rounded-lg p-1">
                        <button onClick={() => setChartType('bar')} className={`p-1.5 rounded-md ${chartType === 'bar' ? 'bg-white shadow' : 'text-slate-500 hover:bg-slate-200'}`} aria-label="Ver como gráfico de barras">
                            <Icon icon={Icons.chartBar} className="w-5 h-5"/>
                        </button>
                        <button onClick={() => setChartType('line')} className={`p-1.5 rounded-md ${chartType === 'line' ? 'bg-white shadow' : 'text-slate-500 hover:bg-slate-200'}`} aria-label="Ver como gráfico de línea">
                            <Icon icon={Icons.chartLine} className="w-5 h-5"/>
                        </button>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100" aria-label="Cerrar modal"><Icon icon={Icons.x} className="w-6 h-6"/></button>
                </div>
                {chartType === 'bar' ? (
                     <div className="h-[300px] p-4 border rounded-lg bg-slate-50 flex justify-around items-end gap-2">
                        {data.map((item, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                <div className="absolute -top-8 bg-slate-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {formatCurrency(item.value)}
                                </div>
                                <div 
                                    className="w-full bg-brand-400 hover:bg-brand-500 rounded-t-md transition-colors"
                                    style={{ height: maxValue > 0 ? `${(item.value / maxValue) * chartHeight}px` : '0px' }}
                                ></div>
                                <span className="text-xs text-slate-500 mt-2 absolute -bottom-5">{item.label}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <LineChart data={data} />
                )}
            </div>
        </div>
    );
};

const Sparkline: React.FC<{ data: number[]; className?: string }> = ({ data, className }) => {
    if (!data || data.length < 2) return null;
    const width = 100;
    const height = 30;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min === 0 ? 1 : max - min;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none">
            <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                points={points}
            />
        </svg>
    );
};

const KpiCard: React.FC<{ 
    title: string; 
    value: string; 
    trendValue: string; 
    trendDirection: 'up' | 'down' | 'neutral';
    sparklineData: number[];
    onClick: () => void;
}> = ({ title, value, trendValue, trendDirection, sparklineData, onClick }) => {
    const trendColor = trendDirection === 'up' ? 'text-green-600' : trendDirection === 'down' ? 'text-red-600' : 'text-slate-500';
    const TrendIcon = trendDirection === 'up' ? Icons.arrowUp : Icons.arrowDown;

    return (
        <button
            onClick={onClick}
            className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between text-left hover:shadow-md hover:border-brand-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-150"
        >
            <div>
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-slate-500">{title}</h3>
                    <Icon icon={Icons.chartBar} className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
                </div>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                 <div className="flex items-center text-sm mt-1">
                    <span className={`flex items-center font-semibold ${trendColor}`}>
                         {trendDirection !== 'neutral' && <Icon icon={TrendIcon} className="w-4 h-4 mr-1"/>}
                        {trendValue}
                    </span>
                    <span className="text-slate-400 ml-1">vs. Periodo Ant.</span>
                </div>
            </div>
            <div className="mt-4 h-8">
                <Sparkline data={sparklineData} className={trendColor} />
            </div>
        </button>
    );
};

interface DashboardProps {
    onNavigate: (page: Page) => void;
    paymentStatus: Record<number, boolean>;
    employees: Employee[];
    simulatedDate: Date;
}

const generateMockData = (base: number, length: number, variance: number) => Array.from({ length }, () => base + (Math.random() - 0.5) * variance);
const toInputDate = (date: Date) => date.toISOString().split('T')[0];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, paymentStatus, employees, simulatedDate }) => {
    const period = getCurrentPayrollPeriod(simulatedDate);
    const activeEmployees = employees.filter(e => e.status === EmployeeStatus.Active).length;
    
    const [sales, setSales] = useState(5432109.87);
    const [salesInput, setSalesInput] = useState(sales.toString());
    const [isUpdatingSales, setIsUpdatingSales] = useState(false);
    const [salesUpdateSuccess, setSalesUpdateSuccess] = useState(false);
    
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('current');
    const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const [modalData, setModalData] = useState<{ title: string; data: { label: string; value: number }[] } | null>(null);

     useEffect(() => {
        const today = toInputDate(simulatedDate);
        const oneMonthAgo = toInputDate(new Date(new Date(today).setMonth(new Date(today).getMonth() - 1)));
        setCustomDateRange({ start: oneMonthAgo, end: today });
    }, [simulatedDate]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleUpdateSales = () => {
        const newSales = parseFloat(salesInput);
        if (!isNaN(newSales) && newSales > 0) {
            setIsUpdatingSales(true);
            setSalesUpdateSuccess(false);
            setTimeout(() => {
                setSales(newSales);
                setIsUpdatingSales(false);
                setSalesUpdateSuccess(true);
                setTimeout(() => setSalesUpdateSuccess(false), 2000);
            }, 1500);
        } else {
            alert('Por favor, ingresa un número válido.');
        }
    };
    
    const { currentKpis, historicalKpis } = useMemo(() => {
        let periods = 1;
        switch(timeFilter) {
            case 'previous': periods = 2; break;
            case '3m': periods = 6; break;
            case 'year': periods = 24; break;
            case 'custom':
                const start = new Date(customDateRange.start);
                const end = new Date(customDateRange.end);
                if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                    const diffTime = Math.abs(end.getTime() - start.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    periods = Math.max(1, Math.floor(diffDays / 15));
                } else {
                    periods = 1;
                }
                break;
            default: periods = 1;
        }

        const labels = Array.from({ length: periods }, (_, i) => `P-${periods - i}`);

        const baseCost = 1234567;
        const baseNet = 987654;
        const baseSales = 5432109;
        const baseEmployees = 50;

        const allData = {
            costo: generateMockData(baseCost, periods, baseCost * 0.1),
            neto: generateMockData(baseNet, periods, baseNet * 0.1),
            ventas: generateMockData(baseSales, periods, baseSales * 0.2),
            activos: generateMockData(baseEmployees, periods, 5).map(Math.round),
        };

        const currentIdx = timeFilter === 'previous' ? Math.max(0, periods - 2) : periods - 1;
        
        const currentValues = {
            costo: allData.costo[currentIdx],
            neto: allData.neto[currentIdx],
            ventas: timeFilter === 'current' ? sales : allData.ventas[currentIdx],
            indice: (allData.costo[currentIdx] / ((timeFilter === 'current' ? sales : allData.ventas[currentIdx]) || 1)) * 100,
            activos: activeEmployees,
        };

        const historical = {
            costo: { title: "Costo Empresa", data: allData.costo.map((value, i) => ({ label: labels[i], value })) },
            neto: { title: "Pago Neto", data: allData.neto.map((value, i) => ({ label: labels[i], value })) },
            ventas: { title: "Ventas", data: allData.ventas.map((value, i) => ({ label: labels[i], value })) },
            indice: { title: "Índice Nómina/Venta", data: allData.costo.map((c, i) => ({ label: labels[i], value: (c / (allData.ventas[i] || 1)) * 100 })) },
            activos: { title: "Empleados Activos", data: allData.activos.map((value, i) => ({ label: labels[i], value })) },
        };
        
        return { currentKpis: currentValues, historicalKpis: historical };
    }, [timeFilter, sales, activeEmployees, customDateRange]);

    const handleOpenModal = (kpi: keyof typeof historicalKpis) => {
        setModalData(historicalKpis[kpi]);
    };

    const paidCount = Object.keys(paymentStatus).length;
    const progress = activeEmployees > 0 ? (paidCount / activeEmployees) * 100 : 0;
    const isPayrollClosed = progress === 100;

    const payrollStatusText = isPayrollClosed ? 'Cerrada (Pendiente de Avance)' : 'Abierta';
    const payrollStatusColor = isPayrollClosed ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
    const payrollStatusDotColor = isPayrollClosed ? 'bg-blue-500' : 'bg-green-500 animate-pulse';
    
    const timeFilterOptions: { id: TimeFilter; label: string }[] = [
        { id: 'current', label: 'Periodo Actual' },
        { id: 'previous', label: 'Periodo Anterior' },
        { id: '3m', label: 'Últimos 3 Meses' },
        { id: 'year', label: 'Último Año' },
    ];
    
    const selectedFilterLabel = useMemo(() => {
        if (timeFilter === 'custom' && customDateRange.start && customDateRange.end) {
            try {
                const start = formatDate(customDateRange.start);
                const end = formatDate(customDateRange.end);
                return `${start} - ${end}`;
            } catch (e) { return "Rango Personalizado"; }
        }
        return timeFilterOptions.find(opt => opt.id === timeFilter)?.label;
    }, [timeFilter, customDateRange]);

    const handleApplyCustomRange = () => {
        if (customDateRange.start && customDateRange.end) {
            setTimeFilter('custom');
            setIsFilterOpen(false);
        } else {
            alert('Por favor selecciona una fecha de inicio y fin.');
        }
    };

    return (
        <>
            <div className="p-6 sm:p-8 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     <div>
                        <h2 className="text-2xl font-bold text-slate-800">Panel General</h2>
                        <p className="text-slate-500">
                            Nómina — {period.month} {period.year} — Q{period.quincena}
                        </p>
                     </div>
                     <div className="flex items-center gap-4 flex-wrap">
                        <div className="relative" ref={filterRef}>
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-semibold text-slate-700 hover:bg-slate-50 min-w-[200px] justify-between"
                            >
                                <Icon icon={Icons.calendar} className="w-5 h-5 text-slate-500" />
                                <span className="flex-1 text-left">{selectedFilterLabel}</span>
                                <Icon icon={Icons.chevronDown} className={`w-4 h-4 text-slate-500 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isFilterOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 border border-slate-200 z-10">
                                    {timeFilterOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setTimeFilter(option.id);
                                                setIsFilterOpen(false);
                                            }}
                                            className={`flex items-center w-full px-4 py-2 text-sm text-left ${timeFilter === option.id ? 'bg-slate-100 text-brand-600 font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                    <div className="border-t my-1"></div>
                                    <div className="px-4 pt-2 pb-1 text-xs font-semibold text-slate-500">Rango Personalizado</div>
                                    <div className="p-2 space-y-2">
                                        <div>
                                            <label className="text-xs text-slate-600" htmlFor="start-date">Desde:</label>
                                            <input type="date" id="start-date" value={customDateRange.start} onChange={e => setCustomDateRange(d => ({...d, start: e.target.value}))} className="w-full text-sm border-slate-300 rounded-md shadow-sm"/>
                                        </div>
                                         <div>
                                            <label className="text-xs text-slate-600" htmlFor="end-date">Hasta:</label>
                                            <input type="date" id="end-date" value={customDateRange.end} onChange={e => setCustomDateRange(d => ({...d, end: e.target.value}))} className="w-full text-sm border-slate-300 rounded-md shadow-sm"/>
                                        </div>
                                        <button onClick={handleApplyCustomRange} className="w-full text-center px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700">
                                            Aplicar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                         <div className="flex items-center gap-2">
                             <span className="text-sm font-semibold text-slate-600">Estado:</span>
                             <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${payrollStatusColor}`}>
                                <span className={`w-2 h-2 mr-2 rounded-full ${payrollStatusDotColor}`}></span>
                                {payrollStatusText}
                            </span>
                         </div>
                     </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                     <KpiCard title="Costo Empresa" value={formatCurrency(currentKpis.costo)} trendValue="-1.2%" trendDirection="down" sparklineData={historicalKpis.costo.data.map(d => d.value)} onClick={() => handleOpenModal('costo')} />
                     <KpiCard title="Pago Neto" value={formatCurrency(currentKpis.neto)} trendValue="+0.8%" trendDirection="up" sparklineData={historicalKpis.neto.data.map(d => d.value)} onClick={() => handleOpenModal('neto')} />
                     <KpiCard title="Ventas" value={formatCurrency(currentKpis.ventas)} trendValue="+2.5%" trendDirection="up" sparklineData={historicalKpis.ventas.data.map(d => d.value)} onClick={() => handleOpenModal('ventas')} />
                     <KpiCard title="Índice Nómina/Venta" value={`${currentKpis.indice.toFixed(2)}%`} trendValue="-0.5%" trendDirection="down" sparklineData={historicalKpis.indice.data.map(d => d.value)} onClick={() => handleOpenModal('indice')} />
                     <KpiCard title="Empleados Activos" value={currentKpis.activos.toString()} trendValue="+2" trendDirection="up" sparklineData={historicalKpis.activos.data.map(d => d.value)} onClick={() => handleOpenModal('activos')} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                         <h3 className="text-lg font-semibold text-slate-800 mb-4">Progreso de Nómina</h3>
                         <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600">Completado</span>
                                <span className="font-semibold text-slate-800">{paidCount} / {activeEmployees}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                <div className="bg-brand-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                            </div>
                         </div>
                         <div className="mt-6 flex space-x-3">
                            <button 
                                onClick={() => onNavigate('payroll')}
                                className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
                                {isPayrollClosed ? 'Revisar Nómina' : (progress > 0 ? 'Continuar Nómina' : 'Procesar Nómina')}
                            </button>
                         </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                         <h3 className="text-lg font-semibold text-slate-800 mb-2">Ventas del Periodo</h3>
                         <p className="text-sm text-slate-500 mb-4">Ingresa el total de ventas para calcular el índice de nómina.</p>
                         <div className="flex gap-2">
                            <input
                                type="number"
                                value={salesInput}
                                onChange={(e) => setSalesInput(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                                placeholder="Ej. 5000000"
                            />
                             <button
                                onClick={handleUpdateSales}
                                disabled={isUpdatingSales || salesUpdateSuccess}
                                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg whitespace-nowrap transition-colors duration-200 ${
                                    isUpdatingSales ? 'bg-slate-400 cursor-not-allowed' : 
                                    salesUpdateSuccess ? 'bg-green-500' : 
                                    'bg-brand-600 hover:bg-brand-700'
                                }`}
                            >
                                {isUpdatingSales ? 'Actualizando...' : salesUpdateSuccess ? '¡Guardado!' : 'Actualizar'}
                            </button>
                         </div>
                    </div>
                </div>
            </div>
             <ChartModal 
                isOpen={!!modalData}
                onClose={() => setModalData(null)}
                title={modalData?.title || ''}
                data={modalData?.data || []}
            />
        </>
    );
};