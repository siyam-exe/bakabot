'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  emotion?: string;
}

const emotions: Record<string, { emoji: string; label: string; level: number }> = {
  angry: { emoji: '😠', label: 'Angry', level: 0 },
  annoyed: { emoji: '😒', label: 'Annoyed', level: 1 },
  tsundere: { emoji: '😤', label: 'Tsundere', level: 2 },
  neutral: { emoji: '😐', label: 'Neutral', level: 3 },
  curious: { emoji: '🤔', label: 'Curious', level: 4 },
  shy: { emoji: '🫣', label: 'Shy', level: 5 },
  happy: { emoji: '😊', label: 'Happy', level: 6 },
  excited: { emoji: '🤩', label: 'Excited', level: 7 },
  flirty: { emoji: '😘', label: 'Flirty', level: 8 },
  affectionate: { emoji: '💕', label: 'Affectionate', level: 9 },
};

// Safe emotion getter with fallback
const getEmotion = (emotionKey: string) => {
  return emotions[emotionKey] || emotions.tsundere;
};

// Emotion-based visual effects configuration
const emotionEffects: Record<string, {
  tint: string;
  particles: 'hearts' | 'sparkles' | 'tears' | 'none';
  screenEffect: 'shake' | 'glow' | 'none';
}> = {
  angry: { tint: 'rgba(220, 38, 38, 0.15)', particles: 'none', screenEffect: 'shake' },
  annoyed: { tint: 'rgba(107, 114, 128, 0.1)', particles: 'none', screenEffect: 'none' },
  tsundere: { tint: 'rgba(236, 72, 153, 0.08)', particles: 'none', screenEffect: 'none' },
  neutral: { tint: 'rgba(156, 163, 175, 0.05)', particles: 'none', screenEffect: 'none' },
  curious: { tint: 'rgba(59, 130, 246, 0.08)', particles: 'sparkles', screenEffect: 'none' },
  shy: { tint: 'rgba(244, 114, 182, 0.12)', particles: 'none', screenEffect: 'none' },
  happy: { tint: 'rgba(251, 191, 36, 0.1)', particles: 'sparkles', screenEffect: 'glow' },
  excited: { tint: 'rgba(249, 115, 22, 0.12)', particles: 'sparkles', screenEffect: 'glow' },
  flirty: { tint: 'rgba(236, 72, 153, 0.15)', particles: 'hearts', screenEffect: 'glow' },
  affectionate: { tint: 'rgba(244, 63, 94, 0.18)', particles: 'hearts', screenEffect: 'glow' },
};

