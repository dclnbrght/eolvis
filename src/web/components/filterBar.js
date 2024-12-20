import * as settings from '../settings.js';
import { ToggleSwitch } from './toggleSwitch.js';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        .filter-bar {
            background-color: #777;
            padding: 0.3em;
        }
        .filter-container {
            display: inline-block;
            vertical-align: top;
        }
    </style>
    <section class="filter-bar">
        <div id="typeNameFilter-container" class="filter-container">
            <select id="typeNameFilter" multiple></select>
        </div>
        <div id="periodFilter-container" class="filter-container">
            <select id="periodFilter" multiple></select>
        </div>
        <div id="inUseDisplayToggle-container" class="filter-container">
            <toggle-switch id="displayInUseToggle" checked left-value="Display In Use:" class="hidden"></toggle-switch>
        </div>
    </section>
`;

const filterBarStoreKey = "eolvisSelectedFilters";

/*
NOTE: not using the shadow DOM here as tail.select does not work correctly with it,
      the dropdown closes immediately after selecting an option
*/
export class FilterBar extends HTMLElement {

    #initialSetupComplete = false;
    #typeNameFilter = null;
    #periodFilter = null;
    #displayInUseToggle = null;
    #isUpdating = false;
    #querystringParameters = null;

    constructor() {
        super();
    }

    connectedCallback() {
        this.appendChild(template.content.cloneNode(true));

        // Add stylesheets and js libs to the dom
        const tailStyles = document.createElement("link");
        tailStyles.setAttribute("rel", "stylesheet");
        tailStyles.setAttribute("href", "./css/tail.select-light.css");
        this.appendChild(tailStyles);

        const tailLib = document.createElement('script');
        tailLib.type = 'text/javascript';
        tailLib.async = true;
        tailLib.setAttribute("src", "./libs/tail.select.min.js");
        this.appendChild(tailLib);

        this.#typeNameFilter = this.querySelector('#typeNameFilter');
        this.#periodFilter = this.querySelector('#periodFilter');
        this.#displayInUseToggle = this.querySelector('#displayInUseToggle');

        this.#querystringParameters = new URLSearchParams(window.location.search);
    }

    // Manage  multiple select events firings at once
    // i.e. when all or a group of options are selected
    #changeEventFunc = (e, searchCallback) => {
        if (this.#isUpdating) {
            e.preventDefault();
            e.stopPropagation();
        } else {
            this.#isUpdating = true;
            setTimeout(() => {
                this.#isUpdating = false;
                this.#processFilterChange();
                searchCallback();
            }, 4);
        }
    }

    #setupEventHandlers = (searchCallback) => {
        if (this.#initialSetupComplete) {
            return;
        }

        this.#typeNameFilter.addEventListener("change", (e) => {
            this.#changeEventFunc(e, searchCallback);
        });

        this.#periodFilter.addEventListener("change", (e) => {
            this.#changeEventFunc(e, searchCallback);
        });

        this.#displayInUseToggle.addEventListener("toggle", (e) => {
            this.#changeEventFunc(e, searchCallback);
        });

        this.#initialSetupComplete = true
    };

    #processFilterChange = () => {
        // Clear the querystring parameters when a filter is changed
        if (this.#querystringParameters?.size > 0) {
            window.history.pushState({}, document.title, window.location.pathname);
            this.#querystringParameters = null;
        }

        const selectedNames = this.#getSelectBoxValues(this.#typeNameFilter);
        const selectedPeriods = this.#getSelectBoxValues(this.#periodFilter);
        const displayInUseBar = this.#displayInUseToggle.checked;

        const filterValues = { selectedNames, selectedPeriods, displayInUseBar };
        
        localStorage.setItem(filterBarStoreKey, JSON.stringify(filterValues));
    }

    #setSelectBoxValues = (selectElement, values) => {
        let options = [...selectElement.options];
        if (options?.length > 0 && values) {
            options.forEach((x) => {
                if (values[0] == "None") {
                    x.selected = false;
                } else if (values.includes(x.value) || values[0] == "All") {
                    x.selected = true;
                }
            });
        } else {
            console.error(`Error in setSelectBoxValues, id: ${selectElement.id}, values: ${values}`);
        }
    }

    #getSelectBoxValues = (selectElement) => {
        let optionsSelected = [];
        let options = [...selectElement.options];
        options.forEach((o) => {
            if (o.selected) {
                optionsSelected.push(o.value);
            }
        });

        if (optionsSelected.length == options.length) {
            optionsSelected = ["All"];
        }

        return optionsSelected;
    }

    #setupTypeNameFilter = (data, selectElement, filterValues) => {
        selectElement.replaceChildren();

        const filterArray = this.typeNameFilterArray(data);

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

        this.#setSelectBoxValues(this.#typeNameFilter, filterValues);

        tail.select(selectElement, {
            placeholder: 'Type / Name Filter',
            multiSelectAll: true,
            search: true,
            searchFocus: false
        }).reload();
    };

    #setupPeriodFilter = (selectElement, filterValues) => {
        selectElement.replaceChildren();

        Object.entries(settings.periods).forEach(([key, value]) => {
            const option = document.createElement('option');
            option.textContent = value;
            option.value = key;
            selectElement.appendChild(option);
        });

        this.#setSelectBoxValues(this.#periodFilter, filterValues);

        tail.select(selectElement, {
            placeholder: 'Period Filter',
            multiSelectAll: true,
            search: true,
            searchFocus: false
        }).reload();
    }

    typeNameFilterArray = (data) => {
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

    setupFilters = (data, inUseToggleEnabled, searchCallback) => {
        if (inUseToggleEnabled)
            this.#displayInUseToggle.classList.remove("hidden");

        const filterValues = this.selectedFilterValues();
        this.#setupTypeNameFilter(data, this.#typeNameFilter, filterValues.selectedNames);
        this.#setupPeriodFilter(this.#periodFilter, filterValues.selectedPeriods);
        this.#displayInUseToggle.checked = filterValues.displayInUseBar;
        this.#setupEventHandlers(searchCallback);
    };

    selectedFilterValues = () => {
        // Set values from: query string || previously selected values in localStorage || All
        if (this.#querystringParameters !== null && this.#querystringParameters?.size > 0) {
            const querystringNames = this.#querystringParameters.get('names') ? this.#querystringParameters.get('names').split(',') : ["All"];
            const querystringPeriods = this.#querystringParameters.get('periods') ? this.#querystringParameters.get('periods').split(',') : ["All"];
            return { selectedNames: querystringNames, selectedPeriods: querystringPeriods };
        }
        else if (localStorage.getItem(filterBarStoreKey) !== null) {
            return JSON.parse(localStorage.getItem(filterBarStoreKey));
        }
        else {
            return { selectedNames: ["All"], selectedPeriods: ["All"], displayInUseBar: true };
        }        
    };
}
customElements.define('filter-bar', FilterBar);


// ------------------------------------------------------------------------------------------------
// Module Helper functions
// ------------------------------------------------------------------------------------------------

// when a new item is added, add it to the selected filter values
const addToSelectedFilterValues = (filterName, value) => {
    if (localStorage.getItem(filterBarStoreKey)) {
        let previousSelectedFilterValues = JSON.parse(localStorage.getItem(filterBarStoreKey));
        if (!previousSelectedFilterValues[filterName].includes(value)) {
            previousSelectedFilterValues[filterName].push(value);
            localStorage.setItem(filterBarStoreKey, JSON.stringify(previousSelectedFilterValues));
        }
    }
};

export {
    addToSelectedFilterValues
}