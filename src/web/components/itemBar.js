import * as settings from '../settings.js';
import * as dateUtils from '../js/dateUtils.js';
import * as itemDetailsForm from '../components/itemDetailsForm.js';
import * as svgUtils from '../js/svgUtils.js';

export class ItemBar extends HTMLElement {

    #itemDetailsFormComponent = document.getElementById("item-details-form");
    #monthWidth = settings.yearWidth / 12;

    constructor() {
        super();
    }

    #renderBarsAndLabel = (item, y, refDate, minDate, maxDate, displayInUseBar) => {
        const itemBarHeightInUse = 20;
        const itemBarHeightSupported = 22;

        const inUseStartIsSet = item.useFrom !== null && item.useFrom !== "";
        const inUseStart = new Date(item.useFrom);

        const inUseEndIsSet = item.useTo !== null && item.useTo !== "";
        const inUseEnd = new Date(item.useTo);
        const inUseEndCalc = !inUseEndIsSet ? dateUtils.addMonths(inUseStart, 12) : new Date(item.useTo);

        const monthsInUseFromStart = dateUtils.numberOfMonths(minDate, inUseStart) - 1;
        const monthsInUse = inUseStartIsSet ? dateUtils.numberOfMonths(inUseStart, inUseEndCalc) : 0;

        const supportedStart = new Date(item.supportedFrom);
        const supportedEndIsSet = item.supportedTo !== null && item.supportedTo !== "";
        const supportedEndCalc = !supportedEndIsSet ? inUseEndCalc : new Date(item.supportedTo);

        const monthsSupportedFromStart = dateUtils.numberOfMonths(minDate, supportedStart) - 1;
        const monthsSupported = dateUtils.numberOfMonths(supportedStart, supportedEndCalc);

        const supportExtendedStart = new Date(item.supportedTo);
        const supportExtendedEndIsSet = item.supportedToExtended !== null && item.supportedToExtended !== "";
        const supportExtendedEndCalc = !supportExtendedEndIsSet ? supportedEndCalc : new Date(item.supportedToExtended);

        const monthsSupportExtendedFromStart = supportedEndIsSet ? dateUtils.numberOfMonths(minDate, supportExtendedStart) : 0;
        const monthsSupportExtended = supportedEndIsSet ? dateUtils.numberOfMonths(supportExtendedStart, supportExtendedEndCalc) - 1 : 0;

        const monthsSupportTotal = monthsSupported + monthsSupportExtended;

        // Create item supported bar
        const itemSupportedRect = svgUtils.createSvgRect(
            this.#monthWidth * monthsSupportedFromStart,
            y,
            this.#monthWidth * monthsSupported,
            itemBarHeightSupported,
            ["item-supported", (supportedEndIsSet ? "" : "item-supported-noEnd")]
        );

        // Create item supported bar
        const itemSupportExtendedRect = svgUtils.createSvgRect(
            this.#monthWidth * monthsSupportExtendedFromStart,
            y,
            this.#monthWidth * monthsSupportExtended,
            itemBarHeightSupported,
            ["item-support-extended", (supportExtendedEndIsSet ? "" : "item-supported-noEnd")]
        );

        // Create item in use bar
        const itemInUseRect = !displayInUseBar ? svgUtils.createSvgElement("g") : svgUtils.createSvgRect(
            this.#monthWidth * monthsInUseFromStart,
            y + 1,
            this.#monthWidth * monthsInUse,
            itemBarHeightInUse,
            this.getClassNamesForItemInUse(refDate, inUseStart, inUseEndIsSet, inUseEndCalc, supportExtendedEndCalc)
        );

        const isInUseAndOutOfSupport = () =>
        {
            return (displayInUseBar 
                && (inUseStartIsSet && inUseStart < refDate) 
                && (inUseEndIsSet && inUseEnd > refDate) 
                && (supportedEndIsSet && inUseEnd > supportExtendedEndCalc))
                ? true : false;
        }

