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

    #renderBarsAndLabel = (item, y, refDate, minDate, maxDate) => {
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

        const supportExtendedStart = new Date(item.supportedTo);
        const supportExtendedEndIsSet = item.supportedToExtended !== "";
        const supportExtendedEndCalc = !supportExtendedEndIsSet ? supportedEndCalc : new Date(item.supportedToExtended);

        const monthsSupportExtendedFromStart = supportedEndIsSet ? dateUtils.numberOfMonths(minDate, supportExtendedStart) : 0;
        const monthsSupportExtended = supportedEndIsSet ? dateUtils.numberOfMonths(supportExtendedStart, supportExtendedEndCalc) - 1 : 0;

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
        const itemInUseRect = svgUtils.createSvgRect(
            this.#monthWidth * monthsInUseFromStart,
            y + 1,
            this.#monthWidth * monthsInUse,
            itemBarHeightInUse,
            this.getClassNamesForItemInUse(refDate, inUseStart, inUseEndIsSet, inUseEndCalc, supportExtendedEndCalc)
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
        const monthsFromStart = monthsInUseFromStart > 0 ? monthsInUseFromStart : monthsSupportedFromStart;
        const itemLabel = svgUtils.createSvgText(
            `${item.name} ${item.version} ${settings.displayLtsLabelIfTrue && item.lts ? "(LTS)" : ""}`,
            this.#monthWidth * (monthsFromStart + (monthsInUse > 0 ? monthsInUse : monthsSupported) / 2),
            y + 15,
            "middle",
            ["item-label"]
        );

        return [itemSupportedRect, itemSupportExtendedRect, itemInUseRect, itemSupportedBorder, itemSupportExtendedBorder, itemLabel];
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
            && inUseEnd > supportedEnd) {
            classNames.push("item-inuse-eol");
        } else if (inUseStart < refDate
            && inUseEnd > refDate
            && supportedEnd < new Date(refDate.getTime() + (settings.warnNearEolDays * 24 * 3600000))) {
            classNames.push("item-inuse-near-eol");
        }
        return classNames;
    };

    render = (item, y, refDate, minDate, maxDate) => {

        const [itemSupportedRect,
            itemSupportExtendedRect,
            itemInUseRect,
            itemSupportedBorder,
            itemSupportExtendedBorder,
            itemLabel]
            = this.#renderBarsAndLabel(
                item,
                y,
                refDate,
                minDate,
                maxDate
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
        itemGroup.appendChild(itemSupportedBorder);
        itemGroup.appendChild(itemSupportExtendedBorder);
        itemGroup.appendChild(itemLabel);
        itemGroupAnchor.appendChild(itemGroup);

        return itemGroupAnchor;
    };

}

customElements.define('item-bar', ItemBar);