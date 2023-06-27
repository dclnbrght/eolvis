import * as settings from '../settings.js';
import * as dateUtils from './dateUtils.js';
import * as svgUtils from './svgUtils.js';
import * as timeline from './timeline.js';
import * as item from './item.js';

const timelineHeight = 52;
const categoryHeaderPaddingTop = 22;
const categoryHeaderPaddingBottom = 14;
const categoryPaddingBottom = 6;
const itemHeight = 36;

const renderTimelineMonthLines = (itemContainer, minDate, maxDate) => {
    const timelineMonths = timeline.renderMonths(minDate, maxDate, false, 0);
    itemContainer.appendChild(timelineMonths);
};

const renderTimeline = (itemContainer, minDate, maxDate) => {
    let timelineGroup = timeline.render(minDate, maxDate);
    itemContainer.appendChild(timelineGroup);
};

const renderItems = (container, categories, items, minDate, maxDate) => {

    let containerY = timelineHeight;
    categories.forEach((category) => {

        const categoryItems = items.filter((item) => {
            return item.category == category;
        });

        if (categoryItems.length > 0) {
            let categoryGroup = svgUtils.renderSvgElement("g");
            categoryGroup.id = `category-${category.replace(" ", "-").toLowerCase()}`;

            // category divider line
            let categoryDivider = svgUtils.renderSvgElement("line");
            categoryDivider.classList.add("category-divider");
            categoryDivider.setAttribute("x1", 0);
            categoryDivider.setAttribute("y1", containerY);
            categoryDivider.setAttribute("x2", "100%");
            categoryDivider.setAttribute("y2", containerY);
            categoryGroup.appendChild(categoryDivider);

            containerY += categoryHeaderPaddingTop;

            // category label
            let categoryLabel = svgUtils.renderSvgElement("text");
            categoryLabel.classList.add("category-label");
            categoryLabel.textContent = `${category}`;
            categoryLabel.setAttribute("x", 6);
            categoryLabel.setAttribute("y", containerY);
            categoryGroup.appendChild(categoryLabel);

            containerY += categoryHeaderPaddingBottom;

            // category items
            categoryItems.map((itemData) => {
                const itemRendered = item.render(itemData, containerY, minDate, maxDate);
                categoryGroup.appendChild(itemRendered);
                containerY += itemHeight;
            });

            containerY += categoryPaddingBottom;

            container.appendChild(categoryGroup);
        }
    });

    return containerY;
};

const setContainerSize = (container, containerY, minDate, maxDate) => {
    const monthWidth = settings.yearWidth / 12;
    const monthsCount = dateUtils.numberOfMonths(minDate, maxDate);
    const containerWidth = monthWidth * monthsCount;

    container.setAttribute("width", containerWidth);
    container.setAttribute("height", containerY);

    // Set width for Chrome on Android
    const header = document.getElementById("header");
    header.style.width = containerWidth + 'px';
};

const render = (categories, items, minDate, maxDate) => {
    const itemContainer = document.getElementById("itemContainer");

    renderTimelineMonthLines(itemContainer, minDate, maxDate);

    const containerY = renderItems(itemContainer, categories, items, minDate, maxDate);

    renderTimeline(itemContainer, minDate, maxDate);

    setContainerSize(itemContainer, containerY, minDate, maxDate);
}

export { render };