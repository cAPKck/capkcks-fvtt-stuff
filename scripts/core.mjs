const MODULE_ID = "capkcks-fvtt-stuff";

/* Item filter for usable -------------------------------------------------------------------------------------------------------- */
// WARNING: Requires the following tweaks in the dnd5e system module to work:
/*
In the file systems/dnd5e/dnd5e.mjs in the _prepareSpellsContext function, add the following line to the filters object like so:

filters: [
        { key: "usable", label: "Usable" },
        ... other filters
    ]
*/
// TODO: Maybe add a different option where uses and spell slots are considered as well
Hooks.on("dnd5e.filterItem", (sheet, item, filters) => {
    if (filters.has("usable")) {
        // Check if item is either prepared, is innate/pact/atwill or is from an item
        if (item.system.prepared != 0) {
            return true;
        }
        if (item.system.method === "innate" || item.system.method === "ritual" || item.system.method === "atwill") {
            return true;
        }
        if (item.effects.has("dnd5espellchange")) {
            // TODO: Need to check if this is a unique identifier for spells from items
            return true;
        }
        return false;
    }
    return true;
});

/* Tides of Chaos and Wild Magic Surge -------------------------------------------------------------------------------------------------------- */
// Triggers Wild Magic Surge on roll of 20, or if Tides of Chaos is used up. 
// D20 Rolls are private to the player and GM, and the Wild Magic Surge table roll is private to the GM only.

// TODO: Implementation is very basic currently and does not handle much, but for now this works well enough.

Hooks.on("dnd5e.postUseActivity", async (activity) => {
    const item = activity.parent.parent;

    // Only fire when a spell slot is actually consumed
    if (!activity.consumption?.spellSlot) return;
    
    const character = item.parent;

    // Check if the character has the "Tides of Chaos" feature
    const tidesOfChaos = character.items.find(item => item.name === "Tides of Chaos");
    if (!tidesOfChaos) return;

    // Check if the character has uses of "Tides of Chaos" left
    const usesLeft = tidesOfChaos.system.uses?.value || 0;

    // Get the list of users who should see the roll (player and GM)
    const whisperTargets = [game.user.id, ...game.users.filter(u => u.isGM).map(u => u.id)];
    console.log(whisperTargets);

    if (usesLeft <= 0) {
        // Prompt for a wild magic table roll (private)
        const wildMagicTable = game.tables.find(table => table.name === "Wild Magic Surge");
        if (wildMagicTable) {
            await wildMagicTable.draw({
                messageMode: "blind"
            });
        } else {
            ui.notifications.warn("Wild Magic Surge table not found!");
        }
    } else {
        // Roll a d20 (private)
        const roll = await new Roll("1d20").roll();
        await roll.toMessage({
            flavor: "Wild Magic Check"
        }, { messageMode: "gm"});

        // On a 20, prompt for a wild magic table roll (private)
        if (roll.total === 20) {
            const wildMagicTable = game.tables.find(table => table.name === "Wild Magic Surge");
            if (wildMagicTable) {
                await wildMagicTable.draw({
                    messageMode: "blind"
                });
            } else {
                ui.notifications.warn("Wild Magic Surge table not found!");
            }
        }
    }
});