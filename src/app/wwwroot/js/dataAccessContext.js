import * as dataAccessApi from './dataAccessApi.js';
import * as dataAccessLocal from './dataAccessLocal.js';

// Strategy pattern for data access

const componentMap = {
    dataAccessApi,
    dataAccessLocal
};

// Get a component based on a key, from a settings file
function create(componentKey) {
    const Component = componentMap[componentKey];
    if (Component) {
        return Component;
    } else {
        throw new Error('Component not found');
    }
}

export {
    create
}