export interface RsvpData {
  name: string;
  adults: number;
  children: number;
  arrivalDay: 'viernes' | 'sabado';
  phoneHost: string;
  notes: string;
  status?: 'confirmed' | 'declined';
}

export interface RsvpRecord extends RsvpData {
  id: string;
  status: 'confirmed' | 'declined';
  createdAt: string;
}

export interface PollState {
  boyVotes: number;
  girlVotes: number;
  localBoyVotes: number;
  localGirlVotes: number;
}

