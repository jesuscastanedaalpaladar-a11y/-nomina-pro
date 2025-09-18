
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Employee, Branch, EmployeeStatus } from '../types';
import { MOCK_BRANCHES } from '../constants';
import { Icon, Icons } from '../components/ui/Icon';
import { formatCurrency, formatDate } from '../utils/dateUtils';

// --- UTILITY & DATA GENERATION ---

// Helper to generate mock historical data since it's not present in the app's state
const generateHistoricalData = (employees: Employee[]) => {
    const data = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 15); // Mid-month
        const monthLabel = date.toLocaleString('es-MX', { month: 'short', year: 'numeric' });
        
        let monthCost = 0;
        let monthBonuses = 0;
        let hires = 0;
        let terminations = 0;
        let headcount = 0;
        const costByBranch: Record<number, number> = {};

        employees.forEach(emp => {
            const hireDate = new Date(emp.hire_date);
            // Rough termination date for archived employees for reporting purposes
            const terminationDate = emp.status === EmployeeStatus.Archived 
                ? new Date(hireDate.getTime() + (today.getTime() - hireDate.getTime()) * 0.8) 
                : null;
            
            const wasActive = hireDate <= date && (!terminationDate || terminationDate > date);

            if (wasActive) {
                headcount++;
                const bonus = emp.gross_salary * (Math.random() * 0.15); // Random bonus up to 15%
                const cost = emp.gross_salary + bonus;
                monthCost += cost;
                monthBonuses += bonus;
                costByBranch[emp.branch_id] = (costByBranch[emp.branch_id] || 0) + cost;
            }

            if (hireDate.getFullYear() === date.getFullYear() && hireDate.getMonth() === date.getMonth()) {
                hires++;
            }
             if (terminationDate && terminationDate.getFullYear() === date.getFullYear() && terminationDate.getMonth() === date.getMonth()) {
                terminations++;
            }
        });

        data.push({ date, monthLabel, monthCost, monthBonuses, hires, terminations, headcount, costByBranch });
    }
    return data;
};

// --- UI COMPONENTS ---

const KpiCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-medium text-slate-500 truncate">{title}</h3>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
);

