using Azure;
using Azure.Data.Tables;
using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Eolvis.App.Models
{
    public class Component : ITableEntity
    {
        [JsonPropertyName("projectKey")]
        public string PartitionKey { get; set; } = string.Empty;

        [JsonPropertyName("id")]
        public string RowKey { get; set; } = "";

        [Required]
        [JsonPropertyName("updated")]
        public DateTimeOffset? Timestamp { get; set; } = DateTimeOffset.UtcNow;

        public ETag ETag { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Version { get; set; } = string.Empty;

        [Required]
        public bool? Lts { get; set; } = false;

        [Required]
        public string Type { get; set; } = string.Empty;

        public string License { get; set; } = string.Empty;

        public string CPE { get; set; } = string.Empty;

        [Required]
        public DateTime? SupportedFrom { get; set; }

        public DateTime? SupportedTo { get; set; }

        public DateTime? SupportedToExtended { get; set; }

        public string Link { get; set; } = string.Empty;

        public string LatestPatch { get; set; } = string.Empty;

        public DateTime? LatestPatchReleased { get; set; }

        public DateTime? UseFrom { get; set; }

        public DateTime? UseTo { get; set; }

        public string Notes { get; set; } = string.Empty;
        
        public String UpdatedBy { get; set; } = string.Empty;
    }
}