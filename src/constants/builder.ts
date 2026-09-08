/* 
    file containing constants and interfaces related
    to team building and roster building 
 */

import { type Position } from '../lib/models/player'


export interface PlayerData {
  id: number;
  name: string;
  position: Position;
  price: number;
  team_id: number;
}

export const POSITION_LIMITS: Record<Position, number> = {
  GK: 2,
  DF: 5,
  MF: 4,
  ST: 4,
}

export const STARTING_POSITION_LIMITS: Record<Position, number> = {
  GK: 1,
  DF: 4,
  MF: 3,
  ST: 3,
}

export const MAX_PER_TEAM = 3
export const MAX_PLAYERS = 15
export const MIN_NUM_TEAMS = 5;
export const TOTAL_STARTERS = 11


export const POSITION_GROUPS: { position: Position; label: string }[] = [
  { position: 'GK', label: 'Goalkeepers' },
  { position: 'DF', label: 'Defenders' },
  { position: 'MF', label: 'Midfielders' },
  { position: 'ST', label: 'Forwards' },
]
