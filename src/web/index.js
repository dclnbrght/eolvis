import * as settings from './settings.js';
import * as dataAccess from './components/dataAccess.js';
import * as dataUpdate from './components/dataUpdate.js';
import * as container from './components/container.js';
import * as options from './components/options.js';

const pageHeaderHeight = 32;

const minDate = new Date(new Date().getFullYear() - settings.yearsPast, 0, 1);
const maxDate = new Date(new Date().getFullYear() + settings.yearsFuture, 11, 31);

const requestData = (callback) => {
    dataAccess.requestDataFromServer(settings.dataPath, callback);
}

const renderDataFromStore = () => {
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


document.getElementById("dialog-details-save").addEventListener("click", (e) => {
    dataUpdate.save(renderDataFromStore);
});
document.getElementById("dialog-details-cancel").addEventListener("click", (e) => {
    dataUpdate.cancel();
});

document.getElementById("action-options").addEventListener("click", (e) => {
    options.optionsDialogOpen();
});
document.getElementById("dialog-options-close").addEventListener("click", (e) => {
    options.optionsDialogClose();
});
document.getElementById("dialog-options-close-x").addEventListener("click", (e) => {
    options.optionsDialogClose();
});
document.getElementById("dialog-options-export-eol").addEventListener("click", (e) => {
    options.optionsExportEol();
});
document.getElementById("dialog-options-export-bom").addEventListener("click", (e) => {
    options.optionsExportBom();
});

window.onload = () => {
    requestData(renderDataFromStore);
};
window.onscroll = () => {
    positionTimeline(document.getElementById("timeline"), pageHeaderHeight);
};
window.ontouchmove = () => {
    positionTimeline(document.getElementById("timeline"), pageHeaderHeight);
};

