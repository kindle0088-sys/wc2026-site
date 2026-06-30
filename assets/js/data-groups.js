/**
 * 2026 FIFA World Cup - Group Stage Data
 * Last updated: June 29, 2026 at 23:53
 */

const WC_GROUPS = {
  "lastUpdated": "June 29, 2026 at 23:53",
  "tournament": {
    "name": "2026 FIFA World Cup",
    "host": "Canada · Mexico · USA",
    "startDate": "2026-06-11",
    "endDate": "2026-07-19",
    "teams": 48,
    "matches": 104,
    "cities": 16,
    "status": "group_stage"
  },
  "groups": {
    "A": {
      "name": "Group A",
      "teams": [
        {
          "code": "MEX",
          "name": "Mexico",
          "flag": "🇲🇽",
          "played": 3,
          "won": 3,
          "drawn": 0,
          "lost": 0,
          "gf": 6,
          "ga": 0,
          "gd": 6,
          "pts": 9,
          "status": "qualifying"
        },
        {
          "code": "RSA",
          "name": "South Africa",
          "flag": "🇿🇦",
          "played": 3,
          "won": 1,
          "drawn": 1,
          "lost": 1,
          "gf": 2,
          "ga": 3,
          "gd": -1,
          "pts": 4,
          "status": "qualifying"
        },
        {
          "code": "KOR",
          "name": "Korea Republic",
          "flag": "🇰🇷",
          "played": 3,
          "won": 1,
          "drawn": 0,
          "lost": 2,
          "gf": 2,
          "ga": 3,
          "gd": -1,
          "pts": 3,
          "status": "qualifying"
        },
        {
          "code": "CZE",
          "name": "Czech Republic",
          "flag": "🇨🇿",
          "played": 3,
          "won": 0,
          "drawn": 1,
          "lost": 2,
          "gf": 2,
          "ga": 6,
          "gd": -4,
          "pts": 1,
          "status": "qualifying"
        }
      ],
      "matches": [
        {
          "round": 1,
          "date": "Jun 11",
          "home": "MEX",
          "away": "RSA",
          "homeScore": 2,
          "awayScore": 0,
          "status": "completed"
        },
        {
          "round": 1,
          "date": "Jun 11",
          "home": "KOR",
          "away": "CZE",
          "homeScore": 2,
          "awayScore": 1,
          "status": "completed"
        },
        {
          "round": 2,
          "date": "Jun 18",
          "home": "CZE",
          "away": "RSA",
          "homeScore": 1,
          "awayScore": 1,
          "status": "completed",
          "venue": "Atlanta"
        },
        {
          "round": 2,
          "date": "Jun 18",
          "home": "MEX",
          "away": "KOR",
          "homeScore": 1,
          "awayScore": 0,
          "status": "completed",
          "venue": "Guadalajara"
        },
        {
          "round": 3,
          "date": "Jun 24",
          "home": "CZE",
          "away": "MEX",
          "homeScore": 0,
          "awayScore": 3,
          "status": "completed",
          "venue": "Mexico City"
        },
        {
          "round": 3,
          "date": "Jun 24",
          "home": "RSA",
          "away": "KOR",
          "homeScore": 1,
          "awayScore": 0,
          "status": "completed",
          "venue": "Monterrey"
        }
      ]
    },
    "B": {
      "name": "Group B",
      "teams": [
        {
          "code": "SUI",
          "name": "Switzerland",
          "flag": "🇨🇭",
          "played": 3,
          "won": 2,
          "drawn": 1,
          "lost": 0,
          "gf": 7,
          "ga": 3,
          "gd": 4,
          "pts": 7,
          "status": "qualifying"
        },
        {
          "code": "CAN",
          "name": "Canada",
          "flag": "🇨🇦",
          "played": 3,
          "won": 1,
          "drawn": 1,
          "lost": 1,
          "gf": 8,
          "ga": 3,
          "gd": 5,
          "pts": 4,
          "status": "qualifying"
        },
        {
          "code": "BIH",
          "name": "Bosnia",
          "flag": "🇧🇦",
          "played": 3,
          "won": 1,
          "drawn": 1,
          "lost": 1,
          "gf": 5,
          "ga": 6,
          "gd": -1,
          "pts": 4,
          "status": "qualifying"
        },
        {
          "code": "QAT",
          "name": "Qatar",
          "flag": "🇶🇦",
          "played": 3,
          "won": 0,
          "drawn": 1,
          "lost": 2,
          "gf": 2,
          "ga": 10,
          "gd": -8,
          "pts": 1,
          "status": "qualifying"
        }
      ],
      "matches": [
        {
          "round": 1,
          "date": "Jun 12",
          "home": "CAN",
          "away": "BIH",
          "homeScore": 1,
          "awayScore": 1,
          "status": "completed"
        },
        {
          "round": 1,
          "date": "Jun 13",
          "home": "QAT",
          "away": "SUI",
          "homeScore": 1,
          "awayScore": 1,
          "status": "completed"
        },
        {
          "round": 2,
          "date": "Jun 18",
          "home": "SUI",
          "away": "BIH",
          "homeScore": 4,
          "awayScore": 1,
          "status": "completed",
          "venue": "Los Angeles"
        },
        {
          "round": 2,
          "date": "Jun 18",
          "home": "CAN",
          "away": "QAT",
          "homeScore": 6,
          "awayScore": 0,
          "status": "completed",
          "venue": "Vancouver"
        },
        {
          "round": 3,
          "date": "Jun 24",
          "home": "SUI",
          "away": "CAN",
          "homeScore": 2,
          "awayScore": 1,
          "status": "completed",
          "venue": "Vancouver"
        },
        {
          "round": 3,
          "date": "Jun 24",
          "home": "BIH",
          "away": "QAT",
          "homeScore": 3,
          "awayScore": 1,
          "status": "completed",
          "venue": "Seattle"
        }
      ]
    },
    "C": {
      "name": "Group C",
      "teams": [
        {
          "code": "BRA",
          "name": "Brazil",
          "flag": "🇧🇷",
          "played": 3,
          "won": 2,
          "drawn": 1,
          "lost": 0,
          "gf": 7,
          "ga": 1,
          "gd": 6,
          "pts": 7,
          "status": "qualifying"
        },
        {
          "code": "MAR",
          "name": "Morocco",
          "flag": "🇲🇦",
          "played": 3,
          "won": 2,
          "drawn": 1,
          "lost": 0,
          "gf": 6,
          "ga": 3,
          "gd": 3,
          "pts": 7,
          "status": "qualifying"
        },
        {
          "code": "SCO",
          "name": "Scotland",
          "flag": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
          "played": 3,
          "won": 1,
          "drawn": 0,
          "lost": 2,
          "gf": 1,
          "ga": 4,
          "gd": -3,
          "pts": 3,
          "status": "qualifying"
        },
        {
          "code": "HAI",
          "name": "Haiti",
          "flag": "🇭🇹",
          "played": 3,
          "won": 0,
          "drawn": 0,
          "lost": 3,
          "gf": 2,
          "ga": 8,
          "gd": -6,
          "pts": 0,
          "status": "qualifying"
        }
      ],
      "matches": [
        {
          "round": 1,
          "date": "Jun 13",
          "home": "BRA",
          "away": "MAR",
          "homeScore": 1,
          "awayScore": 1,
          "status": "completed"
        },
        {
          "round": 1,
          "date": "Jun 13",
          "home": "HAI",
          "away": "SCO",
          "homeScore": 0,
          "awayScore": 1,
          "status": "completed"
        },
        {
          "round": 2,
          "date": "Jun 19",
          "home": "SCO",
          "away": "MAR",
          "homeScore": 0,
          "awayScore": 1,
          "status": "completed",
          "venue": "Boston"
        },
        {
          "round": 2,
          "date": "Jun 19",
          "home": "BRA",
          "away": "HAI",
          "homeScore": 3,
          "awayScore": 0,
          "status": "completed",
          "venue": "Philadelphia"
        },
        {
          "round": 3,
          "date": "Jun 24",
          "home": "SCO",
          "away": "BRA",
          "homeScore": 0,
          "awayScore": 3,
          "status": "completed",
          "venue": "Miami"
        },
        {
          "round": 3,
          "date": "Jun 24",
          "home": "MAR",
          "away": "HAI",
          "homeScore": 4,
          "awayScore": 2,
          "status": "completed",
          "venue": "Atlanta"
        }
      ]
    },
    "D": {
      "name": "Group D",
      "teams": [
        {
          "code": "USA",
          "name": "USA",
          "flag": "🇺🇸",
          "played": 3,
          "won": 2,
          "drawn": 0,
          "lost": 1,
          "gf": 8,
          "ga": 4,
          "gd": 4,
          "pts": 6,
          "status": "qualifying"
        },
        {
          "code": "AUS",
          "name": "Australia",
          "flag": "🇦🇺",
          "played": 3,
          "won": 1,
          "drawn": 1,
          "lost": 1,
          "gf": 2,
          "ga": 2,
          "gd": 0,
          "pts": 4,
          "status": "qualifying"
        },
        {
          "code": "PAR",
          "name": "Paraguay",
          "flag": "🇵🇾",
          "played": 3,
          "won": 1,
          "drawn": 1,
          "lost": 1,
          "gf": 2,
          "ga": 4,
          "gd": -2,
          "pts": 4,
          "status": "qualifying"
        },
        {
          "code": "TUR",
          "name": "Turkey",
          "flag": "🇹🇷",
          "played": 3,
          "won": 1,
          "drawn": 0,
          "lost": 2,
          "gf": 3,
          "ga": 5,
          "gd": -2,
          "pts": 3,
          "status": "qualifying"
        }
      ],
      "matches": [
        {
          "round": 1,
          "date": "Jun 12",
          "home": "USA",
          "away": "PAR",
          "homeScore": 4,
          "awayScore": 1,
          "status": "completed"
        },
        {
          "round": 1,
          "date": "Jun 14",
          "home": "AUS",
          "away": "TUR",
          "homeScore": 2,
          "awayScore": 0,
          "status": "completed"
        },
        {
          "round": 2,
          "date": "Jun 19",
          "home": "TUR",
          "away": "PAR",
          "homeScore": 0,
          "awayScore": 1,
          "status": "completed",
          "venue": "San Francisco"
        },
        {
          "round": 2,
          "date": "Jun 19",
          "home": "USA",
          "away": "AUS",
          "homeScore": 2,
          "awayScore": 0,
          "status": "completed",
          "venue": "Seattle"
        },
        {
          "round": 3,
          "date": "Jun 25",
          "home": "TUR",
          "away": "USA",
          "homeScore": 3,
          "awayScore": 2,
          "status": "completed",
          "venue": "Los Angeles"
        },
        {
          "round": 3,
          "date": "Jun 25",
          "home": "PAR",
          "away": "AUS",
          "homeScore": 0,
          "awayScore": 0,
          "status": "completed",
          "venue": "San Francisco"
        }
      ]
    },
    "E": {
      "name": "Group E",
      "teams": [
        {
          "code": "GER",
          "name": "Germany",
          "flag": "🇩🇪",
          "played": 3,
          "won": 2,
          "drawn": 0,
          "lost": 1,
          "gf": 10,
          "ga": 4,
          "gd": 6,
          "pts": 6,
          "status": "qualifying"
        },
        {
          "code": "CIV",
          "name": "Côte d’Ivoire",
          "flag": "🇨🇮",
          "played": 3,
          "won": 2,
          "drawn": 0,
          "lost": 1,
          "gf": 4,
          "ga": 2,
          "gd": 2,
          "pts": 6,
          "status": "qualifying"
        },
        {
          "code": "ECU",
          "name": "Ecuador",
          "flag": "🇪🇨",
          "played": 3,
          "won": 1,
          "drawn": 1,
          "lost": 1,
          "gf": 2,
          "ga": 2,
          "gd": 0,
          "pts": 4,
          "status": "qualifying"
        },
        {
          "code": "CUW",
          "name": "Curaçao",
          "flag": "🇨🇼",
          "played": 3,
          "won": 0,
          "drawn": 1,
          "lost": 2,
          "gf": 1,
          "ga": 9,
          "gd": -8,
          "pts": 1,
          "status": "qualifying"
        }
      ],
      "matches": [
        {
          "round": 1,
          "date": "Jun 14",
          "home": "GER",
          "away": "CUW",
          "homeScore": 7,
          "awayScore": 1,
          "status": "completed"
        },
        {
          "round": 1,
          "date": "Jun 14",
          "home": "CIV",
          "away": "ECU",
          "homeScore": 1,
          "awayScore": 0,
          "status": "completed"
        },
        {
          "round": 2,
          "date": "Jun 20",
          "home": "GER",
          "away": "CIV",
          "homeScore": 2,
          "awayScore": 1,
          "status": "completed",
          "venue": "Toronto"
        },
        {
          "round": 2,
          "date": "Jun 20",
          "home": "ECU",
          "away": "CUW",
          "homeScore": 0,
          "awayScore": 0,
          "status": "completed",
          "venue": "Kansas City"
        },
        {
          "round": 3,
          "date": "Jun 25",
          "home": "ECU",
          "away": "GER",
          "homeScore": 2,
          "awayScore": 1,
          "status": "completed",
          "venue": "NY/NJ"
        },
        {
          "round": 3,
          "date": "Jun 25",
          "home": "CUW",
          "away": "CIV",
          "homeScore": 0,
          "awayScore": 2,
          "status": "completed",
          "venue": "Philadelphia"
        }
      ]
    },
    "F": {
      "name": "Group F",
      "teams": [
        {
          "code": "NED",
          "name": "Netherlands",
          "flag": "🇳🇱",
          "played": 3,
          "won": 2,
          "drawn": 1,
          "lost": 0,
          "gf": 10,
          "ga": 4,
          "gd": 6,
          "pts": 7,
          "status": "qualifying"
        },
        {
          "code": "JPN",
          "name": "Japan",
          "flag": "🇯🇵",
          "played": 3,
          "won": 1,
          "drawn": 2,
          "lost": 0,
          "gf": 7,
          "ga": 3,
          "gd": 4,
          "pts": 5,
          "status": "qualifying"
        },
        {
          "code": "SWE",
          "name": "Sweden",
          "flag": "🇸🇪",
          "played": 3,
          "won": 1,
          "drawn": 1,
          "lost": 1,
          "gf": 7,
          "ga": 7,
          "gd": 0,
          "pts": 4,
          "status": "qualifying"
        },
        {
          "code": "TUN",
          "name": "Tunisia",
          "flag": "🇹🇳",
          "played": 3,
          "won": 0,
          "drawn": 0,
          "lost": 3,
          "gf": 2,
          "ga": 12,
          "gd": -10,
          "pts": 0,
          "status": "qualifying"
        }
      ],
      "matches": [
        {
          "round": 1,
          "date": "Jun 14",
          "home": "NED",
          "away": "JPN",
          "homeScore": 2,
          "awayScore": 2,
          "status": "completed"
        },
        {
          "round": 1,
          "date": "Jun 14",
          "home": "SWE",
          "away": "TUN",
          "homeScore": 5,
          "awayScore": 1,
          "status": "completed"
        },
        {
          "round": 2,
          "date": "Jun 20",
          "home": "NED",
          "away": "SWE",
          "homeScore": 5,
          "awayScore": 1,
          "status": "completed",
          "venue": "Houston"
        },
        {
          "round": 2,
          "date": "Jun 20",
          "home": "TUN",
          "away": "JPN",
          "homeScore": 0,
          "awayScore": 4,
          "status": "completed",
          "venue": "Monterrey"
        },
        {
          "round": 3,
          "date": "Jun 25",
          "home": "JPN",
          "away": "SWE",
          "homeScore": 1,
          "awayScore": 1,
          "status": "completed",
          "venue": "Dallas"
        },
        {
          "round": 3,
          "date": "Jun 25",
          "home": "TUN",
          "away": "NED",
          "homeScore": 1,
          "awayScore": 3,
          "status": "completed",
          "venue": "Kansas City"
        }
      ]
    },
    "G": {
      "name": "Group G",
      "teams": [
        {
          "code": "BEL",
          "name": "Belgium",
          "flag": "🇧🇪",
          "played": 3,
          "won": 1,
          "drawn": 2,
          "lost": 0,
          "gf": 6,
          "ga": 2,
          "gd": 4,
          "pts": 5,
          "status": "qualifying"
        },
        {
          "code": "EGY",
          "name": "Egypt",
          "flag": "🇪🇬",
          "played": 3,
          "won": 1,
          "drawn": 2,
          "lost": 0,
          "gf": 5,
          "ga": 3,
          "gd": 2,
          "pts": 5,
          "status": "qualifying"
        },
        {
          "code": "IRN",
          "name": "Iran",
          "flag": "🇮🇷",
          "played": 3,
          "won": 0,
          "drawn": 3,
          "lost": 0,
          "gf": 3,
          "ga": 3,
          "gd": 0,
          "pts": 3,
          "status": "qualifying"
        },
        {
          "code": "NZL",
          "name": "New Zealand",
          "flag": "🇳🇿",
          "played": 3,
          "won": 0,
          "drawn": 1,
          "lost": 2,
          "gf": 4,
          "ga": 10,
          "gd": -6,
          "pts": 1,
          "status": "qualifying"
        }
      ],
      "matches": [
        {
          "round": 1,
          "date": "Jun 15",
          "home": "BEL",
          "away": "EGY",
          "homeScore": 1,
          "awayScore": 1,
          "status": "completed"
        },
        {
          "round": 1,
          "date": "Jun 15",
          "home": "IRN",
          "away": "NZL",
          "homeScore": 2,
          "awayScore": 2,
          "status": "completed",
          "venue": "Los Angeles"
        },
        {
          "round": 2,
          "date": "Jun 21",
          "home": "BEL",
          "away": "IRN",
          "homeScore": 0,
          "awayScore": 0,
          "status": "completed",
          "venue": "Los Angeles"
        },
        {
          "round": 2,
          "date": "Jun 21",
          "home": "NZL",
          "away": "EGY",
          "homeScore": 1,
          "awayScore": 3,
          "status": "completed",
          "venue": "Vancouver"
        },
        {
          "round": 3,
          "date": "Jun 26",
          "home": "EGY",
          "away": "IRN",
          "homeScore": 1,
          "awayScore": 1,
          "status": "completed",
          "venue": "Seattle"
        },
        {
          "round": 3,
          "date": "Jun 26",
          "home": "NZL",
          "away": "BEL",
          "homeScore": 1,
          "awayScore": 5,
          "status": "completed",
          "venue": "Vancouver"
        }
      ]
    },
    "H": {
      "name": "Group H",
      "teams": [
        {
          "code": "ESP",
          "name": "Spain",
          "flag": "🇪🇸",
          "played": 3,
          "won": 2,
          "drawn": 1,
          "lost": 0,
          "gf": 5,
          "ga": 0,
          "gd": 5,
          "pts": 7,
          "status": "qualifying"
        },
        {
          "code": "CPV",
          "name": "Cabo Verde",
          "flag": "🇨🇻",
          "played": 3,
          "won": 0,
          "drawn": 3,
          "lost": 0,
          "gf": 2,
          "ga": 2,
          "gd": 0,
          "pts": 3,
          "status": "qualifying"
        },
        {
          "code": "URU",
          "name": "Uruguay",
          "flag": "🇺🇾",
          "played": 3,
          "won": 0,
          "drawn": 2,
          "lost": 1,
          "gf": 3,
          "ga": 4,
          "gd": -1,
          "pts": 2,
          "status": "qualifying"
        },
        {
          "code": "KSA",
          "name": "Saudi Arabia",
          "flag": "🇸🇦",
          "played": 3,
          "won": 0,
          "drawn": 2,
          "lost": 1,
          "gf": 1,
          "ga": 5,
          "gd": -4,
          "pts": 2,
          "status": "qualifying"
        }
      ],
      "matches": [
        {
          "round": 1,
          "date": "Jun 15",
          "home": "ESP",
          "away": "CPV",
          "homeScore": 0,
          "awayScore": 0,
          "status": "completed"
        },
        {
          "round": 1,
          "date": "Jun 15",
          "home": "KSA",
          "away": "URU",
          "homeScore": 1,
          "awayScore": 1,
          "status": "completed",
          "venue": "Miami"
        },
        {
          "round": 2,
          "date": "Jun 21",
          "home": "ESP",
          "away": "KSA",
          "homeScore": 4,
          "awayScore": 0,
          "status": "completed",
          "venue": "Atlanta"
        },
        {
          "round": 2,
          "date": "Jun 21",
          "home": "URU",
          "away": "CPV",
          "homeScore": 2,
          "awayScore": 2,
          "status": "completed",
          "venue": "Miami"
        },
        {
          "round": 3,
          "date": "Jun 26",
          "home": "CPV",
          "away": "KSA",
          "homeScore": 0,
          "awayScore": 0,
          "status": "completed",
          "venue": "Houston"
        },
        {
          "round": 3,
          "date": "Jun 26",
          "home": "URU",
          "away": "ESP",
          "homeScore": 0,
          "awayScore": 1,
          "status": "completed",
          "venue": "Guadalajara"
        }
      ]
    },
    "I": {
      "name": "Group I",
      "teams": [
        {
          "code": "FRA",
          "name": "France",
          "flag": "🇫🇷",
          "played": 3,
          "won": 3,
          "drawn": 0,
          "lost": 0,
          "gf": 10,
          "ga": 2,
          "gd": 8,
          "pts": 9,
          "status": "qualifying"
        },
        {
          "code": "NOR",
          "name": "Norway",
          "flag": "🇳🇴",
          "played": 3,
          "won": 2,
          "drawn": 0,
          "lost": 1,
          "gf": 8,
          "ga": 7,
          "gd": 1,
          "pts": 6,
          "status": "qualifying"
        },
        {
          "code": "SEN",
          "name": "Senegal",
          "flag": "🇸🇳",
          "played": 3,
          "won": 1,
          "drawn": 0,
          "lost": 2,
          "gf": 8,
          "ga": 6,
          "gd": 2,
          "pts": 3,
          "status": "qualifying"
        },
        {
          "code": "IRQ",
          "name": "Iraq",
          "flag": "🇮🇶",
          "played": 3,
          "won": 0,
          "drawn": 0,
          "lost": 3,
          "gf": 1,
          "ga": 12,
          "gd": -11,
          "pts": 0,
          "status": "qualifying"
        }
      ],
      "matches": [
        {
          "round": 1,
          "date": "Jun 16",
          "home": "FRA",
          "away": "SEN",
          "homeScore": 3,
          "awayScore": 1,
          "status": "completed",
          "venue": "NY/NJ",
          "time": "15:00 EDT"
        },
        {
          "round": 1,
          "date": "Jun 16",
          "home": "IRQ",
          "away": "NOR",
          "homeScore": 1,
          "awayScore": 4,
          "status": "completed",
          "venue": "Boston",
          "time": "18:00 EDT"
        },
        {
          "round": 2,
          "date": "Jun 22",
          "home": "FRA",
          "away": "IRQ",
          "homeScore": 3,
          "awayScore": 0,
          "status": "completed",
          "venue": "Philadelphia"
        },
        {
          "round": 2,
          "date": "Jun 22",
          "home": "NOR",
          "away": "SEN",
          "homeScore": 3,
          "awayScore": 2,
          "status": "completed",
          "venue": "NY/NJ"
        },
        {
          "round": 3,
          "date": "Jun 26",
          "home": "NOR",
          "away": "FRA",
          "homeScore": 1,
          "awayScore": 4,
          "status": "completed",
          "venue": "Boston"
        },
        {
          "round": 3,
          "date": "Jun 26",
          "home": "SEN",
          "away": "IRQ",
          "homeScore": 5,
          "awayScore": 0,
          "status": "completed",
          "venue": "Toronto"
        }
      ]
    },
    "J": {
      "name": "Group J",
      "teams": [
        {
          "code": "ARG",
          "name": "Argentina",
          "flag": "🇦🇷",
          "played": 3,
          "won": 3,
          "drawn": 0,
          "lost": 0,
          "gf": 8,
          "ga": 1,
          "gd": 7,
          "pts": 9,
          "status": "qualifying"
        },
        {
          "code": "AUT",
          "name": "Austria",
          "flag": "🇦🇹",
          "played": 3,
          "won": 1,
          "drawn": 1,
          "lost": 1,
          "gf": 6,
          "ga": 6,
          "gd": 0,
          "pts": 4,
          "status": "qualifying"
        },
        {
          "code": "ALG",
          "name": "Algeria",
          "flag": "🇩🇿",
          "played": 3,
          "won": 1,
          "drawn": 1,
          "lost": 1,
          "gf": 5,
          "ga": 7,
          "gd": -2,
          "pts": 4,
          "status": "qualifying"
        },
        {
          "code": "JOR",
          "name": "Jordan",
          "flag": "🇯🇴",
          "played": 3,
          "won": 0,
          "drawn": 0,
          "lost": 3,
          "gf": 3,
          "ga": 8,
          "gd": -5,
          "pts": 0,
          "status": "qualifying"
        }
      ],
      "matches": [
        {
          "round": 1,
          "date": "Jun 16",
          "home": "ARG",
          "away": "ALG",
          "homeScore": 3,
          "awayScore": 0,
          "status": "completed",
          "venue": "Kansas City",
          "time": "20:00 EDT"
        },
        {
          "round": 1,
          "date": "Jun 16",
          "home": "AUT",
          "away": "JOR",
          "homeScore": 3,
          "awayScore": 1,
          "status": "completed",
          "venue": "Santa Clara",
          "time": "21:00 EDT"
        },
        {
          "round": 2,
          "date": "Jun 22",
          "home": "ARG",
          "away": "AUT",
          "homeScore": 2,
          "awayScore": 0,
          "status": "completed",
          "venue": "Philadelphia"
        },
        {
          "round": 2,
          "date": "Jun 22",
          "home": "JOR",
          "away": "ALG",
          "homeScore": 1,
          "awayScore": 2,
          "status": "completed",
          "venue": "NY/NJ"
        },
        {
          "round": 3,
          "date": "Jun 27",
          "home": "JOR",
          "away": "ARG",
          "homeScore": 1,
          "awayScore": 3,
          "status": "completed",
          "venue": "Santa Clara"
        },
        {
          "round": 3,
          "date": "Jun 27",
          "home": "ALG",
          "away": "AUT",
          "homeScore": 3,
          "awayScore": 3,
          "status": "completed",
          "venue": "Kansas City"
        }
      ]
    },
    "K": {
      "name": "Group K",
      "teams": [
        {
          "code": "COL",
          "name": "Colombia",
          "flag": "🇨🇴",
          "played": 3,
          "won": 2,
          "drawn": 1,
          "lost": 0,
          "gf": 4,
          "ga": 1,
          "gd": 3,
          "pts": 7,
          "status": "qualifying"
        },
        {
          "code": "POR",
          "name": "Portugal",
          "flag": "🇵🇹",
          "played": 3,
          "won": 1,
          "drawn": 2,
          "lost": 0,
          "gf": 6,
          "ga": 1,
          "gd": 5,
          "pts": 5,
          "status": "qualifying"
        },
        {
          "code": "COD",
          "name": "DR Congo",
          "flag": "🇨🇩",
          "played": 3,
          "won": 1,
          "drawn": 1,
          "lost": 1,
          "gf": 4,
          "ga": 3,
          "gd": 1,
          "pts": 4,
          "status": "qualifying"
        },
        {
          "code": "UZB",
          "name": "Uzbekistan",
          "flag": "🇺🇿",
          "played": 3,
          "won": 0,
          "drawn": 0,
          "lost": 3,
          "gf": 2,
          "ga": 11,
          "gd": -9,
          "pts": 0,
          "status": "qualifying"
        }
      ],
      "matches": [
        {
          "round": 1,
          "date": "Jun 17",
          "home": "POR",
          "away": "COD",
          "homeScore": 1,
          "awayScore": 1,
          "status": "completed",
          "venue": "Seattle"
        },
        {
          "round": 1,
          "date": "Jun 17",
          "home": "UZB",
          "away": "COL",
          "homeScore": 1,
          "awayScore": 3,
          "status": "completed",
          "venue": "Houston"
        },
        {
          "round": 2,
          "date": "Jun 23",
          "home": "POR",
          "away": "UZB",
          "homeScore": 5,
          "awayScore": 0,
          "status": "completed",
          "venue": "Monterrey"
        },
        {
          "round": 2,
          "date": "Jun 23",
          "home": "COL",
          "away": "COD",
          "homeScore": 1,
          "awayScore": 0,
          "status": "completed",
          "venue": "Dallas"
        },
        {
          "round": 3,
          "date": "Jun 27",
          "home": "COL",
          "away": "POR",
          "homeScore": 0,
          "awayScore": 0,
          "status": "completed",
          "venue": "Dallas"
        },
        {
          "round": 3,
          "date": "Jun 27",
          "home": "COD",
          "away": "UZB",
          "homeScore": 3,
          "awayScore": 1,
          "status": "completed",
          "venue": "Monterrey"
        }
      ]
    },
    "L": {
      "name": "Group L",
      "teams": [
        {
          "code": "ENG",
          "name": "England",
          "flag": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
          "played": 3,
          "won": 2,
          "drawn": 1,
          "lost": 0,
          "gf": 6,
          "ga": 2,
          "gd": 4,
          "pts": 7,
          "status": "qualifying"
        },
        {
          "code": "CRO",
          "name": "Croatia",
          "flag": "🇭🇷",
          "played": 3,
          "won": 2,
          "drawn": 0,
          "lost": 1,
          "gf": 5,
          "ga": 5,
          "gd": 0,
          "pts": 6,
          "status": "qualifying"
        },
        {
          "code": "GHA",
          "name": "Ghana",
          "flag": "🇬🇭",
          "played": 3,
          "won": 1,
          "drawn": 1,
          "lost": 1,
          "gf": 2,
          "ga": 2,
          "gd": 0,
          "pts": 4,
          "status": "qualifying"
        },
        {
          "code": "PAN",
          "name": "Panama",
          "flag": "🇵🇦",
          "played": 3,
          "won": 0,
          "drawn": 0,
          "lost": 3,
          "gf": 0,
          "ga": 4,
          "gd": -4,
          "pts": 0,
          "status": "qualifying"
        }
      ],
      "matches": [
        {
          "round": 1,
          "date": "Jun 17",
          "home": "ENG",
          "away": "CRO",
          "homeScore": 4,
          "awayScore": 2,
          "status": "completed",
          "venue": "Monterrey"
        },
        {
          "round": 1,
          "date": "Jun 17",
          "home": "GHA",
          "away": "PAN",
          "homeScore": 1,
          "awayScore": 0,
          "status": "completed",
          "venue": "Atlanta"
        },
        {
          "round": 2,
          "date": "Jun 23",
          "home": "ENG",
          "away": "GHA",
          "homeScore": 0,
          "awayScore": 0,
          "status": "completed",
          "venue": "Miami"
        },
        {
          "round": 2,
          "date": "Jun 23",
          "home": "PAN",
          "away": "CRO",
          "homeScore": 0,
          "awayScore": 1,
          "status": "completed",
          "venue": "Orlando"
        },
        {
          "round": 3,
          "date": "Jun 27",
          "home": "CRO",
          "away": "GHA",
          "homeScore": 2,
          "awayScore": 1,
          "status": "completed",
          "venue": "Miami"
        },
        {
          "round": 3,
          "date": "Jun 27",
          "home": "PAN",
          "away": "ENG",
          "homeScore": 0,
          "awayScore": 2,
          "status": "completed",
          "venue": "NY/NJ"
        }
      ]
    }
  },
  "topScorers": [
    {
      "rank": 1,
      "name": "Lionel Messi",
      "team": "ARG",
      "flag": "🇦🇷",
      "goals": 6,
      "assists": 0,
      "matches": 0
    },
    {
      "rank": 2,
      "name": "Kylian Mbappé",
      "team": "FRA",
      "flag": "🇫🇷",
      "goals": 4,
      "assists": 2,
      "matches": 0
    },
    {
      "rank": 3,
      "name": "Vinícius Júnior",
      "team": "BRA",
      "flag": "🇧🇷",
      "goals": 4,
      "assists": 1,
      "matches": 0
    },
    {
      "rank": 4,
      "name": "Ousmane Dembélé",
      "team": "FRA",
      "flag": "🇫🇷",
      "goals": 4,
      "assists": 1,
      "matches": 0
    },
    {
      "rank": 5,
      "name": "Erling Haaland",
      "team": "NOR",
      "flag": "🇳🇴",
      "goals": 4,
      "assists": 0,
      "matches": 0
    },
    {
      "rank": 6,
      "name": "Deniz Undav",
      "team": "GER",
      "flag": "🇩🇪",
      "goals": 3,
      "assists": 2,
      "matches": 0
    },
    {
      "rank": 7,
      "name": "Johan Manzambi",
      "team": "SUI",
      "flag": "🇨🇭",
      "goals": 3,
      "assists": 1,
      "matches": 0
    },
    {
      "rank": 8,
      "name": "Ismaïla Sarr",
      "team": "SEN",
      "flag": "🇸🇳",
      "goals": 3,
      "assists": 1,
      "matches": 0
    },
    {
      "rank": 9,
      "name": "Ismael Saibari",
      "team": "MAR",
      "flag": "🇲🇦",
      "goals": 3,
      "assists": 0,
      "matches": 0
    },
    {
      "rank": 10,
      "name": "Elijah Just",
      "team": "NZL",
      "flag": "🇳🇿",
      "goals": 3,
      "assists": 0,
      "matches": 0
    }
  ],
  "topAssisters": [
    {
      "rank": 1,
      "name": "Alexander Isak",
      "team": "SWE",
      "flag": "🇸🇪",
      "goals": 1,
      "assists": 3,
      "matches": 0
    },
    {
      "rank": 2,
      "name": "Bruno Guimarães",
      "team": "BRA",
      "flag": "🇧🇷",
      "goals": 0,
      "assists": 3,
      "matches": 0
    },
    {
      "rank": 3,
      "name": "Michael Olise",
      "team": "FRA",
      "flag": "🇫🇷",
      "goals": 0,
      "assists": 3,
      "matches": 0
    },
    {
      "rank": 4,
      "name": "Kylian Mbappé",
      "team": "FRA",
      "flag": "🇫🇷",
      "goals": 4,
      "assists": 2,
      "matches": 0
    },
    {
      "rank": 5,
      "name": "Deniz Undav",
      "team": "GER",
      "flag": "🇩🇪",
      "goals": 3,
      "assists": 2,
      "matches": 0
    },
    {
      "rank": 6,
      "name": "Breel Embolo",
      "team": "SUI",
      "flag": "🇨🇭",
      "goals": 1,
      "assists": 2,
      "matches": 0
    },
    {
      "rank": 7,
      "name": "Viktor Gyökeres",
      "team": "SWE",
      "flag": "🇸🇪",
      "goals": 1,
      "assists": 2,
      "matches": 0
    },
    {
      "rank": 8,
      "name": "Mohamed Salah",
      "team": "EGY",
      "flag": "🇪🇬",
      "goals": 1,
      "assists": 2,
      "matches": 0
    },
    {
      "rank": 9,
      "name": "Iliman Ndiaye",
      "team": "SEN",
      "flag": "🇸🇳",
      "goals": 1,
      "assists": 2,
      "matches": 0
    },
    {
      "rank": 10,
      "name": "Nathan Saliba",
      "team": "CAN",
      "flag": "🇨🇦",
      "goals": 1,
      "assists": 2,
      "matches": 0
    }
  ],
  "highlights": [
    {
      "type": "blowout",
      "label": "最大比分",
      "match": "Germany 7-1 Curaçao",
      "date": "Jun 14",
      "group": "E",
      "description": "德国战车火力全开，7球狂胜库拉索"
    },
    {
      "type": "upset",
      "label": "冷门",
      "match": "Spain 0-0 Cabo Verde",
      "date": "Jun 15",
      "group": "H",
      "description": "世界杯新军佛得角逼平欧洲冠军西班牙！"
    },
    {
      "type": "thriller",
      "label": "精彩对决",
      "match": "Netherlands 2-2 Japan",
      "date": "Jun 14",
      "group": "F",
      "description": "日本两度落后两度扳平，亚洲之光闪耀"
    },
    {
      "type": "dominant",
      "label": "主场大胜",
      "match": "USA 4-1 Paraguay",
      "date": "Jun 12",
      "group": "D",
      "description": "美国队主场4-1横扫巴拉圭"
    },
    {
      "type": "blowout",
      "label": "最大分差",
      "match": "Canada 6-0 Qatar",
      "date": "Jun 18",
      "group": "B",
      "description": "加拿大主场6-0狂胜卡塔尔，创本届最大分差！"
    },
    {
      "type": "dominant",
      "label": "强势拿下",
      "match": "Switzerland 4-1 Bosnia",
      "date": "Jun 18",
      "group": "B",
      "description": "瑞士4-1大胜波黑，B组出线形势扑朔迷离"
    },
    {
      "type": "thriller",
      "label": "激烈争夺",
      "match": "Mexico 1-0 Korea Rep.",
      "date": "Jun 18",
      "group": "A",
      "description": "墨西哥1-0力克韩国，两连胜领跑A组"
    },
    {
      "type": "dominant",
      "label": "主场连胜",
      "match": "USA 2-0 Australia",
      "date": "Jun 19",
      "group": "D",
      "description": "美国队2-0完胜澳大利亚，两连胜提前锁定出线！"
    },
    {
      "type": "dominant",
      "label": "桑巴起舞",
      "match": "Brazil 3-0 Haiti",
      "date": "Jun 19",
      "group": "C",
      "description": "巴西3-0轻取海地，库尼亚梅开二度闪耀全场"
    },
    {
      "type": "tight",
      "label": "绝杀",
      "match": "Scotland 0-1 Morocco",
      "date": "Jun 19",
      "group": "C",
      "description": "摩洛哥1-0力克苏格兰，塞巴里连续两场进球"
    },
    {
      "type": "tight",
      "label": "客场逆袭",
      "match": "Turkey 0-1 Paraguay",
      "date": "Jun 19",
      "group": "D",
      "description": "巴拉圭1-0客胜土耳其，恩西索助攻加拉萨一锤定音"
    }
  ]
};
