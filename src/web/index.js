import * as settings from './settings.js';
import * as dataAccess from './js/dataAccess.js';
import * as filterBar from './components/filterBar.js';
import * as dataSearch from './js/dataSearch.js';
import * as dataUpdate from './js/dataUpdate.js';
import * as itemBoard from './components/itemBoard.js';
import * as options from './js/options.js';
import * as user from './js/user.js';

const pageHeaderHeight = 75;

const minDate = new Date(new Date().getFullYear() - settings.yearsPast, 0, 1);
const maxDate = new Date(new Date().getFullYear() + settings.yearsFuture, 11, 31);

const setupUser = () => {
    const actionNew = document.getElementById("action-new-item");
    const formDetailsFieldset = document.getElementById("formDetails-fieldset");
    const dialogDetailsSave = document.getElementById("dialog-details-save");
    const dialogDetailsDelete = document.getElementById("dialog-details-delete");
    const dialogDetailsMessage = document.getElementById("dialog-details-message");

    if (user.hasPermission("edit")) {
        actionNew.classList.remove("hidden");
        formDetailsFieldset.disabled = false;
        dialogDetailsSave.classList.remove("hidden");
        dialogDetailsDelete.classList.remove("hidden");
        dialogDetailsMessage.classList.remove("hidden");
    } else {
        actionNew.classList.add("hidden");
        formDetailsFieldset.disabled = true;
        dialogDetailsSave.classList.add("hidden");
        dialogDetailsDelete.classList.add("hidden");
        dialogDetailsMessage.classList.add("hidden");
    }
}

const requestData = (callback) => {
    dataAccess.requestDataFromServer(settings.dataPath, callback);
}

const dataLoaded = () => {
    try {
        const data = dataAccess.requestDataFromStore();
        filterBar.setupFilters(data, filterSearch);
        
        const projectName = data.projectName;
        document.getElementById("title").innerText = projectName;

        //document.getElementById('loading-message').style.display = 'none';

        filterSearch();
    } catch (error) {
        const msg = `Error loading data \r\n\r\n${error}`;
        console.error(msg);
        alert(msg);
    }
};

const filterSearch = () => {
    try {
        
        const filterValues = filterBar.selectedFilterValues();         
        const data = dataAccess.requestDataFromStore();

        const items = data.components;

        const filteredItems = dataSearch.search(
            items,
            filterValues.selectedNames
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

document.getElementById("dialog-details-save").addEventListener("click", (e) => {
    dataUpdate.updateItem(dataLoaded);
});
document.getElementById("dialog-details-delete").addEventListener("click", (e) => {
    dataUpdate.deleteItem(dataLoaded);
});
document.getElementById("dialog-details-cancel").addEventListener("click", (e) => {
    dataUpdate.cancelForm();
});

document.getElementById("action-new-item").addEventListener("click", (e) => {
    dataUpdate.newItem();
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

