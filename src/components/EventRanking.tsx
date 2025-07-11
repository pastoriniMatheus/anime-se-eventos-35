
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Medal, Award, Trophy } from 'lucide-react';

interface EventRankingProps {
  leads: any[];
  events: any[];
}

const EventRanking = ({ leads, events }: EventRankingProps) => {
  const eventStats = events.map((event: any) => {
    const eventLeads = leads.filter(lead => lead.event_id === event.id);
    return {
      id: event.id,
      name: event.name,
      leadsCount: eventLeads.length,
    };
  }).filter(event => event.leadsCount > 0)
    .sort((a, b) => b.leadsCount - a.leadsCount);

  const getRankIcon = (position: number) => {
    if (position === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 2) return <Award className="h-5 w-5 text-amber-600" />;
    return <TrendingUp className="h-4 w-4 text-orange-500" />;
  };

  const getRankBadgeColor = (position: number) => {
    if (position === 0) return 'bg-yellow-100 text-yellow-800';
    if (position === 1) return 'bg-gray-100 text-gray-800';
    if (position === 2) return 'bg-amber-100 text-amber-800';
    return 'bg-orange-100 text-orange-800';
  };

  if (eventStats.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Nenhum evento com capturas ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {eventStats.slice(0, 10).map((event, index) => (
        <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-4">
            {getRankIcon(index)}
            <div>
              <h4 className="font-semibold text-gray-900">{event.name}</h4>
              <p className="text-sm text-gray-600">
                {event.leadsCount} captura{event.leadsCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getRankBadgeColor(index)}>
              #{index + 1}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventRanking;
