export const STORE_ITEMS: StoreItem[] = [
        {image: require('../../assets/images/home/accessories/apple.png'), name: 'Apple', price: 40},
        {image: require('../../assets/images/home/accessories/bow.png'), name: 'Bow', price: 50},
        {image: require('../../assets/images/home/accessories/cowboy_hat.png'), name: 'Cowboy', price: 70},
        {image: require('../../assets/images/home/accessories/guitar.png'), name: 'Guitar', price: 100},
        {image: require('../../assets/images/home/accessories/scarf.png'), name: 'Scarf', price: 50},
        {image: require('../../assets/images/home/accessories/wizard_hat.png'), name: 'Wizard Hat', price: 100}
    ];

export type StoreItem = {
  image: any,
  name: string,
  price: number,
};