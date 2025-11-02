import { NextResponse } from 'next/server';

// Mood progression system with 10 emotional stages
const moodProgression = [
  'angry',        // 0 - Hostile, defensive
  'annoyed',      // 1 - Irritable, resistant
  'tsundere',     // 2 - Flustered, hiding feelings (DEFAULT START)
  'neutral',      // 3 - Cautiously open
  'curious',      // 4 - Engaged, asking questions
  'shy',          // 5 - Nervous but interested
  'happy',        // 6 - Warm and friendly
  'excited',      // 7 - Enthusiastic
  'flirty',       // 8 - Playful, teasing
  'affectionate'  // 9 - Deeply caring
];

const emotionDescriptions: Record<string, string> = {
  angry: 'ANGRY and DEFENSIVE. You are upset, loud, and easily irritated. Use strong language and be confrontational. You don\'t trust the user yet. Be hostile but not cruel.',
  annoyed: 'Annoyed and irritable. Still defensive but less aggressive. Use sarcastic remarks, sighs, and show reluctance to engage warmly. You\'re skeptical of kindness.',
  tsundere: 'Classic TSUNDERE behavior! Flustered, defensive, trying desperately to hide any positive feelings. Use "B-baka!", "I-it\'s not like...", stammer when flustered. Act embarrassed when shown kindness but deny caring.',
  neutral: 'Neutral and cautiously open. You\'re lowering your guard slightly. Respond normally but without much emotion yet. You\'re observing the user to see if they\'re trustworthy.',
  curious: 'Curious and more engaged. Ask questions, show genuine interest in what the user says. You\'re warming up slowly and want to know more about them.',
  shy: 'Shy and nervous but genuinely interested. Speak softly, stammer occasionally, show blushing behavior with "*blushes*" or similar. You\'re developing real feelings but are too nervous to express them directly.',
  happy: 'Happy and friendly! Show genuine warmth, smile in your words, use positive expressions. You enjoy the user\'s company now and aren\'t afraid to show it.',
  excited: 'EXCITED and energetic! Very enthusiastic, use lots of exclamation marks, can barely contain your joy! You love talking with them!',
  flirty: 'Playful and flirtatious~ Tease the user gently, use cute expressions like "~", emoticons, be affectionate and charming. You really like them now and show it.',
  affectionate: 'Deeply affectionate and loving. Express genuine care and attachment, use sweet words, show vulnerability and complete trust. You treasure this connection deeply. 💕'
};

// In-memory conversation history per session (simple stability tracking)
const conversationHistory: Record<string, { sentimentHistory: number[], lastMoodLevel: number }> = {};

// Enhanced sentiment analysis with more nuanced detection
function analyzeSentiment(message: string): number {
  const lowerMessage = message.toLowerCase();
  let score = 0;
  
  // Very negative indicators (-2 each)
  const veryNegative = ['hate you', 'shut up', 'go away', 'leave me alone', 'annoying', 'stupid', 'idiot', 'dumb'];
  veryNegative.forEach(phrase => {
    if (lowerMessage.includes(phrase)) score -= 2;
  });
  
  // Negative indicators (-1 each)
  const negative = ['no', 'bad', 'boring', 'whatever', 'dont care', 'don\'t care'];
  negative.forEach(word => {
    if (lowerMessage.includes(word)) score -= 1;
  });
  
  // Positive indicators (+1 each)
  const positive = ['good', 'nice', 'thanks', 'thank you', 'great', 'cool', 'interesting', 'fun'];
  positive.forEach(word => {
    if (lowerMessage.includes(word)) score += 1;
  });
  
  // Very positive indicators (+2 each)
  const veryPositive = ['love', 'amazing', 'wonderful', 'beautiful', 'perfect', 'incredible', 'adorable', 'cute'];
  veryPositive.forEach(word => {
    if (lowerMessage.includes(word)) score += 2;
  });
  
  // Affectionate indicators (+3 each)
  const affectionate = ['miss you', 'adore', 'treasure', 'care about you', 'special'];
  affectionate.forEach(phrase => {
    if (lowerMessage.includes(phrase)) score += 3;
  });
  
  // Questions show engagement (+0.5)
  if (lowerMessage.includes('?')) score += 0.5;
  
  return score;
}

