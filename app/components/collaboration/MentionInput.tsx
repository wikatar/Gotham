'use client'

import { useState, useRef, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  onMention?: (mentionedUsers: User[]) => void
  placeholder?: string
  className?: string
  users?: User[]
}

interface MentionSuggestion {
  user: User
  startIndex: number
  endIndex: number
  query: string
}

export default function MentionInput({
  value,
  onChange,
  onMention,
  placeholder = "Skriv en kommentar...",
  className = '',
  users = []
}: MentionInputProps) {
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionStart, setMentionStart] = useState(-1)
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sample users for demo - in real app, these would come from props or API
  const defaultUsers: User[] = [
    { id: 'user-1', name: 'Anna Andersson', email: 'anna@gotham.se' },
    { id: 'user-2', name: 'Björn Bergström', email: 'bjorn@gotham.se' },
    { id: 'user-3', name: 'Cecilia Carlsson', email: 'cecilia@gotham.se' },
    { id: 'user-4', name: 'David Davidsson', email: 'david@gotham.se' },
    { id: 'user-5', name: 'Emma Eriksson', email: 'emma@gotham.se' }
  ]

  const allUsers = users.length > 0 ? users : defaultUsers

  // Track cursor position
  const handleSelectionChange = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart || 0)
    }
  }

  const handleInputChange = (newValue: string) => {
    onChange(newValue)
    
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart || 0
      setCursorPosition(cursorPos)
      
      // Check for @ symbol before cursor
      const textBeforeCursor = newValue.substring(0, cursorPos)
      const lastAtSymbol = textBeforeCursor.lastIndexOf('@')
      
      if (lastAtSymbol !== -1) {
        const textAfterAt = textBeforeCursor.substring(lastAtSymbol + 1)
        
        // Check if there's a space after @ (which means we're not mentioning anymore)
        if (!textAfterAt.includes(' ') && textAfterAt.length <= 20) {
          setMentionStart(lastAtSymbol)
          setMentionQuery(textAfterAt)
          
          // Filter users based on query
          const filteredUsers = allUsers.filter(user =>
            user.name.toLowerCase().includes(textAfterAt.toLowerCase()) ||
            user.email.toLowerCase().includes(textAfterAt.toLowerCase())
          )
          
          setSuggestions(filteredUsers.slice(0, 5))
          setShowSuggestions(filteredUsers.length > 0)
          setSelectedSuggestion(0)
        } else {
          setShowSuggestions(false)
        }
      } else {
        setShowSuggestions(false)
      }
    }
  }

  const insertMention = (user: User) => {
    if (mentionStart === -1) return
    
    const beforeMention = value.substring(0, mentionStart)
    const afterMention = value.substring(mentionStart + mentionQuery.length + 1) // +1 for @
    const mention = `@${user.name}`
    
    const newValue = beforeMention + mention + ' ' + afterMention
    onChange(newValue)
    
    // Notify parent about mention
    if (onMention) {
      const mentions = extractMentions(newValue, allUsers)
      onMention(mentions)
    }
    
    setShowSuggestions(false)
    setMentionStart(-1)
    setMentionQuery('')
    
    // Focus and set cursor position after mention
    if (textareaRef.current) {
      const newCursorPos = beforeMention.length + mention.length + 1
      textareaRef.current.focus()
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestion((prev) => (prev + 1) % suggestions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestion((prev) => (prev - 1 + suggestions.length) % suggestions.length)
        break
      case 'Enter':
      case 'Tab':
        e.preventDefault()
        if (suggestions[selectedSuggestion]) {
          insertMention(suggestions[selectedSuggestion])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        break
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getAvatarColor = (email: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ]
    const hash = email.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  // Calculate suggestion dropdown position
  const getSuggestionPosition = () => {
    if (!textareaRef.current || mentionStart === -1) return { top: 0, left: 0 }
    
    const textarea = textareaRef.current
    const style = window.getComputedStyle(textarea)
    const lineHeight = parseInt(style.lineHeight)
    
    // Create a temporary div to measure text
    const div = document.createElement('div')
    div.style.font = style.font
    div.style.whiteSpace = 'pre-wrap'
    div.style.wordWrap = 'break-word'
    div.style.position = 'absolute'
    div.style.visibility = 'hidden'
    div.style.width = textarea.clientWidth + 'px'
    div.textContent = value.substring(0, mentionStart)
    
    document.body.appendChild(div)
    const textWidth = div.offsetWidth
    const textHeight = div.offsetHeight
    document.body.removeChild(div)
    
    return {
      top: textHeight + lineHeight,
      left: textWidth % textarea.clientWidth
    }
  }

  return (
    <div className={`relative ${className}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onSelect={handleSelectionChange}
        onBlur={() => {
          // Delay hiding suggestions to allow clicking
          setTimeout(() => setShowSuggestions(false), 200)
        }}
        placeholder={placeholder}
        className="w-full p-3 border border-secondary/30 rounded-lg resize-none focus:outline-none focus:border-primary"
        rows={3}
      />
      
      {/* Mention Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute z-10 bg-background-paper border border-secondary/20 rounded-lg shadow-lg max-h-40 overflow-y-auto"
          style={{
            top: `${getSuggestionPosition().top}px`,
            left: `${getSuggestionPosition().left}px`,
            minWidth: '200px'
          }}
        >
          {suggestions.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                index === selectedSuggestion ? 'bg-primary/10' : 'hover:bg-secondary/5'
              }`}
              onClick={() => insertMention(user)}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(user.email)}`}>
                {getInitials(user.name)}
              </div>
              <div>
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-text-secondary">{user.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-2 text-xs text-text-secondary">
        Tip: Type @ to mention someone
      </div>
    </div>
  )
}

// Utility function to extract mentions from text
export function extractMentions(text: string, users: User[]): User[] {
  const mentionRegex = /@([^@\s]+(?:\s+[^@\s]+)*)/g
  const mentions: User[] = []
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    const mentionName = match[1].trim()
    const user = users.find(u => u.name === mentionName)
    if (user && !mentions.find(m => m.id === user.id)) {
      mentions.push(user)
    }
  }

  return mentions
}

// Component to render text with highlighted mentions
interface MentionTextProps {
  text: string
  users?: User[]
  className?: string
}

export function MentionText({ text, users = [], className = '' }: MentionTextProps) {
  const mentionRegex = /@([^@\s]+(?:\s+[^@\s]+)*)/g
  
  const renderTextWithMentions = (text: string) => {
    const parts = []
    let lastIndex = 0
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }
      
      // Add mention
      const mentionName = match[1].trim()
      const user = users.find(u => u.name === mentionName)
      
      parts.push(
        <span
          key={`mention-${match.index}`}
          className="bg-primary/10 text-primary px-1 rounded font-medium"
          title={user?.email || mentionName}
        >
          @{mentionName}
        </span>
      )
      
      lastIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }
    
    return parts
  }

  return (
    <span className={className}>
      {renderTextWithMentions(text)}
    </span>
  )
} 