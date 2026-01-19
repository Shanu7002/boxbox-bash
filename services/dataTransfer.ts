import { Store } from './Store';
import type { IPlayer } from '@interfaces/IPlayer';
import type { INote } from '@interfaces/INote';
import type { ITeam } from '@interfaces/ITeam';

const VALID_RANKS = [
  'iron',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'emerald',
  'diamond',
  'master',
  'grandmaster',
  'challenger',
];

function isValidPlayer(player: unknown): player is IPlayer {
  if (typeof player !== 'object' || player === null) return false;
  const p = player as Record<string, unknown>;
  return (
    isString(p.id) &&
    isString(p.name) &&
    isNumber(p.gold) &&
    isNumber(p.games) &&
    isString(p.rank) &&  VALID_RANKS.includes(p.rank) &&
    (p.tier === undefined || (isNumber(p.tier) && p.tier >= 1 && p.tier <= 4)) &&
    isNumber(p.lp) &&
    isString(p.avatarSeed)
  );
}

function isValidPlayers(players: unknown): players is Record<string, IPlayer> {
  if (typeof players !== 'object' || players === null) return false;
  return Object.values(players).every(isValidPlayer);
}

function isValidOrder(order: unknown): order is string[] {
  return Array.isArray(order) && order.every((id) => typeof id === 'string');
}

function isValidNote(note: unknown): note is INote {
  if (typeof note !== 'object' || note === null) return false;
  const n = note as Record<string, unknown>;
  return typeof n.text === 'string' && typeof n.timestamp === 'string';
}

function isValidNotes(notes: unknown): notes is Record<string, INote[]> {
  if (typeof notes !== 'object' || notes === null) return false;
  return Object.values(notes).every(
    (arr) => Array.isArray(arr) && arr.every(isValidNote),
  );
}

function isValidGeneralNotes(generalNotes: unknown): generalNotes is INote[] {
  return Array.isArray(generalNotes) && generalNotes.every(isValidNote);
}

// helper type guard for team member
function isValidTeamMember(member: unknown): member is { playerId: string, gold: number} {
  if (typeof member !== "object" || member === null) return false;

  return (
    "playerId" in member && typeof member.playerId === "string" &&
    "gold" in member && typeof member.gold === "number"
  )
}

// type guard ITeam
function isValidTeam(team: unknown): team is ITeam {
  if (typeof team !== 'object' || team === null) return false;
  if(!("id" in team && "name" in team && "members" in team)) return false;

  const t = team as { id: unknown, name: unknown, members: unknown};

  return (
    typeof t.id === "string" &&
    typeof t.name === "string" &&
    Array.isArray(t.members) &&
    t.members.every(isValidTeamMember)
  );
}

// first call with teams array
function isValidTeams(teams: unknown): teams is ITeam[] {
  return Array.isArray(teams) && teams.every(isValidTeam);
}

export interface ExportData {
  version: 1;
  players: typeof Store.players;
  order: typeof Store.order;
  notes: typeof Store.notes;
  generalNotes: typeof Store.generalNotes;
  teams: typeof Store.teams;
}

export interface ExportLimitedData {
  version: 1;
  limited: true;
  players: Record<string, IPlayer>;
  order: typeof Store.order;
}

export const dataTransfer = {
  exportAll(): string {
    const data: ExportData = {
      version: 1,
      players: Store.players,
      order: Store.order,
      notes: Store.notes,
      generalNotes: Store.generalNotes,
      teams: Store.teams,
    };
    return JSON.stringify(data);
  },

  exportLimited(): string {
    const limitedPlayers: Record<string, IPlayer> = {};
    for (const [id, player] of Object.entries(Store.players)) {
      limitedPlayers[id] = {
        id: player.id,
        name: player.name,
        games: player.games,
        rank: player.rank,
        tier: player.tier || 1,
        lp: player.lp,
        avatarSeed: player.avatarSeed,
        gold: 0,
      };
    }

    const data: ExportLimitedData = {
      version: 1,
      limited: true,
      players: limitedPlayers,
      order: Store.order,
    };
    return JSON.stringify(data);
  },

  import(jsonString: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString);

      if (!data.version || data.version !== 1) {
        return { success: false, error: 'Invalid data format or version' };
      }

      if (data.limited) {
        if (!isValidPlayers(data.players)) {
          return { success: false, error: 'Invalid player data' };
        }
        if (!isValidOrder(data.order)) {
          return { success: false, error: 'Invalid order data' };
        }

        Store.players = data.players;
        Store.order = data.order;
        Store.notes = {};
        Store.generalNotes = [];
        Store.teams = [];
      } else {
        if (!isValidPlayers(data.players)) {
          return { success: false, error: 'Invalid player data' };
        }
        if (!isValidOrder(data.order)) {
          return { success: false, error: 'Invalid order data' };
        }
        if (!isValidNotes(data.notes)) {
          return { success: false, error: 'Invalid notes data' };
        }
        if (!isValidGeneralNotes(data.generalNotes)) {
          return { success: false, error: 'Invalid general notes data' };
        }
        if (!isValidTeams(data.teams)) {
          return { success: false, error: 'Invalid teams data' };
        }

        Store.players = data.players;
        Store.order = data.order;
        Store.notes = data.notes;
        Store.generalNotes = data.generalNotes;
        Store.teams = data.teams;
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Invalid JSON format' };
    }
  },
};

// utils

const isString = (v: unknown): v is string => typeof v === 'string';
const isNumber = (v: unknown): v is number => typeof v === 'number';