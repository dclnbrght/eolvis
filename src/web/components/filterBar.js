import * as settings from '../settings.js';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        .filter-bar {
            background-color: #777;
            padding: 0.3em;
        }
        .filter-container {
            display: inline-block;
        }
    </style>
    <section id="filter-bar" class="filter-bar">
        <div id="typeNameFilter-container" class="filter-container">
            <select id="typeNameFilter" multiple></select>
        </div>
        <div id="periodFilter-container" class="filter-container">
            <select id="periodFilter" multiple></select>
        </div>
    </section>
`;

const filterBarStoreKey = "eolvisSelectedFilters";

class FilterBar extends HTMLElement {

    #initialSetupComplete = false;
    #typeNameFilter = null;
    #periodFilter = null;
    #querystringParameters = "";
    #previousSelectedFilterValues = [];

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));

        // Add stylesheets and js libs to the shadow dom
        const tailStyles = document.createElement("link");
        tailStyles.setAttribute("rel", "stylesheet");
        tailStyles.setAttribute("href", "./css/tail.select-light.css");
        shadow.appendChild(tailStyles);

        const tailLib = document.createElement('script');
        tailLib.type = 'text/javascript';
        tailLib.async = true;
        tailLib.setAttribute("src", "./libs/tail.select-full.min.js");
        shadow.appendChild(tailLib);
    }

    connectedCallback() {
        this.#typeNameFilter = this.shadowRoot.querySelector('#typeNameFilter');
        this.#periodFilter = this.shadowRoot.querySelector('#periodFilter');

        this.#querystringParameters = new URLSearchParams(window.location.search);
        if (localStorage.getItem(filterBarStoreKey)) {
            this.#previousSelectedFilterValues = JSON.parse(localStorage.getItem(filterBarStoreKey));
        }
    }

    // Manage  multiple select events firings at once
    // i.e. when all or a group of options are selected
    #changeEventFunc = (e, searchCallback) => {
        if (this.classList.contains("updating")) {
            e.preventDefault();
            e.stopPropagation();            
        } else {
            this.classList.add("updating");
            setTimeout(() => {
                this.classList.remove("updating");
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

        this.#initialSetupComplete = true
    };

    #processFilterChange = () => {
        const selectedNames = this.#getSelectBoxValues(this.#typeNameFilter);
        const selectedPeriods = this.#getSelectBoxValues(this.#periodFilter);
        const filterValues = { selectedNames, selectedPeriods };
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
        let result = [];
        let options = [...selectElement.options];
        options.forEach((x) => {
            if (x.selected) {
                result.push(x.value);
            }
        });
        return result;
    }

    #setupTypeNameFilter = (data, selectElement, querystringParameters, previousSelectedFilterValues) => {
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

        this.#setSelectBoxValues(this.#typeNameFilter,
            querystringParameters.get('names')?.split(',')
            ?? previousSelectedFilterValues.selectedNames
            ?? ["All"]
        );

        tail.select(selectElement, {
            placeholder: 'Type / Name Filter',
            multiSelectAll: true,
            search: true,
            searchFocus: false
        }).reload();
    };

    #setupPeriodFilter = (selectElement, querystringParameters, previousSelectedFilterValues) => {
        selectElement.replaceChildren();

        Object.entries(settings.periods).forEach(([key, value]) => {
            const option = document.createElement('option');
            option.textContent = value;
            option.value = key;
            selectElement.appendChild(option);
        });

        this.#setSelectBoxValues(this.#periodFilter,
            querystringParameters.get('periods')?.split(',')
            ?? previousSelectedFilterValues.selectedPeriods
            ?? ["All"]
        );

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

    setupFilters = (data, searchCallback) => {
        // Set value from: query string || previously selected values in localStorage
        this.#setupTypeNameFilter(data, this.#typeNameFilter, this.#querystringParameters, this.#previousSelectedFilterValues);
        this.#setupPeriodFilter(this.#periodFilter, this.#querystringParameters, this.#previousSelectedFilterValues);
        this.#setupEventHandlers(searchCallback);
    };

    selectedFilterValues = () => {
        let filterValues = JSON.parse(localStorage.getItem(filterBarStoreKey));
        this.#previousSelectedFilterValues = filterValues;
        return filterValues;
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