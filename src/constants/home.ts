import { ImageStyle } from 'react-native';

export type Stage = 'egg' | 'chick' | 'chicken' | 'old';

export const STAGE_IMAGES = {
  egg:     require('@/assets/images/home/chicken_stages/egg.png'),
  chick:   require('@/assets/images/home/chicken_stages/chick.png'),
  chicken: require('@/assets/images/home/chicken_stages/chicken.png'),
  old:     require('@/assets/images/home/chicken_stages/old_chicken.png'),
};

export const getStage = (level: number) => {
  if (level < 5)  return 'egg';
  if (level < 20) return 'chick';
  if (level < 40) return 'chicken';
  return 'old';
};

export const getPetMsg = (level: number) => {
  const stage = getStage(level);
  if (stage === 'egg') return PET_MSG_EGG;
  if (stage === 'chick') return PET_MSG_CHICK;
  if (stage === 'chicken') return PET_MSG_CHICKEN;
  return PET_MSG_OLD_CHICKEN;
};

export const PET_MSG_EGG  = [
    "I can't wait to grow up 🫶",
    "I hope you like eggs",
    "don't crack under pressure!",
    "Keep rolling, you got this.",
    "I believe in you",
    "Taking breaks keeps your thoughts from being scrambled",
    "I can't believe I have to go for class",
    "Let's work on this together",
    "slow and steady wins the race",
    "Have you eaten today? (no eggs please)",
    "Take care of yourself <3",
    "How are you feeling today?"
  ]

export const PET_MSG_CHICK = [
    "You're doing amazing!",
    "Keep it up, you've got this!",
    "Time to lock in? or rest! both are great",
    "Another day, another win!",
    "Take it one day at a time",
    "YAY keep going!",
    "Please don't eat chicken for dinner",
    "Keep pecking!",
    "I hate going for lectures",
    "I'm so sleepy, what about you?",
    "Take care of yourself <3",
    "How are you feeling today?"
  ]

export const PET_MSG_CHICKEN = [
    "You're doing amazing!",
    "Keep it up, you've got this!",
    "Time to lock in? or rest! both are great",
    "Another day, another win!",
    "Take it one day at a time",
    "YAY keep going!",
    "Please don't eat chicken for dinner",
    "Keep pecking!",
    "I hate going for lectures",
    "I'm so sleepy, what about you?",
    "Take care of yourself <3",
    "How are you feeling today?"
  ]

  export const PET_MSG_OLD_CHICKEN = [
    "My age is catching up to me",
    "I'm glad to have known you for so long",
    "You've come such a long way",
    "You got this, I've seen you pull through",
    "Take it one day at a time",
    "Life is not a race",
    "Aging is a blessing (though my bones are tired)",
    "At least I don't have to go for classes anymore at my age",
    "I'm gonna take a nap, you should too",
    "How are you today?",
    "Make the most of your life while you're young",
    "Nice to see you again"
  ]


export type ItemCategory = 'hats' | 'accessories' | 'others';
 
export type StoreItem = {
  id: number,
  image: any,
  name: string,
  price: number,
  category: ItemCategory,
};
 
