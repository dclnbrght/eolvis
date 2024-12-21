using System.Threading.Tasks;
using System.Text.Json;
using Eolvis.App.Models;
using Eolvis.App.Services.Interfaces;
using Azure;
using Azure.Data.Tables;

namespace Eolvis.App.Services
{
    public class ComponentService : IComponentService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<ComponentService> _logger;
        private readonly IUserProfileService _userProfileService;
        private readonly TableServiceClient tableServiceClient;
        private const string itemTableName = "components";
        private const string commandTableName = "componentCommands";

        public ComponentService(
            IConfiguration configuration,
            ILogger<ComponentService> logger,
            IUserProfileService userProfileService)
        {
            _configuration = configuration;
            _logger = logger;
            _userProfileService = userProfileService;
            tableServiceClient = CreateTableServiceClient();
            CreateTablesIfNotExist();
        }

        /// <summary>
        /// Create a TableServiceClient to interact with Azure Table Storage
        /// </summary>
        /// <returns></returns>
        private TableServiceClient CreateTableServiceClient()
        {
            var dataStoreConnectionString = _configuration.GetValue<string>("dataStore:connection");

            var client = new TableServiceClient(dataStoreConnectionString);

            _logger.LogDebug($"Setup TableServiceClient to: {client.Uri} and AccountName: {client.AccountName}");

            return client;
        }

        private void CreateTablesIfNotExist()
        {
            try
            {
                var componentTableClient = tableServiceClient.GetTableClient(itemTableName);
                componentTableClient.CreateIfNotExists();
                _logger.LogInformation($"Ensured table {itemTableName} exists");

                var commandTableClient = tableServiceClient.GetTableClient(commandTableName);
                commandTableClient.CreateIfNotExists();
                _logger.LogInformation($"Ensured table {commandTableName} exists");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating tables {itemTableName} and/or {commandTableName}");
                throw;
            }
        }

        private bool hasPermission(string userName, string permissionName)
        {
            var userProfile = _userProfileService.GetUserProfile(userName).Result;

            if (userProfile != null && userProfile.Permissions != null)
            {
                if (userProfile.Permissions.Split(',').Contains(permissionName))
                {
                    return true;
                }
            }

            throw new UnauthorizedAccessException($"{userName} does not have the {permissionName} permission");
        }

        public async Task<List<Component>> GetAllComponents(string projectKey)
        {
            var components = new List<Component>();

            var tableClient = tableServiceClient.GetTableClient(itemTableName);

            var filterExpression = $"PartitionKey eq '{projectKey}'";

            Pageable<Component> queryResultsFilter = tableClient.Query<Component>(filter: filterExpression);

            foreach (Component component in queryResultsFilter)
            {
                components.Add(component);
            }

            return await Task.FromResult(components);
        }

        public Task<Component?> GetComponentById(string projectKey, Guid componentId)
        {
            var tableClient = tableServiceClient.GetTableClient(itemTableName);

            var filterExpression = $"PartitionKey eq '{projectKey}' and RowKey eq '{componentId}'";

            var component = tableClient.Query<Component>(filter: filterExpression).FirstOrDefault();

            return Task.FromResult(component);
        }

        public Task<List<ComponentCommand>> GetComponentCommandsById(string projectKey, Guid componentId)
        {
            var tableClient = tableServiceClient.GetTableClient(commandTableName);

            var filterExpression = $"PartitionKey eq '{componentId}'";

            var commands = tableClient.Query<ComponentCommand>(filter: filterExpression).ToList();

            return Task.FromResult(commands);
        }

        public async Task InsertCommand(string projectKey, Component component, string username)
        {
            if (hasPermission(username, "insert"))
            {
                if (component.RowKey == null || component.RowKey == string.Empty)
                    component.RowKey = Guid.NewGuid().ToString();

                await SaveCommand(projectKey, component, "insert", username);
            }
        }

        public async Task UpdateCommand(string projectKey, Component component, string username)
        {
            if (hasPermission(username, "update"))
            {
                await SaveCommand(projectKey, component, "update", username);
            }
        }

        public async Task DeleteCommand(string projectKey, Guid componentId, string username)
        {
            if (hasPermission(username, "delete"))
            {
                var component = await GetComponentById(projectKey, componentId);

                if (component != null)
                    await SaveCommand(projectKey, component, "delete", username);
            }
        }

        private async Task SaveCommand(string projectKey, Component component, string commandType = "update", string username = "")
        {
            FormatComponent(projectKey, component, username);

            ValidateComponent(component);

            var command = BuildCommand(component, commandType, username);

            var commandTableClient = tableServiceClient.GetTableClient(commandTableName);
            commandTableClient.UpsertEntity(command);

            await ProcessCommand(projectKey, command);
        }

