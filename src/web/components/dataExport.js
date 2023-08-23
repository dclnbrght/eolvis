import * as dataAccess from './dataAccess.js';

const exportEol = () => {
    const data = dataAccess.requestDataFromStore();    
    downloadTextFile(JSON.stringify(data, null, 4), "eol.json");
}

const bomTypeMap = {
    "middleware": "platform"
};

const exportBom = () => {
    const data = dataAccess.requestDataFromStore(); 
    
    const components = [].map.call(data.components, (i) => {
        return {
            type: bomTypeMap[i.type] ?? i.type,
            name: i.name,
            version: i.version,
            externalReferences: [
                {
                    type: "website",
                    url: i.link
                }
            ]
        };
    });

    const bom = {
        bomFormat: "CycloneDX",
        specVersion: "1.5",
        components: components
    };

    downloadTextFile(JSON.stringify(bom, null, 4), "bom.json");
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