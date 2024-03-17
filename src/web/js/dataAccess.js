
const dataStoreKey = "eolvisDataStore";

const requestDataFromServer = (filePath, callback) => {
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(data => {
            saveDataToStore(data);
            callback();
        })
        .catch(error => {
            const msg = `Error retrieving the data file from the server, please check the filepath in settings \r\n\r\n${error}`;
            console.error(msg);
            alert(msg);
        });
}

const saveDataToStore = (data) => {
    try {
        sessionStorage.setItem(dataStoreKey, JSON.stringify(data));    
    } catch (error) {
        const msg = `Error saving data to store \r\n\r\n${error}`;
        console.error(msg);
        alert(msg);
    }
}

const dataExistsInStore = () => {
    return ((sessionStorage.getItem(dataStoreKey) === null) ? false : true);
}

const requestDataFromStore = () => {
    if (!dataExistsInStore()) {
        alert("Ooops, that's not good, we've lost the data, please reload the app ....");
        return JSON.parse('[]');
    }
    else {
        return JSON.parse(sessionStorage.getItem(dataStoreKey));
    }
}

const createNewId = () => {
    // create a UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}

const addItem = (item) => {
    const data = requestDataFromStore();
    const components = data.components;

    const newComponents = components.concat([
        {
            'id': createNewId(),
            ...item,
            'updated': new Date().toISOString()
        }]
    );

    const newData = {
        ...data,
        'components': newComponents,
    };

    saveDataToStore(newData);
}

const updateItem = (item) => {
    const data = requestDataFromStore();
    const components = data.components;

    const newComponents = components.map(obj => {
        if (obj.id === item.id) {
            return {
                ...item,
                'updated': new Date().toISOString()
            };
        }
        return obj;
    });

    const newData = {
        ...data,
        'components': newComponents,
    };

    saveDataToStore(newData);
}

const deleteItem = (id) => {
    const data = requestDataFromStore();
    const components = data.components;

    const newComponents = components.map(obj => {
        if (obj.id === id) {
            return {
                ...obj,
                'updated': new Date().toISOString(),
                'isdeleted': true
            };
        }
        return obj;
    });

    const newData = {
        ...data,
        'components': newComponents,
    };

    saveDataToStore(newData);
}

export {
    requestDataFromServer,
    requestDataFromStore,
    saveDataToStore,
    addItem,
    updateItem,
    deleteItem
}; 