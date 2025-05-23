'use client';

import React, { useState } from 'react';
import { useComments, Comment } from '@/app/hooks/useComments';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { OnlineUsers } from './RealTimeIndicators';
import MentionInput, { MentionText, extractMentions } from './MentionInput';
import { useCollaborationNotifications } from './NotificationSystem';

interface CommentThreadViewProps {
  entityType: string;
  entityId: string;
  currentUser?: {
    id: string;
    name: string;
    email: string;
  };
  className?: string;
}

export function CommentThreadView({
  entityType,
  entityId,
  currentUser = { id: 'dev-user', name: 'Test User', email: 'user@gotham.se' },
  className = '',
}: CommentThreadViewProps) {
  const { thread, loading, error, submitting, addComment, editComment, deleteComment } = useComments(entityType, entityId);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState<any[]>([]);
  
  const { notifyNewComment, notifyMention } = useCollaborationNotifications(currentUser);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim() || submitting) return;

    const success = await addComment(
      newCommentContent.trim(),
      currentUser.email,
      currentUser.name
    );

    if (success) {
      // Send mention notifications
      mentionedUsers.forEach(user => {
        notifyMention(currentUser.name, entityType, entityId, entityId);
      });
      
      setNewCommentContent('');
      setMentionedUsers([]);
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editingCommentId || !editingContent.trim()) return;

    const success = await editComment(
      editingCommentId,
      editingContent.trim(),
      currentUser.email
    );

    if (success) {
      setEditingCommentId(null);
      setEditingContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna kommentar?')) return;
    
    await deleteComment(commentId, currentUser.email);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: sv,
      });
    } catch {
      return 'okänd tid';
    }
  };

  const getAvatarColor = (author: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-red-500'
    ];
    const index = author.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const handleMentionChange = (users: any[]) => {
    setMentionedUsers(users);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-300 rounded w-24 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
                  <div className="h-16 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l2.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Kommentarer
            </h3>
            {thread && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {thread.commentCount}
              </span>
            )}
          </div>
          
          {/* Real-time collaboration indicators */}
          <OnlineUsers
            entityType={entityType}
            entityId={entityId}
            currentUser={currentUser}
            className="flex-shrink-0"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 text-red-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="px-6 py-4 max-h-96 overflow-y-auto">
        {thread && thread.comments.length > 0 ? (
          <div className="space-y-4">
            {thread.comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(comment.author)}`}>
                  {getInitials(comment.authorName, comment.author)}
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  {/* Author and Timestamp */}
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {comment.authorName || comment.author}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(comment.createdAt)}
                    </p>
                    {comment.edited && (
                      <span className="text-xs text-gray-400">(redigerad)</span>
                    )}
                  </div>

                  {/* Comment Body */}
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Redigera kommentar..."
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          disabled={submitting || !editingContent.trim()}
                          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Spara
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          Avbryt
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        <MentionText text={comment.content} />
                      </div>

                      {/* Action Buttons */}
                      {comment.author === currentUser.email && (
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => handleStartEdit(comment)}
                            className="text-xs text-gray-500 hover:text-blue-600"
                          >
                            Redigera
                          </button>
                          <span className="text-xs text-gray-300">•</span>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs text-gray-500 hover:text-red-600"
                          >
                            Ta bort
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l2.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Inga kommentarer ännu.</p>
            <p className="text-xs text-gray-400 mt-1">Bli först att kommentera!</p>
          </div>
        )}
      </div>

      {/* New Comment Form */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <MentionInput
            value={newCommentContent}
            onChange={setNewCommentContent}
            onMention={handleMentionChange}
            placeholder="Skriv en kommentar... (tryck @ för att nämna någon)"
            className="w-full"
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Kommenterar som <span className="font-medium">{currentUser.name}</span></span>
              {mentionedUsers.length > 0 && (
                <span className="text-blue-600">
                  • Nämner {mentionedUsers.length} person{mentionedUsers.length !== 1 ? 'er' : ''}
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting || !newCommentContent.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Skickar...' : 'Kommentera'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 