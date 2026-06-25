export const STORE_ITEMS: StoreItem[] = [
        {id: 0, image: require('../../assets/images/home/accessories/apple.png'), name: 'Apple', price: 40},
        {id: 1, image: require('../../assets/images/home/accessories/bow.png'), name: 'Bow', price: 50},
        {id: 2, image: require('../../assets/images/home/accessories/cowboy_hat.png'), name: 'Cowboy', price: 70},
        {id: 3, image: require('../../assets/images/home/accessories/guitar.png'), name: 'Guitar', price: 100},
        {id: 4, image: require('../../assets/images/home/accessories/scarf.png'), name: 'Scarf', price: 50},
        {id: 5, image: require('../../assets/images/home/accessories/wizard_hat.png'), name: 'Wizard Hat', price: 100}
    ];

export type StoreItem = {
  id: number,
  image: any,
  name: string,
  price: number,
};