import { playerActions } from '@services/Store';
import { ranks, actionButton } from '@modules';
import { UserRoundPlus } from 'lucide-react';
import { Button } from '@base-ui/react/button';

const randomNames = [
  'Shadow',
  'Frost',
  'Crimson',
  'Solar',
  'Night',
  'Steel',
  'Silver',
  'Rogue',
  'Hex',
  'Nova',
  'Ember',
  'Iron',
  'Carbon',
  'Titan',
  'Arctic',
  'Void',
  'Holo',
  'Bold',
  'Rift',
  'Apex',
];
const randomSuffixes = [
  'Strike',
  'Byte',
  'Wolf',
  'Talon',
  'Cipher',
  'Viper',
  'Pulse',
  'Spectre',
  'Reaper',
  'Shield',
  'Knight',
  'Raven',
  'Warden',
  'Blade',
  'Zen',
  'Caster',
  'Sparrow',
  'Gryphon',
  'Oracle',
  'Phantom',
];

function generateRandomPlayer() {
  const name =
    randomNames[getRandomInt(randomNames.length)] +
    randomSuffixes[getRandomInt(randomSuffixes.length)];
  const rank = ranks[getRandomInt(ranks.length)];
  const tier = getRandomInt(4, 1);
  const lp = maxLP(rank);
  const games = getRandomInt(100);
  const gold = getRandomInt(30);
  const avatarSeed = crypto.randomUUID();

  return { name, rank, tier, lp, games, gold, avatarSeed };
}

export function CreatePlayer() {
  const handleCreatePlayer = () => {
    playerActions.create(generateRandomPlayer());
    setTimeout(() => {
      const scrollContainer = document.querySelector(
        'main > div.overflow-auto',
      );
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 0);
  };

  return (
    <Button
      onClick={handleCreatePlayer}
      className={actionButton({ class: 'p-2' })}
      title='Create new player'
    >
      <UserRoundPlus className='w-7 h-7' />
    </Button>
  );
}

// utils

function getRandomInt(max: number, min: number = 0): number {
  // returns a random integer where min <= integer <= max (min its optional with default 0)
  return Math.floor(Math.random() * (max - min)) + min; 
}

// just check the rank, we dont wanna see an iron IV player with 500lp lmao
function maxLP(rank: string): number {
  switch (rank) {
  case "master":
    return getRandomInt(400); // min: 0, max: 400
  case "grandmaster":
    return getRandomInt(800, 400); // min: 400, max: 800
  case "challenger":
    return getRandomInt(1200, 800); // min: 800, max: 1200
  default:
    return getRandomInt(99); // min: 0, max 99
  }
}