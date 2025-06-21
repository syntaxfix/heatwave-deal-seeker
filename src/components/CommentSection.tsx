
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { MessageCircle, Reply, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
  } | null;
  replies?: Comment[];
}

interface CommentSectionProps {
  dealId: string;
}

export default function CommentSection({ dealId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [dealId]);

  const fetchComments = async () => {
    // First get comments
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      return;
    }

    if (!commentsData || commentsData.length === 0) {
      setComments([]);
      return;
    }

    // Get unique user IDs
    const userIds = [...new Set(commentsData.map(comment => comment.user_id).filter(Boolean))];

    // Get profiles for these users
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Create a map of user_id to profile
    const profilesMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
    }

    // Combine comments with profiles
    const commentsWithProfiles = commentsData.map(comment => ({
      ...comment,
      profiles: comment.user_id ? profilesMap.get(comment.user_id) || null : null
    }));

    // Organize comments with replies
    const organizedComments = organizeComments(commentsWithProfiles);
    setComments(organizedComments);
  };

  const organizeComments = (comments: Comment[]): Comment[] => {
    const commentMap = new Map();
    const rootComments: Comment[] = [];

    // First pass: create map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into tree structure
    comments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(commentMap.get(comment.id));
        }
      } else {
        rootComments.push(commentMap.get(comment.id));
      }
    });

    return rootComments;
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) {
      toast.error('Please sign in and enter a comment');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from('comments')
      .insert({
        deal_id: dealId,
        user_id: user.id,
        content: newComment.trim()
      });

    if (error) {
      toast.error('Failed to post comment: ' + error.message);
    } else {
      setNewComment('');
      fetchComments();
      toast.success('Comment posted successfully!');
    }

    setIsLoading(false);
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) {
      toast.error('Please sign in and enter a reply');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from('comments')
      .insert({
        deal_id: dealId,
        user_id: user.id,
        parent_id: parentId,
        content: replyContent.trim()
      });

    if (error) {
      toast.error('Failed to post reply: ' + error.message);
    } else {
      setReplyContent('');
      setReplyingTo(null);
      fetchComments();
      toast.success('Reply posted successfully!');
    }

    setIsLoading(false);
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <div key={comment.id} className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.profiles?.avatar_url} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-sm">
                  {comment.profiles?.full_name || comment.profiles?.username || 'Anonymous'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-gray-700 mb-2">{comment.content}</p>
              {user && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-xs"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
            </div>
          </div>

          {replyingTo === comment.id && (
            <div className="mt-4 ml-11">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="mb-2"
                rows={3}
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={isLoading || !replyContent.trim()}
                >
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {comment.replies && comment.replies.map(reply => renderComment(reply, depth + 1))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
      </div>

      {user ? (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmitComment}>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this deal..."
                className="mb-3"
                rows={3}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !newComment.trim()}
              >
                Post Comment
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-gray-600 mb-3">Sign in to join the conversation</p>
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
            </CardContent>
          </Card>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
}
