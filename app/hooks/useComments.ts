import { useState, useEffect } from 'react';

export type Comment = {
  id: string;
  threadId: string;
  author: string;
  authorName?: string;
  content: string;
  createdAt: string;
  editedAt?: string;
  edited: boolean;
};

export type CommentThread = {
  id: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  commentCount: number;
  comments: Comment[];
};

export type ActivityLogEntry = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actor: string;
  actorName?: string;
  description?: string;
  metadata?: any;
  createdAt: string;
};

export const useComments = (entityType: string, entityId: string) => {
  const [thread, setThread] = useState<CommentThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Hämta kommentarstråd
  const fetchThread = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/comments/thread?entityType=${entityType}&entityId=${entityId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch comments');
      }

      const data = await response.json();
      setThread(data.thread);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lägg till ny kommentar
  const addComment = async (content: string, author: string, authorName?: string) => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch('/api/comments/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityType,
          entityId,
          author,
          authorName,
          content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add comment');
      }

      const data = await response.json();
      
      // Uppdatera local state
      if (thread) {
        const newComment = data.comment;
        setThread({
          ...thread,
          comments: [...thread.comments, newComment],
          commentCount: thread.commentCount + 1,
        });
      }

      return data.comment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error adding comment:', err);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  // Redigera kommentar
  const editComment = async (commentId: string, newContent: string, author: string) => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch('/api/comments/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId,
          newContent,
          author,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to edit comment');
      }

      const data = await response.json();
      
      // Uppdatera local state
      if (thread) {
        const updatedComments = thread.comments.map(comment =>
          comment.id === commentId ? data.comment : comment
        );
        setThread({
          ...thread,
          comments: updatedComments,
        });
      }

      return data.comment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error editing comment:', err);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  // Ta bort kommentar
  const deleteComment = async (commentId: string, author: string) => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch('/api/comments/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId,
          author,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete comment');
      }

      // Ta bort från local state
      if (thread) {
        const filteredComments = thread.comments.filter(comment => comment.id !== commentId);
        setThread({
          ...thread,
          comments: filteredComments,
          commentCount: thread.commentCount - 1,
        });
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error deleting comment:', err);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Ladda kommentarer när komponenten mountas
  useEffect(() => {
    if (entityType && entityId) {
      fetchThread();
    }
  }, [entityType, entityId]);

  return {
    thread,
    loading,
    error,
    submitting,
    addComment,
    editComment,
    deleteComment,
    refetch: fetchThread,
  };
};

// Hook för aktivitetsloggar
export const useActivityLog = (entityType: string, entityId: string, limit = 20) => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: limit,
    offset: 0,
    hasMore: false,
  });

  // Hämta aktivitetsloggar
  const fetchActivities = async (offset = 0) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/activity-log/by-entity?entityType=${entityType}&entityId=${entityId}&limit=${limit}&offset=${offset}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch activity log');
      }

      const data = await response.json();
      
      if (offset === 0) {
        setActivities(data.activities);
      } else {
        setActivities(prev => [...prev, ...data.activities]);
      }
      
      setPagination(data.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching activity log:', err);
    } finally {
      setLoading(false);
    }
  };

  // Ladda mer aktiviteter
  const loadMore = async () => {
    if (pagination.hasMore && !loading) {
      await fetchActivities(pagination.offset + pagination.limit);
    }
  };

  // Ladda aktiviteter när komponenten mountas
  useEffect(() => {
    if (entityType && entityId) {
      fetchActivities(0);
    }
  }, [entityType, entityId]);

  return {
    activities,
    loading,
    error,
    pagination,
    loadMore,
    refetch: () => fetchActivities(0),
  };
}; 