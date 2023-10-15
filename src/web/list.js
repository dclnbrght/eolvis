import * as settings from './settings.js';
import * as dataAccess from './js/dataAccess.js';
import * as filterBar from './components/filterBar.js';
import * as dataSearch from './js/dataSearch.js';

const requestData = (callback) => {
    dataAccess.requestDataFromServer(settings.dataPath, callback);
}

const dataLoaded = () => {
    try {
        const data = dataAccess.requestDataFromStore();
        filterBar.setupFilters(data, filterSearch);
        
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
        
        const filterValues = filterBar.selectedFilterValues();         
        const data = dataAccess.requestDataFromStore();

        const items = data.components;

        // filter items by name and period
        const filteredItems = dataSearch.search(
            items,
            filterValues.selectedNames,
            filterValues.selectedPeriods,
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
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.version}</td>
            <td>${item.lts}</td>
            <td>${item.type}</td>
            <td>${item.supportedFrom}</td>
            <td>${item.supportedTo}</td>
            <td>${item.supportedToExtended}</td>
            <td>${item.latestPatch}</td>
            <td>${item.latestPatchReleased}</td>
            <td>${item.useFrom}</td>
            <td>${item.useTo}</td>
            <td><a href="${item.link}">link</a></td>
            <td>${new Date(item.updated).toISOString().split('T')[0]}</td>
        `;
        itemTableBody.appendChild(row);
    });
}

window.onload = () => {
    requestData(dataLoaded);
};