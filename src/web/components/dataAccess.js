
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
            sessionStorage.setItem(dataStoreKey, JSON.stringify(data));
            callback();
        })
        .catch(error => {
            const msg = `Error retrieving the data file from the server, please check the filepath in settings \r\n\r\n${error}`;
            console.error(msg);
            alert(msg);
        });
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

export {
    requestDataFromServer,
    requestDataFromStore
}; 