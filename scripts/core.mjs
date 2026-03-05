const MODULE_ID = "capkcks-fvtt-stuff";

// Item filter for usable
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
