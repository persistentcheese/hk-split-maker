import SplitConfigSchemaSource from "../schema/splits.schema.json";
import { parseSplitsDefinitions } from "../lib/splits";

const Splits = [...parseSplitsDefinitions().values()];

const splitsSchema = Splits.map(({ description: title, tooltip: description, id, }) => {
    return {
        title,
        description,
        const: id,
    };
});

const subsplitsSchema = Splits.map(({ description: title, tooltip: description, id, }) => {
    return {
        title,
        description: `(subsplit) ${description}`,
        const: `-${id}`,
    };
});

const manualSplit = {
    "title": "Manual Split",
    "description": "A mid-run manual split",
    "type": "string",
    "pattern": "^%.+",
};

type SplitIdItem = typeof manualSplit | {
    title: string;
    description: string;
    const: string;
};

const items = SplitConfigSchemaSource.properties.splitIds.items as {
    oneOf: Array<SplitIdItem>;
};

items.oneOf = items.oneOf.concat(splitsSchema).concat(subsplitsSchema).concat(manualSplit);

export default SplitConfigSchemaSource;