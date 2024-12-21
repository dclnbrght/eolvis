using System.Threading.Tasks;
using System.Text.Json;
using Eolvis.App.Models;
using Eolvis.App.Services.Interfaces;
using Azure;
using Azure.Data.Tables;
using Microsoft.Identity.Web;

namespace Eolvis.App.Services
{
    public class UserProfileService : IUserProfileService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<UserProfileService> _logger;
        private readonly TableServiceClient tableServiceClient;
        private const string itemTableName = "userProfiles";

        public UserProfileService(
            IConfiguration configuration,
            ILogger<UserProfileService> logger)
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
                    // Seed with a default user profile
                    var defaultUserProfile = new UserProfile
                    {
                        PartitionKey = _configuration.GetValue<string>("tenantKey") ?? string.Empty,
                        RowKey = "test-user",
                        Permissions = "insert,update,delete"
                    };
                    tableClient.UpsertEntity(defaultUserProfile);
                };

                _logger.LogInformation($"Ensured table {itemTableName} exists");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating table {itemTableName}");
                throw;
            }
        }

        public Task<UserProfile?> GetUserProfile(string userName)
        {
            _logger.LogDebug($"GetUserProfile from table: {itemTableName}, with userName: {userName}");

            var tableClient = tableServiceClient.GetTableClient(itemTableName);

            var tenantKey = _configuration.GetValue<string>("tenantKey");
            var filterExpression = $"PartitionKey eq '{tenantKey}' and RowKey eq '{userName}'";

            var userProfile = tableClient.Query<UserProfile>(filter: filterExpression).FirstOrDefault();

            if (userProfile == null)
            {
                userProfile = new UserProfile();
                userProfile.PartitionKey = tenantKey ?? string.Empty;
                userProfile.RowKey = userName;
                userProfile.Permissions = "view";
            }

            return Task.FromResult((UserProfile?)userProfile);
        }
    }
}
