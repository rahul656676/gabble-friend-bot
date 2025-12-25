import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown, Mic, Keyboard, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSessionId } from '@/hooks/useSessionId';

interface AnalyticsData {
  totalMessages: number;
  positiveFeedback: number;
  negativeFeedback: number;
  voiceMessages: number;
  textMessages: number;
  quickReplies: number;
  recentEvents: Array<{
    event_type: string;
    created_at: string;
    event_data: Record<string, unknown>;
  }>;
}

const Analytics = () => {
  const navigate = useNavigate();
  const sessionId = useSessionId();
  const [data, setData] = useState<AnalyticsData>({
    totalMessages: 0,
    positiveFeedback: 0,
    negativeFeedback: 0,
    voiceMessages: 0,
    textMessages: 0,
    quickReplies: 0,
    recentEvents: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const loadAnalytics = async () => {
      try {
        // Get all analytics for this session
        const { data: events, error } = await supabase
          .from('analytics')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (events) {
          const analytics: AnalyticsData = {
            totalMessages: events.filter(e => 
              e.event_type === 'message_sent' || e.event_type === 'message_received'
            ).length,
            positiveFeedback: events.filter(e => 
              e.event_type === 'feedback_given' && 
              (e.event_data as Record<string, unknown>)?.feedback === 1
            ).length,
            negativeFeedback: events.filter(e => 
              e.event_type === 'feedback_given' && 
              (e.event_data as Record<string, unknown>)?.feedback === -1
            ).length,
            voiceMessages: events.filter(e => e.event_type === 'voice_used').length,
            textMessages: events.filter(e => e.event_type === 'text_used').length,
            quickReplies: events.filter(e => e.event_type === 'quick_reply_used').length,
            recentEvents: events.slice(0, 10).map(e => ({
              event_type: e.event_type,
              created_at: e.created_at,
              event_data: e.event_data as Record<string, unknown>,
            })),
          };
          setData(analytics);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [sessionId]);

  const satisfactionRate = data.positiveFeedback + data.negativeFeedback > 0
    ? Math.round((data.positiveFeedback / (data.positiveFeedback + data.negativeFeedback)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-glow-secondary/10 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="glass"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your conversation metrics</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground mt-4">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Total Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{data.totalMessages}</p>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Satisfaction Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gradient">{satisfactionRate}%</p>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Voice Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{data.voiceMessages}</p>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <Keyboard className="w-4 h-4" />
                    Text Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{data.textMessages}</p>
                </CardContent>
              </Card>
            </div>

            {/* Feedback breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-green-500" />
                    Positive Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-green-500">{data.positiveFeedback}</p>
                  <p className="text-sm text-muted-foreground">responses liked</p>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsDown className="w-5 h-5 text-red-500" />
                    Negative Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-red-500">{data.negativeFeedback}</p>
                  <p className="text-sm text-muted-foreground">responses disliked</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {data.recentEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No activity yet. Start a conversation to see analytics!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.recentEvents.map((event, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                      >
                        <div>
                          <p className="font-medium capitalize">
                            {event.event_type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
