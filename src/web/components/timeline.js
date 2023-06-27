import * as settings from '../settings.js';
import * as dateUtils from './dateUtils.js';
import * as svgUtils from './svgUtils.js';

const monthWidth = settings.yearWidth / 12;
const today = new Date();

const renderYears = (minDate, maxDate) => {
    let yearsGroup = svgUtils.renderSvgElement("g");
    yearsGroup.Id = "timeline-years";

    const fromYear = new Date(minDate).getFullYear();
    const toYear = new Date(maxDate).getFullYear();

    let yearIndex = 0;
    for (let year = fromYear; year <= toYear; year++) {
        // year rect
        let yearRect = svgUtils.renderSvgElement("rect");
        yearRect.classList.add("timeline-year");
        yearRect.id = `year-${year}`;
        yearRect.setAttribute("x", settings.yearWidth * yearIndex);
        yearRect.setAttribute("y", 0);
        yearRect.setAttribute("width", settings.yearWidth);
        yearRect.setAttribute("height", 20);
        yearsGroup.appendChild(yearRect);

        // year label
        let yearLabel = svgUtils.renderSvgElement("text");
        yearLabel.classList.add("year-label");
        yearLabel.setAttribute("text-anchor", "middle");
        yearLabel.setAttribute("x", (settings.yearWidth * yearIndex) + (settings.yearWidth / 2));
        yearLabel.setAttribute("y", 14);
        yearLabel.textContent = `${year}`;
        yearsGroup.appendChild(yearLabel);

        yearIndex++;
    }

    return yearsGroup;
};

const renderMonths = (minDate, maxDate, renderLabels, Y) => {
    let monthsGroup = svgUtils.renderSvgElement("g");
    monthsGroup.id = "timeline-months";

    const monthsCount = dateUtils.numberOfMonths(minDate, maxDate);
    let altQuarterIndices = [0, 1, 2, 6, 7, 8];
    let activeMonth = new Date(minDate);

    let monthIndex = 0;
    for (let m = 0; m <= monthsCount; m++) {
        // month rect
        let monthRect = svgUtils.renderSvgElement("rect");
        monthRect.classList.add("timeline-month");
        if (altQuarterIndices.includes(monthIndex)) {
            monthRect.classList.add("timeline-month-alt");
        }
        if (activeMonth.getFullYear() == today.getFullYear() && activeMonth.getMonth() == today.getMonth()) {
            monthRect.classList.add("timeline-month-cur");
        }
        monthRect.id = `month-${settings.monthLabels[activeMonth.getMonth()]}-${activeMonth.getFullYear()}`;
        monthRect.setAttribute("x", monthWidth * m);
        monthRect.setAttribute("y", Y);
        monthRect.setAttribute("width", monthWidth);
        if (renderLabels) {
            monthRect.setAttribute("height", 32);
        }
        else {
            monthRect.setAttribute("height", "100%");
        }
        monthsGroup.appendChild(monthRect);

        if (renderLabels) {
            // month label
            let monthLabel = svgUtils.renderSvgElement("text");
            monthLabel.classList.add("month-label");
            if (activeMonth.getFullYear() == today.getFullYear() && activeMonth.getMonth() == today.getMonth()) {
                monthLabel.classList.add("month-label-cur");
            }
            monthLabel.setAttribute("text-anchor", "end");
            monthLabel.setAttribute("x", (monthWidth / 2) + (monthWidth * m));
            monthLabel.setAttribute("y", 22);
            monthLabel.setAttribute("transform", `rotate(-90, ${(monthWidth / 2) + (monthWidth * m) + 3}, 22)`);
            monthLabel.textContent = `${settings.monthLabels[monthIndex]}`;
            monthsGroup.appendChild(monthLabel);
        }

        activeMonth = dateUtils.addMonths(activeMonth, 1);
        monthIndex++;
        if (monthIndex == 12) monthIndex = 0;
    }

    return monthsGroup;
};

const render = (minDate, maxDate) => {
    let timelineGroup = svgUtils.renderSvgElement("g");
    timelineGroup.id = "timeline";

    timelineGroup.append(renderYears(minDate, maxDate));
    timelineGroup.append(renderMonths(minDate, maxDate, true, 20));

    return timelineGroup;
};

export {
    renderYears,
    renderMonths,
    render
};