const MultiSelectDropdown: React.FC<{
    options: { value: number; label: string }[];
    selected: number[];
    onChange: (selected: number[]) => void;
    placeholder: string;
}> = ({ options, selected, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (value: number) => {
        const newSelected = new Set(selected);
        if (newSelected.has(value)) {
            newSelected.delete(value);
        } else {
            newSelected.add(value);
        }
        onChange(Array.from(newSelected));
    };

    const label = selected.length > 0 ? `${selected.length} seleccionada(s)` : placeholder;

    return (
        <div className="relative w-full" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm"
            >
                {label}
                <Icon icon={Icons.chevronDown} className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-full bg-white rounded-md shadow-lg py-1 border border-slate-200 z-10 max-h-60 overflow-y-auto">
                    {options.map(option => (
                        <label key={option.value} className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                checked={selected.includes(option.value)}
                                onChange={() => toggleOption(option.value)}
                            />
                            <span className="ml-3">{option.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- CHART COMPONENTS ---

const BarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-slate-500">No hay datos para mostrar</div>;
    const maxValue = Math.max(0, ...data.map(d => d.value));
    return (
        <div className="h-[250px] p-4 flex justify-around items-end gap-2">
            {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div className="absolute -top-8 bg-slate-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {formatCurrency(item.value)}
                    </div>
                    <div
                        className="w-full bg-brand-400 hover:bg-brand-500 rounded-t-md transition-colors"
                        style={{ height: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%' }}
                    ></div>
                    <span className="text-xs text-slate-500 mt-2 text-center">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

const LineChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
     if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-slate-500">No hay datos para mostrar</div>;
    const width = 500, height = 250, padding = 40;
    const dataMin = Math.min(...data.map(d => d.value)), dataMax = Math.max(...data.map(d => d.value));
    const yRange = dataMax - dataMin === 0 ? 1 : dataMax - dataMin;
    
    const getX = (i: number) => padding + (i / (data.length - 1)) * (width - padding * 2);
    const getY = (v: number) => (height - padding) - ((v - dataMin) / yRange) * (height - padding * 2);

    const linePath = data.map((p, i) => `${i === 0 ? 'M' : 'L'}${getX(i)} ${getY(p.value)}`).join(' ');

    return (
        <div className="h-[250px] flex justify-center items-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2" />
            {data.map((point, i) => (
                <g key={i} className="group">
                    <circle cx={getX(i)} cy={getY(point.value)} r="10" fill="transparent" />
                    <circle cx={getX(i)} cy={getY(point.value)} r="4" fill="#3b82f6" className="group-hover:r-6 transition-all" />
                    <text x={getX(i)} y={height - padding + 15} textAnchor="middle" fontSize="10" fill="#64748b">{point.label}</text>
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <text x={getX(i)} y={getY(point.value) - 10} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1e293b">
                            {point.value % 1 === 0 ? point.value : formatCurrency(point.value)}
                        </text>
                    </g>
                </g>
            ))}
        </svg>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

export const ReportsPage: React.FC<{ employees: Employee[]; }> = ({ employees }) => {
    const [activeTab, setActiveTab] = useState<'payroll' | 'personnel'>('payroll');
    const [dateRangeFilter, setDateRangeFilter] = useState('last_12_months');
    const [branchFilter, setBranchFilter] = useState<number[]>([]);

    const historicalData = useMemo(() => generateHistoricalData(employees), [employees]);
    
    const filteredData = useMemo(() => {
        let data = historicalData;

        // Date Filter
        const today = new Date();
        let startDate = new Date(today.getFullYear() - 1, today.getMonth(), 1); // Default to last 12 months
        if (dateRangeFilter === 'last_3_months') {
            startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        } else if (dateRangeFilter === 'ytd') {
             startDate = new Date(today.getFullYear(), 0, 1);
        }
        data = data.filter(d => d.date >= startDate);

        // Branch Filter
        if (branchFilter.length > 0) {
            return data.map(monthData => {
                let monthCost = 0, monthBonuses = 0;
                const costByBranch: Record<number, number> = {};

                branchFilter.forEach(branchId => {
                    const cost = monthData.costByBranch[branchId] || 0;
                    monthCost += cost;
                    monthBonuses += cost * (Math.random() * 0.15); // Re-approximating bonuses
                    costByBranch[branchId] = cost;
                });

                // Headcount needs to be recalculated based on filtered branches
                const headcount = employees.filter(e => {
                     const hireDate = new Date(e.hire_date);
                    const wasActive = hireDate <= monthData.date && e.status === 'Activo';
                    return branchFilter.includes(e.branch_id) && wasActive;
                }).length;
                
                return { ...monthData, monthCost, monthBonuses, costByBranch, headcount };
            });
        }
        
        return data;
    }, [historicalData, dateRangeFilter, branchFilter, employees]);

    const kpis = useMemo(() => {
        const totalCost = filteredData.reduce((sum, d) => sum + d.monthCost, 0);
        const totalBonuses = filteredData.reduce((sum, d) => sum + d.monthBonuses, 0);
        const avgHeadcount = filteredData.reduce((sum, d) => sum + d.headcount, 0) / (filteredData.length || 1);
        const finalHeadcount = filteredData.length > 0 ? filteredData[filteredData.length - 1].headcount : 0;
        const totalHires = filteredData.reduce((sum, d) => sum + d.hires, 0);
        const totalTerminations = filteredData.reduce((sum, d) => sum + d.terminations, 0);

        return { totalCost, totalBonuses, avgHeadcount, finalHeadcount, totalHires, totalTerminations };
    }, [filteredData]);
    
    const handleDownloadCsv = useCallback(() => {
        if (filteredData.length === 0) return;
        
        const isPayroll = activeTab === 'payroll';
        const headers = isPayroll 
            ? ['Periodo', 'Costo Total', 'Bonos Pagados']
            : ['Periodo', 'Plantilla', 'Nuevos Ingresos', 'Bajas'];
            
        const rows = filteredData.map(d => isPayroll
            ? [d.monthLabel, d.monthCost.toFixed(2), d.monthBonuses.toFixed(2)]
            : [d.monthLabel, d.headcount, d.hires, d.terminations]
        );

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
            
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `reporte_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [filteredData, activeTab]);

    return (
        <div className="p-6 sm:p-8 space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Reportes</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border">
                <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Rango de Fechas</label>
                    <select value={dateRangeFilter} onChange={e => setDateRangeFilter(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm">
                        <option value="last_12_months">Últimos 12 meses</option>
                        <option value="last_3_months">Últimos 3 meses</option>
                        <option value="ytd">Año actual</option>
                    </select>
                </div>
                 <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Sucursal</label>
                     <MultiSelectDropdown
                        options={MOCK_BRANCHES.map(b => ({ value: b.id, label: b.name }))}
                        selected={branchFilter}
                        onChange={setBranchFilter}
                        placeholder="Todas las sucursales"
                    />
                </div>
            </div>
            
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('payroll')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'payroll' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Nómina</button>
                    <button onClick={() => setActiveTab('personnel')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'personnel' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Personal</button>
                </nav>
            </div>
            
            {activeTab === 'payroll' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <KpiCard title="Costo Total de Nómina" value={formatCurrency(kpis.totalCost)} />
                        <KpiCard title="Total en Bonos" value={formatCurrency(kpis.totalBonuses)} />
                        <KpiCard title="Costo Promedio Mensual" value={formatCurrency(kpis.totalCost / (filteredData.length || 1))} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-xl border shadow-sm">
                            <h3 className="font-semibold mb-2">Costo de Nómina Mensual</h3>
                            <LineChart data={filteredData.map(d => ({ label: d.monthLabel, value: d.monthCost }))} />
                        </div>
                        <div className="bg-white p-4 rounded-xl border shadow-sm">
                            <h3 className="font-semibold mb-2">Costo por Sucursal (Periodo)</h3>
                             <BarChart data={MOCK_BRANCHES.filter(b => branchFilter.length === 0 || branchFilter.includes(b.id)).map(branch => ({
                                label: branch.code,
                                value: filteredData.reduce((sum, d) => sum + (d.costByBranch[branch.id] || 0), 0)
                            }))} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'personnel' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <KpiCard title="Plantilla Actual" value={kpis.finalHeadcount.toString()} />
                        <KpiCard title="Plantilla Promedio" value={kpis.avgHeadcount.toFixed(1)} />
                        <KpiCard title="Nuevos Ingresos" value={kpis.totalHires.toString()} />
                        <KpiCard title="Bajas" value={kpis.totalTerminations.toString()} />
                    </div>
                     <div className="bg-white p-4 rounded-xl border shadow-sm">
                        <h3 className="font-semibold mb-2">Evolución de la Plantilla</h3>
                        <LineChart data={filteredData.map(d => ({ label: d.monthLabel, value: d.headcount }))} />
                    </div>
                </div>
            )}
            
             <div className="bg-white p-4 rounded-xl border shadow-sm">
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Datos del Reporte</h3>
                    <button onClick={handleDownloadCsv} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100">
                        <Icon icon={Icons.download} className="w-4 h-4" />
                        Descargar CSV
                    </button>
                 </div>
                <div className="max-h-80 overflow-y-auto">
                     <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 sticky top-0">
                            <tr>
                                {activeTab === 'payroll' && <>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Periodo</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Costo Total</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Bonos Pagados</th>
                                </>}
                                {activeTab === 'personnel' && <>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Periodo</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Plantilla</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Nuevos Ingresos</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Bajas</th>
                                </>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredData.map((d, i) => (
                                <tr key={i}>
                                    {activeTab === 'payroll' && <>
                                        <td className="px-4 py-2 text-sm text-slate-700">{d.monthLabel}</td>
                                        <td className="px-4 py-2 text-sm text-slate-700">{formatCurrency(d.monthCost)}</td>
                                        <td className="px-4 py-2 text-sm text-slate-700">{formatCurrency(d.monthBonuses)}</td>
                                    </>}
                                     {activeTab === 'personnel' && <>
                                        <td className="px-4 py-2 text-sm text-slate-700">{d.monthLabel}</td>
                                        <td className="px-4 py-2 text-sm text-slate-700">{d.headcount}</td>
                                        <td className="px-4 py-2 text-sm text-slate-700">{d.hires}</td>
                                        <td className="px-4 py-2 text-sm text-slate-700">{d.terminations}</td>
                                    </>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
