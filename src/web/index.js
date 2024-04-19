import * as settings from './settings.js';
import * as dataAccessContext from './js/dataAccessContext.js';
import * as dataSearch from './js/dataSearch.js';
import * as iconButton from './components/iconButton.js';
import * as filterBar from './components/filterBar.js';
import * as informationDialog from './components/informationDialog.js';
import * as downloadDialog from './components/downloadDialog.js';
import * as itemDetailsForm from './components/itemDetailsForm.js';
import * as itemBoard from './components/itemBoard.js';
import * as user from './js/user.js';

const dataAccess = dataAccessContext.create(settings.dataStoreType);

const filterBarComponent = document.getElementById("filter-bar");
const informationDialogComponent = document.getElementById("information-dialog");
const downloadDialogComponent = document.getElementById("download-dialog");
const itemDetailsFormComponent = document.getElementById("item-details-form");
const itemBoardComponent = document.getElementById("item-board");

const minDate = new Date(new Date().getFullYear() - settings.yearsPast, 0, 1);
const maxDate = new Date(new Date().getFullYear() + settings.yearsFuture, 11, 31);

const setupUser = () => {
    const actionNew = document.getElementById("icon-button-add-item");

    if (user.hasPermission("edit")) {
        actionNew.classList.remove("hidden");
    } else {
        actionNew.classList.add("hidden");
    }
}

const requestData = (callback) => {
    dataAccess.requestDataFromServer(callback);
}

const dataLoaded = () => {
    try {
        const data = dataAccess.getComponentState();

        filterBarComponent.setupFilters(data, filterSearch);
        
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
        const data = dataAccess.getComponentState();

        const items = data.components;

        // filter items by name and period
        const filteredItems = dataSearch.search(
            items,
            filterValues.selectedNames,
            filterValues.selectedPeriods,
            new Date()
        );

        const today = new Date();
        itemBoardComponent.render(settings.types, filteredItems, today, minDate, maxDate);

    } catch (error) {
        const msg = `Error searching \r\n\r\n${error}`;
        console.error(msg);
        alert(msg);
    }
};

const positionTimeline = (timeline, relativeToElement) => {
    const relativeToElementBottom = relativeToElement.offsetTop + relativeToElement.offsetHeight;

    let y = window.scrollY;
    if (y > relativeToElementBottom)
        timeline.setAttribute("transform", `translate(0, ${y - relativeToElementBottom})`);
    else
        timeline.removeAttribute("transform");
}

document.getElementById("icon-button-information").addEventListener("click", (e) => {
    informationDialogComponent.showModal();
});
document.getElementById("icon-button-add-item").addEventListener("click", (e) => {
    itemDetailsFormComponent.showModalNew();
});
document.getElementById("icon-button-download").addEventListener("click", (e) => {
    downloadDialogComponent.showModal();
});


window.onload = () => {
    setupUser();
    requestData(dataLoaded);
    itemDetailsFormComponent.setupDialog(dataLoaded);
};
window.onscroll = () => {
    positionTimeline(document.getElementById("timeline"), document.getElementById("filter-bar"));
};
window.ontouchmove = () => {
    positionTimeline(document.getElementById("timeline"), document.getElementById("filter-bar"));
};