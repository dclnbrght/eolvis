import * as settings from './settings.js';
import * as dataAccessContext from './js/dataAccessContext.js';
import * as iconButton from './components/iconButton.js';
import * as filterBar from './components/filterBar.js';
import * as itemDetailsForm from './components/itemDetailsForm.js';
import * as informationDialog from './components/informationDialog.js';
import * as downloadDialog from './components/downloadDialog.js';
import * as dataSearch from './js/dataSearch.js';

const dataAccess = dataAccessContext.create(settings.dataStoreType);

const filterBarComponent = document.getElementById("filter-bar");
const itemDetailsFormComponent = document.getElementById("item-details-form");
const informationDialogComponent = document.getElementById("information-dialog");
const downloadDialogComponent = document.getElementById("download-dialog");

const minDate = new Date(new Date().getFullYear() - settings.yearsPast, 0, 1);
const maxDate = new Date(new Date().getFullYear() + settings.yearsFuture, 11, 31);

const setupUser = (callback) => {
    dataAccess.requestUserProfile(callback);
}

const userLoaded = () => {
    const userProfile = dataAccess.getUserProfileState();

    const actionNew = document.getElementById("icon-button-add-item");
    if (userProfile.permissions.includes("insert")) {
        actionNew.classList.remove("hidden");
    } else {
        actionNew.classList.add("hidden");
    }

    requestData(dataLoaded);
    itemDetailsFormComponent.setupDialog(dataLoaded);
}

const requestData = (callback) => {
    dataAccess.requestDataFromServer(callback);
}

const dataLoaded = () => {
    try {
        const data = dataAccess.getComponentState();

        filterBarComponent.setupFilters(data, false, filterSearch);

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
            minDate, 
            maxDate, 
            filterValues.selectedNames,
            filterValues.selectedPeriods,
            true,
            new Date()
        );

        // sort items by updated date descending
        const sortedItems = filteredItems.sort((a, b) =>
            new Date(a.updated) - new Date(b.updated)
        );

        renderItemTable(sortedItems);

    } catch (error) {
        const msg = `Error searching \r\n\r\n${error}`;
        console.error(msg);
        alert(msg);
    }
};

const renderItemTable = (items) => {
    const itemTable = document.getElementById("itemTable");
    const itemTableBody = itemTable.getElementsByTagName("tbody")[0];
    itemTableBody.replaceChildren();

    // populate table with items
    items.forEach(item => {

        if (item.isdeleted) {
            return;
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.version}</td>
            <td>${item.lts ? "&check;" : ""}</td>
            <td>${settings.types[item.type]}</td>
            <td>${typeof(item.license) === "undefined" || item.license == "" ? "" : "&check;"}</td>
            <td>${typeof(item.cpe) === "undefined" || item.cpe == "" ? "" : "&check;"}</td>
            <td>${item.supportedFrom}</td>
            <td>${item.supportedTo}</td>
            <td>${item.supportedToExtended}</td>
            <td>${item.link.length > 0 ? '<a href="' + item.link + '" target="_blank" style="text-decoration:none;">&#128279;</a>' : ''}</td>
            <td>${item.latestPatch}</td>
            <td>${item.latestPatchReleased}</td>
            <td>${item.useFrom}</td>
            <td>${item.useTo}</td>
            <td>${new Date(item.updated).toISOString().split('T')[0]}</td>
            <td><button type="button" class="table-button">Edit</button></td>
        `;

        const buttonEdit = row.getElementsByTagName("button")[0];
        buttonEdit.addEventListener("click", (e) => {
            itemDetailsFormComponent.showModal(item);
        });

        itemTableBody.appendChild(row);
    });
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
    setupUser(userLoaded);
};