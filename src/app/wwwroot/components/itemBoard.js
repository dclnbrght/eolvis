import * as settings from '../settings.js';
import * as dateUtils from '../js/dateUtils.js';
import * as svgUtils from '../js/svgUtils.js';
import { ItemTimeline } from './itemTimeline.js';
import { ItemBar } from './itemBar.js';

const template = document.createElement('template');
template.innerHTML = `
    <svg id="eolvisSvg" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="item-supported-fadeRight">
                <stop class="item-supported-stopColour" offset="0%" stop-opacity="0.5" />
                <stop class="item-supported-stopColour" offset="80%" stop-opacity="0.2" />
                <stop class="item-supported-stopColour" offset="100%" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="item-supported-border-fadeRight">
                <stop class="item-supported-border-stopColour" offset="0%" stop-opacity="1.0" />
                <stop class="item-supported-border-stopColour" offset="80%" stop-opacity="0.5" />
                <stop class="item-supported-border-stopColour" offset="100%" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="item-inuse-fadeRight">
                <stop class="item-inuse-stopColour" offset="0%" stop-opacity="1.0" />
                <stop class="item-inuse-stopColour" offset="80%" stop-opacity="0.5" />
                <stop class="item-inuse-stopColour" offset="100%" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="item-inuse-future-fadeRight">
                <stop class="item-inuse-future-stopColour" offset="0%" stop-opacity="1.0" />
                <stop class="item-inuse-future-stopColour" offset="80%" stop-opacity="0.5" />
                <stop class="item-inuse-future-stopColour" offset="100%" stop-opacity="0" />
            </linearGradient>
        </defs>
        <g id="itemContainer"></g>
    </svg>
`;

class ItemBoard extends HTMLElement {

    #timelineHeight = 52;
    #groupHeaderPaddingTop = 22;
    #groupHeaderPaddingBottom = 14;
    #groupPaddingBottom = 6;
    #itemHeight = 36;
    #itemTimeline = new ItemTimeline();

    constructor() {
        super();
    }

    connectedCallback() {
        this.appendChild(template.content.cloneNode(true));
    };

    #renderTimelineMonthLines = (itemContainer, minDate, maxDate) => {
        const timelineMonths = this.#itemTimeline.renderMonths(minDate, maxDate, false, 0);
        itemContainer.appendChild(timelineMonths);
    };

    #renderTimeline = (itemContainer, minDate, maxDate) => {
        let timelineGroup = this.#itemTimeline.render(minDate, maxDate);
        itemContainer.appendChild(timelineGroup);
    };

    #itemSortComparator = (a, b) => {
        // sort by name then version
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
            || a.version.localeCompare(b.version, undefined, { 'numeric': true });
    };

    #renderItems = (container, types, items, refDate, minDate, maxDate, displayInUseBar) => {

        let containerY = this.#timelineHeight;
        Object.entries(types).forEach(([type, typeDisplay]) => {

            const itemGroupItems = items.filter((item) => {
                return item.type == type && !item.isdeleted;
            }).sort(this.#itemSortComparator);

            if (itemGroupItems.length > 0) {
                let itemGroup = svgUtils.createSvgElement("g");
                itemGroup.id = `type-${type.replace(" ", "-").toLowerCase()}`;

                // group divider line
                let itemGroupDivider = svgUtils.createSvgElement("line");
                itemGroupDivider.classList.add("item-group-divider");
                itemGroupDivider.setAttribute("x1", 0);
                itemGroupDivider.setAttribute("y1", containerY);
                itemGroupDivider.setAttribute("x2", "100%");
                itemGroupDivider.setAttribute("y2", containerY);
                itemGroup.appendChild(itemGroupDivider);

                containerY += this.#groupHeaderPaddingTop;

                // group label
                let itemGroupLabel = svgUtils.createSvgElement("text");
                itemGroupLabel.classList.add("item-group-label");
                itemGroupLabel.textContent = `${typeDisplay}`;
                itemGroupLabel.setAttribute("x", 6);
                itemGroupLabel.setAttribute("y", containerY);
                itemGroup.appendChild(itemGroupLabel);

                containerY += this.#groupHeaderPaddingBottom;

                // group items
                itemGroupItems.map((itemData) => {
                    const itemRendered = new ItemBar().render(itemData, containerY, refDate, minDate, maxDate, displayInUseBar);
                    itemGroup.appendChild(itemRendered);
                    containerY += this.#itemHeight;
                });

                containerY += this.#groupPaddingBottom;

                container.appendChild(itemGroup);
            }
        });

        return containerY;
    };

    #setSvgSize = (svg, containerY, minDate, maxDate) => {
        const monthWidth = settings.yearWidth / 12;
        const monthsCount = dateUtils.numberOfMonths(minDate, maxDate);
        const containerWidth = monthWidth * monthsCount;

        svg.setAttribute("width", containerWidth);
        svg.setAttribute("height", containerY);
    };

    render = (types, items, refDate, minDate, maxDate, displayInUseBar) => {

        const itemContainer = document.getElementById("itemContainer");
        itemContainer.replaceChildren(); // empty container before re-rendering

        this.#renderTimelineMonthLines(itemContainer, minDate, maxDate);

        const containerY = this.#renderItems(itemContainer, types, items, refDate, minDate, maxDate, displayInUseBar);

        this.#renderTimeline(itemContainer, minDate, maxDate);

        const itemSvg = document.getElementById("eolvisSvg");
        this.#setSvgSize(itemSvg, containerY, minDate, maxDate);
    }

};

customElements.define('item-board', ItemBoard);