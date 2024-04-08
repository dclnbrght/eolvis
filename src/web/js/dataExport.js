import * as settings from '../settings.js';
import * as dataAccessContext from './dataAccessContext.js';
import * as dataSearch from './dataSearch.js';
import { FilterBar } from '../components/filterBar.js';

const dataAccess = dataAccessContext.create(settings.dataStoreType);

const filterItems = (items) => {
    let exportItems = [];

    if (settings.exportedItemsAreFiltered) {
        const filterBar = new FilterBar();
        const filterValues = filterBar.selectedFilterValues();
        exportItems = dataSearch.search(items, filterValues.selectedNames, filterValues.selectedPeriods, new Date());
    } else {
        exportItems = items;
    }

    return exportItems;
}

const exportEol = () => {
    let dataFromStore = dataAccess.getComponentState();
    let data = {
        ...dataFromStore,                
        "timestamp": new Date().toISOString()
    };
    const fileName = data.projectKey + ".json";
    if (settings.exportedItemsAreFiltered) {
        data.components = filterItems(data.components);
    }
    downloadTextFile(JSON.stringify(data, null, 4), fileName);

    return data.components.length;
}

const exportBom = () => {    
    const data = dataAccess.getComponentState(); 
    const exportItems = filterItems(data.components);

    const fileName = data.projectKey + "-bom.json";

    // filter out deleted items, and items not in the softwareBomTypeMap
    const filteredComponents = exportItems.filter((item) => {
        return !item.isdeleted && settings.softwareBomTypeMap[item.type] !== undefined;
    });

    const metadata = {
        "timestamp": new Date().toISOString(),
        "authors": [
            {
                "name": "eolvis"
            }
        ]
    };
    
    const components = [].map.call(filteredComponents, (i) => {
        return {
            "name": i.name,
            "version": i.version ?? "",
            "type": settings.softwareBomTypeMap[i.type] ?? i.type,
            "cpe": i.cpe ?? "",
            "bom-ref": i.id,            
            "licenses": [
                {
                    "license": { 
                        "id": i.license ?? ""
                    }
                }
            ],
            "externalReferences": [
                {
                    "type": "website",
                    "url": i.link ?? ""
                }
            ]
        };
    });

    const bom = {
        "bomFormat": "CycloneDX",
        "specVersion": "1.5",
        "metadata": metadata,
        "components": components
    };

    downloadTextFile(JSON.stringify(bom, null, 4), fileName);
    
    return components.length;
}

const downloadTextFile = (text, name) => {
    const a = document.createElement('a');
    const type = name.split(".").pop();
    a.href = URL.createObjectURL( new Blob([text], { type:`text/${type === "txt" ? "plain" : type}` }) );
    a.download = name;
    a.click();
    a.remove();
}

export {
    exportEol,
    exportBom
};