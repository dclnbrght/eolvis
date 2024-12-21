using Azure;
using Azure.Data.Tables;
using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Eolvis.App.Models
{
    public class Project : ITableEntity
    {
        [JsonPropertyName("tenantKey")]
        public string PartitionKey { get; set; } = string.Empty;

        [JsonPropertyName("projectKey")]
        public string RowKey { get; set; } = "";

        [Required]
        [JsonPropertyName("updated")]
        public DateTimeOffset? Timestamp { get; set; } = DateTimeOffset.UtcNow;

        public ETag ETag { get; set; }
        
        [Required]
        public string ProjectName { get; set; } = string.Empty;
    }
}