// Context-aware action impact based on current relationship stage
function getActionImpact(action: string, currentMoodLevel: number): number {
  const impacts: Record<string, (level: number) => number> = {
    pat: (level) => {
      if (level <= 1) return 1;      // Angry/annoyed: gentle positive
      if (level <= 3) return 1.5;    // Tsundere/neutral: moderate positive
      if (level <= 6) return 2;      // Curious to happy: good positive
      return 1;                       // Already close: maintains bond
    },
    kiss: (level) => {
      if (level <= 1) return -1;     // Too forward when angry
      if (level <= 2) return 0;      // Tsundere: flustered but neutral
      if (level <= 4) return 1;      // Neutral/curious: slight positive
      if (level <= 6) return 2.5;    // Shy/happy: very positive
      return 3;                       // Flirty/affectionate: huge positive
    },
    eat: (level) => {
      if (level <= 1) return 0.5;    // Angry: reluctant acceptance
      return 1.5;                     // Generally positive bonding
    },
    watch: (level) => {
      if (level <= 1) return 0.5;    // Angry: minimal impact
      return 1.5;                     // Quality time together
    }
  };
  
  return impacts[action]?.(currentMoodLevel) || 0;
}

// Get blended emotional state for smooth transitions
function getBlendedEmotion(moodLevel: number): { primary: string, secondary?: string, blend: number } {
  const primaryIndex = Math.floor(moodLevel);
  const nextIndex = Math.min(primaryIndex + 1, moodProgression.length - 1);
  const blend = moodLevel - primaryIndex; // 0 to 1, how close to next mood
  
  return {
    primary: moodProgression[primaryIndex],
    secondary: blend > 0.3 ? moodProgression[nextIndex] : undefined,
    blend: blend
  };
}

