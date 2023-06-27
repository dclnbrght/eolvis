import * as settings from './settings.js';
import * as dataAccess from './components/dataAccess.js';
import * as container from './components/container.js';

const pageHeaderHeight = 32;

const minDate = new Date(new Date().getFullYear() - settings.yearsPast, 0, 1);
const maxDate = new Date(new Date().getFullYear() + settings.yearsFuture, 11, 31);

const requestData = (callback) => {
    dataAccess.requestDataFromServer(settings.dataPath, callback);
}

const dataLoaded = () => {
    try {
        const data = dataAccess.requestDataFromStore();

        const projectName = data.projectName;
        document.getElementById("title").innerText = projectName;

        const items = data.components;
        container.render(settings.categories, items, minDate, maxDate);

    } catch (error) {
        const msg = `Error rendering data \r\n\r\n${error}`;
        console.error(msg);
        alert(msg);
    }
};

const positionTimeline = (timeline, pageHeaderHeight) => {
    let y = window.scrollY;
    if (y > pageHeaderHeight)
        timeline.setAttribute("transform", `translate(0, ${y - pageHeaderHeight})`);
    else
        timeline.removeAttribute("transform");
}

window.onload = () => {
    requestData(dataLoaded);
};
window.onscroll = () => {
    positionTimeline(document.getElementById("timeline"), pageHeaderHeight);
};
window.ontouchmove = () => {
    positionTimeline(document.getElementById("timeline"), pageHeaderHeight);
};

