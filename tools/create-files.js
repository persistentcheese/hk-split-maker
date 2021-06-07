/* eslint-disable */

const {
    readFileSync,
    writeFileSync
} = require("fs");

const FILE = {
    // DIRECTORY: "./src/asset/icons/icon-directory.json",
    EVERY: "./src/asset/categories/every.json",
    SPLITS: "./src/asset/splits.txt",
    ICONS: "./src/asset/icons/icons.ts"
}

// TODO: figure out good way to have tools and web share common code

function parseSplitsDefinitions() {
    const splits = readFileSync(FILE.SPLITS, { encoding: "utf8" });
    const SPLITS_DEFINITIONS_REGEXP =
        /\[Description\("(?<description>.+)"\), ToolTip\("(?<tooltip>.+)"\)\]\s+(?<id>\w+),/g;
    const DESCRIPTION_NAME_REGEXP = /(?<name>.+)\s+\((?<qualifier>.+)\)/;
    const matches = splits.matchAll(SPLITS_DEFINITIONS_REGEXP);
    const definitions = new Map();
    for (const match of matches) {
        if (!match.groups) {
            throw new Error("RegExp match must have groups");
        }

        const {
            description,
            id,
            tooltip,
        } = match.groups;

        const desMatch = DESCRIPTION_NAME_REGEXP.exec(description);
        if (!desMatch) {
            throw new Error(`Invalid Description: ${description}`);
        }
        if (!desMatch.groups) {
            throw new Error("RegExp match must have groups");
        }

        const { name, qualifier, } = desMatch.groups;



        definitions.set(id, {
            id,
            qualifier,
        });
    }

    return definitions;
}

const Splits = [...parseSplitsDefinitions().values()];




// const output = {};

// for (const [key, {imageId, file}] of Object.entries(directory)) {
//     output[key] = `${file}/${imageId}.png`;
// }

// for (const splitId of every.splitIds) {
//     output[splitId] = directory[splitId] || `TO_BE_DETERMINED/${splitId}.png`;
// }

// console.log(output);

const every = {
    "splitIds": Splits.map(({ id }) => id),
    "ordered": true,
    "endTriggeringAutosplit": false,
    "gameName": "Hollow Knight Category Extensions",
    "categoryName": "EVERY AUTOSPLIT",
    "variables": {
        "platform": "PC",
        "patch": "1.4.3.2"
    }
}

function createEvery() {
    const output = JSON.stringify(every, null, 4);
    writeFileSync(FILE.EVERY, output);
}

const NEW_ID_MAP = {
    "HasDelicateFlower": "DelicateFlower",
    "PaleLurkerKey": "SimpleKey",
    "Mask2": "Mask1",
    "Mask3": "Mask1",
    "Mask4": "Mask1",
    "MaskFragment5": "MaskFragment1",
    "MaskFragment9": "MaskFragment1",
    "MaskFragment13": "MaskFragment1",
    "MaskFragment6": "MaskFragment2",
    "MaskFragment10": "MaskFragment2",
    "MaskFragment14": "MaskFragment2",
    "MaskFragment7": "MaskFragment3",
    "MaskFragment11": "MaskFragment3",
    "MaskFragment15": "MaskFragment3",
    "Vessel2": "Vessel1",
    "Vessel3": "Vessel1",
    "VesselFragment2": "VesselFragment1",
    "VesselFragment4": "VesselFragment1",
    "VesselFragment5": "VesselFragment1",
    "VesselFragment7": "VesselFragment1",
    "VesselFragment8": "VesselFragment1",
    "CrystalGuardian": "CrystalGuardian1",
    "CrystalGuardian2": "CrystalGuardian1",
    "EnragedGuardian": "CrystalGuardian1",
    "GreyPrince": "GreyPrinceZote",
    "Sly": "SlyNailsage",
    "NoskHornet": "Nosk",
    "Hornet2": "Hornet1",
    "FailedKnight": "FalseKnight",
    "FailedChampion": "FalseKnight",
    "LostKin": "BrokenVessel",
    "BlackKnight": "WatcherKnights",
    "SoulTyrant": "SoulMaster",
    "MegaMossCharger": "MassiveMossCharger",
    "OroMatoNailBros": "MatoOroNailBros",
    "Dreamer1": "Dreamer",
    "Dreamer2": "Dreamer",
    "Dreamer3": "Dreamer",
    "Hegemol": "Herrah"
};

function getUrl(id, qualifier) {
    if (id === "DungDefenderIdol") {
        return getUrl("KingsIdol", "Relic");
    }
    if (qualifier === "Essence") {
        const match = id.match(/(?<name>.+)Essence/);
        if (match) {
            return getUrl(match.groups.name, "Boss");
        }
    }
    if (qualifier === "Pantheon") {
        const match = id.match(/(?<name>.+)P/);
        if (match) {
            return getUrl(match.groups.name, "Boss");
        }
    }

    if (qualifier === "Charm Notch") {
        return getUrl("CharmNotch", "Item");
    }

    if (qualifier === "Event") {
        switch (id) {
            case "PreGrimmShop": return getUrl("TroupeMasterGrimm", "Boss");
            case "CanOvercharm": return getUrl("Charmed", "Achievement");
            case "UnchainedHollowKnight": return getUrl("HollowKnightBoss", "Boss");
            case "WatcherChandelier": return getUrl("WatcherChandelier", "Misc");
            case "CityGateOpen": return getUrl("CityKey", "Item");
            case "FlowerQuest": return getUrl("DelicateFlower", "Item");
            case "FlowerRewardGiven": return getUrl("DelicateFlower", "Item");
            case "HappyCouplePlayerDataEvent": return getUrl("HappyCouple", "Achievement");
            case "AllCharmNotchesLemm2CP": return getUrl("Lemm", "Misc");
            case "NailsmithKilled": return getUrl("Purity", "Achievement");
            case "NailsmithSpared": return getUrl("HappyCouple", "Achievement");
            case "NightmareLantern": return getUrl("Flame", "Misc");
            case "NightmareLanternDestroyed": return getUrl("Banishment", "Achievement");
            case "HollowKnightDreamnail": return getUrl("HollowKnightBoss", "Boss");
            case "SeerDeparts": return getUrl("Ascension", "Achievement");
            case "SpiritGladeOpen": return getUrl("Attunement", "Achievement");
            case "BeastsDenTrapBench": return getUrl("Bench", "Misc");
        }

    }

    let newId = NEW_ID_MAP[id] || id;

    let newQualifier = qualifier;
    // switch (qualifier) {
    //     case "Fragment": {
    //         newQualifier = "Upgrade";
    //     } break;
    // }
    return `./${newQualifier}/${newId}.png`;
}

function createIconImports() {
    let output = "/* eslint-disable */\n";
    for (const { id, qualifier } of Splits) {
        output += `import ${id} from "${getUrl(id, qualifier)}";\n`;
    }

    // console.log(output);
    output += "export default {\n";
    for (const { id } of Splits) {
        output += `    ${id},\n`;
    }
    output += "};\n";


    // console.log(output);
    writeFileSync(FILE.ICONS, output);
}


// createEvery();
createIconImports();
