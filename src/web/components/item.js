import * as settings from '../settings.js';
import * as dateUtils from './dateUtils.js';
import * as svgUtils from './svgUtils.js';

const monthWidth = settings.yearWidth / 12;

const render = (item, y, minDate, maxDate) => {

    const today = new Date();
    const itemBarHeightInUse = 20;
    const itemBarHeightSupported = 5;

    const inUseStart = new Date(item.useFrom)
    const inUseEnd = (item.useTo === "") ? dateUtils.addMonths(inUseStart, 12) : new Date(item.useTo);
    const monthsInUseFromStart = dateUtils.numberOfMonths(minDate, inUseStart) - 1;
    const monthsInUse = dateUtils.numberOfMonths(inUseStart, inUseEnd);

    const supportedStart = new Date(item.supportedFrom);
    const supportedEnd = (item.supportedTo === "") ? inUseEnd : new Date(item.supportedTo);
    const monthsSupportedFromStart = dateUtils.numberOfMonths(minDate, supportedStart) - 1;
    const monthsSupported = dateUtils.numberOfMonths(supportedStart, supportedEnd);

    let itemGroup = svgUtils.renderSvgElement("g");
    itemGroup.id = `${item.name}-${item.version}`;

    // item supported bar
    let itemSupportedRect = svgUtils.renderSvgElement("rect");
    itemSupportedRect.classList.add("item-supported");
    itemSupportedRect.setAttribute("x", monthWidth * monthsSupportedFromStart);
    itemSupportedRect.setAttribute("y", y + itemBarHeightInUse);
    itemSupportedRect.setAttribute("width", monthWidth * monthsSupported);
    itemSupportedRect.setAttribute("height", itemBarHeightSupported);
    if (item.supportedTo === "") {
        itemSupportedRect.classList.add("item-supported-noEnd");
    }
    itemGroup.appendChild(itemSupportedRect);

    // item in use bar
    let itemInUseRect = svgUtils.renderSvgElement("rect");
    itemInUseRect.classList.add("item");
    itemInUseRect.setAttribute("x", monthWidth * monthsInUseFromStart);
    itemInUseRect.setAttribute("y", y);
    itemInUseRect.setAttribute("width", monthWidth * monthsInUse);
    itemInUseRect.setAttribute("height", itemBarHeightInUse);
    if (inUseStart < today && inUseEnd > today) {
        itemInUseRect.classList.add("item-inuse");
    }
    if (item.useTo === "") {
        if (inUseStart > today) {
            itemInUseRect.classList.add("item-inuse-future-noEnd");
        }
        else {
            itemInUseRect.classList.add("item-inuse-noEnd");
        }
    }
    else if (inUseStart > today) {
        itemInUseRect.classList.add("item-inuse-future");
    }
    else if (inUseStart < today
        && inUseEnd > today
        && inUseEnd > supportedEnd
        && inUseEnd < new Date((supportedEnd.getTime() + (settings.warnNearEolDays * 24 * 3600000)))) {
        itemInUseRect.classList.add("item-inuse-near-eol");
    }
    else if (inUseStart < today && inUseEnd > today && inUseEnd > supportedEnd) {
        itemInUseRect.classList.add("item-inuse-eol");
    }
    itemGroup.appendChild(itemInUseRect);

    // item label
    let itemLabel = svgUtils.renderSvgElement("text");
    itemLabel.classList.add("item-label");
    itemLabel.textContent = `${item.name} ${item.version} ${settings.displayLtsLabelIfTrue && item.lts ? "(LTS)" : ""}`;
    itemLabel.setAttribute("x", ((monthWidth * monthsInUseFromStart) + (monthWidth * monthsInUse / 2)));
    itemLabel.setAttribute("y", y + 15);
    itemLabel.setAttribute("text-anchor", "middle");
    itemGroup.appendChild(itemLabel);

    // item group with link
    let itemGroupAnchor = svgUtils.renderSvgElement("a");
    itemGroupAnchor.setAttribute("href", `${item.link}`);
    itemGroupAnchor.appendChild(itemGroup);

    return itemGroupAnchor;
};

export { render };