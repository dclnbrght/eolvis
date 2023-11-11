
/* the path to the data file */
export const dataPath = "data/eolvis-demo.json";

/* read write mode */
export const readWriteMode = true;

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

/* filter exported items */
export const exportedItemsAreFiltered = true;

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

export const licenseTypes = {
    "": "",
    "Apache-2.0": "Apache 2.0",
    "BSD-2-Clause": "BSD 2",
    "BSD-3-Clause": "BSD 3",
    "Commercial": "Commercial",
    "GPL-2.0": "GPL 2.0",
    "GPL-2.0-with-classpath-exception": "GPL 2.0 classpath exception",
    "GPL-3.0": "GPL 3.0",
    "LGPL-2.1": "LGPL 2.1",
    "LGPL-3.0": "LGPL 3.0",
    "MIT": "MIT",
    "MPL-1.1": "MPL 1.1",
    "MPL-2.0": "MPL 2.0",
    "Other": "Other"
};

/* periods */
export const periods = {
    "past": "Past",
    "current": "Current",
    "future": "Future"
};

/* SBoM types */
export const softwareBomTypeMap = {
    "operating-system": "operating-system",
    "middleware": "framework",
    "platform": "framework",
    "framework": "framework",
    "library": "library",
};

/* the text in the month labels on the timeline */
export const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];