'use client';

import React, { useState } from 'react';
import { Sparkles, Mic, MicOff, Volume2, X, Send } from 'lucide-react';
import { VoiceAssistantResponse } from '@/lib/types';

interface VoiceCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCityName: string;
  currentAqi: number;
}

interface SpeechRecognitionEventLike {
  results: Array<{ 0: { transcript: string } }>;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

export const VoiceCompanionModal: React.FC<VoiceCompanionModalProps> = ({
  isOpen,
  onClose,
  currentCityName,
  currentAqi,
}) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<VoiceAssistantResponse | null>(null);

  if (!isOpen) return null;

  const handleSpeak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceListen = () => {
    if (typeof window === 'undefined') return;
    const speechWindow = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your question.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleAsk(transcript);
    };

    recognition.start();
  };

  const handleAsk = async (textToAsk?: string) => {
    const q = textToAsk || query;
    if (!q.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryText: q,
          locationCity: currentCityName,
          currentAqi,
        }),
      });

      if (res.ok) {
        const data: VoiceAssistantResponse = await res.json();
        setResponse(data);
        handleSpeak(data.replyText);
      }
    } catch (err) {
      console.error('Companion error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Is it safe for my child with asthma to play outside right now?',
    'How do I build a Corsi-Rosenthal clean air box?',
    'What is the safest commute option during this morning inversion?',
    'When should I open my windows today for ventilation?',
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vayu-title"
      >
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 touch-target"
          aria-label="Close Vayu Companion"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 id="vayu-title" className="text-xl font-extrabold text-slate-900 dark:text-white">
              Vayu AI — Voice Clean-Air Companion
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conversational guidance for {currentCityName} (AQI: {currentAqi})
            </p>
          </div>
        </div>

        {/* Quick prompt pills */}
        <div className="space-y-1.5 mb-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Suggested Inquiries:</span>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(p);
                  handleAsk(p);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-medium hover:bg-sky-50 dark:hover:bg-sky-950 hover:text-sky-600 transition"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask anything about smog, masks, routines..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium touch-target"
          />

          <button
            onClick={handleVoiceListen}
            className={`p-3 rounded-xl border transition touch-target ${
              isListening
                ? 'bg-red-500 text-white animate-pulse border-red-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
            title="Speak query"
            aria-label="Activate voice speech input"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => handleAsk()}
            disabled={isLoading}
            className="p-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow transition touch-target disabled:opacity-50"
            aria-label="Submit question"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Response Box */}
        {isLoading && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center text-sm font-semibold text-slate-600 dark:text-slate-300 animate-pulse">
            Vayu AI is consulting atmospheric data and formulating protective recommendations...
          </div>
        )}

        {response && !isLoading && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/40 border border-sky-200 dark:border-sky-800 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                "{response.replyText}"
              </p>
              <button
                onClick={() => handleSpeak(response.replyText)}
                className="p-2 rounded-lg bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200 shrink-0 touch-target"
                title="Read aloud"
                aria-label="Read reply aloud"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500 block">Recommended Action Steps:</span>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300">
                {response.recommendedActions.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-sky-200 dark:border-sky-800 text-[11px] text-sky-800 dark:text-sky-300 font-semibold">
              Impact: {response.impactSummary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
