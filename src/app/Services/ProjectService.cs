using System.Threading.Tasks;
using System.Text.Json;
using Eolvis.App.Models;
using Eolvis.App.Services.Interfaces;
using Azure;
using Azure.Data.Tables;
using Microsoft.Identity.Web;

namespace Eolvis.App.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<ProjectService> _logger;
        private readonly TableServiceClient tableServiceClient;
        private const string itemTableName = "projects";

        public ProjectService(
            IConfiguration configuration,
            ILogger<ProjectService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            tableServiceClient = CreateTableServiceClient();
            CreateTableIfNotExists();
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

        private void CreateTableIfNotExists()
        {
            try
            {
                var tableClient = tableServiceClient.GetTableClient(itemTableName);
                if (tableClient.CreateIfNotExists() != null)
                {
                    // Seed with a default project
                    var defaultProject = new Project
                    {
                        PartitionKey = _configuration.GetValue<string>("tenantKey") ?? string.Empty,
                        RowKey = "eolvis",
                        ProjectName = "eolvis"
                    };
                    tableClient.UpsertEntity(defaultProject);
                };

                _logger.LogInformation($"Ensured table {itemTableName} exists");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating table {itemTableName}");
                throw;
            }
        }

        public async Task<List<Project>> GetAllProjects()
        {
            _logger.LogDebug($"GetAllProjects from table: {itemTableName}");

            var projects = new List<Project>();

            var tableClient = tableServiceClient.GetTableClient(itemTableName);
            var tenantKey = _configuration.GetValue<string>("tenantKey");
            string filterExpression = TableClient.CreateQueryFilter($"PartitionKey eq {tenantKey}");

            Pageable<Project> queryResultsFilter = tableClient.Query<Project>(filter: filterExpression);

            foreach (Project project in queryResultsFilter)
            {
                projects.Add(project);
            }

            return await Task.FromResult(projects);
        }

        public Task<Project?> GetProjectByKey(string projectKey)
        {
            _logger.LogDebug($"GetProjectByKey from table: {itemTableName}, with projectKey: {projectKey}");

            var tableClient = tableServiceClient.GetTableClient(itemTableName);

            var tenantKey = _configuration.GetValue<string>("tenantKey");
            string filterExpression = TableClient.CreateQueryFilter($"PartitionKey eq {tenantKey} and RowKey eq {projectKey}");

            var project = tableClient.Query<Project>(filter: filterExpression).FirstOrDefault();

            return Task.FromResult(project);
        }
    }
}
