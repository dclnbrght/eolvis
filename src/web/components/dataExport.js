import * as dataAccess from './dataAccess.js';

const exportEol = () => {
    const data = dataAccess.requestDataFromStore();
    const fileName = data.projectKey + ".json";
    downloadTextFile(JSON.stringify(data, null, 4), fileName);
}

const bomTypeMap = {
    "middleware": "platform"
};

const exportBom = () => {
    const data = dataAccess.requestDataFromStore();     
    const fileName = data.projectKey + "-bom.json";

    const filteredComponents = data.components.filter((item) => {
        return !item.isdeleted;
    });
    
    const components = [].map.call(filteredComponents, (i) => {
        return {
            "name": i.name,
            "version": i.version,
            "type": bomTypeMap[i.type] ?? i.type,
            "bom-ref": i.id,
            "externalReferences": [
                {
                    type: "website",
                    url: i.link
                }
            ]
        };
    });

    const bom = {
        "bomFormat": "CycloneDX",
        "specVersion": "1.5",
        "components": components
    };

    downloadTextFile(JSON.stringify(bom, null, 4), fileName);
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