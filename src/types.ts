export interface RsvpData {
  name: string;
  adults: number;
  children: number;
  arrivalDay: 'viernes' | 'sabado';
  phoneHost: string;
  notes: string;
}

export interface PollState {
  boyVotes: number;
  girlVotes: number;
  localBoyVotes: number;
  localGirlVotes: number;
}
