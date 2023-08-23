import * as settings from '../settings.js';
import * as dataAccess from './dataAccess.js';

let curItem = {};

const setup = () => {
    const itemTypeSelect = document.getElementById('item-type');
    Object.entries(settings.types).forEach(([type, typeDisplay]) => {
        var option = document.createElement("option");
        option.value = type;
        option.innerHTML = typeDisplay;
        itemTypeSelect.appendChild(option);
    });
}

const open = (item) => {
    curItem = item;

    // Populate the form
    Object.keys(item).forEach(key => {
        if (typeof item[key] !== "undefined" && document.getElementsByName(key).length > 0) {
            const elem = document.getElementsByName(key)[0];

            switch (elem.type) {
                case 'text':
                case 'date':
                    elem.value = item[key];
                    break;
                case 'checkbox': 
                    elem.checked = !!item[key];
                    break;
                default:
                    elem.value = item[key];
                    break;
            }
        }
    });

    const anchorLink = document.getElementById('link-anchor');
    if (item['link'].length > 0) {
        anchorLink.classList.remove('hidden');
        anchorLink.href = item['link'];
    } else {
        anchorLink.classList.add('hidden');
    }

   
    // Event handler to update from form input
    // Only run on form with data-form-sync attribute
    document.addEventListener('input', (event) => {
        if (!event.target.closest('[data-form-sync]')) 
            return;

        switch (event.target.type) {
            case 'text':
            case 'date':
                curItem[event.target.name] = event.target.value;
                break;
            case 'checkbox': 
                curItem[event.target.name] = event.target.checked;
                break;
            default:
                curItem[event.target.name] = event.target.value;
                break;
        };
        
    });
    
    document.getElementById("dialog-details").showModal();
}

const save = (callback) => {

    const data = dataAccess.requestDataFromStore();
    const components = data.components;

    const newComponents = components.map(obj => {
        if (obj.name === curItem.name && obj.version === curItem.version) {
            return { 
                ...curItem, 
                'updated': new Date().toISOString().split('T')[0] 
            };
        }
        return obj;
    });
    const newData = {
        ...data,
        'components': newComponents,
    };

    dataAccess.saveDataToStore(newData);

    document.getElementById("dialog-details").close();
    
    callback();
}

const cancel = () => {
    document.getElementById("dialog-details").close();
}

export {
    setup,
    open,
    save,
    cancel
};
