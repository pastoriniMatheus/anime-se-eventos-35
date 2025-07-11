
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface LeadsByEventChartProps {
  leads: any[];
  events: any[];
}

const LeadsByEventChart = ({ leads, events }: LeadsByEventChartProps) => {
  const chartData = events.map((event: any) => {
    const eventLeads = leads.filter(lead => lead.event_id === event.id);
    return {
      name: event.name.length > 15 ? `${event.name.substring(0, 15)}...` : event.name,
      fullName: event.name,
      leads: eventLeads.length,
    };
  }).filter(item => item.leads > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Nenhum lead capturado ainda</p>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(label, payload) => {
              const item = chartData.find(d => d.name === label);
              return item ? item.fullName : label;
            }}
          />
          <Bar dataKey="leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeadsByEventChart;
