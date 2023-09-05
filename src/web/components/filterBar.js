import * as settings from '../settings.js';

const filterBarStoreKey = "eolvisSelectedFilters";

// Manage  multiple select events firings at once
// i.e. when all or a group of options are selected
const changeEventFunc = (e, filterSearch) => {
    const v = document.getElementById("filter-bar");
    if (v.classList.contains("updating")) {
        e.preventDefault();
        e.stopPropagation();
    } else {
        v.classList.add("updating");
        setTimeout(() => {
            v.classList.remove("updating");
            filterSearch();
        }, 4);
    }
}

const setSelectBoxValues = (id, values) => {
    let options = document.querySelectorAll("#" + id + " option");
    if (options?.length > 0 && values) {
        options.forEach((x) => {
            if (values[0] == "None") {
                x.selected = false;
            } else if (values.includes(x.value) || values[0] == "All") {
                x.selected = true;
            }
        });
    } else {
        console.error(`Error in setSelectBoxValues, id: ${id}, values: ${values}`);
    }
}

const getSelectBoxValues = (id) => {
    let result = [];
    let options = document.querySelectorAll("#" + id + " option");
    options.forEach((x) => {
        if (x.selected) {
            result.push(x.value);
        }
    });
    return result;
}

const typeNameFilterArray = (data) => {
    const componentNamesByType = {};

    data.components.forEach((component) => {
        if (!component.isdeleted) {
            const { type, name } = component;
            if (!componentNamesByType[type]) {
                componentNamesByType[type] = new Set();
            }
            componentNamesByType[type].add(name);
        }
    });

    const sortedTypes = Object.keys(componentNamesByType).sort();

    const filterArray = sortedTypes.map((type) => ({
        type,
        names: [...componentNamesByType[type]].sort(),
    }));

    return filterArray;
};

const setupTypeNameFilter = (data, querystringParameters, previousSelectedFilterValues, filterSearch) => {
    const selectElement = document.getElementById('typeNameFilter');
    selectElement.replaceChildren();

    const filterArray = typeNameFilterArray(data);

    filterArray.forEach((group) => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = settings.types[group.type];

        group.names.forEach((name) => {
            const option = document.createElement('option');
            option.textContent = name;
            optgroup.appendChild(option);
        });

        selectElement.appendChild(optgroup);
    });

    setSelectBoxValues("typeNameFilter",
        querystringParameters.get('names')?.split(',')
        ?? previousSelectedFilterValues.selectedNames
        ?? ["All"]
    );

    tail.select("#typeNameFilter", {
        placeholder: 'Type / Name Filter',
        multiSelectAll: true,
        search: true,
        searchFocus: false
    }).reload();

    selectElement.addEventListener("change", (e) => {
        changeEventFunc(e, filterSearch);
    });
};


const setupFilters = (data, filterSearch) => {
    // Set value from: query string || previously selected values in localStorage
    const querystringParameters = new URLSearchParams(window.location.search);
    let previousSelectedFilterValues = [];
    if (localStorage.getItem(filterBarStoreKey))
        previousSelectedFilterValues = JSON.parse(localStorage.getItem(filterBarStoreKey));

    setupTypeNameFilter(data, querystringParameters, previousSelectedFilterValues, filterSearch);
};

const selectedFilterValues = () => {
    const selectedNames = getSelectBoxValues("typeNameFilter");

    const filterValues = { selectedNames }

    localStorage.setItem(filterBarStoreKey, JSON.stringify(filterValues));

    return filterValues;
};


export {
    setupFilters,
    selectedFilterValues,
}