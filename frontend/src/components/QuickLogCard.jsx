import { useState } from 'react';
import { Mic, MicOff, Send, AlertCircle, Wand2 } from 'lucide-react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import VoiceWave from './VoiceWave';

export default function QuickLogCard({ onParse, isParsing }) {
  const [text, setText] = useState('');

  const {
    isListening,
    startListening,
    stopListening,
    supported,
  } = useSpeechRecognition({
    onResult: (transcript) => setText(prev => prev + (prev ? ' ' : '') + transcript),
  });

  const handleSubmit = () => {
    if (!text.trim()) return;
    onParse(text, isListening ? 'voice' : 'text');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleMicToggle = () => {
    if (isListening) stopListening();
    else startListening();
  };

  return (
    <div
      className="card"
      style={{
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: isListening
          ? '2px solid var(--color-primary)'
          : '2px solid var(--color-mint-border)',
        background: '#F8FAF9',
        transition: 'border-color 0.3s',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ background: 'var(--color-primary)', color: 'white', padding: '0.5rem', borderRadius: '8px' }}>
          <Wand2 size={18} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Quick Log</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
            {isListening ? 'Listening… speak your activity' : 'Describe your activities naturally.'}
          </p>
        </div>
      </div>

      {/* Voice Animation Overlay OR Textarea */}
      {isListening ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.5rem 0',
            background: 'white',
            borderRadius: 'var(--radius-input)',
            border: '1px solid var(--color-mint-border)',
            minHeight: '120px',
            justifyContent: 'center',
          }}
        >
          <VoiceWave />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.9rem' }}>
              Recording…
            </span>
            {text && (
              <span
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-text-muted)',
                  maxWidth: '280px',
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}
              >
                "{text}"
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleMicToggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#FEE2E2',
              color: '#DC2626',
              border: 'none',
              borderRadius: '999px',
              padding: '0.5rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <MicOff size={16} /> Stop Recording
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <textarea
            className="form-control"
            placeholder="E.g., I drove 12 km to college and had a veg meal..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isParsing}
            rows={3}
            style={{
              width: '100%',
              resize: 'none',
              paddingRight: '3rem',
              fontSize: '1rem',
              lineHeight: 1.5,
              background: 'white',
            }}
          />
          {supported && (
            <button
              type="button"
              onClick={handleMicToggle}
              title="Toggle voice input"
              style={{
                position: 'absolute',
                right: '0.75rem',
                bottom: '0.75rem',
                padding: '0.5rem',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                background: 'transparent',
                color: 'var(--color-text-muted)',
                transition: 'all 0.2s',
              }}
            >
              <Mic size={20} />
            </button>
          )}
        </div>
      )}

      {/* Example chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        {['Bus 5 km to work', 'Had a veg meal', 'Used 150 kWh of electricity'].map((eg, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { stopListening(); setText(eg); }}
            className="badge badge-gray"
            style={{
              cursor: 'pointer',
              background: 'white',
              border: '1px solid #E5E7EB',
              padding: '0.4rem 0.75rem',
            }}
          >
            {eg}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid #E5E7EB',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={14} />
          Your text is sent to our AI provider to extract activities.
        </div>

        <button
          onClick={handleSubmit}
          disabled={isParsing || !text.trim()}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem' }}
        >
          {isParsing ? 'Parsing…' : 'Parse'}
          <Send size={16} />
        </button>
      </div>

      {/* Skeleton shimmer while AI is parsing */}
      {isParsing && (
        <div style={{ marginTop: '1rem' }}>
          <div className="skeleton skeleton-text long" />
          <div className="skeleton skeleton-text medium" />
          <div className="skeleton skeleton-text short" />
        </div>
      )}
    </div>
  );
}
