
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface VotingSystemProps {
  dealId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialHeatScore: number;
  compact?: boolean;
}

const VotingSystem = ({ 
  dealId, 
  initialUpvotes, 
  initialDownvotes, 
  initialHeatScore,
  compact = false
}: VotingSystemProps) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [heatScore, setHeatScore] = useState(initialHeatScore);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkUserVote();
    }
  }, [user, dealId]);

  const checkUserVote = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('deal_votes')
      .select('vote_type')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .single();

    if (data) {
      setUserVote(data.vote_type as 'up' | 'down');
    }
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      toast.error('Please log in to vote');
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      if (userVote === voteType) {
        // Remove vote
        await supabase
          .from('deal_votes')
          .delete()
          .eq('deal_id', dealId)
          .eq('user_id', user.id);
        
        setUserVote(null);
        if (voteType === 'up') {
          setUpvotes(prev => prev - 1);
          setHeatScore(prev => prev - 2);
        } else {
          setDownvotes(prev => prev - 1);
          setHeatScore(prev => prev + 1);
        }
      } else {
        // Add or change vote
        await supabase
          .from('deal_votes')
          .upsert({
            deal_id: dealId,
            user_id: user.id,
            vote_type: voteType
          });

        const oldVote = userVote;
        setUserVote(voteType);

        if (oldVote) {
          // Changing vote
          if (voteType === 'up') {
            setUpvotes(prev => prev + 1);
            setDownvotes(prev => prev - 1);
            setHeatScore(prev => prev + 3); // +2 for up, +1 for removing down
          } else {
            setUpvotes(prev => prev - 1);
            setDownvotes(prev => prev + 1);
            setHeatScore(prev => prev - 3); // -2 for removing up, -1 for down
          }
        } else {
          // New vote
          if (voteType === 'up') {
            setUpvotes(prev => prev + 1);
            setHeatScore(prev => prev + 2);
          } else {
            setDownvotes(prev => prev + 1);
            setHeatScore(prev => prev - 1);
          }
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    } finally {
      setIsLoading(false);
    }
  };

  const getHeatColor = () => {
    if (heatScore >= 50) return 'text-red-600';
    if (heatScore >= 20) return 'text-orange-600';
    if (heatScore >= 10) return 'text-yellow-600';
    return 'text-blue-600';
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleVote('up')}
          disabled={isLoading}
          className={`h-6 w-6 p-0 ${userVote === 'up' ? 'bg-green-100 text-green-600' : 'hover:bg-green-50'}`}
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        
        <div className="flex items-center space-x-1">
          <Flame className={`h-3 w-3 ${getHeatColor()}`} />
          <span className="text-xs font-medium text-gray-700">{heatScore}</span>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleVote('down')}
          disabled={isLoading}
          className={`h-6 w-6 p-0 ${userVote === 'down' ? 'bg-red-100 text-red-600' : 'hover:bg-red-50'}`}
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleVote('up')}
        disabled={isLoading}
        className={`flex items-center space-x-1 ${
          userVote === 'up' ? 'bg-green-100 text-green-600' : 'hover:bg-green-50'
        }`}
      >
        <ChevronUp className="h-4 w-4" />
        <span className="text-sm">{upvotes}</span>
      </Button>
      
      <div className="flex items-center space-x-1">
        <Flame className={`h-4 w-4 ${getHeatColor()}`} />
        <span className="text-sm font-medium text-gray-700">{heatScore}</span>
      </div>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleVote('down')}
        disabled={isLoading}
        className={`flex items-center space-x-1 ${
          userVote === 'down' ? 'bg-red-100 text-red-600' : 'hover:bg-red-50'
        }`}
      >
        <ChevronDown className="h-4 w-4" />
        <span className="text-sm">{downvotes}</span>
      </Button>
    </div>
  );
};

export default VotingSystem;
