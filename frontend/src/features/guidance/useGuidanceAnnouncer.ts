import { useCallback, useEffect, useRef, useState } from 'react';
import type { DrivingGuidanceRule, GuidancePriority } from './types';
import { configureWayfarerVoice } from './guidanceApi';

type QueueItem = { key: string; rule: DrivingGuidanceRule };
const priorityRank: Record<GuidancePriority, number> = { CRITICAL: 0, HIGH: 1, NORMAL: 2, INFO: 3 };

export function useGuidanceAnnouncer(enabled: boolean) {
  const queue = useRef<QueueItem[]>([]);
  const speaking = useRef(false);
  const announcedAt = useRef(new Map<string, number>());
  const [status, setStatus] = useState('Waiting for Start Driving');

  const speakNext = useCallback(() => {
    if (!enabled || speaking.current || queue.current.length === 0) return;
    if (!('speechSynthesis' in window)) {
      setStatus('Speech unavailable');
      queue.current = [];
      return;
    }
    const item = queue.current.shift()!;
    const utterance = configureWayfarerVoice(new SpeechSynthesisUtterance(item.rule.message), 1);
    speaking.current = true;
    setStatus(`Speaking ${item.rule.priority.toLowerCase()} guidance`);
    const finish = () => {
      speaking.current = false;
      setStatus(queue.current.length ? 'Next guidance queued' : 'Guidance played');
      window.setTimeout(speakNext, 120);
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
  }, [enabled]);

  const announce = useCallback((rule: DrivingGuidanceRule, instanceId: string) => {
    if (!enabled || !rule.verified) return false;
    const key = `${rule.id}:${instanceId}`;
    const now = Date.now();
    const last = announcedAt.current.get(rule.id) ?? 0;
    if (announcedAt.current.has(key) || now - last < rule.cooldownSeconds * 1000) return false;
    announcedAt.current.set(key, now);
    announcedAt.current.set(rule.id, now);
    queue.current.push({ key, rule });
    queue.current.sort((a, b) => priorityRank[a.rule.priority] - priorityRank[b.rule.priority]);
    speakNext();
    return true;
  }, [enabled, speakNext]);

  useEffect(() => {
    if (enabled) return;
    queue.current = [];
    speaking.current = false;
    window.speechSynthesis?.cancel();
    setStatus('Waiting for Start Driving');
  }, [enabled]);

  useEffect(() => () => {
    queue.current = [];
    window.speechSynthesis?.cancel();
  }, []);

  return { announce, status };
}
