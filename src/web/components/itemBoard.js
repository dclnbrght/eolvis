import * as settings from '../settings.js';
import * as dateUtils from './dateUtils.js';
import * as svgUtils from './svgUtils.js';
import * as itemTimeline from './itemTimeline.js';
import * as itemBar from './itemBar.js';

const timelineHeight = 52;
const groupHeaderPaddingTop = 22;
const groupHeaderPaddingBottom = 14;
const groupPaddingBottom = 6;
const itemHeight = 36;

const renderTimelineMonthLines = (itemContainer, minDate, maxDate) => {
    const timelineMonths = itemTimeline.renderMonths(minDate, maxDate, false, 0);
    itemContainer.appendChild(timelineMonths);
};

const renderTimeline = (itemContainer, minDate, maxDate) => {
    let timelineGroup = itemTimeline.render(minDate, maxDate);
    itemContainer.appendChild(timelineGroup);
};

const itemSortComparator = (a, b) => {
    // sort by name then version
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) 
        || a.version.localeCompare(b.version, undefined, { 'numeric': true });
};

const renderItems = (container, types, items, refDate, minDate, maxDate) => {

    let containerY = timelineHeight;
    Object.entries(types).forEach(([type, typeDisplay]) => {

        const itemGroupItems = items.filter((item) => {
            return item.type == type && !item.isdeleted;
        }).sort(itemSortComparator);

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

            containerY += groupHeaderPaddingTop;

            // group label
            let itemGroupLabel = svgUtils.createSvgElement("text");
            itemGroupLabel.classList.add("item-group-label");
            itemGroupLabel.textContent = `${typeDisplay}`;
            itemGroupLabel.setAttribute("x", 6);
            itemGroupLabel.setAttribute("y", containerY);
            itemGroup.appendChild(itemGroupLabel);

            containerY += groupHeaderPaddingBottom;

            // group items
            itemGroupItems.map((itemData) => {
                const itemRendered = itemBar.render(itemData, containerY, refDate, minDate, maxDate);
                itemGroup.appendChild(itemRendered);
                containerY += itemHeight;
            });

            containerY += groupPaddingBottom;

            container.appendChild(itemGroup);
        }
    });

    return containerY;
};

const setSvgSize = (svg, containerY, minDate, maxDate) => {
    const monthWidth = settings.yearWidth / 12;
    const monthsCount = dateUtils.numberOfMonths(minDate, maxDate);
    const containerWidth = monthWidth * monthsCount;

    svg.setAttribute("width", containerWidth);
    svg.setAttribute("height", containerY);
};

const render = (types, items, refDate, minDate, maxDate) => {
    
    const itemContainer = document.getElementById("itemContainer");
    itemContainer.replaceChildren(); // empty container before re-rendering

    renderTimelineMonthLines(itemContainer, minDate, maxDate);

    const containerY = renderItems(itemContainer, types, items, refDate, minDate, maxDate);

    renderTimeline(itemContainer, minDate, maxDate);

    const itemSvg = document.getElementById("eolvisSvg");
    setSvgSize(itemSvg, containerY, minDate, maxDate);
}

export { render };