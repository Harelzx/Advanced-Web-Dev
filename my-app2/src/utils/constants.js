/**
 * Contains all configuration for the training session difficulties.
 * This is the single source of truth to prevent code duplication.
 * Each session (from 1 to 9) has:
 *  - key: An English text identifier (for logic and component keys).
 *  - name: The Hebrew name (for UI display).
 *  - value: The numeric value (as stored in Firestore).
 */
export const SESSION_CONFIG = {
    1: { key: 'easy',   name: 'קל',      value: 1 },
    2: { key: 'easy',   name: 'קל',      value: 1 },
    3: { key: 'easy',   name: 'קל',      value: 1 },
    4: { key: 'medium', name: 'בינוני',  value: 2 },
    5: { key: 'medium', name: 'בינוני',  value: 2 },
    6: { key: 'medium', name: 'בינוני',  value: 2 },
    7: { key: 'hard',   name: 'קשה',     value: 3 },
    8: { key: 'hard',   name: 'קשה',     value: 3 },
    9: { key: 'hard',   name: 'קשה',     value: 3 },
};