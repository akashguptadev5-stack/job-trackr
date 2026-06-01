import { useState, useRef, useEffect, useMemo } from 'react';
import { useInterview } from '../hooks/useInterview';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { ScoreCardView } from '../components/ui/ScoreCardView';
import styles from './InterviewPage.module.scss';

export function InterviewPage() {
  const { state, initSession, sendAnswer, getScoreCard } = useInterview();
  const [inputText, setInputText] = useState('');
  const [jobTitle, setJobTitle]   = useState('');
  const [company, setCompany]     = useState('');
  const [jd, setJd]               = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.isAiTyping]);

  // Voice input — fills the text input
  const { isRecording, startRecording, stopRecording, isSupported } = useVoiceInput(
    (text) => setInputText(prev => prev + ' ' + text)
  );

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || state.isAiTyping) return;
    setInputText('');
    await sendAnswer(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // useMemo — only recalculate scorecard when session ends
  const scoreCard = useMemo(() =>
    state.status === 'complete' ? getScoreCard() : null,
    [state.status]
  );

  // ── Setup screen ──
  if (state.status === 'idle' || state.status === 'setup') {
    return (
      <div className={styles.wrap}>
        <div className={styles.setupCard}>
          <div className={styles.setupIcon}>🎤</div>
          <h1 className={styles.setupTitle}>AI Mock Interview</h1>
          <p className={styles.setupSub}>
            Tell Claude what role you're interviewing for and it will conduct a tailored technical interview
          </p>
          <div className={styles.setupForm}>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label>Job title</label>
                <input
                  placeholder="Senior Frontend Engineer"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>Company</label>
                <input
                  placeholder="Tesco India"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label>Job description (optional but recommended)</label>
              <textarea
                placeholder="Paste the JD here for a more targeted interview..."
                value={jd}
                onChange={e => setJd(e.target.value)}
                rows={4}
              />
            </div>
            <button
              className={styles.startBtn}
              onClick={() => initSession(jobTitle, company, jd)}
              disabled={!jobTitle.trim() || !company.trim()}
            >
              Start interview →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Score card screen ──
  if (state.status === 'complete' && scoreCard) {
    return <ScoreCardView scoreCard={scoreCard} jobTitle={state.jobTitle} company={state.company} />;
  }

  // ── Active interview ──
  return (
    <div className={styles.wrap}>
      <div className={styles.layout}>

        {/* Chat panel */}
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <div>
              <div className={styles.chatTitle}>AI Mock Interview</div>
              <div className={styles.chatSub}>{state.jobTitle} · {state.company}</div>
            </div>
            <div className={styles.liveBadge}>
              <div className={styles.liveDot} />
              Session active
            </div>
          </div>

          <div className={styles.messages}>
            {state.messages.map((msg, i) => (
              <div key={msg.id || i} className={`${styles.msg} ${msg.role === 'user' ? styles.userMsg : ''}`}>
                <div className={`${styles.avatar} ${msg.role === 'user' ? styles.userAvatar : styles.aiAvatar}`}>
                  {msg.role === 'user' ? 'You' : 'AI'}
                </div>
                <div className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.aiBubble}`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {state.isAiTyping && (
              <div className={styles.msg}>
                <div className={`${styles.avatar} ${styles.aiAvatar}`}>AI</div>
                <div className={`${styles.bubble} ${styles.aiBubble} ${styles.typingBubble}`}>
                  <div className={styles.typingDots}>
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <textarea
              className={styles.inputBox}
              placeholder={isRecording ? '🎤 Listening...' : 'Type your answer or use voice input...'}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              disabled={state.isAiTyping}
            />
            {isSupported && (
              <button
                className={`${styles.micBtn} ${isRecording ? styles.recording : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                title={isRecording ? 'Stop recording' : 'Start voice input'}
              >
                {isRecording ? '⏹' : '🎤'}
              </button>
            )}
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={!inputText.trim() || state.isAiTyping}
            >
              ➤
            </button>
          </div>
        </div>

        {/* Side panel */}
        <div className={styles.sidePanel}>
          <div className={styles.spLabel}>Session progress</div>
          <div className={styles.progressCard}>
            <div className={styles.progressRow}>
              <span>Questions</span>
              <span className={styles.progressVal}>{state.questionCount} / {state.totalQuestions}</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(state.questionCount / state.totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          <div className={styles.spLabel}>Live scores</div>
          <div className={styles.scoresCard}>
            {([
              ['Communication',   state.liveScores.communication,  '#34d399'],
              ['Technical depth', state.liveScores.technicalDepth, '#a78bfa'],
              ['STAR format',     state.liveScores.starFormat,     '#fbbf24'],
              ['Confidence',      state.liveScores.confidence,     '#60a5fa'],
            ] as [string, number, string][]).map(([label, val, color]) => (
              <div key={label} className={styles.scoreRow}>
                <span className={styles.scoreLabel}>{label}</span>
                <span className={styles.scoreVal} style={{ color }}>{val}/10</span>
              </div>
            ))}
          </div>

          <div className={styles.spLabel}>Topics</div>
          <div className={styles.topicList}>
            {state.topics.map(t => (
              <div key={t.id} className={`${styles.topic} ${styles[t.status]}`}>
                {t.status === 'done' ? '✓ ' : t.status === 'active' ? '→ ' : ''}{t.label}
              </div>
            ))}
          </div>

          <button className={styles.endBtn} onClick={() => sendAnswer('I would like to end the interview now.')}>
            End & get scorecard
          </button>
        </div>

      </div>
    </div>
  );
}