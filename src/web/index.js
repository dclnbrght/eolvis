import * as settings from './settings.js';
import * as dataAccess from './js/dataAccess.js';
import * as dataSearch from './js/dataSearch.js';
import * as filterBar from './components/filterBar.js';
import * as itemDetailsForm from './components/itemDetailsForm.js';
import * as itemBoard from './components/itemBoard.js';
import * as options from './js/options.js';
import * as user from './js/user.js';

const filterBarComponent = document.getElementById("filter-bar");
const itemDetailsFormComponent = document.getElementById("item-details-form");

const pageHeaderHeight = 75;

const minDate = new Date(new Date().getFullYear() - settings.yearsPast, 0, 1);
const maxDate = new Date(new Date().getFullYear() + settings.yearsFuture, 11, 31);

const setupUser = () => {
    const actionNew = document.getElementById("action-new-item");

    if (user.hasPermission("edit")) {
        actionNew.classList.remove("hidden");
    } else {
        actionNew.classList.add("hidden");
    }
}

const requestData = (callback) => {
    dataAccess.requestDataFromServer(settings.dataPath, callback);
}

const dataLoaded = () => {
    try {
        const data = dataAccess.requestDataFromStore();

        filterBarComponent.setupFilters(data, filterSearch);
        itemDetailsFormComponent.setupDialog(filterSearch);
        
        const projectName = data.projectName;
        document.getElementById("title").innerText = projectName;

        filterSearch();
    } catch (error) {
        const msg = `Error loading data \r\n\r\n${error}`;
        console.error(msg);
        alert(msg);
    }
};

const filterSearch = () => {
    try {
        const filterValues = filterBarComponent.selectedFilterValues();         
        const data = dataAccess.requestDataFromStore();

        const items = data.components;

        // filter items by name and period
        const filteredItems = dataSearch.search(
            items,
            filterValues.selectedNames,
            filterValues.selectedPeriods,
            new Date()
        );

        const today = new Date();
        itemBoard.render(settings.types, filteredItems, today, minDate, maxDate);

    } catch (error) {
        const msg = `Error searching \r\n\r\n${error}`;
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

document.getElementById("action-new-item").addEventListener("click", (e) => {
    itemDetailsFormComponent.showModalNew();
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
    setupUser();
    requestData(dataLoaded);
};
window.onscroll = () => {
    positionTimeline(document.getElementById("timeline"), pageHeaderHeight);
};
window.ontouchmove = () => {
    positionTimeline(document.getElementById("timeline"), pageHeaderHeight);
};

