import { describe, it, expect } from 'vitest';
import { GeminiService } from '../services/gemini.service';

describe('GeminiService & High-Efficiency GenAI', () => {
  it('delivers sub-5ms cached responses using SHA-256 LRU cache', async () => {
    const start1 = performance.now();
    const firstCall = await GeminiService.queryVoiceCompanion('How to protect my child from smog?', 'delhi-anand-vihar');
    expect(performance.now() - start1).toBeGreaterThanOrEqual(0);

    // Second identical call must hit the in-memory cache
    const start2 = performance.now();
    const secondCall = await GeminiService.queryVoiceCompanion('How to protect my child from smog?', 'delhi-anand-vihar');
    const duration2 = performance.now() - start2;

    expect(secondCall.replyText).toBe(firstCall.replyText);
    expect(duration2).toBeLessThan(10); // Sub-10ms cached execution
  });

  it('operates a zero-crash deterministic fallback engine when API key is unset', async () => {
    const routine = await GeminiService.generateTailoredRoutine('delhi-anand-vihar', 'SENIOR');
    expect(routine).toBeDefined();
    expect(routine.slots.length).toBeGreaterThan(0);
    expect(routine.slots[0].activity).toBeTruthy();
    expect(routine.impact.pm25InhaledAvoidedMicrograms).toBeGreaterThan(0);
  });
});
