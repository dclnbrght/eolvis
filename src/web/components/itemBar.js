import * as settings from '../settings.js';
import * as dateUtils from './dateUtils.js';
import * as dataUpdate from './dataUpdate.js';
import * as svgUtils from './svgUtils.js';

const monthWidth = settings.yearWidth / 12;

const renderBarsAndLabel = (item, y, refDate, minDate, maxDate) => {
    const itemBarHeightInUse = 20;
    const itemBarHeightSupported = 22;

    const inUseStart = new Date(item.useFrom);
    const inUseEndIsSet = item.useTo !== "";
    const inUseEndCalc = !inUseEndIsSet ? dateUtils.addMonths(inUseStart, 12) : new Date(item.useTo);

    const monthsInUseFromStart = dateUtils.numberOfMonths(minDate, inUseStart) - 1;
    const monthsInUse = dateUtils.numberOfMonths(inUseStart, inUseEndCalc);

    const supportedStart = new Date(item.supportedFrom);
    const supportedEndIsSet = item.supportedTo !== "";
    const supportedEndCalc = !supportedEndIsSet ? inUseEndCalc : new Date(item.supportedTo);
    const monthsSupportedFromStart = dateUtils.numberOfMonths(minDate, supportedStart) - 1;
    const monthsSupported = dateUtils.numberOfMonths(supportedStart, supportedEndCalc);

    // Create item supported bar
    const itemSupportedRect = svgUtils.createSvgRect(
        monthWidth * monthsSupportedFromStart,
        y,
        monthWidth * monthsSupported,
        itemBarHeightSupported,
        ["item-supported", (item.supportedTo === "" ? "item-supported-noEnd" : "")]
    );

    // Create item in use bar
    const itemInUseRect = svgUtils.createSvgRect(
        monthWidth * monthsInUseFromStart,
        y + 1,
        monthWidth * monthsInUse,
        itemBarHeightInUse,
        getClassNamesForItemInUse(refDate, inUseStart, inUseEndIsSet, inUseEndCalc, supportedEndCalc)
    );

    // Create item supported border
    const itemSupportedBorder = svgUtils.createSvgRect(
        monthWidth * monthsSupportedFromStart,
        y,
        monthWidth * monthsSupported,
        itemBarHeightSupported,
        ["item-supported-border", item.supportedTo === "" ? "item-supported-border-noEnd" : ""]
    );

    // Create item label
    const monthsFromStart = monthsInUseFromStart > 0 ? monthsInUseFromStart : monthsSupportedFromStart;
    const itemLabel = svgUtils.createSvgText(
        `${item.name} ${item.version} ${settings.displayLtsLabelIfTrue && item.lts ? "(LTS)" : ""}`,
        monthWidth * (monthsFromStart + (monthsInUse > 0 ? monthsInUse : monthsSupported) / 2),
        y + 15,
        "middle",
        ["item-label"]
    );

    return [itemSupportedRect, itemInUseRect, itemSupportedBorder, itemLabel];
};

// Get the CSS classes for the item in use bar
const getClassNamesForItemInUse = (refDate, inUseStart, inUseEndIsSet, inUseEndCalc, supportedEndCalc) => {
    const classNames = ["item"];
    if (inUseStart < refDate && inUseEndCalc > refDate) {
        classNames.push("item-inuse");
    }
    if (!inUseEndIsSet) {
        if (inUseStart > refDate) {
            classNames.push("item-inuse-future-noEnd");
        } else {
            classNames.push("item-inuse-noEnd");
        }
    } else if (inUseStart > refDate) {
        classNames.push("item-inuse-future");
    } else if (inUseStart < refDate
        && inUseEndCalc > refDate
        && inUseEndCalc > supportedEndCalc) {
        classNames.push("item-inuse-eol");
    } else if (inUseStart < refDate
        && inUseEndCalc > refDate
        && supportedEndCalc < new Date(refDate.getTime() + (settings.warnNearEolDays * 24 * 3600000))) {
        classNames.push("item-inuse-near-eol");
    }
    return classNames;
};

const render = (item, y, refDate, minDate, maxDate) => {

    const [itemSupportedRect, itemInUseRect, itemSupportedBorder, itemLabel] = renderBarsAndLabel(
        item,
        y,
        refDate,
        minDate,
        maxDate
    );

    const itemGroupAnchor = svgUtils.createSvgElement("a");
    itemGroupAnchor.addEventListener("click", (e) => {
        dataUpdate.openForm(item);
    });

    const itemGroup = svgUtils.createSvgElement("g");
    itemGroup.id = `${item.name}-${item.version}`;
    itemGroup.appendChild(itemSupportedRect);
    itemGroup.appendChild(itemInUseRect);
    itemGroup.appendChild(itemSupportedBorder);
    itemGroup.appendChild(itemLabel);
    itemGroupAnchor.appendChild(itemGroup);

    return itemGroupAnchor;
};

const exportForTesting = {
    renderBarsAndLabel,
    getClassNamesForItemInUse
}

export { 
    render,
    exportForTesting
};