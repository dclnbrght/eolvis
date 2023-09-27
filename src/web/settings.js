
/* the path to the data file */
export const dataPath = "data/eolvis-demo.json";

/* the number of years in the past to show on the timeline */
export const yearsPast = 3;

/* the number of years in the future to show on the timeline */
export const yearsFuture = 6;

/* the width of year */
export const yearWidth = 190;

/* number of to highlight that EOL is near */
export const warnNearEolDays = 90;

/* display LTS in the item label where it's set to true  */
export const displayLtsLabelIfTrue = true;

/* item types */
export const types = {
    "device": "Device",
    "operating-system": "Operating System",
    "platform": "Platform",
    "framework": "Framework",
    "library": "Library",
    "middleware": "Middleware",
    "data-store": "Data Store",
    "protocol": "Protocol"
};

/* SBoM types */
export const softwareBomTypeMap = {
    "operating-system": "operating-system",    
    "middleware": "platform",
    "platform": "platform",
    "framework": "framework",
    "library": "library",
};

/* the text in the month labels on the timeline */
export const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];