        const itemInUseUnsupportedRect = !isInUseAndOutOfSupport() ? svgUtils.createSvgElement("g") : svgUtils.createSvgRect(
            this.#monthWidth * (monthsSupportedFromStart + monthsSupported + monthsSupportExtended),
            y + 1,
            this.#monthWidth * ((monthsInUseFromStart + monthsInUse) - (monthsSupportedFromStart + monthsSupported) - monthsSupportExtended),
            itemBarHeightInUse,
            ["item", "item-inuse-eol"]
        );

        // Create item supported border
        const itemSupportedBorder = svgUtils.createSvgRect(
            this.#monthWidth * monthsSupportedFromStart,
            y,
            this.#monthWidth * monthsSupported,
            itemBarHeightSupported,
            ["item-supported-border", supportedEndIsSet ? "" : "item-supported-border-noEnd"]
        );

        // Create item supportextended border
        const itemSupportExtendedBorder = svgUtils.createSvgRect(
            this.#monthWidth * monthsSupportExtendedFromStart,
            y,
            this.#monthWidth * monthsSupportExtended,
            itemBarHeightSupported,
            ["item-support-extended-border", supportExtendedEndIsSet ? "" : "item-supported-border-noEnd"]
        );

        // Create item label
        const monthsFromStart = monthsInUseFromStart > 0 && displayInUseBar ? monthsInUseFromStart : monthsSupportedFromStart;
        const barCenterX = this.#monthWidth * (monthsFromStart + (monthsInUse > 0 && displayInUseBar ? monthsInUse : monthsSupportTotal) / 2);
        const x = barCenterX <= 0 ? 4 : barCenterX;
        const anchor = barCenterX <= 0 ? "start" : "middle";
        const itemLabel = svgUtils.createSvgText(
            `${item.name} ${item.version}${settings.displayLtsLabelIfTrue && item.lts ? " (LTS)" : ""}`,
            x,
            y + 15,
            anchor,
            ["item-label"]
        );

        return [itemSupportedRect, itemSupportExtendedRect, itemInUseRect, itemInUseUnsupportedRect, itemSupportedBorder, itemSupportExtendedBorder, itemLabel];
    };

    // Get the CSS classes for the item in use bar
    getClassNamesForItemInUse = (refDate, inUseStart, inUseEndIsSet, inUseEnd, supportedEnd) => {
        const classNames = ["item"];
        if (inUseStart < refDate && inUseEnd > refDate) {
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
            && inUseEnd > refDate
            && supportedEnd < new Date(refDate.getTime() + (settings.warnNearEolDays * 24 * 3600000))
            && supportedEnd > refDate ) {
            classNames.push("item-inuse-near-eol");
        }
        return classNames;
    };

    render = (item, y, refDate, minDate, maxDate, displayInUseBar) => {

        const [itemSupportedRect,
            itemSupportExtendedRect,
            itemInUseRect,
            itemInUseUnsupportedRect,
            itemSupportedBorder,
            itemSupportExtendedBorder,
            itemLabel]
            = this.#renderBarsAndLabel(
                item,
                y,
                refDate,
                minDate,
                maxDate,
                displayInUseBar
            );

        const itemGroupAnchor = svgUtils.createSvgElement("a");
        itemGroupAnchor.addEventListener("click", (e) => {
            this.#itemDetailsFormComponent.showModal(item);
        });

        const itemGroup = svgUtils.createSvgElement("g");
        itemGroup.id = `${item.name}-${item.version}`;
        itemGroup.appendChild(itemSupportedRect);
        itemGroup.appendChild(itemSupportExtendedRect);
        itemGroup.appendChild(itemInUseRect);
        itemGroup.appendChild(itemInUseUnsupportedRect);
        itemGroup.appendChild(itemSupportedBorder);
        itemGroup.appendChild(itemSupportExtendedBorder);
        itemGroup.appendChild(itemLabel);
        itemGroupAnchor.appendChild(itemGroup);

        return itemGroupAnchor;
    };

}

customElements.define('item-bar', ItemBar);