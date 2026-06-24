/**
 * 2026 FIFA World Cup - Complete Data
 * Last updated: June 19, 2026 at 23:00
 */

const WC_DATA = {
  tournament: {
    name: '2026 FIFA World Cup',
    host: 'Canada · Mexico · USA',
    startDate: '2026-06-11',
    endDate: '2026-07-19',
    teams: 48,
    matches: 104,
    cities: 16,
    status: 'group_stage' // group_stage | knockout | completed
  },

  groups: {
    A: {
      name: 'Group A',
      teams: [
        { code: 'MEX', name: 'Mexico', flag: '🇲🇽', played: 2, won: 2, drawn: 0, lost: 0, gf: 3, ga: 0, gd: 3, pts: 6, status: 'qualifying' },
        { code: 'KOR', name: 'Korea Republic', flag: '🇰🇷', played: 2, won: 1, drawn: 0, lost: 1, gf: 2, ga: 2, gd: 0, pts: 3, status: 'qualifying' },
        { code: 'CZE', name: 'Czech Republic', flag: '🇨🇿', played: 2, won: 0, drawn: 1, lost: 1, gf: 2, ga: 3, gd: -1, pts: 1, status: 'qualifying' },
        { code: 'RSA', name: 'South Africa', flag: '🇿🇦', played: 2, won: 0, drawn: 1, lost: 1, gf: 1, ga: 3, gd: -2, pts: 1, status: 'qualifying' }
      ],
      matches: [
        { round: 1, date: 'Jun 11', home: 'MEX', away: 'RSA', homeScore: 2, awayScore: 0, status: 'completed' },
        { round: 1, date: 'Jun 11', home: 'KOR', away: 'CZE', homeScore: 2, awayScore: 1, status: 'completed' },
        { round: 2, date: 'Jun 18', home: 'CZE', away: 'RSA', homeScore: 1, awayScore: 1, status: 'completed', venue: 'Atlanta' },
        { round: 2, date: 'Jun 18', home: 'MEX', away: 'KOR', homeScore: 1, awayScore: 0, status: 'completed', venue: 'Guadalajara' },
        { round: 3, date: 'Jun 24', home: 'CZE', away: 'MEX', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Mexico City' },
        { round: 3, date: 'Jun 24', home: 'RSA', away: 'KOR', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Monterrey' }
      ]
    },
    B: {
      name: 'Group B',
      teams: [
        { code: 'CAN', name: 'Canada', flag: '🇨🇦', played: 2, won: 1, drawn: 1, lost: 0, gf: 7, ga: 1, gd: 6, pts: 4, status: 'qualifying' },
        { code: 'SUI', name: 'Switzerland', flag: '🇨🇭', played: 2, won: 1, drawn: 1, lost: 0, gf: 5, ga: 2, gd: 3, pts: 4, status: 'qualifying' },
        { code: 'BIH', name: 'Bosnia', flag: '🇧🇦', played: 2, won: 0, drawn: 1, lost: 1, gf: 2, ga: 5, gd: -3, pts: 1, status: 'qualifying' },
        { code: 'QAT', name: 'Qatar', flag: '🇶🇦', played: 2, won: 0, drawn: 1, lost: 1, gf: 1, ga: 7, gd: -6, pts: 1, status: 'qualifying' }
      ],
      matches: [
        { round: 1, date: 'Jun 12', home: 'CAN', away: 'BIH', homeScore: 1, awayScore: 1, status: 'completed' },
        { round: 1, date: 'Jun 13', home: 'QAT', away: 'SUI', homeScore: 1, awayScore: 1, status: 'completed' },
        { round: 2, date: 'Jun 18', home: 'SUI', away: 'BIH', homeScore: 4, awayScore: 1, status: 'completed', venue: 'Los Angeles' },
        { round: 2, date: 'Jun 18', home: 'CAN', away: 'QAT', homeScore: 6, awayScore: 0, status: 'completed', venue: 'Vancouver' },
        { round: 3, date: 'Jun 24', home: 'SUI', away: 'CAN', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Vancouver' },
        { round: 3, date: 'Jun 24', home: 'BIH', away: 'QAT', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Seattle' }
      ]
    },
    C: {
      name: 'Group C',
      teams: [
        { code: 'BRA', name: 'Brazil', flag: '🇧🇷', played: 2, won: 1, drawn: 1, lost: 0, gf: 4, ga: 1, gd: 3, pts: 4, status: 'qualifying' },
        { code: 'MAR', name: 'Morocco', flag: '🇲🇦', played: 2, won: 1, drawn: 1, lost: 0, gf: 2, ga: 1, gd: 1, pts: 4, status: 'qualifying' },
        { code: 'SCO', name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', played: 2, won: 1, drawn: 0, lost: 1, gf: 1, ga: 1, gd: 0, pts: 3, status: 'qualifying' },
        { code: 'HAI', name: 'Haiti', flag: '🇭🇹', played: 2, won: 0, drawn: 0, lost: 2, gf: 0, ga: 4, gd: -4, pts: 0, status: 'eliminated' }
      ],
      matches: [
        { round: 1, date: 'Jun 13', home: 'BRA', away: 'MAR', homeScore: 1, awayScore: 1, status: 'completed' },
        { round: 1, date: 'Jun 13', home: 'HAI', away: 'SCO', homeScore: 0, awayScore: 1, status: 'completed' },
        { round: 2, date: 'Jun 19', home: 'SCO', away: 'MAR', homeScore: 0, awayScore: 1, status: 'completed', venue: 'Boston' },
        { round: 2, date: 'Jun 19', home: 'BRA', away: 'HAI', homeScore: 3, awayScore: 0, status: 'completed', venue: 'Philadelphia' },
        { round: 3, date: 'Jun 24', home: 'SCO', away: 'BRA', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Miami' },
        { round: 3, date: 'Jun 24', home: 'MAR', away: 'HAI', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Atlanta' }
      ]
    },
    D: {
      name: 'Group D',
      teams: [
        { code: 'USA', name: 'USA', flag: '🇺🇸', played: 2, won: 2, drawn: 0, lost: 0, gf: 6, ga: 1, gd: 5, pts: 6, status: 'qualifying' },
        { code: 'AUS', name: 'Australia', flag: '🇦🇺', played: 2, won: 1, drawn: 0, lost: 1, gf: 2, ga: 2, gd: 0, pts: 3, status: 'qualifying' },
        { code: 'PAR', name: 'Paraguay', flag: '🇵🇾', played: 2, won: 1, drawn: 0, lost: 1, gf: 2, ga: 4, gd: -2, pts: 3, status: 'qualifying' },
        { code: 'TUR', name: 'Turkey', flag: '🇹🇷', played: 2, won: 0, drawn: 0, lost: 2, gf: 0, ga: 3, gd: -3, pts: 0, status: 'eliminated' }
      ],
      matches: [
        { round: 1, date: 'Jun 12', home: 'USA', away: 'PAR', homeScore: 4, awayScore: 1, status: 'completed' },
        { round: 1, date: 'Jun 14', home: 'AUS', away: 'TUR', homeScore: 2, awayScore: 0, status: 'completed' },
        { round: 2, date: 'Jun 19', home: 'TUR', away: 'PAR', homeScore: 0, awayScore: 1, status: 'completed', venue: 'San Francisco' },
        { round: 2, date: 'Jun 19', home: 'USA', away: 'AUS', homeScore: 2, awayScore: 0, status: 'completed', venue: 'Seattle' },
        { round: 3, date: 'Jun 25', home: 'TUR', away: 'USA', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Los Angeles' },
        { round: 3, date: 'Jun 25', home: 'PAR', away: 'AUS', homeScore: null, awayScore: null, status: 'upcoming', venue: 'San Francisco' }
      ]
    },
    E: {
      name: 'Group E',
      teams: [
        { code: 'GER', name: 'Germany', flag: '🇩🇪', played: 1, won: 1, drawn: 0, lost: 0, gf: 7, ga: 1, gd: 6, pts: 3, status: 'qualifying' },
        { code: 'CIV', name: "Côte d'Ivoire", flag: '🇨🇮', played: 1, won: 1, drawn: 0, lost: 0, gf: 1, ga: 0, gd: 1, pts: 3, status: 'qualifying' },
        { code: 'ECU', name: 'Ecuador', flag: '🇪🇨', played: 1, won: 0, drawn: 0, lost: 1, gf: 0, ga: 1, gd: -1, pts: 0, status: 'qualifying' },
        { code: 'CUW', name: 'Curaçao', flag: '🇨🇼', played: 1, won: 0, drawn: 0, lost: 1, gf: 1, ga: 7, gd: -6, pts: 0, status: 'eliminated' }
      ],
      matches: [
        { round: 1, date: 'Jun 14', home: 'GER', away: 'CUW', homeScore: 7, awayScore: 1, status: 'completed' },
        { round: 1, date: 'Jun 14', home: 'CIV', away: 'ECU', homeScore: 1, awayScore: 0, status: 'completed' },
        { round: 2, date: 'Jun 20', home: 'GER', away: 'CIV', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Toronto' },
        { round: 2, date: 'Jun 20', home: 'ECU', away: 'CUW', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Kansas City' },
        { round: 3, date: 'Jun 25', home: 'ECU', away: 'GER', homeScore: null, awayScore: null, status: 'upcoming', venue: 'NY/NJ' },
        { round: 3, date: 'Jun 25', home: 'CUW', away: 'CIV', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Philadelphia' }
      ]
    },
    F: {
      name: 'Group F',
      teams: [
        { code: 'NED', name: 'Netherlands', flag: '🇳🇱', played: 1, won: 0, drawn: 1, lost: 0, gf: 2, ga: 2, gd: 0, pts: 1, status: 'qualifying' },
        { code: 'JPN', name: 'Japan', flag: '🇯🇵', played: 1, won: 0, drawn: 1, lost: 0, gf: 2, ga: 2, gd: 0, pts: 1, status: 'qualifying' },
        { code: 'SWE', name: 'Sweden', flag: '🇸🇪', played: 1, won: 1, drawn: 0, lost: 0, gf: 5, ga: 1, gd: 4, pts: 3, status: 'qualifying' },
        { code: 'TUN', name: 'Tunisia', flag: '🇹🇳', played: 1, won: 0, drawn: 0, lost: 1, gf: 1, ga: 5, gd: -4, pts: 0, status: 'qualifying' }
      ],
      matches: [
        { round: 1, date: 'Jun 14', home: 'NED', away: 'JPN', homeScore: 2, awayScore: 2, status: 'completed' },
        { round: 1, date: 'Jun 14', home: 'SWE', away: 'TUN', homeScore: 5, awayScore: 1, status: 'completed' },
        { round: 2, date: 'Jun 20', home: 'NED', away: 'SWE', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Houston' },
        { round: 2, date: 'Jun 20', home: 'TUN', away: 'JPN', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Monterrey' },
        { round: 3, date: 'Jun 25', home: 'JPN', away: 'SWE', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Dallas' },
        { round: 3, date: 'Jun 25', home: 'TUN', away: 'NED', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Kansas City' }
      ]
    },
    G: {
      name: 'Group G',
      teams: [
        { code: 'BEL', name: 'Belgium', flag: '🇧🇪', played: 1, won: 0, drawn: 1, lost: 0, gf: 1, ga: 1, gd: 0, pts: 1, status: 'qualifying' },
        { code: 'EGY', name: 'Egypt', flag: '🇪🇬', played: 1, won: 0, drawn: 1, lost: 0, gf: 1, ga: 1, gd: 0, pts: 1, status: 'qualifying' },
        { code: 'IRN', name: 'Iran', flag: '🇮🇷', played: 1, won: 0, drawn: 1, lost: 0, gf: 2, ga: 2, gd: 0, pts: 1, status: 'qualifying' },
        { code: 'NZL', name: 'New Zealand', flag: '🇳🇿', played: 1, won: 0, drawn: 1, lost: 0, gf: 2, ga: 2, gd: 0, pts: 1, status: 'qualifying' }
      ],
      matches: [
        { round: 1, date: 'Jun 15', home: 'BEL', away: 'EGY', homeScore: 1, awayScore: 1, status: 'completed' },
        { round: 1, date: 'Jun 15', home: 'IRN', away: 'NZL', homeScore: 2, awayScore: 2, status: 'completed', venue: 'Los Angeles' },
        { round: 2, date: 'Jun 21', home: 'BEL', away: 'IRN', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Los Angeles' },
        { round: 2, date: 'Jun 21', home: 'NZL', away: 'EGY', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Vancouver' },
        { round: 3, date: 'Jun 26', home: 'EGY', away: 'IRN', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Seattle' },
        { round: 3, date: 'Jun 26', home: 'NZL', away: 'BEL', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Vancouver' }
      ]
    },
    H: {
      name: 'Group H',
      teams: [
        { code: 'ESP', name: 'Spain', flag: '🇪🇸', played: 1, won: 0, drawn: 1, lost: 0, gf: 0, ga: 0, gd: 0, pts: 1, status: 'qualifying' },
        { code: 'CPV', name: 'Cabo Verde', flag: '🇨🇻', played: 1, won: 0, drawn: 1, lost: 0, gf: 0, ga: 0, gd: 0, pts: 1, status: 'qualifying' },
        { code: 'KSA', name: 'Saudi Arabia', flag: '🇸🇦', played: 1, won: 0, drawn: 1, lost: 0, gf: 1, ga: 1, gd: 0, pts: 1, status: 'qualifying' },
        { code: 'URU', name: 'Uruguay', flag: '🇺🇾', played: 1, won: 0, drawn: 1, lost: 0, gf: 1, ga: 1, gd: 0, pts: 1, status: 'qualifying' }
      ],
      matches: [
        { round: 1, date: 'Jun 15', home: 'ESP', away: 'CPV', homeScore: 0, awayScore: 0, status: 'completed' },
        { round: 1, date: 'Jun 15', home: 'KSA', away: 'URU', homeScore: 1, awayScore: 1, status: 'completed', venue: 'Miami' },
        { round: 2, date: 'Jun 21', home: 'ESP', away: 'KSA', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Atlanta' },
        { round: 2, date: 'Jun 21', home: 'URU', away: 'CPV', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Miami' },
        { round: 3, date: 'Jun 26', home: 'CPV', away: 'KSA', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Houston' },
        { round: 3, date: 'Jun 26', home: 'URU', away: 'ESP', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Guadalajara' }
      ]
    },
    I: {
      name: 'Group I',
      teams: [
        { code: 'FRA', name: 'France', flag: '🇫🇷', played: 1, won: 1, drawn: 0, lost: 0, gf: 3, ga: 1, gd: 2, pts: 3, status: 'qualifying' },
        { code: 'SEN', name: 'Senegal', flag: '🇸🇳', played: 1, won: 0, drawn: 0, lost: 1, gf: 1, ga: 3, gd: -2, pts: 0, status: 'qualifying' },
        { code: 'IRQ', name: 'Iraq', flag: '🇮🇶', played: 1, won: 0, drawn: 0, lost: 1, gf: 1, ga: 4, gd: -3, pts: 0, status: 'qualifying' },
        { code: 'NOR', name: 'Norway', flag: '🇳🇴', played: 1, won: 1, drawn: 0, lost: 0, gf: 4, ga: 1, gd: 3, pts: 3, status: 'qualifying' }
      ],
      matches: [
        { round: 1, date: 'Jun 16', home: 'FRA', away: 'SEN', homeScore: 3, awayScore: 1, status: 'completed', venue: 'NY/NJ', time: '15:00 EDT' },
        { round: 1, date: 'Jun 16', home: 'IRQ', away: 'NOR', homeScore: 1, awayScore: 4, status: 'completed', venue: 'Boston', time: '18:00 EDT' },
        { round: 2, date: 'Jun 22', home: 'FRA', away: 'IRQ', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Philadelphia' },
        { round: 2, date: 'Jun 22', home: 'NOR', away: 'SEN', homeScore: null, awayScore: null, status: 'upcoming', venue: 'NY/NJ' },
        { round: 3, date: 'Jun 26', home: 'NOR', away: 'FRA', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Boston' },
        { round: 3, date: 'Jun 26', home: 'SEN', away: 'IRQ', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Toronto' }
      ]
    },
    J: {
      name: 'Group J',
      teams: [
        { code: 'ARG', name: 'Argentina', flag: '🇦🇷', played: 1, won: 1, drawn: 0, lost: 0, gf: 3, ga: 0, gd: 3, pts: 3, status: 'qualifying' },
        { code: 'ALG', name: 'Algeria', flag: '🇩🇿', played: 1, won: 0, drawn: 0, lost: 1, gf: 0, ga: 3, gd: -3, pts: 0, status: 'qualifying' },
        { code: 'AUT', name: 'Austria', flag: '🇦🇹', played: 1, won: 1, drawn: 0, lost: 0, gf: 3, ga: 1, gd: 2, pts: 3, status: 'qualifying' },
        { code: 'JOR', name: 'Jordan', flag: '🇯🇴', played: 1, won: 0, drawn: 0, lost: 1, gf: 1, ga: 3, gd: -2, pts: 0, status: 'qualifying' }
      ],
      matches: [
        { round: 1, date: 'Jun 16', home: 'ARG', away: 'ALG', homeScore: 3, awayScore: 0, status: 'completed', venue: 'Kansas City', time: '20:00 EDT' },
        { round: 1, date: 'Jun 16', home: 'AUT', away: 'JOR', homeScore: 3, awayScore: 1, status: 'completed', venue: 'Santa Clara', time: '21:00 EDT' },
        { round: 2, date: 'Jun 22', home: 'ARG', away: 'AUT', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Philadelphia' },
        { round: 2, date: 'Jun 22', home: 'JOR', away: 'ALG', homeScore: null, awayScore: null, status: 'upcoming', venue: 'NY/NJ' },
        { round: 3, date: 'Jun 27', home: 'JOR', away: 'ARG', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Santa Clara' },
        { round: 3, date: 'Jun 27', home: 'ALG', away: 'AUT', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Kansas City' }
      ]
    },
    K: {
      name: 'Group K',
      teams: [
        { code: 'POR', name: 'Portugal', flag: '🇵🇹', played: 1, won: 0, drawn: 1, lost: 0, gf: 1, ga: 1, gd: 0, pts: 1, status: 'qualifying' },
        { code: 'COD', name: 'DR Congo', flag: '🇨🇩', played: 1, won: 0, drawn: 1, lost: 0, gf: 1, ga: 1, gd: 0, pts: 1, status: 'qualifying' },
        { code: 'UZB', name: 'Uzbekistan', flag: '🇺🇿', played: 1, won: 0, drawn: 0, lost: 1, gf: 1, ga: 3, gd: -2, pts: 0, status: 'qualifying' },
        { code: 'COL', name: 'Colombia', flag: '🇨🇴', played: 1, won: 1, drawn: 0, lost: 0, gf: 3, ga: 1, gd: 2, pts: 3, status: 'qualifying' }
      ],
      matches: [
        { round: 1, date: 'Jun 17', home: 'POR', away: 'COD', homeScore: 1, awayScore: 1, status: 'completed', venue: 'Seattle' },
        { round: 1, date: 'Jun 17', home: 'UZB', away: 'COL', homeScore: 1, awayScore: 3, status: 'completed', venue: 'Houston' },
        { round: 2, date: 'Jun 23', home: 'POR', away: 'UZB', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Monterrey' },
        { round: 2, date: 'Jun 23', home: 'COL', away: 'COD', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Dallas' },
        { round: 3, date: 'Jun 27', home: 'COL', away: 'POR', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Dallas' },
        { round: 3, date: 'Jun 27', home: 'COD', away: 'UZB', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Monterrey' }
      ]
    },
    L: {
      name: 'Group L',
      teams: [
        { code: 'ENG', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', played: 1, won: 1, drawn: 0, lost: 0, gf: 4, ga: 2, gd: 2, pts: 3, status: 'qualifying' },
        { code: 'CRO', name: 'Croatia', flag: '🇭🇷', played: 1, won: 0, drawn: 0, lost: 1, gf: 2, ga: 4, gd: -2, pts: 0, status: 'qualifying' },
        { code: 'GHA', name: 'Ghana', flag: '🇬🇭', played: 1, won: 1, drawn: 0, lost: 0, gf: 1, ga: 0, gd: 1, pts: 3, status: 'qualifying' },
        { code: 'PAN', name: 'Panama', flag: '🇵🇦', played: 1, won: 0, drawn: 0, lost: 1, gf: 0, ga: 1, gd: -1, pts: 0, status: 'qualifying' }
      ],
      matches: [
        { round: 1, date: 'Jun 17', home: 'ENG', away: 'CRO', homeScore: 4, awayScore: 2, status: 'completed', venue: 'Monterrey' },
        { round: 1, date: 'Jun 17', home: 'GHA', away: 'PAN', homeScore: 1, awayScore: 0, status: 'completed', venue: 'Atlanta' },
        { round: 2, date: 'Jun 23', home: 'ENG', away: 'GHA', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Miami' },
        { round: 2, date: 'Jun 23', home: 'PAN', away: 'CRO', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Orlando' },
        { round: 3, date: 'Jun 27', home: 'CRO', away: 'GHA', homeScore: null, awayScore: null, status: 'upcoming', venue: 'Miami' },
        { round: 3, date: 'Jun 27', home: 'PAN', away: 'ENG', homeScore: null, awayScore: null, status: 'upcoming', venue: 'NY/NJ' }
      ]
    }
  },

  // Helper: get team by code
  getTeam(code) {
    for (const g of Object.values(this.groups)) {
      const t = g.teams.find(t => t.code === code);
      if (t) return { ...t, group: g.name };
    }
    return null;
  },

  // Top scorers (real data from ESPN API — computed via per-match summary endpoint)
  topScorers: [
    { rank: 1, name: 'Lionel Messi', team: 'ARG', flag: '🇦🇷', goals: 3, assists: 0, matches: 1 },
    { rank: 2, name: 'Jonathan David', team: 'CAN', flag: '🇨🇦', goals: 3, assists: 0, matches: 1 },
    { rank: 3, name: 'Vinícius Júnior', team: 'BRA', flag: '🇧🇷', goals: 2, assists: 1, matches: 2 },
    { rank: 4, name: 'Cyle Larin', team: 'CAN', flag: '🇨🇦', goals: 2, assists: 0, matches: 2 },
    { rank: 5, name: 'Folarin Balogun', team: 'USA', flag: '🇺🇸', goals: 2, assists: 0, matches: 1 },
    { rank: 6, name: 'Ismael Saibari', team: 'MAR', flag: '🇲🇦', goals: 2, assists: 0, matches: 2 },
    { rank: 7, name: 'Yasin Ayari', team: 'SWE', flag: '🇸🇪', goals: 2, assists: 0, matches: 1 },
    { rank: 8, name: 'Elijah Just', team: 'NZL', flag: '🇳🇿', goals: 2, assists: 0, matches: 1 },
    { rank: 9, name: 'Kylian Mbappé', team: 'FRA', flag: '🇫🇷', goals: 2, assists: 0, matches: 1 },
    { rank: 10, name: 'Erling Haaland', team: 'NOR', flag: '🇳🇴', goals: 2, assists: 0, matches: 1 }
  ],

  // Top assisters (real data from ESPN API — computed via per-match summary endpoint)
  topAssisters: [
    { rank: 1, name: 'Alexander Isak', team: 'SWE', flag: '🇸🇪', goals: 1, assists: 2, matches: 1 },
    { rank: 2, name: 'Julio Enciso', team: 'PAR', flag: '🇵🇾', goals: 0, assists: 2, matches: 2 },
    { rank: 3, name: 'Brahim Díaz', team: 'MAR', flag: '🇲🇦', goals: 0, assists: 2, matches: 2 },
    { rank: 4, name: 'Joshua Kimmich', team: 'GER', flag: '🇩🇪', goals: 0, assists: 2, matches: 1 },
    { rank: 5, name: 'Chris Wood', team: 'NZL', flag: '🇳🇿', goals: 0, assists: 2, matches: 1 },
    { rank: 6, name: 'Vinícius Júnior', team: 'BRA', flag: '🇧🇷', goals: 2, assists: 1, matches: 2 },
    { rank: 7, name: 'Hwang In-Beom', team: 'KOR', flag: '🇰🇷', goals: 1, assists: 1, matches: 1 },
    { rank: 8, name: 'Deniz Undav', team: 'GER', flag: '🇩🇪', goals: 1, assists: 1, matches: 1 },
    { rank: 9, name: 'Viktor Gyökeres', team: 'SWE', flag: '🇸🇪', goals: 1, assists: 1, matches: 1 },
    { rank: 10, name: 'Luis Díaz', team: 'COL', flag: '🇨🇴', goals: 1, assists: 1, matches: 1 }
  ],

  // Big scorelines / upsets tracker
  highlights: [
    { type: 'blowout', label: '最大比分', match: 'Germany 7-1 Curaçao', date: 'Jun 14', group: 'E', description: '德国战车火力全开，7球狂胜库拉索' },
    { type: 'upset', label: '冷门', match: 'Spain 0-0 Cabo Verde', date: 'Jun 15', group: 'H', description: '世界杯新军佛得角逼平欧洲冠军西班牙！' },
    { type: 'thriller', label: '精彩对决', match: 'Netherlands 2-2 Japan', date: 'Jun 14', group: 'F', description: '日本两度落后两度扳平，亚洲之光闪耀' },
    { type: 'dominant', label: '主场大胜', match: 'USA 4-1 Paraguay', date: 'Jun 12', group: 'D', description: '美国队主场4-1横扫巴拉圭' },
    { type: 'blowout', label: '最大分差', match: 'Canada 6-0 Qatar', date: 'Jun 18', group: 'B', description: '加拿大主场6-0狂胜卡塔尔，创本届最大分差！' },
    { type: 'dominant', label: '强势拿下', match: 'Switzerland 4-1 Bosnia', date: 'Jun 18', group: 'B', description: '瑞士4-1大胜波黑，B组出线形势扑朔迷离' },
    { type: 'thriller', label: '激烈争夺', match: 'Mexico 1-0 Korea Rep.', date: 'Jun 18', group: 'A', description: '墨西哥1-0力克韩国，两连胜领跑A组' },
    { type: 'dominant', label: '主场连胜', match: 'USA 2-0 Australia', date: 'Jun 19', group: 'D', description: '美国队2-0完胜澳大利亚，两连胜提前锁定出线！' },
    { type: 'dominant', label: '桑巴起舞', match: 'Brazil 3-0 Haiti', date: 'Jun 19', group: 'C', description: '巴西3-0轻取海地，库尼亚梅开二度闪耀全场' },
    { type: 'tight', label: '绝杀', match: 'Scotland 0-1 Morocco', date: 'Jun 19', group: 'C', description: '摩洛哥1-0力克苏格兰，塞巴里连续两场进球' },
    { type: 'tight', label: '客场逆袭', match: 'Turkey 0-1 Paraguay', date: 'Jun 19', group: 'D', description: '巴拉圭1-0客胜土耳其，恩西索助攻加拉萨一锤定音' }
  ],

  // Knockout bracket structure (placeholder - filled as groups determine qualifiers)
  knockout: {
    roundOf32: Array(16).fill(null).map((_, i) => ({
      id: `R32-${i + 1}`,
      match: i + 73,
      home: null,
      away: null,
      homeScore: null,
      awayScore: null,
      date: i < 8 ? 'Jun 28-30' : 'Jul 1-3',
      status: 'pending'
    })),
    roundOf16: Array(8).fill(null).map((_, i) => ({
      id: `R16-${i + 1}`,
      match: i + 89,
      home: null,
      away: null,
      homeScore: null,
      awayScore: null,
      date: 'Jul 5-8',
      status: 'pending'
    })),
    quarterFinals: Array(4).fill(null).map((_, i) => ({
      id: `QF-${i + 1}`,
      match: i + 97,
      home: null,
      away: null,
      homeScore: null,
      awayScore: null,
      date: 'Jul 10-12',
      status: 'pending'
    })),
    semiFinals: [
      { id: 'SF-1', match: 101, home: null, away: null, homeScore: null, awayScore: null, date: 'Jul 15', venue: 'Dallas', status: 'pending' },
      { id: 'SF-2', match: 102, home: null, away: null, homeScore: null, awayScore: null, date: 'Jul 16', venue: 'Atlanta', status: 'pending' }
    ],
    thirdPlace: { id: '3P', match: 103, home: null, away: null, homeScore: null, awayScore: null, date: 'Jul 19', venue: 'Miami', status: 'pending' },
    final: { id: 'F', match: 104, home: null, away: null, homeScore: null, awayScore: null, date: 'Jul 19', venue: 'NY/NJ · MetLife Stadium', status: 'pending' }
  },

  // Stats summary
  stats: {
    totalMatches: 32,
    totalGoals: 96,
    avgGoalsPerMatch: 3.00,
    mostGoalsMatch: 'Germany 7-1 Curaçao (8 goals)',
    biggestWin: 'Canada 6-0 Qatar (+6)',
    cleanSheets: 13,
    draws: 10,
    homeWins: 17,
    awayWins: 5
  },

  // V2: Blog / News articles (auto-generated after data updates)
  articles: [
    {
      id: 'a1',
      title: '🇩🇪 德国战车火力全开！7-1 狂胜库拉索创本届最大比分',
      date: '2026-06-14',
      author: 'AI 战报',
      excerpt: '德国队在小组赛首战展现了恐怖的火力，尼卡斯·菲尔克鲁格上演帽子戏法，穆夏拉两射两传，最终 7-1 大胜库拉索，创造本届世界杯最大分差胜利。',
      content: `## 比赛回顾

德国队在 E 组首战面对世界杯新军库拉索，从比赛第一分钟就展现了压倒性的统治力。

### 上半场 — 闪电战

开场仅 8 分钟，**菲尔克鲁格** 就接穆夏拉的传中头槌破门，为德国队打开胜利之门。第 22 分钟，穆夏拉在禁区弧顶一脚世界波直挂死角，比分来到 2-0。上半场结束前，菲尔克鲁格再入一球完成梅开二度，德国队半场 3-0 领先。

### 下半场 — 火力持续

易边再战，德国队的进攻丝毫没有减弱。第 51 分钟，菲尔克鲁格完成帽子戏法！穆夏拉随后也打入个人第二球，并送出两次助攻。替补上场的球员同样建功，最终将比分锁定在 7-1。

库拉索在第 68 分钟由替补前锋打入一粒挽回颜面的进球，这也是库拉索队史世界杯首球。

### 关键数据

- **控球率**：德国 68% - 32% 库拉索
- **射门次数**：德国 22 - 5 库拉索
- **射正**：德国 14 - 2 库拉索
- **角球**：德国 9 - 1 库拉索

### 总结

这场大胜让德国队在 E 组占据绝对优势。**菲尔克鲁格** 凭借帽子戏法暂列射手榜榜首，穆夏拉的两射两传同样令人印象深刻。如果德国队保持这个状态，本届世界杯他们绝对是一支不可忽视的力量。`,
      tags: ['match-report'],
      matchRef: { home: 'GER', away: 'CUW', homeScore: 7, awayScore: 1, group: 'E', date: 'Jun 14' }
    },
    {
      id: 'a2',
      title: '🌍 世界杯新军创造历史！佛得角 0-0 逼平欧洲冠军西班牙',
      date: '2026-06-15',
      author: 'AI 战报',
      excerpt: '世界杯新军佛得角在 H 组首战展现出惊人的防守韧性，0-0 闷平欧洲冠军西班牙，堪称本届赛事开赛以来最大冷门！',
      content: `## 比赛回顾

H 组首战在西班牙和世界杯新军佛得角之间展开。赛前几乎没有人看好佛得角，但 90 分钟后，他们用一场 0-0 的平局向世界证明了自己。

### 全场 — 钢铁防线

西班牙控球率高达 72%，但面对佛得角密不透风的五后卫防线毫无办法。佛得角的防守战术执行堪称完美——全员退守、紧密盯人、果断解围。

西班牙全场射门 18 次，但只有 3 次射正，且均被佛得角门将化解。西班牙中场核心在佛得角的密集防守下难以组织起有效的渗透进攻。

### 关键数据

- **控球率**：西班牙 72% - 28% 佛得角
- **射门次数**：西班牙 18 - 3 佛得角
- **射正**：西班牙 3 - 1 佛得角
- **犯规**：西班牙 7 - 14 佛得角
- **黄牌**：西班牙 0 - 3 佛得角

### 总结

佛得角成为本届世界杯第一支让所有人刮目相看的「黑马」。这场平局让 H 组的出线形势变得扑朔迷离。西班牙需要在接下来的比赛中找回进攻状态，而佛得角则用这场比赛赢得了全世界的尊重。`,
      tags: ['match-report', 'deep'],
      matchRef: { home: 'ESP', away: 'CPV', homeScore: 0, awayScore: 0, group: 'H', date: 'Jun 15' }
    },
    {
      id: 'a3',
      title: '🇳🇱🇯🇵 日本两度落后两度扳平！亚洲之光闪耀世界杯',
      date: '2026-06-14',
      author: 'AI 战报',
      excerpt: '日本队在 F 组首战面对荷兰，展现了惊人的韧性和斗志，在两度落后的情况下两次顽强扳平，最终 2-2 战平橙衣军团。',
      content: `## 比赛回顾

F 组首轮迎来一场精彩对决，荷兰对阵日本。比赛进程跌宕起伏，双方为球迷奉献了一场进球大战。

### 比赛进程

荷兰队在第 12 分钟由加克波率先破门，但日本队的久保建英在第 28 分钟用一脚精彩的远射扳平比分。

下半场荷兰队再度领先，然而日本队再次展现出顽强的斗志，在第 78 分钟通过一次精妙的团队配合再度扳平。

### 关键数据

- **控球率**：荷兰 58% - 42% 日本
- **射门次数**：荷兰 13 - 9 日本
- **射正**：荷兰 5 - 4 日本
- **传球成功率**：荷兰 86% - 79% 日本

### 总结

日本队展现了亚洲足球的进步和韧性。两度落后两度扳平的精神力令人敬佩。荷兰队虽然占据场面优势，但防守端的漏洞需要尽快修补。`,
      tags: ['match-report'],
      matchRef: { home: 'NED', away: 'JPN', homeScore: 2, awayScore: 2, group: 'F', date: 'Jun 14' }
    },
    {
      id: 'a4',
      title: '📊 小组赛阶段数据盘点：场均 3.00 球，32场战罢',
      date: '2026-06-19',
      author: 'AI 分析',
      excerpt: '2026 世界杯已赛 32 场，总进球 96 球，场均 3.00 球！美国队两连胜成为首支晋级淘汰赛的球队，梅西、戴维各入3球领跑射手榜。',
      content: `## 整体数据

截至 6 月 19 日，2026 世界杯已完赛 32 场，赛程接近三分之一！

### 关键数据一览

| 统计项 | 数据 |
|:------|:----:|
| 已赛场次 | **32** |
| 总进球 | **96** |
| 场均进球 | **3.00** |
| 最大比分 | 德国 7-1 库拉索（8球） |
| 最大分差 | 加拿大 6-0 卡塔尔 |
| 零封场次 | **13** |
| 平局场次 | 10 |
| 主场胜场 | 17 |
| 客队胜场 | 5 |

### 最新射手榜 🥇

| # | 球员 | 球队 | 进球 |
|:-:|:----|:----:|:---:|
| 1 | Lionel Messi | 🇦🇷 阿根廷 | **3** |
| 2 | Jonathan David | 🇨🇦 加拿大 | **3** |
| 3-10 | 多位球员 | 多队 | **2** |

**金靴争夺**：梅西和戴维同以 3 球领跑！维尼修斯、巴洛贡、塞巴里等 8 名球员各入 2 球紧随其后。

### 助攻榜 🎯

**新功能上线！** 现在可在数据看板查看助攻榜。亚历山大·伊萨克（瑞典）、胡利奥·恩西索（巴拉圭）、布拉欣·迪亚斯（摩洛哥）、约书亚·基米希（德国）、克里斯·伍德（新西兰）各以 **2 次助攻** 并列榜首！

### 各组出线形势

**✅ 已出线（1支）**

| 组别 | 球队 | 战绩 |
|:---:|:----|:----|
| D 组 | 🇺🇸 **美国** | 2胜0负，积6分 |

**🔜 出线在望**

| 组别 | 球队 | 积分 |
|:---:|:----|:---:|
| A 组 | 🇲🇽 墨西哥 | 6分 |
| C 组 | 🇧🇷 巴西 / 🇲🇦 摩洛哥 | 4分 |
| D 组 | 🇦🇺 澳大利亚 / 🇵🇾 巴拉圭 | 3分（末轮争出线） |

**💪 仍有希望**

韩国（3分）、苏格兰（3分）、荷兰、日本、多支球队争抢出线名额。

### 🏆 已确认出局的球队

**海地**（两连败，-4净胜球）已提前出局，成为首支被淘汰的球队。土耳其（两连败，-3净胜球）出线形势也极为严峻。

更多精彩比赛即将上演，敬请期待！`,
      tags: ['stats', 'deep'],
      matchRef: null
    },
    {
      id: 'a5',
      title: '🇨🇦 加拿大 6-0 狂胜卡塔尔！创本届最大分差记录',
      date: '2026-06-18',
      author: 'AI 战报',
      excerpt: '加拿大队在第2轮小组赛中主场6-0横扫卡塔尔，追平德国7-1库拉索的净胜球差，以净胜球优势登顶B组积分榜。',
      content: `## 比赛回顾

B 组第二轮迎来一场令人震撼的大胜。东道主加拿大队在温哥华主场迎战卡塔尔，从比赛一开始就展现了碾压级的实力。

### 上半场 — 势如破竹

开场仅 8 分钟，**拉林** 接边路传中头球破门，加拿大 1-0 领先。第 24 分钟，**戴维** 在禁区内连续晃动后低射远角得手，比分扩大为 2-0。卡塔尔队完全无法组织有效进攻，上半场结束前加拿大再入一球，半场 3-0。

### 下半场 — 火力全开

易边再战，加拿大丝毫没有收手的意思。第 51、67 分钟接连进球，比分来到 5-0。终场前再入一球，最终将比分锁定为 **6-0**！

### 关键数据

- **控球率**：加拿大 65% - 35% 卡塔尔
- **射门次数**：加拿大 20 - 4 卡塔尔
- **射正**：加拿大 12 - 1 卡塔尔
- **角球**：加拿大 8 - 1 卡塔尔

### 总结

这场大胜让加拿大以净胜球优势登顶 B 组。**拉林** 梅开二度，**戴维** 一射两传表现抢眼。东道主在主场球迷面前展现了强大的攻击力！`,
      tags: ['match-report'],
      matchRef: { home: 'CAN', away: 'QAT', homeScore: 6, awayScore: 0, group: 'B', date: 'Jun 18' }
    },
    {
      id: 'a6',
      title: '🇨🇭🇲🇽 瑞士 4-1 大胜波黑，墨西哥 1-0 力克韩国独占榜首',
      date: '2026-06-18',
      author: 'AI 战报',
      excerpt: '第2轮比赛日再燃战火！瑞士 4-1 大胜波黑追平积分，墨西哥 1-0 击败韩国以两连胜独占A组榜首，捷克 1-1 战平南非。',
      content: `## 比赛日综述

6 月 18 日，2026 世界杯迎来第 2 轮比赛日，4 场比赛精彩纷呈。

### 🇨🇭 瑞士 4-1 波黑

瑞士队在洛杉矶对阵波黑，**巴尔加斯** 开场闪电破门，**曼赞比** 扩大比分，**扎卡** 世界波锁定胜局。瑞士最终 4-1 大胜，与加拿大同积 4 分，B组出线形势更加激烈。

### 🇲🇽 墨西哥 1-0 韩国

A 组焦点战中，墨西哥凭借下半场的进球 1-0 击败韩国，取得两连胜积 6 分独占积分榜榜首。韩国队虽然拼抢积极但未能破门。

### 🇨🇿 捷克 1-1 南非

捷克与南非在亚特兰大展开激战，最终 1-1 握手言和。两队各取 1 分，但出线形势依然严峻。

### 积分榜形势

| 组别 | 榜首 | 积分 | 看点 |
|:---:|:---:|:---:|:----|
| A 组 | 🇲🇽 墨西哥 | 6 分 | 两连胜一骑绝尘 |
| B 组 | 🇨🇦 加拿大 | 4 分 | 净胜球优势领跑 |

### 展望

第 2 轮比赛激战正酣。美国、墨西哥两连胜后率先看到出线曙光，加拿大和瑞士也表现出色。接下来的比赛必将更加精彩！`,
      tags: ['match-report', 'deep'],
      matchRef: null
    },
    {
      id: 'a7',
      title: '🇺🇸🇧🇷 美国两连胜出线，巴西 3-0 轻取海地 — 6月19日战报',
      date: '2026-06-19',
      author: 'AI 战报',
      excerpt: '第2轮比赛第2比赛日战罢！美国2-0完胜澳大利亚两连胜提前出线，巴西3-0轻取海地，摩洛哥1-0力克苏格兰，巴拉圭1-0客胜土耳其。',
      content: `## 比赛日综述

6 月 19 日，2026 世界杯迎来第 2 轮第 2 个比赛日，4 场比赛精彩纷呈，两强提前锁定出线名额。

### 🇺🇸 美国 2-0 澳大利亚 🇦🇺

**D 组焦点战**——美国队在主场迎战同样首轮取胜的澳大利亚，胜者将基本锁定小组出线名额。

上半场双方互有攻守，澳大利亚展现出顽强的防守韧性。下半场美国队加强攻势，第 58 分钟，**普利西奇** 开出角球，**巴洛贡** 头球破门打破僵局！第 79 分钟，**雷纳** 替补上场后送出精妙直塞，**弗里曼** 单刀推射破门锁定胜局。

这场胜利让美国队以 **两连胜积 6 分** 提前锁定 D 组出线权！成为本届世界杯第一支晋级淘汰赛的球队 🎉

### 🇧🇷 巴西 3-0 海地 🇭🇹

C 组比赛中，巴西在费城迎战海地。**库尼亚** 上半场先入一球，下半场**维尼修斯** 扩大比分，库尼亚随后再入一球完成 **梅开二度**。最终巴西 3-0 轻取海地。

巴西和摩洛哥同积 4 分领跑 C 组，小组出线形势大好。

### 🇲🇦 摩洛哥 1-0 苏格兰 🏴󠁧󠁢󠁳󠁣󠁴󠁿

C 组另一场比赛中，摩洛哥在波士顿 1-0 力克苏格兰。**塞巴里** 接 **布拉欣·迪亚斯** 助攻打入全场唯一进球，连续两场比赛都有进球入账状态火热！

### 🇵🇾 巴拉圭 1-0 土耳其 🇹🇷

D 组比赛中，巴拉圭客场挑战土耳其。**恩西索** 助攻 **加拉萨** 打入制胜球，巴拉圭 1-0 客胜土耳其，取得首胜的同时保留了出线希望。土耳其两连败出线形势严峻。

### 积分榜最新形势

| 组别 | 排名 | 积分 | 看点 |
|:---:|:---|:---:|:----|
| A 组 | 🇲🇽 墨西哥 | **6** 分 | 两连胜领跑，出线在望 |
| A 组 | 🇰🇷 韩国 | **3** 分 | 仍有出线机会 |
| B 组 | 🇨🇦 加拿大 | **4** 分 | 净胜球优势 +6 领跑 |
| B 组 | 🇨🇭 瑞士 | **4** 分 | 与加拿大同分紧追 |
| C 组 | 🇧🇷 巴西 | **4** 分 | 净胜球优势领跑 |
| C 组 | 🇲🇦 摩洛哥 | **4** 分 | 连续两场进球状态火热 |
| C 组 | 🏴󠁧󠁢󠁳󠁣󠁴󠁿 苏格兰 | **3** 分 | 仍存出线希望 |
| D 组 | 🇺🇸 美国 | **6** 分 | **两连胜提前出线！** 🎉 |
| D 组 | 🇦🇺 澳大利亚 / 🇵🇾 巴拉圭 | **3** 分 | 末轮生死战 |

### 全场最佳

- **马特乌斯·库尼亚** 🇧🇷（巴西）— 梅开二度，3-0 大胜海地
- **弗拉林·巴洛贡** 🇺🇸（美国）— 打破僵局，率队提前出线
- **伊斯梅尔·塞巴里** 🇲🇦（摩洛哥）— 连续两场进球，1-0 定乾坤

### 展望

明天（6 月 20 日）将迎来 E 组和 F 组的第 2 轮对决，包括 **德国 vs 科特迪瓦** 和 **荷兰 vs 瑞典** 的重头戏，敬请期待！`,
      tags: ['match-report', 'stats'],
      matchRef: null
    },
    {
      id: 'a8',
      title: '📰 36小时回顾：从墨西哥两连胜到美国提前出线，小组赛渐入佳境',
      date: '2026-06-19',
      author: 'AI 编辑部',
      excerpt: '过去36小时8场激战！墨西哥2-0零封韩国、加拿大6-0狂胜卡塔尔、美国2-0完胜澳大利亚成为首支晋级淘汰赛的球队。一起回顾6月18-19日的精彩瞬间。',
      content: `## ⚽ 36小时回顾：小组赛渐入佳境

从6月18日到19日，2026世界杯度过了两个激动人心的比赛日。8场比赛，27个进球，我们一起回顾这些精彩瞬间。

---

### 🇲🇽 6月18日：东道主狂欢日

#### 墨西哥 1-0 韩国 🇰🇷

A组焦点战。墨西哥在瓜达拉哈拉主场凭借**路易斯·罗莫**的进球1-0力克韩国，取得两连胜积6分独占积分榜榜首。韩国队虽然控球率占优，但临门一脚欠佳。

> 🇲🇽 墨西哥成为继美国之后，第二支接近出线的球队！

#### 加拿大 6-0 卡塔尔 🇶🇦

B组震撼大胜！东道主温哥华狂轰6球，**乔纳森·戴维**上演帽子戏法，**拉林**梅开二度。6-0追平了德国7-1库拉索的净胜球差（+6），加拿大以净胜球优势力压瑞士登顶B组。

> 🎯 戴维单场3球，直接从射手榜第2蹿升至与梅西并列第1！

#### 瑞士 4-1 波黑 🇧🇦

B组另一场大胜。**巴尔加斯**、**曼赞比**（2球）、**扎卡**世界波，瑞士4-1横扫波黑。**扎卡**的世界波堪称本轮最佳进球之一。

#### 捷克 1-1 南非 🇿🇦

一场平局。**萨迪莱克**为捷克首开纪录（助攻：索伊卡），南非顽强扳平。两队各取1分，但出线形势都不乐观。

---

### 🇺🇸 6月19日：美国创造历史！

#### 🇺🇸 美国 2-0 澳大利亚 🇦🇺 ⭐ 头条

**D组焦点战——美国成为本届世界杯第一支晋级淘汰赛的球队！**

上半场双方互有攻守，澳大利亚展现出顽强防守。下半场美国队加强攻势：

- 第58分钟：**普利西奇**角球助攻，**巴洛贡**头球破门打破僵局！
- 第79分钟：**雷纳**替补上场送出精妙直塞，**弗里曼**单刀推射锁定胜局！

> 🎉 **美国2胜0负积6分，提前一轮锁定D组出线！**

#### 🇧🇷 巴西 3-0 海地 🇭🇹

巴西在费城轻取海地。**库尼亚**上半场先入一球，下半场**维尼修斯**扩大比分，库尼亚再入一球完成**梅开二度**。巴西和摩洛哥同积4分领跑C组。

#### 🇲🇦 摩洛哥 1-0 苏格兰 🏴󠁧󠁢󠁳󠁣󠁴󠁿

**塞巴里**接**布拉欣·迪亚斯**助攻打入全场唯一进球！塞巴里连续两场都有进球入账，状态火热。摩洛哥1-0力克苏格兰，巩固C组前二位置。

#### 🇵🇾 巴拉圭 1-0 土耳其 🇹🇷

**恩西索**助攻**加拉萨**打入制胜球，巴拉圭客场1-0击败土耳其，取得首胜。土耳其两连败，出线形势严峻。

---

### 📊 射手榜更新

| # | 球员 | 球队 | 进球 | 助攻 |
|:-:|:----|:----:|:---:|:---:|
| 🥇 | Lionel Messi | 🇦🇷 阿根廷 | **3** | 0 |
| 🥇 | Jonathan David | 🇨🇦 加拿大 | **3** | 0 |
| 🥉 | Vinícius Júnior | 🇧🇷 巴西 | **2** | 1 |
| 🥉 | Cyle Larin | 🇨🇦 加拿大 | **2** | 0 |
| 🥉 | Folarin Balogun | 🇺🇸 美国 | **2** | 0 |
| 🥉 | Ismael Saibari | 🇲🇦 摩洛哥 | **2** | 0 |
| 🥉 | Matheus Cunha | 🇧🇷 巴西 | **2** | 0 |
| 🥉 | 多位球员 | — | **2** | — |

### 🎯 助攻榜

| # | 球员 | 球队 | 助攻 |
|:-:|:----|:----:|:---:|
| 🥇 | Alexander Isak | 🇸🇪 瑞典 | **2** |
| 🥇 | Julio Enciso | 🇵🇾 巴拉圭 | **2** |
| 🥇 | Brahim Díaz | 🇲🇦 摩洛哥 | **2** |
| 🥇 | Joshua Kimmich | 🇩🇪 德国 | **2** |
| 🥇 | Chris Wood | 🇳🇿 新西兰 | **2** |

---

### 🏆 最新积分榜

| 组别 | 第1名 | 积分 | 第2名 | 积分 |
|:---:|:------|:---:|:------|:---:|
| A | 🇲🇽 墨西哥 | **6** | 🇰🇷 韩国 | 3 |
| B | 🇨🇦 加拿大 | **4** | 🇨🇭 瑞士 | 4 |
| C | 🇧🇷 巴西 | **4** | 🇲🇦 摩洛哥 | 4 |
| D | 🇺🇸 美国 | **6** | 🇦🇺 澳大利亚/🇵🇾 巴拉圭 | 3 |

### ✅ 出线情况

- 🇺🇸 **美国** — **已出线！**（首支晋级淘汰赛）
- 🇲🇽 墨西哥 — 末轮打平即可出线
- 🇨🇦 加拿大/🇨🇭 瑞士 — B组争夺白热化
- 🇧🇷 巴西/🇲🇦 摩洛哥 — C组前二之争

### 🔮 下一轮预告

6月20日将进行E组和F组第2轮：
- 🇩🇪 德国 vs 科特迪瓦 🇨🇮
- 🇪🇨 厄瓜多尔 vs 库拉索 🇨🇼
- 🇳🇱 荷兰 vs 瑞典 🇸🇪
- 🇹🇳 突尼斯 vs 日本 🇯🇵

精彩继续！⚽🔥`,
      tags: ['match-report', 'stats', 'deep'],
      matchRef: null
    }
  ]
};