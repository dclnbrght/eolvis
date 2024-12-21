using Azure;
using Azure.Data.Tables;
using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Eolvis.App.Models
{
    public class ComponentCommand : ITableEntity
    {
        [JsonPropertyName("commandId")]
        public string RowKey { get; set; } = "";

        [JsonPropertyName("componentId")]
        public string PartitionKey { get; set; } = string.Empty;
        
        public DateTimeOffset? Timestamp { get; set; } = DateTimeOffset.UtcNow;
        
        public ETag ETag { get; set; }

        public string CommandType { get; set; } = string.Empty;

        public string Payload { get; set; } = string.Empty;
        
        public String UpdatedBy { get; set; } = string.Empty;
    }
}