export const STORE_ITEMS: StoreItem[] = [
  {id: 0, image: require('../../assets/images/home/accessories/apple.png'),      name: 'Apple',      price: 40,  category: 'hats'},
  {id: 1, image: require('../../assets/images/home/accessories/bow.png'),        name: 'Bow',        price: 50,  category: 'accessories'},
  {id: 2, image: require('../../assets/images/home/accessories/cowboy_hat.png'), name: 'Cowboy',     price: 70,  category: 'hats'},
  {id: 3, image: require('../../assets/images/home/accessories/guitar.png'),     name: 'Guitar',     price: 100, category: 'others'},
  {id: 4, image: require('../../assets/images/home/accessories/scarf.png'),      name: 'Scarf',      price: 50,  category: 'accessories'},
  {id: 5, image: require('../../assets/images/home/accessories/wizard_hat.png'), name: 'Wizard Hat', price: 100, category: 'hats'},
  {id: 6, image: require('../../assets/images/home/accessories/baseball_hat.png'), name: 'Baseball Hat', price: 40, category: 'hats'},
  {id: 7, image: require('../../assets/images/home/accessories/headphones.png'), name: 'Headphones', price: 70, category: 'hats'},
  {id: 8, image: require('../../assets/images/home/accessories/chef_hat.png'), name: 'Chef Hat', price: 70, category: 'hats'},
  {id: 9, image: require('../../assets/images/home/accessories/balloons.png'), name: 'Balloons', price: 50,  category: 'accessories'},
  {id: 10, image: require('../../assets/images/home/accessories/nus_card.png'), name: 'NUS Card', price: 30,  category: 'accessories'},
  {id: 11, image: require('../../assets/images/home/accessories/tie.png'), name: 'Tie', price: 50, category: 'accessories'},
  {id: 12, image: require('../../assets/images/home/accessories/magic_wand.png'), name: 'Magic Wand', price: 60,  category: 'accessories'},
  {id: 13, image: require('../../assets/images/home/accessories/bubble.png'),     name: 'Bubble',     price: 60, category: 'others'},
  {id: 14, image: require('../../assets/images/home/accessories/phone.png'),     name: 'Phone',     price: 50, category: 'others'},
  {id: 15, image: require('../../assets/images/home/accessories/cat.png'),     name: 'Cat',     price: 100, category: 'others'},
  {id: 16, image: require('../../assets/images/home/accessories/study_cat.png'),     name: 'Study Cat',     price: 100, category: 'others'},
  {id: 17, image: require('../../assets/images/home/accessories/coffee.png'),     name: 'Coffee',     price: 30, category: 'others'},
];
 
export const ACCESSORY_OVERLAYS: Record<number, any> = {
  0: require('../../assets/images/home/accessories/chicken_apple.png'),
  1: require('../../assets/images/home/accessories/chicken_bow.png'),
  2: require('../../assets/images/home/accessories/chicken_cowboy.png'),
  3: require('../../assets/images/home/accessories/chicken_guitar.png'),
  4: require('../../assets/images/home/accessories/chicken_scarf.png'),
  5: require('../../assets/images/home/accessories/chicken_wizard.png'),
  6: require('../../assets/images/home/accessories/baseball_hat.png'),
  7: require('../../assets/images/home/accessories/headphones.png'),
  8: require('../../assets/images/home/accessories/chef_hat.png'), 
  9: require('../../assets/images/home/accessories/balloons.png'),
  10: require('../../assets/images/home/accessories/nus_card.png'),
  11: require('../../assets/images/home/accessories/tie.png'), 
  12: require('../../assets/images/home/accessories/magic_wand.png'),
  13: require('../../assets/images/home/accessories/bubble.png'), 
  14: require('../../assets/images/home/accessories/phone.png'),   
  15: require('../../assets/images/home/accessories/cat.png'),
  16: require('../../assets/images/home/accessories/study_cat.png'),
  17: require('../../assets/images/home/accessories/coffee.png'),
};

export const ACCESSORY_POSITIONS: Record<Stage, Record<number, ImageStyle>> = {
  egg: {
    // usually you'd leave hats/held items off the egg — add only what makes sense
    1: { top: 70,  left: 72, width: 62, height: 62 },  // bow
    4: { top: 95,  left: 60, width: 86, height: 55 },  // scarf
  },
  chick: {
    0: { top: 140, left: 96, width: 46, height: 46 },  // apple
    1: { top: 92,  left: 118, width: 46, height: 46 }, // bow
    2: { top: 18,  left: 62, width: 82, height: 72 },  // cowboy hat
    3: { top: 118, left: 52, width: 100, height: 92 }, // guitar
    4: { top: 108, left: 66, width: 74, height: 50 },  // scarf
    5: { top: 8,   left: 60, width: 86, height: 84 },  // wizard hat
  },
  chicken: {
    0: { top: 150, left: 98, width: 48, height: 48 },
    1: { top: 96,  left: 122, width: 48, height: 48 },
    2: { top: 5,   left: 60, width: 90, height: 80 },
    3: { top: 122, left: 55, width: 100, height: 90 },
    4: { top: 118, left: 70, width: 72, height: 48 },
    5: { top: 2,   left: 58, width: 92, height: 86 },
  },
  old: {
    0: { top: 152, left: 98, width: 48, height: 48 },
    1: { top: 98,  left: 122, width: 48, height: 48 },
    2: { top: 8,   left: 58, width: 92, height: 82 },
    3: { top: 124, left: 55, width: 100, height: 90 },
    4: { top: 120, left: 70, width: 72, height: 48 },
    5: { top: 6,   left: 58, width: 92, height: 86 },
  },
};