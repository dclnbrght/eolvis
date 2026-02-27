import * as settings from './settings.js';
import * as dataAccessContext from './js/dataAccessContext.js';
import * as iconButton from './components/iconButton.js';
import * as filterBar from './components/filterBar.js';
import * as itemDetailsForm from './components/itemDetailsForm.js';
import * as informationDialog from './components/informationDialog.js';
import * as downloadDialog from './components/downloadDialog.js';
import * as dataSearch from './js/dataSearch.js';
import { showToast } from './components/toastNotification.js';

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
        const msg = `Error loading data: ${error}`;
        console.error(msg);
        showToast(msg, 'error');
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
        const msg = `Error searching: ${error}`;
        console.error(msg);
        showToast(msg, 'error');
    }
};

const escapeHtml = (text) => {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
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

        const createTextCell = (text) => {
            const td = document.createElement("td");
            td.textContent = text ?? '';
            return td;
        };

        const createCheckCell = (condition) => {
            const td = document.createElement("td");
            if (condition) td.innerHTML = "&check;";
            return td;
        };

        const createDateCell = (dateValue) => {
            const td = document.createElement("td");
            td.textContent = dateValue === null ? "" : dateValue;
            return td;
        };

        row.appendChild(createTextCell(item.name));
        row.appendChild(createTextCell(item.version));
        row.appendChild(createCheckCell(item.lts));
        row.appendChild(createTextCell(settings.types[item.type]));
        row.appendChild(createCheckCell(typeof(item.license) !== "undefined" && item.license !== ""));
        row.appendChild(createCheckCell(typeof(item.cpe) !== "undefined" && item.cpe !== ""));
        row.appendChild(createDateCell(item.supportedFrom));
        row.appendChild(createDateCell(item.supportedTo));
        row.appendChild(createDateCell(item.supportedToExtended));

        // Link cell — validate URL scheme
        const linkTd = document.createElement("td");
        if (item.link && item.link.length > 0) {
            try {
                const url = new URL(item.link);
                if (url.protocol === "http:" || url.protocol === "https:") {
                    const anchor = document.createElement("a");
                    anchor.href = url.href;
                    anchor.target = "_blank";
                    anchor.style.textDecoration = "none";
                    anchor.innerHTML = "&#128279;";
                    linkTd.appendChild(anchor);
                }
            } catch (e) {
                // invalid URL — render nothing
            }
        }
        row.appendChild(linkTd);

        row.appendChild(createTextCell(item.latestPatch));
        row.appendChild(createDateCell(item.latestPatchReleased));
        row.appendChild(createDateCell(item.useFrom));
        row.appendChild(createDateCell(item.useTo));
        row.appendChild(createTextCell(new Date(item.updated).toISOString().split('T')[0]));

        const editTd = document.createElement("td");
        const buttonEdit = document.createElement("button");
        buttonEdit.type = "button";
        buttonEdit.className = "table-button";
        buttonEdit.textContent = "Edit";
        buttonEdit.addEventListener("click", (e) => {
            itemDetailsFormComponent.showModal(item);
        });
        editTd.appendChild(buttonEdit);
        row.appendChild(editTd);

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

window.onload = async () => {
    setupUser(async () => {
        // Replay any pending mutation that was interrupted by session expiry
        await dataAccess.replayPendingMutation(dataLoaded);
        userLoaded();
    });
};