        private void FormatComponent(string projectKey, Component component, string username)
        {
            component.PartitionKey = projectKey;

            if (component.SupportedFrom != null)
                component.SupportedFrom = DateTime.SpecifyKind((DateTime)component.SupportedFrom, DateTimeKind.Utc);

            if (component.SupportedTo != null)
                component.SupportedTo = DateTime.SpecifyKind((DateTime)component.SupportedTo, DateTimeKind.Utc);

            if (component.SupportedToExtended != null)
                component.SupportedToExtended = DateTime.SpecifyKind((DateTime)component.SupportedToExtended, DateTimeKind.Utc);

            if (component.LatestPatchReleased != null)
                component.LatestPatchReleased = DateTime.SpecifyKind((DateTime)component.LatestPatchReleased, DateTimeKind.Utc);

            if (component.UseFrom != null)
                component.UseFrom = DateTime.SpecifyKind((DateTime)component.UseFrom, DateTimeKind.Utc);

            if (component.UseTo != null)
                component.UseTo = DateTime.SpecifyKind((DateTime)component.UseTo, DateTimeKind.Utc);

            component.UpdatedBy = username;
        }

        public void ValidateComponent(Component component)
        {
            if (string.IsNullOrEmpty(component.Name))
                throw new ArgumentException("Please enter a Name");

            if (!string.IsNullOrEmpty(component.Name) && component.Name.Length > 100)
                throw new ArgumentException("Name must be less than 100 characters");

            if (string.IsNullOrEmpty(component.Version))
                throw new ArgumentException("Please enter a Version");

            if (!string.IsNullOrEmpty(component.Version) && component.Version.Length > 50)
                throw new ArgumentException("Version must be less than 50 characters");

            if (string.IsNullOrEmpty(component.Type))
                throw new ArgumentException("Please select a Type");

            if (component.SupportedFrom == null)
                throw new ArgumentException("Please enter a Supported From date");

            if (component.SupportedFrom != null && component.SupportedTo != null
                && component.SupportedFrom >= component.SupportedTo)
                throw new ArgumentException("The Supported To date must be greater than the Supported From date");

            if (!string.IsNullOrEmpty(component.Link) && component.Link.Length > 500)
                throw new ArgumentException("Link must be less than 500 characters");

            if (!string.IsNullOrEmpty(component.LatestPatch) && component.LatestPatch.Length > 50)
                throw new ArgumentException("Latest Patch must be less than 50 characters");

            if (component.UseFrom != null && component.UseTo != null
                && component.UseFrom >= component.UseTo)
                throw new ArgumentException("The Use To date must be greater than the Use From date");

            if (component.SupportedFrom != null && component.UseFrom != null
                && component.UseFrom < component.SupportedFrom)
                throw new ArgumentException("The Use From date must be greater than the Supported From date");

            if (!string.IsNullOrEmpty(component.Notes) && component.Notes.Length > 500)
                throw new ArgumentException("Notes must be less than 500 characters");
        }

        private ComponentCommand BuildCommand(Component component, string commandType, string username)
        {
            var command = new ComponentCommand();

            command.PartitionKey = component.RowKey;
            string invertedTicks = string.Format("{0:D19}", DateTime.MaxValue.Ticks - DateTime.UtcNow.Ticks);
            command.RowKey = component.RowKey + "-" + invertedTicks;
            command.Timestamp = DateTimeOffset.UtcNow;
            command.CommandType = commandType;
            command.Payload = JsonSerializer.Serialize(component);
            command.UpdatedBy = username;

            return command;
        }

        private async Task ProcessCommand(string projectKey, ComponentCommand command)
        {
            _logger.LogDebug($"ProcessCommand, projectKey:{projectKey}, commandType:{command.CommandType}, payload: {command.Payload}");

            var component = JsonSerializer.Deserialize<Component>(command.Payload);

            if (component == null)
                throw new ArgumentNullException(nameof(component));

            if (command.CommandType == "delete")
            {
                await DeleteComponentQuery(projectKey, component);
            }
            else
            {
                await UpsertComponentQuery(projectKey, component);
            }
        }

        private async Task UpsertComponentQuery(string projectKey, Component component)
        {
            _logger.LogDebug($"UpsertComponentQuery, ProjectKey:{projectKey}, RowKey: {component.RowKey}");

            var tableClient = tableServiceClient.GetTableClient(itemTableName);
            await tableClient.UpsertEntityAsync(component);
        }

        private async Task DeleteComponentQuery(string projectKey, Component component)
        {
            _logger.LogDebug($"DeleteComponentQuery, ProjectKey:{projectKey}, RowKey: {component.RowKey}");

            var tableClient = tableServiceClient.GetTableClient(itemTableName);

            await tableClient.DeleteEntityAsync(projectKey, component.RowKey, component.ETag);
        }

    }
}