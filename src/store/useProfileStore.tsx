import { create } from "zustand";
import { supabase } from "@/lib/supabase";

type ProfileState = {
    userID: string | null;
    name: string;
    chickName: string;
    equippedItemId: number | null,
    ownedItemIds: number[],
    xp: number,
    coins: number,
    isLoading: boolean,

    init: () => Promise<void>;
    setChickName: (newName: string) => Promise<void>;
    buyItem: (price: number, itemId: number) => Promise<void>;
    equipItem: (itemId: number) => Promise<void>;
    unequipItem: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
    userID: null,
    name: '',
    chickName: '',
    equippedItemId: null,
    ownedItemIds: [],
    xp: 0,
    coins: 0,
    isLoading: true,

    init: async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
        set({ isLoading: false });
        return;
        }

        const metadataName = user.user_metadata?.display_name;

        const { data } = await supabase
        .from('profiles')
        .select('display_name, chicken_name, equipped_item_id, xp, coins')
        .eq('id', user.id)
        .single();

        if (data) {
        set({
            name: data.display_name ?? metadataName ?? '',
            chickName: data.chicken_name ?? '',
            equippedItemId: data.equipped_item_id,
            xp: data.xp ?? 0,
            coins: data.coins ?? 0,
            });
        }

        const { data: inventoryData } = await supabase
        .from('inventory')
        .select('item_id')
        .eq('user_id', user.id);

        set({
        ownedItemIds: inventoryData ? inventoryData.map(row => row.item_id) : [],
        isLoading: false,
        });
    },

    setChickName: async (newName) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
        .from('profiles')
        .update({ chicken_name: newName })
        .eq('id', user.id);

        if (error) {
        console.error(error);
        return;
        }

        set({ chickName: newName });
    },

    buyItem: async (price, itemId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error: coinsError } = await supabase
        .from('profiles')
        .update({ coins: get().coins - price })
        .eq('id', user.id);

        if (coinsError) {
        console.error(coinsError);
        return;
        }

        const { error: inventoryError } = await supabase
        .from('inventory')
        .insert({ user_id: user.id, item_id: itemId });

        if (inventoryError) {
        console.error(inventoryError);
        return;
        }

        set((state) => ({
        coins: state.coins - price,
        ownedItemIds: [...state.ownedItemIds, itemId],
        }));
    },

    equipItem: async (itemId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
        .from('profiles')
        .update({ equipped_item_id: itemId })
        .eq('id', user.id);

        if (error) {
        console.error(error);
        return;
        }
        set({ equippedItemId: itemId });
    },

    // no need for itemId argument as only one item can be equipped at one time -> do no need to know
    unequipItem: async () => {
        const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ equipped_item_id: null })
      .eq('id', user.id);

        if (error) {
        console.error(error);
        return;
        }
        set({ equippedItemId: null });
    },


            
}))