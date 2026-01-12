import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, eachMonthOfInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, isSameDay, isSameMonth } from 'date-fns';
import type { Block, Area, ViewType } from '../types';
import { BLOCK_TYPES } from '../types';

interface DashboardStatsProps {
  blocks: Block[];
  areas: Area[];
  viewType: ViewType;
  currentDate: Date;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ blocks, areas, viewType, currentDate }) => {
  
  // 1. Calculate Summary Stats
  const summaryStats = useMemo(() => {
    const totalBlocks = blocks.length;
    const totalDuration = blocks.reduce((acc, block) => acc + block.duration_minutes, 0);
    const avgDuration = totalBlocks > 0 ? Math.round(totalDuration / totalBlocks) : 0;
    
    return { totalBlocks, totalDuration, avgDuration };
  }, [blocks]);

  // 2. Data for Blocks by Type (Bar Chart)
  const blocksByTypeData = useMemo(() => {
    return BLOCK_TYPES.map(type => {
      const count = blocks.filter(b => b.block_type === type).length;
      return { name: type, count };
    });
  }, [blocks]);

  // 3. Data for Blocks by Area (Pie Chart)
  const blocksByAreaData = useMemo(() => {
    return areas.map(area => {
      const count = blocks.filter(b => b.area_id === area.id).length;
      return { name: area.name, count, color: area.color, id: area.id };
    }).filter(item => item.count > 0);
  }, [blocks, areas]);

  // 4. Data for Activity Over Time (Line/Bar Chart)
  const activityOverTimeData = useMemo(() => {
    let dataPoints: { date: string; label: string; count: number }[] = [];
    const grouped = blocks.reduce((acc, block) => {
      acc[block.date] = (acc[block.date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (viewType === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start, end });
      
      dataPoints = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return {
          date: dateStr,
          label: format(day, 'EEE'), // Mon, Tue...
          count: grouped[dateStr] || 0
        };
      });
    } else if (viewType === 'month') {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const days = eachDayOfInterval({ start, end });
      
      dataPoints = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return {
          date: dateStr,
          label: format(day, 'd'), // 1, 2, 3...
          count: grouped[dateStr] || 0
        };
      });
    } else if (viewType === 'year') {
      const start = startOfYear(currentDate);
      const end = endOfYear(currentDate);
      const months = eachMonthOfInterval({ start, end });

      const groupedByMonth = blocks.reduce((acc, block) => {
        const monthStr = format(parseISO(block.date), 'yyyy-MM');
        acc[monthStr] = (acc[monthStr] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      dataPoints = months.map(month => {
        const monthStr = format(month, 'yyyy-MM');
        return {
          date: monthStr,
          label: format(month, 'MMM'), // Jan, Feb...
          count: groupedByMonth[monthStr] || 0
        };
      });
    } else {
      // 'all' view - default to existing logic or maybe last 12 months? 
      // Existing logic based on blocks is fine for 'all' as range is undefined.
       if (blocks.length > 0) {
        const sortedBlocks = [...blocks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const startStr = sortedBlocks[0].date;
        const endStr = sortedBlocks[sortedBlocks.length - 1].date;
        // Group by month for 'all' time usually
         const groupedByMonth = blocks.reduce((acc, block) => {
            const monthStr = format(parseISO(block.date), 'yyyy-MM');
            acc[monthStr] = (acc[monthStr] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
        const start = parseISO(startStr);
        const end = parseISO(endStr);
        // If range is huge, this might be too many points. But let's assume it's manageable.
        // If start and end are in same month, just one point.
        // eachMonthOfInterval requires start < end.
        
        let months: Date[] = [];
        if (isSameMonth(start, end)) {
            months = [start];
        } else {
            months = eachMonthOfInterval({ start, end });
        }

        dataPoints = months.map(month => {
            const monthStr = format(month, 'yyyy-MM');
            return {
              date: monthStr,
              label: format(month, 'MMM yyyy'),
              count: groupedByMonth[monthStr] || 0
            };
        });
       }
    }
    
    return dataPoints;

  }, [blocks, viewType, currentDate]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total Blocks</p>
          <p className="text-2xl font-bold text-gray-900">{summaryStats.totalBlocks}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total Focus Time</p>
          <p className="text-2xl font-bold text-gray-900">{formatTime(summaryStats.totalDuration)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Avg. Block Duration</p>
          <p className="text-2xl font-bold text-gray-900">{summaryStats.avgDuration}m</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blocks by Type */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Blocks by Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blocksByTypeData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={50} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Blocks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blocks by Area */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Blocks by Area</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={blocksByAreaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {blocksByAreaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Over Time */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100 lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Activity Trend ({viewType === 'week' || viewType === 'month' ? 'Daily' : 'Monthly'})
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityOverTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} activeDot={{ r: 8 }} name="Blocks" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