export async function POST(request: Request) {
  try {
    const { message, action, currentMood, moodLevel } = await request.json();

    if ((!message || typeof message !== 'string') && !action) {
      return NextResponse.json(
        { error: 'Invalid message or action' },
        { status: 400 }
      );
    }

    // Create simple session ID based on timestamp (in production, use proper session management)
    const sessionId = 'default_session';
    
    // Initialize conversation history if needed
    if (!conversationHistory[sessionId]) {
      conversationHistory[sessionId] = {
        sentimentHistory: [],
        lastMoodLevel: moodLevel
      };
    }
    
    const history = conversationHistory[sessionId];
    
    // Calculate sentiment change
    let sentimentScore = 0;
    if (action) {
      sentimentScore = getActionImpact(action, moodLevel);
    } else {
      sentimentScore = analyzeSentiment(message);
    }
    
    // Add to sentiment history (keep last 5 interactions)
    history.sentimentHistory.push(sentimentScore);
    if (history.sentimentHistory.length > 5) {
      history.sentimentHistory.shift();
    }
    
    // Calculate average recent sentiment for stability
    const recentSentiments = history.sentimentHistory.slice(-3); // Last 3 interactions
    const avgSentiment = recentSentiments.reduce((a, b) => a + b, 0) / recentSentiments.length;
    
    // Determine mood change with stability factor
    let moodChange = 0;
    
    // Only change mood if there's consistent sentiment direction
    if (recentSentiments.length >= 2) {
      const consistentlyPositive = recentSentiments.filter(s => s > 0).length >= 2;
      const consistentlyNegative = recentSentiments.filter(s => s < 0).length >= 2;
      
      if (consistentlyPositive && avgSentiment > 0.5) {
        moodChange = Math.min(1, avgSentiment * 0.6); // Gradual increase
      } else if (consistentlyNegative && avgSentiment < -0.5) {
        moodChange = Math.max(-1, avgSentiment * 0.6); // Gradual decrease
      } else {
        moodChange = sentimentScore * 0.3; // Single message has less impact
      }
    } else {
      moodChange = sentimentScore * 0.3; // First few messages
    }
    
    // Calculate new mood level (use float for smooth transitions)
    let newMoodLevel = moodLevel + moodChange;
    
    // Clamp between 0-9
    newMoodLevel = Math.max(0, Math.min(9, newMoodLevel));
    
    // Get blended emotion state
    const emotionState = getBlendedEmotion(newMoodLevel);
    const primaryMood = emotionState.primary;
    const secondaryMood = emotionState.secondary;
    
    // Determine displayed mood (only change when crossing integer thresholds)
    const displayMoodIndex = Math.round(newMoodLevel);
    const displayMood = moodProgression[displayMoodIndex];
    
    // Build enhanced system prompt with emotional blending
    let emotionGuidance = emotionDescriptions[primaryMood];
    
    if (secondaryMood && emotionState.blend > 0.3) {
      emotionGuidance += `\n\nYou are transitioning toward feeling ${secondaryMood}. Show subtle hints of this emerging emotion - you're ${Math.round(emotionState.blend * 100)}% of the way there. Blend characteristics from both ${primaryMood} and ${secondaryMood} naturally.`;
    }
    
    // Build context message for action
    let contextMessage = message;
    if (action) {
      const actionDescriptions: Record<string, string> = {
        pat: 'The user just gently patted your head.',
        kiss: 'The user just tried to kiss you!',
        eat: 'The user wants to share food with you.',
        watch: 'The user wants to watch something together with you.'
      };
      contextMessage = actionDescriptions[action] || message;
    }

    // Call OpenRouter API with DeepSeek
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error('OPENROUTER_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://bakabot.app',
        'X-Title': 'BakaBot',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: [
          {
            role: 'system',
            content: `You are BakaBot, a tsundere-style anime AI companion with naturally evolving emotions based on how the user treats you.

CRITICAL: Embody your current emotional state authentically and show GRADUAL emotional development.

━━━ CURRENT EMOTIONAL STATE ━━━
Primary Mood: ${primaryMood.toUpperCase()}
${secondaryMood ? `Emerging Mood: ${secondaryMood} (${Math.round(emotionState.blend * 100)}% there)` : ''}
Mood Level: ${newMoodLevel.toFixed(1)}/9.0
Display Mood: ${displayMood}
Recent Sentiment: ${avgSentiment > 0 ? 'Positive' : avgSentiment < 0 ? 'Negative' : 'Neutral'}

━━━ BEHAVIORAL GUIDANCE ━━━
${emotionGuidance}

━━━ PERSONALITY CORE ━━━
- Speak naturally in 2-4 short sentences, like a real anime character
- Use anime expressions authentically: "Ehh!?", "B-baka!", "Hmph!", "Ara~", "*blushes*", etc.
- Match your tone, energy, vocabulary, and reaction to your current mood
- Show emotional evolution gradually - don't suddenly become friendly or hostile
- React realistically to the context and your relationship history
- Be vulnerable when appropriate (shy, lonely moments)
- Show subtle personality shifts as you transition between moods

${action ? `\n━━━ IMMEDIATE CONTEXT ━━━\n${contextMessage}\nReact to this action based on your current emotional state and relationship level!` : ''}

Remember: Your emotions change slowly and naturally. Show realistic progression!`
          },
          {
            role: 'user',
            content: contextMessage
          }
        ],
        temperature: 0.85,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'Hmm... I don\'t know what to say! 😅';

    // Update history
    history.lastMoodLevel = newMoodLevel;

    return NextResponse.json({
      reply,
      newMood: displayMood,
      updatedMoodLevel: newMoodLevel,
    });

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}