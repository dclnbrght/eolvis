
# eolvis

A simple web application to visualise software EOL (End-Of-Life) timelines.

The visualisation represents Supported From & To dates and planned Use From & To dates. These are displayed on a timeline to help with planning a technical roadmap.

## Data Store

[Azure Table Storage](https://azure.microsoft.com/en-us/products/storage/tables) is used as a data store.

## Development

The application is built using .NET 8, using VS Code.

Install the Azure Storage Explorer

Install [Azurite](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=visual-studio%2Cblob-storage), the storage account emulator and start it with this command: "azurite -l c:\azurite"

Get the "Primary Connection String" to the emulated storage account and prefix it with "DefaultEndpointsProtocol=http;"

Set the connection string in the environment variable specified below.

## Deployment

The application can be deployed to Azure as an [Azure App Service](https://azure.microsoft.com/en-us/products/app-service).

[Configure the service to use Microsoft Entra identity provider](https://learn.microsoft.com/en-us/entra/identity-platform/multi-service-web-app-authentication-app-service).

## MCP Server

The eolvis app includes a MCP server, to expose component details to AI Agents.

When deployed to Azure with an Entra Identity provider, an OAuth 2.0 flow is initiated when the MCP client starts.

### MCP Tools

- **search_components**: search component details (read only)
    - params:
        - name: the component name, partial, case-insensitive match
        - version: the component version, optional
        - project: the eolvis project, default: eolvis

### MCP client configuration:

```json
"eolvis": {
    "url": "http://localhost:{port}/mcp",
    "type": "http",
    "headers": {
        "X-Project-Key": "{project}"
    }
}
```

## Configuration

| Type | Variable | Description |
| ---- | -------- | ----------- |
| Environment | EOLVIS_dataStore__connection | Connection string to Azure Table Storage |