// Particle component
const Particle = ({ type, id }: { type: 'hearts' | 'sparkles' | 'tears', id: number }) => {
  const getParticleContent = () => {
    switch (type) {
      case 'hearts':
        return ['💕', '💖', '💗', '💘'][id % 4];
      case 'sparkles':
        return ['✨', '⭐', '🌟', '💫'][id % 4];
      case 'tears':
        return ['💧', '💦'][id % 2];
    }
  };

  const randomX = Math.random() * 100;
  const randomDelay = Math.random() * 2;
  const randomDuration = 3 + Math.random() * 2;

  return (
    <div
      className="absolute text-3xl pointer-events-none"
      style={{
        left: `${randomX}%`,
        bottom: '10%',
        animation: `float-up ${randomDuration}s ease-out ${randomDelay}s forwards`,
      }}
    >
      {getParticleContent()}
    </div>
  );
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentEmotion, setCurrentEmotion] = useState('tsundere');
  const [moodLevel, setMoodLevel] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; type: 'hearts' | 'sparkles' | 'tears' }>>([]);
  const [screenShake, setScreenShake] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const particleIdRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Trigger microinteractions based on emotion
  useEffect(() => {
    const effects = emotionEffects[currentEmotion];
    
    // Screen shake for angry
    if (effects.screenEffect === 'shake') {
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 600);
    }
    
    // Spawn particles
    if (effects.particles !== 'none') {
      const particleCount = effects.particles === 'hearts' ? 8 : 12;
      const newParticles: Array<{ id: number; type: 'hearts' | 'sparkles' | 'tears' }> = [];
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: particleIdRef.current++,
          type: effects.particles
        });
      }
      
      setParticles(newParticles);
      
      // Clear particles after animation
      setTimeout(() => setParticles([]), 5000);
    }
  }, [currentEmotion]);

  const handleSend = async (actionType?: string) => {
    const messageContent = actionType ? '' : input.trim();
    if (!messageContent && !actionType) return;
    if (isLoading) return;

    let displayMessage = messageContent;
    if (actionType) {
      const actionMessages: Record<string, string> = {
        pat: 'patted you gently',
        kiss: 'tried to kiss you',
        eat: 'wants to share food with you',
        watch: 'wants to watch something together',
      };
      displayMessage = `*${actionMessages[actionType] || 'did something'}*`;
    }

    if (!actionType) {
      const userMessage: Message = {
        role: 'user',
        content: messageContent,
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
    }

    setIsLoading(true);
    setShowTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageContent || displayMessage,
          action: actionType,
          currentMood: currentEmotion,
          moodLevel: moodLevel,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const data = await response.json();
      
      setShowTyping(false);
      setCurrentEmotion(data.newMood || 'tsundere');
      setMoodLevel(data.updatedMoodLevel ?? moodLevel);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
        emotion: data.newMood,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setShowTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Gomen... something went wrong! 😣',
          emotion: 'annoyed',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAction = (action: string) => {
    handleSend(action);
  };

  const currentEmotionData = getEmotion(currentEmotion);
  const currentEffects = emotionEffects[currentEmotion];

  return (
    <div className={`relative w-full h-screen overflow-hidden ${screenShake ? 'animate-screen-shake' : ''}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ 
          backgroundImage: "url('/backgrounds/classroom.jpg')",
          filter: 'brightness(0.85)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 backdrop-blur-[2px]" />
      
      {/* Emotion-based Screen Tint */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{ 
          backgroundColor: currentEffects.tint,
        }}
      />
      
      {/* Screen Glow Effect for Happy Emotions */}
      {currentEffects.screenEffect === 'glow' && (
        <>
          <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-pink-400/20 via-transparent to-transparent animate-pulse-glow" />
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-pink-400/10 to-transparent pointer-events-none animate-pulse-glow" />
        </>
      )}
      
      {/* Particle Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <Particle key={particle.id} type={particle.type} id={particle.id} />
        ))}
      </div>

      {/* Mood Indicator */}
      <div className="absolute top-6 left-6 z-20 bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-md border border-pink-300/30 rounded-2xl px-6 py-3 shadow-[0_8px_32px_rgba(168,85,247,0.4)] animate-fade-in">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-bounce drop-shadow-lg">{currentEmotionData.emoji}</span>
          <div>
            <p className="text-xs text-pink-200 font-semibold tracking-wide">Current Mood</p>
            <p className="text-white font-bold text-lg drop-shadow-md">{currentEmotionData.label}</p>
          </div>
        </div>
        {/* Mood Level Progress Bar */}
        <div className="mt-3 w-full bg-black/40 rounded-full h-2 overflow-hidden border border-pink-300/20 shadow-inner">
          <div 
            className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 h-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(236,72,153,0.6)]"
            style={{ width: `${(moodLevel / 9) * 100}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-6 right-6 z-20 flex gap-3 animate-fade-in">
        {[
          { action: 'pat', emoji: '🤚', label: 'Pat' },
          { action: 'kiss', emoji: '💋', label: 'Kiss' },
          { action: 'eat', emoji: '🍱', label: 'Eat' },
          { action: 'watch', emoji: '🎬', label: 'Watch' },
        ].map(({ action, emoji, label }) => (
          <button
            key={action}
            onClick={() => handleAction(action)}
            disabled={isLoading}
            className="group relative w-14 h-14 bg-gradient-to-br from-pink-500/90 to-purple-600/90 rounded-full shadow-[0_4px_20px_rgba(236,72,153,0.5)] hover:shadow-[0_8px_30px_rgba(236,72,153,0.7)] hover:scale-110 transition-all duration-300 border border-white/40 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            title={label}
          >
            <span className="text-2xl drop-shadow-md">{emoji}</span>
            <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-xs text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg border border-white/20">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Main Layout Container */}
      <div className="absolute inset-0 flex items-center justify-center px-8">
        {/* Character Sprite - Bottom Left */}
        <div className="absolute left-0 bottom-0 z-10 w-1/3">
          <img
            key={currentEmotion}
            src={`/characters/${currentEmotion}.png`}
            alt="BakaBot"
            className="h-[700px] w-auto object-contain object-bottom drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)] transition-all duration-700 ease-in-out opacity-0 animate-fade-in-slow"
            onError={(e) => {
              e.currentTarget.src = '/characters/tsundere.png';
            }}
            style={{
              animation: 'fadeInSlowSprite 0.7s ease-out forwards'
            }}
          />
        </div>

        {/* Chat Container - Right Side */}
        <div className="absolute bottom-0 right-0 z-30 pb-8 pr-8 w-2/3">
          {/* Messages Display */}
          <div className="max-w-3xl mx-auto mb-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent">
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`animate-fade-in ${
                    msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                  }`}
                >
                  <div className={`relative max-w-xl ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500/90 to-cyan-500/90' 
                      : 'bg-gradient-to-br from-purple-600/90 to-pink-500/90'
                  } rounded-2xl px-6 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md border ${
                    msg.role === 'user'
                      ? 'border-cyan-300/30'
                      : 'border-pink-300/30'
                  }`}
                  style={{
                    boxShadow: msg.role === 'user'
                      ? '0 8px 24px rgba(6,182,212,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                      : '0 8px 24px rgba(236,72,153,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}>
                    {/* Inner glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                    
                    {/* Text Content */}
                    <p className="relative text-white font-medium text-base leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {msg.content}
                    </p>
                    
                    {/* Speech bubble tail */}
                    {msg.role === 'assistant' && (
                      <div className="absolute -left-2 top-4 w-0 h-0 border-t-[10px] border-t-transparent border-r-[12px] border-r-purple-600/90 border-b-[10px] border-b-transparent" />
                    )}
                    {msg.role === 'user' && (
                      <div className="absolute -right-2 top-4 w-0 h-0 border-t-[10px] border-t-transparent border-l-[12px] border-l-blue-500/90 border-b-[10px] border-b-transparent" />
                    )}
                  </div>
                </div>
              ))}
              
              {showTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="relative max-w-xl bg-gradient-to-br from-purple-600/90 to-pink-500/90 rounded-2xl px-6 py-4 shadow-[0_8px_24px_rgba(236,72,153,0.3)] backdrop-blur-md border border-pink-300/30"
                  style={{
                    boxShadow: '0 8px 24px rgba(236,72,153,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                    <div className="relative flex gap-2">
                      <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0ms' }} />
                      <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '150ms' }} />
                      <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '300ms' }} />
                    </div>
                    <div className="absolute -left-2 top-4 w-0 h-0 border-t-[10px] border-t-transparent border-r-[12px] border-r-purple-600/90 border-b-[10px] border-b-transparent" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Box */}
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-gradient-to-br from-gray-900/95 to-purple-900/95 backdrop-blur-xl border border-purple-400/30 shadow-[0_8px_32px_rgba(168,85,247,0.4)] rounded-2xl overflow-hidden"
            style={{
              boxShadow: '0 8px 32px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}>
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="relative w-full px-6 py-4 bg-transparent text-white text-base placeholder-gray-400 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2 rounded-full shadow-[0_4px_16px_rgba(236,72,153,0.5)] hover:shadow-[0_6px_20px_rgba(236,72,153,0.7)] transition-all duration-300 hover:scale-105 border border-white/20"
              >
                Send ✨
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}